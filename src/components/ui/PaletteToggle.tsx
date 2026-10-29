"use client";

import { useEffect, useState } from "react";

const KEY = "vivare-palette-preview";

/**
 * Seletor temporário para comparar a paleta atual com a proposta.
 * Aparece só em desenvolvimento ou quando a URL tem ?comparar=1.
 * A escolha fica na sessão do navegador, então vale ao navegar entre páginas.
 * Também aceita ?paleta=nova ou ?paleta=atual direto na URL.
 *
 * Remover junto com o bloco `data-palette='v2'` do globals.css quando a
 * decisão for tomada.
 */
export function PaletteToggle() {
    const [visible, setVisible] = useState(false);
    const [palette, setPalette] = useState<"atual" | "nova">("atual");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const forced = params.get("paleta");
        let stored: string | null = null;
        try { stored = sessionStorage.getItem(KEY); } catch { /* modo privado */ }
        const initial = forced === "nova" || forced === "atual" ? forced : stored === "nova" ? "nova" : "atual";
        const show = process.env.NODE_ENV !== "production" || params.has("comparar") || stored !== null;
        // Sincroniza com o navegador uma única vez, ao montar.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setVisible(show);
        setPalette(initial);
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        if (palette === "nova") root.dataset.palette = "v2";
        else delete root.dataset.palette;
        try { sessionStorage.setItem(KEY, palette); } catch { /* modo privado */ }
    }, [palette]);

    if (!visible) return null;

    const option = (value: "atual" | "nova", label: string) => (
        <button
            type="button"
            onClick={() => setPalette(value)}
            aria-pressed={palette === value}
            className={`min-h-9 rounded-full px-3 text-xs font-semibold transition-colors ${palette === value ? "bg-ink text-primary-light dark:bg-parchment dark:text-ink" : "text-foreground hover:bg-primary-dim"}`}
        >
            {label}
        </button>
    );

    return (
        <div
            role="group"
            aria-label="Comparar paleta de cores"
            className="fixed left-1/2 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[70] -translate-x-1/2 flex items-center gap-1 rounded-full border border-card-border bg-card/95 p-1 shadow-lg backdrop-blur-md"
        >
            <span className="px-2 text-[11px] font-semibold uppercase tracking-widest text-secondary-text">Paleta</span>
            {option("atual", "Atual")}
            {option("nova", "Proposta")}
        </div>
    );
}
