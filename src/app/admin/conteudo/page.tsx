"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { SiteContent } from "@/types/cms";
import AiTextAssistant from "@/components/admin/AiTextAssistant";

export default function ConteudoPage() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState<SiteContent>({
        heroTitle: "Hospedagem de alto padrão com serviços de hotelaria e estilo para o seu lar",
        heroSubtitle: "Viva o essencial nas melhores localizações de São Paulo com suporte dedicado e infraestrutura impecável.",
        ctaButtonText: "Quero anunciar meu imóvel",
    });

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const docRef = doc(db, "content", "home");
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setFormData(docSnap.data() as SiteContent);
                }
            } catch (error) {
                console.error("Erro ao buscar conteúdo:", error);
            } finally {
                setFetching(false);
            }
        };

        fetchContent();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const docRef = doc(db, "content", "home");
            await setDoc(docRef, {
                ...formData,
                updatedAt: Date.now()
            });
            alert("Conteúdo salvo com sucesso!");
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar. Verifique suas permissões no Firestore.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center p-12">
                <RefreshCw className="w-6 h-6 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Editar Textos da Home</h1>
                    <p className="text-neutral-500">Essas informações são públicas e alteram a Home Page instantaneamente.</p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-all shadow-md shadow-primary-600/20 active:scale-[0.98] disabled:opacity-70"
                >
                    {loading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    Salvar Alterações
                </button>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 md:p-8 max-w-4xl shadow-sm">

                <form className="space-y-8" onSubmit={handleSave}>
                    {/* Hero Section */}
                    <div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-2">Seção Principal (Hero)</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Título (Headline)</label>
                                <textarea
                                    value={formData.heroTitle}
                                    onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none text-neutral-900 dark:text-white"
                                />
                                <AiTextAssistant
                                    text={formData.heroTitle}
                                    onApply={(result) => setFormData({ ...formData, heroTitle: result })}
                                    fieldContext="título principal (h1) da home page — vital para SEO"
                                    buttonLabel="Melhorar título"
                                />
                                <p className="text-xs text-neutral-500 mt-1">Este h1 é vital para o SEO da página.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Subtítulo (Apoio)</label>
                                <textarea
                                    value={formData.heroSubtitle}
                                    onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none text-neutral-900 dark:text-white"
                                />
                                <AiTextAssistant
                                    text={formData.heroSubtitle}
                                    onApply={(result) => setFormData({ ...formData, heroSubtitle: result })}
                                    fieldContext="subtítulo de apoio da home page"
                                    buttonLabel="Melhorar subtítulo"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Texto do Botão Principal (CTA)</label>
                                <input
                                    type="text"
                                    value={formData.ctaButtonText}
                                    onChange={(e) => setFormData({ ...formData, ctaButtonText: e.target.value })}
                                    className="w-full sm:w-1/2 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-neutral-900 dark:text-white"
                                />
                                <AiTextAssistant
                                    text={formData.ctaButtonText}
                                    onApply={(result) => setFormData({ ...formData, ctaButtonText: result })}
                                    fieldContext="texto do botão CTA principal da home page"
                                    buttonLabel="Melhorar CTA"
                                />
                            </div>
                        </div>
                    </div>
                </form>

            </div>
        </div>
    );
}
