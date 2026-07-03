import crypto from 'crypto';
import { Timestamp } from 'firebase-admin/firestore';
import Stripe from 'stripe';
import { collections } from './firebase-admin';
import {
    Checkout,
    CheckoutState,
    EXPIRABLE_STATES,
    GuestInfo,
    Guests,
    Quote,
    StateMachineError,
    transitionState,
} from './checkout-model';
import {
    cancelStaysReservation,
    createStaysReservation,
    fetchListingById,
    fetchPriceCalculation,
    getStaysReservation,
    registerStaysPayment,
    updateStaysReservation,
    type StaysPriceResult,
} from '@/services/staysService';
import { generateSessionToken, verifySessionToken } from './checkout-auth';

/**
 * Server-side checkout orchestration. Mirrors the BFF (`functions/`) but
 * runs inside Next.js API routes — Firestore Admin transactions, Stripe
 * SDK, Stays HTTP. Same state-machine guarantees: lock-first, idempotent,
 * no PII serialized in client URLs, no client_secret persisted.
 */

const HOLD_TTL_MINUTES = parseInt(process.env.CHECKOUT_HOLD_TTL_MINUTES || '15', 10);
const QUOTE_TTL_MINUTES = parseInt(process.env.CHECKOUT_QUOTE_TTL_MINUTES || '30', 10);
/**
 * Retenção do doc inteiro do checkout. Após esse prazo Firestore deleta
 * automaticamente via TTL policy (configurada em GCP Console). 90 dias
 * cobre janela razoável de dispute Stripe + cancelamento + auditoria,
 * sem deixar PII apodrecendo.
 */
const CHECKOUT_RETENTION_DAYS = parseInt(process.env.CHECKOUT_RETENTION_DAYS || '90', 10);

let stripeInstance: Stripe | null = null;
function getStripe(): Stripe {
    if (stripeInstance) return stripeInstance;
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
        throw new Error('STRIPE_SECRET_KEY env var não configurada — checkout indisponível');
    }
    // apiVersion fixa pelo tipo do SDK instalado: previne mudanças
    // silenciosas quando o SDK atualiza.
    stripeInstance = new Stripe(key, { apiVersion: '2025-02-24.acacia' });
    return stripeInstance;
}

function generateUuid(): string {
    // crypto.randomUUID() é estável em Node ≥14.17 e Vercel runtime.
    return crypto.randomUUID();
}

export interface InitCheckoutParams {
    listingId: string;
    checkIn: string;
    checkOut: string;
    guests: Guests;
    couponCode?: string;
    metadata?: { userAgent?: string; ipAddress?: string; referrer?: string };
}

function createLockedQuote(params: InitCheckoutParams, price: StaysPriceResult): Quote {
    const hashInput = [
        params.listingId,
        params.checkIn,
        params.checkOut,
        params.guests.adults,
        params.guests.children,
        params.guests.infants,
        params.couponCode || '',
    ].join('|');
    const hash = crypto.createHash('sha256').update(hashInput).digest('hex');
    const expiresAt = Timestamp.fromMillis(Date.now() + QUOTE_TTL_MINUTES * 60 * 1000);

    return {
        total: price.total,
        currency: price.currency,
        breakdown: {
            subtotal: price.subtotal,
            cleaningFee: price.cleaningFee,
            serviceFee: price.serviceFee,
            taxes: price.taxes,
            ...(price.discountAmount !== undefined && { discountAmount: price.discountAmount }),
            ...(price.appliedCouponCode && { appliedCouponCode: price.appliedCouponCode }),
        },
        hash,
        expiresAt,
    };
}

