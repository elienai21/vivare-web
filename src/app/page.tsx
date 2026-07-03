import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
    Award,
    BadgeCheck,
    Handshake,
    Headphones,
    Heart,
    Key,
    MessageCircle,
    Sparkles,
    Star,
} from "lucide-react";
import { OwnerPopupTrigger } from "@/components/ui/OwnerPopupTrigger";
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
    heroTitle: "Hospedagens de alto padrão em <span class='text-primary-500'>São Paulo</span> e no <span class='text-primary-500'>Litoral</span>",
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

  const topListings = listings.slice(0, 3);
  let heroImages = topListings.length > 1
    ? topListings.map(l => l._t_mainImageMeta?.url).filter(Boolean)
    : [];

  // Se a API falhar ou trazer só 1 imagem, força o fallback para o Crossfade funcionar.
  // Unsplash w=1600 (era 2000) — next/image redimensiona ainda mais conforme o viewport.
  if (heroImages.length < 2) {
    heroImages = [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
    ];
  }

  return (
    <main>
      {/* Hero Section
          Note: overflow-hidden lives on the inner background layer (not the
          <section>) so the HeroSearch suggestion popover can escape the hero
          bounds without being clipped by the trust bar below. The bg layer
          still clips the slowZoom scale() animation. */}
      <section className="relative z-30 h-[92vh] w-full">
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Gradient overlay sits ABOVE the slides (z-10) so darkening is preserved.
              Middle stop bumped from /40 to /50 to keep text >= 3:1 contrast
              (WCAG AA for large text) on lighter hero photos. */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80 z-10 pointer-events-none"></div>
          {heroImages.length > 1 ? (
            heroImages.map((imgUrl, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 hero-slide hero-slide-${idx + 1}`}
                style={{ animation: "heroCrossfade 24s infinite, slowZoom 14s ease-out both" }}
              >
                <Image
                  src={imgUrl}
                  alt={idx === 0 ? "Apartamento premium gerenciado pela Vivare" : ""}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  // Only the first slide is LCP candidate.
                  priority={idx === 0}
                  fetchPriority={idx === 0 ? "high" : "low"}
                  // Subsequent slides start hidden (driven by heroCrossfade keyframes),
                  // so we let the browser lazy-load them.
                  loading={idx === 0 ? "eager" : "lazy"}
                  // Quality 70 instead of 80 — visually indistinguishable on photos
                  // at this scale, ~15% smaller payload.
                  quality={70}
                />
              </div>
            ))
          ) : (
            <Image
              src={heroImages[0]}
              alt="Apartamento premium gerenciado pela Vivare"
              fill
              sizes="100vw"
              className="object-cover"
              priority
              fetchPriority="high"
              quality={70}
              style={{ animation: "slowZoom 14s ease-out both" }}
            />
          )}
        </div>

        <div className="relative z-20 flex h-full flex-col items-center justify-center px-6 text-center">
          <div className="max-w-4xl space-y-5">
            <p className="text-[10px] md:text-xs font-semibold tracking-[.35em] uppercase text-primary drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" style={{ opacity: 0, animation: 'fadeUp .7s .3s ease forwards' }}>
              Curadoria · Tecnologia · Hospitalidade
            </p>
            <h2
              className="font-display font-light text-white leading-[1.08] text-[clamp(2.5rem,6vw,6.5rem)] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
              style={{ opacity: 0, animation: 'fadeUp .9s .5s ease forwards' }}
              dangerouslySetInnerHTML={{ __html: content.heroTitle }}
            />
            <p className="mx-auto max-w-xl text-sm md:text-base font-light text-slate-100 leading-relaxed whitespace-pre-line drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" style={{ opacity: 0, animation: 'fadeUp .8s .7s ease forwards' }}>
              {content.heroSubtitle}
            </p>
          </div>

          <div className="mt-10 w-full max-w-4xl" style={{ opacity: 0, animation: 'fadeUp .8s .9s ease forwards' }}>
            <HeroSearch />
          </div>

          {/* Social Proof Badge — dados reais Airbnb */}
          <div className="flex items-center gap-4 mt-10" style={{ opacity: 0, animation: 'fadeUp .7s 1.1s ease forwards' }}>
            <div className="flex items-center gap-3 bg-black/50 backdrop-blur-md border border-white/10 px-5 py-3 rounded-full">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-[13px] h-[13px] text-primary fill-primary" aria-hidden="true" />
                ))}
              </div>
              <div className="w-px h-5 bg-white/15" />
              <div className="text-left">
                <p className="text-white font-bold text-sm leading-none">4,82 · 747 avaliações</p>
                <p className="text-[10px] text-white/50 mt-0.5 tracking-wide">Superhost no Airbnb · 4 anos</p>
              </div>
            </div>
          </div>
        </div>

        <span className="absolute right-6 bottom-10 font-body text-[9px] tracking-[.35em] uppercase text-white/70 drop-shadow-md" style={{ writingMode: 'vertical-rl' }}>
          Tecnologia Vivare
        </span>
      </section>

      {/* Trust Bar — Prova social externa (Airbnb) */}
      <section className="bg-ink border-b border-primary/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-5">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">

            {/* Nota */}
            <div className="flex items-center gap-2.5">
              <span className="text-2xl font-display font-bold text-white leading-none">4,82</span>
              <div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-[11px] h-[11px] text-primary fill-primary" aria-hidden="true" />
                  ))}
                </div>
                <p className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">Nota média</p>
              </div>
            </div>

            <div className="hidden sm:block w-px h-7 bg-white/10" />

            {/* Avaliações */}
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-white leading-none">747</p>
              <p className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">Avaliações verificadas</p>
            </div>

            <div className="hidden sm:block w-px h-7 bg-white/10" />

            {/* Superhost */}
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 32 32" fill="none" aria-label="Airbnb">
                <path d="M16 1C7.8 1 1 7.8 1 16s6.8 15 15 15 15-6.8 15-15S24.2 1 16 1zm0 4c2.4 0 4.4 2 4.4 4.4S18.4 13.8 16 13.8s-4.4-2-4.4-4.4S13.6 5 16 5zm0 21.4c-3.7 0-7-1.9-9-4.8.05-3 6-4.6 9-4.6s8.95 1.6 9 4.6c-2 2.9-5.3 4.8-9 4.8z" fill="#FF5A5F"/>
              </svg>
              <div>
                <p className="text-xs font-bold text-white leading-none">Superhost</p>
                <p className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">Airbnb · 4 anos</p>
              </div>
            </div>

            <div className="hidden sm:block w-px h-7 bg-white/10" />

            {/* Identidade verificada */}
            <div className="flex items-center gap-2">
              <BadgeCheck className="text-primary w-5 h-5" aria-hidden="true" />
              <div>
                <p className="text-xs font-bold text-white leading-none">Identidade Verificada</p>
                <p className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">Plataforma auditável</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Curated Selection */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="mb-14 flex items-end justify-between reveal">
          <div>
            <span className="text-xs font-bold uppercase tracking-[.3em] text-primary">Coleção Exclusiva</span>
            <h3 className="font-display font-light text-ink dark:text-parchment mt-1 text-[clamp(2rem,3.5vw,3rem)]">
              Experiências <em>Vivare</em>
            </h3>
            <span className="gold-line"></span>
          </div>
          <Link className="hidden text-xs font-semibold tracking-widest uppercase text-primary hover:underline md:block" href="/unidades">
            Ver todos os imóveis &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {listings.length > 0 ? (
            listings.slice(0, 6).map((listing, index) => (
              <a href={`/unidades/${listing.id}`} key={listing._id} className="group cursor-pointer card-lift reveal" style={{ transitionDelay: `${index * 0.1}s` }}>
                <div className="relative mb-5 overflow-hidden aspect-[4/3]">
                  {listing._t_mainImageMeta?.url ? (
                    <Image
                      src={listing._t_mainImageMeta.url}
                      alt={listing._mstitle.pt_BR}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      // First 3 cards are likely above the fold on most viewports
                      // — give them eager loading; rest stay lazy.
                      loading={index < 3 ? "eager" : "lazy"}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-neutral-200 dark:bg-neutral-800 text-neutral-400">Sem Imagem</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <button aria-label="Salvar nos favoritos" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow backdrop-blur transition-colors hover:text-red-500">
                    <Heart className="w-5 h-5" aria-hidden="true" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-4 left-4 text-[9px] font-bold tracking-[.25em] uppercase bg-primary text-ink px-3 py-1">
                      Destaque
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-display text-xl font-medium text-ink dark:text-parchment line-clamp-1">{listing._mstitle.pt_BR}</h4>
                  <p className="text-xs font-medium text-muted tracking-wider mt-0.5 uppercase line-clamp-1">{listing.address.region}, {listing.address.city}</p>
                </div>
                <span className="gold-line" style={{ margin: '0.75rem 0 0.5rem', width: '2rem' }}></span>
                <p className="font-display text-xl font-medium text-ink dark:text-parchment">
                  {listing._d_minPrice ? `R$ ${listing._d_minPrice}` : "Ver Tarifas"}
                  {listing._d_minPrice && <span className="text-sm font-body font-normal text-muted"> / noite</span>}
                </p>
              </a>
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

        <div className="mt-12 text-center md:hidden">
          <Link href="/unidades" className="inline-block border border-primary text-primary px-8 py-4 font-bold text-xs uppercase tracking-widest transition-all hover:bg-primary hover:text-ink">
            Mostrar todas
          </Link>
        </div>
      </section>

      {/* PADRÃO VIVARE (diferenciais hóspede) */}
      <div className="gold-divider mx-6 lg:mx-10 max-w-7xl xl:mx-auto mt-20"></div>

      <section className="bg-background-light py-24 dark:bg-background-dark">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-16 reveal">
            <span className="text-xs font-bold uppercase tracking-[.3em] text-primary">Para quem hospeda</span>
            <h3 className="font-display font-light text-ink dark:text-parchment mt-2 text-[clamp(2rem,3.5vw,3rem)]">
              O Padrão <em>Vivare</em>
            </h3>
            <span className="gold-line mx-auto"></span>
            <p className="text-sm font-light text-muted leading-relaxed">
              Excelência em cada detalhe para transformar sua estadia em uma experiência memorável e sem preocupações.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-start space-y-4 p-8 bg-white dark:bg-ink border border-primary/15 card-lift reveal">
              <div className="flex h-12 w-12 items-center justify-center border border-primary text-primary">
                <Sparkles className="w-6 h-6" aria-hidden="true" />
              </div>
              <h4 className="font-display text-xl font-medium text-ink dark:text-parchment">Curadoria Estrita</h4>
              <p className="text-sm leading-relaxed text-muted">Imóveis selecionados sob os mais altos critérios de design, localização e conforto.</p>
            </div>
            <div className="flex flex-col items-start space-y-4 p-8 bg-white dark:bg-ink border border-primary/15 card-lift reveal" style={{ transitionDelay: '.08s' }}>
              <div className="flex h-12 w-12 items-center justify-center border border-primary text-primary">
                <Key className="w-6 h-6" aria-hidden="true" />
              </div>
              <h4 className="font-display text-xl font-medium text-ink dark:text-parchment">Check-in Digital</h4>
              <p className="text-sm leading-relaxed text-muted">Acesso rápido e seguro via fechaduras eletrônicas, sem necessidade de chaves físicas ou fiador.</p>
            </div>
            <div className="flex flex-col items-start space-y-4 p-8 bg-white dark:bg-ink border border-primary/15 card-lift reveal" style={{ transitionDelay: '.16s' }}>
              <div className="flex h-12 w-12 items-center justify-center border border-primary text-primary">
                <Award className="w-6 h-6" aria-hidden="true" />
              </div>
              <h4 className="font-display text-xl font-medium text-ink dark:text-parchment">Enxoval Premium</h4>
              <p className="text-sm leading-relaxed text-muted">Cama, banho e cozinha preparados com padrão de hotelaria — prontos para a sua chegada.</p>
            </div>
            <div className="flex flex-col items-start space-y-4 p-8 bg-white dark:bg-ink border border-primary/15 card-lift reveal" style={{ transitionDelay: '.24s' }}>
              <div className="flex h-12 w-12 items-center justify-center border border-primary text-primary">
                <Headphones className="w-6 h-6" aria-hidden="true" />
              </div>
              <h4 className="font-display text-xl font-medium text-ink dark:text-parchment">Suporte Dedicado</h4>
              <p className="text-sm leading-relaxed text-muted">Atendimento ágil e humano por WhatsApp — sem robôs, sem burocracia.</p>
            </div>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS — HÓSPEDES */}
      <section className="bg-ink py-24 border-t border-primary/20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-14 reveal">
            <span className="text-xs font-bold uppercase tracking-[.3em] text-primary">Quem hospedou aqui</span>
            <h3 className="font-display font-light text-parchment mt-2 text-[clamp(1.8rem,3vw,2.8rem)]">
              O que nossos <em>hóspedes</em> dizem
            </h3>
            <span className="gold-line"></span>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

            <div className="p-8 border border-primary/20 bg-white/5 reveal">
              <div className="flex gap-0.5 mb-4" role="img" aria-label="5 de 5 estrelas">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-primary fill-primary" aria-hidden="true" />
                ))}
              </div>
              <p className="font-display text-lg font-light italic text-warm-mid leading-relaxed mb-6">
                &quot;O apartamento estava ainda melhor do que nas fotos. Localização perfeita, tudo impecavelmente limpo. Sem dúvida a melhor hospedagem que já tive em São Paulo.&quot;
              </p>
              <div>
                <p className="text-sm font-semibold text-parchment">Karina Santos</p>
                <p className="text-xs text-muted tracking-wider uppercase mt-0.5">Jardins · São Paulo</p>
              </div>
            </div>

            <div className="p-8 border border-primary/20 bg-white/5 reveal" style={{ transitionDelay: '.1s' }}>
              <div className="flex gap-0.5 mb-4" role="img" aria-label="5 de 5 estrelas">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-primary fill-primary" aria-hidden="true" />
                ))}
              </div>
              <p className="font-display text-lg font-light italic text-warm-mid leading-relaxed mb-6">
                &quot;Já fico na Vivare toda vez que venho a SP — há mais de um ano. A equipe tem uma atenção que você não encontra em hotel. Indico pra todo mundo sem hesitar.&quot;
              </p>
              <div>
                <p className="text-sm font-semibold text-parchment">Erika Lima</p>
                <p className="text-xs text-muted tracking-wider uppercase mt-0.5">Recorrente · 1+ ano</p>
              </div>
            </div>

            <div className="p-8 border border-primary/20 bg-white/5 reveal" style={{ transitionDelay: '.2s' }}>
              <div className="flex gap-0.5 mb-4" role="img" aria-label="5 de 5 estrelas">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-primary fill-primary" aria-hidden="true" />
                ))}
              </div>
              <p className="font-display text-lg font-light italic text-warm-mid leading-relaxed mb-6">
                &quot;Seriedade, rapidez no atendimento, excelentes localizações em SP e preços que fazem sentido. Equipe nota 10 do início ao fim.&quot;
              </p>
              <div>
                <p className="text-sm font-semibold text-parchment">Luíza Castro</p>
                <p className="text-xs text-muted tracking-wider uppercase mt-0.5">Pinheiros · São Paulo</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PARA PROPRIETÁRIOS */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="relative overflow-hidden bg-ink rounded-xl border border-primary/20">
          {/* foto de fundo */}
          <div className="absolute right-0 top-0 hidden h-full w-1/2 lg:block">
            <Image
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=70"
              alt="Imóvel gerenciado pela Vivare em São Paulo"
              fill
              sizes="50vw"
              quality={70}
              loading="lazy"
              className="object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/50 to-transparent"></div>
          </div>

          <div className="relative z-10 p-12 md:p-16 lg:w-7/12 reveal">
            <span className="text-xs font-bold uppercase tracking-[.3em] text-primary">Para Proprietários</span>
            <h3 className="font-display font-light text-parchment mt-3 leading-[1.1] text-[clamp(2rem,3.5vw,3.2rem)]">
              Seu imóvel pode render mais<br />com gestão <em>profissional.</em>
            </h3>
            <span className="gold-line"></span>
            <p className="text-sm font-light text-warm-mid leading-relaxed mb-10 max-w-prose">
              Da divulgação nas plataformas ao repasse mensal detalhado — cuidamos de tudo enquanto você acompanha os resultados. Sem surpresas, sem burocracia, sem preocupação operacional.
            </p>

            <div className="flex flex-wrap gap-4 mb-14">
              <a href="/para-proprietarios" className="inline-flex items-center gap-2 bg-primary text-ink px-8 py-4 text-xs font-bold tracking-widest uppercase transition-all hover:bg-primary-light">
                <Handshake className="w-4 h-4" aria-hidden="true" />
                Fale com um Especialista
              </a>
              <a href="https://wa.me/5511985067840?text=Olá%2C+tenho+interesse+em+saber+mais+sobre+a+gestão+da+Vivare+para+meu+imóvel"
                className="inline-flex items-center gap-2 border border-primary/50 text-parchment px-8 py-4 text-xs font-bold tracking-widest uppercase transition-all hover:bg-white/5">
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                Falar no WhatsApp
              </a>
            </div>

            <div className="grid grid-cols-3 gap-8 border-t border-primary/20 pt-10">
              <div>
                <p className="font-display text-4xl font-light text-primary">30+</p>
                <p className="text-xs text-muted tracking-wider uppercase mt-1">Imóveis gerenciados em SP</p>
              </div>
              <div>
                <p className="font-display text-4xl font-light text-primary">2021</p>
                <p className="text-xs text-muted tracking-wider uppercase mt-1">Atuando desde</p>
              </div>
              <div>
                <p className="font-display text-4xl font-light text-primary">100%</p>
                <p className="text-xs text-muted tracking-wider uppercase mt-1">Transparência nos repasses</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS — PROPRIETÁRIOS */}
      <section className="bg-[#161410] py-24 border-t border-primary/15">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-14 reveal">
            <span className="text-xs font-bold uppercase tracking-[.3em] text-primary">Quem confiou o imóvel a nós</span>
            <h3 className="font-display font-light text-parchment mt-2 text-[clamp(1.8rem,3vw,2.8rem)]">
              O que nossos <em>proprietários</em> dizem
            </h3>
            <span className="gold-line"></span>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

            <div className="p-10 border border-primary/20 bg-white/3 reveal">
              <p className="font-display text-xl font-light italic text-warm-mid leading-relaxed mb-8">
                &quot;Meu studio em Moema gerava R$ 1.800/mês de aluguel tradicional. Com a Vivare, passou para R$ 4.100/mês em média — e eu não preciso me preocupar com absolutamente nada.&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-display text-lg">M</div>
                <div>
                  <p className="text-sm font-semibold text-parchment">Proprietário · Studio Moema</p>
                  <p className="text-xs text-muted tracking-wider uppercase mt-0.5">São Paulo · desde 2023</p>
                </div>
              </div>
            </div>

            <div className="p-10 border border-primary/20 bg-white/3 reveal" style={{ transitionDelay: '.12s' }}>
              <p className="font-display text-xl font-light italic text-warm-mid leading-relaxed mb-8">
                &quot;O relatório mensal é transparente, o repasse é pontual e qualquer problema no imóvel é resolvido antes que eu precise perguntar. É a parceria que eu precisava para ter renda passiva de verdade.&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-display text-lg">R</div>
                <div>
                  <p className="text-sm font-semibold text-parchment">Proprietário · Apartamento Pinheiros</p>
                  <p className="text-xs text-muted tracking-wider uppercase mt-0.5">São Paulo · desde 2022</p>
                </div>
              </div>
            </div>

          </div>
          <div className="mt-10 text-center reveal">
            <Link href="/para-proprietarios"
              className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-primary border border-primary/40 px-10 py-4 transition-all hover:bg-primary hover:text-ink">
              Ver tudo sobre gestão de imóveis &rarr;
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
