import { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import { Button } from '@/components/ui/Button';
import { Lock, Loader2 } from 'lucide-react';
// Usually webhook handles "booked", but we might want to confirm on client or just redirect.
// Stripe confirmPayment -> return_url -> page handles success.

function CheckoutForm({ onBack }: { onBack: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);
        setErrorMessage(null);

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

export function PaymentStep({ clientSecret, onBack }: {
    clientSecret: string | null;
    onBack: () => void;
}) {
    if (!clientSecret) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-4" />
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
            <CheckoutForm onBack={onBack} />
        </Elements>
    );
}
