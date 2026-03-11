"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getPublishedPage } from "@/services/cmsService";

export default function SobrePage() {

    const [cms, setCms] = useState<Record<string, string>>({});

    // Carregar dados do CMS (Firestore → publicado)
    useEffect(() => {
        getPublishedPage("sobre").then(page => {
            if (page?.content) setCms(page.content);
        });
    }, []);

    // Intersection Observer for scroll reveal effect
    useEffect(() => {
        const reveals = document.querySelectorAll('.reveal');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.12 });
        reveals.forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <main className="min-h-screen bg-[#0f0e0c] text-[#f5f0e8] font-sans selection:bg-[#b89a5c] selection:text-[#0f0e0c]">

            {/* Grain Overlay */}
            <div
                className="fixed inset-0 pointer-events-none z-[9999] opacity-60 mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`
                }}
            />

            <style dangerouslySetInnerHTML={{
                __html: `
        .reveal { opacity: 0; transform: translateY(30px); transition: opacity .8s ease, transform .8s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .display-text { font-family: var(--font-display); }
      `}} />

            {/* HERO SECTION */}
            <section className="min-h-screen grid grid-cols-1 md:grid-cols-2 relative overflow-hidden pt-20 md:pt-0">
                <div className="relative h-[50vh] md:h-full overflow-hidden order-2 md:order-1 hidden md:block">
                    <img
                        src={cms.heroImage || "https://images.unsplash.com/photo-1548142813-c348350df52b?w=900&q=80"}
                        alt="São Paulo – Grupo Vivare"
                        className="w-full h-full object-cover filter brightness-50 sepia-[.2] scale-105 animate-[slowZoom_14s_ease-out_forwards]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0f0e0c] hidden md:block" />
                </div>

                <div className="flex flex-col justify-center px-8 py-16 md:p-20 relative order-1 md:order-2 z-10">
                    <p className="text-[11px] tracking-[0.3em] uppercase text-[#b89a5c] mb-8 animate-[fadeUp_0.8s_0.4s_ease_forwards] opacity-0">
                        Grupo Vivare · São Paulo
                    </p>
                    <h1 className="display-text text-5xl md:text-[5.5rem] font-light leading-[1.05] mb-8 animate-[fadeUp_0.9s_0.6s_ease_forwards] opacity-0">
                        Cuidamos do<br />seu imóvel como<br /><em className="italic text-[#d4b87a]">se fosse nosso.</em>
                    </h1>
                    <div className="w-12 h-px bg-[#b89a5c] mb-8 animate-[fadeUp_0.8s_0.8s_ease_forwards] opacity-0" />
                    <p className="text-base leading-[1.8] text-[#e8e0d0] max-w-[38ch] animate-[fadeUp_0.8s_1s_ease_forwards] opacity-0 font-light">
                        Somos a empresa de gestão de locação por temporada que une tecnologia, hospitalidade genuína e comprometimento financeiro — para que cada apartamento renda mais, sem que o proprietário precise se preocupar com nada.
                    </p>
                </div>

                <span className="absolute right-8 top-1/2 -translate-y-1/2 rotate-90 text-[10px] tracking-[0.3em] uppercase text-[#7a7060] whitespace-nowrap hidden md:block z-20">
                    São Paulo · Santos · Guarujá
                </span>
            </section>

            {/* STATS BAR */}
            <div className="bg-[#b89a5c] py-12 px-8 flex flex-col md:flex-row justify-center items-center gap-12 md:gap-0">
                {[
                    { num: "30+", label: "Unidades gerenciadas" },
                    { num: "2021", label: "Atuando desde" },
                    { num: "3", label: "Cidades atendidas" },
                    { num: "Dedicado", label: "Suporte ao hóspede" }
                ].map((stat, i) => (
                    <div key={i} className="flex-1 text-center md:border-r border-[#0f0e0c]/20 last:border-0 px-8">
                        <span className="display-text text-5xl md:text-6xl font-light text-[#0f0e0c] block leading-none mb-2">{stat.num}</span>
                        <span className="text-[11px] tracking-[0.2em] uppercase text-[#0f0e0c]/70 block">{stat.label}</span>
                    </div>
                ))}
            </div>

            {/* MANIFESTO */}
            <section className="bg-[#f5f0e8] text-[#0f0e0c] relative overflow-hidden py-32 px-8">
                <div className="absolute -top-16 -left-12 display-text text-[40rem] leading-[0.8] text-[#b89a5c]/10 select-none pointer-events-none">
                    &quot;
                </div>
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 md:gap-24 items-start relative z-10">
                    <span className="text-[11px] tracking-[0.3em] uppercase text-[#c8a96e] pt-2 reveal">Nossa crença</span>
                    <p className="display-text text-3xl md:text-5xl font-normal leading-[1.4] text-[#0f0e0c] reveal">
                        Acreditamos que um imóvel bem gerido não é apenas um ativo financeiro —
                        é o cenário onde pessoas vivem <strong className="font-semibold text-[#6b5020]">momentos inesquecíveis</strong>.
                        Nossa missão é ser o elo que torna isso possível,
                        com integridade, transparência e excelência operacional.
                    </p>
                </div>
            </section>

            {/* STORY */}
            <section className="bg-[#0f0e0c] text-[#f5f0e8] py-32 px-8">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 items-center">
                    <div className="relative reveal">
                        <img
                            src={cms.storyImage || "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=700&q=80"}
                            alt="Apartamento gerenciado pela Vivare"
                            className="w-full h-[400px] md:h-[520px] object-cover filter brightness-[0.7] sepia-[0.15]"
                        />
                        <div className="absolute -bottom-6 -right-6 md:-bottom-6 md:-right-6 bg-[#b89a5c] text-[#0f0e0c] p-6 display-text text-lg italic leading-[1.4] max-w-[220px]">
                            &quot;Cada imóvel é tratado com atenção de boutique.&quot;
                        </div>
                    </div>
                    <div className="reveal" style={{ transitionDelay: '0.2s' }}>
                        <span className="text-[11px] tracking-[0.3em] uppercase text-[#b89a5c] mb-6 block">Nossa história</span>
                        <h2 className="display-text text-4xl md:text-6xl font-light leading-[1.15] mb-6">
                            Nascemos em <em className="italic text-[#d4b87a]">São Paulo</em>,<br />pensando no Brasil.
                        </h2>
                        <div className="w-12 h-px bg-[#b89a5c] mb-8" />
                        <div className="space-y-5 text-[15px] leading-[1.9] text-[#e8e0d0] font-light">
                            <p>
                                A Vivare nasceu em 2021, não de uma teoria, mas da prática. Começamos administrando nossos próprios apartamentos para entender, em primeira mão, o que define uma experiência de excelência.
                            </p>
                            <p>
                                Após um ano consolidando processos e conquistando resultados, abrimos nossa gestão para parceiros, oferecendo a <strong className="font-medium text-[#d4b87a]">segurança</strong> e a <strong className="font-medium text-[#d4b87a]">expertise</strong> que gostaríamos de ter tido no início.
                            </p>
                            <p>
                                Hoje, essa base sólida é o pilar da confiança que nossos parceiros depositam em nós. Gerenciamos imóveis nas principais regiões de São Paulo e litoral, com uma carteira crescente de proprietários satisfeitos e hóspedes que retornam.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* MVV SECTION */}
            <section className="bg-[#161410] relative pt-32 pb-0">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#b89a5c] to-transparent" />
                <div className="max-w-6xl mx-auto px-8">
                    <div className="text-center mb-24 reveal">
                        <span className="text-[11px] tracking-[0.3em] uppercase text-[#b89a5c] mb-4 block">O que nos move</span>
                        <h2 className="display-text text-4xl md:text-5xl font-light">
                            Missão, Visão <em className="italic text-[#d4b87a]">e</em> Valores
                        </h2>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-[3px] bg-[#b89a5c]/15">
                    {[
                        {
                            n: "01", label: "Missão", title: "Transformar imóveis em resultados reais.",
                            text: "Oferecer aos proprietários uma solução completa, transparente e lucrativa de gestão de locação por temporada, enquanto proporcionamos experiências memoráveis."
                        },
                        {
                            n: "02", label: "Visão", title: "Referência em gestão no litoral e capital.",
                            text: "Até 2027, consolidar-nos como a gestora mais confiável e bem avaliada de SP, reconhecida pela excelência operacional e rentabilidade entregue.",
                            delay: "0.15s"
                        },
                        {
                            n: "03", label: "Propósito", title: "Cuidar de quem confia em nós.",
                            text: "Cada decisão — da precificação ao reparo emergencial — parte do mesmo princípio: agir como agiríamos com nosso próprio patrimônio.",
                            delay: "0.3s"
                        }
                    ].map((item, i) => (
                        <div key={i} className="bg-[#161410] p-12 relative overflow-hidden group hover:bg-[#1c1a16] transition-colors reveal" style={{ transitionDelay: item.delay || '0s' }}>
                            <div className="absolute bottom-0 inset-x-0 h-[3px] bg-[#b89a5c] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
                            <span className="display-text text-[6rem] leading-[0.85] font-light text-[#b89a5c]/10 absolute top-6 right-8">{item.n}</span>
                            <p className="text-[10px] tracking-[0.35em] uppercase text-[#b89a5c] mb-4">{item.label}</p>
                            <h3 className="display-text text-3xl md:text-4xl text-[#f5f0e8] leading-[1.15] mb-6 font-normal pr-4">{item.title}</h3>
                            <p className="text-sm leading-[1.8] text-[#7a7060]">{item.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* VALUES SECTION (Text List) */}
            <section className="bg-[#f5f0e8] text-[#0f0e0c] py-32 px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-20 reveal">
                        <span className="text-[11px] tracking-[0.3em] uppercase text-[#8b6c2a] mb-4 block">Nossos valores</span>
                        <h2 className="display-text text-4xl md:text-5xl font-light max-w-[20ch] mb-8">
                            Os princípios que guiam <em className="italic text-[#8b6c2a]">cada decisão.</em>
                        </h2>
                        <div className="w-12 h-px bg-[#8b6c2a]" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-[#b89a5c]/30">
                        {[
                            { icon: 'I', title: 'Integridade acima de tudo', desc: 'Cada centavo demonstrado. Sem taxas ocultas.', delay: '0s' },
                            { icon: 'E', title: 'Excelência operacional', desc: 'Limpeza à manutenção focada na perfeição.', delay: '0.1s' },
                            { icon: 'C', title: 'Comprometimento com o resultado', desc: 'O nosso sucesso é atrelado ao seu.', delay: '0.05s' },
                            { icon: 'H', title: 'Hospitalidade genuína', desc: 'Como se recebessemos em nossa casa.', delay: '0.15s' },
                            { icon: 'T', title: 'Tecnologia p/ pessoas', desc: 'Ferramentas digitais de alta precisão.', delay: '0.1s' },
                            { icon: 'P', title: 'Parceria de longo prazo', desc: 'Construímos laços profundos de confiança.', delay: '0.2s' },
                        ].map((val, i) => (
                            <div key={i} className={`p-10 border-b border-[#b89a5c]/30 flex gap-8 hover:bg-[#b89a5c]/5 transition-colors reveal md:pr-12 ${i % 2 === 0 ? 'md:border-r border-[#b89a5c]/30 md:pl-0' : 'md:pl-12'}`} style={{ transitionDelay: val.delay }}>
                                <div className="w-12 h-12 border border-[#b89a5c] text-[#b89a5c] display-text text-2xl flex items-center justify-center shrink-0">
                                    {val.icon}
                                </div>
                                <div>
                                    <h4 className="display-text text-2xl font-medium text-[#0f0e0c] mb-2">{val.title}</h4>
                                    <p className="text-[14px] leading-[1.75] text-[#5a5040]">{val.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TEAM */}
            <section className="bg-[#0f0e0c] py-32 px-8 overflow-hidden">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-16 reveal">
                        <span className="text-[11px] tracking-[0.3em] uppercase text-[#b89a5c] mb-4 block">Quem está por trás</span>
                        <h2 className="display-text text-4xl md:text-5xl font-light mb-6">Uma equipe que <em className="italic text-[#d4b87a]">vive</em> o que vende.</h2>
                        <div className="w-12 h-px bg-[#b89a5c]" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-12 md:gap-20 items-center">
                        <div className="relative reveal">
                            <img
                                src={cms.founderPhoto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80"}
                                alt={cms.founderName || "Elienai Cordeiro – Fundador Grupo Vivare"}
                                className="w-full h-[500px] md:h-[580px] object-cover object-top filter brightness-[0.75] sepia-[0.1]"
                            />
                            <div className="absolute top-8 -left-4 md:-left-6 bg-[#b89a5c] text-[#0f0e0c] py-2 px-6 text-[11px] tracking-[0.2em] uppercase font-medium">
                                {cms.founderRole || "Fundador & CEO"}
                            </div>
                        </div>
                        <div className="reveal" style={{ transitionDelay: '0.2s' }}>
                            <h3 className="display-text text-4xl md:text-5xl font-light text-[#f5f0e8] mb-2">{cms.founderName || "Elienai Cordeiro"}</h3>
                            <p className="text-[11px] tracking-[0.25em] uppercase text-[#b89a5c] mb-8">{cms.founderRole ? `${cms.founderRole} · Grupo Vivare` : "Fundador · Grupo Vivare"}</p>

                            {cms.founderBio ? (
                                <div
                                    className="space-y-4 text-[15px] leading-[1.9] text-[#e8e0d0] font-light [&>p]:mb-4"
                                    dangerouslySetInnerHTML={{ __html: cms.founderBio }}
                                />
                            ) : (
                                <div className="space-y-4 text-[15px] leading-[1.9] text-[#e8e0d0] font-light">
                                    <p>Elienai Cordeiro construiu a Vivare a partir de uma experiência direta com o mercado imobiliário de São Paulo: a percepção de que havia um abismo entre o potencial dos imóveis de temporada e a qualidade de gestão disponível no mercado.</p>
                                    <p>Com formação em gestão de negócios e anos de atuação no setor imobiliário, ele reuniu uma equipe com o mesmo comprometimento com resultado e hospitalidade — e criou uma operação que hoje gerencia dezenas de imóveis nas principais cidades do estado de São Paulo.</p>
                                    <p>&quot;Meu objetivo sempre foi simples: que o proprietário durma tranquilo sabendo que o imóvel está sendo tratado como nosso, e que o hóspede acorde feliz de ter escolhido estar aqui.&quot;</p>
                                </div>
                            )}

                            <blockquote className="border-l-2 border-[#b89a5c] pl-6 mt-10 display-text text-2xl md:text-3xl italic text-[#d4b87a] leading-relaxed">
                                &quot;{cms.founderQuote || "Gestão de temporada não é administrar imóveis. É administrar experiências e confiança."}&quot;
                            </blockquote>
                        </div>
                    </div>

                    {/* Sócio 2 — aparece apenas se preenchido no admin */}
                    {(cms.partner2Name || cms.partner2Photo) && (
                        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-12 md:gap-20 items-center mt-20 pt-20 border-t border-[#ffffff10]">
                            <div className="reveal" style={{ transitionDelay: '0.2s' }}>
                                <h3 className="display-text text-4xl md:text-5xl font-light text-[#f5f0e8] mb-2">{cms.partner2Name}</h3>
                                {cms.partner2Role && (
                                    <p className="text-[11px] tracking-[0.25em] uppercase text-[#b89a5c] mb-8">{cms.partner2Role} · Grupo Vivare</p>
                                )}
                                {cms.partner2Bio ? (
                                    <div
                                        className="space-y-4 text-[15px] leading-[1.9] text-[#e8e0d0] font-light [&>p]:mb-4"
                                        dangerouslySetInnerHTML={{ __html: cms.partner2Bio }}
                                    />
                                ) : null}
                            </div>
                            {cms.partner2Photo && (
                                <div className="relative reveal">
                                    <img
                                        src={cms.partner2Photo}
                                        alt={cms.partner2Name || "Sócio – Grupo Vivare"}
                                        className="w-full h-[500px] md:h-[580px] object-cover object-top filter brightness-[0.75] sepia-[0.1]"
                                    />
                                    {cms.partner2Role && (
                                        <div className="absolute top-8 -right-4 md:-right-6 bg-[#b89a5c] text-[#0f0e0c] py-2 px-6 text-[11px] tracking-[0.2em] uppercase font-medium">
                                            {cms.partner2Role}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* FOOTER CTA */}
            <div className="bg-[#b89a5c] py-24 px-8 text-center text-[#0f0e0c]">
                <h2 className="display-text text-4xl md:text-5xl font-light mb-4 text-[#0f0e0c]">Pronto para fazer seu imóvel trabalhar por você?</h2>
                <p className="text-base text-[#0f0e0c]/70 mb-10">Fale com nossa equipe e descubra como podemos rentabilizar seu imóvel com total transparência.</p>
                <a href="/para-proprietarios" className="inline-block bg-[#0f0e0c] text-[#d4b87a] py-4 px-12 text-xs tracking-[0.25em] uppercase hover:bg-[#2a2520] hover:text-[#f5f0e8] transition-colors">
                    Falar com a Equipe
                </a>
            </div>

        </main>
    );
}
