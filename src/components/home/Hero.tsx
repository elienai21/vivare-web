'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { LocationFilter } from '@/components/listing/LocationFilter';
import { DateRangePicker } from '@/components/listing/DateRangePicker';
import { GuestSelector } from '@/components/listing/GuestSelector';
import { Button } from '@/components/ui/Button';
import { Guests } from '@/types';
import { format } from 'date-fns';

export function Hero() {
    const router = useRouter();
    const [location, setLocation] = useState('');
    const [dates, setDates] = useState<[Date | null, Date | null]>([null, null]);
    const [guests, setGuests] = useState<Guests>({
        adults: 1,
        children: 0,
        infants: 0,
    });

    const handleSearch = () => {
        const params = new URLSearchParams();

        if (location) params.set('location', location);
        if (dates[0]) params.set('checkIn', format(dates[0], 'yyyy-MM-dd'));
        if (dates[1]) params.set('checkOut', format(dates[1], 'yyyy-MM-dd'));

        const totalGuests = guests.adults + guests.children;
        if (totalGuests > 1) params.set('guests', String(totalGuests));

        router.push(`/acomodacoes?${params.toString()}`);
    };

    return (
        <section className="relative h-[85vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://images.unsplash.com/photo-1449156493391-d2cfa28e468b?q=80&w=2070&auto=format&fit=crop"
                    alt="Luxury Vacation Rental"
                    fill
                    className="object-cover"
                    priority
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+ZNPQAIXwM498u7eQAAAABJRU5ErkJggg=="
                />
                {/* Gradient Overlay - Strengthened for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-7xl px-6 flex flex-col items-center text-center">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6 drop-shadow-lg max-w-4xl tracking-tight">
                    Sua experiência premium <br /> começa aqui
                </h1>
                <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl font-light drop-shadow-md">
                    Aluguel de temporada com curadoria exclusiva e serviço de concierge em destinos únicos.
                </p>

                {/* Search Bar */}
                <div className="w-full max-w-5xl bg-white/95 backdrop-blur-sm rounded-3xl p-4 shadow-2xl border border-white/20">
                    <div className="flex flex-col lg:flex-row items-center gap-4">

                        {/* Location */}
                        <div className="w-full lg:flex-1 relative z-30">
                            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 ml-3 text-left">
                                Destino
                            </label>
                            <LocationFilter
                                value={location}
                                onChange={setLocation}
                                className="w-full"
                                placeholder="Para onde você vai?"
                            />
                        </div>

                        <div className="hidden lg:block w-px h-12 bg-neutral-200" />

                        {/* Dates */}
                        <div className="w-full lg:flex-[1.2] relative z-20">
                            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 ml-3 text-left">
                                Datas
                            </label>
                            <div className="w-full">
                                <DateRangePicker
                                    listingId="search" // Dummy ID for search context
                                    checkIn={dates[0]}
                                    checkOut={dates[1]}
                                    onDatesChange={setDates}
                                    months={2}
                                />
                            </div>
                        </div>

                        <div className="hidden lg:block w-px h-12 bg-neutral-200" />

                        {/* Guests */}
                        <div className="w-full lg:flex-1 relative z-10">
                            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 ml-3 text-left">
                                Hóspedes
                            </label>
                            <GuestSelector
                                guests={guests}
                                onChange={setGuests}
                                maxGuests={20}
                            />
                        </div>

                        {/* Search Button */}
                        <div className="w-full lg:w-auto mt-2 lg:mt-6">
                            <Button
                                onClick={handleSearch}
                                size="lg"
                                variant="premium"
                                className="w-full lg:w-auto rounded-2xl md:px-8 h-[60px] shadow-xl shadow-orange-500/20"
                            >
                                <Search className="w-5 h-5 mr-2" />
                                Buscar
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
