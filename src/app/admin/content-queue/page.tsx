"use client";

import { useState, useEffect, useCallback } from "react";
import {
    RefreshCw,
    Search,
    ChevronDown,
    ChevronRight,
    X,
    Send,
    RotateCcw,
    ThumbsDown,
    ExternalLink,
    Clock,
    Filter,
    Settings,
    Sparkles,
} from "lucide-react";
import {
    listPendingQueue,
    listHistory,
    getQueueItem,
    rejectItem,
    updateQueueItem,
} from "@/services/contentQueueService";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import type { ContentQueueItem, ContentAudience } from "@/types/content-queue";

type Tab = "queue" | "history";

export default function ContentQueuePage() {
    const [tab, setTab] = useState<Tab>("queue");
    const [queue, setQueue] = useState<ContentQueueItem[]>([]);
    const [history, setHistory] = useState<ContentQueueItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetching, setFetching] = useState(false);
    const [drafting, setDrafting] = useState(false);
    const [audienceFilter, setAudienceFilter] = useState<ContentAudience | "all">("all");

    // Review modal state
    const [reviewItem, setReviewItem] = useState<ContentQueueItem | null>(null);
    const [editedTitle, setEditedTitle] = useState("");
    const [editedBody, setEditedBody] = useState("");
    const [editedMeta, setEditedMeta] = useState("");
    const [editedTags, setEditedTags] = useState("");
    const [rejectNote, setRejectNote] = useState("");
    const [regenerateInstruction, setRegenerateInstruction] = useState("");
    const [showOriginal, setShowOriginal] = useState(false);
    const [showConfirmPublish, setShowConfirmPublish] = useState(false);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [showRegenerateForm, setShowRegenerateForm] = useState(false);
    const [showSourcesModal, setShowSourcesModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Sources state
    const [sources, setSources] = useState<{ id: string; name: string; url: string }[]>([]);
    const [newSourceName, setNewSourceName] = useState("");
    const [newSourceUrl, setNewSourceUrl] = useState("");
    const [sourcesLoading, setSourcesLoading] = useState(false);

    const loadSources = useCallback(async () => {
        setSourcesLoading(true);
        try {
            const snap = await getDocs(collection(db, "feed_sources"));
            const s = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
            setSources(s);
        } catch (e) {
            console.error(e);
        } finally {
            setSourcesLoading(false);
        }
    }, []);

    useEffect(() => {
        if (showSourcesModal) {
            loadSources();
        }
    }, [showSourcesModal, loadSources]);

    async function handleAddSource(e: React.FormEvent) {
        e.preventDefault();
        if (!newSourceName.trim() || !newSourceUrl.trim()) return;
        setSourcesLoading(true);
        try {
            await addDoc(collection(db, "feed_sources"), {
                name: newSourceName.trim(),
                url: newSourceUrl.trim(),
                active: true,
                type: "rss",
                audience: "ambos",
                topic: "turismo",
            });
            setNewSourceName("");
            setNewSourceUrl("");
            loadSources();
        } catch (e) {
            console.error(e);
            alert("Erro ao adicionar fonte.");
            setSourcesLoading(false);
        }
    }

    async function handleDeleteSource(id: string) {
        if (!confirm("Remover esta fonte RSS? As notícias já baixadas nela não serão perdidas.")) return;
        setSourcesLoading(true);
        try {
            await deleteDoc(doc(db, "feed_sources", id));
            loadSources();
        } catch (e) {
            console.error(e);
            alert("Erro ao remover fonte.");
            setSourcesLoading(false);
        }
    }

    const loadQueue = useCallback(async () => {
        setLoading(true);
        try {
            const data = await listPendingQueue();
            setQueue(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadHistory = useCallback(async () => {
        setLoading(true);
        try {
            const data = await listHistory();
            setHistory(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (tab === "queue") loadQueue();
        else loadHistory();
    }, [tab, loadQueue, loadHistory]);

    async function handleFetchNow() {
        setFetching(true);
        try {
            const res = await fetch("/api/admin/fetch", { method: "POST" });
            const data = await res.json();
            alert(`Buscados: ${data.fetched} itens de ${data.sources} fontes.`);

            // Also run drafter
            const draftRes = await fetch("/api/admin/draft", { method: "POST" });
            const draftData = await draftRes.json();
            if (draftData.error) {
                alert(`Erro: ${draftData.error}`);
            } else {
                alert(`Rascunhos: ${draftData.drafted} gerados, ${draftData.rejected} rejeitados.`);
                loadQueue();
            }
        } catch (e) {
            console.error(e);
            alert("Erro inesperado ao gerar rascunhos. Use F12 para ver o erro.");
        } finally {
            setFetching(false);
        }
    }

    async function handleDraftNext() {
        setDrafting(true);
        try {
            const res = await fetch("/api/admin/draft", { method: "POST" });
            const data = await res.json();
            if (data.error) {
                alert(`Erro: ${data.error}`);
            } else {
                alert(`Rascunhos: ${data.drafted} gerados, ${data.rejected} rejeitados.`);
                loadQueue();
            }
        } catch (e) {
            console.error(e);
            alert("Erro inesperado ao gerar rascunhos. Use F12 para ver o erro.");
        } finally {
            setDrafting(false);
        }
    }

    function openReview(item: ContentQueueItem) {
        setReviewItem(item);
        setEditedTitle(item.editedTitle || item.draftTitle || "");
        setEditedBody(item.editedBody || item.draftBody || "");
        setEditedMeta(item.draftMetaDesc || "");
        setEditedTags((item.draftTags || []).join(", "));
        setShowOriginal(false);
        setShowConfirmPublish(false);
        setShowRejectForm(false);
        setShowRegenerateForm(false);
        setRejectNote("");
        setRegenerateInstruction("");
    }

    function closeReview() {
        setReviewItem(null);
    }

    async function handleSaveEdit() {
        if (!reviewItem) return;
        setActionLoading(true);
        try {
            await updateQueueItem(reviewItem.id, {
                editedTitle: editedTitle,
                editedBody: editedBody,
            });
            alert("Edições salvas.");
            const updated = await getQueueItem(reviewItem.id);
            if (updated) setReviewItem(updated);
        } catch (e) {
            console.error(e);
            alert("Erro ao salvar.");
        } finally {
            setActionLoading(false);
        }
    }

    async function handlePublish() {
        if (!reviewItem) return;
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/queue/${reviewItem.id}/approve`, {
                method: "POST",
            });
            const data = await res.json();
            if (!res.ok) {
                alert(data.error || "Erro ao publicar.");
                return;
            }
            alert(`Publicado! URL: ${data.publishedUrl}`);
            closeReview();
            loadQueue();
        } catch (e) {
            console.error(e);
            alert("Erro ao publicar.");
        } finally {
            setActionLoading(false);
            setShowConfirmPublish(false);
        }
    }

    async function handleReject() {
        if (!reviewItem) return;
        setActionLoading(true);
        try {
            await rejectItem(reviewItem.id, rejectNote || undefined);
            closeReview();
            loadQueue();
        } catch (e) {
            console.error(e);
            alert("Erro ao rejeitar.");
        } finally {
            setActionLoading(false);
        }
    }

    async function handleRegenerate() {
        if (!reviewItem) return;
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/queue/${reviewItem.id}/regenerate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ instruction: regenerateInstruction }),
            });
            const data = await res.json();
            if (data.rejected) {
                alert("Item rejeitado automaticamente por baixa relevância.");
                closeReview();
                loadQueue();
            } else {
                alert("Rascunho regenerado.");
                const updated = await getQueueItem(reviewItem.id);
                if (updated) openReview(updated);
            }
        } catch (e) {
            console.error(e);
            alert("Erro ao regenerar.");
        } finally {
            setActionLoading(false);
            setShowRegenerateForm(false);
        }
    }

    async function handleQuickReject(id: string) {
        if (!confirm("Rejeitar este item?")) return;
        try {
            await rejectItem(id);
            setQueue(q => q.filter(i => i.id !== id));
        } catch (e) {
            console.error(e);
            alert("Erro ao rejeitar.");
        }
    }

    const filteredQueue =
        audienceFilter === "all"
            ? queue
            : queue.filter(i => i.audience === audienceFilter);

    function formatDate(ts: number | null) {
        if (!ts) return "—";
        return new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(ts));
    }

    const audienceLabel: Record<string, string> = {
        hospede: "Hóspede",
        proprietario: "Proprietário",
        ambos: "Ambos",
    };

    const statusLabel: Record<string, string> = {
        published: "Publicado",
        rejected: "Rejeitado",
        pending_review: "Pendente",
        approved: "Aprovado",
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-display font-medium text-neutral-900 dark:text-white">
                        Fila de Conteúdo
                    </h1>
                    <p className="text-neutral-500 mt-1">
                        {tab === "queue"
                            ? `${filteredQueue.length} itens aguardando revisão`
                            : `${history.length} itens no histórico`}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    {tab === "queue" && (
                        <>
                            {/* Audience Filter */}
                            <div className="relative">
                                <select
                                    value={audienceFilter}
                                    onChange={e =>
                                        setAudienceFilter(
                                            e.target.value as ContentAudience | "all"
                                        )
                                    }
                                    className="appearance-none pl-9 pr-8 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                >
                                    <option value="all">Todos</option>
                                    <option value="hospede">Hóspede</option>
                                    <option value="proprietario">Proprietário</option>
                                    <option value="ambos">Ambos</option>
                                </select>
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                            </div>

                            <button
                                onClick={handleFetchNow}
                                disabled={fetching}
                                className="flex items-center gap-2 px-4 py-2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 hover:bg-neutral-900 dark:hover:bg-white rounded-xl font-medium transition-all shadow-md text-sm disabled:opacity-70"
                            >
                                <RefreshCw
                                    className={`w-4 h-4 ${fetching ? "animate-spin" : ""}`}
                                />
                                {fetching ? "Buscando..." : "Buscar agora"}
                            </button>
                            <button
                                onClick={handleDraftNext}
                                disabled={drafting || queue.every(i => i.draftTitle)}
                                className="flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-medium transition-all shadow-md text-sm disabled:opacity-50"
                            >
                                <Sparkles
                                    className={`w-4 h-4 ${drafting ? "animate-pulse" : ""}`}
                                />
                                {drafting ? "Gerando..." : "Gerar Rascunhos"}
                            </button>
                            <button
                                onClick={() => setShowSourcesModal(true)}
                                className="flex items-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl font-medium transition-all text-sm"
                                title="Gerenciar Fontes RSS"
                            >
                                <Settings className="w-4 h-4" />
                                Fontes
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setTab("queue")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        tab === "queue"
                            ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                            : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                    }`}
                >
                    Fila de Revisão
                </button>
                <button
                    onClick={() => setTab("history")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        tab === "history"
                            ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                            : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                    }`}
                >
                    Histórico
                </button>
            </div>

            {/* Loading */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
                </div>
            ) : tab === "queue" ? (
                /* ────── Queue List ────── */
                filteredQueue.length === 0 ? (
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center">
                        <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-6 h-6 text-neutral-400" />
                        </div>
                        <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                            Nenhum item na fila
                        </h3>
                        <p className="text-neutral-500 mb-6 max-w-sm mx-auto">
                            Clique em &quot;Buscar agora&quot; para importar conteúdo das fontes RSS configuradas.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredQueue.map(item => (
                            <div
                                key={item.id}
                                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-neutral-900 dark:text-white line-clamp-1">
                                            {item.draftTitle || item.originalTitle}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                                            <span>{item.sourceName}</span>
                                            <span>·</span>
                                            <span>{formatDate(item.draftedAt || item.fetchedAt)}</span>
                                            <span>·</span>
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    item.audience === "hospede"
                                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                        : item.audience === "proprietario"
                                                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                                                          : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                                                }`}
                                            >
                                                {audienceLabel[item.audience] || item.audience}
                                            </span>
                                        </div>
                                        {/* Relevance bar */}
                                        <div className="flex items-center gap-2 mt-3">
                                            <div className="flex-1 h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full max-w-[120px]">
                                                <div
                                                    className={`h-full rounded-full ${
                                                        item.relevanceScore >= 0.8
                                                            ? "bg-green-500"
                                                            : item.relevanceScore >= 0.6
                                                              ? "bg-amber-500"
                                                              : "bg-red-500"
                                                    }`}
                                                    style={{
                                                        width: `${Math.round(item.relevanceScore * 100)}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="text-xs text-neutral-400">
                                                {Math.round(item.relevanceScore * 100)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => openReview(item)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                                        >
                                            Revisar
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleQuickReject(item.id)}
                                            className="p-2 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            title="Rejeitar"
                                        >
                                            <ThumbsDown className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                /* ────── History Table ────── */
                history.length === 0 ? (
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center">
                        <Clock className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                            Nenhum histórico
                        </h3>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500 border-b border-neutral-200 dark:border-neutral-800 uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Título</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Data</th>
                                    <th className="px-6 py-4 font-medium">Link</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                {history.map(item => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-neutral-900 dark:text-white line-clamp-1">
                                                {item.draftTitle || item.originalTitle}
                                            </div>
                                            <div className="text-xs text-neutral-500 mt-0.5">
                                                {item.sourceName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    item.status === "published"
                                                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                        : item.editorNote?.includes("auto-rejected")
                                                          ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                                                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                                }`}
                                            >
                                                {item.status === "published"
                                                    ? "Publicado"
                                                    : item.editorNote?.includes("auto-rejected")
                                                      ? "Auto-rejeitado"
                                                      : statusLabel[item.status] || item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-500">
                                            {formatDate(item.reviewedAt || item.publishedAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.publishedUrl ? (
                                                <a
                                                    href={item.publishedUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary-600 hover:underline flex items-center gap-1"
                                                >
                                                    Ver
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            ) : (
                                                <span className="text-neutral-400">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {/* ────── Review Modal ────── */}
            {reviewItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
                            <h2 className="text-lg font-display font-medium text-neutral-900 dark:text-white">
                                Revisar Conteúdo
                            </h2>
                            <button
                                onClick={closeReview}
                                className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                                {/* Coluna Esquerda: Notícia Original */}
                                <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-5 flex flex-col gap-3 lg:max-h-[70vh] lg:overflow-y-auto">
                                    <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                                        Notícia Original — {reviewItem.sourceName}
                                    </h3>
                                    <h4 className="font-medium text-neutral-900 dark:text-white text-lg">
                                        {reviewItem.originalTitle}
                                    </h4>
                                    <div className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap leading-relaxed">
                                        {reviewItem.originalBody}
                                    </div>
                                    {reviewItem.sourceUrl && (
                                        <div className="mt-auto pt-4 border-t border-neutral-200 dark:border-neutral-700/50">
                                            <a
                                                href={reviewItem.sourceUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary-600 hover:text-primary-700 dark:hover:text-primary-400 hover:underline inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
                                            >
                                                Ler na fonte original <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Coluna Direita: Editable Fields */}
                                <div className="space-y-4 lg:max-h-[70vh] lg:overflow-y-auto lg:pr-2">
                                    {/* Relevance Header */}
                                    <div className="flex items-center gap-3 text-sm text-neutral-500 mb-2">
                                        <Sparkles className="w-4 h-4 text-primary-500" />
                                        Relevância: {Math.round(reviewItem.relevanceScore * 100)}%
                                        <span className="text-xs">·</span>
                                        Audiência: {audienceLabel[reviewItem.audience] || reviewItem.audience}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                            Título
                                        </label>
                                        <input
                                            type="text"
                                            value={editedTitle}
                                            onChange={e => setEditedTitle(e.target.value)}
                                            className="w-full px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                            Corpo do artigo
                                        </label>
                                        <textarea
                                            value={editedBody}
                                            onChange={e => setEditedBody(e.target.value)}
                                            rows={14}
                                            className="w-full px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all dark:text-white text-sm leading-relaxed resize-y"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                                Meta Description
                                            </label>
                                            <textarea
                                                value={editedMeta}
                                                onChange={e => setEditedMeta(e.target.value)}
                                                rows={2}
                                                maxLength={160}
                                                className="w-full px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all dark:text-white text-sm resize-none"
                                            />
                                            <span className="text-xs text-neutral-400 mt-1 block">
                                                {editedMeta.length}/160
                                            </span>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                                Tags (vírgula)
                                            </label>
                                            <input
                                                type="text"
                                                value={editedTags}
                                                onChange={e => setEditedTags(e.target.value)}
                                                className="w-full px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all dark:text-white text-sm"
                                                placeholder="ex: turismo, sp"
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Reject e Confirm Forms entram aqui se ativos (renderizados via código abaixo em vez de no layout) */}

                            {/* Reject Form */}
                                    {showRejectForm && (
                                        <div className="p-4 border border-red-200 dark:border-red-900/30 rounded-xl bg-red-50 dark:bg-red-900/10 space-y-3 mt-4">
                                            <label className="block text-sm font-medium text-red-700 dark:text-red-400">
                                                Nota de rejeição (opcional)
                                            </label>
                                            <textarea
                                                value={rejectNote}
                                                onChange={e => setRejectNote(e.target.value)}
                                                rows={2}
                                                className="w-full px-3 py-2 border border-red-200 dark:border-red-800 rounded-lg text-sm bg-white dark:bg-neutral-900 dark:text-white resize-none"
                                                placeholder="Motivo da rejeição..."
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleReject}
                                                    disabled={actionLoading}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-70 transition-colors"
                                                >
                                                    {actionLoading ? "Processando..." : "Confirmar Rejeição"}
                                                </button>
                                                <button
                                                    onClick={() => setShowRejectForm(false)}
                                                    className="px-4 py-2 text-neutral-600 dark:text-neutral-400 text-sm hover:underline"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Regenerate Form */}
                                    {showRegenerateForm && (
                                        <div className="p-4 border border-amber-200 dark:border-amber-900/30 rounded-xl bg-amber-50 dark:bg-amber-900/10 space-y-3 mt-4">
                                            <label className="block text-sm font-medium text-amber-700 dark:text-amber-400">
                                                Instrução para regeneração (opcional)
                                            </label>
                                            <textarea
                                                value={regenerateInstruction}
                                                onChange={e => setRegenerateInstruction(e.target.value)}
                                                rows={2}
                                                className="w-full px-3 py-2 border border-amber-200 dark:border-amber-800 rounded-lg text-sm bg-white dark:bg-neutral-900 dark:text-white resize-none"
                                                placeholder="Ex: Foque mais no impacto para proprietários de imóveis..."
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleRegenerate}
                                                    disabled={actionLoading}
                                                    className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-70 transition-colors"
                                                >
                                                    {actionLoading ? "Regenerando..." : "Regenerar com IA"}
                                                </button>
                                                <button
                                                    onClick={() => setShowRegenerateForm(false)}
                                                    className="px-4 py-2 text-neutral-600 dark:text-neutral-400 text-sm hover:underline"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Confirm Publish Modal */}
                                    {showConfirmPublish && (
                                        <div className="p-4 border border-green-200 dark:border-green-900/30 rounded-xl bg-green-50 dark:bg-green-900/10 space-y-3 mt-4">
                                            <p className="text-sm font-medium text-green-800 dark:text-green-400">
                                                Confirmar publicação automática no seu Blog:
                                            </p>
                                            <div className="p-3 bg-white dark:bg-neutral-900 rounded-lg border border-green-200/50 dark:border-green-800/50 text-sm text-green-700 dark:text-green-300 font-medium">
                                                {editedTitle || "Sem título definido"}
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    onClick={handlePublish}
                                                    disabled={actionLoading}
                                                    className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-70 transition-colors shadow-sm shadow-green-600/20"
                                                >
                                                    {actionLoading ? "Publicando post..." : "Confirmar e Publicar"}
                                                </button>
                                                <button
                                                    onClick={() => setShowConfirmPublish(false)}
                                                    className="px-4 py-2.5 text-neutral-600 dark:text-neutral-400 text-sm hover:underline"
                                                >
                                                    Voltar e editar
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 shrink-0">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setShowRejectForm(true);
                                        setShowRegenerateForm(false);
                                        setShowConfirmPublish(false);
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors"
                                >
                                    <ThumbsDown className="w-4 h-4" />
                                    Rejeitar
                                </button>
                                <button
                                    onClick={() => {
                                        setShowRegenerateForm(true);
                                        setShowRejectForm(false);
                                        setShowConfirmPublish(false);
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg text-sm font-medium transition-colors"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Regenerar
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveEdit}
                                    disabled={actionLoading}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-lg text-sm font-medium hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors disabled:opacity-70"
                                >
                                    Salvar edição
                                </button>
                                <button
                                    onClick={() => {
                                        setShowConfirmPublish(true);
                                        setShowRejectForm(false);
                                        setShowRegenerateForm(false);
                                    }}
                                    disabled={actionLoading}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-70 shadow-md shadow-green-600/20"
                                >
                                    <Send className="w-4 h-4" />
                                    Publicar agora
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Gerenciar Fontes RSS */}
            {showSourcesModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-800">
                            <h2 className="text-xl font-display font-medium text-neutral-900 dark:text-white">
                                Fontes RSS (Robô Leitor)
                            </h2>
                            <button
                                onClick={() => setShowSourcesModal(false)}
                                className="p-2 -mr-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto">
                            <form onSubmit={handleAddSource} className="mb-8 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-neutral-800">
                                <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-3">Adicionar Nova Fonte</h3>
                                <div className="space-y-3 relative">
                                    <input
                                        type="text"
                                        placeholder="Nome (Ex: Revista Viagem)"
                                        value={newSourceName}
                                        onChange={e => setNewSourceName(e.target.value)}
                                        className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            placeholder="Link do Feed XML/RSS"
                                            value={newSourceUrl}
                                            onChange={e => setNewSourceUrl(e.target.value)}
                                            className="flex-1 px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                        />
                                        <button
                                            type="submit"
                                            disabled={sourcesLoading || !newSourceName || !newSourceUrl}
                                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
                                        >
                                            Adicionar
                                        </button>
                                    </div>
                                    {sourcesLoading && <div className="absolute inset-0 bg-white/50 dark:bg-neutral-900/50 flex items-center justify-center"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div></div>}
                                </div>
                            </form>

                            <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-3">Fontes Ativas ({sources.length})</h3>
                            {sources.length === 0 ? (
                                <p className="text-sm text-neutral-500 italic">Nenhuma fonte cadastrada.</p>
                            ) : (
                                <ul className="space-y-3 relative">
                                    {sources.map(s => (
                                        <li key={s.id} className="flex items-center justify-between p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg group">
                                            <div className="min-w-0 pr-4">
                                                <p className="font-medium text-neutral-900 dark:text-white text-sm truncate">{s.name}</p>
                                                <p className="text-xs text-neutral-500 truncate mt-0.5" title={s.url}>{s.url}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteSource(s.id)}
                                                className="shrink-0 p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                title="Remover fonte"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </li>
                                    ))}
                                    {sourcesLoading && <div className="absolute inset-0 bg-white/50 dark:bg-neutral-900/50 flex items-center justify-center"></div>}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
