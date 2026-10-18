import type { Metadata } from "next";
import { Suspense } from "react";
import { ConfirmacaoClient } from "./ConfirmacaoClient";

export const metadata: Metadata = {
    title: "Reserva Confirmada",
    description: "Sua reserva na Vivare foi confirmada com sucesso. Você receberá os detalhes por e-mail.",
    // Confirmation pages reflect a completed transaction tied to a session —
    // never useful as a search result.
    robots: { index: false, follow: false },
};

/**
 * Fim da jornada de reserva. Lê o estado real do checkout (PAID aguardando a
 * Stays, BOOKED confirmado) e mostra código, datas, valor e próximos passos.
 * Antes dizia "Confirmada!" para qualquer visita à URL.
 */
export default function ConfirmacaoReservaPage() {
    return (
        <main className="min-h-screen pt-10 md:pt-14 pb-20">
            <div className="container mx-auto px-4">
                <Suspense fallback={<p className="py-20 text-center text-secondary-text">Carregando…</p>}>
                    <ConfirmacaoClient />
                </Suspense>
            </div>
        </main>
    );
}
