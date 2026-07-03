/**
 * Formatadores defensivos.
 *
 * Princípio: nenhum formatador público assume tipo correto. Dados de
 * Stays/Firestore/CMS chegam às vezes como string ("R$ 1.234,00"),
 * undefined (campo ausente), null (campo zerado intencionalmente) ou
 * NaN (cálculo quebrou). Renderizar isso direto = página crashada.
 *
 * Padrão é receber `unknown` e devolver string segura — `'—'` por
 * default quando não der pra formatar, ou um placeholder customizado.
 */

/** Formata um valor em moeda BRL. Aceita qualquer entrada. */
export function safeBRL(
    value: unknown,
    options: { fallback?: string; currency?: string } = {},
): string {
    const { fallback = '—', currency = 'BRL' } = options;
    const num = coerceNumber(value);
    if (num === null) return fallback;

    return num.toLocaleString('pt-BR', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

/** Formata um número genérico (sem moeda) em pt-BR. */
export function safeNumber(
    value: unknown,
    options: { fallback?: string; decimals?: number } = {},
): string {
    const { fallback = '—', decimals = 0 } = options;
    const num = coerceNumber(value);
    if (num === null) return fallback;

    return num.toLocaleString('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

/**
 * Coerção tolerante de qualquer coisa para `number | null`.
 * Aceita number direto, string "R$ 1.234,56" (parseia), nulos e NaN
 * caem em `null` para o caller decidir o fallback.
 */
export function coerceNumber(value: unknown): number | null {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null;
    }
    if (typeof value === 'string') {
        // Remove tudo que não é dígito, vírgula, ponto ou sinal. Aceita
        // tanto "1234.56" quanto "R$ 1.234,56" (formato BR).
        const stripped = value.replace(/[^0-9.,-]/g, '');
        if (!stripped) return null;
        // Detecta formato BR (com vírgula como decimal): "1.234,56" → "1234.56"
        const normalized = stripped.includes(',')
            ? stripped.replace(/\./g, '').replace(',', '.')
            : stripped;
        const num = Number(normalized);
        return Number.isFinite(num) ? num : null;
    }
    return null;
}
