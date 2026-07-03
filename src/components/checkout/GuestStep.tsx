import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { GuestInfo } from '@/types';

/**
 * Validação leve de CPF (Receita Federal — algoritmo dos dígitos
 * verificadores). Retorna `true` para CPFs estruturalmente válidos.
 */
function isValidCPF(value: string): boolean {
    const cpf = value.replace(/\D/g, '');
    if (cpf.length !== 11) return false;
    // Rejeita sequências repetidas (ex: 11111111111).
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    const calcDigit = (slice: string, factor: number) => {
        let sum = 0;
        for (let i = 0; i < slice.length; i++) {
            sum += parseInt(slice[i], 10) * (factor - i);
        }
        const rest = (sum * 10) % 11;
        return rest === 10 ? 0 : rest;
    };

    const d1 = calcDigit(cpf.slice(0, 9), 10);
    const d2 = calcDigit(cpf.slice(0, 10), 11);
    return d1 === parseInt(cpf[9], 10) && d2 === parseInt(cpf[10], 10);
}

/** Aplica máscara XXX.XXX.XXX-XX em sequências numéricas. */
function maskCPF(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

/**
 * Aceita o documento se for um CPF estruturalmente válido OU um passaporte
 * estrangeiro (alfanumérico, 5+ caracteres). Hóspedes brasileiros precisam
 * de CPF para emissão de nota fiscal e reporte ao SISBR/RIPS; estrangeiros
 * não têm CPF, então liberamos qualquer documento de identidade.
 */
function isValidDocument(value: string): boolean {
    const trimmed = value.trim();
    if (trimmed.length < 5) return false;

    const onlyDigits = trimmed.replace(/\D/g, '');
    // Heurística: se a maior parte é número, tratamos como CPF e exigimos
    // que ele seja válido. Caso contrário (passaporte), aceitamos.
    if (onlyDigits.length >= 9) {
        return isValidCPF(trimmed);
    }
    return true;
}

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

    /**
     * Handler dedicado para o documento — aplica máscara de CPF se o
     * usuário estiver digitando dígitos, mas preserva entrada alfanumérica
     * intacta (passaporte estrangeiro).
     */
    const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        const looksNumeric = /^[\d.\-\s]*$/.test(raw);
        const next = looksNumeric ? maskCPF(raw) : raw;
        setFormData(prev => ({ ...prev, document: next }));
        if (error) setError(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
            setError('Por favor preencha todos os campos obrigatórios.');
            return;
        }

        // Basic Email validation (simple regex)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Por favor insira um e-mail válido.');
            return;
        }

        if (!formData.document || !formData.document.trim()) {
            setError('Por favor informe seu CPF (ou passaporte, para estrangeiros).');
            return;
        }
        if (!isValidDocument(formData.document)) {
            setError('Documento inválido. Para CPF, confira os 11 dígitos; para passaporte, mínimo 5 caracteres.');
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
                            <label htmlFor="guest-firstName" className="block text-sm font-medium mb-1">Nome *</label>
                            <input
                                id="guest-firstName"
                                name="firstName"
                                autoComplete="given-name"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="guest-lastName" className="block text-sm font-medium mb-1">Sobrenome *</label>
                            <input
                                id="guest-lastName"
                                name="lastName"
                                autoComplete="family-name"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="guest-email" className="block text-sm font-medium mb-1">Email *</label>
                        <input
                            id="guest-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="guest-phone" className="block text-sm font-medium mb-1">Telefone / WhatsApp *</label>
                            <input
                                id="guest-phone"
                                name="phone"
                                type="tel"
                                autoComplete="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="guest-document" className="block text-sm font-medium mb-1">CPF / Documento *</label>
                            <input
                                id="guest-document"
                                name="document"
                                autoComplete="off"
                                inputMode="text"
                                value={formData.document || ''}
                                onChange={handleDocumentChange}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="000.000.000-00"
                                required
                                aria-describedby="document-hint"
                            />
                            <p id="document-hint" className="mt-1 text-xs text-neutral-500">
                                Estrangeiros: informe número do passaporte.
                            </p>
                        </div>
                    </div>

                </fieldset>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2" role="alert">
                        <span aria-hidden="true">⚠️</span>
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
