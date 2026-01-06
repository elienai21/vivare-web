'use client';

import Link from 'next/link';

interface EmptyStateProps {
    title?: string;
    description?: string;
    actionLabel?: string;
    actionHref?: string;
    icon?: React.ReactNode;
}

export function EmptyState({
    title = 'Nenhum resultado encontrado',
    description = 'Tente ajustar seus filtros de busca para encontrar o que procura.',
    actionLabel = 'Limpar filtros',
    actionHref = '/acomodacoes',
    icon,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4 text-neutral-400">
                {icon || (
                    <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                )}
            </div>

            <h3 className="font-display font-semibold text-lg text-neutral-900 mb-2">
                {title}
            </h3>

            <p className="text-neutral-500 max-w-sm mb-6">
                {description}
            </p>

            {actionLabel && actionHref && (
                <Link
                    href={actionHref}
                    className="btn btn-secondary"
                >
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}
