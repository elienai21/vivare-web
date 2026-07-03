import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Reserva Confirmada",
    description: "Sua reserva na Vivare foi confirmada com sucesso. Você receberá os detalhes por e-mail.",
    // Confirmation pages reflect a completed transaction tied to a session —
    // never useful as a search result.
    robots: { index: false, follow: false },
};

export default function ConfirmacaoReservaPage() {
    return (
        <main className="min-h-screen pt-24 pb-12 text-center">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-bold mb-4 text-success">Reserva Confirmada!</h1>
                <p className="text-neutral-600">Obrigado por escolher a Vivare.</p>
            </div>
        </main>
    );
}
