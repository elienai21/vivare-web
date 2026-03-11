import type { Metadata } from "next";
import Link from "next/link";
import { fetchListings, fetchListingCalendar } from "@/services/staysService";
import PropertyMap from "@/components/ui/DynamicPropertyMap";

export const metadata: Metadata = {
    title: "Acomodações Disponíveis",
    description: "Encontre o apartamento perfeito para a sua estadia em São Paulo, Santos ou Guarujá.",
    alternates: { canonical: "/unidades" },
    openGraph: {
        title: "Acomodações Disponíveis - Vivare",
        description: "Apartamentos premium para temporada em São Paulo, Santos e Guarujá.",
    },
};

function formatDateBR(dateStr: string): string {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
}

export default async function UnidadesPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    // Busca do Stays
    let listings = await fetchListings() || [];
    listings = listings.filter(l => l.status === "active");

    // Lê filtros da URL (Next.js 16: searchParams é Promise)
    const params = await searchParams;
    const dest = params?.dest as string;
    const guests = params?.guests as string;
    const checkIn = params?.checkIn as string;
    const checkOut = params?.checkOut as string;

    const hasDateFilter = checkIn && checkOut && /^\d{4}-\d{2}-\d{2}$/.test(checkIn) && /^\d{4}-\d{2}-\d{2}$/.test(checkOut);
    const hasGuestsFilter = guests && !isNaN(parseInt(guests, 10));

    // Filtro por destino (bairro, cidade ou nome)
    if (dest) {
        const query = dest.toLowerCase();
        listings = listings.filter(item =>
            item._mstitle.pt_BR?.toLowerCase().includes(query) ||
            item.address.region?.toLowerCase().includes(query) ||
            item.address.city?.toLowerCase().includes(query)
        );
    }

    // Filtro por número de hóspedes
    if (hasGuestsFilter) {
        const guestsNum = parseInt(guests, 10);
        listings = listings.filter(item => item._i_maxGuests >= guestsNum);
    }

    // Filtro por disponibilidade nas datas (via API de calendário)
    if (hasDateFilter) {
        const availabilityChecks = await Promise.allSettled(
            listings.map(async (listing) => {
                const calendar = await fetchListingCalendar(listing.id, checkIn, checkOut);
                const items = Array.isArray(calendar) ? calendar : [];

                // Verifica se todas as datas no período estão disponíveis
                const ciDate = new Date(checkIn);
                const coDate = new Date(checkOut);
                const cursor = new Date(ciDate);

                while (cursor < coDate) {
                    const dateStr = cursor.toISOString().split('T')[0];
                    const dayData = items.find((d: { date: string, avail: number | boolean, status: string }) => d.date === dateStr);

                    if (dayData && (dayData.avail === 0 || dayData.avail === false || dayData.status === 'blocked' || dayData.status === 'booked')) {
                        return { id: listing.id, available: false };
                    }

                    cursor.setDate(cursor.getDate() + 1);
                }

                return { id: listing.id, available: true };
            })
        );

        const availableIds = new Set(
            availabilityChecks
                .filter((r): r is PromiseFulfilledResult<{ id: string; available: boolean }> =>
                    r.status === 'fulfilled' && r.value.available
                )
                .map(r => r.value.id)
        );

        listings = listings.filter(item => availableIds.has(item.id));
    }

    // Monta query string para preservar filtros nos links
    const filterParams = new URLSearchParams();
    if (checkIn) filterParams.set("checkIn", checkIn);
    if (checkOut) filterParams.set("checkOut", checkOut);
    if (guests) filterParams.set("guests", guests);
    const filterQuery = filterParams.toString();

    // Descrição dos filtros ativos
    const activeFilters: string[] = [];
    if (dest) activeFilters.push(dest);
    if (hasDateFilter) activeFilters.push(`${formatDateBR(checkIn)} - ${formatDateBR(checkOut)}`);
    if (hasGuestsFilter) activeFilters.push(`${guests} hóspede${parseInt(guests, 10) !== 1 ? 's' : ''}`);

    return (
        <main className="min-h-screen pt-24 pb-12 bg-neutral-50 text-neutral-900 flex flex-col">

            {/* Search Header / Filtros */}
            <section className="bg-white border-b border-neutral-200 sticky top-0 z-20 py-4 shadow-sm">
                <form action="/unidades" method="GET" className="container mx-auto px-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex bg-neutral-100 rounded-full overflow-hidden flex-1 max-w-2xl border border-neutral-200 focus-within:ring-2 focus-within:ring-primary-500 transition-all">
                        <input
                            type="text"
                            name="dest"
                            defaultValue={dest || ""}
                            placeholder="Buscar por bairro, cidade ou nome..."
                            className="px-6 py-3 bg-transparent w-full outline-none text-neutral-800 placeholder:text-neutral-500 font-medium"
                        />
                        <button type="submit" className="bg-primary hover:brightness-110 text-ink px-8 font-bold transition-all flex items-center gap-2 tracking-wide">
                            <span className="material-symbols-outlined text-[18px]">search</span> Buscar
                        </button>
                    </div>

                    <div className="flex gap-2 relative z-50 flex-wrap items-center">
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                name="checkIn"
                                defaultValue={checkIn || ""}
                                className="text-sm bg-white py-2.5 px-3 rounded-full border border-neutral-300 font-semibold outline-none hover:border-neutral-400 transition-all"
                            />
                            <span className="text-neutral-400 text-xs font-bold">-</span>
                            <input
                                type="date"
                                name="checkOut"
                                defaultValue={checkOut || ""}
                                className="text-sm bg-white py-2.5 px-3 rounded-full border border-neutral-300 font-semibold outline-none hover:border-neutral-400 transition-all"
                            />
                        </div>
                        <div className="relative group">
                            <select name="guests" defaultValue={guests || ""} className="btn btn-secondary text-sm appearance-none bg-white pr-8 py-3 rounded-full border border-neutral-300 font-semibold cursor-pointer outline-none hover:border-neutral-400 transition-all">
                                <option value="">Hóspedes</option>
                                <option value="1">1 Hóspede</option>
                                <option value="2">2 Hóspedes</option>
                                <option value="3">3 Hóspedes</option>
                                <option value="4">4+ Hóspedes</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 text-[20px]">expand_more</span>
                        </div>
                    </div>
                </form>

                {/* Active Filters Badges */}
                {activeFilters.length > 0 && (
                    <div className="container mx-auto px-4 mt-3 flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-neutral-500 font-medium">Filtros:</span>
                        {activeFilters.map((filter, i) => (
                            <span key={i} className="inline-flex items-center gap-1 text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-200 px-3 py-1 rounded-full">
                                {filter}
                            </span>
                        ))}
                        <Link href="/unidades" className="text-xs text-neutral-500 hover:text-red-500 font-medium underline ml-2 transition-colors">
                            Limpar filtros
                        </Link>
                    </div>
                )}
            </section>

            {/* Main Content - Split View */}
            <section className="flex-1 flex flex-col lg:flex-row relative">

                {/* Left Side - Results Grid */}
                <div className="w-full lg:w-[55%] xl:w-[60%] px-4 lg:pl-8 lg:pr-6 py-8 flex flex-col h-full min-h-[500px]">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-display font-bold text-ink">
                            {listings.length} {listings.length === 1 ? 'Acomodação encontrada' : 'Acomodações encontradas'}
                            {hasDateFilter && <span className="text-base font-normal text-neutral-500 ml-2">disponíveis nas datas selecionadas</span>}
                        </h1>
                    </div>

                    {listings.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                            <span className="material-symbols-outlined text-6xl text-neutral-300 mb-4">search_off</span>
                            <h3 className="text-xl font-bold text-neutral-700 mb-2">Nenhum resultado encontrado</h3>
                            <p className="text-neutral-500 mb-6">
                                {hasDateFilter
                                    ? 'Não há acomodações disponíveis para as datas e filtros selecionados. Tente outras datas.'
                                    : 'Tente ajustar seus filtros ou buscar por outra região.'}
                            </p>
                            <Link href="/unidades" className="btn btn-primary rounded-full px-8">Limpar Busca</Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {/* Listing Card Loop */}
                            {listings.map((item) => (
                                <Link href={`/unidades/${item.id}${filterQuery ? `?${filterQuery}` : ''}`} key={item._id} className="group relative flex flex-col bg-white border border-neutral-200 hover:border-neutral-300 rounded-[1.25rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full cursor-pointer">
                                    {/* Image Container */}
                                    <div className="aspect-[4/3] w-full bg-neutral-100 overflow-hidden relative">
                                        {item._t_mainImageMeta?.url ? (
                                            <img
                                                src={item._t_mainImageMeta.url}
                                                alt={item._mstitle.pt_BR}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-neutral-400 font-medium text-sm">Sem imagem</div>
                                        )}
                                        {/* Favoritar */}
                                        <div className="absolute top-3 right-3 bg-white/60 hover:bg-white backdrop-blur-md rounded-full p-2 text-neutral-700 hover:text-rose-500 shadow-sm transition-all duration-200 flex items-center justify-center z-10">
                                            <span className="material-symbols-outlined text-[18px]">favorite</span>
                                        </div>
                                    </div>

                                    {/* Content Container */}
                                    <div className="p-5 flex-1 flex flex-col">
                                        {/* Titulo e Local */}
                                        <div className="mb-3">
                                            <h2 className="font-display font-bold text-lg leading-tight text-neutral-900 group-hover:text-primary-700 transition-colors line-clamp-2" title={item._mstitle.pt_BR}>
                                                {item._mstitle.pt_BR}
                                            </h2>
                                            <p className="text-neutral-500 text-xs mt-1 truncate font-medium tracking-wide">
                                                {item.address.region}{item.address.region && item.address.city ? ', ' : ''}{item.address.city}
                                            </p>
                                        </div>

                                        {/* Comodidades (Features) */}
                                        <div className="flex items-center text-neutral-600 text-[11px] font-semibold tracking-wide uppercase gap-2 mb-4">
                                            <span>Até {item._i_maxGuests} hósp{item._i_maxGuests !== 1 && 's'}</span>
                                            <span className="w-1 h-1 rounded-full bg-neutral-300"></span>
                                            <span>{item._i_rooms} dorm{item._i_rooms !== 1 && 's'}</span>
                                            <span className="w-1 h-1 rounded-full bg-neutral-300"></span>
                                            <span>{item._f_bathrooms} banh{item._f_bathrooms !== 1 && 's'}</span>
                                        </div>

                                        <div className="mt-auto"></div> {/* Espaçador Flex */}

                                        {/* Footer: Preço + Call to Action */}
                                        <div className="pt-4 border-t border-neutral-100 flex justify-between items-end">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-0.5">A partir de</span>
                                                <span className="font-bold text-neutral-900 text-lg">
                                                    {item._d_minPrice ? `R$ ${item._d_minPrice}` : 'Ver tarifas'} <span className="text-xs font-normal text-neutral-500 normal-case tracking-normal">/ noite</span>
                                                </span>
                                            </div>
                                            <div className="bg-neutral-50 text-primary-700 font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-lg border border-neutral-200 group-hover:bg-primary-600 group-hover:border-primary-600 group-hover:text-white transition-all duration-300">
                                                Ver
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Side - Sticky Interactive Map */}
                <div className="hidden lg:block lg:w-[45%] xl:w-[40%] bg-neutral-200 sticky top-[80px] h-[calc(100vh-80px)] border-l border-neutral-200 z-10">
                    <PropertyMap listings={listings} />
                </div>

            </section>
        </main>
    );
}
