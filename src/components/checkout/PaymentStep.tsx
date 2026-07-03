'use client';

import { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise, isStripeConfigured } from '@/lib/stripe';
import { Button } from '@/components/ui/Button';
import { Lock, Loader2, AlertCircle } from 'lucide-react';
import { trackEvent } from '@/lib/constants';
// Usually webhook handles "booked", but we might want to confirm on client or just redirect.
// Stripe confirmPayment -> return_url -> page handles success.

interface CheckoutFormProps {
    onBack: () => void;
    purchaseValue?: number;
    purchaseCurrency?: string;
    listingId?: string;
    listingName?: string;
    couponCode?: string | null;
}

function CheckoutForm({
    onBack,
    purchaseValue,
    purchaseCurrency,
    listingId,
    listingName,
    couponCode,
}: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);
        setErrorMessage(null);

        // Fire `purchase` BEFORE confirmPayment redirects away. Stripe
        // succeeds → browser navigates to return_url within the same
        // promise resolution, and on slow networks the analytics beacon
        // could be cancelled mid-flight. `sendBeacon`-style gtag is the
        // safer pattern, but firing pre-redirect is the most reliable
        // signal we have without server-side tracking.
        // Note: this fires optimistically — actual booking confirmation
        // happens via webhook on the backend. Refunds/failures should
        // be reconciled separately if Pixel/GA accuracy matters.
        trackEvent('purchase', {
            currency: purchaseCurrency || 'BRL',
            value: purchaseValue ?? 0,
            transaction_id: undefined, // unknown until webhook; checkoutId is internal
            items: listingId ? [{
                item_id: listingId,
                item_name: listingName || 'Reserva Vivare',
                quantity: 1,
            }] : undefined,
            ...(couponCode ? { coupon: couponCode } : {}),
        });

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/reserva/confirmando`, // we need to creaet this page
            },
        });

        if (error) {
            setErrorMessage(error.message || 'Ocorreu um erro no pagamento.');
            setIsProcessing(false);
        }
        // If success, it redirects.
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-bold font-display">Pagamento Seguro</h2>

            <div className="bg-white p-4 rounded-xl border border-neutral-200">
                <PaymentElement />
            </div>

            {errorMessage && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
                    {errorMessage}
                </div>
            )}

            <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={onBack} disabled={isProcessing}>
                    Voltar
                </Button>
                <Button
                    type="submit"
                    variant="premium"
                    className="flex-1 shadow-lg shadow-green-500/20 bg-green-600 hover:bg-green-700 from-green-600 to-green-700"
                    disabled={!stripe || isProcessing}
                    isLoading={isProcessing}
                >
                    <Lock className="w-4 h-4 mr-2" />
                    {isProcessing ? 'Processando...' : 'Pagar e Reservar'}
                </Button>
            </div>

            <p className="text-center text-xs text-neutral-500 mt-2">
                Seus dados de pagamento são criptografados e processados com segurança pelo Stripe.
            </p>
        </form>
    )
}

export function PaymentStep({
    clientSecret,
    onBack,
    purchaseValue,
    purchaseCurrency,
    listingId,
    listingName,
    couponCode,
}: {
    clientSecret: string | null;
    onBack: () => void;
    purchaseValue?: number;
    purchaseCurrency?: string;
    listingId?: string;
    listingName?: string;
    couponCode?: string | null;
}) {
    if (!isStripeConfigured) {
        // Quando a env `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` não está definida,
        // não temos como inicializar o Stripe. Mostramos mensagem clara em
        // vez de deixar o <Elements> renderizar vazio indefinidamente.
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center px-6">
                <AlertCircle className="w-10 h-10 text-amber-500 mb-4" aria-hidden="true" />
                <h3 className="text-lg font-semibold mb-2">Pagamento indisponível</h3>
                <p className="text-sm text-neutral-500 max-w-md">
                    A integração de pagamento não está configurada nesse ambiente.
                    Configure <code className="px-1.5 py-0.5 bg-neutral-100 rounded">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> e
                    recarregue para continuar.
                </p>
            </div>
        );
    }

    if (!clientSecret) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-4" aria-hidden="true" />
                <p className="text-neutral-500">Preparando pagamento seguro...</p>
            </div>
        );
    }

    return (
        <Elements stripe={stripePromise} options={{
            clientSecret,
            appearance: {
                theme: 'stripe',
                variables: {
                    colorPrimary: '#e85d04',
                    fontFamily: 'Inter, sans-serif',
                }
            }
        }}>
            <CheckoutForm
                onBack={onBack}
                purchaseValue={purchaseValue}
                purchaseCurrency={purchaseCurrency}
                listingId={listingId}
                listingName={listingName}
                couponCode={couponCode}
            />
        </Elements>
    );
}
