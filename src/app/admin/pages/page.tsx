"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { RefreshCw, FileText, CheckCircle, PenLine } from "lucide-react";
import { CMS_PAGES_CATALOG } from "@/types/cms";
import type { CmsPage } from "@/types/cms";
import { listAllPages } from "@/services/cmsService";

export default function AdminPagesListPage() {
    const [pages, setPages] = useState<CmsPage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const all = await listAllPages();
                setPages(all);
            } catch (err) {
                console.error("Erro ao carregar páginas CMS:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-16">
                <RefreshCw className="w-6 h-6 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">Páginas do Site</h1>
                    <p className="text-neutral-500 text-sm">Gerencie o conteúdo editorial de cada página.</p>
                </div>
            </div>

            <div className="grid gap-4">
                {CMS_PAGES_CATALOG.map((config) => {
                    const liveData = pages.find((p) => p.id === config.id);
                    const status = liveData?.status || "não criada";
                    const updatedAt = liveData?.updatedAt
                        ? new Date(liveData.updatedAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })
                        : "—";

                    return (
                        <Link
                            key={config.id}
                            href={`/admin/pages/${config.id}`}
                            className="flex items-center gap-4 p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-all group"
                        >
                            <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-neutral-900 dark:text-white group-hover:text-primary-600 transition-colors">
                                    {config.title}
                                </h3>
                                <p className="text-xs text-neutral-500 truncate">{config.description}</p>
                            </div>

                            <div className="flex items-center gap-3 flex-shrink-0">
                                {status === "published" ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 px-2.5 py-1 rounded-full">
                                        <CheckCircle className="w-3 h-3" />
                                        Publicada
                                    </span>
                                ) : status === "draft" ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 px-2.5 py-1 rounded-full">
                                        <PenLine className="w-3 h-3" />
                                        Rascunho
                                    </span>
                                ) : (
                                    <span className="text-xs text-neutral-400 font-medium">Não editada</span>
                                )}
                                <span className="text-[11px] text-neutral-400 hidden sm:block">{updatedAt}</span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
