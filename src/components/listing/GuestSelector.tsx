'use client';

import { useState, useRef, useEffect } from 'react';
import { Minus, Plus, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Guests } from '@/types';

interface GuestSelectorProps {
    guests: Guests;
    maxGuests: number;
    onChange: (guests: Guests) => void;
    className?: string;
}

export function GuestSelector({
    guests,
    maxGuests,
    onChange,
    className
}: GuestSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const totalGuests = guests.adults + guests.children;

    const updateGuests = (type: keyof Guests, delta: number) => {
        const newVal = guests[type] + delta;

        // Constraints
        if (newVal < 0) return;
        if (type === 'adults' && newVal < 1) return; // At least 1 adult
        if (type !== 'infants' && (totalGuests - guests[type] + newVal > maxGuests)) return;

        onChange({
            ...guests,
            [type]: newVal,
        });
    };

    return (
        <div className={cn("relative", className)} ref={containerRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all",
                    isOpen
                        ? "border-primary-500 ring-2 ring-primary-100 bg-white"
                        : "border-neutral-200 hover:border-neutral-300 bg-white"
                )}
            >
                <div className="flex items-center gap-2 text-sm text-neutral-700">
                    <Users className="w-4 h-4 text-neutral-400" />
                    <span className="font-medium">
                        {totalGuests} {totalGuests === 1 ? 'hóspede' : 'hóspedes'}
                    </span>
                    {guests.infants > 0 && (
                        <span className="text-neutral-500">
                            , {guests.infants} {guests.infants === 1 ? 'bebê' : 'bebês'}
                        </span>
                    )}
                </div>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 p-5 bg-white rounded-xl shadow-xl border border-neutral-100 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="space-y-6">
                        <CounterRow
                            label="Adultos"
                            sublabel="Acima de 12 anos"
                            value={guests.adults}
                            onMinus={() => updateGuests('adults', -1)}
                            onPlus={() => updateGuests('adults', 1)}
                            canMinus={guests.adults > 1}
                            canPlus={totalGuests < maxGuests}
                        />

                        <CounterRow
                            label="Crianças"
                            sublabel="2 a 12 anos"
                            value={guests.children}
                            onMinus={() => updateGuests('children', -1)}
                            onPlus={() => updateGuests('children', 1)}
                            canMinus={guests.children > 0}
                            canPlus={totalGuests < maxGuests}
                        />

                        <CounterRow
                            label="Bebês"
                            sublabel="Menores de 2 anos"
                            value={guests.infants}
                            onMinus={() => updateGuests('infants', -1)}
                            onPlus={() => updateGuests('infants', 1)}
                            canMinus={guests.infants > 0}
                            canPlus={true} // Infants usually don't count towards max capacity (check policy)
                        />
                    </div>

                    <div className="mt-4 pt-4 border-t border-neutral-100 text-xs text-neutral-500 text-center">
                        Máximo de {maxGuests} hóspedes nesta propriedade
                    </div>
                </div>
            )}
        </div>
    );
}

interface CounterRowProps {
    label: string;
    sublabel: string;
    value: number;
    onMinus: () => void;
    onPlus: () => void;
    canMinus: boolean;
    canPlus: boolean;
}

function CounterRow({ label, sublabel, value, onMinus, onPlus, canMinus, canPlus }: CounterRowProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <div className="font-medium text-neutral-900">{label}</div>
                <div className="text-xs text-neutral-500">{sublabel}</div>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={onMinus}
                    disabled={!canMinus}
                    type="button"
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <Minus className="w-4 h-4" />
                </button>
                <span className="w-4 text-center font-medium text-neutral-900">{value}</span>
                <button
                    onClick={onPlus}
                    disabled={!canPlus}
                    type="button"
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
