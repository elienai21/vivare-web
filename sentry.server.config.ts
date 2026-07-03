/**
 * Sentry server runtime config (Vercel functions, API routes, server
 * components). Carregado pelo wrapper `withSentryConfig` em
 * `next.config.ts`.
 *
 * Init é lazy: só roda se `SENTRY_DSN` estiver setado. Permite deploy
 * sem Sentry configurado sem quebrar o build.
 */
import * as Sentry from '@sentry/nextjs';
import { sanitize } from '@/lib/log-sanitize';

const dsn = process.env.SENTRY_DSN;

if (dsn) {
    Sentry.init({
        dsn,
        // Sample 100% errors em prod, 100% em dev. Tracing opt-in via env
        // (custo zero quando desligado).
        tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE
            ? parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE)
            : 0,
        environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
        // Não enviamos PII por padrão — checkout PII (CPF, email) só nos
        // logs estruturados Vercel; no Sentry só metadata operacional.
        sendDefaultPii: false,
        beforeSend(event) {
            // Sanitiza extras + contexts (onde devs costumam jogar payload
            // bruto). Headers de auth/session ficam mascarados por
            // `sanitize` também — usar `request.headers` como cobertura
            // dupla.
            if (event.extra) event.extra = sanitize(event.extra) as typeof event.extra;
            if (event.contexts) event.contexts = sanitize(event.contexts) as typeof event.contexts;
            if (event.request?.headers) {
                for (const k of Object.keys(event.request.headers)) {
                    if (/auth|session|token|key|cookie/i.test(k)) {
                        event.request.headers[k] = '<redacted>';
                    }
                }
            }
            return event;
        },
    });
}
