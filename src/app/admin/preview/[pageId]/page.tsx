"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, RefreshCw } from "lucide-react";
import { CMS_PAGES_CATALOG } from "@/types/cms";
import type { CmsPage } from "@/types/cms";
import { getDraftPage, getPublishedPage } from "@/services/cmsService";

export default function PreviewPage({
    params,
}: {
    params: Promise<{ pageId: string }>;
}) {
    const { pageId } = use(params);
    const router = useRouter();
    const [page, setPage] = useState<CmsPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewDraft, setViewDraft] = useState(true);

    const config = CMS_PAGES_CATALOG.find((c) => c.id === pageId);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                let data: CmsPage | null = null;
                if (viewDraft) {
                    data = await getDraftPage(pageId);
                }
                if (!data) {
                    data = await getPublishedPage(pageId);
                }
                setPage(data);
            } catch (err) {
                console.error("Erro ao carregar preview:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [pageId, viewDraft]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-50">
                <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (!page || !config) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 gap-4">
                <p className="text-neutral-500">Página não encontrada.</p>
                <button onClick={() => router.back()} className="text-primary-600 hover:underline text-sm">
                    ← Voltar
                </button>
            </div>
        );
    }

    const content = page.content || {};

    return (
        <div className="min-h-screen bg-white">
            {/* Preview Banner */}
            <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-white px-4 py-2 flex items-center justify-between text-sm font-medium shadow-lg">
                <div className="flex items-center gap-3">
                    <Eye className="w-4 h-4" />
                    <span>PREVIEW — {viewDraft ? 'RASCUNHO' : 'PUBLICADA'}</span>
                    <span className="text-amber-200">|</span>
                    <span className="text-amber-100">{config.title}</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setViewDraft(!viewDraft)}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors text-xs"
                    >
                        Ver {viewDraft ? 'Publicada' : 'Rascunho'}
                    </button>
                    <button
                        onClick={() => router.push(`/admin/pages/${pageId}`)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-white text-amber-700 hover:bg-amber-50 rounded-lg transition-colors text-xs font-semibold"
                    >
                        <ArrowLeft className="w-3 h-3" />
                        Voltar ao Editor
                    </button>
                </div>
            </div>

            {/* Content Preview */}
            <div className="pt-16">
                {/* Renderiza conforme o tipo de página */}
                {pageId === 'faq' ? (
                    <FaqPreview content={content} />
                ) : pageId === 'sobre' ? (
                    <SobrePreview content={content} />
                ) : (
                    <GenericLegalPreview
                        title={content.pageTitle || config.title}
                        bodyHtml={content.bodyHtml || '<p class="text-neutral-400 italic">Nenhum conteúdo definido ainda.</p>'}
                    />
                )}
            </div>
        </div>
    );
}

/* ────────── Sub-components de preview ────────── */

function GenericLegalPreview({ title, bodyHtml }: { title: string; bodyHtml: string }) {
    return (
        <main className="min-h-screen pt-32 pb-20 bg-background-light">
            <div className="mx-auto max-w-3xl px-6 lg:px-10">
                <span className="text-xs font-bold uppercase tracking-[.3em] text-primary">Legal</span>
                <h1 className="font-display text-4xl md:text-5xl font-light text-ink mt-2 mb-4">{title}</h1>
                <span className="gold-line"></span>
                <div
                    className="space-y-6 text-sm leading-relaxed text-ink/80 mt-12 prose prose-neutral max-w-none"
                    dangerouslySetInnerHTML={{ __html: bodyHtml }}
                />
            </div>
        </main>
    );
}

function FaqPreview({ content }: { content: Record<string, string> }) {
    let items: { q: string; a: string; category?: string }[] = [];
    try {
        items = JSON.parse(content.items || '[]');
    } catch { /* empty */ }

    return (
        <main className="min-h-screen pt-24 pb-12 bg-neutral-50">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                        {content.pageTitle || 'Perguntas Frequentes'}
                    </h1>
                </div>
                <div className="space-y-4">
                    {items.map((faq, i) => (
                        <details key={i} className="group border border-neutral-200 rounded-xl bg-white shadow-sm">
                            <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-lg list-none">
                                <span>{faq.q}</span>
                                <span className="ml-4 text-neutral-400 group-open:rotate-45 transition-transform text-2xl">+</span>
                            </summary>
                            <div className="px-6 pb-6 text-neutral-600 leading-relaxed">{faq.a}</div>
                        </details>
                    ))}
                    {items.length === 0 && (
                        <p className="text-center text-neutral-400 italic py-8">Nenhuma pergunta definida ainda.</p>
                    )}
                </div>
            </div>
        </main>
    );
}

function SobrePreview({ content }: { content: Record<string, string> }) {
    return (
        <main className="min-h-screen pt-32 pb-20 bg-background-light">
            <div className="mx-auto max-w-4xl px-6 lg:px-10">
                <h1 className="font-display text-4xl md:text-5xl font-light text-ink mb-6">
                    {content.pageTitle || 'Quem Somos'}
                </h1>
                {content.intro && (
                    <p className="text-lg text-neutral-600 mb-8 leading-relaxed">{content.intro}</p>
                )}
                {(content.mission || content.vision || content.values) && (
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        {content.mission && (
                            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                                <h3 className="font-bold text-lg mb-2">Missão</h3>
                                <p className="text-neutral-600 text-sm">{content.mission}</p>
                            </div>
                        )}
                        {content.vision && (
                            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                                <h3 className="font-bold text-lg mb-2">Visão</h3>
                                <p className="text-neutral-600 text-sm">{content.vision}</p>
                            </div>
                        )}
                        {content.values && (
                            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                                <h3 className="font-bold text-lg mb-2">Valores</h3>
                                <p className="text-neutral-600 text-sm">{content.values}</p>
                            </div>
                        )}
                    </div>
                )}
                {content.bodyHtml && (
                    <div
                        className="prose prose-neutral max-w-none"
                        dangerouslySetInnerHTML={{ __html: content.bodyHtml }}
                    />
                )}
            </div>
        </main>
    );
}
