"use client";

import { AuthProvider, useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LogOut, LayoutDashboard, KeyRound, FileText, Newspaper, Sparkles } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <AdminLayoutInner>{children}</AdminLayoutInner>
        </AuthProvider>
    );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user && pathname !== "/admin/login") {
            router.replace("/admin/login");
        }
    }, [user, loading, router, pathname]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    // Permitir a página de Login sem o Sidebar do Admin
    if (!user || pathname === "/admin/login") {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen flex bg-neutral-50 dark:bg-neutral-950 font-sans">
            {/* Sidebar Admin */}
            <aside className="w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col pt-20">
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">V</div>
                        <div>
                            <h2 className="font-display font-bold text-lg text-neutral-900 dark:text-white leading-none">CMS Vivare</h2>
                            <p className="text-xs text-neutral-500 mt-1">Admin Panel</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <Link
                        href="/admin"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/admin"
                            ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            }`}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        Visão Geral
                    </Link>
                    <Link
                        href="/admin/pages"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith("/admin/pages")
                            ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            }`}
                    >
                        <FileText className="w-4 h-4" />
                        Páginas
                    </Link>
                    <Link
                        href="/admin/blog"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith("/admin/blog")
                            ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            }`}
                    >
                        <FileText className="w-4 h-4" />
                        Blog
                    </Link>
                    <Link
                        href="/admin/content-queue"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith("/admin/content-queue")
                            ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            }`}
                    >
                        <Newspaper className="w-4 h-4" />
                        Fila de Conteúdo
                    </Link>
                    <Link
                        href="/admin/ai-settings"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith("/admin/ai-settings")
                            ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            }`}
                    >
                        <Sparkles className="w-4 h-4" />
                        IA Assistente
                    </Link>
                    <Link
                        href="/admin/configs"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/admin/configs"
                            ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            }`}
                    >
                        <KeyRound className="w-4 h-4" />
                        Conectar API
                    </Link>
                    <Link
                        href="/admin/leads"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/admin/leads"
                            ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        Banco de Leads
                    </Link>
                </nav>

                <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
                    <button
                        onClick={signOut}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sair (Logout)
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 pt-20">
                <div className="h-14 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between px-8 shadow-sm">
                    <h1 className="text-sm font-medium text-neutral-500">Painel do Administrador</h1>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-medium border border-neutral-200 dark:border-neutral-700">
                                AD
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 max-w-6xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
