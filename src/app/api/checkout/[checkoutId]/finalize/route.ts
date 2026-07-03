import { NextRequest, NextResponse } from 'next/server';
import { waitForConfirmation, getAuthorizedCheckout, CheckoutAuthError } from '@/lib/checkout-service';
import { readSessionToken } from '@/lib/checkout-auth';
import { CheckoutState } from '@/lib/checkout-model';
import { errorResponseBody } from '@/lib/api-errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Vercel limit padrão: 10s; aumentamos pra 30s pra cobrir o polling.
export const maxDuration = 30;

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ checkoutId: string }> },
) {
    try {
        const { checkoutId } = await params;
        await getAuthorizedCheckout(checkoutId, readSessionToken(request));

        const body = await request.json().catch(() => ({}));
        const maxWaitMs = Math.min(Number(body?.maxWaitMs) || 10000, 25000);

        const checkout = await waitForConfirmation(checkoutId, maxWaitMs);
        const { sessionToken: _omit, ...safe } = checkout;
        void _omit;

        if (checkout.state === CheckoutState.BOOKED) {
            return NextResponse.json({
                success: true,
                bookingCode: checkout.staysBookingCode,
                checkout: safe,
            });
        }
        if (checkout.state === CheckoutState.PAID) {
            return NextResponse.json({
                success: true,
                pending: true,
                message: 'Pagamento confirmado. Finalizando sua reserva...',
                checkout: safe,
            });
        }
        return NextResponse.json({
            success: false,
            message: 'Não foi possível confirmar o pagamento. Entre em contato com o suporte.',
            checkout: safe,
        });
    } catch (err) {
        if (err instanceof CheckoutAuthError) {
            return NextResponse.json({ error: err.message }, { status: 401 });
        }
        return NextResponse.json(
            errorResponseBody(err, '/api/checkout/[id]/finalize POST'),
            { status: 500 },
        );
    }
}
