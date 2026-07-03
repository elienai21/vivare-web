import { NextRequest, NextResponse } from 'next/server';
import { fetchPriceCalculation } from '@/services/staysService';

/**
 * POST /api/calculate-price
 *
 * Calcula o preço de uma estadia, aceitando opcionalmente um cupom de
 * desconto. Body esperado:
 *   { listingId: string,
 *     checkIn:   "YYYY-MM-DD",
 *     checkOut:  "YYYY-MM-DD",
 *     guests:    number,
 *     couponCode?: string }
 *
 * Retorna o shape `Quote` que o `CheckoutWizard` consome (top-level
 * total/currency/nights + breakdown aninhado), com `discountAmount` e
 * `appliedCouponCode` presentes quando um cupom Stays válido foi usado.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { listingId, checkIn, checkOut, guests, couponCode } = body as {
            listingId?: string;
            checkIn?: string;
            checkOut?: string;
            guests?: number | string;
            couponCode?: string;
        };

        if (!listingId || !checkIn || !checkOut || !guests) {
            return NextResponse.json(
                { error: 'Missing required fields: listingId, checkIn, checkOut, guests' },
                { status: 400 },
            );
        }

        const result = await fetchPriceCalculation({
            listingId,
            checkIn,
            checkOut,
            guests: Number(guests),
            ...(couponCode ? { couponCode } : {}),
        });

        if (!result) {
            return NextResponse.json(
                { error: 'Failed to calculate price' },
                { status: 502 },
            );
        }

        // Resposta híbrida — combina dois consumidores:
        //   • CheckoutWizard (`api-client.calculatePrice`) lê o shape `Quote`
        //     com breakdown aninhado + `discountAmount`/`appliedCouponCode`.
        //   • BookingWidget lê os campos achatados (subtotal, cleaningFee,
        //     serviceFee, taxes) direto no top-level.
        // Mantemos os dois pra não quebrar nenhum dos dois caminhos enquanto
        // não migramos o BookingWidget para o shape canônico do `Quote`.
        return NextResponse.json({
            // ─ shape Quote (CheckoutWizard) ─
            listingId,
            checkIn,
            checkOut,
            nights: result.nights,
            guests: Number(guests),
            total: result.total,
            currency: result.currency,
            breakdown: {
                subtotal: result.subtotal,
                cleaningFee: result.cleaningFee,
                serviceFee: result.serviceFee,
                taxes: result.taxes,
                ...(result.discountAmount !== undefined && { discountAmount: result.discountAmount }),
                ...(result.appliedCouponCode && { appliedCouponCode: result.appliedCouponCode }),
            },
            // ─ campos achatados (BookingWidget legacy) ─
            subtotal: result.subtotal,
            cleaningFee: result.cleaningFee,
            serviceFee: result.serviceFee,
            taxes: result.taxes,
        });
    } catch (err) {
        console.error('[/api/calculate-price] Internal error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        );
    }
}
