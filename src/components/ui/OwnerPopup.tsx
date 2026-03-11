"use client";

import { useOwnerPopup } from "./OwnerPopupProvider";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function OwnerPopup() {
    const { isOpen, closeOwnerPopup } = useOwnerPopup();
    const [formData, setFormData] = useState({
        nome: "",
        whatsapp: "",
        email: "",
        bairro: "",
        tipoImovel: "",
        momento: "",
        quartos: "",
        mobiliado: "",
        linkAnuncio: "",
        mensagem: "",
    });

    const trackEvent = (eventName: string) => {
        if (typeof window !== "undefined" && (window as unknown as { gtag?: (type: string, name: string) => void }).gtag) {
            const w = window as unknown as { gtag: (type: string, name: string) => void };
            w.gtag("event", eventName);
        } else {
            console.log(`[Tracking Event] ${eventName}`);
        }
    };

    // Track started
    useEffect(() => {
        if (isOpen) {
            trackEvent("owner_popup_started");
        }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };


    const formatMessageForWhatsApp = () => {
        return encodeURIComponent(
            `Olá, tenho interesse na gestão Vivare! Seguem meus dados:\n\n` +
            `*Nome:* ${formData.nome}\n` +
            `*E-mail:* ${formData.email}\n` +
            `*Imóvel:* ${formData.tipoImovel} em ${formData.bairro}\n` +
            `*Momento:* ${formData.momento}\n\n` +
            (formData.quartos ? `*Quartos:* ${formData.quartos}\n` : "") +
            (formData.mobiliado ? `*Mobiliado:* ${formData.mobiliado}\n` : "") +
            (formData.linkAnuncio ? `*Link:* ${formData.linkAnuncio}\n` : "") +
            (formData.mensagem ? `*Mensagem:* ${formData.mensagem}` : "")
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        trackEvent("owner_popup_submitted");

        try {
            await addDoc(collection(db, "leads_proprietarios"), {
                ...formData,
                createdAt: serverTimestamp(),
                source: "Popup_B2B",
            });
            console.log("Lead B2B salvo no banco");
        } catch (error) {
            console.error("Erro ao salvar lead B2B:", error);
        }

        const message = formatMessageForWhatsApp();
        window.open(`https://wa.me/5511985067840?text=${message}`, "_blank");
        closeOwnerPopup();
    };

    const handleSkipToWhatsApp = () => {
        trackEvent("owner_popup_skipped_to_whatsapp");
        const lightMessage = encodeURIComponent("Olá! Sou proprietário e gostaria de falar sobre a gestão da Vivare, mas prefiro pular o formulário por enquanto.");
        window.open(`https://wa.me/5511985067840?text=${lightMessage}`, "_blank");
        closeOwnerPopup();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={closeOwnerPopup} />

            <div
                className="relative bg-white w-full max-w-2xl sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 sm:zoom-in-95 duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            >
                {/* Header Ribbon */}
                <div className="h-1.5 w-full bg-gradient-to-r from-neutral-900 via-accent-500 to-neutral-900"></div>

                <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
                    <button
                        onClick={closeOwnerPopup}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-900"
                    >
                        <X size={20} />
                    </button>

                    <div className="mb-8 pr-8">
                        <h2 className="text-2xl md:text-3xl font-display font-bold text-neutral-950 mb-3 tracking-tight">
                            Antes de falar com nosso time, conte rapidamente sobre seu imóvel
                        </h2>
                        <p className="text-neutral-600 leading-relaxed text-[15px]">
                            Com essas informações, direcionamos você para o especialista certo e agilizamos seu atendimento.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Required Fields Group */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-3 border-b pb-2 mb-4">
                                <span className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">1</span>
                                <h3 className="font-semibold text-neutral-900">Informações Obrigatórias</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Nome completo *</label>
                                    <input required name="nome" value={formData.nome} onChange={handleChange} type="text" className="w-full p-3 bg-neutral-50/50 border border-neutral-200 rounded-xl focus:bg-white focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">WhatsApp *</label>
                                    <input required name="whatsapp" value={formData.whatsapp} onChange={handleChange} type="tel" className="w-full p-3 bg-neutral-50/50 border border-neutral-200 rounded-xl focus:bg-white focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all outline-none" placeholder="(11) 99999-9999" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">E-mail *</label>
                                    <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full p-3 bg-neutral-50/50 border border-neutral-200 rounded-xl focus:bg-white focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Bairro/Cidade do imóvel *</label>
                                    <input required name="bairro" value={formData.bairro} onChange={handleChange} type="text" className="w-full p-3 bg-neutral-50/50 border border-neutral-200 rounded-xl focus:bg-white focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all outline-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Tipo do imóvel *</label>
                                    <div className="relative">
                                        <select required name="tipoImovel" value={formData.tipoImovel} onChange={handleChange} className="w-full p-3 bg-neutral-50/50 border border-neutral-200 rounded-xl focus:bg-white focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all outline-none appearance-none">
                                            <option value="">Selecione...</option>
                                            <option value="Studio">Studio</option>
                                            <option value="Apartamento">Apartamento</option>
                                            <option value="Casa">Casa</option>
                                            <option value="Cobertura">Cobertura</option>
                                            <option value="Quarto privativo">Quarto privativo</option>
                                            <option value="Outro">Outro</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Em que momento você está? *</label>
                                    <div className="relative">
                                        <select required name="momento" value={formData.momento} onChange={handleChange} className="w-full p-3 bg-neutral-50/50 border border-neutral-200 rounded-xl focus:bg-white focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all outline-none appearance-none">
                                            <option value="">Selecione...</option>
                                            <option value="Quero entender como funciona">Quero entender como funciona</option>
                                            <option value="Quero avaliar a rentabilidade">Quero avaliar a rentabilidade</option>
                                            <option value="Já tenho imóvel pronto para anunciar">Já tenho imóvel pronto para anunciar</option>
                                            <option value="Estou estruturando o imóvel">Estou estruturando o imóvel</option>
                                            <option value="Quero migrar de outra administradora">Quero migrar de outra administradora</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Optional Fields Group */}
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center gap-3 border-b pb-2 mb-4">
                                <span className="w-6 h-6 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center text-xs font-bold">2</span>
                                <h3 className="font-semibold text-neutral-900 border-none">Informações Opcionais <span className="text-neutral-400 font-normal text-sm ml-1">(Ajuda muito!)</span></h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Quantos quartos?</label>
                                    <input name="quartos" value={formData.quartos} onChange={handleChange} type="number" min="0" className="w-full p-3 bg-neutral-50/50 border border-neutral-200 rounded-xl focus:bg-white focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Mobiliado?</label>
                                    <div className="relative">
                                        <select name="mobiliado" value={formData.mobiliado} onChange={handleChange} className="w-full p-3 bg-neutral-50/50 border border-neutral-200 rounded-xl focus:bg-white focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all outline-none appearance-none">
                                            <option value="">Selecione...</option>
                                            <option value="Sim">Sim</option>
                                            <option value="Não">Não</option>
                                            <option value="Parcialmente">Parcialmente</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Link do anúncio atual <span className="text-neutral-400 font-normal">(se houver)</span></label>
                                <input name="linkAnuncio" value={formData.linkAnuncio} onChange={handleChange} type="url" className="w-full p-3 bg-neutral-50/50 border border-neutral-200 rounded-xl focus:bg-white focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all outline-none" placeholder="https://airbnb.com/h/seu-imovel" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Dúvida ou mensagem <span className="text-neutral-400 font-normal">(breve)</span></label>
                                <textarea name="mensagem" value={formData.mensagem} onChange={handleChange} rows={2} className="w-full p-3 bg-neutral-50/50 border border-neutral-200 rounded-xl focus:bg-white focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all outline-none resize-none"></textarea>
                            </div>
                        </div>

                        <div className="pt-6 mt-6 border-t border-neutral-100 flex flex-col gap-3">
                            <button
                                type="submit"
                                className="w-full bg-neutral-950 hover:bg-black text-white px-8 py-4 rounded-xl font-bold text-base transition-all transform active:scale-[0.98] shadow-lg shadow-neutral-900/20 flex items-center justify-center gap-2"
                            >
                                Continuar no WhatsApp
                                <svg className="w-5 h-5 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </button>

                            <button
                                type="button"
                                onClick={handleSkipToWhatsApp}
                                className="w-full bg-transparent hover:bg-neutral-50 text-neutral-600 px-8 py-3 rounded-xl font-medium text-[15px] transition-colors"
                            >
                                Prefiro falar direto no WhatsApp
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
