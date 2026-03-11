import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Finalizar Reserva",
    robots: { index: false, follow: false },
};

export default function ReservaPage() {
    return (
        <main className="min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-bold mb-8">Finalizar Reserva</h1>
                {/* Placeholder for Checkout Stays.net */}
            </div>
        </main>
    );
}
