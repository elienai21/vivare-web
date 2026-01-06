import {
    Wifi, Car, Tv, Wind, Coffee, Utensils, Waves,
    Thermometer, ShieldCheck, Dumbbell, LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AmenitiesProps {
    amenities: string[];
    limit?: number;
    className?: string;
}

const AMENITY_ICONS: Record<string, { icon: LucideIcon; label: string }> = {
    'wifi': { icon: Wifi, label: 'Wi-Fi' },
    'parking': { icon: Car, label: 'Estacionamento' },
    'tv': { icon: Tv, label: 'TV a Cabo' },
    'ac': { icon: Wind, label: 'Ar Condicionado' },
    'coffee': { icon: Coffee, label: 'Cafeteira' },
    'kitchen': { icon: Utensils, label: 'Cozinha Completa' },
    'pool': { icon: Waves, label: 'Piscina' },
    'heating': { icon: Thermometer, label: 'Aquecimento' },
    'security': { icon: ShieldCheck, label: 'Segurança 24h' },
    'gym': { icon: Dumbbell, label: 'Academia' },
    // Add more as needed, fallback to generic
};

export function Amenities({ amenities, limit, className }: AmenitiesProps) {
    const displayAmenities = limit ? amenities.slice(0, limit) : amenities;

    return (
        <div className={cn("grid grid-cols-2 md:grid-cols-2 gap-4", className)}>
            {displayAmenities.map((amenityKey) => {
                // Normalize key (lowercase, trim)
                const key = amenityKey.toLowerCase().trim();
                const config = AMENITY_ICONS[key] || { icon: ShieldCheck, label: amenityKey };
                const Icon = config.icon;

                return (
                    <div key={amenityKey} className="flex items-center gap-3 text-neutral-600">
                        <Icon className="w-5 h-5 text-neutral-400" />
                        <span className="capitalize">{config.label}</span>
                    </div>
                );
            })}
        </div>
    );
}
