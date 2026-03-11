"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { X, Menu } from "lucide-react";

export function Header() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Close menu on route change
    useEffect(() => {
        // eslint-disable-next-line
        setIsMenuOpen(false);
    }, [pathname]);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background-light/90 backdrop-blur-md dark:border-primary/20 dark:bg-background-dark/90 h-[100px] md:h-[120px]">
            <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 lg:px-10">
                <div className="flex items-center gap-3 h-full">
                    <Link href="/" className="relative flex items-center h-full w-[240px] md:w-[320px]">
                        <img src="/new_logo_vivare_sem_fundo.svg" alt="VIVARE" className="absolute left-0 top-1/2 -translate-y-[45%] h-[200px] md:h-[240px] w-auto object-contain max-w-none" />
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
                        <span className="material-symbols-outlined text-sm">chat</span>
                        WhatsApp
                    </a>

                    <Link href="/unidades"
                        className="hidden md:flex rounded-none bg-ink dark:bg-parchment px-6 py-2.5 text-xs font-bold tracking-widest uppercase text-primary-light dark:text-ink transition-all hover:bg-primary dark:hover:bg-primary hover:text-ink">
                        Reservar
                    </Link>

                    <button
                        className="md:hidden p-2 text-ink dark:text-parchment"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden fixed inset-0 top-[120px] z-40 bg-background-light dark:bg-background-dark animate-in slide-in-from-top-2 fade-in duration-300 border-t border-primary/20">
                    <nav className="flex flex-col p-6 gap-2">
                        <Link href="/unidades" className="text-sm font-semibold tracking-widest uppercase py-3 px-4 transition-colors hover:bg-primary/10">Acomodações</Link>
                        <Link href="/blog" className="text-sm font-semibold tracking-widest uppercase py-3 px-4 transition-colors hover:bg-primary/10">Blog</Link>
                        <Link href="/sobre" className="text-sm font-semibold tracking-widest uppercase py-3 px-4 transition-colors hover:bg-primary/10">Quem Somos</Link>
                        <Link href="/para-proprietarios" className="text-sm font-semibold tracking-widest uppercase py-3 px-4 text-primary transition-colors hover:bg-primary/10">Proprietários</Link>

                        <div className="border-t border-primary/20 my-4"></div>

                        <div onClick={() => setIsMenuOpen(false)}>
                            <Link href="/unidades" className="flex items-center justify-center w-full rounded-none bg-ink dark:bg-parchment px-6 py-4 text-xs font-bold tracking-widest uppercase text-primary-light dark:text-ink transition-all hover:bg-primary">
                                Reservar Agora
                            </Link>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
