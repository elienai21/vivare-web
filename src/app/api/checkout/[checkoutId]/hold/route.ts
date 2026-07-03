import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { createHold, getAuthorizedCheckout, CheckoutAuthError } from '@/lib/checkout-service';
import {
    readSessionToken,
    readIdempotencyKey,
    validateIdempotencyKey,
} from '@/lib/checkout-auth';
import { collections } from '@/lib/firebase-admin';
import { errorResponseBody } from '@/lib/api-errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ checkoutId: string }> },
) {
    try {
        const { checkoutId } = await params;
        const checkout = await getAuthorizedCheckout(checkoutId, readSessionToken(request));

        // M1 — anti double-click guard. `createHold` em si já é idempotente
        // (transação + checa estado HOLD_CREATED), mas se o cliente disparar
        // 2 requests com Idempotency-Keys DIFERENTES em <1s, é bug — corta.
        const idempotencyKey = readIdempotencyKey(request);
        const check = validateIdempotencyKey(
            checkout.lastIdempotencyKeys as Record<string, { key: string; at: number }> | undefined,
            'hold',
            idempotencyKey,
        );
        if (!check.ok) {
            return NextResponse.json(
                { error: 'Requisições conflitantes detectadas. Aguarde e tente novamente.' },
                { status: 409 },
            );
        }

        // Persiste a key vista (best-effort — falha aqui não bloqueia
        // a chamada principal).
        if (idempotencyKey) {
            collections.checkouts.doc(checkoutId).update({
                [`lastIdempotencyKeys.hold`]: { key: idempotencyKey, at: Date.now() },
                updatedAt: Timestamp.now(),
            }).catch(() => null);
        }

        const result = await createHold(checkoutId);
        return NextResponse.json({
            checkoutId: result.checkoutId,
            state: result.state,
            staysReservationId: result.staysReservationId,
            holdExpiresAt: result.holdExpiresAt,
        });
    } catch (err) {
        if (err instanceof CheckoutAuthError) {
            return NextResponse.json({ error: err.message }, { status: 401 });
        }
        return NextResponse.json(
            errorResponseBody(err, '/api/checkout/[id]/hold POST'),
            { status: 500 },
        );
    }
}
