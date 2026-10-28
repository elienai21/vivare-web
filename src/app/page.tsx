import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
    Award,
    BadgeCheck,
    Handshake,
    Headphones,
    Key,
    MessageCircle,
    Sparkles,
    Star,
} from "lucide-react";
import { HERO_PHOTOS, PROOF, WHATSAPP_URL } from "@/lib/constants";

import { getPublishedPageServer } from "@/services/cmsServiceServer";
import { SiteContent } from "@/types/cms";
import { fetchListings } from "@/services/staysService";
import { HeroSearch } from "@/components/ui/HeroSearch";

export const metadata: Metadata = {
  title: "Hospedagens de Alto Padrão em SP, Santos e Guarujá",
  description: "Descubra e reserve apartamentos premium para temporada em São Paulo, Santos e Guarujá. Check-in digital, limpeza profissional e suporte dedicado.",
  alternates: { canonical: "/" },
};

/**
 * ISR: re-render the home page every 10 minutes. Both the Firestore CMS read
 * and the Stays listings fetch are slow on cold paths (Firestore in particular
 * has an 8s timeout below) — caching the whole page keeps them off the LCP
 * critical path for the vast majority of visitors. Listings availability
 * changes constantly, but property listings/photos don't.
 */
export const revalidate = 600;

export default async function Home() {
  let content: SiteContent = {
    heroTitle: "Hospedagem de alto padrão em <span class='text-primary-light'>São Paulo</span> e no litoral",
    heroSubtitle: "Check-in digital, suporte humano e imóveis selecionados a rigor. Sem depósito caução, sem fiador, sem burocracia.",
    ctaButtonText: "Reservar uma unidade"
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let listings: any[] = [];

  try {
    // CMS via `cmsServiceServer` — usa Firebase Admin SDK (REST) quando
    // as credenciais server-side estão setadas, com fallback pro Web SDK.
    // Admin SDK evita os "GRPC error" intermitentes que apareciam ao usar
    // o Web SDK em contexto server-side.
    const page = await getPublishedPageServer("home");
    if (page) {
      const c = (page as unknown as { content?: Partial<SiteContent> } & Partial<SiteContent>).content
        ?? (page as unknown as Partial<SiteContent>);
      content = {
        heroTitle: c.heroTitle || content.heroTitle,
        heroSubtitle: c.heroSubtitle || content.heroSubtitle,
        ctaButtonText: c.ctaButtonText || content.ctaButtonText,
      };
    }
  } catch (err) {
    console.error("Erro CMS (home):", err);
  }

  try {
    const fetchedListings = await fetchListings();
    listings = (fetchedListings || []).filter(l => l.status === "active");
  } catch (err) {
    console.error("Erro Stays API:", err);
  }

  // Hero: fotos curadas (HERO_PHOTOS); antes eram as fotos principais das 3
  // primeiras unidades da Stays, sem critério visual.
  const heroSlides: { url: string; alt: string }[] = HERO_PHOTOS.map(p => ({ url: p.url, alt: p.alt }));
  // Foto real de uma unidade para a faixa de proprietário (antes: banco de imagens).
  const ownerImage: string | undefined = listings[3]?._t_mainImageMeta?.url ?? listings[0]?._t_mainImageMeta?.url;

  return (
    <main>
      {/* Hero Section
          Note: overflow-hidden lives on the inner background layer (not the
          <section>) so the HeroSearch suggestion popover can escape the hero
          bounds without being clipped by the trust bar below. The bg layer
          still clips the slowZoom scale() animation. */}
      {/* Altura mínima em svh (viewport pequena do iOS) e a seção cresce com o
          conteúdo: no celular o painel de busca nunca é cortado pela dobra. */}
      <section className="relative z-30 flex min-h-[calc(100svh-var(--header-h))] md:min-h-[88vh] w-full flex-col justify-center py-16 md:py-24">
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Scrim acima dos slides: mantém o texto branco ≥ 4,5:1 sobre fotos claras. */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/55 to-black/75 z-10 pointer-events-none"></div>
          {heroSlides.map((slide, idx) => (
            <div key={slide.url} className={`absolute inset-0 hero-slide hero-slide-${idx + 1}`}>
              <Image
                src={slide.url}
                alt={idx === 0 ? slide.alt : ""}
                fill
                sizes="100vw"
                className="object-cover"
                // Só a primeira é candidata a LCP; as demais entram depois.
                priority={idx === 0}
                fetchPriority={idx === 0 ? "high" : "low"}
                loading={idx === 0 ? "eager" : "lazy"}
                quality={72}
              />
            </div>
          ))}
        </div>

        <div className="relative z-20 flex flex-col items-center px-6 text-center">
          <div className="max-w-4xl space-y-5">
            <h1
              className="hero-enter hero-enter-1 font-display font-normal text-white leading-[1.05] text-[clamp(2.25rem,6vw,5.5rem)] drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
              dangerouslySetInnerHTML={{ __html: content.heroTitle }}
            />
            <p className="hero-enter hero-enter-2 mx-auto max-w-xl text-base md:text-lg text-parchment/95 leading-relaxed whitespace-pre-line drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
              {content.heroSubtitle}
            </p>
          </div>

          <div className="hero-enter hero-enter-3 mt-8 md:mt-10 w-full max-w-4xl">
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* Trust Bar — Prova social externa (Airbnb) */}
      <section className="bg-ink border-b border-primary/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-5">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">

            {/* Nota */}
            <div className="flex items-center gap-2.5">
              <span className="text-2xl font-display font-medium text-white leading-none">{PROOF.rating}</span>
              <div>
                <div className="flex gap-0.5" role="img" aria-label={`Nota ${PROOF.rating} de 5`}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-[11px] h-[11px] text-primary fill-primary" aria-hidden="true" />
                  ))}
                </div>
                <p className="text-[11px] text-white/70 uppercase tracking-widest mt-0.5">Nota média</p>
              </div>
            </div>

            <div className="hidden sm:block w-px h-7 bg-white/10" />

            {/* Avaliações */}
            <div className="text-center">
              <p className="text-2xl font-display font-medium text-white leading-none">{PROOF.reviews}</p>
              <p className="text-[11px] text-white/70 uppercase tracking-widest mt-0.5">Avaliações verificadas</p>
            </div>

            <div className="hidden sm:block w-px h-7 bg-white/10" />

            {/* Superhost */}
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 32 32" fill="none" role="img" aria-label="Airbnb">
                <path d="M16 1C7.8 1 1 7.8 1 16s6.8 15 15 15 15-6.8 15-15S24.2 1 16 1zm0 4c2.4 0 4.4 2 4.4 4.4S18.4 13.8 16 13.8s-4.4-2-4.4-4.4S13.6 5 16 5zm0 21.4c-3.7 0-7-1.9-9-4.8.05-3 6-4.6 9-4.6s8.95 1.6 9 4.6c-2 2.9-5.3 4.8-9 4.8z" fill="#FF5A5F"/>
              </svg>
              <div>
                <p className="text-xs font-bold text-white leading-none">Superhost</p>
                <p className="text-[11px] text-white/70 uppercase tracking-widest mt-0.5">Airbnb · {PROOF.hostingYears} anos hospedando</p>
              </div>
            </div>

            <div className="hidden sm:block w-px h-7 bg-white/10" />

            {/* Identidade verificada */}
            <div className="flex items-center gap-2">
              <BadgeCheck className="text-primary w-5 h-5" aria-hidden="true" />
              <div>
                <p className="text-xs font-bold text-white leading-none">Identidade Verificada</p>
                <p className="text-[11px] text-white/70 uppercase tracking-widest mt-0.5">Plataforma auditável</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Curated Selection */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="mb-14 flex items-end justify-between reveal">
          <div>
            <span className="chapeu">Coleção Exclusiva</span>
            <h2 className="font-display font-light text-ink dark:text-parchment mt-1 text-[clamp(2rem,3.5vw,3rem)]">
              Experiências <em>Vivare</em>
            </h2>
            <span className="gold-line"></span>
          </div>
          <Link className="hidden text-xs font-semibold tracking-widest uppercase text-primary-deep hover:underline md:block dark:text-primary-light" href="/unidades">
            Ver todos os imóveis &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {listings.length > 0 ? (
            listings.slice(0, 6).map((listing, index) => (
              <Link href={`/unidades/${listing.id}`} key={listing._id} className="group card-lift reveal">
                <div className="relative mb-5 overflow-hidden aspect-[4/3] bg-warm-mid dark:bg-ink-card">
                  {listing._t_mainImageMeta?.url ? (
                    <Image
                      src={listing._t_mainImageMeta.url}
                      alt={listing._mstitle.pt_BR}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                      loading={index < 3 ? "eager" : "lazy"}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-secondary-text text-sm">Foto em breve</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary-deep tracking-wider uppercase dark:text-primary-light">{listing.address.region}, {listing.address.city}</p>
                  <h3 className="font-display text-xl font-medium text-ink dark:text-parchment line-clamp-2 mt-1">{listing._mstitle.pt_BR}</h3>
                </div>
                <span className="gold-line" style={{ margin: '0.75rem 0 0.5rem', width: '2rem' }}></span>
                {/* A Stays não expõe preço mínimo por unidade; até existir um
                    endpoint em lote, o card leva à página com datas e valor. */}
                <p className="text-sm font-semibold text-ink dark:text-parchment group-hover:text-primary-deep dark:group-hover:text-primary-light transition-colors">
                  {listing._d_minPrice ? <>R$ {listing._d_minPrice} <span className="font-normal text-secondary-text">/ noite</span></> : "Ver datas e valores →"}
                </p>
              </Link>
            ))
          ) : (
            <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="bg-neutral-200 dark:bg-neutral-800 aspect-[4/3] mb-5"></div>
                  <div className="h-6 bg-neutral-200 dark:bg-neutral-800 w-3/4 mb-2"></div>
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-800 w-1/2 mb-3"></div>
                  <div className="h-6 bg-neutral-200 dark:bg-neutral-800 w-1/4"></div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 text-center md:hidden">
          <Link href="/unidades" className="inline-flex min-h-12 items-center border border-primary text-primary-deep px-8 font-bold text-xs uppercase tracking-widest transition-colors hover:bg-primary-light hover:text-ink dark:text-primary-light">
            Mostrar todas
          </Link>
        </div>
      </section>

      {/* PADRÃO VIVARE (diferenciais hóspede) */}
      <div className="gold-divider mx-6 lg:mx-10 max-w-7xl xl:mx-auto"></div>

      <section className="bg-background py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16 reveal">
            <span className="chapeu">Para quem hospeda</span>
            <h2 className="font-display font-light text-ink dark:text-parchment mt-2 text-[clamp(2rem,3.5vw,3rem)]">
              O Padrão <em>Vivare</em>
            </h2>
            <span className="gold-line mx-auto"></span>
            <p className="text-base text-secondary-text leading-relaxed">
              Excelência em cada detalhe para transformar sua estadia em uma experiência memorável e sem preocupações.
            </p>
          </div>

          {/* No celular: lista 2×2 sem caixas; a partir de lg: quatro cards com flutuação suave. */}
          <ul className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4 lg:gap-6">
            {[
              { Icon: Sparkles, title: "Curadoria estrita", text: "Imóveis selecionados sob os mais altos critérios de design, localização e conforto." },
              { Icon: Key, title: "Check-in digital", text: "Acesso rápido e seguro via fechaduras eletrônicas, sem chaves físicas nem fiador." },
              { Icon: Award, title: "Enxoval premium", text: "Cama, banho e cozinha preparados com padrão de hotelaria, prontos para a sua chegada." },
              { Icon: Headphones, title: "Suporte dedicado", text: "Atendimento ágil e humano por WhatsApp. Sem robôs, sem burocracia." },
            ].map(({ Icon, title, text }, i) => (
              <li key={title} className="flex flex-col items-start gap-3 reveal lg:card-lift lg:bg-card lg:border lg:border-primary/15 lg:p-8">
                <div className="flex h-11 w-11 items-center justify-center border border-primary text-primary-deep dark:text-primary-light">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="font-display text-xl font-medium text-ink dark:text-parchment">{title}</h3>
                <p className="text-sm leading-relaxed text-secondary-text">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* DEPOIMENTOS — HÓSPEDES */}
      <section className="bg-ink py-24 border-t border-primary/20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-14 reveal">
            <span className="chapeu text-primary-light">Quem hospedou aqui</span>
            <h2 className="font-display font-light text-parchment mt-2 text-[clamp(1.8rem,3vw,2.8rem)]">
              O que nossos <em>hóspedes</em> dizem
            </h2>
            <span className="gold-line"></span>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

            <div className="p-8 border border-primary/20 bg-white/5 reveal">
              <div className="flex gap-0.5 mb-4" role="img" aria-label="5 de 5 estrelas">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-primary fill-primary" aria-hidden="true" />
                ))}
              </div>
              <p className="font-display text-lg font-light not-italic text-warm-mid leading-relaxed mb-6">
                &quot;O apartamento estava ainda melhor do que nas fotos. Localização perfeita, tudo impecavelmente limpo. Sem dúvida a melhor hospedagem que já tive em São Paulo.&quot;
              </p>
              <div>
                <p className="text-sm font-semibold text-parchment">Karina Santos</p>
                <p className="text-xs text-warm-mid/80 tracking-wider uppercase mt-0.5">Jardins · São Paulo</p>
              </div>
            </div>

            <div className="p-8 border border-primary/20 bg-white/5 reveal">
              <div className="flex gap-0.5 mb-4" role="img" aria-label="5 de 5 estrelas">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-primary fill-primary" aria-hidden="true" />
                ))}
              </div>
              <p className="font-display text-lg font-light not-italic text-warm-mid leading-relaxed mb-6">
                &quot;Já fico na Vivare toda vez que venho a SP — há mais de um ano. A equipe tem uma atenção que você não encontra em hotel. Indico pra todo mundo sem hesitar.&quot;
              </p>
              <div>
                <p className="text-sm font-semibold text-parchment">Erika Lima</p>
                <p className="text-xs text-warm-mid/80 tracking-wider uppercase mt-0.5">Recorrente · 1+ ano</p>
              </div>
            </div>

            <div className="p-8 border border-primary/20 bg-white/5 reveal">
              <div className="flex gap-0.5 mb-4" role="img" aria-label="5 de 5 estrelas">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-primary fill-primary" aria-hidden="true" />
                ))}
              </div>
              <p className="font-display text-lg font-light not-italic text-warm-mid leading-relaxed mb-6">
                &quot;Seriedade, rapidez no atendimento, excelentes localizações em SP e preços que fazem sentido. Equipe nota 10 do início ao fim.&quot;
              </p>
              <div>
                <p className="text-sm font-semibold text-parchment">Luíza Castro</p>
                <p className="text-xs text-warm-mid/80 tracking-wider uppercase mt-0.5">Pinheiros · São Paulo</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PARA PROPRIETÁRIOS — uma faixa, um CTA. Os depoimentos de proprietário
          vivem em /para-proprietarios (PRODUCT: reserva do hóspede vem primeiro). */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24 lg:px-10">
        <div className="relative overflow-hidden bg-ink rounded-xl border border-primary/20">
          {ownerImage && (
            <div className="absolute right-0 top-0 hidden h-full w-1/2 lg:block">
              <Image
                src={ownerImage}
                alt=""
                fill
                sizes="50vw"
                quality={70}
                loading="lazy"
                className="object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/60 to-transparent"></div>
            </div>
          )}

          <div className="relative z-10 p-8 md:p-16 lg:w-7/12 reveal">
            <span className="chapeu text-primary-light">Para proprietários</span>
            <h2 className="font-display font-light text-parchment mt-3 leading-[1.1] text-[clamp(2rem,3.5vw,3.2rem)]">
              Seu imóvel rende. <em>Você não opera.</em>
            </h2>
            <span className="gold-line"></span>
            <p className="text-base text-warm-mid leading-relaxed mb-10 max-w-prose">
              Gestão completa, da divulgação nas plataformas ao repasse no 5º dia útil com relatório mensal. Cobramos só comissão sobre as reservas realizadas.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/para-proprietarios" className="inline-flex min-h-12 items-center gap-2 bg-primary-light text-ink px-8 text-xs font-bold tracking-widest uppercase transition-colors hover:bg-primary-glow">
                <Handshake className="w-4 h-4" aria-hidden="true" />
                Conhecer a gestão
              </Link>
              <a href={`${WHATSAPP_URL}?text=${encodeURIComponent("Olá, tenho interesse em saber mais sobre a gestão da Vivare para meu imóvel")}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center gap-2 border border-primary/50 text-parchment px-8 text-xs font-bold tracking-widest uppercase transition-colors hover:bg-white/5">
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
