import { describe, it, expect } from 'vitest';
import {
    CheckoutState,
    VALID_TRANSITIONS,
    TERMINAL_STATES,
    EXPIRABLE_STATES,
    isValidTransition,
    isTerminal,
} from '../checkout-model';

/**
 * Testes da state machine de checkout. São puros (sem Firestore),
 * cobrindo as transições válidas/inválidas, estados terminais e
 * expirables. Servem como contrato — se alguém adicionar um estado
 * novo, os testes apontam imediatamente o que precisa ser atualizado.
 */
describe('checkout state machine', () => {
    describe('isValidTransition', () => {
        it('permite o caminho feliz INITIATED → HOLD → PAYMENT → PAID → BOOKED', () => {
            expect(isValidTransition(CheckoutState.INITIATED, CheckoutState.HOLD_CREATED)).toBe(true);
            expect(isValidTransition(CheckoutState.HOLD_CREATED, CheckoutState.PAYMENT_CREATED)).toBe(true);
            expect(isValidTransition(CheckoutState.PAYMENT_CREATED, CheckoutState.PAID)).toBe(true);
            expect(isValidTransition(CheckoutState.PAID, CheckoutState.BOOKED)).toBe(true);
        });

        it('permite cancelamento em estados intermediários', () => {
            expect(isValidTransition(CheckoutState.INITIATED, CheckoutState.CANCELED)).toBe(true);
            expect(isValidTransition(CheckoutState.HOLD_CREATED, CheckoutState.CANCELED)).toBe(true);
            expect(isValidTransition(CheckoutState.PAYMENT_CREATED, CheckoutState.CANCELED)).toBe(true);
            expect(isValidTransition(CheckoutState.BOOKED, CheckoutState.CANCELED)).toBe(true);
        });

        it('permite expiração só em HOLD_CREATED e PAYMENT_CREATED', () => {
            expect(isValidTransition(CheckoutState.HOLD_CREATED, CheckoutState.EXPIRED)).toBe(true);
            expect(isValidTransition(CheckoutState.PAYMENT_CREATED, CheckoutState.EXPIRED)).toBe(true);

            // INITIATED nunca expira (sem hold ainda)
            expect(isValidTransition(CheckoutState.INITIATED, CheckoutState.EXPIRED)).toBe(false);
            // BOOKED não expira (pagamento já capturado)
            expect(isValidTransition(CheckoutState.BOOKED, CheckoutState.EXPIRED)).toBe(false);
        });

        it('rejeita transições inválidas (não pode voltar no tempo)', () => {
            expect(isValidTransition(CheckoutState.HOLD_CREATED, CheckoutState.INITIATED)).toBe(false);
            expect(isValidTransition(CheckoutState.PAID, CheckoutState.HOLD_CREATED)).toBe(false);
            expect(isValidTransition(CheckoutState.BOOKED, CheckoutState.PAID)).toBe(false);
            expect(isValidTransition(CheckoutState.PAYMENT_CREATED, CheckoutState.INITIATED)).toBe(false);
        });

        it('rejeita transições de estados terminais para outros estados (exceto BOOKED→CANCELED)', () => {
            expect(isValidTransition(CheckoutState.CANCELED, CheckoutState.HOLD_CREATED)).toBe(false);
            expect(isValidTransition(CheckoutState.EXPIRED, CheckoutState.INITIATED)).toBe(false);
            expect(isValidTransition(CheckoutState.FAILED, CheckoutState.HOLD_CREATED)).toBe(false);
            // BOOKED é "terminal" mas aceita cancelamento (políticas de reembolso)
            expect(isValidTransition(CheckoutState.BOOKED, CheckoutState.CANCELED)).toBe(true);
        });

        it('permite FAILED a partir de qualquer estado não-terminal', () => {
            expect(isValidTransition(CheckoutState.INITIATED, CheckoutState.FAILED)).toBe(true);
            expect(isValidTransition(CheckoutState.HOLD_CREATED, CheckoutState.FAILED)).toBe(true);
            expect(isValidTransition(CheckoutState.PAYMENT_CREATED, CheckoutState.FAILED)).toBe(true);
            expect(isValidTransition(CheckoutState.PAID, CheckoutState.FAILED)).toBe(true);
        });
    });

    describe('isTerminal', () => {
        it('marca BOOKED, CANCELED, EXPIRED, FAILED como terminais', () => {
            expect(isTerminal(CheckoutState.BOOKED)).toBe(true);
            expect(isTerminal(CheckoutState.CANCELED)).toBe(true);
            expect(isTerminal(CheckoutState.EXPIRED)).toBe(true);
            expect(isTerminal(CheckoutState.FAILED)).toBe(true);
        });

        it('estados intermediários não são terminais', () => {
            expect(isTerminal(CheckoutState.INITIATED)).toBe(false);
            expect(isTerminal(CheckoutState.HOLD_CREATED)).toBe(false);
            expect(isTerminal(CheckoutState.PAYMENT_CREATED)).toBe(false);
            expect(isTerminal(CheckoutState.PAID)).toBe(false);
        });
    });

    describe('consistência interna', () => {
        it('todo CheckoutState tem entrada no VALID_TRANSITIONS', () => {
            for (const state of Object.values(CheckoutState)) {
                expect(VALID_TRANSITIONS).toHaveProperty(state);
            }
        });

        it('TERMINAL_STATES + EXPIRABLE_STATES não se sobrepõem (semanticamente)', () => {
            for (const exp of EXPIRABLE_STATES) {
                expect(TERMINAL_STATES).not.toContain(exp);
            }
        });

        it('TERMINAL_STATES tem transições vazias (exceto BOOKED→CANCELED)', () => {
            for (const term of TERMINAL_STATES) {
                if (term === CheckoutState.BOOKED) continue; // exceção: refund
                expect(VALID_TRANSITIONS[term]).toEqual([]);
            }
        });
    });
});
