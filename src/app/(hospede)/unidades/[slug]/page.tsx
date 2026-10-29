import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, BedDouble, Bath, Users, Star } from "lucide-react";
import { PROOF, WHATSAPP_NUMBER } from "@/lib/constants";
import { fetchListingById, fetchListingCalendar } from "@/services/staysService";
import GalleryLightbox from "@/components/ui/GalleryLightbox";
import { ReadMore } from "@/components/ui/ReadMore";
import BookingWidget from "@/components/ui/BookingWidget";
import PropertyMap from "@/components/ui/DynamicPropertyMap";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const listing = await fetchListingById(slug);

    if (!listing) {
        return { title: "Unidade não encontrada" };
    }

    const title = listing._mstitle?.pt_BR || listing.internalName;

    return {
        title: `${title} | Vivare`,
        description: `Reserve ${title} em ${listing.address?.city} com a Vivare. Check-in digital e conforto premium.`,
        alternates: { canonical: `/unidades/${slug}` },
        openGraph: {
            title: `${title} - Vivare`,
            description: `Apartamento premium para temporada. Reserve agora com a Vivare.`,
            images: listing._t_mainImageMeta?.url ? [listing._t_mainImageMeta.url] : [],
        },
    };
}

export default async function UnidadeDetalhePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const listing = await fetchListingById(slug);

    if (!listing) {
        notFound();
    }

    const title = listing._mstitle?.pt_BR || "Unidade Vivare";
    const imageUrl = listing._t_mainImageMeta?.url || "";
    const descHTML = listing._msdesc?.pt_BR || "";
    const bathrooms = listing._f_bathrooms ?? 0;

    const now = new Date();
    const fromStr = now.toISOString().split('T')[0];
    const toDate = new Date();
    toDate.setMonth(toDate.getMonth() + 6);
    const toStr = toDate.toISOString().split('T')[0];

    // Server-side block fetch
    const calendarBlocks = await fetchListingCalendar(listing.id, fromStr, toStr);

    return (
        // pb extra no celular: a barra fixa de reserva ocupa ~5rem no rodapé da tela
        <main className="min-h-screen bg-background text-foreground pb-28 md:pb-24">
            <section className="pt-6 md:pt-10 container mx-auto px-4 mb-6 md:mb-8">
                <p className="chapeu">
                    {listing.address?.region}{listing.address?.region && listing.address?.city ? ' · ' : ''}{listing.address?.city}
                </p>
                {/* Nomes vêm das OTAs e são longos: duas linhas no celular, três no desktop. */}
                <h1 className="mt-1 mb-3 font-display text-3xl md:text-4xl font-normal leading-tight line-clamp-2 md:line-clamp-3" title={title}>
                    {title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-secondary-text font-medium mb-6">
                    <span className="inline-flex items-center gap-1.5">
                        <BadgeCheck className="h-4 w-4 text-primary-deep dark:text-primary-light" aria-hidden="true" />
                        Gestão Vivare
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <Star className="h-4 w-4 fill-primary text-primary" aria-hidden="true" />
                        {PROOF.rating} · Superhost no Airbnb
                    </span>
                </div>

                {listing._t_imagesMeta && listing._t_imagesMeta.length > 0 ? (
                    <GalleryLightbox images={listing._t_imagesMeta} title={title} />
                ) : (
                    <div className="w-full aspect-[4/3] md:h-[50vh] md:aspect-auto md:min-h-[400px] rounded-2xl overflow-hidden bg-warm-mid dark:bg-ink-card relative mb-8 flex items-center justify-center text-secondary-text">
                        {imageUrl ? (
                            <Image
                                src={imageUrl}
                                alt={title}
                                fill
                                sizes="(max-width: 768px) 100vw, 80vw"
                                className="object-cover"
                                priority
                            />
                        ) : (
                            "Foto em breve"
                        )}
                    </div>
                )}
            </section>

            <div className="container mx-auto px-4 flex flex-col md:flex-row gap-10 md:gap-12">
                {/* Coluna de conteúdo */}
                <div className="flex-1 min-w-0">

                    <div className="border-b border-card-border pb-8 mb-8">
                        <h2 className="font-display text-2xl font-medium mb-3">Apartamento inteiro, com gestão profissional</h2>
                        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-base text-secondary-text">
                            <li className="inline-flex items-center gap-2"><Users className="h-4 w-4" aria-hidden="true" />até {listing._i_maxGuests} {listing._i_maxGuests === 1 ? 'hóspede' : 'hóspedes'}</li>
                            <li className="inline-flex items-center gap-2"><BedDouble className="h-4 w-4" aria-hidden="true" />{listing._i_rooms} {listing._i_rooms === 1 ? 'quarto' : 'quartos'}</li>
                            <li className="inline-flex items-center gap-2"><Bath className="h-4 w-4" aria-hidden="true" />{bathrooms} {bathrooms === 1 ? 'banheiro' : 'banheiros'}</li>
                        </ul>
                    </div>

                    {/* O que vem com toda unidade Vivare (prova real, não inventada) */}
                    <div className="border-b border-card-border pb-8 mb-8">
                        <h3 className="font-display text-xl font-medium mb-4">Padrão Vivare</h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-base">
                            <li className="flex gap-2"><span className="text-primary-deep dark:text-primary-light" aria-hidden="true">—</span>Check-in digital, sem chave física</li>
                            <li className="flex gap-2"><span className="text-primary-deep dark:text-primary-light" aria-hidden="true">—</span>Sem depósito caução e sem fiador</li>
                            <li className="flex gap-2"><span className="text-primary-deep dark:text-primary-light" aria-hidden="true">—</span>Enxoval de cama e banho padrão hotelaria</li>
                            <li className="flex gap-2"><span className="text-primary-deep dark:text-primary-light" aria-hidden="true">—</span>Atendimento humano por WhatsApp</li>
                        </ul>
                    </div>

                    {descHTML && (
                        <div className="border-b border-card-border pb-8 mb-8">
                            <h3 className="font-display text-xl font-medium mb-4">Sobre o espaço</h3>
                            {/* Texto da Stays: medida de leitura e "ler mais" para não virar parede entre as fotos e o mapa */}
                            <ReadMore html={descHTML} className="prose prose-neutral max-w-[65ch] text-foreground [&_p]:my-3" />
                        </div>
                    )}

                    {listing.latLng && (
                        <div className="border-b border-card-border pb-8 mb-8">
                            <h3 className="font-display text-xl font-medium mb-2">Localização</h3>
                            <p className="text-secondary-text mb-4">{listing.address?.street}, {listing.address?.region}, {listing.address?.city}</p>
                            {/* touch-action: a rolagem vertical da página passa pelo mapa no celular */}
                            <div className="w-full h-[320px] md:h-[400px] rounded-2xl overflow-hidden border border-card-border relative z-[1]" style={{ touchAction: 'pan-y' }}>
                                <PropertyMap listings={[listing]} singleView={true} />
                            </div>
                        </div>
                    )}

                    <div className="pb-2 mb-8 bg-card p-6 rounded-2xl border border-card-border">
                        <h3 className="font-display text-xl font-medium mb-4">Políticas e regras da casa</h3>
                        <dl className="space-y-4 text-sm">
                            <div>
                                <dt className="font-bold">Check-in e check-out</dt>
                                <dd className="text-secondary-text">Entrada a partir das 15h, saída até as 11h.</dd>
                            </div>
                            <div>
                                <dt className="font-bold">Regras básicas</dt>
                                <dd className="text-secondary-text">Sem festas. Silêncio após as 22h. Cuide do imóvel como se fosse seu.</dd>
                            </div>
                            <div>
                                <dt className="font-bold">Cancelamento</dt>
                                <dd className="text-secondary-text">Reembolso integral com antecedência; os prazos exatos estão na <Link href="/politica-de-cancelamento" className="font-semibold text-primary-deep underline underline-offset-4 dark:text-primary-light">política de cancelamento</Link>.</dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Coluna de reserva (vira barra fixa inferior no celular, dentro do widget) */}
                <div className="w-full md:w-[380px] shrink-0">
                    <BookingWidget
                        listingId={listing.id}
                        whatsapp={WHATSAPP_NUMBER}
                        listingName={title}
                        calendarData={calendarBlocks}
                        maxGuests={listing._i_maxGuests || 5}
                    />
                </div>
            </div>
        </main>
    );
}
