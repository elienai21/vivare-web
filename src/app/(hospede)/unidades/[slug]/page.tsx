import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { fetchListingById, fetchListingCalendar } from "@/services/staysService";
import GalleryLightbox from "@/components/ui/GalleryLightbox";
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
    const descHTML = listing._msdesc?.pt_BR || "Sem descrição disponível.";

    const now = new Date();
    const fromStr = now.toISOString().split('T')[0];
    const toDate = new Date();
    toDate.setMonth(toDate.getMonth() + 6);
    const toStr = toDate.toISOString().split('T')[0];

    // Server-side block fetch
    const calendarBlocks = await fetchListingCalendar(listing.id, fromStr, toStr);

    return (
        <main className="min-h-screen bg-white text-neutral-900 pb-24">
            <section className="pt-24 container mx-auto px-4 mb-8">
                <h1 className="text-3xl md:text-4xl font-display font-bold mb-2 leading-tight">
                    {title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-neutral-600 font-medium mb-6">
                    <span className="flex items-center gap-1">
                        <span className="text-success">✓</span> Verificado Vivare
                    </span>
                    <span>•</span>
                    <span className="cursor-pointer">{listing.address?.region}, {listing.address?.city}</span>
                </div>

                {/* Main Image Gallery / Lightbox */}
                {listing._t_imagesMeta && listing._t_imagesMeta.length > 0 ? (
                    <GalleryLightbox images={listing._t_imagesMeta} title={title} />
                ) : (
                    <div className="w-full h-[50vh] min-h-[400px] rounded-2xl overflow-hidden bg-neutral-200 relative mb-12 flex items-center justify-center text-neutral-500">
                        {imageUrl ? (
                            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                        ) : (
                            "Imagem indisponível"
                        )}
                    </div>
                )}
            </section>

            <div className="container mx-auto px-4 flex flex-col md:flex-row gap-12">
                {/* Left Column - Content */}
                <div className="flex-1">

                    {/* Section 1: Overview */}
                    <div className="border-b pb-8 mb-8">
                        <h2 className="text-2xl font-bold mb-2">Hospedagem inteira por Grupo Vivare</h2>
                        <p className="text-neutral-600 text-lg">
                            Até {listing._i_maxGuests} {listing._i_maxGuests === 1 ? 'hóspede' : 'hóspedes'} · {listing._i_rooms} {listing._i_rooms === 1 ? 'quarto' : 'quartos'} · {listing._f_bathrooms} banheiros
                        </p>
                    </div>

                    {/* Section 2: Experiência */}
                    <div className="border-b pb-8 mb-8">
                        <h3 className="text-xl font-bold mb-4">Sobre o espaço</h3>
                        <div
                            className="prose prose-neutral max-w-none text-neutral-700"
                            dangerouslySetInnerHTML={{ __html: descHTML }}
                        />
                    </div>

                    {/* Section 3: Mapa de Localização */}
                    {listing.latLng && (
                        <div className="border-b pb-8 mb-8">
                            <h3 className="text-xl font-bold mb-4">Localização</h3>
                            <p className="text-neutral-600 mb-4">{listing.address?.street}, {listing.address?.region} - {listing.address?.city}</p>
                            <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-neutral-200" style={{ position: 'relative', zIndex: 1 }}>
                                <PropertyMap listings={[listing]} singleView={true} />
                            </div>
                        </div>
                    )}

                    {/* Section 4: Políticas (Static info for now) */}
                    <div className="pb-8 mb-8 bg-neutral-50 p-6 rounded-2xl border border-neutral-200">
                        <h3 className="text-xl font-bold mb-4">Políticas e Regras da Casa</h3>
                        <div className="space-y-4 text-sm text-neutral-700">
                            <div className="flex flex-col">
                                <span className="font-bold">Check-in / Check-out</span>
                                <span>A partir das 15:00 / Até as 11:00</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold">Regras básicas</span>
                                <span>Não é permitido festas. Silêncio após 22h. Cuidar do imóvel como se fosse seu.</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Booking Widget */}
                <div className="w-full md:w-[380px]">
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
