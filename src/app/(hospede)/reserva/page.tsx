import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutWizard } from "@/components/checkout/CheckoutWizard";
import { fetchListingById, type StaysListing } from "@/services/staysService";
import type { Guests, ListingDetail } from "@/types";

export const metadata: Metadata = {
    title: "Finalizar Reserva",
    description:
        "Finalize sua reserva com segurança em apartamentos premium da Vivare em São Paulo, Santos e Guarujá.",
    // Checkout pages are intentionally excluded from search indexing —
    // they only make sense in the context of an in-progress booking flow.
    robots: { index: false, follow: false },
};

// Always render dynamically: the wizard depends on per-user search params
// and live listing/calendar data, so static generation would be misleading.
export const dynamic = "force-dynamic";

/**
 * URL contract (kept compatible with what BookingWidget already builds):
 *   /reserva?id=<listingId>&from=<YYYY-MM-DD>&to=<YYYY-MM-DD>&persons=<n>
 *
 * Also accepts the more standard names used elsewhere on the site:
 *   /reserva?listingId=<...>&checkIn=<...>&checkOut=<...>&guests=<n>
 *
 * If anything required is missing or invalid we send the visitor back to
 * the listings page with a generic message — this route is meaningless
 * without a target listing and date range.
 */
type ReservaSearchParams = {
    id?: string;
    listingId?: string;
    from?: string;
    checkIn?: string;
    to?: string;
    checkOut?: string;
    persons?: string;
    guests?: string;
    adults?: string;
    children?: string;
    infants?: string;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function pickFirst<T>(value: T | T[] | undefined): T | undefined {
    if (Array.isArray(value)) return value[0];
    return value;
}

function toIntOr(value: string | undefined, fallback: number): number {
    if (!value) return fallback;
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

/** Adapt the Stays-shaped listing into the `ListingDetail` the wizard expects. */
function mapStaysToListingDetail(stays: StaysListing): ListingDetail {
    const photos = (stays._t_imagesMeta || []).map((img, idx) => ({
        id: `${stays._id}-${idx}`,
        url: img.url,
        order: idx,
    }));

    return {
        id: stays.id || stays._id,
        name: stays._mstitle?.pt_BR ?? stays.internalName ?? "Acomodação Vivare",
        address: {
            neighborhood: stays.address?.region ?? "",
            city: stays.address?.city ?? "",
            state: "",
            coordinates: stays.latLng
                ? { latitude: stays.latLng._f_lat, longitude: stays.latLng._f_lng }
                : undefined,
        },
        bedrooms: stays._i_rooms ?? 0,
        bathrooms: stays._f_bathrooms ?? 0,
        maxGuests: stays._i_maxGuests ?? 1,
        propertyType: "",
        amenities: [],
        photos,
        description: stays._msdesc?.pt_BR,
        thumbnail: stays._t_mainImageMeta?.url ?? photos[0]?.url ?? "",
    };
}

export default async function ReservaPage({
    searchParams,
}: {
    searchParams: Promise<ReservaSearchParams>;
}) {
    const params = await searchParams;

    const listingId = pickFirst(params.id) ?? pickFirst(params.listingId);
    const checkIn = pickFirst(params.from) ?? pickFirst(params.checkIn);
    const checkOut = pickFirst(params.to) ?? pickFirst(params.checkOut);

    // Required: listingId + valid ISO date range with checkOut > checkIn.
    if (
        !listingId ||
        !checkIn ||
        !checkOut ||
        !ISO_DATE.test(checkIn) ||
        !ISO_DATE.test(checkOut) ||
        checkOut <= checkIn
    ) {
        // Send the visitor back to the listings page — anything else would
        // render the wizard in an inconsistent state.
        redirect("/unidades?error=reserva-invalida");
    }

    // Guests can be split (`adults`/`children`/`infants`) or a single
    // total via `persons`/`guests`. Default everything to a sensible 2 adults.
    const adultsParam = pickFirst(params.adults);
    const childrenParam = pickFirst(params.children);
    const infantsParam = pickFirst(params.infants);
    const totalParam = pickFirst(params.persons) ?? pickFirst(params.guests);

    const guests: Guests = adultsParam || childrenParam || infantsParam
        ? {
              adults: toIntOr(adultsParam, 2),
              children: toIntOr(childrenParam, 0),
              infants: toIntOr(infantsParam, 0),
          }
        : {
              // Single-number contract: treat all as adults.
              adults: Math.max(1, toIntOr(totalParam, 2)),
              children: 0,
              infants: 0,
          };

    const stays = await fetchListingById(listingId);

    if (!stays) {
        return (
            <main className="min-h-screen pt-24 pb-12">
                <div className="container mx-auto px-4 max-w-2xl text-center">
                    <h1 className="text-3xl font-display font-bold mb-4">
                        Acomodação não encontrada
                    </h1>
                    <p className="text-neutral-600 mb-8">
                        Não conseguimos carregar essa acomodação. Talvez ela tenha sido
                        removida ou o link esteja incorreto.
                    </p>
                    <Link
                        href="/unidades"
                        className="inline-block bg-ink text-white px-8 py-3 rounded-xl font-semibold hover:bg-neutral-800 transition-colors"
                    >
                        Ver acomodações disponíveis
                    </Link>
                </div>
            </main>
        );
    }

    const listing = mapStaysToListingDetail(stays);

    return (
        <main className="min-h-screen pt-24 pb-12">
            <CheckoutWizard
                listing={listing}
                checkIn={checkIn}
                checkOut={checkOut}
                guests={guests}
            />
        </main>
    );
}
