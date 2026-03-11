"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, Send, Check, X, RefreshCw, ChevronDown } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────
type AiProvider = "claude" | "chatgpt" | "gemini";

interface AiTextAssistantProps {
    /** O texto atual do campo que será melhorado */
    text: string;
    /** Callback chamado quando o usuário aplica a sugestão da IA */
    onApply: (result: string) => void;
    /** Contexto do campo para a IA (ex: "título do blog", "subtítulo da home") */
    fieldContext?: string;
    /** Texto do botão de ação */
    buttonLabel?: string;
}

interface ProviderInfo {
    id: AiProvider;
    label: string;
    icon: string;
    color: string;
}

const PROVIDERS: ProviderInfo[] = [
    { id: "claude", label: "Claude", icon: "🟣", color: "bg-purple-500" },
    { id: "chatgpt", label: "ChatGPT", icon: "🟢", color: "bg-green-500" },
    { id: "gemini", label: "Gemini", icon: "🔵", color: "bg-blue-500" },
];

const QUICK_INSTRUCTIONS = [
    "Corrija a gramática e ortografia",
    "Torne mais persuasivo e envolvente",
    "Resuma de forma mais concisa",
    "Melhore o SEO (palavras-chave naturais)",
    "Torne mais formal e profissional",
    "Torne mais casual e acessível",
];

const STORAGE_KEY = "vivare_ai_provider";

// ─── Component ────────────────────────────────────────────────────
export default function AiTextAssistant({
    text,
    onApply,
    fieldContext,
    buttonLabel = "Melhorar com IA",
}: AiTextAssistantProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [provider, setProvider] = useState<AiProvider>("claude");
    const [availableProviders, setAvailableProviders] = useState<Record<AiProvider, boolean>>({
        claude: true,
        chatgpt: false,
        gemini: false,
    });
    const [instruction, setInstruction] = useState("");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showProviderDropdown, setShowProviderDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Load saved provider preference
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY) as AiProvider | null;
        if (saved && PROVIDERS.some(p => p.id === saved)) {
            setProvider(saved);
        }
    }, []);

    // Fetch available providers
    useEffect(() => {
        fetch("/api/admin/ai-assist")
            .then(res => res.json())
            .then(data => {
                if (data.providers) {
                    setAvailableProviders(data.providers);
                    // If saved provider is not available, switch to first available
                    const saved = localStorage.getItem(STORAGE_KEY) as AiProvider | null;
                    if (saved && !data.providers[saved]) {
                        const firstAvailable = (Object.keys(data.providers) as AiProvider[]).find(
                            k => data.providers[k]
                        );
                        if (firstAvailable) setProvider(firstAvailable);
                    }
                }
            })
            .catch(() => {
                // Silently fail — Claude is always expected to be available
            });
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowProviderDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    function selectProvider(p: AiProvider) {
        setProvider(p);
        localStorage.setItem(STORAGE_KEY, p);
        setShowProviderDropdown(false);
    }

    async function handleSubmit() {
        if (!instruction.trim() || !text.trim()) return;

        setLoading(true);
        setError("");
        setResult("");

        try {
            const res = await fetch("/api/admin/ai-assist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text,
                    instruction: instruction.trim(),
                    provider,
                    fieldContext,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Erro ao processar a requisição.");
                return;
            }

            setResult(data.result);
        } catch (err) {
            setError("Erro de conexão. Verifique se o servidor está rodando.");
        } finally {
            setLoading(false);
        }
    }

    function handleApply() {
        if (result) {
            onApply(result);
            setResult("");
            setInstruction("");
            setIsOpen(false);
        }
    }

    function handleDiscard() {
        setResult("");
        setError("");
    }

    function handleClose() {
        setIsOpen(false);
        setResult("");
        setError("");
        setInstruction("");
    }

    const currentProvider = PROVIDERS.find(p => p.id === provider) || PROVIDERS[0];

    // ─── Collapsed state: just a button ──────────────────────────
    if (!isOpen) {
        return (
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                disabled={!text.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/40 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
                <Sparkles className="w-3.5 h-3.5" />
                {buttonLabel}
            </button>
        );
    }

    // ─── Expanded state: full assistant panel ────────────────────
    return (
        <div className="mt-3 border border-purple-200 dark:border-purple-800/40 rounded-xl bg-purple-50/50 dark:bg-purple-900/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-purple-200/60 dark:border-purple-800/30 bg-purple-50 dark:bg-purple-900/20">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                        Assistente de IA
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {/* Provider Selector */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setShowProviderDropdown(!showProviderDropdown)}
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                        >
                            <span>{currentProvider.icon}</span>
                            <span>{currentProvider.label}</span>
                            <ChevronDown className="w-3 h-3" />
                        </button>

                        {showProviderDropdown && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg z-20 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                                {PROVIDERS.map(p => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => selectProvider(p.id)}
                                        disabled={!availableProviders[p.id]}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors ${
                                            !availableProviders[p.id]
                                                ? "opacity-40 cursor-not-allowed text-neutral-400"
                                                : p.id === provider
                                                  ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                                                  : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                                        }`}
                                    >
                                        <span>{p.icon}</span>
                                        <span className="flex-1">{p.label}</span>
                                        {!availableProviders[p.id] && (
                                            <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                                                sem key
                                            </span>
                                        )}
                                        {p.id === provider && availableProviders[p.id] && (
                                            <Check className="w-3.5 h-3.5 text-purple-500" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded-md hover:bg-white/50 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
                {/* Quick Instructions */}
                <div className="flex flex-wrap gap-1.5">
                    {QUICK_INSTRUCTIONS.map(qi => (
                        <button
                            key={qi}
                            type="button"
                            onClick={() => setInstruction(qi)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                                instruction === qi
                                    ? "bg-purple-200 dark:bg-purple-800/50 text-purple-800 dark:text-purple-200"
                                    : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                            }`}
                        >
                            {qi}
                        </button>
                    ))}
                </div>

                {/* Custom Instruction Input */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={instruction}
                        onChange={e => setInstruction(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                        placeholder="Ou escreva sua instrução personalizada..."
                        className="flex-1 px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all dark:text-white placeholder:text-neutral-400"
                    />
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading || !instruction.trim() || !text.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm shadow-purple-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <Send className="w-3.5 h-3.5" />
                        )}
                        {loading ? "Processando..." : "Enviar"}
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-lg text-sm text-red-700 dark:text-red-400">
                        {error}
                    </div>
                )}

                {/* Result */}
                {result && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="p-4 bg-white dark:bg-neutral-900 border border-purple-200 dark:border-purple-800/40 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                                    Sugestão da IA ({currentProvider.label})
                                </span>
                            </div>
                            <div className="text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                                {result}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleApply}
                                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm shadow-green-600/20"
                            >
                                <Check className="w-3.5 h-3.5" />
                                Aplicar texto
                            </button>
                            <button
                                type="button"
                                onClick={handleDiscard}
                                className="flex items-center gap-1.5 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-lg text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                                Descartar
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex items-center gap-1.5 px-3 py-2 text-neutral-500 dark:text-neutral-400 text-sm hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                                Tentar novamente
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
