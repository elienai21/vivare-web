// c:\Projetos\Site_Vivare\web\src\services\staysService.ts

export interface StaysListing {
    _id: string;
    id: string;
    internalName: string;
    _mstitle: { pt_BR: string; en_US?: string };
    _msdesc: { pt_BR: string; en_US?: string };
    _i_maxGuests: number;
    _i_rooms: number;
    _f_bathrooms: number;
    _d_minPrice?: number;
    address: {
        city: string;
        region: string; // Neighborhood
        street: string;
    };
    _t_mainImageMeta?: {
        url: string;
    };
    _t_imagesMeta?: Array<{
        url: string;
    }>;
    status: string;
    latLng?: {
        _f_lat: number;
        _f_lng: number;
    };
}

export const getStaysHeaders = () => {
    const key = process.env.STAYS_API_KEY;
    if (!key) throw new Error("STAYS_API_KEY não configurada na Vercel Env");

    return {
        "Authorization": `Basic ${key}`,
        "Content-Type": "application/json"
    };
};

export const getStaysBaseUrl = () => {
    const url = process.env.STAYS_API_URL;
    if (!url) throw new Error("STAYS_API_URL não configurada na Vercel Env");
    return url.replace(/\/$/, ""); // Remove trailing slash
};

export async function fetchListings(): Promise<StaysListing[]> {
    try {
        const response = await fetch(`${getStaysBaseUrl()}/external/v1/content/listings?limit=100`, {
            method: "GET",
            headers: getStaysHeaders(),
            next: { revalidate: 3600 } // Cache Server side 1 hour
        });

        if (!response.ok) {
            console.error("Stays API Error", await response.text());
            throw new Error(`Failed to fetch listings. Status: ${response.status}`);
        }

        const data = await response.json();
        return data as StaysListing[];
    } catch (error) {
        console.error("Erro no Service Stays.net (fetchListings):", error);
        return [];
    }
}

export async function fetchListingById(id: string): Promise<StaysListing | null> {
    try {
        const url = `${getStaysBaseUrl()}/external/v1/content/listings/${id}`;
        const response = await fetch(url, {
            method: "GET",
            headers: getStaysHeaders(),
            next: { revalidate: 3600 }
        });

        if (!response.ok) return null;

        return await response.json() as StaysListing;
    } catch (error) {
        console.error(`Erro no Service Stays.net (fetchListingById ${id}):`, error);
        return null;
    }
}

export interface StaysPriceResult {
    nights: number;
    subtotal: number;
    cleaningFee: number;
    serviceFee: number;
    taxes: number;
    total: number;
    currency: string;
    /** Valor do desconto aplicado (R$). Presente apenas quando um cupom válido foi usado. */
    discountAmount?: number;
    /** Código do cupom efetivamente aplicado (uppercase). Ausente se cupom inválido / não usado. */
    appliedCouponCode?: string;
}

/**
 * Faz UMA chamada ao endpoint Stays calculate-price e devolve a versão
 * normalizada (campos achatados em BRL). Usado tanto pelo cálculo simples
 * quanto pela comparação com/sem cupom para extrair o desconto.
 */
