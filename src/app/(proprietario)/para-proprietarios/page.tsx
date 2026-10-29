import Link from "next/link";
import type { Metadata } from "next";
import { PROOF } from "@/lib/constants";
import { OwnerPopupTrigger } from "@/components/ui/OwnerPopupTrigger";
import { OwnerContactForm } from "@/components/forms/OwnerContactForm";

export const metadata: Metadata = {
    title: "Gestão Profissional para Proprietários",
    description: "Seu imóvel pode render muito mais. Zero dor de cabeça, gestão 360º de locação temporada em São Paulo, Santos e Guarujá.",
    alternates: { canonical: "/para-proprietarios" },
    openGraph: {
        title: "Gestão Profissional para Proprietários - Vivare",
        description: "Aumente a rentabilidade do seu imóvel com gestão profissional. +40% de rentabilidade, >90% de ocupação.",
    },
};

export default function ParaProprietariosPage() {
    return (
        <main className="min-h-screen bg-background text-foreground">

            {/* 1. Hero Orientado a Resultado */}
            <section className="relative pt-20 md:pt-28 pb-24 bg-ink text-white overflow-hidden">
                <div className="container mx-auto px-4 max-w-5xl text-center relative z-10">
                    <span className="text-accent-400 font-bold tracking-widest uppercase text-sm mb-6 block">Gestão Profissional Vivare</span>
                    <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 leading-tight text-balance">
                        Seu imóvel rende. Você não opera.
                    </h1>
                    <p className="text-xl text-warm-mid mb-10 max-w-3xl mx-auto">
                        Gestão completa de locação por temporada em São Paulo, Santos e Guarujá: anúncio, hóspede, limpeza e manutenção por nossa conta. Cobramos só comissão sobre as reservas, com repasse no 5º dia útil.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="#contato" className="btn btn-accent text-lg px-8 py-4">Quero uma Consultoria Gratuita</a>
                        <OwnerPopupTrigger className="btn btn-secondary bg-transparent border-white text-white hover:bg-white/10 text-lg px-8 py-4">Falar com Consultor</OwnerPopupTrigger>
                    </div>
                </div>
            </section>

            {/* 2. Resultados (Números da Operação) */}
            <section className="py-12 bg-card border-b border-card-border">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap justify-center gap-10 md:gap-20 text-center">
                        <div>
                            <p className="text-4xl font-display font-bold text-primary-deep dark:text-primary-light mb-2">{PROOF.rating}</p>
                            <p className="text-sm text-secondary-text font-semibold uppercase tracking-wider">Nota média · {PROOF.reviews} avaliações</p>
                        </div>
                        <div>
                            <p className="text-4xl font-display font-bold text-primary-deep dark:text-primary-light mb-2">{PROOF.hostingYears} anos</p>
                            <p className="text-sm text-secondary-text font-semibold uppercase tracking-wider">Hospedando como Superhost</p>
                        </div>
                        <div>
                            <p className="text-4xl font-display font-bold text-primary-deep dark:text-primary-light mb-2">{PROOF.foundedYear}</p>
                            <p className="text-sm text-secondary-text font-semibold uppercase tracking-wider">Atuando desde</p>
                        </div>
                        <div>
                            <p className="text-4xl font-display font-bold text-primary-deep dark:text-primary-light mb-2">{PROOF.cities.length}</p>
                            <p className="text-sm text-secondary-text font-semibold uppercase tracking-wider">Cidades atendidas</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Como Funciona (4 Etapas) */}
            <section className="py-24">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-display font-bold mb-4">Como assumimos o seu imóvel</h2>
                        <p className="text-xl text-neutral-600 max-w-2xl mx-auto">Um processo simples e transparente para você começar a faturar mais rápido.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="card p-8 bg-white text-center relative overflow-hidden">
                            <div className="text-6xl font-display font-bold text-neutral-100 absolute -top-4 -right-2">1</div>
                            <h3 className="text-xl font-bold mb-4 relative z-10">Captação e Análise</h3>
                            <p className="text-neutral-600 relative z-10">Validamos o potencial do seu imóvel e alinhamos expectativas de rentabilidade.</p>
                        </div>
                        <div className="card p-8 bg-white text-center relative overflow-hidden">
                            <div className="text-6xl font-display font-bold text-neutral-100 absolute -top-4 -right-2">2</div>
                            <h3 className="text-xl font-bold mb-4 relative z-10">Preparação</h3>
                            <p className="text-neutral-600 relative z-10">Fotografia profissional, cadastro multiplataforma e precificação dinâmica inteligente.</p>
                        </div>
                        <div className="card p-8 bg-white text-center relative overflow-hidden">
                            <div className="text-6xl font-display font-bold text-neutral-100 absolute -top-4 -right-2">3</div>
                            <h3 className="text-xl font-bold mb-4 relative z-10">Operação</h3>
                            <p className="text-neutral-600 relative z-10">Limpeza profissional, manutenção, atendimento dedicado e check-in digital.</p>
                        </div>
                        <div className="card p-8 bg-white text-center relative overflow-hidden">
                            <div className="text-6xl font-display font-bold text-neutral-100 absolute -top-4 -right-2">4</div>
                            <h3 className="text-xl font-bold mb-4 relative z-10">Repasse</h3>
                            <p className="text-neutral-600 relative z-10">Você recebe relatórios transparentes todos os meses junto com o seu lucro.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. O que a Vivare Cuida */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl font-display font-bold mb-6">Nós cuidamos absolutamente de tudo.</h2>
                            <p className="text-lg text-neutral-600 mb-8">Da criação do anúncio à troca da resistência do chuveiro. Nosso objetivo é que você não se preocupe com a operação da sua hospedagem.</p>
                            <ul className="space-y-4">
                                {[
                                    "Anúncios nas principais plataformas (Airbnb, Booking, etc.)",
                                    "Precificação dinâmica e inteligente para máxima rentabilidade",
                                    "Atendimento premium e personalizado ao hóspede",
                                    "Equipe própria de limpeza de hotelaria e manutenção preventiva",
                                    "Vistoria completa após check-out rigorosa",
                                    "Painel financeiro transparente e prestação de contas"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <span className="text-success text-xl">✓</span>
                                        <span className="font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* Prova real no lugar do painel ilustrativo (PRODUCT.md: nada inventado) */}
                        <div className="rounded-3xl bg-ink text-parchment p-8 md:p-10 border border-primary/20 shadow-2xl">
                            <p className="text-xs font-bold uppercase tracking-[.25em] text-primary-light">Como você acompanha</p>
                            <ul className="mt-6 space-y-6">
                                <li>
                                    <p className="font-display text-3xl font-bold leading-none">5º dia útil</p>
                                    <p className="mt-1 text-sm text-warm-mid">Repasse do mês anterior, todo mês, com relatório detalhado.</p>
                                </li>
                                <li>
                                    <p className="font-display text-3xl font-bold leading-none">Só comissão</p>
                                    <p className="mt-1 text-sm text-warm-mid">Cobramos sobre as reservas realizadas. Sem mensalidade e sem taxa de adesão.</p>
                                </li>
                                <li>
                                    <p className="font-display text-3xl font-bold leading-none">{PROOF.rating} · Superhost</p>
                                    <p className="mt-1 text-sm text-warm-mid">{PROOF.reviews} avaliações de hóspedes e {PROOF.hostingYears} anos hospedando como Superhost no Airbnb, a mesma operação que cuida do seu imóvel.</p>
                                </li>
                            </ul>
                            <div className="mt-8 border-t border-primary/20 pt-6">
                                <Link href="/para-proprietarios/simulacao" className="btn btn-accent w-full">Simular o faturamento do meu imóvel</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Prova Social Exclusiva */}
            <section className="py-24 bg-ink text-parchment">
                <div className="container mx-auto px-4 max-w-5xl">
                    <h2 className="text-3xl md:text-4xl font-display font-bold mb-16 text-center">Proprietários que confiam na Vivare</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="card card-interactive p-8 bg-paper text-ink border-none shadow-xl">
                            <div className="mb-6">
                                <p className="font-display font-bold text-lg">João Paulo Ferreira</p>
                                <p className="text-sm text-primary-deep font-semibold">Studio na Vila Mariana</p>
                            </div>
                            <p className="text-lg text-neutral-700 italic">&quot;Meu studio estava vazio há 2 meses com uma imobiliária tradicional. Depois de passar para a Vivare, em 3 semanas eles estruturaram o anúncio e fecharam a agenda do mês seguinte inteiro com 40% a mais de rentabilidade no m².&quot;</p>
                        </div>

                        <div className="card card-interactive p-8 bg-paper text-ink border-none shadow-xl">
                            <div className="mb-6">
                                <p className="font-display font-bold text-lg">Marta Siqueira</p>
                                <p className="text-sm text-primary-deep font-semibold">Apartamento 2 quartos, Guarujá</p>
                            </div>
                            <p className="text-lg text-neutral-700 italic">&quot;Moro fora do Brasil e não tinha como administrar o apartamento na praia. A Vivare cuida de tudo, desde limpeza até a menor das manutenções. Só recebo o repasse no quinto dia útil, sem dor de cabeça.&quot;</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Perfil do Imóvel Ideal */}
            <section className="py-24 bg-background border-b border-card-border">
                <div className="container mx-auto px-4 text-center max-w-4xl">
                    <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Seu imóvel tem o perfil?</h2>
                    <p className="text-xl text-secondary-text mb-12">Nossa operação é focada em alto padrão para garantir resultados superiores.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm">
                            <h3 className="font-bold text-lg mb-2">Tipologias</h3>
                            <p className="text-neutral-600">Studios bem decorados, lofts, 1 e 2 quartos com suíte, apartamentos de condomínio clube e coberturas.</p>
                        </div>
                        <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm">
                            <h3 className="font-bold text-lg mb-2">Localizações</h3>
                            <p className="text-neutral-600">São Paulo (prox. a metrôs e centros comerciais), Santos (orla) e Guarujá (frente mar ou quadra da praia).</p>
                        </div>
                        <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm">
                            <h3 className="font-bold text-lg mb-2">Estado</h3>
                            <p className="text-neutral-600">Mobiliados, reformados, com internet de alta velocidade e enxoval básico de qualidade.</p>
                        </div>
                    </div>
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/para-proprietarios/simulacao" className="btn btn-accent px-8">Meu imóvel se encaixa: simular faturamento</Link>
                        <a href="#contato" className="btn btn-secondary px-8">Falar com um especialista</a>
                    </div>
                </div>
            </section>

            {/* 7. Formulário de Captura */}
            <section id="contato" className="py-24 bg-white relative">
                <div className="container mx-auto px-4 max-w-3xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Pronto para dar o próximo passo?</h2>
                        <p className="text-xl text-neutral-600">Preencha os dados e receba o contato de nossos especialistas em até 24h úteis.</p>
                    </div>

                    <OwnerContactForm />
                </div>
            </section>

            {/* 8. FAQ Proprietários */}
            <section className="py-24 bg-neutral-50">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-3xl md:text-4xl font-display font-bold mb-12 text-center">Dúvidas Frequentes da Operação</h2>
                    <div className="space-y-6">
                        <div className="border border-neutral-200 rounded-xl p-6 bg-white shadow-sm">
                            <h3 className="text-xl font-bold mb-2">Quais são os custos para começar?</h3>
                            <p className="text-neutral-600">A Vivare cobra apenas o comissionamento sobre as reservas realizadas. Na implantação, há custos iniciais de limpeza profissional e ensaio fotográfico, que podem ser descontados diretamente do primeiro repasse.</p>
                        </div>
                        <div className="border border-neutral-200 rounded-xl p-6 bg-white shadow-sm">
                            <h3 className="text-xl font-bold mb-2">Como sei quem está entrando no meu imóvel?</h3>
                            <p className="text-neutral-600">Todos os hóspedes passam por um processo rigoroso de verificação de identidade no check-in digital antes de receberem as chaves/senhas.</p>
                        </div>
                        <div className="border border-neutral-200 rounded-xl p-6 bg-white shadow-sm">
                            <h3 className="text-xl font-bold mb-2">E se houver quebras ou prejuízos?</h3>
                            <p className="text-neutral-600">Plataformas como o Airbnb possuem seguros (AirCover). Além disso, a Vivare realiza vistorias profundas a cada check-out e cobra eventuais danos diretamente do hóspede antes do próximo entrar.</p>
                        </div>
                    </div>
                </div>
            </section>

        </main>
    );
}
