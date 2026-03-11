import type { Metadata } from "next";
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
        <main className="min-h-screen bg-neutral-50 text-neutral-900 pt-20">

            {/* 1. Hero Orientado a Resultado */}
            <section className="relative pt-32 pb-24 bg-neutral-950 text-white overflow-hidden">
                <div className="container mx-auto px-4 max-w-5xl text-center relative z-10">
                    <span className="text-accent-400 font-bold tracking-widest uppercase text-sm mb-6 block">Gestão Profissional Vivare</span>
                    <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 leading-tight">
                        Seu patrimônio valorizado,<br /> sua agenda vazia.
                    </h1>
                    <p className="text-xl text-neutral-300 mb-10 max-w-3xl mx-auto">
                        Aumente a rentabilidade do seu imóvel com a nossa inteligência de mercado e operação 360º. Nós cuidamos de tudo.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="#contato" className="btn btn-accent text-lg px-8 py-4">Quero uma Consultoria Gratuita</a>
                        <OwnerPopupTrigger className="btn btn-secondary bg-transparent border-white text-white hover:bg-white/10 text-lg px-8 py-4">Falar com Consultor</OwnerPopupTrigger>
                    </div>
                </div>
            </section>

            {/* 2. Resultados (Números da Operação) */}
            <section className="py-12 bg-white border-b border-neutral-200">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap justify-center gap-12 md:gap-24 text-center">
                        <div>
                            <p className="text-4xl font-display font-bold text-primary-600 mb-2">30+</p>
                            <p className="text-sm text-neutral-500 font-semibold uppercase tracking-wider">Imóveis Gerenciados</p>
                        </div>
                        <div>
                            <p className="text-4xl font-display font-bold text-primary-600 mb-2">90%</p>
                            <p className="text-sm text-neutral-500 font-semibold uppercase tracking-wider">Ocupação Média</p>
                        </div>
                        <div>
                            <p className="text-4xl font-display font-bold text-primary-600 mb-2">2021</p>
                            <p className="text-sm text-neutral-500 font-semibold uppercase tracking-wider">Atuando Desde</p>
                        </div>
                        <div>
                            <p className="text-4xl font-display font-bold text-primary-600 mb-2">3</p>
                            <p className="text-sm text-neutral-500 font-semibold uppercase tracking-wider">Cidades Atendidas</p>
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
                        {/* Dashboard Mockup */}
                        <div className="aspect-square bg-neutral-950 rounded-3xl overflow-hidden flex flex-col text-white shadow-2xl border border-white/5">

                            {/* Top Bar */}
                            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-accent-400" />
                                    <span className="text-[11px] font-bold tracking-widest uppercase text-white/50">Painel Vivare</span>
                                </div>
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/50" />
                                </div>
                            </div>

                            {/* Receita Principal */}
                            <div className="px-5 pt-5 pb-3">
                                <p className="text-[11px] text-white/30 uppercase tracking-widest mb-1">Receita · Maio 2025</p>
                                <div className="flex items-end gap-3">
                                    <span className="text-3xl font-display font-bold text-white">R$ 4.820</span>
                                    <span className="mb-0.5 text-xs font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">↑ +23%</span>
                                </div>
                            </div>

                            {/* Métricas */}
                            <div className="grid grid-cols-2 gap-2.5 px-5 pb-3">
                                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                    <p className="text-[10px] text-white/30 mb-1">Ocupação</p>
                                    <p className="text-xl font-bold text-accent-400">92%</p>
                                    <div className="w-full bg-white/10 rounded-full h-1 mt-2">
                                        <div className="bg-accent-400 h-1 rounded-full w-[92%]" />
                                    </div>
                                </div>
                                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                    <p className="text-[10px] text-white/30 mb-1">Avaliação</p>
                                    <p className="text-xl font-bold text-yellow-400">100%</p>
                                    <div className="w-full bg-white/10 rounded-full h-1 mt-2">
                                        <div className="bg-yellow-400 h-1 rounded-full w-[98%]" />
                                    </div>
                                </div>
                            </div>

                            {/* Mini Gráfico de Barras */}
                            <div className="px-5 pb-3">
                                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Receita Semanal</p>
                                <div className="flex items-end gap-1 h-10">
                                    {[40, 65, 45, 80, 55, 95, 70].map((h, i) => (
                                        <div
                                            key={i}
                                            className={`flex-1 rounded-sm ${i === 5 ? 'bg-accent-400' : 'bg-white/15'}`}
                                            style={{ height: `${h}%` }}
                                        />
                                    ))}
                                </div>
                                <div className="flex mt-1">
                                    {['S','T','Q','Q','S','S','D'].map((d, i) => (
                                        <span key={i} className="flex-1 text-center text-[8px] text-white/20">{d}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Próximas Reservas */}
                            <div className="px-5 flex-1">
                                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Próximas Reservas</p>
                                <div className="space-y-1.5">
                                    {[
                                        { name: 'Lucas M.',  dates: '14–17 mai', value: 'R$ 640' },
                                        { name: 'Sarah B.',  dates: '19–22 mai', value: 'R$ 890' },
                                        { name: 'Ana C.',    dates: '24–26 mai', value: 'R$ 540' },
                                    ].map((r, i) => (
                                        <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-primary-900 flex items-center justify-center text-[9px] font-bold text-primary-300">
                                                    {r.name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold leading-tight">{r.name}</p>
                                                    <p className="text-[9px] text-white/30">{r.dates}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold text-green-400">{r.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="px-5 py-3.5 border-t border-white/5 mt-auto">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                    <span className="text-[10px] text-white/30">Repasse no 5° dia útil · Transparência total</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Prova Social Exclusiva */}
            <section className="py-24 bg-primary-900 text-white">
                <div className="container mx-auto px-4 max-w-5xl">
                    <h2 className="text-3xl md:text-4xl font-display font-bold mb-16 text-center">Proprietários que confiam na Vivare</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="card p-8 bg-white text-neutral-900 border-none shadow-xl transform hover:-translate-y-1 transition-transform">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-neutral-200 rounded-full"></div>
                                <div>
                                    <h4 className="font-bold text-lg">João Paulo Ferreira</h4>
                                    <p className="text-sm text-primary-600 font-semibold">Studio na Vila Mariana</p>
                                </div>
                            </div>
                            <p className="text-lg text-neutral-700 italic">&quot;Meu studio estava vazio há 2 meses com uma imobiliária tradicional. Depois de passar para a Vivare, em 3 semanas eles estruturaram o anúncio e fecharam a agenda do mês seguinte inteiro com 40% a mais de rentabilidade no m².&quot;</p>
                        </div>

                        <div className="card p-8 bg-white text-neutral-900 border-none shadow-xl transform hover:-translate-y-1 transition-transform">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-neutral-200 rounded-full"></div>
                                <div>
                                    <h4 className="font-bold text-lg">Marta Siqueira</h4>
                                    <p className="text-sm text-primary-600 font-semibold">Apartamento 2 Quartos, Guarujá</p>
                                </div>
                            </div>
                            <p className="text-lg text-neutral-700 italic">&quot;Moro fora do Brasil e não tinha como administrar o apartamento na praia. A Vivare cuida de tudo, desde limpeza até a menor das manutenções. Só recebo o repasse no quinto dia útil, sem dor de cabeça.&quot;</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Perfil do Imóvel Ideal */}
            <section className="py-24 bg-neutral-50 border-b border-neutral-200">
                <div className="container mx-auto px-4 text-center max-w-4xl">
                    <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Seu imóvel tem o perfil?</h2>
                    <p className="text-xl text-neutral-600 mb-12">Nossa operação é focada em alto padrão para garantir resultados superiores.</p>

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