async function fetchSinglePriceCalc(staysBody: Record<string, unknown>, listingIdForLog: string): Promise<Omit<StaysPriceResult, "discountAmount" | "appliedCouponCode"> | null> {
    const url = `${getStaysBaseUrl()}/external/v1/booking/calculate-price`;

    const response = await fetch(url, {
        method: "POST",
        headers: getStaysHeaders(),
        body: JSON.stringify(staysBody),
        cache: "no-store",
    });

    if (!response.ok) {
        const errText = await response.text().catch(() => "");
        console.error(`[Price] HTTP ${response.status} for listing ${listingIdForLog}:`, errText);
        return null;
    }

    const data = await response.json();
    const item = Array.isArray(data) ? data[0] : data;
    if (!item) return null;

    // Extrai total em BRL (_mctotal pode ser multi-currency)
    const totalBRL: number = item._mctotal?.BRL ?? item.total ?? 0;

    // Extrai fees (taxa de limpeza, serviço, etc.)
    const fees = Array.isArray(item.fees) ? item.fees : [];
    let cleaningFee = 0;
    let serviceFee = 0;
    let taxes = 0;

    for (const fee of fees) {
        const feeValue: number = fee._mcval?.BRL ?? fee.value ?? 0;
        const feeName: string = (fee.internalName || fee._mstitle?.pt_BR || fee.name || "").toLowerCase();

        if (feeName.includes("limpeza") || feeName.includes("clean")) {
            cleaningFee += feeValue;
        } else if (feeName.includes("serviço") || feeName.includes("service")) {
            serviceFee += feeValue;
        } else if (feeName.includes("imposto") || feeName.includes("tax") || feeName.includes("iss")) {
            taxes += feeValue;
        } else {
            serviceFee += feeValue;
        }
    }

    const totalFees = cleaningFee + serviceFee + taxes;
    const subtotal = item.feesIncluded ? totalBRL - totalFees : totalBRL;

    const from = new Date((staysBody.from as string) || "");
    const to = new Date((staysBody.to as string) || "");
    const nights = Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));

    return {
        nights,
        subtotal: Math.round(subtotal * 100) / 100,
        cleaningFee: Math.round(cleaningFee * 100) / 100,
        serviceFee: Math.round(serviceFee * 100) / 100,
        taxes: Math.round(taxes * 100) / 100,
        total: Math.round(totalBRL * 100) / 100,
        currency: item.mainCurrency ?? "BRL",
    };
}

export async function fetchPriceCalculation(params: {
    listingId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    /** Código de cupom Vivare/Stays. Mapeado para `promocode` no payload da Stays. */
    couponCode?: string;
}): Promise<StaysPriceResult | null> {
    try {
        // Stays espera: from, to, listingIds (array), guests, promocode (string).
        const baseBody: Record<string, unknown> = {
            from: params.checkIn,
            to: params.checkOut,
            listingIds: [params.listingId],
            guests: params.guests,
        };

        // Quando há cupom: dispara as duas chamadas em paralelo (com e sem
        // cupom) para conseguir computar o `discountAmount` — Stays não
        // expõe o valor do desconto explicitamente, só o total final.
        if (params.couponCode) {
            const trimmed = params.couponCode.trim();
            const [withCoupon, baseline] = await Promise.all([
                fetchSinglePriceCalc({ ...baseBody, promocode: trimmed }, params.listingId),
                fetchSinglePriceCalc(baseBody, params.listingId).catch(() => null),
            ]);

            if (!withCoupon) return null;

            // Stays ignora cupom inválido silenciosamente (devolve o mesmo
            // total). Tratamos delta > 0 como sinal de "cupom aplicado".
            if (baseline) {
                const delta = +(baseline.total - withCoupon.total).toFixed(2);
                if (delta > 0) {
                    return {
                        ...withCoupon,
                        discountAmount: delta,
                        appliedCouponCode: trimmed.toUpperCase(),
                    };
                }
            }
            // Cupom não reduziu o preço → não aplicado. Retornamos o resultado
            // sem flags de desconto, e o caller decide a UX (ex: "cupom inválido").
            return withCoupon;
        }

        return await fetchSinglePriceCalc(baseBody, params.listingId);
    } catch (error) {
        console.error(`Erro no Price Calculation Stays.net:`, error);
        return null;
    }
}

// ============================================
// Reservations & Payments (server-side / transactional)
// ============================================

export interface StaysGuest {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    document?: string;
}

export interface StaysReservationCreateInput {
    listingId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    type: 'reserved' | 'booked';
    guest: StaysGuest;
    source?: string;
    totalPrice: number;
    currency: string;
    /** Cupom Vivare/Stays — mapeado para `promocode` no payload da Stays. */
    couponCode?: string;
}

