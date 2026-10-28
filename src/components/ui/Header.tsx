"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageCircle, X, Menu } from "lucide-react";
import { WHATSAPP_URL } from "@/lib/constants";

const NAV = [
    { href: "/unidades", label: "Acomodações" },
    { href: "/blog", label: "Blog" },
    { href: "/sobre", label: "Quem Somos" },
    { href: "/para-proprietarios", label: "Proprietários" },
] as const;

export function Header() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (href: string) =>
        href === "/" ? pathname === "/" : (pathname ?? "").startsWith(href);

    // Close menu on route change
    useEffect(() => {
        // eslint-disable-next-line
        setIsMenuOpen(false);
    }, [pathname]);

    // Close mobile menu on Escape, lock body scroll while it's open.
    useEffect(() => {
        if (!isMenuOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsMenuOpen(false);
        };
        document.addEventListener("keydown", handleKey);
        // Move focus into the panel so keyboard and screen-reader users land on it.
        document.getElementById("mobile-nav")?.querySelector<HTMLElement>("a")?.focus();

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKey);
        };
    }, [isMenuOpen]);

    const linkBase = "whitespace-nowrap py-3 text-xs font-semibold tracking-widest uppercase transition-colors";
    const linkIdle = "text-ink hover:text-primary-deep dark:text-parchment dark:hover:text-primary-light";
    const linkActive = "text-primary-deep dark:text-primary-light";

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/90 backdrop-blur-md h-[var(--header-h)]">
                <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
                    {/* A arte do SVG tem margem interna grande; o contêiner corta o excesso
                        para a logo não vazar sobre o conteúdo abaixo do cabeçalho. */}
                    <Link href="/" aria-label="Vivare, página inicial" className="relative flex h-full w-[190px] shrink-0 items-center overflow-hidden md:w-[200px] lg:w-[260px]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/new_logo_vivare_sem_fundo.svg"
                            alt=""
                            width={320}
                            height={240}
                            className="absolute left-0 top-1/2 h-[150px] w-auto max-w-none -translate-y-[47%] object-contain lg:h-[200px]"
                        />
                    </Link>

                    <nav aria-label="Principal" className="hidden md:flex items-center gap-5 lg:gap-8">
                        {NAV.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={isActive(item.href) ? "page" : undefined}
                                className={`${linkBase} ${isActive(item.href) ? linkActive : linkIdle}`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3">
                        <a
                            href={WHATSAPP_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden xl:inline-flex min-h-11 items-center gap-2 rounded-none border border-primary-deep px-5 text-xs font-semibold tracking-widest uppercase text-primary-deep transition-colors hover:bg-primary-light hover:border-primary hover:text-ink dark:border-primary dark:text-primary-light dark:hover:text-ink"
                        >
                            <MessageCircle className="w-4 h-4" aria-hidden="true" />
                            WhatsApp
                        </a>

                        <Link
                            href="/unidades"
                            className="hidden lg:inline-flex min-h-11 items-center rounded-none bg-ink px-5 text-xs font-bold tracking-widest uppercase text-primary-light transition-colors hover:bg-primary-light hover:text-ink dark:bg-parchment dark:text-ink dark:hover:bg-primary-light"
                        >
                            Reservar
                        </Link>

                        <button
                            type="button"
                            className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded text-ink dark:text-parchment focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
                            aria-expanded={isMenuOpen}
                            aria-controls="mobile-nav"
                        >
                            {isMenuOpen
                                ? <X className="w-6 h-6" aria-hidden="true" />
                                : <Menu className="w-6 h-6" aria-hidden="true" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Menu mobile: fora do <header> para não herdar o backdrop-filter;
                altura em dvh e rolagem própria para não travar no iOS. */}
            {isMenuOpen && (
                <div
                    id="mobile-nav"
                    className="md:hidden fixed inset-x-0 top-[var(--header-h)] bottom-0 z-50 overflow-y-auto overscroll-contain border-t border-primary/20 bg-background animate-in fade-in duration-150"
                >
                    <nav aria-label="Menu mobile" className="flex flex-col gap-1 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                        {NAV.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={isActive(item.href) ? "page" : undefined}
                                className={`min-h-12 flex items-center px-4 text-sm font-semibold tracking-widest uppercase transition-colors hover:bg-primary-dim ${isActive(item.href) ? linkActive : "text-ink dark:text-parchment"}`}
                            >
                                {item.label}
                            </Link>
                        ))}

                        <div className="border-t border-primary/20 my-4" aria-hidden="true"></div>

                        <Link
                            href="/unidades"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex min-h-12 w-full items-center justify-center rounded-none bg-ink px-6 text-xs font-bold tracking-widest uppercase text-primary-light transition-colors hover:bg-primary-light hover:text-ink dark:bg-parchment dark:text-ink"
                        >
                            Reservar Agora
                        </Link>
                        <a
                            href={WHATSAPP_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-none border border-primary px-6 text-xs font-semibold tracking-widest uppercase text-primary-deep transition-colors hover:bg-primary-light hover:text-ink dark:text-primary-light"
                        >
                            <MessageCircle className="w-4 h-4" aria-hidden="true" />
                            Falar no WhatsApp
                        </a>
                    </nav>
                </div>
            )}
        </>
    );
}
