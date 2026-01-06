'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();

    useEffect(() => {
        console.error('Checkout Error:', error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold font-display mb-2">Ops! Algo deu errado.</h2>
            <p className="text-neutral-500 mb-8 max-w-md">
                Não conseguimos carregar os dados do checkout. Isso pode ser um problema temporário de conexão.
            </p>
            <div className="flex gap-4">
                <Button variant="outline" onClick={() => router.back()}>
                    Voltar
                </Button>
                <Button
                    onClick={reset}
                    variant="premium"
                >
                    Tentar novamente
                </Button>
            </div>
        </div>
    );
}