export interface StaysReservationOut {
    _id: string;
    code: string;
    listingId: string;
    type: 'reserved' | 'booked' | 'canceled';
}

/**
 * Cria uma reserva na Stays (hold ou booked).
 * Importante: Stays espera `promocode` (uma palavra), não `couponCode`.
 */
export async function createStaysReservation(input: StaysReservationCreateInput): Promise<StaysReservationOut> {
    const url = `${getStaysBaseUrl()}/external/v1/booking/reservations`;
    const { couponCode, ...rest } = input;
    const body = couponCode ? { ...rest, promocode: couponCode } : rest;

    const response = await fetch(url, {
        method: 'POST',
        headers: getStaysHeaders(),
        body: JSON.stringify(body),
        cache: 'no-store',
    });

    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`Stays createReservation failed (${response.status}): ${text.slice(0, 300)}`);
    }
    return await response.json() as StaysReservationOut;
}

export async function updateStaysReservation(
    reservationId: string,
    updates: { type?: 'reserved' | 'booked' | 'canceled'; notes?: string },
): Promise<StaysReservationOut> {
    const url = `${getStaysBaseUrl()}/external/v1/booking/reservations/${reservationId}`;
    const response = await fetch(url, {
        method: 'PATCH',
        headers: getStaysHeaders(),
        body: JSON.stringify(updates),
        cache: 'no-store',
    });
    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`Stays updateReservation failed (${response.status}): ${text.slice(0, 300)}`);
    }
    return await response.json() as StaysReservationOut;
}

export async function cancelStaysReservation(reservationId: string): Promise<void> {
    await updateStaysReservation(reservationId, { type: 'canceled' });
}

export async function getStaysReservation(reservationId: string): Promise<StaysReservationOut> {
    const url = `${getStaysBaseUrl()}/external/v1/booking/reservations/${reservationId}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: getStaysHeaders(),
        cache: 'no-store',
    });
    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`Stays getReservation failed (${response.status}): ${text.slice(0, 300)}`);
    }
    return await response.json() as StaysReservationOut;
}

export interface StaysPaymentInput {
    amount: number;
    currency: string;
    method: 'credit_card' | 'pix' | 'bank_transfer' | 'other';
    reference?: string;
    notes?: string;
}

export async function registerStaysPayment(reservationId: string, payment: StaysPaymentInput): Promise<void> {
    const url = `${getStaysBaseUrl()}/external/v1/booking/reservations/${reservationId}/payments`;
    const response = await fetch(url, {
        method: 'POST',
        headers: getStaysHeaders(),
        body: JSON.stringify(payment),
        cache: 'no-store',
    });
    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`Stays registerPayment failed (${response.status}): ${text.slice(0, 300)}`);
    }
}

export async function fetchListingCalendar(id: string, from: string, to: string): Promise<{ date: string; avail: number | boolean; status: string }[]> {
    try {
        const url = `${getStaysBaseUrl()}/external/v1/calendar/listing/${id}?from=${from}&to=${to}`;
        const response = await fetch(url, {
            method: "GET",
            headers: getStaysHeaders(),
            cache: "no-store"
        });

        if (!response.ok) {
            console.error(`[Calendar] HTTP ${response.status} for listing ${id}`);
            return [];
        }
        const data = await response.json();

        // DEBUG: log structure of first 3 items
        if (Array.isArray(data)) {
            console.log(`[Calendar] listingId=${id} → Array com ${data.length} itens. Amostra:`, JSON.stringify(data.slice(0, 3), null, 2));
        } else {
            console.log(`[Calendar] listingId=${id} → Tipo: ${typeof data}. Keys:`, Object.keys(data), `. Amostra:`, JSON.stringify(data).slice(0, 500));
        }

        return data;
    } catch (error) {
        console.error(`Erro no Calendar Stays.net:`, error);
        return [];
    }
}
