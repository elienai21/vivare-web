import { defineConfig } from 'vitest/config';
import path from 'node:path';

/**
 * Vitest config — testes de unidade pra lógica pura (state machine,
 * helpers de validação, normalização de erro). Não testa I/O direto
 * (Firestore, Stays, Stripe) — esses ficam pra integração futura.
 *
 * Roda com `npm test` (CI) ou `npm run test:watch` (dev).
 */
export default defineConfig({
    test: {
        environment: 'node',
        include: ['src/**/__tests__/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['src/lib/**/*.ts'],
            exclude: [
                'src/lib/firebase-admin.ts',       // I/O setup, sem lógica testável
                'src/lib/stripe.ts',                // I/O setup
                'src/lib/checkout-service.ts',      // orquestração — integração
            ],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
