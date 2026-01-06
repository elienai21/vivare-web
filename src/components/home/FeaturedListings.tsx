import Link from 'next/link';
import { ListingCard } from '@/components/listing/ListingCard';
import { searchListings } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';
import { Listing } from '@/types';

export async function FeaturedListings() {
    // Fetch featured listings (limit to 6 for example, though API handles pagination)
    // We assume default page size is enough or we might want to specify pageSize
    let listings: Listing[] = [];
    try {
        const result = await searchListings({ featured: true });
        listings = result.listings || [];
    } catch (error) {
        console.warn('Failed to fetch featured listings (ignoring for build safety):', error);
        // listings remains empty
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
