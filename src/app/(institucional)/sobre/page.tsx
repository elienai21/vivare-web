import type { Metadata } from "next";
import Image from "next/image";
import { getPublishedPageServer } from "@/services/cmsServiceServer";
import { formatImageUrl } from "@/lib/formatImage";
import { fetchListings } from "@/services/staysService";

export const metadata: Metadata = {
    title: "Quem Somos – A Experiência Vivare",
    description:
        "Conheça o Grupo Vivare: gestão profissional de locação por temporada em São Paulo, Santos e Guarujá com hospitalidade genuína, tecnologia e total transparência.",
    alternates: { canonical: "/sobre" },
    openGraph: {
        title: "Quem Somos – Grupo Vivare",
        description:
            "Cuidamos do seu imóvel como se fosse nosso. Conheça a história, missão e valores do Grupo Vivare.",
        type: "website",
    },
};

/**
 * ISR: re-render every 10 minutes. The CMS content here changes rarely,
 * so we keep the Firestore read out of the request hot path.
 */
export const revalidate = 600;

export default async function SobrePage() {
    // Server-side CMS fetch — never blocks the client bundle and always
    // ships fresh content within the revalidation window.
    const page = await getPublishedPageServer("sobre");
    const cms: Record<string, string> = (page?.content as Record<string, string>) || {};

    // Sem foto no CMS, usa fotos reais das unidades (antes: banco de imagens
    // apresentado como "sede" e "apartamento gerenciado").
    const unitPhotos = (await fetchListings().catch(() => []))
        .filter((l) => l.status === "active")
        .map((l) => l._t_mainImageMeta?.url)
        .filter((u): u is string => Boolean(u));
    const heroPhoto = formatImageUrl(cms.heroImage) || unitPhotos[1] || unitPhotos[0];
    const storyPhoto = formatImageUrl(cms.storyImage) || unitPhotos[2] || unitPhotos[0];
    const founderPhoto = formatImageUrl(cms.founderPhoto);

    // Scroll-reveal classes are wired up by the global <ScrollObserver/>
    // mounted in app/layout.tsx — no need for a per-page useEffect.

    return (
        <main className="min-h-screen bg-ink text-parchment font-sans selection:bg-primary selection:text-ink">



            {/* HERO SECTION */}
            <section className="min-h-screen grid grid-cols-1 md:grid-cols-2 relative overflow-hidden">
                <div className="relative h-[50vh] md:h-full overflow-hidden order-2 md:order-1 hidden md:block">
                    <Image
                        src={heroPhoto}
                        alt="Interior de um apartamento gerenciado pela Vivare"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover filter brightness-50 sepia-[.2] scale-105 animate-[slowZoom_14s_ease-out_forwards]"
                        priority
                        quality={70}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-ink hidden md:block" />
                </div>

                <div className="flex flex-col justify-center px-8 py-16 md:p-20 relative order-1 md:order-2 z-10">
                    <p className="chapeu text-primary-light mb-8 animate-[fadeUp_0.8s_0.4s_ease_forwards] opacity-0">
                        Grupo Vivare · São Paulo
                    </p>
                    {/* Escala intermediária no tablet: a 768 px o 5.5rem quebrava em 7 linhas */}
                    <h1 className="display-text text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] font-light leading-[1.05] mb-8 animate-[fadeUp_0.9s_0.6s_ease_forwards] opacity-0 text-balance">
                        Cuidamos do seu imóvel como <em className="text-primary-light">se fosse nosso.</em>
                    </h1>
                    <div className="w-12 h-px bg-primary mb-8 animate-[fadeUp_0.8s_0.8s_ease_forwards] opacity-0" />
                    <p className="text-base leading-[1.8] text-warm-mid max-w-[38ch] animate-[fadeUp_0.8s_1s_ease_forwards] opacity-0">
                        Somos a empresa de gestão de locação por temporada que une tecnologia, hospitalidade genuína e comprometimento financeiro — para que cada apartamento renda mais, sem que o proprietário precise se preocupar com nada.
                    </p>
                </div>

                <span className="absolute right-8 top-1/2 -translate-y-1/2 rotate-90 text-[11px] tracking-[0.3em] uppercase text-warm-mid/70 whitespace-nowrap hidden xl:block z-20" aria-hidden="true">
                    São Paulo · Santos · Guarujá
                </span>
            </section>

            {/* STATS BAR */}
            <div className="bg-primary-light py-12 px-8 flex flex-col md:flex-row justify-center items-center gap-12 md:gap-0">
                {[
                    { num: "30+", label: "Unidades gerenciadas" },
                    { num: "2021", label: "Atuando desde" },
                    { num: "3", label: "Cidades atendidas" },
                    { num: "Dedicado", label: "Suporte ao hóspede" }
                ].map((stat, i) => (
                    <div key={i} className="flex-1 text-center md:border-r border-ink/20 last:border-0 px-8">
                        <span className="display-text text-5xl md:text-6xl font-light text-ink block leading-none mb-2">{stat.num}</span>
                        <span className="text-[11px] tracking-[0.2em] uppercase text-ink/70 block">{stat.label}</span>
                    </div>
                ))}
            </div>

            {/* MANIFESTO */}
            <section className="bg-parchment text-ink relative overflow-hidden py-32 px-8">
                <div className="absolute -top-16 -left-12 display-text text-[40rem] leading-[0.8] text-primary/10 select-none pointer-events-none">
                    &quot;
                </div>
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 md:gap-24 items-start relative z-10">
                    <span className="chapeu pt-2 reveal">Nossa crença</span>
                    <p className="display-text text-3xl md:text-5xl font-normal leading-[1.4] text-ink reveal">
                        Acreditamos que um imóvel bem gerido não é apenas um ativo financeiro —
                        é o cenário onde pessoas vivem <strong className="font-semibold text-primary-deep">momentos inesquecíveis</strong>.
                        Nossa missão é ser o elo que torna isso possível,
                        com integridade, transparência e excelência operacional.
                    </p>
                </div>
            </section>

            {/* STORY */}
            <section className="bg-ink text-parchment py-32 px-8">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 items-center">
                    <div className="relative reveal w-full h-[400px] md:h-[520px]">
                        <Image
                            src={storyPhoto}
                            alt="Apartamento gerenciado pela Vivare"
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover filter brightness-[0.7] sepia-[0.15]"
                            quality={70}
                        />
                        <div className="absolute -bottom-6 -right-6 md:-bottom-6 md:-right-6 bg-primary-light text-ink p-6 display-text text-lg not-italic leading-[1.4] max-w-[220px]">
                            &quot;Cada imóvel é tratado com atenção de boutique.&quot;
                        </div>
                    </div>
                    <div className="reveal" style={{ transitionDelay: '0.2s' }}>
                        <span className="chapeu text-primary-light mb-6">Nossa história</span>
                        <h2 className="display-text text-4xl md:text-6xl font-light leading-[1.15] mb-6">
                            Nascemos em <em className="text-primary-light">São Paulo</em>,<br />pensando no Brasil.
                        </h2>
                        <div className="w-12 h-px bg-primary mb-8" />
                        <div className="space-y-5 text-[15px] leading-[1.9] text-warm-mid">
                            <p>
                                A Vivare nasceu em 2021, não de uma teoria, mas da prática. Começamos administrando nossos próprios apartamentos para entender, em primeira mão, o que define uma experiência de excelência.
                            </p>
                            <p>
                                Após um ano consolidando processos e conquistando resultados, abrimos nossa gestão para parceiros, oferecendo a <strong className="font-medium text-primary-light">segurança</strong> e a <strong className="font-medium text-primary-light">expertise</strong> que gostaríamos de ter tido no início.
                            </p>
                            <p>
                                Hoje, essa base sólida é o pilar da confiança que nossos parceiros depositam em nós. Gerenciamos imóveis nas principais regiões de São Paulo e litoral, com uma carteira crescente de proprietários satisfeitos e hóspedes que retornam.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* MVV SECTION */}
            <section className="bg-ink-card relative pt-32 pb-0">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                <div className="max-w-6xl mx-auto px-8">
                    <div className="text-center mb-24 reveal">
                        <span className="chapeu text-primary-light mb-4">O que nos move</span>
                        <h2 className="display-text text-4xl md:text-5xl font-light">
                            Missão, Visão <em className="text-primary-light">e</em> Valores
                        </h2>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-[3px] bg-primary/15">
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
                        <div key={i} className="bg-ink-card p-12 relative overflow-hidden group hover:bg-ink-card transition-colors reveal" style={{ transitionDelay: item.delay || '0s' }}>
                            <div className="absolute bottom-0 inset-x-0 h-[3px] bg-primary origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
                            <span className="display-text text-[6rem] leading-[0.85] font-light text-primary/10 absolute top-6 right-8">{item.n}</span>
                            <p className="chapeu text-primary-light mb-4">{item.label}</p>
                            <h3 className="display-text text-3xl md:text-4xl text-parchment leading-[1.15] mb-6 font-normal pr-4">{item.title}</h3>
                            <p className="text-sm leading-[1.8] text-muted">{item.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* VALUES SECTION (Text List) */}
            <section className="bg-parchment text-ink py-32 px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-20 reveal">
                        <span className="chapeu mb-4">Nossos valores</span>
                        <h2 className="display-text text-4xl md:text-5xl font-light max-w-[20ch] mb-8">
                            Os princípios que guiam <em className="text-primary-deep">cada decisão.</em>
                        </h2>
                        <div className="w-12 h-px bg-primary-deep" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-primary/30">
                        {[
                            { icon: 'I', title: 'Integridade acima de tudo', desc: 'Cada centavo demonstrado. Sem taxas ocultas.', delay: '0s' },
                            { icon: 'E', title: 'Excelência operacional', desc: 'Limpeza à manutenção focada na perfeição.', delay: '0.1s' },
                            { icon: 'C', title: 'Comprometimento com o resultado', desc: 'O nosso sucesso é atrelado ao seu.', delay: '0.05s' },
                            { icon: 'H', title: 'Hospitalidade genuína', desc: 'Como se recebessemos em nossa casa.', delay: '0.15s' },
                            { icon: 'T', title: 'Tecnologia p/ pessoas', desc: 'Ferramentas digitais de alta precisão.', delay: '0.1s' },
                            { icon: 'P', title: 'Parceria de longo prazo', desc: 'Construímos laços profundos de confiança.', delay: '0.2s' },
                        ].map((val, i) => (
                            <div key={i} className={`p-10 border-b border-primary/30 flex gap-8 hover:bg-primary/5 transition-colors reveal md:pr-12 ${i % 2 === 0 ? 'md:border-r border-primary/30 md:pl-0' : 'md:pl-12'}`} style={{ transitionDelay: val.delay }}>
                                <div className="w-12 h-12 border border-primary text-primary display-text text-2xl flex items-center justify-center shrink-0">
                                    {val.icon}
                                </div>
                                <div>
                                    <h4 className="display-text text-2xl font-medium text-ink mb-2">{val.title}</h4>
                                    <p className="text-[14px] leading-[1.75] text-muted">{val.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TEAM */}
            <section className="bg-ink py-32 px-8 overflow-hidden">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-16 reveal">
                        <span className="chapeu text-primary-light mb-4">Quem está por trás</span>
                        <h2 className="display-text text-4xl md:text-5xl font-light mb-6">Uma equipe que <em className="text-primary-light">vive</em> o que vende.</h2>
                        <div className="w-12 h-px bg-primary" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-12 md:gap-20 items-center">
                        <div className="relative reveal w-full h-[500px] md:h-[580px]">
                            <Image
                                src={founderPhoto || storyPhoto}
                                // Sem retrato no CMS, mostra uma unidade real e não finge ser o fundador.
                                alt={founderPhoto ? (cms.founderName || "Elienai Cordeiro, fundador da Vivare") : "Apartamento gerenciado pela Vivare"}
                                fill
                                sizes="(max-width: 768px) 100vw, 40vw"
                                className="object-cover object-top filter brightness-[0.75] sepia-[0.1]"
                                quality={70}
                            />
                            <div className="absolute top-8 -left-4 md:-left-6 bg-primary-light text-ink py-2 px-6 text-[11px] tracking-[0.2em] uppercase font-medium">
                                {cms.founderRole || "Fundador & CEO"}
                            </div>
                        </div>
                        <div className="reveal" style={{ transitionDelay: '0.2s' }}>
                            <h3 className="display-text text-4xl md:text-5xl font-light text-parchment mb-2">{cms.founderName || "Elienai Cordeiro"}</h3>
                            <p className="text-[11px] tracking-[0.25em] uppercase text-primary-light mb-8">{cms.founderRole ? `${cms.founderRole} · Grupo Vivare` : "Fundador · Grupo Vivare"}</p>

                            {cms.founderBio ? (
                                <div
                                    className="space-y-4 text-[15px] leading-[1.9] text-warm-mid [&>p]:mb-4"
                                    dangerouslySetInnerHTML={{ __html: cms.founderBio }}
                                />
                            ) : (
                                <div className="space-y-4 text-[15px] leading-[1.9] text-warm-mid">
                                    <p>Elienai Cordeiro construiu a Vivare a partir de uma experiência direta com o mercado imobiliário de São Paulo: a percepção de que havia um abismo entre o potencial dos imóveis de temporada e a qualidade de gestão disponível no mercado.</p>
                                    <p>Com formação em gestão de negócios e anos de atuação no setor imobiliário, ele reuniu uma equipe com o mesmo comprometimento com resultado e hospitalidade — e criou uma operação que hoje gerencia dezenas de imóveis nas principais cidades do estado de São Paulo.</p>
                                    <p>&quot;Meu objetivo sempre foi simples: que o proprietário durma tranquilo sabendo que o imóvel está sendo tratado como nosso, e que o hóspede acorde feliz de ter escolhido estar aqui.&quot;</p>
                                </div>
                            )}

                            <blockquote className="border-l-2 border-primary pl-6 mt-10 display-text text-2xl md:text-3xl not-italic text-primary-light leading-relaxed">
                                &quot;{cms.founderQuote || "Gestão de temporada não é administrar imóveis. É administrar experiências e confiança."}&quot;
                            </blockquote>
                        </div>
                    </div>

                    {/* Sócio 2 — aparece apenas se preenchido no admin */}
                    {(cms.partner2Name || cms.partner2Photo) && (
                        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-12 md:gap-20 items-center mt-20 pt-20 border-t border-white/10">
                            <div className="reveal" style={{ transitionDelay: '0.2s' }}>
                                <h3 className="display-text text-4xl md:text-5xl font-light text-parchment mb-2">{cms.partner2Name}</h3>
                                {cms.partner2Role && (
                                    <p className="text-[11px] tracking-[0.25em] uppercase text-primary-light mb-8">{cms.partner2Role} · Grupo Vivare</p>
                                )}
                                {cms.partner2Bio ? (
                                    <div
                                        className="space-y-4 text-[15px] leading-[1.9] text-warm-mid [&>p]:mb-4"
                                        dangerouslySetInnerHTML={{ __html: cms.partner2Bio }}
                                    />
                                ) : null}
                            </div>
                            {cms.partner2Photo && (
                                <div className="relative reveal w-full h-[500px] md:h-[580px]">
                                    <Image
                                        src={formatImageUrl(cms.partner2Photo)}
                                        alt={cms.partner2Name || "Sócio – Grupo Vivare"}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 40vw"
                                        className="object-cover object-top filter brightness-[0.75] sepia-[0.1]"
                                        quality={70}
                                    />
                                    {cms.partner2Role && (
                                        <div className="absolute top-8 -right-4 md:-right-6 bg-primary-light text-ink py-2 px-6 text-[11px] tracking-[0.2em] uppercase font-medium">
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
            <div className="bg-primary-light py-24 px-8 text-center text-ink">
                <h2 className="display-text text-4xl md:text-5xl font-light mb-4 text-ink">Pronto para fazer seu imóvel trabalhar por você?</h2>
                <p className="text-base text-ink/70 mb-10">Fale com nossa equipe e descubra como podemos rentabilizar seu imóvel com total transparência.</p>
                <a href="/para-proprietarios" className="inline-block bg-ink text-primary-light py-4 px-12 text-xs tracking-[0.25em] uppercase hover:bg-ink-raised hover:text-parchment transition-colors">
                    Falar com a Equipe
                </a>
            </div>

        </main>
    );
}
