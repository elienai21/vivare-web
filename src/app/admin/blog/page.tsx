"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit2, ExternalLink, Calendar, Trash2, FileText } from "lucide-react";
import { listAllPosts, deletePost } from "@/services/blogService";
import type { BlogPost } from "@/types/blog";

export default function AdminBlogIndex() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPosts();
    }, []);

    async function loadPosts() {
        setLoading(true);
        try {
            const data = await listAllPosts();
            setPosts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja DELETAR este post permanentemente?")) return;
        try {
            await deletePost(id);
            setPosts(posts.filter(p => p.id !== id));
        } catch (error) {
            alert("Erro ao deletar post.");
            console.error(error);
        }
    }

    function formatDate(ts: number) {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        }).format(new Date(ts));
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-display font-medium text-neutral-900 dark:text-white">Blog</h1>
                    <p className="text-neutral-500 mt-1">Gerencie os artigos do blog da Vivare.</p>
                </div>
                <Link
                    href="/admin/blog/novo"
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-all shadow-md shadow-primary-600/20 text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Novo Post
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
            ) : posts.length === 0 ? (
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-6 h-6 text-neutral-400" />
                    </div>
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">Nenhum post criado</h3>
                    <p className="text-neutral-500 mb-6 max-w-sm mx-auto">
                        Você ainda não criou nenhum artigo para o blog. Comece compartilhando conteúdo relevante.
                    </p>
                    <Link
                        href="/admin/blog/novo"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-medium transition-colors hover:bg-neutral-800 dark:hover:bg-neutral-100 text-sm"
                    >
                        Criar primeiro post
                    </Link>
                </div>
            ) : (
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500 border-b border-neutral-200 dark:border-neutral-800 uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Post</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Última Atualização</th>
                                    <th className="px-6 py-4 font-medium text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                {posts.map((post) => (
                                    <tr key={post.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-neutral-900 dark:text-white line-clamp-1">{post.title || "Sem título"}</div>
                                            <div className="text-xs text-neutral-500 mt-1 line-clamp-1">/{post.slug || post.id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${post.status === 'published'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                                }`}>
                                                {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-500">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {formatDate(post.updatedAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {post.status === 'published' && (
                                                    <a
                                                        href={`/blog/${post.slug}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
                                                        title="Ver na página"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                )}
                                                <Link
                                                    href={`/admin/blog/${post.id}`}
                                                    className="p-2 text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(post.id)}
                                                    className="p-2 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    title="Excluir"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
