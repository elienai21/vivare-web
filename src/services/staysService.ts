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
}

export async function fetchPriceCalculation(params: {
    listingId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
}): Promise<StaysPriceResult | null> {
    try {
        const url = `${getStaysBaseUrl()}/external/v1/booking/calculate-price`;

        // A API Stays espera: from, to, listingIds (array), guests
        const staysBody = {
            from: params.checkIn,
            to: params.checkOut,
            listingIds: [params.listingId],
            guests: params.guests,
        };

        const response = await fetch(url, {
            method: "POST",
            headers: getStaysHeaders(),
            body: JSON.stringify(staysBody),
            cache: "no-store"
        });

        if (!response.ok) {
            const errText = await response.text().catch(() => '');
            console.error(`[Price] HTTP ${response.status} for listing ${params.listingId}:`, errText);
            return null;
        }

        const data = await response.json();

        console.log(`[Price] listingId=${params.listingId} → Response:`, JSON.stringify(data).slice(0, 1000));

        // A resposta é um array — pega o primeiro item (correspondente ao listingId)
        const item = Array.isArray(data) ? data[0] : data;

        if (!item) return null;

        // Extrai total em BRL (_mctotal pode ser multi-currency)
        const totalBRL = item._mctotal?.BRL ?? item.total ?? 0;

        // Extrai fees (taxa de limpeza, serviço, etc.)
        const fees = Array.isArray(item.fees) ? item.fees : [];
        let cleaningFee = 0;
        let serviceFee = 0;
        let taxes = 0;

        for (const fee of fees) {
            const feeValue = fee._mcval?.BRL ?? fee.value ?? 0;
            // A API Stays retorna internalName e _mstitle, não "name"
            const feeName = (fee.internalName || fee._mstitle?.pt_BR || fee.name || '').toLowerCase();

            if (feeName.includes('limpeza') || feeName.includes('clean')) {
                cleaningFee += feeValue;
            } else if (feeName.includes('serviço') || feeName.includes('service')) {
                serviceFee += feeValue;
            } else if (feeName.includes('imposto') || feeName.includes('tax') || feeName.includes('iss')) {
                taxes += feeValue;
            } else {
                serviceFee += feeValue;
            }
        }

        // Se feesIncluded=true, o total já inclui as fees → subtotal = total - fees
        const totalFees = cleaningFee + serviceFee + taxes;
        const subtotal = item.feesIncluded ? (totalBRL - totalFees) : totalBRL;

        // Calcula noites
        const from = new Date(params.checkIn);
        const to = new Date(params.checkOut);
        const nights = Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));

        return {
            nights,
            subtotal: Math.round(subtotal * 100) / 100,
            cleaningFee: Math.round(cleaningFee * 100) / 100,
            serviceFee: Math.round(serviceFee * 100) / 100,
            taxes: Math.round(taxes * 100) / 100,
            total: Math.round(totalBRL * 100) / 100,
            currency: item.mainCurrency ?? 'BRL',
        };
    } catch (error) {
        console.error(`Erro no Price Calculation Stays.net:`, error);
        return null;
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
