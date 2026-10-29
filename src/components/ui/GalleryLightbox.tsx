"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";

interface GalleryLightboxProps {
    images: { url: string }[];
    title: string;
}

/**
 * Galeria da unidade.
 *
 * - Abaixo de `md`: uma foto por vez em trilho deslizável (snap) com contador.
 *   A grade 1+4 do desktop virava miniaturas de 85 px no celular (revisão U2).
 * - A partir de `md`: grade 1+4, cada célula é um <button>.
 * - Lightbox como diálogo: Esc fecha, setas navegam, foco preso e devolvido,
 *   deslizar no toque troca a foto, overflow do body restaurado ao valor anterior.
 */
export default function GalleryLightbox({ images, title }: GalleryLightboxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mobileIndex, setMobileIndex] = useState(0);
    const dialogRef = useRef<HTMLDivElement>(null);
    const openerRef = useRef<HTMLElement | null>(null);
    const railRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef<number | null>(null);

    const total = images?.length ?? 0;

    const next = useCallback(() => setCurrentIndex((p) => (p + 1) % total), [total]);
    const prev = useCallback(() => setCurrentIndex((p) => (p - 1 + total) % total), [total]);

    // Diálogo: scroll lock com restauração, Esc, setas, foco inicial e devolução.
    useEffect(() => {
        if (!isOpen) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
            if (e.key === "ArrowRight") next();
            if (e.key === "ArrowLeft") prev();
            if (e.key === "Tab" && dialogRef.current) {
                const focusables = dialogRef.current.querySelectorAll<HTMLElement>("button, [href], [tabindex]:not([tabindex='-1'])");
                if (focusables.length === 0) return;
                const first = focusables[0];
                const last = focusables[focusables.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        };
        document.addEventListener("keydown", onKey);
        dialogRef.current?.querySelector<HTMLElement>("button")?.focus();
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", onKey);
            openerRef.current?.focus();
        };
    }, [isOpen, next, prev]);

    // Contador do trilho mobile
    useEffect(() => {
        const rail = railRef.current;
        if (!rail) return;
        const onScroll = () => {
            const w = rail.clientWidth || 1;
            setMobileIndex(Math.round(rail.scrollLeft / w));
        };
        rail.addEventListener("scroll", onScroll, { passive: true });
        return () => rail.removeEventListener("scroll", onScroll);
    }, []);

    if (!images || total === 0) return null;

    const mainImages = images.slice(0, 5);
    const hasMore = total > 5;

    const openLightbox = (index: number, opener?: HTMLElement | null) => {
        openerRef.current = opener ?? (document.activeElement as HTMLElement | null);
        setCurrentIndex(index);
        setIsOpen(true);
    };

    const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
    const onTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
        touchStartX.current = null;
    };

    return (
        <>
            {/* Celular: trilho deslizável, uma foto por tela */}
            <div className="md:hidden relative -mx-4 mb-8">
                <div
                    ref={railRef}
                    className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    style={{ touchAction: "pan-x pan-y" }}
                    aria-label={`Fotos de ${title}`}
                >
                    {images.slice(0, 12).map((img, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={(e) => openLightbox(idx, e.currentTarget)}
                            className="relative aspect-[4/3] w-full shrink-0 snap-center bg-warm-mid focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                            aria-label={`Abrir foto ${idx + 1} de ${total}`}
                        >
                            <Image
                                src={img.url}
                                alt={`${title}, foto ${idx + 1}`}
                                fill
                                sizes="100vw"
                                className="object-cover"
                                priority={idx === 0}
                                loading={idx === 0 ? "eager" : "lazy"}
                            />
                        </button>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={(e) => openLightbox(mobileIndex, e.currentTarget)}
                    className="absolute bottom-3 right-3 inline-flex min-h-10 items-center gap-2 rounded-full bg-ink/85 px-4 text-sm font-semibold text-parchment backdrop-blur-sm"
                >
                    <Images className="h-4 w-4" aria-hidden="true" />
                    {mobileIndex + 1} / {total}
                </button>
            </div>

            {/* Desktop: grade 1 + 4 */}
            <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[50vh] min-h-[400px] rounded-2xl overflow-hidden mb-12 relative">
                {mainImages.map((img, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={(e) => openLightbox(idx, e.currentTarget)}
                        aria-label={`Abrir foto ${idx + 1} de ${total}`}
                        className={`bg-warm-mid relative group overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${idx === 0 ? "col-span-2 row-span-2" : "col-span-1 row-span-1"}`}
                    >
                        <Image
                            src={img.url}
                            alt={`${title}, foto ${idx + 1}`}
                            fill
                            sizes={idx === 0 ? "50vw" : "25vw"}
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                            priority={idx === 0}
                            loading={idx === 0 ? "eager" : "lazy"}
                        />
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        {idx === 4 && hasMore && (
                            <div className="absolute inset-0 bg-black/45 flex items-center justify-center text-white font-semibold text-lg">
                                + {total - 5} fotos
                            </div>
                        )}
                    </button>
                ))}

                <button
                    type="button"
                    onClick={(e) => openLightbox(0, e.currentTarget)}
                    className="absolute bottom-4 right-4 inline-flex min-h-11 items-center gap-2 rounded-lg border border-warm-mid bg-white/95 px-4 text-sm font-bold text-ink shadow-md backdrop-blur transition-colors hover:bg-white"
                >
                    <Images className="h-4 w-4" aria-hidden="true" />
                    Mostrar todas as fotos
                </button>
            </div>

            {/* Lightbox */}
            {isOpen && (
                <div
                    ref={dialogRef}
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Galeria de fotos: ${title}`}
                    className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-200"
                    onClick={() => setIsOpen(false)}
                    onTouchStart={onTouchStart}
                    onTouchEnd={onTouchEnd}
                >
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        aria-label="Fechar galeria"
                        className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <X className="h-5 w-5" aria-hidden="true" />
                    </button>

                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); prev(); }}
                        aria-label="Foto anterior"
                        className="absolute left-2 md:left-6 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                    </button>

                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); next(); }}
                        aria-label="Próxima foto"
                        className="absolute right-2 md:right-6 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <ChevronRight className="h-6 w-6" aria-hidden="true" />
                    </button>

                    <div className="h-[80vh] w-full max-w-5xl flex items-center justify-center px-14 relative" onClick={(e) => e.stopPropagation()}>
                        <Image
                            key={currentIndex}
                            src={images[currentIndex].url}
                            alt={`${title}, foto ${currentIndex + 1} de ${total}`}
                            fill
                            sizes="100vw"
                            quality={85}
                            className="object-contain select-none animate-in fade-in duration-150"
                            priority
                        />
                    </div>

                    <p className="absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] text-white text-sm font-medium tracking-wide" aria-live="polite">
                        {currentIndex + 1} / {total}
                    </p>
                </div>
            )}
        </>
    );
}
