"use client";

import { useState, useEffect } from "react";

interface GalleryLightboxProps {
    images: { url: string }[];
    title: string;
}

export default function GalleryLightbox({ images, title }: GalleryLightboxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) return null;

    const mainImages = images.slice(0, 5);
    const hasMore = images.length > 5;

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    const openLightbox = (index: number) => {
        setCurrentIndex(index);
        setIsOpen(true);
    };

    const closeLightbox = () => {
        setIsOpen(false);
    };

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <>
            {/* CSS Grid Gallery (Max 5 items) */}
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[50vh] min-h-[400px] rounded-2xl overflow-hidden mb-12 relative cursor-pointer">
                {mainImages.map((img, idx) => (
                    <div
                        key={idx}
                        onClick={() => openLightbox(idx)}
                        className={`bg-neutral-200 relative group overflow-hidden ${idx === 0 ? "col-span-2 row-span-2" : "col-span-1 row-span-1"}`}
                    >
                        <img
                            src={img.url}
                            alt={`${title} - Foto ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        {/* Mostrar botão na última foto se houver mais */}
                        {idx === 4 && hasMore && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-semibold text-lg hover:bg-black/50 transition">
                                + {images.length - 5} fotos
                            </div>
                        )}
                    </div>
                ))}

                {/* Fallback button if less than 5 images but we want a full trigger */}
                <button
                    onClick={() => openLightbox(0)}
                    className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-white transition text-neutral-900 border border-neutral-200">
                    Mostrar todas as fotos
                </button>
            </div>

            {/* Lightbox Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center" onClick={closeLightbox}>
                    <div className="absolute top-4 right-4 z-50">
                        <button onClick={closeLightbox} className="text-white hover:text-neutral-300 bg-neutral-800/50 p-3 rounded-full transition">
                            ✕ Fechar
                        </button>
                    </div>

                    {/* Navigation Buttons */}
                    <button
                        onClick={prevImage}
                        className="absolute left-6 text-white text-5xl hover:scale-110 transition drop-shadow-lg p-4"
                    >
                        ‹
                    </button>

                    <button
                        onClick={nextImage}
                        className="absolute right-6 text-white text-5xl hover:scale-110 transition drop-shadow-lg p-4"
                    >
                        ›
                    </button>

                    {/* Main Image View */}
                    <div className="h-[80vh] w-full max-w-5xl flex items-center justify-center px-12" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={images[currentIndex].url}
                            alt={`${title} - Galeria ${currentIndex + 1}`}
                            className="max-h-full max-w-full object-contain select-none"
                        />
                    </div>

                    {/* Counter */}
                    <div className="absolute bottom-6 text-white text-sm font-medium tracking-wide">
                        {currentIndex + 1} / {images.length}
                    </div>
                </div>
            )}
        </>
    );
}
