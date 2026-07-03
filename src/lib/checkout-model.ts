import { Timestamp } from 'firebase-admin/firestore';

/**
 * State machine + types for the checkout collection. Mirrors the BFF's
 * model so the existing Firestore documents (and any half-rolled-out
 * checkouts) remain compatible. Server-side only — `firebase-admin`
 * imports won't ship to the browser.
 */

export enum CheckoutState {
    INITIATED = 'INITIATED',
    HOLD_CREATED = 'HOLD_CREATED',
    PAYMENT_CREATED = 'PAYMENT_CREATED',
    PAID = 'PAID',
    BOOKED = 'BOOKED',
    CANCELED = 'CANCELED',
    EXPIRED = 'EXPIRED',
    FAILED = 'FAILED',
}

export interface GuestInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    document?: string;
}

export interface QuoteBreakdown {
    subtotal: number;
    cleaningFee: number;
    serviceFee: number;
    taxes: number;
    discountAmount?: number;
    appliedCouponCode?: string;
}

export interface Quote {
    total: number;
    currency: string;
    breakdown: QuoteBreakdown;
    /** SHA-256 of (listingId|checkIn|checkOut|guests|couponCode). */
    hash: string;
    expiresAt: Timestamp;
}

export interface Guests {
    adults: number;
    children: number;
    infants: number;
}

export interface StateTransition {
    from: CheckoutState;
    to: CheckoutState;
    timestamp: Timestamp;
    reason?: string;
    actor: 'user' | 'system' | 'webhook';
}

export interface CheckoutMetadata {
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
}

export interface Checkout {
    checkoutId: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;

    state: CheckoutState;
    stateHistory: StateTransition[];

    listingId: string;
    listingName?: string;
    checkIn: string;
    checkOut: string;
    guests: Guests;

    couponCode?: string;

    quote: Quote;

    guest?: GuestInfo;

    staysReservationId?: string;
    staysBookingCode?: string;

    /** PaymentIntent id only — `client_secret` is NEVER persisted. */
    stripePaymentIntentId?: string;

    /**
     * Token de sessão de 256 bits. Gerado no `initialize`, devolvido
     * uma única vez ao cliente, exigido em todas as chamadas subsequentes
     * via header `X-Checkout-Session`. Impede que terceiros adivinhem
     * `checkoutId` e mexam em reserva alheia.
     */
    sessionToken: string;

    idempotencyKey: string;
    holdExpiresAt?: Timestamp;
    retryCount: number;
    metadata: CheckoutMetadata;

    /**
     * Mapa de últimas `Idempotency-Key` vistas por ação (`hold`,
     * `payment-intent`). Usado pra detectar double-click do cliente
     * com keys distintas (bug). Não persiste todas as keys — só a
     * última de cada ação. Volume: máx 2-3 entries por doc.
     */
    lastIdempotencyKeys?: Record<string, { key: string; at: number }>;

    /**
     * Timestamp para garbage collection automática via Firestore TTL.
     * Configurado em GCP Console (Firestore → Time-to-live). Setamos 90
     * dias em `initializeCheckout` — protege PII de hóspedes (CPF, etc.)
     * de ficar indefinidamente no banco. Doc é apagado automaticamente.
     */
    ttlAt: Timestamp;
}

export const VALID_TRANSITIONS: Record<CheckoutState, CheckoutState[]> = {
    [CheckoutState.INITIATED]: [CheckoutState.HOLD_CREATED, CheckoutState.CANCELED, CheckoutState.FAILED],
    [CheckoutState.HOLD_CREATED]: [CheckoutState.PAYMENT_CREATED, CheckoutState.EXPIRED, CheckoutState.CANCELED, CheckoutState.FAILED],
    [CheckoutState.PAYMENT_CREATED]: [CheckoutState.PAID, CheckoutState.EXPIRED, CheckoutState.CANCELED, CheckoutState.FAILED],
    [CheckoutState.PAID]: [CheckoutState.BOOKED, CheckoutState.FAILED],
    [CheckoutState.BOOKED]: [CheckoutState.CANCELED],
    [CheckoutState.CANCELED]: [],
    [CheckoutState.EXPIRED]: [],
    [CheckoutState.FAILED]: [],
};

export const TERMINAL_STATES: CheckoutState[] = [
    CheckoutState.BOOKED,
    CheckoutState.CANCELED,
    CheckoutState.EXPIRED,
    CheckoutState.FAILED,
];

export const EXPIRABLE_STATES: CheckoutState[] = [
    CheckoutState.HOLD_CREATED,
    CheckoutState.PAYMENT_CREATED,
];

export function isValidTransition(from: CheckoutState, to: CheckoutState): boolean {
    return VALID_TRANSITIONS[from].includes(to);
}

export function isTerminal(state: CheckoutState): boolean {
    return TERMINAL_STATES.includes(state);
}

// ── State machine error + transition helper ────────────────────────────

export class StateMachineError extends Error {
    constructor(
        message: string,
        public readonly checkoutId: string,
        public readonly currentState: CheckoutState,
        public readonly targetState: CheckoutState,
    ) {
        super(message);
        this.name = 'StateMachineError';
    }
}

interface TransitionOptions {
    reason?: string;
    actor: 'user' | 'system' | 'webhook';
    /** Extra fields to write atomically alongside the state. */
    updates?: Partial<Omit<Checkout, 'state' | 'stateHistory' | 'updatedAt'>>;
}

/**
 * Atomic state transition: reads the doc inside a Firestore transaction,
 * validates the move, appends history. Idempotent — re-runs that target
 * the current state are a no-op.
 *
 * Imports lazily so this file can be referenced from edge contexts that
 * never actually hit Firestore (we don't run the checkout on edge today,
 * but keeping it safe is cheap).
 */
export async function transitionState(
    checkoutId: string,
    targetState: CheckoutState,
    options: TransitionOptions,
): Promise<Checkout> {
    const { collections } = await import('./firebase-admin');

    const docRef = collections.checkouts.doc(checkoutId);

    return collections.checkouts.firestore.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);

        if (!doc.exists) {
            throw new Error(`Checkout ${checkoutId} not found`);
        }

        const checkout = doc.data() as Checkout;
        const currentState = checkout.state;

        // Idempotent no-op when already in target state.
        if (currentState === targetState) {
            return checkout;
        }

        if (!isValidTransition(currentState, targetState)) {
            throw new StateMachineError(
                `Invalid state transition from ${currentState} to ${targetState}`,
                checkoutId,
                currentState,
                targetState,
            );
        }

        if (isTerminal(currentState)) {
            throw new StateMachineError(
                `Cannot transition from terminal state ${currentState}`,
                checkoutId,
                currentState,
                targetState,
            );
        }

        const now = Timestamp.now();
        const transition: StateTransition = {
            from: currentState,
            to: targetState,
            timestamp: now,
            reason: options.reason,
            actor: options.actor,
        };

        const updateData: Partial<Checkout> = {
            ...options.updates,
            state: targetState,
            stateHistory: [...checkout.stateHistory, transition],
            updatedAt: now,
        };

        transaction.update(docRef, updateData);

        return { ...checkout, ...updateData } as Checkout;
    });
}
