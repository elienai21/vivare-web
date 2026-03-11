"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/constants";
import { subscribeToNewsletter } from "@/services/blogService";

export function EmailSignupForm() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setError(false);
        trackEvent("email_signup_submitted");

        try {
            await subscribeToNewsletter(email, "Home_Footer");
            setSubmitted(true);
        } catch (err) {
            console.error("Erro ao salvar lead de newsletter:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="text-center">
                <p className="text-xl font-semibold text-white mb-2">Inscrição confirmada! ✓</p>
                <p className="text-primary-200">Você receberá nossas melhores ofertas e novidades diretamente no seu e-mail.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center">
            <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu melhor e-mail"
                className="px-6 py-4 w-full sm:w-96 focus-ring bg-white/5 border border-primary/30 text-white placeholder:text-neutral-500 font-medium"
            />
            <button
                type="submit"
                disabled={loading}
                className="bg-primary hover:brightness-110 transition-all text-ink font-bold py-4 px-10 min-w-[220px] text-xs uppercase tracking-widest whitespace-nowrap disabled:opacity-60"
            >
                {loading ? "Enviando..." : "Inscrever-se"}
            </button>
            {error && (
                <p className="text-red-400 text-sm mt-2 sm:mt-0 sm:self-center">Erro ao inscrever. Tente novamente.</p>
            )}
        </form>
    );
}