export async function initializeCheckout(params: InitCheckoutParams): Promise<Checkout> {
    const listing = await fetchListingById(params.listingId);
    if (!listing) throw new Error(`Listing ${params.listingId} not found`);

    const totalGuests = params.guests.adults + params.guests.children;
    const price = await fetchPriceCalculation({
        listingId: params.listingId,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        guests: totalGuests,
        ...(params.couponCode ? { couponCode: params.couponCode } : {}),
    });
    if (!price) throw new Error('Não foi possível calcular o preço.');

    const quote = createLockedQuote(params, price);
    const now = Timestamp.now();
    const checkoutId = generateUuid();
    const sessionToken = generateSessionToken();
    const ttlAt = Timestamp.fromMillis(Date.now() + CHECKOUT_RETENTION_DAYS * 24 * 60 * 60 * 1000);

    const checkout: Checkout = {
        checkoutId,
        createdAt: now,
        updatedAt: now,
        state: CheckoutState.INITIATED,
        stateHistory: [{
            from: CheckoutState.INITIATED,
            to: CheckoutState.INITIATED,
            timestamp: now,
            reason: 'Checkout initialized',
            actor: 'user',
        }],
        listingId: params.listingId,
        listingName: listing._mstitle?.pt_BR ?? listing.internalName ?? 'Acomodação Vivare',
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        guests: params.guests,
        ...(params.couponCode && { couponCode: params.couponCode }),
        quote,
        sessionToken,
        idempotencyKey: generateUuid(),
        retryCount: 0,
        metadata: params.metadata || {},
        ttlAt,
    };

    await collections.checkouts.doc(checkoutId).set(checkout);
    return checkout;
}

/**
 * Carrega o checkout e valida que o caller apresentou o session token
 * correto. Use sempre no início de cada handler de `/api/checkout/[id]/*`
 * antes de qualquer mutação. Lança `CheckoutAuthError` se não bater.
 */
export class CheckoutAuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CheckoutAuthError';
    }
}

export async function getAuthorizedCheckout(
    checkoutId: string,
    providedToken: string | null,
): Promise<Checkout> {
    const checkout = await getCheckout(checkoutId);
    if (!checkout) {
        throw new CheckoutAuthError(`Checkout ${checkoutId} not found`);
    }
    if (!verifySessionToken(checkout.sessionToken, providedToken)) {
        // Mensagem genérica de propósito (não revela se o checkout existe).
        throw new CheckoutAuthError('Invalid or missing session token');
    }
    return checkout;
}

export async function getCheckout(checkoutId: string): Promise<Checkout | null> {
    const doc = await collections.checkouts.doc(checkoutId).get();
    return doc.exists ? (doc.data() as Checkout) : null;
}

export async function updateGuestInfo(checkoutId: string, guest: GuestInfo): Promise<Checkout> {
    const docRef = collections.checkouts.doc(checkoutId);
    await docRef.update({ guest, updatedAt: Timestamp.now() });
    const doc = await docRef.get();
    return doc.data() as Checkout;
}

/**
 * Cria a reserva "reserved" na Stays e marca o checkout como HOLD_CREATED.
 * Transacional + idempotente — chamadas duplicadas devolvem o estado atual
 * sem chamar Stays de novo.
 */
