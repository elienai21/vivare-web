"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DatePicker, { registerLocale } from "react-datepicker";
import { ptBR } from "date-fns/locale/pt-BR";
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

export default function BookingWidget({ listingId, whatsapp, listingName, calendarData, maxGuests = 5 }: BookingWidgetProps) {
    const router = useRouter();
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

        items.forEach((item: { date: string; avail: number | boolean; status: string }) => {
            if (!item.date) return;

            const dateStr = item.date;

            if (item.avail === 0 || item.avail === false || item.status === 'blocked' || item.status === 'booked') {
                const [y, m, d] = dateStr.split('-').map(Number);
                blocked.push(new Date(y, m - 1, d));
            }
        });

        return blocked;
    }, [calendarData]);

    // Calcula noites
    const nightsCount = checkIn && checkOut
        ? Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    // Busca preço real da API quando datas ou hóspedes mudam
    const fetchPrice = useCallback(async (ci: Date, co: Date, g: string) => {
        setIsPriceLoading(true);
        setPriceError(false);

        const checkInStr = ci.toISOString().split('T')[0];
        const checkOutStr = co.toISOString().split('T')[0];

        try {
            const res = await fetch('/api/calculate-price', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listingId,
                    checkIn: checkInStr,
                    checkOut: checkOutStr,
                    guests: Number(g),
                }),
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

        const timer = setTimeout(() => {
            fetchPrice(checkIn, checkOut, guests);
        }, 400);

        return () => clearTimeout(timer);
    }, [checkIn, checkOut, guests, nightsCount, fetchPrice]);

    // Roteamento do checkout:
    //   • Padrão → checkout interno em `/reserva` (CheckoutWizard com cupom
    //     Vivare + Stripe + integração Stays via Next.js API routes).
    //   • Escape hatch: setar `NEXT_PUBLIC_USE_STAYS_HOSTED_CHECKOUT="1"`
    //     reverte para a página hospedada da Stays — útil pra rollback
    //     rápido sem redeploy de código se algo quebrar em produção.
    const handleReservar = () => {
        if (!checkIn || !checkOut) return;

        const fromStr = checkIn.toISOString().split('T')[0];
        const toStr = checkOut.toISOString().split('T')[0];

        const useStaysHosted = process.env.NEXT_PUBLIC_USE_STAYS_HOSTED_CHECKOUT === '1';

        if (useStaysHosted) {
            const bookingUrl = `https://vivare.stays.net/customer/pt/booking?id=${listingId}&from=${fromStr}&to=${toStr}&persons=${guests}`;
            window.open(bookingUrl, '_blank');
            return;
        }

        const params = new URLSearchParams({
            id: listingId,
            from: fromStr,
            to: toStr,
            persons: guests,
        });
        router.push(`/reserva?${params.toString()}`);
    };

    const formatBRL = (value: number) =>
        `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <div className="sticky top-24 bg-white border border-neutral-200 shadow-xl rounded-2xl p-6 relative z-30 w-full">
            {/* Header */}
            <div className="flex justify-between items-end mb-6">
                <div>
                    <span className="text-2xl font-bold text-primary-600">Disponível</span>
                </div>
            </div>

            <div className="border border-neutral-300 rounded-xl mb-4 bg-white relative z-40">
                <div className="grid grid-cols-2 border-b border-neutral-300 relative z-50">
                    <div className="p-3 border-r border-neutral-300 h-14 relative z-50">
                        <label className="uppercase font-bold block mb-1 text-neutral-800 text-[10px]">Check-in</label>
                        <DatePicker
                            selected={checkIn}
                            onChange={(date: Date | null) => {
                                setCheckIn(date);
                                if (date && checkOut && date >= checkOut) {
                                    setCheckOut(null);
                                }
                            }}
                            selectsStart
                            startDate={checkIn}
                            endDate={checkOut}
                            minDate={new Date()}
                            excludeDates={blockedDates}
                            placeholderText="Selecione"
                            dateFormat="dd/MM/yyyy"
                            locale="pt-BR"
                            className="w-full text-sm font-semibold outline-none bg-transparent cursor-pointer text-neutral-800"
                            popperPlacement="bottom-start"
                        />
                    </div>
                    <div className="p-3 h-14 relative z-50">
                        <label className="uppercase font-bold block mb-1 text-neutral-800 text-[10px]">Check-out</label>
                        <DatePicker
                            selected={checkOut}
                            onChange={(date: Date | null) => setCheckOut(date)}
                            selectsEnd
                            startDate={checkIn}
                            endDate={checkOut}
                            minDate={checkIn || new Date()}
                            excludeDates={blockedDates}
                            placeholderText="Selecione"
                            dateFormat="dd/MM/yyyy"
                            locale="pt-BR"
                            className="w-full text-sm font-semibold outline-none bg-transparent cursor-pointer text-neutral-800"
                            popperPlacement="bottom-start"
                        />
                    </div>
                </div>
                <div className="p-3 border-b-0 relative z-30">
                    <label className="uppercase font-bold block mb-1 text-neutral-800 text-[10px]">Hóspedes</label>
                    <select
                        className="w-full text-sm outline-none bg-transparent cursor-pointer text-neutral-600"
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

            {/* Loading state */}
            {isPriceLoading && nightsCount > 0 && (
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 mb-4 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-neutral-300 border-t-primary-600 rounded-full animate-spin" />
                    <span className="text-sm text-neutral-500">Calculando valores...</span>
                </div>
            )}

            {/* Price error */}
            {priceError && nightsCount > 0 && !isPriceLoading && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                    <p className="text-sm text-red-600">Não foi possível calcular o preço. Tente outras datas.</p>
                </div>
            )}

            {/* Resumo com breakdown completo */}
            {priceData && !isPriceLoading && nightsCount > 0 && (
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 mb-4 space-y-2">
                    {/* Diárias */}
                    <div className="flex justify-between text-sm">
                        <span className="text-neutral-600">
                            {nightsCount} noite{nightsCount !== 1 ? 's' : ''} ({guests} {Number(guests) === 1 ? 'hóspede' : 'hóspedes'})
                        </span>
                        <span className="font-semibold text-neutral-900">{formatBRL(priceData.subtotal)}</span>
                    </div>

                    {/* Taxa de limpeza */}
                    {priceData.cleaningFee > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-neutral-600">Taxa de limpeza</span>
                            <span className="font-semibold text-neutral-900">{formatBRL(priceData.cleaningFee)}</span>
                        </div>
                    )}

                    {/* Taxa de serviço */}
                    {priceData.serviceFee > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-neutral-600">Taxa de serviço</span>
                            <span className="font-semibold text-neutral-900">{formatBRL(priceData.serviceFee)}</span>
                        </div>
                    )}

                    {/* Impostos */}
                    {priceData.taxes > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-neutral-600">Impostos</span>
                            <span className="font-semibold text-neutral-900">{formatBRL(priceData.taxes)}</span>
                        </div>
                    )}

                    {/* Total */}
                    <div className="flex justify-between text-sm font-bold border-t border-neutral-200 pt-2">
                        <span>Total</span>
                        <span className="text-primary-600">{formatBRL(priceData.total)}</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1">* O valor final será confirmado no checkout.</p>
                </div>
            )}

            <div className="text-center text-xs text-neutral-500 mb-4 font-medium">
                Pagamento seguro com Stripe. Aplique cupons de desconto no próximo passo.
            </div>

            <button
                type="button"
                onClick={handleReservar}
                disabled={!checkIn || !checkOut}
                className={`w-full rounded-xl py-3.5 text-base font-bold transition-all mb-4 ${checkIn && checkOut
                    ? 'bg-[#e31c5f] hover:bg-[#c21550] text-white shadow-lg shadow-[#e31c5f]/20 cursor-pointer'
                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    }`}
            >
                {checkIn && checkOut ? 'Reservar' : 'Selecione as datas'}
            </button>

            <div className="border-t pt-4">
                <a
                    href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Olá! Gostaria de mais detalhes sobre a unidade: ${listingName}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary bg-white w-full py-3 flex items-center justify-center gap-2"
                >
                    <span>Falar no WhatsApp</span>
                </a>
            </div>
        </div>
    );
}
