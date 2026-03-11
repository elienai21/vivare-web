"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollObserver() {
    const pathname = usePathname();

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        e.target.classList.add("visible");
                        observer.unobserve(e.target);
                    }
                });
            },
            { threshold: 0.1 }
        );

        const observeElements = () => {
            document.querySelectorAll(".reveal:not(.visible)").forEach((el) => {
                observer.observe(el);
            });
        };

        // Trigger inicial p/ SSR / Static
        observeElements();

        // Mutator p/ Server Components com Streaming ou Client Navigation
        const mutationObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    observeElements();
                    break;
                }
            }
        });

        mutationObserver.observe(document.body, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
            mutationObserver.disconnect();
        };
    }, [pathname]);

    return null;
}
