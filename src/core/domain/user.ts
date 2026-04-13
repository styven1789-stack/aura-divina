/**
 * User aggregate — cliente registrado de Aura Divina.
 *
 * Dos proveedores de autenticación:
 *  - credentials: email + password hasheado con scrypt.
 *  - google: vinculado por googleId; passwordHash puede ser undefined.
 *
 * Un mismo usuario puede estar vinculado a ambos (login por credentials +
 * luego Google con el mismo email → se mergea googleId).
 */

export type AuthProvider = 'credentials' | 'google';

export interface SavedAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  email?: string;
  city: string;
  neighborhood: string;
  postalCode?: string;
  addressLine1: string;
  addressLine2?: string;
  reference?: string;
  notes?: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  phone?: string;
  avatarUrl?: string;
  provider: AuthProvider;
  googleId?: string;
  passwordHash?: string;
  addresses: SavedAddress[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  provider: AuthProvider;
  hasPassword: boolean;
  addresses: SavedAddress[];
  createdAt: string;
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    emailVerified: user.emailVerified,
    provider: user.provider,
    hasPassword: !!user.passwordHash,
    addresses: user.addresses,
    createdAt: user.createdAt,
  };
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
