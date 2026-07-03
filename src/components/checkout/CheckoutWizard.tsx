'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Quote, Guests, GuestInfo, ListingDetail, Checkout } from '@/types';
import { Steps } from './Steps';
import { SummaryStep } from './SummaryStep';
import { GuestStep } from './GuestStep';
import { PaymentStep } from './PaymentStep';
import { initializeCheckout, updateGuestInfo, createHold, createPaymentIntent, getCheckout, calculatePrice } from '@/lib/api-client';
import { Loader2 } from 'lucide-react';
import { trackEvent } from '@/lib/constants';

interface CheckoutWizardProps {
    listing: ListingDetail;
    initialQuote?: Quote;
    checkIn: string;
    checkOut: string;
    guests: Guests;
}

const STORAGE_KEY_PREFIX = 'vivare_checkout_';
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

export function CheckoutWizard({
    listing,
    initialQuote,
    checkIn,
    checkOut,
    guests: initialGuests
}: CheckoutWizardProps) {
    const router = useRouter();
    // Default to Step 1, but will be updated by backend state if restoring
    const [currentStep, setCurrentStep] = useState(1);

    // Guests come from props (search params), so we keep them as is.
    const [guests] = useState<Guests>(initialGuests);

    // Guest Info is kept in memory only (LGPD compliance)
    const [guestInfo, setGuestInfo] = useState<GuestInfo | null>(null);

    // Sensitive ephemeral state
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [checkoutId, setCheckoutId] = useState<string | null>(null);
    /**
     * Session token devolvido pelo backend no `initialize`. Necessário em
     * todas as chamadas subsequentes (header `X-Checkout-Session`). Vive
     * em sessionStorage junto com o `checkoutId` — escopo por aba.
     */
    const [sessionToken, setSessionToken] = useState<string | null>(null);

    // Quote state — refreshed when coupon applied/removed
    const [currentQuote, setCurrentQuote] = useState<Quote | null>(initialQuote ?? null);
    const [couponCode, setCouponCode] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isRecovering, setIsRecovering] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Prevent double-init and manage retry loops
    const initialized = useRef(false);
    const recoveryAttempts = useRef(0);

    // =========================================================================
    // 1. Initialization & Recovery (Backend First)
    // =========================================================================
    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const loadState = async () => {
            try {
                // Use Session Storage for ephemeral state (ID + Context only)
                const storageKey = `${STORAGE_KEY_PREFIX}${listing.id}`;
                const savedRaw = sessionStorage.getItem(storageKey);
                let savedId: string | null = null;

                let savedToken: string | null = null;
                if (savedRaw) {
                    const saved = JSON.parse(savedRaw);
                    const now = Date.now();

                    // Validate context matches current search AND TTL is valid
                    if (
                        saved.checkIn === checkIn &&
                        saved.checkOut === checkOut &&
                        (now - saved.timestamp < SESSION_TTL_MS) &&
                        typeof saved.sessionToken === 'string'
                    ) {
                        savedId = saved.checkoutId;
                        savedToken = saved.sessionToken;
                    } else {
                        // Invalid or stale, plain cleanup
                        sessionStorage.removeItem(storageKey);
                    }
                }

                if (!savedId || !savedToken) {
                    // No valid saved session, start fresh at Step 1
                    setIsLoading(false);
                    return;
                }

                setCheckoutId(savedId);
                setSessionToken(savedToken);

                // Fetch latest state from backend (Source of Truth)
                const checkout = await getCheckout(savedId, savedToken);

                // Derive Step and handle Redirects based on Backend State
                await handleStateTransition(checkout, savedToken);

            } catch (err) {
                console.error("Failed to restore checkout state:", err);
                // On critical failure reading state, clear and start fresh
                sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}${listing.id}`);
                setIsLoading(false);
            }
        };

        loadState();
    }, [listing.id, checkIn, checkOut, router]);

    // Helper to transition UI based on CheckoutStateMachine
    const handleStateTransition = async (checkout: Checkout, token: string) => {
        // Terminal States -> Redirect
        if (checkout.state === 'PAID') {
            router.replace(`/reserva/confirmando?checkoutId=${checkout.checkoutId}`);
            return;
        }
        if (checkout.state === 'BOOKED') {
            router.replace(`/reserva/confirmada?checkoutId=${checkout.checkoutId}`);
            return;
        }
        // Failure/Expiry States -> Reset
        if (['EXPIRED', 'CANCELED', 'FAILED'].includes(checkout.state)) {
            sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}${listing.id}`);
            setCheckoutId(null);
            setCurrentStep(1);
            setIsLoading(false);
            setError('Sua sessão anterior expirou ou foi cancelada. Por favor, comece novamente.');
            return;
        }

        // Active States -> Derive Step
        if (['HOLD_CREATED', 'PAYMENT_CREATED'].includes(checkout.state)) {
            setCurrentStep(3);

            // If we are already at payment creation, ensure we have the client secret
            if (checkout.state === 'PAYMENT_CREATED') {
                // We don't have clientSecret in memory after refresh/re-load, so we recover it
                await recoverPaymentSession(checkout.checkoutId, token);
                // recoverPaymentSession handles its own loading state finalization
            } else {
                // Just Hold created, waiting to likely create Payment Intent (user clicks next, but here we are restoring)
                // Auto-healing: Try to recover PI creates it if not exists.
                await recoverPaymentSession(checkout.checkoutId, token);
            }
        } else if (['INITIATED'].includes(checkout.state)) {
            // Initiated means we have an ID, likely user was at Guest Step or just started.
            setCurrentStep(2);
            setIsLoading(false);
        } else {
            // Default fallback
            setIsLoading(false);
        }
    };

    const recoverPaymentSession = async (cId: string, token: string) => {
        if (isRecovering) return;

        // Loop Guard
        if (recoveryAttempts.current >= 2) {
            console.warn("Max recovery attempts reached for payment session.");
            setError("Não foi possível carregar o formulário de pagamento. Por favor, tente novamente ou contate o suporte.");
            setIsLoading(false);
            return;
        }

        setIsRecovering(true);
        recoveryAttempts.current += 1;

        try {
            // IDEMPOTENCY: Use stable key 'pi:<checkoutId>'
            // This ensures if PI exists, we get the same one (client_secret recovery).
            // If it doesn't exist (e.g. state was HOLD_CREATED), it creates one.
            const paymentKey = `pi:${cId}`;
            const { clientSecret: secret } = await createPaymentIntent(cId, token, paymentKey);
            setClientSecret(secret);
        } catch (err: unknown) {
            console.error("Failed to recover payment session", err);
            // Don't show critical error on first fail, might be transient
            setError("Houve um problema ao carregar o pagamento. Tente recarregar.");
        } finally {
            setIsRecovering(false);
            setIsLoading(false);
        }
    };

    // =========================================================================
    // 2. Storage Management (Minimal Non-PII)
    // =========================================================================
    // sessionStorage = scope da aba. PII jamais persistida — apenas
    // identificadores opacos (checkoutId UUID + sessionToken hex).
    useEffect(() => {
        if (checkoutId && sessionToken) {
            const data = {
                checkoutId,
                sessionToken,
                checkIn,
                checkOut,
                timestamp: Date.now()
            };
            sessionStorage.setItem(`${STORAGE_KEY_PREFIX}${listing.id}`, JSON.stringify(data));
        }
    }, [checkoutId, sessionToken, listing.id, checkIn, checkOut]);

    // =========================================================================
    // 3. User Actions
    // =========================================================================

    const totalGuests = guests.adults + guests.children;

    const handleApplyCoupon = async (code: string): Promise<{ ok: boolean; error?: string }> => {
        const normalized = code.trim().toUpperCase();
        if (!normalized) return { ok: false, error: 'Digite um código.' };
        try {
            const newQuote = await calculatePrice({
                listingId: listing.id,
                checkIn,
                checkOut,
                guests: totalGuests,
                couponCode: normalized,
            });
            const applied = newQuote.breakdown?.appliedCouponCode || normalized;
            const discount = newQuote.breakdown?.discountAmount ?? 0;
            // Stays may silently ignore an invalid coupon and return the same total.
            // If there's no breakdown.appliedCouponCode AND no discount, treat as invalid.
            if (!newQuote.breakdown?.appliedCouponCode && discount <= 0) {
                trackEvent('coupon_invalid', { code: normalized });
                return { ok: false, error: 'Cupom inválido ou não aplicável.' };
            }
            setCurrentQuote(newQuote);
            setCouponCode(applied);
            trackEvent('coupon_applied', { code: applied });
            return { ok: true };
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Não foi possível validar o cupom.';
            trackEvent('coupon_invalid', { code: normalized });
            return { ok: false, error: msg };
        }
    };

    const handleRemoveCoupon = async () => {
        const previous = couponCode;
        setCouponCode(null);
        try {
            const baseQuote = await calculatePrice({
                listingId: listing.id,
                checkIn,
                checkOut,
                guests: totalGuests,
            });
            setCurrentQuote(baseQuote);
        } catch {
            // Fall back to initialQuote if recalculation fails
            setCurrentQuote(initialQuote ?? null);
        }
        if (previous) trackEvent('coupon_removed', { code: previous });
    };

    const handleGuestSubmit = async (info: GuestInfo) => {
        if (isLoading) return;
        setIsLoading(true);
        setError(null);

        try {
            setGuestInfo(info);

            // 1. Initialize Checkout (or use existing). Captura também o
            //    sessionToken retornado — necessário em todas as chamadas
            //    subsequentes desse checkout.
            let cId = checkoutId;
            let token = sessionToken;
            if (!cId || !token) {
                const checkout = await initializeCheckout({
                    listingId: listing.id,
                    checkIn,
                    checkOut,
                    guests: guests,
                    ...(couponCode ? { couponCode } : {}),
                });
                cId = checkout.checkoutId;
                token = checkout.sessionToken;
                setCheckoutId(cId);
                setSessionToken(token);

                // Funnel: a real checkout was created on the backend with
                // guest info attached. Fire `begin_checkout` (GA4 standard,
                // mapped to `InitiateCheckout` for Meta).
                trackEvent('begin_checkout', {
                    currency: currentQuote?.currency || 'BRL',
                    value: currentQuote?.total ?? 0,
                    items: [{
                        item_id: listing.id,
                        item_name: listing.name,
                        quantity: 1,
                    }],
                    ...(couponCode ? { coupon: couponCode } : {}),
                });
            }

            // 2. Update Guest Info (PII sent to backend only)
            // Even if ID existed, we update guest info as they might have changed it
            await updateGuestInfo(cId, token, info);

            // 3. Create Hold
            // IDEMPOTENCY: Stable Key for Hold 'hold:<id>'
            const holdKey = `hold:${cId}`;
            await createHold(cId, token, holdKey);

            // 4. Create Payment Intent
            // IDEMPOTENCY: Stable Key for PI 'pi:<id>'
            const paymentKey = `pi:${cId}`;
            const { clientSecret: secret } = await createPaymentIntent(cId, token, paymentKey);

            setClientSecret(secret);
            setCurrentStep(3);

            // Funnel: payment form is being shown to the user. Maps to
            // GA4 `add_payment_info` and Meta `AddPaymentInfo`.
            trackEvent('add_payment_info', {
                currency: currentQuote?.currency || 'BRL',
                value: currentQuote?.total ?? 0,
                ...(couponCode ? { coupon: couponCode } : {}),
            });
        } catch (err: unknown) {
            console.error('Checkout error:', err);
            const msg = err instanceof Error ? err.message : 'Não foi possível iniciar a reserva. Verifique sua conexão.';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    // =========================================================================
    // 4. Render
    // =========================================================================

    // Initial Loading State
    if (isLoading && !checkoutId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] animate-in fade-in py-12">
                <Loader2 className="w-12 h-12 animate-spin text-primary-500 mb-4" />
                <p className="text-neutral-500">Iniciando checkout seguro...</p>
            </div>
        );
    }

    // Recovery State (Step 3 but no client secret yet)
    // Should be blocking to prevent empty Payment Element
    if (isLoading && currentStep === 3 && !clientSecret && !error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] animate-in fade-in py-12">
                <Loader2 className="w-12 h-12 animate-spin text-primary-500 mb-4" />
                <p className="text-neutral-500">Recuperando sessão de pagamento...</p>
            </div>
        );
    }

    // Transition State (Step 2 -> 3)
    if (isLoading && currentStep === 2 && guestInfo) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] animate-in fade-in py-12">
                <Loader2 className="w-12 h-12 animate-spin text-primary-500 mb-4" />
                <h3 className="text-xl font-semibold font-display">Confirmando disponibilidade...</h3>
                <p className="text-neutral-500">Estamos bloqueando suas datas com segurança.</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex justify-between items-center animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">Erro:</span>
                        <span>{error}</span>
                    </div>
                    <button onClick={() => { setError(null); setIsLoading(false); }} className="text-sm font-bold underline hover:text-red-800">Fechar</button>
                </div>
            )}

            <Steps currentStep={currentStep} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-8">
                {/* Main Step Content */}
                <div className="lg:col-span-2">
                    {currentStep === 1 && (
                        <SummaryStep
                            listing={listing}
                            checkIn={checkIn}
                            checkOut={checkOut}
                            guests={guests}
                            quote={currentQuote}
                            appliedCouponCode={couponCode}
                            onApplyCoupon={handleApplyCoupon}
                            onRemoveCoupon={handleRemoveCoupon}
                            onContinue={() => setCurrentStep(2)}
                        />
                    )}

                    {currentStep === 2 && (
                        <GuestStep
                            initialInfo={guestInfo}
                            onSubmit={handleGuestSubmit}
                            onBack={() => setCurrentStep(1)}
                            isLoading={isLoading}
                        />
                    )}

                    {currentStep === 3 && (
                        <PaymentStep
                            clientSecret={clientSecret}
                            onBack={() => setCurrentStep(2)}
                            purchaseValue={currentQuote?.total}
                            purchaseCurrency={currentQuote?.currency}
                            listingId={listing.id}
                            listingName={listing.name}
                            couponCode={couponCode}
                        />
                    )}
                </div>

                {/* Sidebar Summary (Right) */}
                <div className="hidden lg:block lg:col-span-1">
                    <div className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 sticky top-24">
                        <div className="flex gap-4 mb-6">
                            {listing.thumbnail && (
                                <div className="relative w-20 h-20 flex-shrink-0">
                                    <Image
                                        src={listing.thumbnail}
                                        alt={listing.name}
                                        fill
                                        className="object-cover rounded-lg"
                                        sizes="80px"
                                    />
                                </div>
                            )}
                            <div>
                                <h4 className="font-semibold text-sm line-clamp-2">{listing.name}</h4>
                                <p className="text-xs text-neutral-500 mt-1">
                                    {listing.address.neighborhood}, {listing.address.city}
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-neutral-200 dark:border-neutral-700 py-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Datas</span>
                                <span className="font-medium">
                                    {checkIn.split('-').reverse().slice(0, 2).join('/')} - {checkOut.split('-').reverse().slice(0, 2).join('/')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Hóspedes</span>
                                <span className="font-medium">
                                    {guests.adults + guests.children}
                                    {guests.infants > 0 && ` (+${guests.infants} bebês)`}
                                </span>
                            </div>
                        </div>

                        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4 space-y-1.5 text-sm">
                            {currentQuote?.breakdown?.discountAmount && currentQuote.breakdown.discountAmount > 0 && (
                                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                                    <span>
                                        Desconto
                                        {currentQuote.breakdown.appliedCouponCode && (
                                            <span className="ml-1 font-mono uppercase text-xs">
                                                ({currentQuote.breakdown.appliedCouponCode})
                                            </span>
                                        )}
                                    </span>
                                    <span>
                                        -{currentQuote.breakdown.discountAmount.toLocaleString('pt-BR', {
                                            style: 'currency',
                                            currency: currentQuote.currency || 'BRL',
                                        })}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total estimado</span>
                                <span>
                                    {currentQuote
                                        ? currentQuote.total.toLocaleString('pt-BR', {
                                              style: 'currency',
                                              currency: currentQuote.currency || 'BRL',
                                          })
                                        : '(Confirmado no passo 1)'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
