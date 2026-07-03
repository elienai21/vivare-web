import { sanitize } from './log-sanitize';

/**
 * Tradução de erros internos para mensagens user-friendly no checkout.
 *
 * Princípio (lições do Repasse, HURDLE 33): erro técnico ao usuário gera
 * suporte caro e desconfiança. Mas o erro técnico precisa estar nos logs
 * pra debug — então registramos os dois lados:
 *
 *   • `user`     → mostrado na UI. Curto, em português, acionável.
 *   • `technical`→ vai pro `console.error` no servidor (Vercel logs).
 *   • `requestId`→ correlação pro suporte se cliente reclamar.
 *
 * Mantém uma allowlist de padrões reconhecidos. Tudo que não bater cai
 * num "erro genérico" — preferimos dar mensagem vaga em vez de vazar
 * stack trace de Stays/Stripe/Firestore para o hóspede.
 */
export interface NormalizedError {
    user: string;
    technical: string;
    requestId: string;
}

const PATTERNS: Array<{ match: RegExp; user: string }> = [
    { match: /listing.*not found/i,                user: 'Acomodação não encontrada. Tente outra ou recarregue a página.' },
    { match: /not found/i,                         user: 'Não encontramos sua sessão de checkout. Reinicie a reserva pela página do imóvel.' },
    { match: /hold required first/i,               user: 'Sua sessão expirou. Reinicie a reserva pela página do imóvel.' },
    { match: /guest information required/i,        user: 'Preencha seus dados pessoais para continuar.' },
    { match: /unsupported currency/i,              user: 'Moeda não suportada. Entre em contato com o suporte.' },
    { match: /Cannot create hold from state/i,     user: 'Sua sessão de reserva ficou inconsistente. Recomece pelo imóvel.' },
    { match: /Cannot create PaymentIntent/i,       user: 'Sua sessão de pagamento ficou inconsistente. Recomece a reserva.' },
    { match: /Invalid state transition/i,          user: 'Não é possível avançar nesta etapa. Recomece a reserva.' },
    { match: /preço/i,                             user: 'Não foi possível calcular o preço. Tente outras datas.' },
    { match: /STRIPE|Stripe/,                      user: 'Erro no provedor de pagamento. Tente novamente em instantes.' },
    { match: /firebase|Firestore|admin/i,          user: 'Erro temporário no sistema. Tente novamente em instantes.' },
    { match: /Stays.*createReservation/i,          user: 'As datas escolhidas ficaram indisponíveis. Tente outras datas.' },
    { match: /Stays.*\d{3}/,                       user: 'Erro ao consultar disponibilidade. Tente novamente em instantes.' },
    { match: /timeout|ECONNRESET|ENOTFOUND/i,      user: 'Tempo esgotado. Verifique sua conexão e tente de novo.' },
];

export function normalizeError(err: unknown): NormalizedError {
    const technical = err instanceof Error ? err.message : String(err);
    const requestId =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID().slice(0, 8)
            : Math.random().toString(36).slice(2, 10);

    for (const { match, user } of PATTERNS) {
        if (match.test(technical)) {
            return { user, technical, requestId };
        }
    }

    return {
        user: 'Não foi possível processar sua solicitação. Tente novamente ou entre em contato com o suporte informando o código abaixo.',
        technical,
        requestId,
    };
}

/** Helper para uso direto em handlers de API route. */
export function errorResponseBody(err: unknown, context: string): {
    error: string;
    requestId: string;
    code?: string;
} {
    const { user, technical, requestId } = normalizeError(err);
    console.error(`[${context}] ERROR (rid=${requestId}):`, technical, sanitize(err));
    return { error: user, requestId };
}
