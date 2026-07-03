import { NextRequest, NextResponse } from 'next/server';
import { getAuthorizedCheckout, updateGuestInfo, CheckoutAuthError } from '@/lib/checkout-service';
import { readSessionToken } from '@/lib/checkout-auth';
import type { GuestInfo } from '@/lib/checkout-model';
import { errorResponseBody } from '@/lib/api-errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ checkoutId: string }> },
) {
    try {
        const { checkoutId } = await params;

        // Autoriza ANTES de ler o body (rejeita rápido se token inválido).
        await getAuthorizedCheckout(checkoutId, readSessionToken(request));

        const body = await request.json();
        const guest = body?.guest as GuestInfo | undefined;

        if (!guest?.firstName || !guest?.lastName || !guest?.email) {
            return NextResponse.json(
                { error: 'guest.firstName, guest.lastName e guest.email são obrigatórios' },
                { status: 400 },
            );
        }

        const checkout = await updateGuestInfo(checkoutId, guest);
        const { sessionToken: _omit, ...safe } = checkout;
        void _omit;
        return NextResponse.json(safe);
    } catch (err) {
        if (err instanceof CheckoutAuthError) {
            return NextResponse.json({ error: err.message }, { status: 401 });
        }
        return NextResponse.json(
            errorResponseBody(err, '/api/checkout/[id]/guest PATCH'),
            { status: 500 },
        );
    }
}
