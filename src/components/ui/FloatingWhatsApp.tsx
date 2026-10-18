"use client";

import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { trackEvent, WHATSAPP_NUMBER } from "@/lib/constants";

/**
 * Botão flutuante de WhatsApp.
 *
 * Regras para não atrapalhar a ação principal (revisão de design, T8):
 * - some em /reserva (o checkout tem o próprio CTA fixo);
 * - some abaixo de `md` na página da unidade (a barra fixa de reserva já
 *   traz o WhatsApp);
 * - some enquanto um campo de formulário está focado e enquanto a página
 *   rola para baixo; volta ao parar ou rolar para cima;
 * - 48 px, cor da marca, acima da área segura do iPhone.
 */
export function FloatingWhatsApp() {
    const pathname = usePathname() ?? "/";
    const [mounted, setMounted] = useState(false);
    const [hiddenByScroll, setHiddenByScroll] = useState(false);
    const [hiddenByFocus, setHiddenByFocus] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 1200);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        let lastY = window.scrollY;
        let idle: ReturnType<typeof setTimeout> | undefined;
        const onScroll = () => {
            const y = window.scrollY;
            if (y > lastY + 8 && y > 200) setHiddenByScroll(true);
            else if (y < lastY - 8) setHiddenByScroll(false);
            lastY = y;
            if (idle) clearTimeout(idle);
            idle = setTimeout(() => setHiddenByScroll(false), 900);
        };
        const isField = (el: EventTarget | null) =>
            el instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
        const onFocusIn = (e: FocusEvent) => { if (isField(e.target)) setHiddenByFocus(true); };
        const onFocusOut = (e: FocusEvent) => { if (isField(e.target)) setHiddenByFocus(false); };

        window.addEventListener("scroll", onScroll, { passive: true });
        document.addEventListener("focusin", onFocusIn);
        document.addEventListener("focusout", onFocusOut);
        return () => {
            window.removeEventListener("scroll", onScroll);
            document.removeEventListener("focusin", onFocusIn);
            document.removeEventListener("focusout", onFocusOut);
            if (idle) clearTimeout(idle);
        };
    }, []);

    if (!mounted) return null;
    if (pathname.startsWith("/reserva")) return null;

    const isUnitPage = /^\/unidades\/[^/]+/.test(pathname);
    const isOwnerPage = pathname.includes("/para-proprietarios");
    const message = encodeURIComponent(
        isOwnerPage
            ? "Olá! Estou no site da Vivare e gostaria de falar com um especialista sobre a gestão do meu imóvel."
            : "Olá! Estou no site da Vivare e gostaria de atendimento."
    );
    const hidden = hiddenByScroll || hiddenByFocus;

    return (
        <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("whatsapp_floating_click", { page: pathname })}
            aria-label="Falar conosco no WhatsApp"
            aria-hidden={hidden ? "true" : undefined}
            tabIndex={hidden ? -1 : 0}
            className={[
                "fixed right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full",
                "bottom-[max(1rem,env(safe-area-inset-bottom))] md:bottom-6 md:right-6",
                "bg-ink text-primary-light shadow-lg dark:bg-parchment dark:text-ink",
                "transition-[transform,opacity,background-color,color] duration-300 ease-out",
                "hover:bg-primary hover:text-ink active:scale-95",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                "animate-in fade-in slide-in-from-bottom-4 duration-300",
                hidden ? "pointer-events-none translate-y-20 opacity-0" : "translate-y-0 opacity-100",
                isUnitPage ? "hidden md:flex" : "",
            ].join(" ")}
        >
            <MessageCircle size={24} aria-hidden="true" />
        </a>
    );
}
