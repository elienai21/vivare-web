"use client";

import { useEffect } from "react";
import Link from "next/link";
import { WHATSAPP_URL } from "@/lib/constants";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[app/error]", error);
    }, [error]);

    return (
        <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-start justify-center px-6 py-20 lg:px-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-deep dark:text-primary-light">Algo deu errado</p>
            <h1 className="mt-3 font-display text-4xl font-bold text-foreground md:text-5xl">
                Não conseguimos carregar esta página.
            </h1>
            <span className="gold-line" aria-hidden="true"></span>
            <p className="max-w-prose text-base text-secondary-text">
                Pode ser uma instabilidade momentânea. Tente de novo em alguns segundos.
                Se precisar de ajuda agora, nossa equipe responde no WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={() => reset()}
                    className="inline-flex min-h-12 items-center bg-ink px-6 text-xs font-bold uppercase tracking-widest text-primary-light transition-colors hover:bg-primary hover:text-ink dark:bg-parchment dark:text-ink"
                >
                    Tentar de novo
                </button>
                <Link
                    href="/"
                    className="inline-flex min-h-12 items-center border border-primary px-6 text-xs font-semibold uppercase tracking-widest text-primary-deep transition-colors hover:bg-primary hover:text-ink dark:text-primary-light"
                >
                    Ir para o início
                </Link>
                <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-12 items-center px-2 text-xs font-semibold uppercase tracking-widest text-primary-deep underline-offset-4 hover:underline dark:text-primary-light"
                >
                    Falar no WhatsApp
                </a>
            </div>
            {error.digest && (
                <p className="mt-10 text-xs text-secondary-text">Código do erro: {error.digest}</p>
            )}
        </main>
    );
}
