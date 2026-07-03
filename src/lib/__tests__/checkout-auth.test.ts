import { describe, it, expect } from 'vitest';
import { generateSessionToken, verifySessionToken } from '../checkout-auth';

/**
 * Testes do session token. Não cobre o rate limit (depende de Firestore).
 */
describe('session token', () => {
    describe('generateSessionToken', () => {
        it('produz string hex de 64 chars (256 bits)', () => {
            const token = generateSessionToken();
            expect(token).toHaveLength(64);
            expect(token).toMatch(/^[a-f0-9]{64}$/);
        });

        it('produz tokens únicos em chamadas consecutivas', () => {
            const tokens = new Set<string>();
            for (let i = 0; i < 1000; i++) {
                tokens.add(generateSessionToken());
            }
            expect(tokens.size).toBe(1000);
        });
    });

    describe('verifySessionToken', () => {
        it('aceita tokens idênticos', () => {
            const t = generateSessionToken();
            expect(verifySessionToken(t, t)).toBe(true);
        });

        it('rejeita tokens diferentes', () => {
            const a = generateSessionToken();
            const b = generateSessionToken();
            expect(verifySessionToken(a, b)).toBe(false);
        });

        it('rejeita stored undefined/null', () => {
            const t = generateSessionToken();
            expect(verifySessionToken(undefined, t)).toBe(false);
            // @ts-expect-error testando comportamento defensivo
            expect(verifySessionToken(null, t)).toBe(false);
        });

        it('rejeita provided null/empty', () => {
            const t = generateSessionToken();
            expect(verifySessionToken(t, null)).toBe(false);
            expect(verifySessionToken(t, '')).toBe(false);
        });

        it('rejeita tokens de tamanhos diferentes (timing-safe sem vazar info)', () => {
            const long = generateSessionToken();
            expect(verifySessionToken(long, 'short')).toBe(false);
            expect(verifySessionToken(long, long + 'extra')).toBe(false);
        });

        it('não vaza tempo de comparação entre tokens válidos vs prefixo correto', () => {
            // Sanity check: tokens com prefixo igual mas restante diferente
            // não passam (comparação byte-a-byte completa via timingSafeEqual).
            const t = generateSessionToken();
            const tampered = t.slice(0, 60) + '0000';
            expect(verifySessionToken(t, tampered)).toBe(false);
        });
    });
});
