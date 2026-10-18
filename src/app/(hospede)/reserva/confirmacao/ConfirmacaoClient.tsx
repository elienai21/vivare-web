"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock, KeyRound, Mail, MessageCircle } from "lucide-react";
import { getCheckout } from "@/lib/api-client";
import type { Checkout } from "@/types";
import { CONTACT_EMAIL, WHATSAPP_URL } from "@/lib/constants";

const STORAGE_KEY_PREFIX = "vivare_checkout_";

/** Procura o token de sessão gravado pelo CheckoutWizard para este checkoutId. */
function findSessionToken(checkoutId: string): string | null {
    try {
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (!key || !key.startsWith(STORAGE_KEY_PREFIX)) continue;
            const raw = sessionStorage.getItem(key);
            if (!raw) continue;
            const saved = JSON.parse(raw) as { checkoutId?: string; sessionToken?: string };
            if (saved.checkoutId === checkoutId && typeof saved.sessionToken === "string") return saved.sessionToken;
        }
    } catch {
        /* sessionStorage indisponível (modo privado) */
    }
    return null;
}

const formatDate = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
};

type Status = "loading" | "booked" | "paid" | "unknown" | "failed";

export function ConfirmacaoClient() {
    const params = useSearchParams();
    const checkoutId = params.get("checkoutId");
    const [status, setStatus] = useState<Status>("loading");
    const [checkout, setCheckout] = useState<Checkout | null>(null);

    useEffect(() => {
        let cancelled = false;
        let attempts = 0;

        async function load() {
            if (!checkoutId) { setStatus("unknown"); return; }
            const token = findSessionToken(checkoutId);
            if (!token) { setStatus("unknown"); return; }
            try {
                const data = await getCheckout(checkoutId, token);
                if (cancelled) return;
                setCheckout(data);
                if (data.state === "BOOKED") setStatus("booked");
                else if (data.state === "PAID") {
                    setStatus("paid");
                    // A confirmação na Stays chega em segundos; consulta de novo algumas vezes.
                    if (attempts++ < 10) setTimeout(load, 3000);
                } else if (["FAILED", "CANCELED", "EXPIRED"].includes(data.state)) setStatus("failed");
                else setStatus("paid");
            } catch {
                if (!cancelled) setStatus("unknown");
            }
        }
        load();
        return () => { cancelled = true; };
    }, [checkoutId]);

    const whatsappHref = `${WHATSAPP_URL}?text=${encodeURIComponent(
        checkout?.staysBookingCode
            ? `Olá! Acabei de reservar pelo site (código ${checkout.staysBookingCode}).`
            : "Olá! Acabei de fazer uma reserva pelo site da Vivare."
    )}`;

    const Primary = ({ href, children }: { href: string; children: React.ReactNode }) => (
        <Link href={href} className="inline-flex min-h-12 items-center justify-center bg-ink px-6 text-xs font-bold uppercase tracking-widest text-primary-light transition-colors hover:bg-primary hover:text-ink dark:bg-parchment dark:text-ink">
            {children}
        </Link>
    );

    if (status === "loading") {
        return (
            <div role="status" className="py-20 text-center text-secondary-text">
                <Clock className="mx-auto mb-3 h-6 w-6 animate-spin" aria-hidden="true" />
                Confirmando sua reserva…
            </div>
        );
    }

    if (status === "failed") {
        return (
            <section className="mx-auto max-w-2xl">
                <h1 className="font-display text-4xl font-bold md:text-5xl">Esta reserva não foi concluída.</h1>
                <span className="gold-line" aria-hidden="true"></span>
                <p className="text-base text-secondary-text">O pagamento não foi confirmado ou a reserva expirou. Nenhum valor foi cobrado. Você pode tentar de novo ou falar com a gente.</p>
                <div className="mt-8 flex flex-wrap gap-3">
                    <Primary href="/unidades">Ver acomodações</Primary>
                    <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 border border-primary px-6 text-xs font-semibold uppercase tracking-widest text-primary-deep hover:bg-primary hover:text-ink dark:text-primary-light">
                        <MessageCircle className="h-4 w-4" aria-hidden="true" /> Falar no WhatsApp
                    </a>
                </div>
            </section>
        );
    }

    const booked = status === "booked";

    return (
        <section className="mx-auto max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary-deep dark:text-primary-light">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                {booked ? "Reserva confirmada" : "Pagamento recebido"}
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">
                {booked ? "Tudo certo. Sua estadia está reservada." : "Recebemos seu pagamento."}
            </h1>
            <span className="gold-line" aria-hidden="true"></span>
            <p className="text-base text-secondary-text">
                {booked
                    ? "Enviamos a confirmação por e-mail com todos os detalhes."
                    : status === "paid"
                        ? "Estamos registrando a reserva no nosso sistema. Isso leva alguns segundos; a confirmação chega por e-mail."
                        : "Se o pagamento foi concluído, a confirmação chega por e-mail em instantes. Qualquer dúvida, fale com a gente no WhatsApp."}
            </p>

            {checkout && (
                <dl className="mt-8 grid grid-cols-1 gap-4 rounded-2xl border border-card-border bg-card p-6 sm:grid-cols-2">
                    {checkout.staysBookingCode && (
                        <div className="sm:col-span-2">
                            <dt className="text-xs font-semibold uppercase tracking-widest text-secondary-text">Código da reserva</dt>
                            <dd className="font-display text-2xl font-bold">{checkout.staysBookingCode}</dd>
                        </div>
                    )}
                    <div className="sm:col-span-2">
                        <dt className="text-xs font-semibold uppercase tracking-widest text-secondary-text">Unidade</dt>
                        <dd className="font-semibold">{checkout.listingName ?? checkout.listingId}</dd>
                    </div>
                    <div>
                        <dt className="text-xs font-semibold uppercase tracking-widest text-secondary-text">Check-in</dt>
                        <dd className="font-semibold">{formatDate(checkout.checkIn)} · a partir das 15h</dd>
                    </div>
                    <div>
                        <dt className="text-xs font-semibold uppercase tracking-widest text-secondary-text">Check-out</dt>
                        <dd className="font-semibold">{formatDate(checkout.checkOut)} · até as 11h</dd>
                    </div>
                    <div>
                        <dt className="text-xs font-semibold uppercase tracking-widest text-secondary-text">Hóspedes</dt>
                        <dd className="font-semibold">{checkout.guests.adults + checkout.guests.children}{checkout.guests.infants > 0 ? ` (+${checkout.guests.infants} bebê${checkout.guests.infants > 1 ? "s" : ""})` : ""}</dd>
                    </div>
                    <div>
                        <dt className="text-xs font-semibold uppercase tracking-widest text-secondary-text">Total pago</dt>
                        <dd className="font-semibold tabular-nums">{checkout.quote.total.toLocaleString("pt-BR", { style: "currency", currency: checkout.quote.currency || "BRL" })}</dd>
                    </div>
                </dl>
            )}

            <h2 className="mt-10 font-display text-2xl font-bold">O que acontece agora</h2>
            <ul className="mt-4 space-y-4">
                <li className="flex gap-3">
                    <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary-deep dark:text-primary-light" aria-hidden="true" />
                    <span><strong>E-mail de confirmação</strong> com o resumo da reserva e o endereço completo.</span>
                </li>
                <li className="flex gap-3">
                    <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-primary-deep dark:text-primary-light" aria-hidden="true" />
                    <span><strong>Check-in digital</strong>: na véspera você recebe as instruções de acesso. Sem chave física, sem caução.</span>
                </li>
                <li className="flex gap-3">
                    <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-primary-deep dark:text-primary-light" aria-hidden="true" />
                    <span><strong>Precisa mudar algo?</strong> Alterações de data não têm taxa, sujeitas a disponibilidade. <Link href="/politica-de-cancelamento" className="underline underline-offset-4 decoration-primary">Política de cancelamento</Link>.</span>
                </li>
            </ul>

            <div className="mt-10 flex flex-wrap gap-3">
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 bg-ink px-6 text-xs font-bold uppercase tracking-widest text-primary-light transition-colors hover:bg-primary hover:text-ink dark:bg-parchment dark:text-ink">
                    <MessageCircle className="h-4 w-4" aria-hidden="true" /> Falar com a equipe
                </a>
                <Link href="/" className="inline-flex min-h-12 items-center border border-primary px-6 text-xs font-semibold uppercase tracking-widest text-primary-deep transition-colors hover:bg-primary hover:text-ink dark:text-primary-light">
                    Voltar ao início
                </Link>
            </div>
            <p className="mt-6 text-sm text-secondary-text">Dúvidas por e-mail: <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4">{CONTACT_EMAIL}</a></p>
        </section>
    );
}
