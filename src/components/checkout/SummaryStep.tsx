'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ListingDetail, Guests, Quote } from '@/types';
import { format } from 'date-fns';
import { Loader2, Tag, X } from 'lucide-react';

interface SummaryStepProps {
    listing: ListingDetail;
    checkIn: string;
    checkOut: string;
    guests: Guests;
    quote?: Quote | null;
    appliedCouponCode?: string | null;
    onApplyCoupon: (code: string) => Promise<{ ok: boolean; error?: string }>;
    onRemoveCoupon: () => void;
    onContinue: () => void;
}

export function SummaryStep({
    listing,
    checkIn,
    checkOut,
    guests,
    quote,
    appliedCouponCode,
    onApplyCoupon,
    onRemoveCoupon,
    onContinue,
}: SummaryStepProps) {
    const [showCouponInput, setShowCouponInput] = useState(Boolean(appliedCouponCode));
    const [couponDraft, setCouponDraft] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState<string | null>(null);

    const breakdown = quote?.breakdown;
    const discountAmount = breakdown?.discountAmount ?? 0;
    const currency = quote?.currency ?? 'BRL';
    const fmt = (n: number) =>
        n.toLocaleString('pt-BR', { style: 'currency', currency });

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = couponDraft.trim();
        if (!code) return;
        setCouponLoading(true);
        setCouponError(null);
        const result = await onApplyCoupon(code);
        setCouponLoading(false);
        if (!result.ok) {
            setCouponError(result.error || 'Cupom inválido.');
        } else {
            setCouponDraft('');
        }
    };

    const handleRemove = () => {
        setCouponError(null);
        setCouponDraft('');
        onRemoveCoupon();
    };

    // Para editar datas ou hóspedes, mandamos o usuário de volta para a
    // página do imóvel — onde o BookingWidget tem o calendário com bloqueios
    // reais e o seletor de hóspedes. Mais simples e consistente do que
    // duplicar esses controles aqui dentro do checkout.
    const editListingHref = `/unidades/${listing.id}`;

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
                    <Link
                        href={editListingHref}
                        aria-label="Voltar para o imóvel e alterar datas"
                        className="text-primary-600 text-sm font-semibold underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
                    >
                        Editar
                    </Link>
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
                    <Link
                        href={editListingHref}
                        aria-label="Voltar para o imóvel e alterar hóspedes"
                        className="text-primary-600 text-sm font-semibold underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
                    >
                        Editar
                    </Link>
                </div>

                {/* Price breakdown (only when quote available) */}
                {quote && breakdown && (
                    <div className="py-4 border-b border-neutral-100 dark:border-neutral-800">
                        <h3 className="font-semibold text-lg mb-3">Resumo de preços</h3>
                        <dl className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-neutral-500">Diárias</dt>
                                <dd>{fmt(breakdown.subtotal)}</dd>
                            </div>
                            {breakdown.cleaningFee > 0 && (
                                <div className="flex justify-between">
                                    <dt className="text-neutral-500">Taxa de limpeza</dt>
                                    <dd>{fmt(breakdown.cleaningFee)}</dd>
                                </div>
                            )}
                            {breakdown.serviceFee > 0 && (
                                <div className="flex justify-between">
                                    <dt className="text-neutral-500">Taxa de serviço</dt>
                                    <dd>{fmt(breakdown.serviceFee)}</dd>
                                </div>
                            )}
                            {breakdown.taxes > 0 && (
                                <div className="flex justify-between">
                                    <dt className="text-neutral-500">Impostos</dt>
                                    <dd>{fmt(breakdown.taxes)}</dd>
                                </div>
                            )}
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                                    <dt>
                                        Desconto
                                        {breakdown.appliedCouponCode && (
                                            <span className="ml-1 font-mono uppercase text-xs">
                                                ({breakdown.appliedCouponCode})
                                            </span>
                                        )}
                                    </dt>
                                    <dd>-{fmt(discountAmount)}</dd>
                                </div>
                            )}
                            <div className="flex justify-between pt-2 mt-2 border-t border-neutral-100 dark:border-neutral-800 font-semibold text-base">
                                <dt>Total</dt>
                                <dd>{fmt(quote.total)}</dd>
                            </div>
                        </dl>
                    </div>
                )}

                {/* Coupon */}
                <div className="py-4">
                    {appliedCouponCode ? (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900">
                            <div className="flex items-center gap-2 text-sm text-emerald-800 dark:text-emerald-200">
                                <Tag className="w-4 h-4" aria-hidden="true" />
                                <span>
                                    Cupom <span className="font-mono uppercase">{appliedCouponCode}</span> aplicado
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleRemove}
                                aria-label="Remover cupom"
                                className="p-1 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : showCouponInput ? (
                        <form onSubmit={handleApply} className="space-y-2">
                            <label htmlFor="coupon" className="font-semibold text-sm">
                                Cupom de desconto
                            </label>
                            <div className="flex gap-2">
                                <input
                                    id="coupon"
                                    name="coupon"
                                    type="text"
                                    value={couponDraft}
                                    onChange={(e) => {
                                        setCouponDraft(e.target.value);
                                        if (couponError) setCouponError(null);
                                    }}
                                    placeholder="Digite o código"
                                    autoComplete="off"
                                    autoCapitalize="characters"
                                    spellCheck={false}
                                    disabled={couponLoading}
                                    className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                                    aria-invalid={Boolean(couponError)}
                                    aria-describedby={couponError ? 'coupon-error' : undefined}
                                />
                                <Button
                                    type="submit"
                                    variant="outline"
                                    disabled={couponLoading || !couponDraft.trim()}
                                >
                                    {couponLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        'Aplicar'
                                    )}
                                </Button>
                            </div>
                            {couponError && (
                                <p id="coupon-error" role="alert" className="text-sm text-red-600 dark:text-red-400">
                                    {couponError}
                                </p>
                            )}
                        </form>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setShowCouponInput(true)}
                            className="text-sm font-medium text-primary-600 hover:underline inline-flex items-center gap-1.5"
                        >
                            <Tag className="w-4 h-4" aria-hidden="true" />
                            Tem um cupom de desconto?
                        </button>
                    )}
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