export async function createHold(checkoutId: string): Promise<Checkout> {
    const docRef = collections.checkouts.doc(checkoutId);

    // Primeiro lemos fora da transação pra evitar chamadas externas dentro
    // do bloco transacional (Firestore Admin não permite I/O externo
    // durante a transação sem arriscar deadlock).
    const initialDoc = await docRef.get();
    if (!initialDoc.exists) throw new Error(`Checkout ${checkoutId} not found`);
    const initial = initialDoc.data() as Checkout;

    if (initial.state === CheckoutState.HOLD_CREATED || initial.staysReservationId) {
        return initial;
    }

    if (initial.state !== CheckoutState.INITIATED) {
        throw new StateMachineError(
            `Cannot create hold from state ${initial.state}`,
            checkoutId,
            initial.state,
            CheckoutState.HOLD_CREATED,
        );
    }
    if (!initial.guest?.email) {
        throw new Error('Guest information required before creating hold');
    }

    // Cria reserva na Stays (chamada externa, fora da transação).
    const reservation = await createStaysReservation({
        listingId: initial.listingId,
        checkIn: initial.checkIn,
        checkOut: initial.checkOut,
        guests: initial.guests.adults + initial.guests.children,
        type: 'reserved',
        guest: {
            firstName: initial.guest.firstName,
            lastName: initial.guest.lastName,
            email: initial.guest.email,
            phone: initial.guest.phone,
            document: initial.guest.document,
        },
        source: 'vivare-web',
        totalPrice: initial.quote.total,
        currency: initial.quote.currency,
        ...(initial.couponCode && { couponCode: initial.couponCode }),
    });

    // Aplica o resultado dentro da transação — re-checa o estado pra evitar
    // race com outra requisição que tenha completado entre a leitura e o
    // commit. Se outro path já criou hold, cancelamos a reserva nova.
    return collections.checkouts.firestore.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);
        if (!doc.exists) throw new Error(`Checkout ${checkoutId} disappeared`);
        const current = doc.data() as Checkout;

        if (current.state === CheckoutState.HOLD_CREATED && current.staysReservationId) {
            // Race: outra request já criou hold. Cancela a nossa duplicata.
            // Se o cancel falhar (Stays caiu, timeout), a reserva fica
            // bloqueando o calendário — gravamos em `reservation_orphans`
            // pra um job de reconciliação cancelar depois.
            try {
                await cancelStaysReservation(reservation._id);
            } catch (cancelErr) {
                console.error('[checkout] CRITICAL: duplicate Stays reservation could not be canceled', {
                    duplicateStaysReservationId: reservation._id,
                    winningStaysReservationId: current.staysReservationId,
                    winningCheckoutId: current.checkoutId,
                    error: cancelErr instanceof Error ? cancelErr.message : String(cancelErr),
                });
                await collections.reservationOrphans.add({
                    staysReservationId: reservation._id,
                    reason: 'duplicate-on-hold-race',
                    winningCheckoutId: current.checkoutId,
                    cancelError: cancelErr instanceof Error ? cancelErr.message : String(cancelErr),
                    createdAt: Timestamp.now(),
                    resolved: false,
                }).catch((logErr) => {
                    // Pior caso: nem o orphan log foi gravado. Console.error
                    // é a última linha de defesa — operador precisa olhar
                    // logs Vercel pra detectar o vazamento.
                    console.error('[checkout] FATAL: orphan log failed:', logErr);
                });
            }
            return current;
        }

        const now = Timestamp.now();
        const holdExpiresAt = Timestamp.fromMillis(Date.now() + HOLD_TTL_MINUTES * 60 * 1000);

        const updates: Partial<Checkout> = {
            state: CheckoutState.HOLD_CREATED,
            staysReservationId: reservation._id,
            holdExpiresAt,
            updatedAt: now,
            stateHistory: [
                ...current.stateHistory,
                {
                    from: current.state,
                    to: CheckoutState.HOLD_CREATED,
                    timestamp: now,
                    reason: 'Hold created in Stays',
                    actor: 'system',
                },
            ],
        };
        transaction.update(docRef, updates);
        return { ...current, ...updates } as Checkout;
    });
}

export async function createPaymentIntent(checkoutId: string): Promise<{ clientSecret: string; state: CheckoutState }> {
    const checkout = await getCheckout(checkoutId);
    if (!checkout) throw new Error(`Checkout ${checkoutId} not found`);

    const stripe = getStripe();

    // Idempotência: se já existe PI, devolvemos o client_secret atual.
    if (checkout.stripePaymentIntentId) {
        const existing = await stripe.paymentIntents.retrieve(checkout.stripePaymentIntentId);
        return { clientSecret: existing.client_secret!, state: checkout.state };
    }

    if (checkout.state !== CheckoutState.HOLD_CREATED) {
        throw new Error(`Cannot create PaymentIntent from state ${checkout.state}. Hold required first.`);
    }
    if (checkout.quote.currency.toUpperCase() !== 'BRL') {
        throw new Error(`Unsupported currency: ${checkout.quote.currency}. Only BRL is supported.`);
    }

    const amountInCentavos = Math.round(checkout.quote.total * 100);

    const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCentavos,
        currency: 'brl',
        metadata: {
            checkoutId,
            listingId: checkout.listingId,
            staysReservationId: checkout.staysReservationId!,
            checkIn: checkout.checkIn,
            checkOut: checkout.checkOut,
        },
        automatic_payment_methods: { enabled: true },
        description: `Reserva ${checkout.listingName ?? checkout.listingId} - ${checkout.checkIn} a ${checkout.checkOut}`,
        receipt_email: checkout.guest?.email,
    });

    await transitionState(checkoutId, CheckoutState.PAYMENT_CREATED, {
        actor: 'system',
        reason: 'PaymentIntent created',
        updates: {
            stripePaymentIntentId: paymentIntent.id,
            // client_secret intencionalmente fora — leitura única do Stripe.
        },
    });

    return { clientSecret: paymentIntent.client_secret!, state: CheckoutState.PAYMENT_CREATED };
}

