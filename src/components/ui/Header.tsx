"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageCircle, X, Menu } from "lucide-react";

export function Header() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);

    // Detect dark mode
    useEffect(() => {
        const check = () => setIsDark(document.documentElement.classList.contains('dark'));
        check();
        const observer = new MutationObserver(check);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

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

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKey);
        };
    }, [isMenuOpen]);

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background-light/90 backdrop-blur-md dark:border-primary/20 dark:bg-background-dark/90 h-[100px] md:h-[120px]">
                <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 lg:px-10">
                    <div className="flex items-center gap-3 h-full">
                        <Link href="/" className="relative flex items-center h-full w-[240px] md:w-[320px]">
                            {/* SVG logo: next/image gives no benefit for vectors and `w-auto`
                                conflicts with its required width prop. Keep <img> + explicit
                                dimensions to prevent CLS. */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/new_logo_vivare_sem_fundo.svg"
                                alt="VIVARE"
                                width={320}
                                height={240}
                                className="absolute left-0 top-1/2 -translate-y-[45%] h-[200px] md:h-[240px] w-auto object-contain max-w-none"
                            />
                        </Link>
                    </div>

                    <nav className="hidden md:flex items-center gap-10">
                        <Link href="/unidades" className="text-xs font-semibold tracking-widest uppercase hover:text-primary transition-colors">Acomodações</Link>
                        <Link href="/blog" className="text-xs font-semibold tracking-widest uppercase hover:text-primary transition-colors">Blog</Link>
                        <Link href="/sobre" className="text-xs font-semibold tracking-widest uppercase hover:text-primary transition-colors">Quem Somos</Link>
                        <Link href="/para-proprietarios" className="text-xs font-semibold tracking-widest uppercase hover:text-primary transition-colors text-primary">Proprietários</Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <a href="https://wa.me/5511985067840"
                            className="hidden lg:flex items-center gap-2 rounded-none border border-primary px-6 py-2.5 text-xs font-semibold tracking-widest uppercase text-primary transition-all hover:bg-primary hover:text-ink dark:hover:text-ink">
                            <MessageCircle className="w-4 h-4" aria-hidden="true" />
                            WhatsApp
                        </a>

                        <Link href="/unidades"
                            className="hidden md:flex rounded-none bg-ink dark:bg-parchment px-6 py-2.5 text-xs font-bold tracking-widest uppercase text-primary-light dark:text-ink transition-all hover:bg-primary dark:hover:bg-primary hover:text-ink">
                            Reservar
                        </Link>

                        <button
                            type="button"
                            className="md:hidden p-2 text-ink dark:text-parchment focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
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

            {/* Mobile Menu Overlay — fora do <header> para evitar conflito com backdrop-filter */}
            {isMenuOpen && (
                <div
                    id="mobile-nav"
                    className="md:hidden fixed inset-0 top-[100px] z-50 border-t border-primary/20"
                    style={{ backgroundColor: isDark ? '#0f0e0c' : '#f7f8fa' }}
                >
                    <nav aria-label="Menu mobile" className="flex flex-col p-6 gap-2">
                        <Link href="/unidades" className="text-sm font-semibold tracking-widest uppercase py-3 px-4 transition-colors hover:bg-primary/10">Acomodações</Link>
                        <Link href="/blog" className="text-sm font-semibold tracking-widest uppercase py-3 px-4 transition-colors hover:bg-primary/10">Blog</Link>
                        <Link href="/sobre" className="text-sm font-semibold tracking-widest uppercase py-3 px-4 transition-colors hover:bg-primary/10">Quem Somos</Link>
                        <Link href="/para-proprietarios" className="text-sm font-semibold tracking-widest uppercase py-3 px-4 text-primary transition-colors hover:bg-primary/10">Proprietários</Link>

                        <div className="border-t border-primary/20 my-4" aria-hidden="true"></div>

                        <div onClick={() => setIsMenuOpen(false)}>
                            <Link href="/unidades" className="flex items-center justify-center w-full rounded-none bg-ink dark:bg-parchment px-6 py-4 text-xs font-bold tracking-widest uppercase text-primary-light dark:text-ink transition-all hover:bg-primary">
                                Reservar Agora
                            </Link>
                        </div>
                    </nav>
                </div>
            )}
        </>
    );
}
