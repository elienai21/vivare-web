import { notFound } from 'next/navigation';
import { getListingDetail } from '@/lib/api-client';
import { CheckoutWizard } from '@/components/checkout/CheckoutWizard';
import { Guests } from '@/types';

async function getListing(id: string) {
    try {
        return await getListingDetail(id);
    } catch {
        return null;
    }
}

export default async function CheckoutPage({
    params,
    searchParams
}: {
    params: { id: string };
    searchParams: { checking?: string; checkOut?: string; guests?: string };
}) {
    const listing = await getListing(params.id);

    if (!listing) {
        notFound();
    }

    // Validate required params
    if (!searchParams.checkOut || !searchParams.guests) { // checkIn usually present if checkOut is
        // Redirect back to listing or show error
        // For now just error
        // redirect(`/acomodacoes/${params.id}`); 
    }

    const checkOutParam = searchParams.checkOut;
    const guestsParam = searchParams.guests;

    // Fix for checking/checkIn param mismatch if exists
    const checkInParam = (searchParams as { [key: string]: string | undefined }).checkIn || searchParams.checking;

    if (!checkInParam || !checkOutParam) {
        return (
            <div className="p-8 text-center text-red-500">
                Parâmetros de datas inválidos. Por favor, inicie a reserva pela página da acomodação.
            </div>
        );
    }

    const guests: Guests = {
        adults: Number(guestsParam) || 1,
        children: 0,
        infants: 0
    };

    return (
        <main className="min-h-screen bg-white dark:bg-black py-8">
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-3xl font-display font-bold text-center mb-8">Finalizar Reserva</h1>
                <CheckoutWizard
                    listing={listing}
                    checkIn={checkInParam}
                    checkOut={checkOutParam}
                    guests={guests}
                />
            </div>
        </main>
    );
}