/**
 * Mapeia o tipo de método de pagamento usado no Stripe pra o enum
 * aceito pelo Stays. Necessário porque `automatic_payment_methods.enabled`
 * permite cartão, PIX, boleto — cada um precisa virar a categoria
 * correta no ledger Stays, senão relatório financeiro mente.
 */
function stripeToStaysMethod(stripeType: string | undefined): 'credit_card' | 'pix' | 'bank_transfer' | 'other' {
    switch (stripeType) {
        case 'card':       return 'credit_card';
        case 'pix':        return 'pix';
        case 'boleto':     return 'bank_transfer';
        case 'bank_transfer':
        case 'customer_balance':
            return 'bank_transfer';
        default:           return 'other';
    }
}

export async function handlePaymentSucceeded(checkoutId: string, paymentIntentId: string): Promise<Checkout> {
    let checkout = await transitionState(checkoutId, CheckoutState.PAID, {
        actor: 'webhook',
        reason: 'Payment succeeded',
    });

    if (checkout.state === CheckoutState.BOOKED) return checkout;

    // Pega o PaymentIntent expandido pra saber QUAL método o hóspede
    // usou de fato (PIX, cartão, boleto). Sem isso, Stays vê todos como
    // credit_card (HURDLE candidato: relatório financeiro errado).
    const stripe = getStripe();
    let staysMethod: 'credit_card' | 'pix' | 'bank_transfer' | 'other' = 'credit_card';
    let stripeTypeForNote = 'unknown';
    try {
        const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
            expand: ['latest_charge.payment_method_details'],
        });
        const charge = typeof pi.latest_charge === 'object' && pi.latest_charge ? pi.latest_charge : null;
        const detailsType = charge?.payment_method_details?.type;
        stripeTypeForNote = detailsType ?? pi.payment_method_types?.[0] ?? 'unknown';
        staysMethod = stripeToStaysMethod(stripeTypeForNote);
    } catch (err) {
        // Não bloqueamos o booking só porque o expand falhou — caímos no
        // default `credit_card` e logamos. Stays ainda recebe o pagamento.
        console.warn('[checkout] payment_method expand failed, defaulting to credit_card:', err);
    }

    await updateStaysReservation(checkout.staysReservationId!, { type: 'booked' });

    await registerStaysPayment(checkout.staysReservationId!, {
        amount: checkout.quote.total,
        currency: checkout.quote.currency,
        method: staysMethod,
        reference: paymentIntentId,
        notes: `Stripe PaymentIntent ${paymentIntentId} (${stripeTypeForNote})`,
    });

    const reservation = await getStaysReservation(checkout.staysReservationId!);

    checkout = await transitionState(checkoutId, CheckoutState.BOOKED, {
        actor: 'system',
        reason: 'Stays reservation confirmed',
        updates: { staysBookingCode: reservation.code },
    });

    return checkout;
}

export async function waitForConfirmation(checkoutId: string, maxWaitMs: number): Promise<Checkout> {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
        const checkout = await getCheckout(checkoutId);
        if (!checkout) throw new Error(`Checkout ${checkoutId} not found`);
        if ([CheckoutState.BOOKED, CheckoutState.FAILED, CheckoutState.EXPIRED].includes(checkout.state)) {
            return checkout;
        }
        await new Promise((r) => setTimeout(r, 1000));
    }
    const final = await getCheckout(checkoutId);
    if (!final) throw new Error(`Checkout ${checkoutId} disappeared`);
    return final;
}

