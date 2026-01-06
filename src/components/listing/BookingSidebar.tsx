'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { Loader2, AlertCircle } from 'lucide-react';
import { ListingDetail, Quote, Guests, CalendarDay } from '@/types';
import { calculatePrice } from '@/lib/api-client';
import { DateRangePicker } from '@/components/listing/DateRangePicker';
import { GuestSelector } from '@/components/listing/GuestSelector';
import { Button } from '@/components/ui/Button';
// I'll remove it from global import if I can find it used later...
// Actually I'll check usages first. It seems I didn't use cn in BookingSidebar.

interface BookingSidebarProps {
    listing: ListingDetail;
    calendarData?: CalendarDay[];
}

export function BookingSidebar({ listing, calendarData = [] }: BookingSidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize state from URL params or defaults
    const [dates, setDates] = useState<[Date | null, Date | null]>([
        searchParams.get('checkIn') ? parseISO(searchParams.get('checkIn')!) : null,
        searchParams.get('checkOut') ? parseISO(searchParams.get('checkOut')!) : null,
    ]);

    const [guests, setGuests] = useState<Guests>({
        adults: Number(searchParams.get('guests')) || 1,
        children: 0,
        infants: 0,
    });

    const [quote, setQuote] = useState<Quote | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Calculate price effect
    useEffect(() => {
        const [checkIn, checkOut] = dates;

        if (checkIn && checkOut) {
            const timer = setTimeout(async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const result = await calculatePrice({
                        listingId: listing.id,
                        checkIn: format(checkIn, 'yyyy-MM-dd'),
                        checkOut: format(checkOut, 'yyyy-MM-dd'),
                        guests: guests.adults + guests.children,
                    });
                    setQuote(result);
                } catch {
                    // console.error(err); // Avoid console spam in production
                    setError('Erro ao calcular preço. Selecione outras datas.');
                    setQuote(null);
                } finally {
                    setIsLoading(false);
                }
            }, 500); // 500ms debounce

            return () => clearTimeout(timer);
        } else {
            setQuote(null);
        }
    }, [dates, guests, listing.id]);

    const handleBook = () => {
        if (!dates[0] || !dates[1]) return;

        const params = new URLSearchParams({
            listingId: listing.id,
            checkIn: format(dates[0], 'yyyy-MM-dd'),
            checkOut: format(dates[1], 'yyyy-MM-dd'),
            guests: String(guests.adults + guests.children),
        });

        router.push(`/checkout/${listing.id}?${params.toString()}`);
    };

    return (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-xl border border-neutral-200 dark:border-neutral-800 sticky top-24">
            {/* Header Price */}
            <div className="flex justify-between items-end mb-6">
                <div>
                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                        R$ {(listing.pricePerNight || 0).toLocaleString('pt-BR')}
                    </span>
                    <span className="text-neutral-500 text-sm"> / noite</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-neutral-500">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-300">★ 5.0</span>
                    <span>(3 reviews)</span>
                </div>
            </div>

            {/* Inputs */}
            <div className="flex flex-col gap-4 mb-6">
                {/* Dates */}
                <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
                    <div className="bg-neutral-50 dark:bg-neutral-800 px-4 py-2 border-b border-neutral-200 dark:border-neutral-700 text-xs font-semibold uppercase text-neutral-500 tracking-wider">
                        Datas
                    </div>
                    <DateRangePicker
                        listingId={listing.id}
                        checkIn={dates[0]}
                        checkOut={dates[1]}
                        onDatesChange={setDates}
                        calendarData={calendarData}
                        minDate={new Date()}
                        inline={false} // Would show as inputs/popover
                    />
                </div>

                {/* Guests */}
                <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
                    <div className="bg-neutral-50 dark:bg-neutral-800 px-4 py-2 border-b border-neutral-200 dark:border-neutral-700 text-xs font-semibold uppercase text-neutral-500 tracking-wider">
                        Hóspedes
                    </div>
                    <GuestSelector
                        guests={guests}
                        onChange={setGuests}
                        maxGuests={listing.maxGuests}
                    />
                </div>
            </div>

            {/* Quote Breakdown */}
            {isLoading && (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 mb-4">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {quote && !isLoading && (
                <div className="space-y-3 mb-6 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                        <span className="underline">R$ {listing.pricePerNight?.toLocaleString('pt-BR')} x {quote.nights} noites</span>
                        <span>R$ {quote.breakdown.subtotal.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                        <span className="underline">Taxa de limpeza</span>
                        <span>R$ {quote.breakdown.cleaningFee.toLocaleString('pt-BR')}</span>
                    </div>
                    {quote.breakdown.serviceFee > 0 && (
                        <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                            <span className="underline">Taxa de serviço</span>
                            <span>R$ {quote.breakdown.serviceFee.toLocaleString('pt-BR')}</span>
                        </div>
                    )}
                    <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700 flex justify-between font-bold text-lg text-neutral-900 dark:text-white">
                        <span>Total</span>
                        <span>R$ {quote.total.toLocaleString('pt-BR')}</span>
                    </div>
                </div>
            )}

            {/* Action Button */}
            <Button
                size="lg"
                variant="premium"
                className="w-full h-14 text-lg shadow-xl shadow-orange-500/20"
                onClick={handleBook}
                disabled={!quote || isLoading}
            >
                {isLoading ? 'Calculando...' : 'Reservar'}
            </Button>

            <p className="text-center text-xs text-neutral-500 mt-4">
                Você não será cobrado ainda.
            </p>
        </div>
    );
}
