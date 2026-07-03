import { loadStripe, type Stripe } from '@stripe/stripe-js';

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

/**
 * Promise singleton para o SDK Stripe.js.
 *
 * Defensivo de propósito: `loadStripe()` chama `key.match(...)` internamente
 * e estoura com "Cannot read properties of undefined (reading 'match')"
 * quando a env var não está setada — o que derruba a página /reserva
 * inteira em dev. Aqui retornamos `Promise<null>` quando não há chave,
 * deixando o `<Elements>` mostrar estado vazio em vez de crashar.
 *
 * Em produção, garanta `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` setada na
 * Vercel (use `pk_test_...` em Preview e `pk_live_...` em Production).
 */
export const stripePromise: Promise<Stripe | null> = PUBLISHABLE_KEY
    ? loadStripe(PUBLISHABLE_KEY)
    : Promise.resolve(null);

/** True quando o Stripe está configurado e pronto pra rodar. */
export const isStripeConfigured = Boolean(PUBLISHABLE_KEY);
