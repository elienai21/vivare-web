"use client";

import { useState, useEffect } from "react";
import { Plus, ToggleLeft, ToggleRight, Rss, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { listSources, addSource, updateSource } from "@/services/contentQueueService";
import type { FeedSource, ContentAudience } from "@/types/content-queue";

export default function SourcesPage() {
    const [sources, setSources] = useState<FeedSource[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [type, setType] = useState<"rss" | "api">("rss");
    const [topic, setTopic] = useState("");
    const [audience, setAudience] = useState<ContentAudience>("ambos");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSources();
    }, []);

    async function loadSources() {
        setLoading(true);
        try {
            const data = await listSources();
            setSources(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim() || !url.trim()) return;
        setSaving(true);
        try {
            await addSource({ name, url, type, topic, audience, active: true });
            setName("");
            setUrl("");
            setTopic("");
            setShowForm(false);
            loadSources();
        } catch (err) {
            console.error(err);
            alert("Erro ao adicionar fonte.");
        } finally {
            setSaving(false);
        }
    }

    async function handleToggle(source: FeedSource) {
        try {
            await updateSource(source.id, { active: !source.active });
            setSources(prev =>
                prev.map(s =>
                    s.id === source.id ? { ...s, active: !s.active } : s
                )
            );
        } catch (err) {
            console.error(err);
            alert("Erro ao atualizar fonte.");
        }
    }

    function formatDate(ts: number | null) {
        if (!ts) return "Nunca";
        return new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(ts));
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/content-queue"
                        className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-display font-medium text-neutral-900 dark:text-white">
                            Fontes RSS
                        </h1>
                        <p className="text-neutral-500 mt-1">
                            {sources.length} fontes configuradas
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-all shadow-md shadow-primary-600/20 text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Adicionar Fonte
                </button>
            </div>

            {/* Add Form */}
            {showForm && (
                <form
                    onSubmit={handleAdd}
                    className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 mb-6 space-y-4"
                >
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                Nome
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:text-white"
                                placeholder="Ex: Viagem e Turismo"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                URL do Feed
                            </label>
                            <input
                                type="url"
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:text-white"
                                placeholder="https://example.com/feed/"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                Tipo
                            </label>
                            <select
                                value={type}
                                onChange={e => setType(e.target.value as "rss" | "api")}
                                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm dark:text-white"
                            >
                                <option value="rss">RSS</option>
                                <option value="api">API</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                Tópico
                            </label>
                            <input
                                type="text"
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm dark:text-white"
                                placeholder="Ex: turismo, mercado_airbnb"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                Audiência
                            </label>
                            <select
                                value={audience}
                                onChange={e =>
                                    setAudience(e.target.value as ContentAudience)
                                }
                                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm dark:text-white"
                            >
                                <option value="ambos">Ambos</option>
                                <option value="hospede">Hóspede</option>
                                <option value="proprietario">Proprietário</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors disabled:opacity-70"
                        >
                            {saving ? "Salvando..." : "Salvar Fonte"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 text-neutral-500 text-sm"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            )}

            {/* Sources List */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
                </div>
            ) : sources.length === 0 ? (
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center">
                    <Rss className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                        Nenhuma fonte configurada
                    </h3>
                    <p className="text-neutral-500 mb-4">
                        Adicione fontes RSS para começar a importar conteúdo automaticamente.
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500 border-b border-neutral-200 dark:border-neutral-800 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4 font-medium">Fonte</th>
                                <th className="px-6 py-4 font-medium">Tópico</th>
                                <th className="px-6 py-4 font-medium">Audiência</th>
                                <th className="px-6 py-4 font-medium">Última Execução</th>
                                <th className="px-6 py-4 font-medium text-center">Ativo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                            {sources.map(source => (
                                <tr
                                    key={source.id}
                                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-neutral-900 dark:text-white">
                                            {source.name}
                                        </div>
                                        <div className="text-xs text-neutral-500 mt-0.5 truncate max-w-xs">
                                            {source.url}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                                        {source.topic || "—"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                            {source.audience === "hospede"
                                                ? "Hóspede"
                                                : source.audience === "proprietario"
                                                  ? "Proprietário"
                                                  : "Ambos"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-neutral-500 text-xs">
                                        {formatDate(source.lastRun)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleToggle(source)}
                                            className="inline-flex"
                                            title={source.active ? "Desativar" : "Ativar"}
                                        >
                                            {source.active ? (
                                                <ToggleRight className="w-7 h-7 text-green-500" />
                                            ) : (
                                                <ToggleLeft className="w-7 h-7 text-neutral-400" />
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
