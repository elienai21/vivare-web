import { describe, it, expect } from 'vitest';
import { safeBRL, safeNumber, coerceNumber } from '../format';

describe('coerceNumber', () => {
    it('aceita números finitos', () => {
        expect(coerceNumber(0)).toBe(0);
        expect(coerceNumber(123.45)).toBe(123.45);
        expect(coerceNumber(-50)).toBe(-50);
    });

    it('rejeita NaN e Infinity', () => {
        expect(coerceNumber(NaN)).toBeNull();
        expect(coerceNumber(Infinity)).toBeNull();
        expect(coerceNumber(-Infinity)).toBeNull();
    });

    it('parseia strings em formato US "1234.56"', () => {
        expect(coerceNumber('1234.56')).toBe(1234.56);
        expect(coerceNumber('0.5')).toBe(0.5);
    });

    it('parseia strings em formato BR "1.234,56"', () => {
        expect(coerceNumber('1.234,56')).toBe(1234.56);
        expect(coerceNumber('R$ 1.234,56')).toBe(1234.56);
        expect(coerceNumber('R$ 99,90')).toBe(99.9);
    });

    it('rejeita lixo', () => {
        expect(coerceNumber(undefined)).toBeNull();
        expect(coerceNumber(null)).toBeNull();
        expect(coerceNumber({})).toBeNull();
        expect(coerceNumber([])).toBeNull();
        expect(coerceNumber('abc')).toBeNull();
        expect(coerceNumber('')).toBeNull();
    });
});

describe('safeBRL', () => {
    it('formata número direto', () => {
        //   é o non-breaking space que o Intl insere depois de R$
        expect(safeBRL(1234.56)).toBe('R$ 1.234,56');
        expect(safeBRL(0)).toBe('R$ 0,00');
    });

    it('formata 2 casas decimais sempre (BRL)', () => {
        expect(safeBRL(100)).toBe('R$ 100,00');
        expect(safeBRL(99.9)).toBe('R$ 99,90');
    });

    it('cai no fallback pra valores inválidos', () => {
        expect(safeBRL(undefined)).toBe('—');
        expect(safeBRL(null)).toBe('—');
        expect(safeBRL(NaN)).toBe('—');
        expect(safeBRL({})).toBe('—');
        expect(safeBRL(undefined, { fallback: 'Sem preço' })).toBe('Sem preço');
    });

    it('parseia strings BRL re-entradas (idempotente)', () => {
        expect(safeBRL('R$ 1.234,56')).toBe('R$ 1.234,56');
    });

    it('aceita currency customizado', () => {
        expect(safeBRL(100, { currency: 'USD' })).toMatch(/US\$|\$/);
    });
});

describe('safeNumber', () => {
    it('formata inteiro por padrão', () => {
        expect(safeNumber(1234)).toBe('1.234');
        expect(safeNumber(0)).toBe('0');
    });

    it('aceita decimals customizados', () => {
        expect(safeNumber(1234.5678, { decimals: 2 })).toBe('1.234,57');
    });

    it('cai no fallback', () => {
        expect(safeNumber(undefined)).toBe('—');
        expect(safeNumber(undefined, { fallback: 'N/A' })).toBe('N/A');
    });
});
