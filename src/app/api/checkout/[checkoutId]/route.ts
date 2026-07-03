import { NextRequest, NextResponse } from 'next/server';
import { getAuthorizedCheckout, CheckoutAuthError } from '@/lib/checkout-service';
import { readSessionToken } from '@/lib/checkout-auth';
import { errorResponseBody } from '@/lib/api-errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ checkoutId: string }> },
) {
    try {
        const { checkoutId } = await params;
        const checkout = await getAuthorizedCheckout(checkoutId, readSessionToken(request));
        // Não retornar o sessionToken na leitura — cliente já tem.
        const { sessionToken: _omit, ...safe } = checkout;
        void _omit;
        return NextResponse.json(safe);
    } catch (err) {
        if (err instanceof CheckoutAuthError) {
            return NextResponse.json({ error: err.message }, { status: 401 });
        }
        return NextResponse.json(
            errorResponseBody(err, '/api/checkout/[id] GET'),
            { status: 500 },
        );
    }
}
