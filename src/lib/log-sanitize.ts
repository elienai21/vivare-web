/**
 * Sanitiza objetos antes de mandar pra log/Sentry.
 *
 * Princípio (Repasse HURDLE patterns): logs estruturados ajudam debug
 * mas vazam PII se não filtrados. Aqui mascaramos campos sensíveis
 * conhecidos do nosso domínio (CPF, email, phone, tokens) e seguros
 * pra log (IDs, estados, timestamps) passam inalterados.
 *
 * Usar em qualquer `console.error(prefix, ..., sanitize(err))` antes
 * de subir Sentry, e em `beforeSend` do Sentry pra defesa em camadas.
 */

const SENSITIVE_KEYS = [
    'cpf', 'document', 'doc',
    'email', 'e-mail',
    'phone', 'telefone', 'whatsapp',
    'password', 'senha',
    'token', 'sessiontoken', 'sessiontoken',
    'apikey', 'api_key', 'apisecret', 'api_secret',
    'authorization', 'cookie',
    'clientsecret', 'client_secret',
    // Dados de cartão — não devem chegar a nós (Stripe Elements isola),
    // mas defesa em camadas:
    'card', 'cardnumber', 'card_number', 'cvc', 'cvv',
];

const KEY_REGEX = new RegExp(`^(${SENSITIVE_KEYS.join('|')})$`, 'i');

/** Mascara valor sensível mantendo tamanho aproximado pra debug. */
function mask(value: unknown): string {
    if (typeof value !== 'string') return '[REDACTED]';
    if (value.length === 0) return '';
    if (value.length <= 4) return '*'.repeat(value.length);
    // Mostra primeiros 2 e últimos 2 chars (suficiente pra correlação
    // sem expor o conteúdo). Ex: "ad************om".
    return value.slice(0, 2) + '*'.repeat(Math.max(8, value.length - 4)) + value.slice(-2);
}

/**
 * Sanitiza recursivamente. Aceita qualquer coisa, devolve cópia segura.
 * Não muta o input original. Limita profundidade pra evitar loops em
 * objetos circulares.
 */
export function sanitize(input: unknown, depth = 0): unknown {
    if (depth > 5) return '[depth-limit]';
    if (input === null || input === undefined) return input;
    if (typeof input !== 'object') return input;

    if (Array.isArray(input)) {
        return input.map((v) => sanitize(v, depth + 1));
    }

    // Error: preserva message/name/code, sanitiza extras
    if (input instanceof Error) {
        return {
            name: input.name,
            message: input.message,
            // stack só fora de produção
            ...(process.env.NODE_ENV !== 'production' && { stack: input.stack }),
        };
    }

    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
        if (KEY_REGEX.test(key)) {
            out[key] = mask(value);
        } else {
            out[key] = sanitize(value, depth + 1);
        }
    }
    return out;
}

/**
 * Helper conveniente: log estruturado com prefixo de contexto. Já
 * passa o segundo argumento pelo sanitize, então é seguro mandar
 * qualquer payload aqui.
 */
export function logError(context: string, message: string, payload?: unknown): void {
    if (payload === undefined) {
        console.error(`[${context}] ${message}`);
    } else {
        console.error(`[${context}] ${message}`, sanitize(payload));
    }
}
