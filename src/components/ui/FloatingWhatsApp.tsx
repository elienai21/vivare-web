"use client";

import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/constants";

export function FloatingWhatsApp() {
    const [isVisible, setIsVisible] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Show after slight delay for better UX
        const timer = setTimeout(() => setIsVisible(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleWhatsAppClick = () => {
        const isOwnerPage = pathname?.includes("/para-proprietarios");
        trackEvent("whatsapp_floating_click", { page: pathname || "/" });
        const message = isOwnerPage
            ? encodeURIComponent("Olá! Estou no site da Vivare e gostaria de falar com um especialista sobre a gestão do meu imóvel.")
            : encodeURIComponent("Olá! Estou no site da Vivare e gostaria de atendimento.");

        window.open(`https://wa.me/5511985067840?text=${message}`, "_blank");
    };

    if (!isVisible) return null;

    return (
        <button
            onClick={handleWhatsAppClick}
            className="fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#20bd5a] text-white p-4 rounded-full shadow-lg shadow-[#25D366]/30 transition-all hover:scale-110 active:scale-95 flex items-center justify-center group animate-in slide-in-from-bottom-5 fade-in duration-500"
            aria-label="Falar conosco no WhatsApp"
        >
            <MessageCircle size={30} className="fill-current" />
            {/* Optional tooltip */}
            <span className="absolute right-full mr-4 bg-white text-neutral-800 text-sm font-medium py-2 px-4 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Fale com um especialista
            </span>
        </button>
    );
}
