import { NextRequest, NextResponse } from 'next/server';
import { initializeCheckout } from '@/lib/checkout-service';
import { errorResponseBody } from '@/lib/api-errors';
import { checkRateLimit } from '@/lib/checkout-auth';

/** Force Node runtime — firebase-admin + stripe não rodam em edge. */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    // Rate limit: 5 inits por IP por minuto. Sem isso, atacante pode
    // criar milhares de checkouts (custo Firestore + ruído nos canais
    // Stays se cada init disparar uma chamada de price).
    const rate = await checkRateLimit(request, 'checkout-initialize', 5, 60_000);
    if (!rate.ok) {
        return NextResponse.json(
            { error: 'Muitas tentativas. Aguarde alguns segundos e tente de novo.' },
            { status: 429, headers: { 'Retry-After': String(Math.ceil(rate.retryAfterMs / 1000)) } },
        );
    }

    try {
        const body = await request.json();
        const { listingId, checkIn, checkOut, guests, couponCode, metadata } = body || {};

        if (!listingId || !checkIn || !checkOut || !guests) {
            return NextResponse.json(
                { error: 'Missing required fields: listingId, checkIn, checkOut, guests' },
                { status: 400 },
            );
        }

        const checkout = await initializeCheckout({
            listingId,
            checkIn,
            checkOut,
            guests,
            ...(couponCode ? { couponCode } : {}),
            metadata: {
                ...(metadata || {}),
                userAgent: request.headers.get('user-agent') || undefined,
                ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
                    || request.headers.get('x-real-ip') || undefined,
                referrer: request.headers.get('referer') || undefined,
            },
        });

        // Devolve o sessionToken UMA vez (não vai mais aparecer em getCheckout).
        // Cliente armazena em sessionStorage e envia em X-Checkout-Session
        // nas chamadas seguintes.
        return NextResponse.json(checkout, { status: 201 });
    } catch (err) {
        return NextResponse.json(
            errorResponseBody(err, '/api/checkout/initialize'),
            { status: 500 },
        );
    }
}
