/**
 * Sentry edge runtime config (middleware, edge route handlers).
 * Hoje quase nada do projeto roda no edge — todas as rotas de
 * checkout exigem `runtime = 'nodejs'` (firebase-admin/stripe não
 * compatíveis com edge). Mantém o setup pronto pra futuro.
 */
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN;

if (dsn) {
    Sentry.init({
        dsn,
        tracesSampleRate: 0,
        environment: process.env.VERCEL_ENV || 'development',
    });
}
