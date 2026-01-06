'use client';

import { useEffect } from 'react';

interface ErrorBoundaryProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
    useEffect(() => {
        // Log error to analytics service
        console.error('ErrorBoundary caught:', error);
    }, [error]);

    return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-neutral-100 shadow-sm">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500">
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                </svg>
            </div>

            <h2 className="font-display font-bold text-xl text-neutral-900 mb-2">
                Algo deu errado
            </h2>

            <p className="text-neutral-500 max-w-md mb-6">
                Não conseguimos carregar estas informações. Pode ser um erro temporário de conexão.
            </p>

            <div className="flex gap-3">
                <button
                    onClick={reset}
                    className="btn btn-primary"
                >
                    Tentar novamente
                </button>

                <button
                    onClick={() => window.location.reload()}
                    className="btn btn-secondary"
                >
                    Recarregar página
                </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
                <div className="mt-8 p-4 bg-neutral-50 rounded-lg text-left w-full max-w-2xl overflow-auto border border-neutral-200">
                    <p className="font-mono text-sm text-red-600 mb-2 font-bold">
                        {error.name}: {error.message}
                    </p>
                    <pre className="font-mono text-xs text-neutral-600 whitespace-pre-wrap">
                        {error.stack}
                    </pre>
                </div>
            )}
        </div>
    );
}
