"use client";

import { useState } from "react";
import { Save, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ConfigsPage() {
    const [apiKey, setApiKey] = useState("");
    const [apiUrl, setApiUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus("idle");

        try {
            // Futura lógica de Server Action para salvar em Vercel Env ou testar conexão
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setStatus("success");
            console.log("Simulating Vercel Env save/test connection.");
        } catch (error) {
            setStatus("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Conexão API Stays.net</h1>
            <p className="text-neutral-500 mb-8 max-w-2xl">
                Estas informações são armazenadas de forma segura (<code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-sm text-primary-600">Vercel Environment Variables</code>) e nunca são expostas ao cliente/frontend.
            </p>

            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 md:p-8 max-w-3xl shadow-sm">

                {status === "success" && (
                    <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30 flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-semibold text-sm">Configurações salvas e validadas!</p>
                            <p className="text-xs opacity-90 mt-1">O sistema da Vivare agora consegue se comunicar com as unidades no banco da Stays.net.</p>
                        </div>
                    </div>
                )}

                {status === "error" && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800/30 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-semibold text-sm">Falha ao conectar na API</p>
                            <p className="text-xs opacity-90 mt-1">Verifique as credenciais inseridas e tente novamente.</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Endpoint URL Base</label>
                        <input
                            type="url"
                            placeholder="https://sua-url.stays.net/external/v1/"
                            value={apiUrl}
                            onChange={(e) => setApiUrl(e.target.value)}
                            className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-mono text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Token de API (Bearer)</label>
                        <input
                            type="password"
                            placeholder="ey..."
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-mono text-sm tracking-widest"
                        />
                        <p className="text-xs text-neutral-500 mt-2">Você pode gerar esta chave na área de integrações do sistema Stays.net.</p>
                    </div>

                    <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading || !apiKey || !apiUrl}
                            className="flex items-center gap-2 px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-medium transition-colors active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Salvar Credenciais
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
