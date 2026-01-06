/**
 * Skeleton Loading Components
 * 
 * Premium loading states with shimmer animation
 */

import { cn } from '@/lib/utils';

export function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("skeleton animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded-md", className)}
            {...props}
        />
    );
}

export function ListingCardSkeleton() {
    return (
        <div className="card overflow-hidden">
            {/* Image Skeleton */}
            <div className="skeleton aspect-[4/3]" />

            {/* Content */}
            <div className="p-5">
                {/* Title */}
                <div className="skeleton h-6 w-3/4 mb-3" />

                {/* Location */}
                <div className="skeleton h-4 w-1/2 mb-4" />

                {/* Details */}
                <div className="flex gap-4 mb-5">
                    <div className="skeleton h-4 w-20" />
                    <div className="skeleton h-4 w-20" />
                    <div className="skeleton h-4 w-20" />
                </div>

                {/* Price */}
                <div className="pt-4 border-t border-neutral-100">
                    <div className="skeleton h-7 w-28" />
                </div>
            </div>
        </div>
    );
}

export function ListingGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <ListingCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function PropertyDetailSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Gallery Skeleton */}
            <div className="grid grid-cols-4 gap-2 mb-8">
                <div className="col-span-2 row-span-2 skeleton aspect-square rounded-xl" />
                <div className="skeleton aspect-square rounded-xl" />
                <div className="skeleton aspect-square rounded-xl" />
                <div className="skeleton aspect-square rounded-xl" />
                <div className="skeleton aspect-square rounded-xl" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Title */}
                    <div>
                        <div className="skeleton h-10 w-3/4 mb-4" />
                        <div className="skeleton h-5 w-1/2" />
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                        <div className="skeleton h-4 w-full" />
                        <div className="skeleton h-4 w-full" />
                        <div className="skeleton h-4 w-2/3" />
                    </div>

                    {/* Amenities */}
                    <div>
                        <div className="skeleton h-6 w-32 mb-4" />
                        <div className="grid grid-cols-2 gap-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="skeleton h-10 rounded-lg" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Booking Sidebar */}
                <div className="lg:col-span-1">
                    <div className="skeleton h-96 rounded-2xl sticky top-24" />
                </div>
            </div>
        </div>
    );
}

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="skeleton h-4"
                    style={{ width: i === lines - 1 ? '60%' : '100%' }}
                />
            ))}
        </div>
    );
}

export function AvatarSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
    };

    return (
        <div className={`skeleton rounded-full ${sizeClasses[size]}`} />
    );
}
