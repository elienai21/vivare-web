/**
 * API Client (browser-side) — agora aponta tudo pra Next.js API routes
 * locais (`/api/*`), sem dependência do BFF Express. O fluxo de checkout
 * (initialize/hold/payment-intent/finalize/cancel) roda em Vercel
 * Functions servindo `firebase-admin` + `stripe` server-side.
 *
 * Sessão: `initialize` devolve `sessionToken` (256 bits). Cliente
 * armazena em sessionStorage (mesmo escopo do checkoutId — vide
 * `CheckoutWizard`) e envia em `X-Checkout-Session` em todas as
 * chamadas subsequentes do mesmo checkout.
 */

import {
    Quote,
    Checkout,
    CreateCheckoutParams,
    PaymentIntentResult,
    GuestInfo,
} from '@/types';

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

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(path, {
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

/** Header obrigatório para autorizar chamadas em `/api/checkout/[id]/*`. */
function sessionHeaders(sessionToken: string | null | undefined): HeadersInit {
    return sessionToken ? { 'X-Checkout-Session': sessionToken } : {};
}

// ============================================
// Price calculation
// ============================================

export async function calculatePrice(params: {
    listingId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    couponCode?: string;
}): Promise<Quote> {
    return request<Quote>('/api/calculate-price', {
        method: 'POST',
        body: JSON.stringify(params),
    });
}

// ============================================
// Checkout API (Next.js API routes — substitui BFF Express)
// ============================================

/**
 * Inicializa o checkout. Resposta inclui `sessionToken` (visível UMA vez).
 * O caller deve guardar `sessionToken` junto com o `checkoutId` e enviar
 * em todas as chamadas subsequentes via `getCheckout`/`updateGuestInfo`/etc.
 */
export async function initializeCheckout(
    params: CreateCheckoutParams,
): Promise<Checkout & { sessionToken: string }> {
    return request<Checkout & { sessionToken: string }>('/api/checkout/initialize', {
        method: 'POST',
        body: JSON.stringify(params),
    });
}

export async function getCheckout(
    checkoutId: string,
    sessionToken: string,
): Promise<Checkout> {
    return request<Checkout>(`/api/checkout/${checkoutId}`, {
        headers: sessionHeaders(sessionToken),
    });
}

export async function updateGuestInfo(
    checkoutId: string,
    sessionToken: string,
    guest: GuestInfo,
): Promise<Checkout> {
    return request<Checkout>(`/api/checkout/${checkoutId}/guest`, {
        method: 'PATCH',
        headers: sessionHeaders(sessionToken),
        body: JSON.stringify({ guest }),
    });
}

export async function createHold(
    checkoutId: string,
    sessionToken: string,
    idempotencyKey: string,
): Promise<{ checkoutId: string; state: string; staysReservationId: string }> {
    return request(`/api/checkout/${checkoutId}/hold`, {
        method: 'POST',
        headers: {
            'Idempotency-Key': idempotencyKey,
            ...sessionHeaders(sessionToken),
        },
    });
}

export async function createPaymentIntent(
    checkoutId: string,
    sessionToken: string,
    idempotencyKey: string,
): Promise<PaymentIntentResult> {
    return request<PaymentIntentResult>(`/api/checkout/${checkoutId}/payment-intent`, {
        method: 'POST',
        headers: {
            'Idempotency-Key': idempotencyKey,
            ...sessionHeaders(sessionToken),
        },
    });
}

export async function finalizeCheckout(
    checkoutId: string,
    sessionToken: string,
    maxWaitMs = 10000,
): Promise<{
    success: boolean;
    pending?: boolean;
    bookingCode?: string;
    message?: string;
    checkout: Checkout;
}> {
    return request(`/api/checkout/${checkoutId}/finalize`, {
        method: 'POST',
        headers: sessionHeaders(sessionToken),
        body: JSON.stringify({ maxWaitMs }),
    });
}

export async function cancelCheckout(
    checkoutId: string,
    sessionToken: string,
    reason?: string,
): Promise<{ checkoutId: string; state: string; canceled: boolean }> {
    return request(`/api/checkout/${checkoutId}/cancel`, {
        method: 'POST',
        headers: sessionHeaders(sessionToken),
        body: JSON.stringify({ reason }),
    });
}
