"use client";

import { useState } from "react";
import { WHATSAPP_NUMBER, trackEvent } from "@/lib/constants";

export function OwnerContactForm() {
    const [formData, setFormData] = useState({
        nome: "",
        whatsapp: "",
        email: "",
        bairro: "",
        tipoImovel: "",
        jaAnunciado: "",
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        trackEvent("owner_contact_form_submitted");

        const message = encodeURIComponent(
            `Olá! Sou proprietário e preenchi o formulário no site da Vivare.\n\n` +
            `*Nome:* ${formData.nome}\n` +
            `*WhatsApp:* ${formData.whatsapp}\n` +
            `*E-mail:* ${formData.email}\n` +
            `*Bairro/Cidade:* ${formData.bairro}\n` +
            `*Tipo de Imóvel:* ${formData.tipoImovel}\n` +
            `*Já anunciado:* ${formData.jaAnunciado}`
        );

        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="card p-8 shadow-xl bg-white border border-neutral-100 text-center">
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">&#10003;</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">Solicitação Enviada!</h3>
                <p className="text-neutral-600 mb-6">Continue a conversa pelo WhatsApp para agilizar seu atendimento. Nossa equipe responderá em até 24h úteis.</p>
                <button onClick={() => setSubmitted(false)} className="btn btn-secondary">Enviar outra solicitação</button>
            </div>
        );
    }

    return (
        <div className="card p-8 shadow-xl bg-white border border-neutral-100">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="owner-nome" className="block text-sm font-semibold mb-2">Nome Completo *</label>
                        <input
                            id="owner-nome"
                            name="nome"
                            type="text"
                            required
                            value={formData.nome}
                            onChange={handleChange}
                            className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg focus-ring focus:bg-white transition-colors"
                            placeholder="João da Silva"
                        />
                    </div>
                    <div>
                        <label htmlFor="owner-whatsapp" className="block text-sm font-semibold mb-2">WhatsApp *</label>
                        <input
                            id="owner-whatsapp"
                            name="whatsapp"
                            type="tel"
                            required
                            value={formData.whatsapp}
                            onChange={handleChange}
                            className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg focus-ring focus:bg-white transition-colors"
                            placeholder="(11) 99999-9999"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="owner-email" className="block text-sm font-semibold mb-2">E-mail *</label>
                        <input
                            id="owner-email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg focus-ring focus:bg-white transition-colors"
                            placeholder="joao@exemplo.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="owner-bairro" className="block text-sm font-semibold mb-2">Bairro e Cidade do Imóvel *</label>
                        <input
                            id="owner-bairro"
                            name="bairro"
                            type="text"
                            required
                            value={formData.bairro}
                            onChange={handleChange}
                            className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg focus-ring focus:bg-white transition-colors"
                            placeholder="Ex: Moema, São Paulo"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="owner-tipo" className="block text-sm font-semibold mb-2">Tipo de Imóvel *</label>
                    <select
                        id="owner-tipo"
                        name="tipoImovel"
                        required
                        value={formData.tipoImovel}
                        onChange={handleChange}
                        className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg focus-ring focus:bg-white transition-colors"
                    >
                        <option value="">Selecione...</option>
                        <option value="Studio">Studio</option>
                        <option value="1 Dormitório">1 Dormitório</option>
                        <option value="2 Dormitórios">2 Dormitórios</option>
                        <option value="Cobertura">Cobertura</option>
                        <option value="Casa">Casa</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="owner-anunciado" className="block text-sm font-semibold mb-2">O imóvel já está anunciado? *</label>
                    <select
                        id="owner-anunciado"
                        name="jaAnunciado"
                        required
                        value={formData.jaAnunciado}
                        onChange={handleChange}
                        className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg focus-ring focus:bg-white transition-colors"
                    >
                        <option value="">Selecione...</option>
                        <option value="Sim, eu administro">Sim, eu administro</option>
                        <option value="Sim, com outra gestora">Sim, com outra gestora imobiliária</option>
                        <option value="Não">Não</option>
                    </select>
                </div>

                <button type="submit" className="btn btn-primary w-full py-4 text-lg mt-4">
                    Enviar Solicitação de Contato
                </button>
                <p className="text-center text-sm text-neutral-500 mt-4">Nossa equipe responderá rapidamente. Prometemos não enviar spam.</p>
            </form>
        </div>
    );
}