export async function cancelCheckout(checkoutId: string, reason?: string): Promise<Checkout> {
    const checkout = await getCheckout(checkoutId);
    if (!checkout) throw new Error(`Checkout ${checkoutId} not found`);

    if (checkout.staysReservationId) {
        await cancelStaysReservation(checkout.staysReservationId).catch((err) => {
            console.error('[checkout] Stays cancel failed (continuing):', err);
        });
    }

    return transitionState(checkoutId, CheckoutState.CANCELED, {
        actor: 'user',
        reason: reason || 'User canceled',
    });
}

/**
 * Reconciliação de reservas Stays órfãs — varre `reservation_orphans`
 * com `resolved == false` e tenta cancelar de novo. Marca como
 * resolvido quando bem-sucedido. Usado pelo cron `/api/cron/reconcile-orphans`
 * para fechar o loop de C4 (race em createHold) e expireHolds quando
 * o cancel da Stays falhou no fluxo principal.
 */
export async function reconcileReservationOrphans(): Promise<{ resolvedCount: number; stillFailingCount: number }> {
    let resolvedCount = 0;
    let stillFailingCount = 0;

    const snapshot = await collections.reservationOrphans
        .where('resolved', '==', false)
        .limit(50)
        .get();

    for (const doc of snapshot.docs) {
        const data = doc.data() as {
            staysReservationId: string;
            reason?: string;
            attempts?: number;
        };
        const attempts = (data.attempts ?? 0) + 1;
        try {
            await cancelStaysReservation(data.staysReservationId);
            await doc.ref.update({
                resolved: true,
                resolvedAt: Timestamp.now(),
                attempts,
            });
            resolvedCount++;
        } catch (err) {
            // Se já tentou 10x sem sucesso, marca como `requiresManualReview`
            // e para de tentar — operador olha e cancela manualmente no Stays.
            const giveUp = attempts >= 10;
            await doc.ref.update({
                attempts,
                lastAttemptAt: Timestamp.now(),
                lastError: err instanceof Error ? err.message.slice(0, 500) : String(err).slice(0, 500),
                ...(giveUp && { requiresManualReview: true, resolved: true }),
            });
            console.error(`[reconcile-orphans] Stays cancel failed for ${data.staysReservationId} (attempt ${attempts}):`, err);
            stillFailingCount++;
        }
    }

    return { resolvedCount, stillFailingCount };
}

export async function expireHolds(): Promise<{ expiredCount: number; errorCount: number }> {
    const now = Timestamp.now();
    let expiredCount = 0;
    let errorCount = 0;

    for (const state of EXPIRABLE_STATES) {
        const snapshot = await collections.checkouts
            .where('state', '==', state)
            .where('holdExpiresAt', '<', now)
            .limit(100)
            .get();

        for (const doc of snapshot.docs) {
            const checkout = doc.data() as Checkout;
            try {
                if (checkout.staysReservationId) {
                    try {
                        await cancelStaysReservation(checkout.staysReservationId);
                    } catch (cancelErr) {
                        // Logamos + gravamos órfão em vez de engolir. Sem
                        // isso, calendário Stays fica preso até alguém
                        // notar manualmente.
                        console.error('[expireHolds] Stays cancel failed:', {
                            checkoutId: checkout.checkoutId,
                            staysReservationId: checkout.staysReservationId,
                            error: cancelErr instanceof Error ? cancelErr.message : String(cancelErr),
                        });
                        await collections.reservationOrphans.add({
                            staysReservationId: checkout.staysReservationId,
                            reason: 'expire-cancel-failed',
                            ownerCheckoutId: checkout.checkoutId,
                            cancelError: cancelErr instanceof Error ? cancelErr.message : String(cancelErr),
                            createdAt: Timestamp.now(),
                            resolved: false,
                        }).catch(() => null);
                    }
                }
                await transitionState(checkout.checkoutId, CheckoutState.EXPIRED, {
                    actor: 'system',
                    reason: 'Hold TTL exceeded',
                });
                expiredCount++;
            } catch (err) {
                console.error(`[expireHolds] Failed for ${checkout.checkoutId}:`, err);
                errorCount++;
            }
        }
    }

    return { expiredCount, errorCount };
}
