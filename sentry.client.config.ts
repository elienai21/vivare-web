/**
 * Sentry client runtime config (browser). Lazy init — só liga se
 * `NEXT_PUBLIC_SENTRY_DSN` estiver setada.
 */
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
    Sentry.init({
        dsn,
        tracesSampleRate: 0.1,
        environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',
        sendDefaultPii: false,
        // Reduz ruído: ignora erros conhecidos do navegador
        // (extensões, ResizeObserver loop, etc.).
        ignoreErrors: [
            'ResizeObserver loop limit exceeded',
            'ResizeObserver loop completed with undelivered notifications',
            'Non-Error promise rejection captured',
        ],
    });
}
