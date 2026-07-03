import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { createPaymentIntent, getAuthorizedCheckout, CheckoutAuthError } from '@/lib/checkout-service';
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

        // M1 — mesmo guard de race do hold. PaymentIntent já é idempotente
        // server-side (reutiliza o PI existente se já criado), então aqui
        // só rejeitamos keys conflitantes em janela curta.
        const idempotencyKey = readIdempotencyKey(request);
        const check = validateIdempotencyKey(
            checkout.lastIdempotencyKeys as Record<string, { key: string; at: number }> | undefined,
            'payment-intent',
            idempotencyKey,
        );
        if (!check.ok) {
            return NextResponse.json(
                { error: 'Requisições conflitantes detectadas. Aguarde e tente novamente.' },
                { status: 409 },
            );
        }

        if (idempotencyKey) {
            collections.checkouts.doc(checkoutId).update({
                [`lastIdempotencyKeys.payment-intent`]: { key: idempotencyKey, at: Date.now() },
                updatedAt: Timestamp.now(),
            }).catch(() => null);
        }

        const result = await createPaymentIntent(checkoutId);
        // client_secret é retornado UMA vez aqui — não persistido em lugar nenhum.
        return NextResponse.json({
            checkoutId,
            clientSecret: result.clientSecret,
            state: result.state,
        });
    } catch (err) {
        if (err instanceof CheckoutAuthError) {
            return NextResponse.json({ error: err.message }, { status: 401 });
        }
        return NextResponse.json(
            errorResponseBody(err, '/api/checkout/[id]/payment-intent POST'),
            { status: 500 },
        );
    }
}
