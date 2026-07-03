import { describe, it, expect, vi } from 'vitest';
import { normalizeError, errorResponseBody } from '../api-errors';

/**
 * Testa a normalização de mensagens de erro técnico → user-friendly.
 * Princípio 5 (HURDLE 33): cliente não vê stack trace; suporte recebe
 * `requestId` pra correlacionar nos logs.
 */
describe('normalizeError', () => {
    it('mapeia "Listing X not found" para mensagem de acomodação', () => {
        const result = normalizeError(new Error('Listing abc123 not found'));
        expect(result.user).toContain('Acomodação não encontrada');
        expect(result.technical).toBe('Listing abc123 not found');
        expect(result.requestId).toHaveLength(8);
    });

    it('mapeia erros do Stripe genericamente', () => {
        const result = normalizeError(new Error('STRIPE_SECRET_KEY env var não configurada'));
        expect(result.user).toContain('provedor de pagamento');
    });

    it('mapeia erros do Firebase genericamente', () => {
        const result = normalizeError(new Error('firebase-admin não conseguiu inicializar'));
        expect(result.user).toContain('Erro temporário');
    });

    it('mapeia falha de createReservation Stays como datas indisponíveis', () => {
        const result = normalizeError(new Error('Stays createReservation failed (409): conflict'));
        expect(result.user).toContain('datas');
    });

    it('mapeia timeout como problema de conexão', () => {
        const result = normalizeError(new Error('Stays API request timeout'));
        expect(result.user).toContain('Tempo esgotado');
    });

    it('mapeia hold required first como sessão inconsistente', () => {
        const result = normalizeError(new Error('Cannot create PaymentIntent from state INITIATED. Hold required first.'));
        expect(result.user).toMatch(/sess[ãa]o/i);
    });

    it('cai no fallback genérico para mensagens desconhecidas', () => {
        const result = normalizeError(new Error('Some weird internal bug nobody mapped'));
        expect(result.user).toContain('Não foi possível processar');
        expect(result.technical).toBe('Some weird internal bug nobody mapped');
    });

    it('lida com erros não-Error (strings, null, undefined)', () => {
        expect(normalizeError('weird string').technical).toBe('weird string');
        expect(normalizeError(null).technical).toBe('null');
        expect(normalizeError(undefined).technical).toBe('undefined');
    });

    it('requestId é alfanumérico e estável dentro de uma chamada', () => {
        const r = normalizeError(new Error('x'));
        expect(r.requestId).toMatch(/^[a-z0-9-]+$/i);
        expect(r.requestId.length).toBeGreaterThanOrEqual(8);
    });
});

describe('errorResponseBody', () => {
    it('loga no console.error com prefixo de contexto + requestId', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const body = errorResponseBody(new Error('boom'), 'test-ctx');

        expect(body.error).toBeTruthy();
        expect(body.requestId).toHaveLength(8);

        expect(spy).toHaveBeenCalled();
        const logCall = spy.mock.calls[0]!.join(' ');
        expect(logCall).toContain('[test-ctx]');
        expect(logCall).toContain(body.requestId);
        expect(logCall).toContain('boom');

        spy.mockRestore();
    });

    it('nunca expõe o stack trace na resposta', () => {
        const err = new Error('test stack');
        const body = errorResponseBody(err, 'ctx');
        expect(JSON.stringify(body)).not.toContain('at ');
        expect(JSON.stringify(body)).not.toContain(err.stack || '');
    });
});
