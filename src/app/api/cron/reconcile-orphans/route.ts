import { NextRequest, NextResponse } from 'next/server';
import { reconcileReservationOrphans } from '@/lib/checkout-service';

/**
 * Cron de reconciliação — segunda linha de defesa pra C4 (race em
 * createHold). Quando o cancel da Stays falha no fluxo principal, o
 * staysReservationId vai pra `reservation_orphans` e este cron tenta
 * de novo a cada 15min. Se 10 tentativas falharem, marca pra revisão
 * manual.
 *
 * Roda só em Vercel Cron (vercel.json). Autenticado por CRON_SECRET.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
    const expected = process.env.CRON_SECRET;
    if (!expected) {
        return NextResponse.json(
            { error: 'Cron not configured (CRON_SECRET missing)' },
            { status: 503 },
        );
    }
    if (request.headers.get('authorization') !== `Bearer ${expected}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await reconcileReservationOrphans();
        return NextResponse.json({ ok: true, ...result });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Cron failed';
        console.error('[/api/cron/reconcile-orphans]', err);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
