import { NextRequest, NextResponse } from 'next/server';
import { expireHolds } from '@/lib/checkout-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * GET /api/cron/expire-holds
 *
 * Job idempotente que varre checkouts com `holdExpiresAt < now` em estados
 * expiráveis (HOLD_CREATED / PAYMENT_CREATED), cancela a reserva
 * correspondente na Stays e transiciona o checkout pra EXPIRED — assim
 * o calendário não fica preso após o usuário abandonar o pagamento.
 *
 * Disparado a cada 5 minutos pelo Vercel Cron (vercel.json).
 *
 * Proteção: exige header `Authorization: Bearer <CRON_SECRET>`. Vercel
 * Cron envia esse header automaticamente quando configurado.
 */
export async function GET(request: NextRequest) {
    // CRON_SECRET é obrigatória — sem ela o endpoint vira público e qualquer
    // um pode disparar varredura completa do Firestore + N chamadas Stays.
    // Em vez de "se a env existir, valida", fail-closed: sem env, 503.
    const expected = process.env.CRON_SECRET;
    if (!expected) {
        console.error('[/api/cron/expire-holds] CRON_SECRET não configurada — endpoint desabilitado');
        return NextResponse.json(
            { error: 'Cron not configured (CRON_SECRET missing)' },
            { status: 503 },
        );
    }

    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${expected}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await expireHolds();
        return NextResponse.json({ ok: true, ...result });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Cron failed';
        console.error('[/api/cron/expire-holds]', err);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
