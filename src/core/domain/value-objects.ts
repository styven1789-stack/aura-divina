/**
 * Value Objects — inmutables, validados en construcción.
 */

import { InvalidPhoneException } from './errors';

export class Money {
  private constructor(public readonly amount: number, public readonly currency: 'COP' = 'COP') {}
  static cop(amount: number) {
    if (!Number.isFinite(amount) || amount < 0) throw new Error('Monto inválido');
    return new Money(Math.round(amount));
  }
  add(other: Money) { return Money.cop(this.amount + other.amount); }
  multiply(qty: number) { return Money.cop(this.amount * qty); }
  toString() {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(this.amount);
  }
}

export class PhoneCO {
  private constructor(public readonly value: string) {}
  static of(raw: string) {
    const digits = raw.replace(/\D/g, '');
    if (digits.length !== 10 || !digits.startsWith('3')) throw new InvalidPhoneException();
    return new PhoneCO(digits);
  }
  whatsappLink(message: string) {
    return `https://wa.me/57${this.value}?text=${encodeURIComponent(message)}`;
  }
}
