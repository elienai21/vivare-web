import Link from "next/link";
import type { Metadata } from "next";
import { WHATSAPP_URL } from "@/lib/constants";

export const metadata: Metadata = {
    title: "Página não encontrada",
    robots: { index: false, follow: false },
};

export default function NotFound() {
    return (
        <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-start justify-center px-6 py-20 lg:px-10">
            <p className="chapeu">Erro 404</p>
            <h1 className="mt-3 font-display text-4xl font-normal text-foreground md:text-5xl">
                Esta página não existe mais.
            </h1>
            <span className="gold-line" aria-hidden="true"></span>
            <p className="max-w-prose text-base text-secondary-text">
                O endereço pode ter mudado ou a unidade pode ter saído do nosso portfólio.
                As acomodações disponíveis estão todas na lista abaixo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
                <Link
                    href="/unidades"
                    className="inline-flex min-h-12 items-center bg-ink px-6 text-xs font-bold uppercase tracking-widest text-primary-light transition-colors hover:bg-primary-light hover:text-ink dark:bg-parchment dark:text-ink"
                >
                    Ver acomodações
                </Link>
                <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-12 items-center border border-primary px-6 text-xs font-semibold uppercase tracking-widest text-primary-deep transition-colors hover:bg-primary-light hover:text-ink dark:text-primary-light"
                >
                    Falar no WhatsApp
                </a>
            </div>
        </main>
    );
}
