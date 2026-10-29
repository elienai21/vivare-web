"use client";

import { useState, useMemo, useEffect, useCallback, useId } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DatePicker, { registerLocale } from "react-datepicker";
import { ptBR } from "date-fns/locale/pt-BR";
import { CalendarDays, Loader2, MessageCircle, ShieldCheck } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";

// Register Portuguese locale for DatePicker
registerLocale("pt-BR", ptBR);

interface PriceBreakdown {
    nights: number;
    subtotal: number;
    cleaningFee: number;
    serviceFee: number;
    taxes: number;
    total: number;
    currency: string;
}

interface BookingWidgetProps {
    listingId: string;
    whatsapp: string;
    listingName: string;
    calendarData?: { date: string; avail: number | boolean; status: string }[];
    maxGuests?: number;
}

const USE_STAYS_HOSTED = process.env.NEXT_PUBLIC_USE_STAYS_HOSTED_CHECKOUT === '1';

export default function BookingWidget({ listingId, whatsapp, listingName, calendarData, maxGuests = 5 }: BookingWidgetProps) {
    const router = useRouter();
    const uid = useId();
    const [checkIn, setCheckIn] = useState<Date | null>(null);
    const [checkOut, setCheckOut] = useState<Date | null>(null);
    const [guests, setGuests] = useState("1");
    const [priceData, setPriceData] = useState<PriceBreakdown | null>(null);
    const [isPriceLoading, setIsPriceLoading] = useState(false);
    const [priceError, setPriceError] = useState(false);

    /**
     * Parseia calendarData da API Stays.net para datas bloqueadas.
     */
    const blockedDates = useMemo(() => {
        const blocked: Date[] = [];
        if (!calendarData) return blocked;
        const items = Array.isArray(calendarData) ? calendarData : [];
        items.forEach((item) => {
            if (!item.date) return;
            if (item.avail === 0 || item.avail === false || item.status === 'blocked' || item.status === 'booked') {
                const [y, m, d] = item.date.split('-').map(Number);
                blocked.push(new Date(y, m - 1, d));
            }
        });
        return blocked;
    }, [calendarData]);

    const nightsCount = checkIn && checkOut
        ? Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    const fetchPrice = useCallback(async (ci: Date, co: Date, g: string) => {
        setIsPriceLoading(true);
        setPriceError(false);
        const checkInStr = ci.toISOString().split('T')[0];
        const checkOutStr = co.toISOString().split('T')[0];
        try {
            const res = await fetch('/api/calculate-price', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listingId, checkIn: checkInStr, checkOut: checkOutStr, guests: Number(g) }),
            });
            if (!res.ok) {
                setPriceError(true);
                setPriceData(null);
                return;
            }
            const data: PriceBreakdown = await res.json();
            setPriceData(data);
        } catch {
            setPriceError(true);
            setPriceData(null);
        } finally {
            setIsPriceLoading(false);
        }
    }, [listingId]);

    useEffect(() => {
        if (!checkIn || !checkOut || nightsCount <= 0) {
            setPriceData(null);
            return;
        }
        const timer = setTimeout(() => fetchPrice(checkIn, checkOut, guests), 400);
        return () => clearTimeout(timer);
    }, [checkIn, checkOut, guests, nightsCount, fetchPrice]);

    // Roteamento do checkout:
    //   • Padrão → checkout interno em `/reserva`.
    //   • Escape hatch: `NEXT_PUBLIC_USE_STAYS_HOSTED_CHECKOUT="1"` reverte para a
    //     página hospedada da Stays sem redeploy de código.
    const handleReservar = () => {
        if (!checkIn || !checkOut) return;
        const fromStr = checkIn.toISOString().split('T')[0];
        const toStr = checkOut.toISOString().split('T')[0];

        if (USE_STAYS_HOSTED) {
            const bookingUrl = `https://vivare.stays.net/customer/pt/booking?id=${listingId}&from=${fromStr}&to=${toStr}&persons=${guests}`;
            window.open(bookingUrl, '_blank', 'noopener');
            return;
        }
        const params = new URLSearchParams({ id: listingId, from: fromStr, to: toStr, persons: guests });
        router.push(`/reserva?${params.toString()}`);
    };

    const formatBRL = (value: number) =>
        `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const ready = Boolean(checkIn && checkOut);
    const whatsappHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent(`Olá! Gostaria de mais detalhes sobre a unidade: ${listingName}`)}`;

    // No celular, o botão da barra fixa leva ao widget quando ainda não há datas.
    const scrollToWidget = () => {
        document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        document.getElementById(`${uid}-checkin`)?.focus();
    };

    const primaryButton = "inline-flex w-full min-h-12 items-center justify-center rounded-xl bg-ink px-6 text-base font-bold text-primary-light transition-colors hover:bg-primary-light hover:text-ink disabled:opacity-50 disabled:hover:bg-ink disabled:hover:text-primary-light dark:bg-parchment dark:text-ink dark:hover:bg-primary-light";

    return (
        <>
            <div id="reservar" className="md:sticky md:top-[calc(var(--header-h)+1rem)] scroll-mt-[calc(var(--header-h)+1rem)] bg-card border border-card-border shadow-xl rounded-2xl p-5 md:p-6 relative z-30 w-full text-foreground">
                {/* Cabeçalho: valor quando existe; antes disso, a instrução, não "Disponível" */}
                <div className="mb-5">
                    {priceData && !isPriceLoading && nightsCount > 0 ? (
                        <>
                            <p className="font-display text-3xl font-normal leading-none">{formatBRL(priceData.total)}</p>
                            <p className="mt-1 text-sm text-secondary-text">total para {nightsCount} noite{nightsCount !== 1 ? 's' : ''}</p>
                        </>
                    ) : (
                        <>
                            <p className="font-display text-2xl font-medium leading-tight">Escolha as datas para ver o valor</p>
                            <p className="mt-1 text-sm text-secondary-text">O calendário já mostra só os dias livres.</p>
                        </>
                    )}
                </div>

                <div className="border border-card-border rounded-xl mb-4 bg-card relative z-40">
                    <div className="grid grid-cols-2 border-b border-card-border">
                        <div className="p-3 border-r border-card-border">
                            <label htmlFor={`${uid}-checkin`} className="uppercase font-bold block mb-1 text-secondary-text text-[11px] tracking-wider">Check-in</label>
                            <DatePicker
                                id={`${uid}-checkin`}
                                selected={checkIn}
                                onChange={(date: Date | null) => {
                                    setCheckIn(date);
                                    if (date && checkOut && date >= checkOut) setCheckOut(null);
                                }}
                                selectsStart
                                startDate={checkIn}
                                endDate={checkOut}
                                minDate={new Date()}
                                excludeDates={blockedDates}
                                placeholderText="Selecionar"
                                dateFormat="dd/MM/yyyy"
                                locale="pt-BR"
                                className="w-full text-base font-semibold outline-none bg-transparent cursor-pointer text-foreground placeholder:text-secondary-text"
                                popperPlacement="bottom-start"
                            />
                        </div>
                        <div className="p-3">
                            <label htmlFor={`${uid}-checkout`} className="uppercase font-bold block mb-1 text-secondary-text text-[11px] tracking-wider">Check-out</label>
                            <DatePicker
                                id={`${uid}-checkout`}
                                selected={checkOut}
                                onChange={(date: Date | null) => setCheckOut(date)}
                                selectsEnd
                                startDate={checkIn}
                                endDate={checkOut}
                                minDate={checkIn || new Date()}
                                excludeDates={blockedDates}
                                placeholderText="Selecionar"
                                dateFormat="dd/MM/yyyy"
                                locale="pt-BR"
                                className="w-full text-base font-semibold outline-none bg-transparent cursor-pointer text-foreground placeholder:text-secondary-text"
                                popperPlacement="bottom-start"
                            />
                        </div>
                    </div>
                    <div className="p-3">
                        <label htmlFor={`${uid}-guests`} className="uppercase font-bold block mb-1 text-secondary-text text-[11px] tracking-wider">Hóspedes</label>
                        <select
                            id={`${uid}-guests`}
                            className="w-full text-base outline-none bg-transparent cursor-pointer text-foreground"
                            value={guests}
                            onChange={(e) => setGuests(e.target.value)}
                        >
                            {Array.from({ length: maxGuests }, (_, i) => i + 1).map(n => (
                                <option key={n} value={String(n)}>
                                    {n} {n === 1 ? 'hóspede' : 'hóspedes'}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {isPriceLoading && nightsCount > 0 && (
                    <div className="bg-primary-dim border border-card-border rounded-xl p-4 mb-4 flex items-center justify-center gap-2" role="status">
                        <Loader2 className="h-4 w-4 animate-spin text-primary-deep dark:text-primary-light" aria-hidden="true" />
                        <span className="text-sm text-secondary-text">Calculando valores…</span>
                    </div>
                )}

                {priceError && nightsCount > 0 && !isPriceLoading && (
                    <div className="bg-error-light border border-error/30 rounded-xl p-4 mb-4" role="alert">
                        <p className="text-sm text-error">Não conseguimos calcular o valor para essas datas. Tente outras datas ou fale conosco no WhatsApp.</p>
                    </div>
                )}

                {priceData && !isPriceLoading && nightsCount > 0 && (
                    <div className="bg-primary-dim border border-card-border rounded-xl p-4 mb-4 space-y-2 tabular-nums">
                        <div className="flex justify-between text-sm">
                            <span className="text-secondary-text">
                                {nightsCount} noite{nightsCount !== 1 ? 's' : ''} ({guests} {Number(guests) === 1 ? 'hóspede' : 'hóspedes'})
                            </span>
                            <span className="font-semibold">{formatBRL(priceData.subtotal)}</span>
                        </div>
                        {priceData.cleaningFee > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-secondary-text">Taxa de limpeza</span>
                                <span className="font-semibold">{formatBRL(priceData.cleaningFee)}</span>
                            </div>
                        )}
                        {priceData.serviceFee > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-secondary-text">Taxa de serviço</span>
                                <span className="font-semibold">{formatBRL(priceData.serviceFee)}</span>
                            </div>
                        )}
                        {priceData.taxes > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-secondary-text">Impostos</span>
                                <span className="font-semibold">{formatBRL(priceData.taxes)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm font-bold border-t border-card-border pt-2">
                            <span>Total</span>
                            <span>{formatBRL(priceData.total)}</span>
                        </div>
                        <p className="text-xs text-secondary-text mt-1">O valor é confirmado na etapa de pagamento.</p>
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleReservar}
                    disabled={!ready}
                    className={`${primaryButton} mb-3`}
                >
                    {ready ? 'Reservar' : 'Escolha as datas para reservar'}
                </button>

                {/* Vantagem do direto: onde a decisão acontece */}
                <ul className="mb-4 space-y-1.5 text-sm text-secondary-text">
                    <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-deep dark:text-primary-light" aria-hidden="true" /><span>Sem taxa de plataforma: reservar direto custa menos.</span></li>
                    <li className="flex items-start gap-2"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary-deep dark:text-primary-light" aria-hidden="true" /><span>Check-in digital, sem caução e sem fiador. <Link href="/politica-de-cancelamento" className="underline underline-offset-4 decoration-primary hover:text-foreground">Ver política de cancelamento</Link>.</span></li>
                </ul>
                <p className="mb-4 text-xs text-secondary-text">
                    {USE_STAYS_HOSTED
                        ? 'O pagamento é concluído na nossa central de reservas, em nova aba.'
                        : 'Pagamento seguro. Cupons de desconto na próxima etapa.'}
                </p>

                <div className="border-t border-card-border pt-4">
                    <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full min-h-12 items-center justify-center gap-2 rounded-xl border border-primary text-sm font-semibold text-primary-deep transition-colors hover:bg-primary-light hover:text-ink dark:text-primary-light"
                    >
                        <MessageCircle className="h-4 w-4" aria-hidden="true" />
                        Falar no WhatsApp
                    </a>
                </div>
            </div>

            {/* Barra fixa inferior no celular: o botão Reservar nunca fica a 3 telas de distância */}
            <div className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-card-border bg-card/95 backdrop-blur-md px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                        {priceData && !isPriceLoading && nightsCount > 0 ? (
                            <>
                                <p className="font-display text-xl font-medium leading-none tabular-nums">{formatBRL(priceData.total)}</p>
                                <p className="truncate text-xs text-secondary-text">{nightsCount} noite{nightsCount !== 1 ? 's' : ''} · {guests} {Number(guests) === 1 ? 'hóspede' : 'hóspedes'}</p>
                            </>
                        ) : (
                            <>
                                <p className="text-sm font-semibold leading-tight">Escolha as datas</p>
                                <p className="truncate text-xs text-secondary-text">para ver o valor total</p>
                            </>
                        )}
                    </div>
                    <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Falar no WhatsApp"
                        className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary text-primary-deep dark:text-primary-light"
                    >
                        <MessageCircle className="h-5 w-5" aria-hidden="true" />
                    </a>
                    <button
                        type="button"
                        onClick={ready ? handleReservar : scrollToWidget}
                        className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-ink px-5 text-sm font-bold text-primary-light transition-colors hover:bg-primary-light hover:text-ink dark:bg-parchment dark:text-ink"
                    >
                        {ready ? 'Reservar' : 'Ver datas'}
                    </button>
                </div>
            </div>
        </>
    );
}
