import { NextRequest, NextResponse } from 'next/server';
import { fetchPriceCalculation } from '@/services/staysService';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { listingId, checkIn, checkOut, guests } = body;

        if (!listingId || !checkIn || !checkOut || !guests) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const result = await fetchPriceCalculation({
            listingId,
            checkIn,
            checkOut,
            guests: Number(guests),
        });

        if (!result) {
            return NextResponse.json(
                { error: 'Failed to calculate price' },
                { status: 502 }
            );
        }

        return NextResponse.json(result);
    } catch {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
