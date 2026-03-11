"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Send, RefreshCw } from "lucide-react";
import Link from "next/link";
import { getPostById, createPost, updatePost } from "@/services/blogService";
import type { BlogPost } from "@/types/blog";
import AiTextAssistant from "@/components/admin/AiTextAssistant";

export default function AdminBlogEditor() {
    const params = useParams();
    const router = useRouter();
    const postId = params.postId as string;
    const isNew = postId === "novo";

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);

    const [formData, setFormData] = useState<Partial<BlogPost>>({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        coverImage: "",
        author: "Vivare",
        tags: [],
        status: "draft",
    });

    const [tagsInput, setTagsInput] = useState("");

    useEffect(() => {
        if (!isNew) {
            loadPost();
        }
    }, [isNew, postId]);

    async function loadPost() {
        try {
            const post = await getPostById(postId);
            if (post) {
                setFormData(post);
                setTagsInput(post.tags?.join(", ") || "");
            } else {
                alert("Post não encontrado.");
                router.push("/admin/blog");
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao carregar post.");
        } finally {
            setLoading(false);
        }
    }

    const handleSaveDraft = async () => {
        await handleSave('draft');
    };

    const handlePublish = async () => {
        if (!confirm("Tem certeza que deseja publicar este artigo no blog?")) return;
        await handleSave('published');
    };

    const handleSave = async (targetStatus: 'draft' | 'published') => {
        if (!formData.title) {
            alert("O título é obrigatório.");
            return;
        }

        if (targetStatus === 'draft') setSaving(true);
        else setPublishing(true);

        // Auto gera slug se não existir
        const finalSlug = formData.slug?.trim() || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        // Processa tags
        const tagsArray = tagsInput.split(",").map(t => t.trim()).filter(t => t.length > 0);

        const payload: Partial<BlogPost> = {
            ...formData,
            slug: finalSlug,
            tags: tagsArray,
            status: targetStatus,
        };

        try {
            if (isNew) {
                const newId = await createPost(payload);
                router.replace(`/admin/blog/${newId}`);
            } else {
                await updatePost(postId, payload);
                setFormData({ ...payload, id: postId }); // optimistically update local state
            }
            // Sucesso silently
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar o artigo.");
        } finally {
            setSaving(false);
            setPublishing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-neutral-50 dark:bg-neutral-950">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-8">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/blog"
                            className="p-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-display font-medium text-neutral-900 dark:text-white">
                                {isNew ? "Novo Artigo" : "Editar Artigo"}
                            </h1>
                            <p className="text-sm text-neutral-500 mt-1">
                                {formData.status === 'published' ? <span className="text-green-600 dark:text-green-400 font-medium">● Publicado</span> : <span className="text-amber-600 dark:text-amber-400 font-medium">● Rascunho</span>}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
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
                            {formData.status === 'published' ? 'Atualizar Publicação' : 'Publicar'}
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column - Main Editor */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Título do Artigo</label>
                            <input
                                type="text"
                                value={formData.title || ""}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Ex: As 5 melhores praias do Guarujá"
                                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg font-medium"
                            />
                            <AiTextAssistant
                                text={formData.title || ""}
                                onApply={(result) => setFormData({ ...formData, title: result })}
                                fieldContext="título do artigo de blog"
                                buttonLabel="Melhorar título"
                            />
                        </div>

                        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Conteúdo (HTML ou Markdown)</label>
                            <textarea
                                value={formData.content || ""}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="<p>Escreva aqui o conteúdo do seu artigo...</p>"
                                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm min-h-[500px]"
                            />
                            <AiTextAssistant
                                text={formData.content || ""}
                                onApply={(result) => setFormData({ ...formData, content: result })}
                                fieldContext="conteúdo do artigo de blog (HTML ou Markdown)"
                            />
                        </div>
                    </div>

                    {/* Right Column - Meta & Settings */}
                    <div className="space-y-6">
                        {/* Meta */}
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-5">
                            <h3 className="font-medium text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3">Configurações Base</h3>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Slug (URL)</label>
                                <input
                                    type="text"
                                    value={formData.slug || ""}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="Deixe em branco para auto-gerar"
                                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                />
                                <p className="text-xs text-neutral-500 mt-1">Ex: as-5-melhores-praias</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Resumo (Excerpt)</label>
                                <textarea
                                    value={formData.excerpt || ""}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    placeholder="Breve resumo para os cards e SEO"
                                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm min-h-[100px]"
                                />
                                <AiTextAssistant
                                    text={formData.excerpt || ""}
                                    onApply={(result) => setFormData({ ...formData, excerpt: result })}
                                    fieldContext="resumo/excerpt do artigo para SEO"
                                    buttonLabel="Melhorar resumo"
                                />
                            </div>
                        </div>

                        {/* Imagem e Tags */}
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-5">
                            <h3 className="font-medium text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3">Mídia e SEO</h3>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">URL da Imagem de Capa</label>
                                <input
                                    type="url"
                                    value={formData.coverImage || ""}
                                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                                    placeholder="https://exemplo.com/imagem.jpg"
                                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                />
                                {formData.coverImage && (
                                    <div className="mt-3 aspect-video bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200">
                                        <img src={formData.coverImage} alt="Preview da Capa" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Autor</label>
                                <input
                                    type="text"
                                    value={formData.author || ""}
                                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Tags (separadas por vírgula)</label>
                                <input
                                    type="text"
                                    value={tagsInput}
                                    onChange={(e) => setTagsInput(e.target.value)}
                                    placeholder="Ex: Praia, Investimento, Dicas"
                                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                />
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
