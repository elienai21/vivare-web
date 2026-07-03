import Link from 'next/link';
import { ListingCard } from '@/components/listing/ListingCard';
import { fetchListings } from '@/services/staysService';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';
import { Listing } from '@/types';

export async function FeaturedListings() {
    // Fetch directly from Stays via the existing service (no BFF dependency).
    // Filter to active listings; until we add a "featured" flag in Stays, we
    // just pick the first 6 active properties.
    let listings: Listing[] = [];
    try {
        const all = await fetchListings();
        listings = (all || [])
            .filter((l) => l.status === 'active')
            .map((l) => ({
                id: l.id || l._id,
                name: l._mstitle?.pt_BR ?? l.internalName ?? 'Acomodação Vivare',
                address: {
                    neighborhood: l.address?.region ?? '',
                    city: l.address?.city ?? '',
                    state: '',
                },
                bedrooms: l._i_rooms ?? 0,
                bathrooms: l._f_bathrooms ?? 0,
                maxGuests: l._i_maxGuests ?? 1,
                propertyType: '',
                amenities: [],
                photos: (l._t_imagesMeta || []).map((img, idx) => ({
                    id: `${l._id}-${idx}`,
                    url: img.url,
                    order: idx,
                })),
                description: l._msdesc?.pt_BR,
                thumbnail: l._t_mainImageMeta?.url ?? '',
                pricePerNight: l._d_minPrice,
            }));
    } catch (error) {
        console.warn('Failed to fetch featured listings (ignoring for build safety):', error);
    }

    if (!listings || listings.length === 0) {
        return null;
    }

    // Take top 3 or 6
    const displayListings = listings.slice(0, 6);

    return (
        <section className="py-24 px-6 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 dark:text-white mb-4">
                            Destaques Exclusivos
                        </h2>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 font-light">
                            Uma seleção das nossas propriedades mais desejadas, oferecendo o máximo em conforto e estilo.
                        </p>
                    </div>
                    <Link href="/acomodacoes">
                        <Button variant="outline" className="hidden md:flex gap-2 group">
                            Ver todas as acomodações
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayListings.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>

                <div className="mt-12 text-center md:hidden">
                    <Link href="/acomodacoes">
                        <Button variant="outline" className="w-full gap-2 group">
                            Ver todas as acomodações
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
