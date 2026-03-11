"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Save, Eye, Send, ArrowLeft, CheckCircle, PenLine, ImageIcon, XCircle } from "lucide-react";
import { CMS_PAGES_CATALOG } from "@/types/cms";
import type { CmsPage, CmsPageConfig } from "@/types/cms";
import { getDraftPage, getPublishedPage, saveDraft, publishPage } from "@/services/cmsService";
import { useAuth } from "@/lib/auth-context";

export default function AdminPageEditorPage({
    params,
}: {
    params: Promise<{ pageId: string }>;
}) {
    const { pageId } = use(params);
    const router = useRouter();
    const { user } = useAuth();

    const [config, setConfig] = useState<CmsPageConfig | null>(null);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [metaDescription, setMetaDescription] = useState("");
    const [status, setStatus] = useState<'draft' | 'published' | 'new'>('new');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    useEffect(() => {
        const pageConfig = CMS_PAGES_CATALOG.find((c) => c.id === pageId);
        if (!pageConfig) {
            router.replace("/admin/pages");
            return;
        }
        setConfig(pageConfig);

        const load = async () => {
            try {
                // Tentar carregar rascunho primeiro, depois publicada
                let data = await getDraftPage(pageId);
                if (!data) {
                    data = await getPublishedPage(pageId);
                }

                if (data) {
                    setFormData(data.content || {});
                    setMetaDescription(data.metaDescription || "");
                    setStatus(data.status || 'published');
                } else {
                    // Inicializar com valores vazios
                    const emptyContent: Record<string, string> = {};
                    pageConfig.fields.forEach((f) => {
                        emptyContent[f.key] = "";
                    });
                    setFormData(emptyContent);
                    setStatus('new');
                }
            } catch (err) {
                console.error("Erro ao carregar página:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [pageId, router]);

    const handleSaveDraft = async () => {
        if (!config) return;
        setSaving(true);
        setSaveMessage(null);

        try {
            await saveDraft(pageId, {
                title: config.title,
                metaDescription,
                content: formData,
            }, user?.email || "admin");

            setStatus('draft');
            setSaveMessage("✓ Rascunho salvo com sucesso!");
            setTimeout(() => setSaveMessage(null), 4000);
        } catch (err) {
            console.error("Erro ao salvar:", err);
            setSaveMessage("✗ Erro ao salvar. Verifique permissões do Firestore.");
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!config) return;

        const confirmed = window.confirm(
            `Publicar "${config.title}"?\n\nO conteúdo será visível imediatamente no site público.`
        );
        if (!confirmed) return;

        setPublishing(true);
        setSaveMessage(null);

        try {
            // Primeiro, garante que o rascunho está atualizado
            await saveDraft(pageId, {
                title: config.title,
                metaDescription,
                content: formData,
            }, user?.email || "admin");

            // Depois publica
            await publishPage(pageId, user?.email || "admin");

            setStatus('published');
            setSaveMessage("✓ Página publicada com sucesso!");
            setTimeout(() => setSaveMessage(null), 4000);
        } catch (err) {
            console.error("Erro ao publicar:", err);
            setSaveMessage("✗ Erro ao publicar. " + (err instanceof Error ? err.message : ""));
        } finally {
            setPublishing(false);
        }
    };

    const handleFieldChange = (key: string, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    if (loading || !config) {
        return (
            <div className="flex items-center justify-center p-16">
                <RefreshCw className="w-6 h-6 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
            {/* Top bar */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => router.push("/admin/pages")}
                    className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Páginas
                </button>
                <span className="text-neutral-300 dark:text-neutral-700">/</span>
                <span className="text-sm font-semibold text-neutral-900 dark:text-white">{config.title}</span>

                {/* Status Badge */}
                <div className="ml-auto">
                    {status === 'published' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 px-2.5 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            Publicada
                        </span>
                    ) : status === 'draft' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 px-2.5 py-1 rounded-full">
                            <PenLine className="w-3 h-3" />
                            Rascunho
                        </span>
                    ) : (
                        <span className="text-xs text-neutral-400 font-medium">Nova</span>
                    )}
                </div>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{config.title}</h1>
                    <p className="text-neutral-500 text-sm">{config.description}</p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => window.open(`/admin/preview/${pageId}`, '_blank')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-xl font-medium transition-all hover:bg-neutral-50 text-sm"
                    >
                        <Eye className="w-4 h-4" />
                        Preview
                    </button>
                    <button
                        onClick={handleSaveDraft}
                        disabled={saving || publishing}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-xl font-medium transition-all hover:bg-neutral-50 disabled:opacity-60 text-sm"
                    >
                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Salvar Rascunho
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={saving || publishing}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-all shadow-md shadow-primary-600/20 disabled:opacity-60 text-sm"
                    >
                        {publishing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Publicar
                    </button>
                </div>
            </div>

            {/* Save message toast */}
            {saveMessage && (
                <div className={`mb-6 p-3 rounded-xl text-sm font-medium ${saveMessage.startsWith("✓") ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800"}`}>
                    {saveMessage}
                </div>
            )}

            {/* Form */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">

                {/* Meta Description (SEO) */}
                <div>
                    <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Meta Description (SEO)
                    </label>
                    <textarea
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        rows={2}
                        placeholder="Descrição para motores de busca (Google)..."
                        className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none text-neutral-900 dark:text-white text-sm"
                    />
                    <p className="text-[11px] text-neutral-400 mt-1">Máximo 160 caracteres recomendado. ({metaDescription.length}/160)</p>
                </div>

                <hr className="border-neutral-100 dark:border-neutral-800" />

                {/* Dynamic Fields */}
                {config.fields.map((field) => (
                    <div key={field.key}>
                        <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                            {field.label}
                        </label>

                        {field.type === 'text' ? (
                            <input
                                type="text"
                                value={formData[field.key] || ""}
                                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                placeholder={field.placeholder}
                                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-neutral-900 dark:text-white"
                            />
                        ) : field.type === 'textarea' ? (
                            <textarea
                                value={formData[field.key] || ""}
                                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                rows={3}
                                placeholder={field.placeholder}
                                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none text-neutral-900 dark:text-white"
                            />
                        ) : field.type === 'richtext' ? (
                            <textarea
                                value={formData[field.key] || ""}
                                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                rows={12}
                                placeholder={field.placeholder || "Insira o HTML do conteúdo..."}
                                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-y text-neutral-900 dark:text-white font-mono text-sm"
                            />
                        ) : field.type === 'json' ? (
                            <textarea
                                value={formData[field.key] || ""}
                                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                rows={8}
                                placeholder={field.placeholder || '[{"q":"Pergunta?","a":"Resposta."}]'}
                                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-y text-neutral-900 dark:text-white font-mono text-sm"
                            />
                        ) : field.type === 'image' ? (
                            <div className="space-y-3">
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="url"
                                        value={formData[field.key] || ""}
                                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                        placeholder="Cole a URL da imagem (https://...)"
                                        className="flex-1 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-neutral-900 dark:text-white text-sm"
                                    />
                                    {formData[field.key] && (
                                        <button
                                            type="button"
                                            onClick={() => handleFieldChange(field.key, "")}
                                            className="text-neutral-400 hover:text-red-500 transition-colors"
                                            title="Remover imagem"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                                {formData[field.key] ? (
                                    <div className="relative w-full max-w-sm rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900">
                                        <img
                                            src={formData[field.key]}
                                            alt="Preview"
                                            className="w-full h-48 object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-400 text-sm">
                                        <ImageIcon className="w-5 h-5 flex-shrink-0" />
                                        <span>Nenhuma imagem. Cole uma URL acima para visualizar.</span>
                                    </div>
                                )}
                            </div>
                        ) : null}

                        {field.helpText && (
                            <p className="text-[11px] text-neutral-400 mt-1">{field.helpText}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
