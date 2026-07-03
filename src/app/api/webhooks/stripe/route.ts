import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Timestamp } from 'firebase-admin/firestore';
import { collections } from '@/lib/firebase-admin';
import { handlePaymentSucceeded } from '@/lib/checkout-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Webhook do Stripe pode demorar (chama Stays 3x). Aumenta limit pra 30s.
export const maxDuration = 30;

let stripeInstance: Stripe | null = null;
function getStripe(): Stripe {
    if (stripeInstance) return stripeInstance;
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY env var não configurada');
    stripeInstance = new Stripe(key, { apiVersion: '2025-02-24.acacia' });
    return stripeInstance;
}

/**
 * POST /api/webhooks/stripe
 *
 * Recebe eventos do Stripe e finaliza o checkout interno:
 *   • payment_intent.succeeded → confirma reserva na Stays + registra
 *     pagamento no ledger + transiciona checkout para BOOKED.
 *   • payment_intent.payment_failed → log + opcional recovery email.
 *
 * Verificação de assinatura usa o body BRUTO (não parseado), por isso
 * lemos `request.text()` antes de qualquer JSON parsing. O endpoint é
 * idempotente: webhooks duplicados (Stripe re-envia em caso de timeout)
 * batem em `webhook_events` para deduplicar.
 */
export async function POST(request: NextRequest) {
    const signature = request.headers.get('stripe-signature');
    if (!signature) {
        return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error('[/api/webhooks/stripe] STRIPE_WEBHOOK_SECRET não configurada');
        return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Body cru — REQUIRED pra verificação de assinatura. Não use request.json().
    const rawBody = await request.text();

    const stripe = getStripe();
    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Invalid signature';
        console.error('[/api/webhooks/stripe] Signature verification failed:', message);
        return NextResponse.json({ error: message }, { status: 400 });
    }

    // Dedupe-first: reservamos o evento ANTES de rodar o handler.
    // Se o servidor crashar no meio do handler, o próximo retry do
    // Stripe encontra o doc em estado `processing` (não `processed`)
    // e pode tentar de novo após TTL. Sem isso, processamento duplicado
    // criaria 2× `registerStaysPayment` no ledger Stays (HURDLE candidato).
    const dedupeRef = collections.webhookEvents.doc(event.id);

    const reserved = await collections.webhookEvents.firestore.runTransaction(
        async (tx): Promise<'duplicate' | 'reserved' | 'in-progress'> => {
            const doc = await tx.get(dedupeRef);
            if (doc.exists) {
                const data = doc.data();
                if (data?.processed === true) return 'duplicate';

                // Outro worker pegou o evento. Stripe vai re-tentar — devolve
                // 200 pra acabar a tentativa atual e deixa o segundo worker
                // continuar. (Stripe re-envia a cada ~5min em caso de falha.)
                if (data?.processing === true) {
                    const startedAt = data.startedAt?.toMillis?.() ?? 0;
                    const ageMin = (Date.now() - startedAt) / 60_000;
                    // Se um processamento ficou "preso" há > 10min (servidor
                    // crashou), liberamos pra retry: marca como reservado
                    // pelo nosso worker.
                    if (ageMin > 10) {
                        tx.update(dedupeRef, {
                            processing: true,
                            startedAt: Timestamp.now(),
                            previousAttemptAgeMin: Math.round(ageMin),
                        });
                        return 'reserved';
                    }
                    return 'in-progress';
                }
            }
            // ttlAt = 90d. Firestore TTL apaga o doc depois — dedupe não
            // precisa de retenção longa.
            const ttlAt = Timestamp.fromMillis(Date.now() + 90 * 24 * 60 * 60 * 1000);
            tx.set(dedupeRef, {
                type: event.type,
                processing: true,
                processed: false,
                startedAt: Timestamp.now(),
                ttlAt,
            });
            return 'reserved';
        },
    );

    if (reserved === 'duplicate') {
        return NextResponse.json({ received: true, deduped: true });
    }
    if (reserved === 'in-progress') {
        // Outro worker está processando — Stripe re-tenta naturalmente.
        return NextResponse.json({ received: true, inProgress: true });
    }

    try {
        switch (event.type) {
            case 'payment_intent.succeeded': {
                const pi = event.data.object as Stripe.PaymentIntent;
                const checkoutId = pi.metadata?.checkoutId;
                if (!checkoutId) {
                    console.warn('[webhook] payment_intent.succeeded sem checkoutId nos metadata:', pi.id);
                    break;
                }
                await handlePaymentSucceeded(checkoutId, pi.id);
                break;
            }
            case 'payment_intent.payment_failed': {
                const pi = event.data.object as Stripe.PaymentIntent;
                console.warn('[webhook] payment_intent.payment_failed:', pi.id, pi.last_payment_error?.message);
                // Não transicionamos pra FAILED imediatamente: o usuário pode
                // tentar de novo. Hold expira sozinho via cron se ninguém
                // completar o pagamento.
                break;
            }
            default:
                // Outros eventos (charge.*, payment_method.*, etc.) ignoramos
                // de propósito — só nos importam as transições de PI.
                break;
        }

        // Sucesso: marca processed=true. Dedupe permanente.
        await dedupeRef.update({
            processing: false,
            processed: true,
            processedAt: Timestamp.now(),
        });

        return NextResponse.json({ received: true });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Webhook handler failed';
        console.error('[/api/webhooks/stripe] Handler error:', err);

        // Libera o lock pra retry futuro do Stripe — sem isso, ficaríamos
        // "presos" em processing até a janela de 10min expirar.
        await dedupeRef.update({
            processing: false,
            lastError: message.slice(0, 500),
            lastFailedAt: Timestamp.now(),
        }).catch((unlockErr) => {
            console.error('[webhook] Failed to release dedupe lock:', unlockErr);
        });

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
