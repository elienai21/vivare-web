import crypto from 'crypto';
import { Timestamp } from 'firebase-admin/firestore';
import { NextRequest } from 'next/server';
import { collections } from './firebase-admin';

/**
 * Rate limit + session token para `/api/checkout/*`.
 *
 * Sem auth real (não há login do hóspede), defendemos com 2 camadas:
 *
 *   1. **Rate limit por IP** em `/api/checkout/initialize` — limita
 *      criação de docs/PII a 5 req/min/IP. Implementação fixed-window
 *      no Firestore (`rate_limits/{ipHash}`) — barata e suficiente
 *      pro volume atual.
 *
 *   2. **Session token** nos endpoints `/api/checkout/[id]/*` — gerado
 *      no `initialize`, gravado no doc, exigido em header
 *      `X-Checkout-Session` nos passos seguintes. Confidencialidade
 *      do token vem de:
 *        • crypto.randomBytes(32) → 256 bits entropia
 *        • só é devolvido UMA vez (resposta do initialize)
 *        • nunca persistido em URL/log (só no `Checkout.sessionToken`)
 *
 *   Isso previne spam de docs (custo Firestore) e impede que alguém
 *   que adivinhe um `checkoutId` (UUID v4 = baixa probabilidade mas
 *   não impossível) consiga ler/alterar a reserva alheia.
 */

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_PER_WINDOW = 5;

/** Hash determinístico do IP — não armazenamos IP cru (LGPD). */
function hashIp(ip: string): string {
    const salt = process.env.RATE_LIMIT_SALT || 'vivare-rl-default';
    return crypto.createHash('sha256').update(salt + ip).digest('hex').slice(0, 32);
}

/** Lê IP do request. Vercel injeta `x-forwarded-for`. */
export function getClientIp(request: NextRequest): string {
    const fwd = request.headers.get('x-forwarded-for');
    if (fwd) return fwd.split(',')[0]!.trim();
    const real = request.headers.get('x-real-ip');
    if (real) return real;
    return 'unknown';
}

/**
 * Fixed-window rate limit. Devolve `{ ok: false, retryAfterMs }` se o
 * IP estourou o teto, ou `{ ok: true }` permitindo a chamada. Erros de
 * Firestore são "fail open" — preferimos servir do que bloquear cliente
 * legítimo se o controle de rate limit cair.
 */
export async function checkRateLimit(
    request: NextRequest,
    bucket: string,
    maxPerWindow: number = RATE_LIMIT_MAX_PER_WINDOW,
    windowMs: number = RATE_LIMIT_WINDOW_MS,
): Promise<{ ok: true } | { ok: false; retryAfterMs: number }> {
    try {
        const ipHash = hashIp(getClientIp(request));
        const key = `${bucket}:${ipHash}`;
        const ref = collections.rateLimits.doc(key);

        const now = Date.now();
        const result = await collections.rateLimits.firestore.runTransaction(
            async (tx): Promise<{ ok: true } | { ok: false; retryAfterMs: number }> => {
                const doc = await tx.get(ref);
                const data = doc.data();
                const windowStart = data?.windowStart?.toMillis?.() ?? 0;
                const count = typeof data?.count === 'number' ? data.count : 0;

                if (now - windowStart > windowMs) {
                    // Janela expirou — reseta.
                    tx.set(ref, {
                        windowStart: Timestamp.fromMillis(now),
                        count: 1,
                        ttlAt: Timestamp.fromMillis(now + windowMs * 5),
                    });
                    return { ok: true };
                }

                if (count >= maxPerWindow) {
                    return { ok: false, retryAfterMs: windowMs - (now - windowStart) };
                }

                tx.update(ref, { count: count + 1 });
                return { ok: true };
            },
        );

        return result;
    } catch (err) {
        // Fail-open: se Firestore engasgou, deixamos passar pra não
        // quebrar checkout. Log pra investigação.
        console.error('[rate-limit] check failed (fail-open):', err);
        return { ok: true };
    }
}

/** Gera um session token criptograficamente forte (256 bits). */
export function generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Compara session token em tempo constante. Returns true se válidos +
 * iguais. Use em handlers de checkout pra autorizar quem está mexendo
 * num doc específico.
 */
export function verifySessionToken(stored: string | undefined, provided: string | null): boolean {
    if (!stored || !provided) return false;
    if (stored.length !== provided.length) return false;
    try {
        return crypto.timingSafeEqual(
            Buffer.from(stored),
            Buffer.from(provided),
        );
    } catch {
        return false;
    }
}

/**
 * Lê o session token do request (header `X-Checkout-Session`) e devolve
 * a string ou `null`. A obrigação de validar contra o doc fica com o
 * caller — esse helper só extrai.
 */
export function readSessionToken(request: NextRequest): string | null {
    return request.headers.get('x-checkout-session');
}

/** Lê o `Idempotency-Key` enviado pelo cliente. */
export function readIdempotencyKey(request: NextRequest): string | null {
    return request.headers.get('idempotency-key');
}

/**
 * Validação de Idempotency-Key contra histórico recente do checkout.
 *
 * Caso de uso: usuário dá double-click em "Pagar". Browser dispara 2x
 * a mesma request com mesma key. O lado server-side da nossa lógica
 * de hold/payment-intent já é idempotente (transações Firestore), mas
 * essa camada extra:
 *
 *   • Reaproveita resposta cacheada se a key bateu (<60s)
 *   • Rejeita explicitamente se a MESMA action veio com keys diferentes
 *     em <1s (sinal de bug do cliente, não retry legítimo)
 *
 * Como o `Checkout` doc já carrega muito estado, persistimos as últimas
 * keys vistas em `lastIdempotencyKeys: { [action]: { key, at } }` (mapa).
 * Não vale a pena uma coleção separada — volume baixíssimo.
 */
export interface IdempotencyCheck {
    /** Pode rodar o handler normalmente. */
    ok: true;
}
export interface IdempotencyConflict {
    ok: false;
    reason: 'racing-with-different-key';
}
export type IdempotencyResult = IdempotencyCheck | IdempotencyConflict;

/**
 * Confere e registra a key. Retorna OK se for primeira vez ou key igual;
 * conflict se uma key DIFERENTE rodou pra mesma action em <1s.
 *
 * Não devolve "duplicate" — confiamos na idempotência interna do
 * `createHold`/`createPaymentIntent` pra dedupe real. Esta função
 * é só guarda contra race de double-click do cliente.
 */
export function validateIdempotencyKey(
    lastSeenKeys: Record<string, { key: string; at: number }> | undefined,
    action: string,
    providedKey: string | null,
): IdempotencyResult {
    if (!providedKey) return { ok: true }; // Cliente velho que não envia — aceita.

    const last = lastSeenKeys?.[action];
    if (!last) return { ok: true };

    const sameKey = last.key === providedKey;
    const ageMs = Date.now() - last.at;

    // Mesma key reaparecendo — é retry legítimo. OK.
    if (sameKey) return { ok: true };

    // Key diferente em <1s = double-click com keys distintas. Bug do cliente.
    if (ageMs < 1000) {
        return { ok: false, reason: 'racing-with-different-key' };
    }

    // Key diferente após >1s — outra ação user-initiated. OK.
    return { ok: true };
}
