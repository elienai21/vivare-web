"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/admin");
        } catch (err: unknown) {
            console.error("Login failed:", err);
            const code = (err as { code?: string }).code || "";
            if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
                setError("E-mail ou senha incorretos.");
            } else if (code === "auth/user-not-found") {
                setError("Usuário não encontrado.");
            } else if (code === "auth/too-many-requests") {
                setError("Muitas tentativas. Aguarde e tente novamente.");
            } else {
                setError(`Erro ao fazer login: ${code || (err as Error).message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4 font-sans">
            <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="h-2 w-full bg-gradient-to-r from-neutral-900 via-primary-500 to-neutral-900"></div>
                <div className="p-8">
                    <div className="flex flex-col items-center justify-center mb-8">
                        <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-full flex items-center justify-center mb-4">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white font-display text-center">CMS Vivare</h1>
                        <p className="text-sm text-neutral-500 mt-2 text-center">Acesso restrito a administradores</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm border border-red-100 dark:border-red-900/30">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 cursor-pointer" htmlFor="email">E-mail</label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all dark:bg-neutral-800 dark:border-neutral-700 dark:focus:bg-neutral-800 dark:text-white"
                                placeholder="adm@vivare.com.br"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 cursor-pointer" htmlFor="password">Senha</label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all dark:bg-neutral-800 dark:border-neutral-700 dark:focus:bg-neutral-800 dark:text-white"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-medium transition-colors active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none mt-2 flex justify-center items-center"
                        >
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                "Entrar no Painel"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
