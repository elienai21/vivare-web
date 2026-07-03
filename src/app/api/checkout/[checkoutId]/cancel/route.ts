import { NextRequest, NextResponse } from 'next/server';
import { cancelCheckout, getAuthorizedCheckout, CheckoutAuthError } from '@/lib/checkout-service';
import { readSessionToken } from '@/lib/checkout-auth';
import { errorResponseBody } from '@/lib/api-errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ checkoutId: string }> },
) {
    try {
        const { checkoutId } = await params;
        await getAuthorizedCheckout(checkoutId, readSessionToken(request));

        const body = await request.json().catch(() => ({}));
        const reason = typeof body?.reason === 'string' ? body.reason : undefined;

        const checkout = await cancelCheckout(checkoutId, reason);
        return NextResponse.json({
            checkoutId,
            state: checkout.state,
            canceled: true,
        });
    } catch (err) {
        if (err instanceof CheckoutAuthError) {
            return NextResponse.json({ error: err.message }, { status: 401 });
        }
        return NextResponse.json(
            errorResponseBody(err, '/api/checkout/[id]/cancel POST'),
            { status: 500 },
        );
    }
}
