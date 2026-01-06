import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { GuestInfo } from '@/types';

// We'll standard input for now if Input not checked
export function GuestStep({ initialInfo, onSubmit, onBack, isLoading }: {
    initialInfo: GuestInfo | null;
    onSubmit: (info: GuestInfo) => void;
    onBack: () => void;
    isLoading?: boolean;
}) {
    const [formData, setFormData] = useState<GuestInfo>(initialInfo || {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        document: '',
    });

    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (error) setError(null); // Clear error on type
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.firstName || !formData.lastName || !formData.email) {
            setError('Por favor preencha todos os campos obrigatórios.');
            return;
        }

        // Basic Email validation (simple regex)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Por favor insira um e-mail válido.');
            return;
        }

        onSubmit(formData);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-bold font-display">Seus Dados</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <fieldset disabled={isLoading} className="group space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Nome *</label>
                            <input
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Sobrenome *</label>
                            <input
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Email *</label>
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Telefone / WhatsApp *</label>
                            <input
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">CPF / Documento</label>
                            <input
                                name="document"
                                value={formData.document}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="Opcional"
                            />
                        </div>
                    </div>

                </fieldset>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                        <span>⚠️</span>
                        {error}
                    </div>
                )}

                <div className="flex gap-4 pt-6">
                    <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
                        Voltar
                    </Button>
                    <Button type="submit" variant="premium" className="flex-1 shadow-lg shadow-orange-500/20" disabled={isLoading} isLoading={isLoading}>
                        {isLoading ? 'Processando...' : 'Ir para Pagamento'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
