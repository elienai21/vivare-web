'use client';

import Image from 'next/image';
import { Calendar, MapPin, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface Event {
    id: string;
    title: string;
    date: string;
    location: string;
    neighborhood: string;
    image: string;
    affiliateLink?: string;
}

const MOCK_EVENTS: Event[] = [
    {
        id: '1',
        title: 'Grande Prêmio de São Paulo (F1)',
        date: '07 - 09 de Novembro',
        location: 'Autódromo de Interlagos',
        neighborhood: 'Interlagos',
        image: 'https://images.unsplash.com/photo-1541535881962-e6686230e0c1?q=80&w=2070&auto=format&fit=crop',
        affiliateLink: 'https://www.f1saopaulo.com.br/' // Placeholder affiliate link
    },
    {
        id: '2',
        title: 'Lollapalooza Brasil 2026',
        date: 'Março de 2026',
        location: 'Autódromo de Interlagos',
        neighborhood: 'Interlagos',
        image: 'https://images.unsplash.com/photo-1459749411177-042180ceea72?q=80&w=2070&auto=format&fit=crop',
    },
    {
        id: '3',
        title: 'São Paulo Fashion Week',
        date: 'Outubro de 2025',
        location: 'Pavilhão das Culturas Brasileiras',
        neighborhood: 'Ibirapuera',
        image: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?q=80&w=1974&auto=format&fit=crop',
    }
];

export function CityEvents() {
    return (
        <section className="py-24 px-6 bg-neutral-50 dark:bg-neutral-950">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <h2 className="text-sm font-bold text-accent-600 uppercase tracking-widest mb-3">
                            Vivare Culture
                        </h2>
                        <h3 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 dark:text-white">
                            O que acontece em São Paulo
                        </h3>
                    </div>
                    <p className="max-w-md text-neutral-500 font-light">
                        Descubra os eventos mais exclusivos da cidade e reserve sua estadia premium próxima ao local.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {MOCK_EVENTS.map((event) => (
                        <div key={event.id} className="group card overflow-hidden bg-white dark:bg-neutral-900">
                            {/* Image Container */}
                            <div className="relative aspect-[16/9] overflow-hidden">
                                <Image
                                    src={event.image}
                                    alt={event.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    placeholder="blur"
                                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+ZNPQAIXwM498u7eQAAAABJRU5ErkJggg=="
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                {event.affiliateLink && (
                                    <a
                                        href={event.affiliateLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"
                                    >
                                        <ArrowUpRight className="w-5 h-5" />
                                    </a>
                                )}
                            </div>

                            <div className="p-6">
                                <div className="flex items-center gap-2 text-xs font-semibold text-accent-600 mb-3">
                                    <Calendar className="w-4 h-4" />
                                    {event.date}
                                </div>

                                <h4 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 line-clamp-1">
                                    {event.title}
                                </h4>

                                <p className="flex items-center gap-1.5 text-neutral-500 text-sm mb-6">
                                    <MapPin className="w-4 h-4" />
                                    {event.location}
                                </p>

                                <Link href={`/acomodacoes?location=${encodeURIComponent(event.neighborhood)}`}>
                                    <Button variant="outline" className="w-full justify-between group/btn">
                                        Ver estadias próximas
                                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
