'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming this utility exists

interface LocationFilterProps {
    value?: string;
    onChange: (city: string) => void;
    className?: string;
    placeholder?: string;
}

const POPULAR_LOCATIONS = [
    { city: 'São Paulo', state: 'SP', region: 'Jardins' },
    { city: 'São Paulo', state: 'SP', region: 'Itaim Bibi' },
    { city: 'São Paulo', state: 'SP', region: 'Vila Madalena' },
    { city: 'São Paulo', state: 'SP', region: 'Pinheiros' },
    { city: 'Campos do Jordão', state: 'SP', region: 'Capivari' },
    { city: 'Rio de Janeiro', state: 'RJ', region: 'Copacabana' },
];

export function LocationFilter({
    value,
    onChange,
    className,
    placeholder = "Para onde você vai?"
}: LocationFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState(value || '');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (city: string) => {
        setSearch(city);
        onChange(city);
        setIsOpen(false);
    };

    const filteredLocations = POPULAR_LOCATIONS.filter(loc =>
        loc.city.toLowerCase().includes(search.toLowerCase()) ||
        loc.region.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={cn("relative", className)} ref={containerRef}>
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    <MapPin className="w-5 h-5" />
                </div>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        if (!isOpen) setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-200 bg-white 
                     focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none
                     transition-all font-medium text-neutral-900 placeholder:text-neutral-400"
                />
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-neutral-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="py-2">
                        <div className="px-4 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                            Destinos Populares
                        </div>

                        {filteredLocations.length > 0 ? (
                            filteredLocations.map((loc, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelect(loc.city)}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 text-left transition-colors group"
                                >
                                    <div className="p-2 bg-neutral-100 rounded-lg text-neutral-500 group-hover:bg-white group-hover:text-primary-600 transition-colors">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-neutral-900">{loc.city}</div>
                                        <div className="text-xs text-neutral-500">{loc.region}, {loc.state}</div>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-sm text-neutral-500">
                                Nenhum local encontrado para &quot;{search}&quot;
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
