import { Button } from '@/components/ui/Button';
import { ListingDetail, Guests } from '@/types';
import { format } from 'date-fns';

interface SummaryStepProps {
    listing: ListingDetail;
    checkIn: string;
    checkOut: string;
    guests: Guests;
    onContinue: () => void;
}

export function SummaryStep({ listing, checkIn, checkOut, guests, onContinue }: SummaryStepProps) {
    // We assume price is handled by the parent/wizard fetching a fresh quote
    // For MVP, we can recalculate or just display the basics and let the next step do the heavy lifting (Hold)

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-bold font-display">Conferir sua viagem</h2>

            <div className="space-y-6">
                {/* Dates */}
                <div className="flex justify-between items-center py-4 border-b border-neutral-100 dark:border-neutral-800">
                    <div>
                        <h3 className="font-semibold text-lg">Datas</h3>
                        <p className="text-neutral-500">
                            {format(new Date(checkIn + 'T00:00:00'), 'dd/MM/yyyy')} – {format(new Date(checkOut + 'T00:00:00'), 'dd/MM/yyyy')}
                        </p>
                    </div>
                    <Button variant="ghost" className="text-primary-600">Editar</Button>
                </div>

                {/* Guests */}
                <div className="flex justify-between items-center py-4 border-b border-neutral-100 dark:border-neutral-800">
                    <div>
                        <h3 className="font-semibold text-lg">Hóspedes</h3>
                        <p className="text-neutral-500">
                            {guests.adults + guests.children} hóspedes
                            {guests.infants > 0 && `, ${guests.infants} bebês`}
                        </p>
                    </div>
                    <Button variant="ghost" className="text-primary-600">Editar</Button>
                </div>

                {/* Rules or Info */}
                <div className="py-4">
                    <h3 className="font-semibold text-lg mb-2">Regras da casa</h3>
                    <p className="text-sm text-neutral-500">
                        Check-in: {listing.checkInTime || '15:00'}<br />
                        Check-out: {listing.checkOutTime || '11:00'}
                    </p>
                </div>
            </div>

            <div className="pt-8">
                <Button onClick={onContinue} size="lg" className="w-full md:w-auto px-8">
                    Continuar para Dados
                </Button>
            </div>
        </div>
    );
}
