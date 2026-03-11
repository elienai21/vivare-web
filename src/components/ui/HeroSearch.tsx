"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function HeroSearch() {
    const router = useRouter();
    const [destination, setDestination] = useState("");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [guests, setGuests] = useState("2 Hóspedes");
    const [showSuggestions, setShowSuggestions] = useState(false);

    const suggestions = [
        { title: "Jardins", subtitle: "São Paulo" },
        { title: "Itaim Bibi", subtitle: "São Paulo" },
        { title: "Vila Nova Conceição", subtitle: "São Paulo" },
        { title: "Gonzaga", subtitle: "Santos" },
        { title: "Astúrias", subtitle: "Guarujá" }
    ];

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (destination) params.append("dest", destination);
        if (checkIn) params.append("checkIn", checkIn);
        if (checkOut) params.append("checkOut", checkOut);

        const gNum = guests.split(" ")[0];
        if (gNum) params.append("guests", gNum.replace("+", ""));

        router.push(`/unidades?${params.toString()}`);
    };

    return (
        <div className="mt-12 w-full max-w-5xl rounded-2xl bg-white p-2 shadow-2xl dark:bg-ink dark:border dark:border-primary/20 mx-auto pointer-events-auto h-auto relative">
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 relative">
                <div className="flex flex-col items-start px-6 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl transition-colors text-left relative group w-full border-b md:border-b-0 border-neutral-100 dark:border-neutral-800">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Destino</span>
                    <input
                        value={destination}
                        onChange={e => setDestination(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        className="w-full border-none bg-transparent p-0 text-sm font-semibold focus:ring-0 text-ink dark:text-parchment placeholder:text-neutral-400 focus:outline-none"
                        placeholder="Para onde você vai?" type="text"
                    />

                    {/* Suggestions Dropdown */}
                    {showSuggestions && (
                        <div className="absolute top-[110%] left-0 w-full min-w-[280px] bg-white dark:bg-ink rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-neutral-100 dark:border-primary/20 p-4 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3 px-2">Buscados recentemente</p>
                            <ul className="flex flex-col gap-1">
                                {suggestions.filter(s => s.title.toLowerCase().includes(destination.toLowerCase()) || s.subtitle.toLowerCase().includes(destination.toLowerCase())).map((item, i) => (
                                    <li key={i}
                                        onClick={() => { setDestination(item.title); setShowSuggestions(false); }}
                                        className="flex items-center gap-4 px-3 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer transition-colors"
                                    >
                                        <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center text-neutral-400">
                                            <span className="material-symbols-outlined text-[20px]">location_on</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-ink dark:text-parchment">{item.title}</p>
                                            <p className="text-[11px] text-neutral-500">{item.subtitle}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-start px-6 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl transition-colors md:border-l border-b md:border-b-0 border-neutral-100 dark:border-neutral-800 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Check-in</span>
                    <input
                        value={checkIn} onChange={e => setCheckIn(e.target.value)}
                        className="w-full border-none bg-transparent p-0 text-sm font-semibold focus:ring-0 text-ink dark:text-parchment appearance-none focus:outline-none"
                        type="date"
                    />
                </div>

                <div className="flex flex-col items-start px-6 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl transition-colors md:border-l border-b md:border-b-0 border-neutral-100 dark:border-neutral-800 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Check-out</span>
                    <input
                        value={checkOut} onChange={e => setCheckOut(e.target.value)}
                        className="w-full border-none bg-transparent p-0 text-sm font-semibold focus:ring-0 text-ink dark:text-parchment appearance-none focus:outline-none"
                        type="date"
                    />
                </div>

                <div className="flex flex-col items-start px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl transition-colors border-l border-neutral-100 dark:border-neutral-800 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Hóspedes</span>
                    <select
                        value={guests} onChange={e => setGuests(e.target.value)}
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
                        <span className="material-symbols-outlined text-xl">search</span>
                        Buscar
                    </button>
                </div>
            </div>
        </div>
    );
}
