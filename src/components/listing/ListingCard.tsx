'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Listing } from '@/types';

interface ListingCardProps {
    listing: Listing;
    priority?: boolean;
}

/**
 * Premium Listing Card Component
 * 
 * Features:
 * - Hover zoom effect on image
 * - Smooth lift animation
 * - Featured badge
 * - Responsive design
 */
export function ListingCard({ listing, priority = false }: ListingCardProps) {
    const {
        id,
        name,
        address,
        bedrooms,
        bathrooms,
        maxGuests,
        thumbnail,
        pricePerNight,
        featured,
    } = listing;

    return (
        <Link
            href={`/acomodacoes/${id}`}
            className="group block card card-interactive overflow-hidden"
        >
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                <Image
                    src={thumbnail}
                    alt={name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={priority}
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+ZNPQAIXwM498u7eQAAAABJRU5ErkJggg=="
                />

                {/* Featured Badge */}
                {featured && (
                    <div
                        className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-sm font-semibold
                       bg-gradient-to-r from-accent-500 to-accent-600 text-white
                       shadow-md z-10"
                    >
                        Destaque
                    </div>
                )}

                {/* Gradient Overlay - Always slightly visible for text safety */}
                <div
                    className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent 
                     opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                />
            </div>

            {/* Content */}
            <div className="p-5">
                {/* Title */}
                <h3
                    className="font-display font-semibold text-lg text-neutral-900 mb-1.5
                     group-hover:text-primary-600 transition-colors duration-200
                     line-clamp-1"
                >
                    {name}
                </h3>

                {/* Location */}
                <p className="text-neutral-500 text-sm mb-4 flex items-center gap-1.5">
                    <svg
                        className="w-4 h-4 text-neutral-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                    </svg>
                    <span>{address.neighborhood}, {address.city}</span>
                </p>

                {/* Property Details */}
                <div className="flex flex-wrap gap-4 mb-5 text-sm text-neutral-600">
                    {/* Bedrooms */}
                    <span className="flex items-center gap-1.5">
                        <svg
                            className="w-4 h-4 text-neutral-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M20 12V8a2 2 0 00-2-2H6a2 2 0 00-2 2v4M4 12v6a2 2 0 002 2h12a2 2 0 002-2v-6M4 12h16M8 12V9m8 3V9"
                            />
                        </svg>
                        {bedrooms} {bedrooms === 1 ? 'quarto' : 'quartos'}
                    </span>

                    {/* Bathrooms */}
                    <span className="flex items-center gap-1.5">
                        <svg
                            className="w-4 h-4 text-neutral-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 12h16M4 12v4a2 2 0 002 2h12a2 2 0 002-2v-4M4 12V8m0 0V6a2 2 0 012-2h2M8 4v4m0 0h10a2 2 0 012 2v2"
                            />
                        </svg>
                        {bathrooms} {bathrooms === 1 ? 'banheiro' : 'banheiros'}
                    </span>

                    {/* Guests */}
                    <span className="flex items-center gap-1.5">
                        <svg
                            className="w-4 h-4 text-neutral-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                        {maxGuests} {maxGuests === 1 ? 'hóspede' : 'hóspedes'}
                    </span>
                </div>

                {/* Price */}
                {pricePerNight !== undefined && (
                    <div className="flex items-baseline gap-1.5 pt-4 border-t border-neutral-100">
                        <span className="text-2xl font-bold text-neutral-900">
                            R$ {pricePerNight.toLocaleString('pt-BR')}
                        </span>
                        <span className="text-neutral-500 text-sm">/noite</span>
                    </div>
                )}
            </div>
        </Link>
    );
}
