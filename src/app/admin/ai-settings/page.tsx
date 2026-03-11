"use client";

import { useState, useEffect } from "react";
import { RefreshCw, CheckCircle2, XCircle, ExternalLink, Sparkles } from "lucide-react";

type AiProvider = "claude" | "chatgpt" | "gemini";

interface ProviderConfig {
    id: AiProvider;
    label: string;
    icon: string;
    description: string;
    docsUrl: string;
    envVar: string;
}

const PROVIDERS: ProviderConfig[] = [
    {
        id: "claude",
        label: "Claude (Anthropic)",
        icon: "🟣",
        description: "Modelo Claude Sonnet — excelente para escrita criativa em português.",
        docsUrl: "https://console.anthropic.com/settings/keys",
        envVar: "ANTHROPIC_API_KEY",
    },
    {
        id: "chatgpt",
        label: "ChatGPT (OpenAI)",
        icon: "🟢",
        description: "Modelo GPT-4o — versátil e rápido para diversas tarefas.",
        docsUrl: "https://platform.openai.com/api-keys",
        envVar: "OPENAI_API_KEY",
    },
    {
        id: "gemini",
        label: "Gemini (Google)",
        icon: "🔵",
        description: "Modelo Gemini 2.0 Flash — rápido e gratuito com limite generoso.",
        docsUrl: "https://aistudio.google.com/apikey",
        envVar: "GEMINI_API_KEY",
    },
];

export default function AiSettingsPage() {
    const [available, setAvailable] = useState<Record<AiProvider, boolean>>({
        claude: false,
        chatgpt: false,
        gemini: false,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/ai-assist")
            .then(res => res.json())
            .then(data => {
                if (data.providers) {
                    setAvailable(data.providers);
                }
            })
            .catch(() => {
                // silently fail
            })
            .finally(() => setLoading(false));
    }, []);

    const activeCount = Object.values(available).filter(Boolean).length;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2 flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-purple-500" />
                        Assistente de IA
                    </h1>
                    <p className="text-neutral-500">
                        Configure os provedores de IA disponíveis para auxiliar na criação de textos.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/40 rounded-xl text-sm">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="text-purple-700 dark:text-purple-300 font-medium">
                        {activeCount} provider{activeCount !== 1 ? "s" : ""} ativo{activeCount !== 1 ? "s" : ""}
                    </span>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <RefreshCw className="w-6 h-6 animate-spin text-primary-500" />
                </div>
            ) : (
                <div className="space-y-4">
                    {PROVIDERS.map(provider => {
                        const isActive = available[provider.id];
                        return (
                            <div
                                key={provider.id}
                                className={`bg-white dark:bg-neutral-900 border rounded-2xl p-6 transition-all ${
                                    isActive
                                        ? "border-green-200 dark:border-green-800/40"
                                        : "border-neutral-200 dark:border-neutral-800"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="text-2xl">{provider.icon}</div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold text-neutral-900 dark:text-white">
                                                    {provider.label}
                                                </h3>
                                                {isActive ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        Ativo
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                                                        <XCircle className="w-3 h-3" />
                                                        Sem API Key
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-neutral-500 mb-3">
                                                {provider.description}
                                            </p>
                                            {!isActive && (
                                                <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl text-sm text-amber-700 dark:text-amber-400">
                                                    <p className="font-medium mb-1">Como ativar:</p>
                                                    <ol className="list-decimal list-inside space-y-1 text-xs">
                                                        <li>
                                                            Acesse{" "}
                                                            <a
                                                                href={provider.docsUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-primary-600 hover:underline inline-flex items-center gap-1"
                                                            >
                                                                a plataforma do provider
                                                                <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        </li>
                                                        <li>Gere uma API Key</li>
                                                        <li>
                                                            Adicione ao seu <code className="bg-amber-100 dark:bg-amber-900/30 px-1 py-0.5 rounded text-xs">.env.local</code>:{" "}
                                                            <code className="bg-amber-100 dark:bg-amber-900/30 px-1 py-0.5 rounded text-xs">
                                                                {provider.envVar}=&quot;sua_chave_aqui&quot;
                                                            </code>
                                                        </li>
                                                        <li>Reinicie o servidor de desenvolvimento</li>
                                                    </ol>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Info Box */}
            <div className="mt-8 p-5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
                <h3 className="font-bold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    Como usar o Assistente de IA
                </h3>
                <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-2">
                    <li className="flex items-start gap-2">
                        <span className="text-purple-500 font-bold">1.</span>
                        Ao editar qualquer texto no Blog ou Conteúdo, clique no botão <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded text-xs font-medium">✨ Melhorar com IA</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-purple-500 font-bold">2.</span>
                        Escolha o provider de IA e escreva a instrução (ou use uma sugestão rápida)
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-purple-500 font-bold">3.</span>
                        Revise a sugestão e clique em &quot;Aplicar texto&quot; para substituir o campo
                    </li>
                </ul>
            </div>
        </div>
    );
}
