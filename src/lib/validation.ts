/**
 * Validators ligeros sin dependencias. Para reglas más complejas (e.g. CO phone)
 * se usa el value object PhoneCO del dominio.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function isStrongEnoughPassword(password: string): boolean {
  return typeof password === 'string' && password.length >= 8;
}
