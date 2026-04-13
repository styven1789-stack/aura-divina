/**
 * Handlers para el dashboard /cuenta — perfil y libreta de direcciones.
 *
 * Todos operan sobre el agregado User dentro de una UoW atómica.
 * Errores tipados: UserNotFoundException, AddressNotFoundException.
 */

import type { UnitOfWork } from '../ports/unit-of-work';
import type { SavedAddress, User } from '@/core/domain/user';
import { UserNotFoundException, AddressNotFoundException } from '@/core/domain/errors';

// #region types

export interface UpdateProfileCommand {
  userId: string;
  name?: string;
  phone?: string;
}

export interface AddAddressCommand {
  userId: string;
  data: Omit<SavedAddress, 'id' | 'isDefault'> & { isDefault?: boolean };
}

export interface UpdateAddressCommand {
  userId: string;
  addressId: string;
  data: Partial<Omit<SavedAddress, 'id'>>;
}

export interface RemoveAddressCommand {
  userId: string;
  addressId: string;
}

export interface SetDefaultAddressCommand {
  userId: string;
  addressId: string;
}

// #endregion

export class AccountCommandHandlers {
  /**
   * @param uow Unit of Work — atomiza cada operación sobre el agregado User.
   */
  constructor(private readonly uow: UnitOfWork) {}

  /** /// <inheritdoc /> */
  async updateProfile(cmd: UpdateProfileCommand): Promise<User> {
    return this.uow.run(async (tx) => {
      const user = await tx.users.findById(cmd.userId);
      if (!user) throw new UserNotFoundException();
      if (cmd.name !== undefined) user.name = cmd.name.trim();
      if (cmd.phone !== undefined) user.phone = cmd.phone.trim() || undefined;
      user.updatedAt = new Date().toISOString();
      await tx.users.save(user);
      return user;
    });
  }

  /** /// <inheritdoc /> */
  async addAddress(cmd: AddAddressCommand): Promise<User> {
    return this.uow.run(async (tx) => {
      const user = await tx.users.findById(cmd.userId);
      if (!user) throw new UserNotFoundException();
      const isDefault = cmd.data.isDefault ?? user.addresses.length === 0;
      const address: SavedAddress = {
        id: addressId(),
        label: cmd.data.label,
        fullName: cmd.data.fullName,
        phone: cmd.data.phone,
        email: cmd.data.email,
        city: cmd.data.city,
        neighborhood: cmd.data.neighborhood,
        postalCode: cmd.data.postalCode,
        addressLine1: cmd.data.addressLine1,
        addressLine2: cmd.data.addressLine2,
        reference: cmd.data.reference,
        notes: cmd.data.notes,
        isDefault,
      };
      if (isDefault) {
        for (const a of user.addresses) a.isDefault = false;
      }
      user.addresses.push(address);
      user.updatedAt = new Date().toISOString();
      await tx.users.save(user);
      return user;
    });
  }

  /** /// <inheritdoc /> */
  async updateAddress(cmd: UpdateAddressCommand): Promise<User> {
    return this.uow.run(async (tx) => {
      const user = await tx.users.findById(cmd.userId);
      if (!user) throw new UserNotFoundException();
      const target = user.addresses.find((a) => a.id === cmd.addressId);
      if (!target) throw new AddressNotFoundException();
      Object.assign(target, cmd.data, { id: target.id });
      user.updatedAt = new Date().toISOString();
      await tx.users.save(user);
      return user;
    });
  }

  /** /// <inheritdoc /> */
  async removeAddress(cmd: RemoveAddressCommand): Promise<User> {
    return this.uow.run(async (tx) => {
      const user = await tx.users.findById(cmd.userId);
      if (!user) throw new UserNotFoundException();
      const wasDefault = user.addresses.find((a) => a.id === cmd.addressId)?.isDefault;
      user.addresses = user.addresses.filter((a) => a.id !== cmd.addressId);
      if (wasDefault && user.addresses.length > 0) user.addresses[0].isDefault = true;
      user.updatedAt = new Date().toISOString();
      await tx.users.save(user);
      return user;
    });
  }

  /** /// <inheritdoc /> */
  async setDefaultAddress(cmd: SetDefaultAddressCommand): Promise<User> {
    return this.uow.run(async (tx) => {
      const user = await tx.users.findById(cmd.userId);
      if (!user) throw new UserNotFoundException();
      const target = user.addresses.find((a) => a.id === cmd.addressId);
      if (!target) throw new AddressNotFoundException();
      for (const a of user.addresses) a.isDefault = a.id === cmd.addressId;
      user.updatedAt = new Date().toISOString();
      await tx.users.save(user);
      return user;
    });
  }
}

/** Genera un id corto para las direcciones. */
function addressId(): string {
  return `addr_${globalThis.crypto?.randomUUID?.().slice(0, 12) ?? Date.now().toString(36)}`;
}
