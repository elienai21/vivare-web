import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Search, SearchX } from "lucide-react";
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
        <main className="min-h-screen pb-12 bg-background text-foreground flex flex-col">

            {/* Filtros: pegajosos só a partir de md e abaixo do cabeçalho (antes
                ficavam escondidos sob o header sticky e, no celular, comiam 25% da tela). */}
            <section className="bg-card border-b border-card-border md:sticky md:top-[var(--header-h)] z-20 py-3 md:py-4 shadow-sm">
                <form action="/unidades" method="GET" className="mx-auto max-w-7xl px-4 lg:px-8 flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center justify-between">
                    <div className="flex bg-background rounded-full overflow-hidden flex-1 max-w-2xl border border-card-border focus-within:ring-2 focus-within:ring-primary transition-shadow">
                        <label htmlFor="busca-dest" className="sr-only">Bairro, cidade ou nome da unidade</label>
                        <input
                            id="busca-dest"
                            type="search"
                            name="dest"
                            defaultValue={dest || ""}
                            placeholder="Bairro, cidade ou nome"
                            autoComplete="off"
                            className="px-5 py-3 bg-transparent w-full min-h-12 outline-none text-base text-foreground placeholder:text-secondary-text font-medium"
                        />
                        <button type="submit" className="bg-primary hover:bg-primary-light text-ink px-5 md:px-8 font-bold transition-colors flex items-center gap-2 tracking-wide">
                            <Search className="w-[18px] h-[18px]" aria-hidden="true" /> Buscar
                        </button>
                    </div>

                    <fieldset className="flex gap-2 relative z-50 flex-wrap items-center">
                        <legend className="sr-only">Datas e hóspedes</legend>
                        <div className="flex items-center gap-2">
                            <label htmlFor="busca-checkin" className="sr-only">Check-in</label>
                            <input
                                id="busca-checkin"
                                type="date"
                                name="checkIn"
                                defaultValue={checkIn || ""}
                                className="text-base md:text-sm bg-card text-foreground min-h-11 py-2 px-3 rounded-full border border-card-border font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            />
                            <span className="text-secondary-text text-xs font-bold" aria-hidden="true">–</span>
                            <label htmlFor="busca-checkout" className="sr-only">Check-out</label>
                            <input
                                id="busca-checkout"
                                type="date"
                                name="checkOut"
                                defaultValue={checkOut || ""}
                                className="text-base md:text-sm bg-card text-foreground min-h-11 py-2 px-3 rounded-full border border-card-border font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="busca-guests" className="sr-only">Hóspedes</label>
                            <select id="busca-guests" name="guests" defaultValue={guests || ""} className="text-base md:text-sm appearance-none bg-card text-foreground min-h-11 pl-4 pr-9 py-2 rounded-full border border-card-border font-semibold cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary">
                                <option value="">Hóspedes</option>
                                <option value="1">1 hóspede</option>
                                <option value="2">2 hóspedes</option>
                                <option value="3">3 hóspedes</option>
                                <option value="4">4+ hóspedes</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-secondary-text w-5 h-5" aria-hidden="true" />
                        </div>
                    </fieldset>
                </form>

                {activeFilters.length > 0 && (
                    <div className="mx-auto max-w-7xl px-4 lg:px-8 mt-3 flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-secondary-text font-medium">Filtros:</span>
                        {activeFilters.map((filter, i) => (
                            <span key={i} className="inline-flex items-center gap-1 text-xs font-semibold bg-primary-dim text-foreground border border-primary/40 px-3 py-1 rounded-full">
                                {filter}
                            </span>
                        ))}
                        <Link href="/unidades" className="inline-flex min-h-11 items-center text-xs text-secondary-text hover:text-foreground font-medium underline underline-offset-4 ml-2 transition-colors">
                            Limpar filtros
                        </Link>
                    </div>
                )}
            </section>

            {/* Main Content - Split View */}
            <section className="flex-1 flex flex-col lg:flex-row relative">

                {/* Left Side - Results Grid */}
                <div className="w-full lg:w-[55%] xl:w-[60%] px-4 lg:pl-8 lg:pr-6 py-8 flex flex-col h-full min-h-[500px]">
                    <div className="mb-6">
                        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                            Acomodações em {dest ? dest : "São Paulo, Santos e Guarujá"}
                        </h1>
                        <p className="mt-1 text-base text-secondary-text" aria-live="polite">
                            {listings.length} {listings.length === 1 ? 'unidade' : 'unidades'}
                            {hasDateFilter ? ' disponíveis nas datas escolhidas' : ' disponíveis'}
                        </p>
                    </div>

                    {listings.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                            <SearchX className="w-16 h-16 text-secondary-text/50 mb-4" aria-hidden="true" />
                            <h2 className="font-display text-xl font-bold mb-2">Nenhuma unidade para esses filtros</h2>
                            <p className="text-secondary-text mb-6 max-w-md">
                                {hasDateFilter
                                    ? 'Não há unidades livres nas datas e filtros escolhidos. Experimente outras datas ou outro bairro.'
                                    : 'Experimente outro bairro ou limpe os filtros para ver todas as unidades.'}
                            </p>
                            <Link href="/unidades" className="inline-flex min-h-12 items-center rounded-full bg-ink px-8 text-sm font-bold text-primary-light transition-colors hover:bg-primary hover:text-ink dark:bg-parchment dark:text-ink">Ver todas as unidades</Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {listings.map((item) => {
                                const guestsN = item._i_maxGuests ?? 0;
                                const roomsN = item._i_rooms ?? 0;
                                const bathsN = item._f_bathrooms ?? 0;
                                return (
                                <Link href={`/unidades/${item.id}${filterQuery ? `?${filterQuery}` : ''}`} key={item._id} className="group card card-interactive relative flex flex-col overflow-hidden rounded-[1.25rem] h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                                    <div className="aspect-[4/3] w-full bg-warm-mid dark:bg-ink-card overflow-hidden relative">
                                        {item._t_mainImageMeta?.url ? (
                                            <Image
                                                src={item._t_mainImageMeta.url}
                                                alt={item._mstitle.pt_BR}
                                                fill
                                                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-secondary-text font-medium text-sm">Foto em breve</div>
                                        )}
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="mb-3">
                                            <p className="text-xs font-semibold uppercase tracking-wider text-primary-deep dark:text-primary-light truncate">
                                                {item.address.region}{item.address.region && item.address.city ? ', ' : ''}{item.address.city}
                                            </p>
                                            <h2 className="mt-1 font-display font-bold text-lg leading-tight text-foreground group-hover:text-primary-deep dark:group-hover:text-primary-light transition-colors line-clamp-2" title={item._mstitle.pt_BR}>
                                                {item._mstitle.pt_BR}
                                            </h2>
                                        </div>

                                        <ul className="flex flex-wrap items-center text-secondary-text text-sm gap-x-4 gap-y-1 mb-4">
                                            <li>até {guestsN} {guestsN === 1 ? 'hóspede' : 'hóspedes'}</li>
                                            <li>{roomsN} {roomsN === 1 ? 'quarto' : 'quartos'}</li>
                                            <li>{bathsN} {bathsN === 1 ? 'banheiro' : 'banheiros'}</li>
                                        </ul>

                                        <div className="mt-auto"></div>

                                        {/* A Stays não expõe preço mínimo por unidade: sem valor, nada de
                                            moldura "A partir de / noite" vazia. */}
                                        <div className="pt-4 border-t border-card-border flex justify-between items-center">
                                            <span className="text-sm font-semibold text-foreground">
                                                {item._d_minPrice
                                                    ? <>R$ {item._d_minPrice} <span className="text-xs font-normal text-secondary-text">/ noite</span></>
                                                    : 'Ver datas e valores'}
                                            </span>
                                            <span aria-hidden="true" className="text-primary-deep dark:text-primary-light transition-transform group-hover:translate-x-1">→</span>
                                        </div>
                                    </div>
                                </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Mapa fixo ao lado da grade (desktop) */}
                <div className="hidden lg:block lg:w-[45%] xl:w-[40%] bg-warm-mid sticky top-[var(--header-h)] h-[calc(100vh-var(--header-h))] border-l border-card-border z-10">
                    <PropertyMap listings={listings} />
                </div>

            </section>
        </main>
    );
}
