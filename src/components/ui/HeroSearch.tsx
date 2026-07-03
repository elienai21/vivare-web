"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search } from "lucide-react";

interface DestinationSuggestion {
    title: string;
    subtitle: string;
}

const POPULAR_DESTINATIONS: DestinationSuggestion[] = [
    { title: "Jardins", subtitle: "São Paulo" },
    { title: "Itaim Bibi", subtitle: "São Paulo" },
    { title: "Vila Nova Conceição", subtitle: "São Paulo" },
    { title: "Gonzaga", subtitle: "Santos" },
    { title: "Astúrias", subtitle: "Guarujá" },
];

export function HeroSearch() {
    const router = useRouter();
    const [destination, setDestination] = useState("");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [guests, setGuests] = useState("2 Hóspedes");
    const [showSuggestions, setShowSuggestions] = useState(false);

    const destinationFieldRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Close on click/tap outside the destination field (more reliable than
    // the 200ms onBlur hack, which raced with suggestion clicks).
    useEffect(() => {
        if (!showSuggestions) return;

        const handlePointer = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node | null;
            if (
                destinationFieldRef.current &&
                target &&
                !destinationFieldRef.current.contains(target)
            ) {
                setShowSuggestions(false);
            }
        };
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setShowSuggestions(false);
                inputRef.current?.blur();
            }
        };

        document.addEventListener("mousedown", handlePointer);
        document.addEventListener("touchstart", handlePointer);
        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("mousedown", handlePointer);
            document.removeEventListener("touchstart", handlePointer);
            document.removeEventListener("keydown", handleKey);
        };
    }, [showSuggestions]);

    const query = destination.trim().toLowerCase();
    const filteredSuggestions = query
        ? POPULAR_DESTINATIONS.filter(
              (s) =>
                  s.title.toLowerCase().includes(query) ||
                  s.subtitle.toLowerCase().includes(query),
          )
        : POPULAR_DESTINATIONS;
    const hasSuggestionsToShow = filteredSuggestions.length > 0;

    const handleSelectSuggestion = (item: DestinationSuggestion) => {
        setDestination(item.title);
        setShowSuggestions(false);
        inputRef.current?.blur();
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (destination) params.append("dest", destination);
        if (checkIn) params.append("checkIn", checkIn);
        if (checkOut) params.append("checkOut", checkOut);

        const gNum = guests.split(" ")[0];
        if (gNum) params.append("guests", gNum.replace("+", ""));

        router.push(`/unidades?${params.toString()}`);
    };

    const suggestionsLabel = query
        ? "Resultados"
        : "Destinos populares";

    return (
        <div className="mt-12 w-full max-w-5xl rounded-2xl bg-white p-2 shadow-2xl dark:bg-ink dark:border dark:border-primary/20 mx-auto pointer-events-auto h-auto relative">
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 relative">
                <div
                    ref={destinationFieldRef}
                    className="flex flex-col items-start px-6 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl transition-colors text-left relative group w-full border-b md:border-b-0 border-neutral-100 dark:border-neutral-800"
                >
                    <label
                        htmlFor="hero-destination"
                        className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1"
                    >
                        Destino
                    </label>
                    <input
                        id="hero-destination"
                        ref={inputRef}
                        value={destination}
                        onChange={(e) => {
                            setDestination(e.target.value);
                            if (!showSuggestions) setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        className="w-full border-none bg-transparent p-0 text-sm font-semibold focus:ring-0 text-ink dark:text-parchment placeholder:text-neutral-400 focus:outline-none"
                        placeholder="Para onde você vai?"
                        type="text"
                        autoComplete="off"
                        role="combobox"
                        aria-expanded={showSuggestions && hasSuggestionsToShow}
                        aria-controls="hero-destination-listbox"
                        aria-autocomplete="list"
                    />

                    {showSuggestions && hasSuggestionsToShow && (
                        <div
                            id="hero-destination-listbox"
                            role="listbox"
                            aria-label={suggestionsLabel}
                            className="absolute top-[110%] left-0 w-full min-w-[280px] bg-white dark:bg-ink rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-neutral-100 dark:border-primary/20 p-4 z-50 animate-in fade-in slide-in-from-top-4 duration-200"
                        >
                            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3 px-2">
                                {suggestionsLabel}
                            </p>
                            <ul className="flex flex-col gap-1">
                                {filteredSuggestions.map((item) => (
                                    <li
                                        key={`${item.title}-${item.subtitle}`}
                                        role="option"
                                        aria-selected={destination === item.title}
                                        // onMouseDown fires before input's onBlur, so the
                                        // click registers even if blur tries to close us.
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            handleSelectSuggestion(item);
                                        }}
                                        className="flex items-center gap-4 px-3 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer transition-colors"
                                    >
                                        <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center text-neutral-400">
                                            <MapPin className="w-5 h-5" aria-hidden="true" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-ink dark:text-parchment">
                                                {item.title}
                                            </p>
                                            <p className="text-[11px] text-neutral-500">
                                                {item.subtitle}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-start px-6 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl transition-colors md:border-l border-b md:border-b-0 border-neutral-100 dark:border-neutral-800 text-left">
                    <label htmlFor="hero-checkin" className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
                        Check-in
                    </label>
                    <input
                        id="hero-checkin"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full border-none bg-transparent p-0 text-sm font-semibold focus:ring-0 text-ink dark:text-parchment appearance-none focus:outline-none"
                        type="date"
                    />
                </div>

                <div className="flex flex-col items-start px-6 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl transition-colors md:border-l border-b md:border-b-0 border-neutral-100 dark:border-neutral-800 text-left">
                    <label htmlFor="hero-checkout" className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
                        Check-out
                    </label>
                    <input
                        id="hero-checkout"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full border-none bg-transparent p-0 text-sm font-semibold focus:ring-0 text-ink dark:text-parchment appearance-none focus:outline-none"
                        type="date"
                    />
                </div>

                <div className="flex flex-col items-start px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl transition-colors border-l border-neutral-100 dark:border-neutral-800 text-left">
                    <label htmlFor="hero-guests" className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                        Hóspedes
                    </label>
                    <select
                        id="hero-guests"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        className="w-full border-none bg-transparent p-0 text-sm font-semibold focus:ring-0 text-neutral-900 dark:text-neutral-100 cursor-pointer focus:outline-none"
                    >
                        <option>1 Hóspede</option>
                        <option>2 Hóspedes</option>
                        <option>3 Hóspedes</option>
                        <option>4+ Hóspedes</option>
                    </select>
                </div>

                <div className="flex items-center justify-center p-2 lg:col-span-1 md:col-span-4">
                    <button
                        onClick={handleSearch}
                        className="w-full h-full rounded-xl bg-[#1a1a1a] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-black/10 transition-all hover:bg-[#2d2d2d] active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Search className="w-5 h-5" aria-hidden="true" />
                        Buscar
                    </button>
                </div>
            </div>
        </div>
    );
}
