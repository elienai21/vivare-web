import { describe, it, expect } from 'vitest';
import { sanitize } from '../log-sanitize';

describe('sanitize', () => {
    it('mascara campos sensíveis', () => {
        const result = sanitize({
            email: 'foo@bar.com',
            cpf: '12345678900',
            phone: '11999999999',
            normalField: 'ok',
        }) as Record<string, string>;

        expect(result.email).not.toBe('foo@bar.com');
        expect(result.email).toContain('*');
        expect(result.cpf).not.toBe('12345678900');
        expect(result.phone).not.toBe('11999999999');
        expect(result.normalField).toBe('ok');
    });

    it('é case-insensitive', () => {
        const result = sanitize({
            CPF: '12345678900',
            Email: 'a@b.com',
            sessionToken: 'abc123',
        }) as Record<string, string>;

        expect(result.CPF).not.toBe('12345678900');
        expect(result.Email).not.toBe('a@b.com');
        expect(result.sessionToken).not.toBe('abc123');
    });

    it('mascara campos aninhados', () => {
        const result = sanitize({
            guest: {
                firstName: 'João',
                email: 'joao@example.com',
                document: '12345678900',
            },
        }) as { guest: Record<string, string> };

        expect(result.guest.firstName).toBe('João');
        expect(result.guest.email).not.toBe('joao@example.com');
        expect(result.guest.document).not.toBe('12345678900');
    });

    it('preserva primitivos', () => {
        expect(sanitize(123)).toBe(123);
        expect(sanitize('plain')).toBe('plain');
        expect(sanitize(null)).toBeNull();
        expect(sanitize(undefined)).toBeUndefined();
        expect(sanitize(true)).toBe(true);
    });

    it('preserva arrays e sanitiza itens dentro', () => {
        const result = sanitize([
            { email: 'a@b.com', name: 'A' },
            { email: 'c@d.com', name: 'B' },
        ]) as Array<Record<string, string>>;

        expect(result).toHaveLength(2);
        expect(result[0]!.name).toBe('A');
        expect(result[0]!.email).not.toBe('a@b.com');
    });

    it('lida com Error: preserva message + name', () => {
        const err = new Error('boom');
        const result = sanitize(err) as { name: string; message: string };
        expect(result.name).toBe('Error');
        expect(result.message).toBe('boom');
    });

    it('limita profundidade pra evitar loops circulares', () => {
        const a: Record<string, unknown> = { name: 'A' };
        a.self = a;
        expect(() => sanitize(a)).not.toThrow();
    });

    it('strings curtas vão pra asteriscos puros', () => {
        const result = sanitize({ token: 'abc' }) as Record<string, string>;
        expect(result.token).toBe('***');
    });

    it('strings longas mostram só primeiros e últimos chars', () => {
        const result = sanitize({ token: 'abcdefghijklmnop' }) as Record<string, string>;
        expect(result.token).toMatch(/^ab\*+op$/);
    });
});
