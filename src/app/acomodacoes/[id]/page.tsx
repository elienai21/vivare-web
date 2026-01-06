import { notFound } from 'next/navigation';
import { getListingDetail, getListingCalendar } from '@/lib/api-client';
import { PhotoGallery } from '@/components/listing/PhotoGallery';
import { BookingSidebar } from '@/components/listing/BookingSidebar';
import { Amenities } from '@/components/listing/Amenities';
import { MapPin, User, Shield, Star } from 'lucide-react';
import { Metadata } from 'next';

async function getListing(id: string) {
    try {
        return await getListingDetail(id);
    } catch {
        return null;
    }
}

async function getCalendar(id: string) {
    try {
        const today = new Date();
        const future = new Date();
        future.setMonth(today.getMonth() + 12);
        // Fetch 12 months roughly
        return await getListingCalendar(
            id,
            today.toISOString().split('T')[0],
            future.toISOString().split('T')[0]
        );
    } catch {
        return { listingId: id, days: [] };
    }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const listing = await getListing(params.id);
    if (!listing) return { title: 'Acomodação não encontrada' };

    return {
        title: `${listing.name} | Vivare Premium`,
        description: listing.description?.slice(0, 160),
        openGraph: {
            images: listing.thumbnail ? [listing.thumbnail] : [],
        },
    };
}

export default async function ListingPage({ params }: { params: { id: string } }) {
    const listing = await getListing(params.id);

    if (!listing) {
        notFound();
    }

    // Parallel data fetching for calendar
    const calendarData = await getCalendar(params.id);

    return (
        <main className="min-h-screen bg-white dark:bg-black py-8 md:py-12">
            <div className="max-w-7xl mx-auto px-4 md:px-6">

                {/* Header (Mobile) */}
                <div className="md:hidden mb-6">
                    <h1 className="text-2xl font-display font-bold text-neutral-900 dark:text-white mb-2">{listing.name}</h1>
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <Star className="w-4 h-4 fill-primary-500 text-primary-500" />
                        <span className="font-semibold text-neutral-900 dark:text-neutral-200">5.0</span>
                        <span>·</span>
                        <span className="underline">3 comentários</span>
                        <span>·</span>
                        <span>{listing.address.city}, {listing.address.state}</span>
                    </div>
                </div>

                {/* Gallery */}
                <div className="mb-12">
                    <PhotoGallery photos={listing.photos} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Main Content (Left) */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Header (Desktop) */}
                        <div className="hidden md:block pb-8 border-b border-neutral-200 dark:border-neutral-800">
                            <h1 className="text-4xl font-display font-bold text-neutral-900 dark:text-white mb-4">
                                {listing.name}
                            </h1>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1 font-medium">
                                        <Star className="w-4 h-4 fill-primary-500 text-primary-500" />
                                        <span>5.0</span>
                                        <span className="text-neutral-500 font-normal"> (3 comentários)</span>
                                    </div>
                                    <span className="text-neutral-300">|</span>
                                    <div className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
                                        <MapPin className="w-4 h-4" />
                                        <span>{listing.address.neighborhood}, {listing.address.city}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Host / Stats */}
                        <div className="flex justify-between items-center pb-8 border-b border-neutral-200 dark:border-neutral-800">
                            <div className="flex gap-6 text-neutral-900 dark:text-white font-medium">
                                <div>{listing.maxGuests} hóspedes</div>
                                <div>{listing.bedrooms} quartos</div>
                                <div>{listing.bathrooms} banheiros</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden md:block">
                                    <div className="text-sm font-semibold">Anfitrião Vivare</div>
                                    <div className="text-xs text-neutral-500">Superhost</div>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
                                    <User className="w-6 h-6 text-neutral-400" />
                                </div>
                            </div>
                        </div>

                        {/* Highlights */}
                        <div className="space-y-6 pb-8 border-b border-neutral-200 dark:border-neutral-800">
                            <div className="flex gap-4">
                                <Shield className="w-6 h-6 text-neutral-900 dark:text-white mt-1" />
                                <div>
                                    <h3 className="font-semibold text-neutral-900 dark:text-white">Reserva com Confiança</h3>
                                    <p className="text-sm text-neutral-500">
                                        Todas as reservas incluem proteção gratuita contra cancelamentos do anfitrião, imprecisões no anúncio e outros problemas.
                                    </p>
                                </div>
                            </div>
                            {/* Add more highlights if available in listing.highlights */}
                        </div>

                        {/* Description */}
                        <div className="pb-8 border-b border-neutral-200 dark:border-neutral-800">
                            <h2 className="text-xl font-bold mb-4 font-display">Sobre o espaço</h2>
                            <div className="prose prose-neutral dark:prose-invert max-w-none text-neutral-600 dark:text-neutral-300">
                                <p className="whitespace-pre-line">{listing.description}</p>
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="pb-8 border-b border-neutral-200 dark:border-neutral-800">
                            <h2 className="text-xl font-bold mb-6 font-display">O que este lugar oferece</h2>
                            <Amenities amenities={listing.amenities} limit={10} />
                            {listing.amenities.length > 10 && (
                                <button className="mt-6 font-semibold underline text-neutral-900 dark:text-white">
                                    Mostrar todas as {listing.amenities.length} comodidades
                                </button>
                            )}
                        </div>

                        {/* Map (Placeholder) */}
                        <div className="pb-8 border-b border-neutral-200 dark:border-neutral-800">
                            <h2 className="text-xl font-bold mb-6 font-display">Onde você vai estar</h2>
                            <div className="bg-neutral-100 dark:bg-neutral-800 h-[300px] rounded-2xl flex items-center justify-center">
                                <span className="text-neutral-400">Mapa indisponível na prévia</span>
                            </div>
                            <div className="mt-4">
                                <h3 className="font-semibold">{listing.address.city}, {listing.address.state}</h3>
                                <p className="text-sm text-neutral-500">
                                    O endereço exato será informado após a reserva.
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Sidebar (Right) */}
                    <div className="relative">
                        <BookingSidebar
                            listing={listing}
                            calendarData={calendarData.days}
                        />
                    </div>

                </div>
            </div>
        </main>
    );
}
