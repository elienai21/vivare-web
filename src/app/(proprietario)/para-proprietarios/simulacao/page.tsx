import type { Metadata } from "next";
import { SimulacaoForm } from "@/components/forms/SimulacaoForm";

export const metadata: Metadata = {
    title: "Simulação de Rentabilidade",
    description: "Descubra quanto seu imóvel pode faturar com a gestão profissional da Vivare. Simulação gratuita e instantânea.",
    alternates: { canonical: "/para-proprietarios/simulacao" },
    openGraph: {
        title: "Simulação de Rentabilidade - Vivare",
        description: "Descubra o potencial de lucro do seu imóvel com nossa inteligência de mercado.",
    },
};

export default function SimulacaoPage() {
    return (
        <main className="min-h-screen pt-32 pb-12 bg-neutral-50 text-neutral-900 flex flex-col items-center justify-center">
            <div className="container mx-auto px-4 max-w-xl">

                <div className="text-center mb-10">
                    <span className="text-primary-600 font-bold tracking-widest uppercase text-sm mb-4 block">Gratuito · Sem Compromisso</span>
                    <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
                        Quanto seu imóvel pode faturar com a Vivare?
                    </h1>
                    <p className="text-lg text-neutral-600">
                        Com base no tipo e tamanho do seu imóvel, calculamos uma estimativa de faturamento mensal. Rápido, gratuito e sem nenhum compromisso.
                    </p>
                </div>

                <SimulacaoForm />

                <div className="mt-8 text-center text-sm text-neutral-500 max-w-md mx-auto">
                    Temos o rigoroso compromisso com seus dados. Ao avançar, você concorda com nossos <a href="/politica-de-privacidade" className="underline">Termos e Privacidade</a>.
                </div>
            </div>
        </main>
    );
}
