/**
 * API Client for Vivare BFF
 * 
 * Handles all communication with the backend API
 */

import {
    ListingDetail,
    ListingCalendar,
    Quote,
    Checkout,
    CreateCheckoutParams,
    PaymentIntentResult,
    Booking,
    SearchFilters,
    SearchResults,
    GuestInfo,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public code?: string,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

async function request<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const url = `${API_URL}${path}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ApiError(
            error.error || `Request failed: ${response.status}`,
            response.status,
            error.code,
        );
    }

    return response.json();
}

// ============================================
// Listings API
// ============================================

export async function searchListings(filters: SearchFilters = {}): Promise<SearchResults> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
            if (Array.isArray(value)) {
                params.set(key, value.join(','));
            } else {
                params.set(key, String(value));
            }
        }
    });

    return request<SearchResults>(`/listings?${params.toString()}`);
}

export async function getListingDetail(id: string): Promise<ListingDetail> {
    return request<ListingDetail>(`/listings/${id}`);
}

export async function getListingCalendar(
    listingId: string,
    startDate: string,
    endDate: string,
): Promise<ListingCalendar> {
    const params = new URLSearchParams({ startDate, endDate });
    return request<ListingCalendar>(`/listings/${listingId}/calendar?${params.toString()}`);
}

export async function calculatePrice(params: {
    listingId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    couponCode?: string;
}): Promise<Quote> {
    return request<Quote>('/listings/calculate-price', {
        method: 'POST',
        body: JSON.stringify(params),
    });
}

// ============================================
// Checkout API
// ============================================

export async function initializeCheckout(params: CreateCheckoutParams): Promise<Checkout> {
    return request<Checkout>('/checkout/initialize', {
        method: 'POST',
        body: JSON.stringify(params),
    });
}

export async function getCheckout(checkoutId: string): Promise<Checkout> {
    return request<Checkout>(`/checkout/${checkoutId}`);
}

export async function updateGuestInfo(
    checkoutId: string,
    guest: GuestInfo,
): Promise<Checkout> {
    return request<Checkout>(`/checkout/${checkoutId}/guest`, {
        method: 'PATCH',
        body: JSON.stringify({ guest }),
    });
}

export async function createHold(
    checkoutId: string,
    idempotencyKey: string,
): Promise<{ checkoutId: string; state: string; staysReservationId: string }> {
    return request(`/checkout/${checkoutId}/hold`, {
        method: 'POST',
        headers: {
            'Idempotency-Key': idempotencyKey,
        },
    });
}

export async function createPaymentIntent(
    checkoutId: string,
    idempotencyKey: string,
): Promise<PaymentIntentResult> {
    return request<PaymentIntentResult>(`/checkout/${checkoutId}/payment-intent`, {
        method: 'POST',
        headers: {
            'Idempotency-Key': idempotencyKey,
        },
    });
}

export async function finalizeCheckout(
    checkoutId: string,
    maxWaitMs = 10000,
): Promise<{
    success: boolean;
    pending?: boolean;
    bookingCode?: string;
    message?: string;
    checkout: Checkout;
}> {
    return request(`/checkout/${checkoutId}/finalize`, {
        method: 'POST',
        body: JSON.stringify({ maxWaitMs }),
    });
}

export async function cancelCheckout(
    checkoutId: string,
    reason?: string,
): Promise<{ checkoutId: string; state: string; canceled: boolean }> {
    return request(`/checkout/${checkoutId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
    });
}

// ============================================
// Booking API
// ============================================

export async function lookupBooking(
    code: string,
    email: string,
): Promise<Booking> {
    const params = new URLSearchParams({ code, email });
    return request<Booking>(`/bookings/lookup?${params.toString()}`);
}

export async function cancelBooking(
    code: string,
    email: string,
    reason?: string,
): Promise<{ success: boolean; message: string }> {
    return request('/bookings/cancel', {
        method: 'POST',
        body: JSON.stringify({ code, email, reason }),
    });
}

// ============================================
// Content API
// ============================================

export async function getHomeContent(): Promise<unknown> {
    return request('/content/home');
}

export async function getFAQ(): Promise<unknown> {
    return request('/content/faq');
}

export async function getActiveBanners(): Promise<unknown> {
    return request('/content/banners/active');
}
