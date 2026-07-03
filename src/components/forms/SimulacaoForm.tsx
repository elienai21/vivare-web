"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { WHATSAPP_NUMBER, trackEvent } from "@/lib/constants";
import {
    HONEYPOT_FIELD,
    checkSubmitRateLimit,
    honeypotHiddenClass,
    isHoneypotTriggered,
} from "@/lib/anti-bot";

const RATE_MAP: Record<string, number> = {
    studio: 130,
    "1q": 120,
    "2q": 110,
    cobertura: 150,
};

export function SimulacaoForm() {
    const [step, setStep] = useState(1);
    const [result, setResult] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        bairro: "",
        tipo: "",
        metragem: "",
        nome: "",
        whatsapp: "",
        // Honeypot — humans never fill this; bots tend to.
        [HONEYPOT_FIELD]: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleStep1 = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2);
    };

    const calculateResult = async (e: React.FormEvent) => {
        e.preventDefault();

        // Drop honeypot/rate-limited submissions silently — show the
        // result step so a bot can't differentiate from a real success.
        if (isHoneypotTriggered(formData) || !checkSubmitRateLimit("simulacao").ok) {
            const m2 = parseInt(formData.metragem) || 45;
            const rate = RATE_MAP[formData.tipo] || 120;
            setResult(rate * m2);
            setStep(3);
            return;
        }

        trackEvent("simulacao_submitted");

        const m2 = parseInt(formData.metragem) || 45;
        const rate = RATE_MAP[formData.tipo] || 120;
        const estimated = rate * m2;
        setResult(estimated);
        setStep(3);

        // Strip honeypot before persisting.
        const { [HONEYPOT_FIELD]: _hp, ...payload } = formData;
        void _hp;

        // Persist the lead so the team can follow up even if the user
        // doesn't click the WhatsApp meeting link afterwards. Same
        // collection / schema as OwnerPopup and OwnerContactForm.
        try {
            await addDoc(collection(db, "leads_proprietarios"), {
                ...payload,
                estimatedMonthly: estimated,
                createdAt: serverTimestamp(),
                source: "Simulacao",
            });
        } catch (error) {
            console.error("Erro ao salvar lead (Simulacao):", error);
        }
    };

    const getMeetingLink = () => {
        const message = encodeURIComponent(
            `Olá! Acabei de fazer uma simulação no site da Vivare.\n\n` +
            `*Nome:* ${formData.nome}\n` +
            `*WhatsApp:* ${formData.whatsapp}\n` +
            `*Imóvel:* ${formData.tipo} em ${formData.bairro}\n` +
            `*Metragem:* ${formData.metragem}m²\n` +
            `*Estimativa:* ${result ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(result) : ""}/mês\n\n` +
            `Gostaria de agendar uma reunião de apresentação.`
        );
        return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    };

    return (
        <div className="card p-8 shadow-2xl bg-white border border-neutral-100">
            {step === 1 && (
                <form onSubmit={handleStep1} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-xl font-bold border-b pb-4">Etapa 1: Sobre o Imóvel</h2>

                    <div>
                        <label htmlFor="sim-bairro" className="block text-sm font-semibold mb-2">Bairro e Cidade *</label>
                        <input
                            id="sim-bairro"
                            name="bairro"
                            required
                            type="text"
                            value={formData.bairro}
                            onChange={handleChange}
                            className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg focus-ring"
                            placeholder="Ex: Moema, São Paulo"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="sim-tipo" className="block text-sm font-semibold mb-2">Tipo *</label>
                            <select
                                id="sim-tipo"
                                name="tipo"
                                required
                                value={formData.tipo}
                                onChange={handleChange}
                                className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg focus-ring"
                            >
                                <option value="">Selecione...</option>
                                <option value="studio">Studio</option>
                                <option value="1q">1 Quarto</option>
                                <option value="2q">2 Quartos</option>
                                <option value="cobertura">Cobertura</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="sim-metragem" className="block text-sm font-semibold mb-2">Metragem (m²) *</label>
                            <input
                                id="sim-metragem"
                                name="metragem"
                                required
                                type="number"
                                min="15"
                                value={formData.metragem}
                                onChange={handleChange}
                                className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg focus-ring"
                                placeholder="Ex: 45"
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-full py-4 text-lg mt-4">Avançar</button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={calculateResult} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <h2 className="text-xl font-bold border-b pb-4">Etapa 2: Para quem enviamos?</h2>
                    <p className="text-sm text-neutral-500">Preencha seus dados para liberar a estimativa na tela e entrar em contato com nossa equipe.</p>

                    {/* Honeypot — invisible to humans, irresistible to bots. */}
                    <div className={honeypotHiddenClass} aria-hidden="true">
                        <label>
                            Website (não preencher)
                            <input
                                type="text"
                                name={HONEYPOT_FIELD}
                                tabIndex={-1}
                                autoComplete="off"
                                value={formData[HONEYPOT_FIELD]}
                                onChange={handleChange}
                            />
                        </label>
                    </div>

                    <div>
                        <label htmlFor="sim-nome" className="block text-sm font-semibold mb-2">Nome *</label>
                        <input
                            id="sim-nome"
                            name="nome"
                            required
                            type="text"
                            value={formData.nome}
                            onChange={handleChange}
                            className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg focus-ring"
                            placeholder="Seu nome completo"
                        />
                    </div>

                    <div>
                        <label htmlFor="sim-whatsapp" className="block text-sm font-semibold mb-2">WhatsApp *</label>
                        <input
                            id="sim-whatsapp"
                            name="whatsapp"
                            required
                            type="tel"
                            value={formData.whatsapp}
                            onChange={handleChange}
                            className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg focus-ring"
                            placeholder="(11) 99999-9999"
                        />
                    </div>

                    <button type="submit" className="btn btn-accent w-full py-4 text-lg mt-4">Ver Resultado Imediato</button>
                    <button type="button" onClick={() => setStep(1)} className="btn btn-secondary w-full py-3 mt-2">Voltar</button>
                </form>
            )}

            {step === 3 && result && (
                <div className="space-y-6 text-center animate-in zoom-in-95 duration-500">
                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">&#10003;</span>
                    </div>
                    <h2 className="text-2xl font-bold">Relatório Gerado!</h2>
                    <p className="text-neutral-600 mb-6">Com base nas características informadas, a estimativa conservadora de faturamento mensal bruto é de:</p>

                    <div className="bg-primary-50 border border-primary-200 rounded-xl p-8 mb-6">
                        <p className="text-sm text-primary-600 font-bold uppercase tracking-wider mb-2">Estimativa Mensal</p>
                        <p className="text-5xl font-display font-bold text-primary-700">
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(result)}
                        </p>
                    </div>

                    <p className="text-sm text-neutral-500 mb-8">
                        *O valor apresentado é uma estimativa bruta e não garante resultados. Para uma avaliação completa e proposta formal da nossa taxa de gestão (Success Fee), agende uma reunião.
                    </p>

                    <a href={getMeetingLink()} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full py-4 text-lg">
                        Agendar Reunião de Apresentação
                    </a>
                </div>
            )}
        </div>
    );
}
