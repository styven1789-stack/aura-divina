'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PublicUser, SavedAddress } from '@/core/domain/user';
import { useToast } from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';

type AddressForm = Omit<SavedAddress, 'id' | 'isDefault'> & { isDefault?: boolean };

const EMPTY_FORM: AddressForm = {
  label: 'Casa',
  fullName: '',
  phone: '',
  email: '',
  city: 'Medellín',
  neighborhood: '',
  postalCode: '',
  addressLine1: '',
  addressLine2: '',
  reference: '',
  notes: '',
  isDefault: false,
};

export default function AddressesSection({ user, onChange }: { user: PublicUser; onChange: (u: PublicUser) => void }) {
  const router = useRouter();
  const toast = useToast();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState<SavedAddress | null>(null);

  const formVisible = creating || !!editingId;

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, fullName: user.name, phone: user.phone ?? '', email: user.email });
    setCreating(true);
  };

  const openEdit = (a: SavedAddress) => {
    setCreating(false);
    setEditingId(a.id);
    setForm({
      label: a.label,
      fullName: a.fullName,
      phone: a.phone,
      email: a.email ?? '',
      city: a.city,
      neighborhood: a.neighborhood,
      postalCode: a.postalCode ?? '',
      addressLine1: a.addressLine1,
      addressLine2: a.addressLine2 ?? '',
      reference: a.reference ?? '',
      notes: a.notes ?? '',
      isDefault: a.isDefault,
    });
  };

  const closeForm = () => {
    setCreating(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const refreshUser = (u: PublicUser) => {
    onChange(u);
    router.refresh();
  };

  const save = async () => {
    if (!form.fullName || !form.phone || !form.addressLine1 || !form.neighborhood || !form.city) {
      toast.warning('Faltan datos', 'Completa nombre, celular, ciudad, barrio y dirección.');
      return;
    }
    try {
      const url = editingId ? `/api/account/addresses/${editingId}` : '/api/account/addresses';
      const method = editingId ? 'PATCH' : 'POST';
      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.message || 'No se pudo guardar');
      refreshUser(data.user);
      closeForm();
      toast.success(editingId ? 'Dirección actualizada' : 'Dirección guardada');
    } catch (err) {
      toast.error('Error', (err as Error).message);
    }
  };

  const remove = async (a: SavedAddress) => {
    try {
      const r = await fetch(`/api/account/addresses/${a.id}`, { method: 'DELETE' });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.message || 'No se pudo eliminar');
      refreshUser(data.user);
      toast.success('Dirección eliminada');
    } catch (err) {
      toast.error('Error', (err as Error).message);
    }
  };

  const setDefault = async (a: SavedAddress) => {
    try {
      const r = await fetch(`/api/account/addresses/${a.id}/default`, { method: 'POST' });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.message || 'No se pudo actualizar');
      refreshUser(data.user);
      toast.success('Dirección predeterminada actualizada');
    } catch (err) {
      toast.error('Error', (err as Error).message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-ink-700/70 text-sm">{user.addresses.length} direcciones guardadas</p>
        <button onClick={() => (formVisible ? closeForm() : openCreate())} className="btn-gold">
          {formVisible ? 'Cerrar' : '+ Nueva dirección'}
        </button>
      </div>

      {formVisible && (
        <div className="card-soft p-6 mb-6">
          <h3 className="font-serif text-xl mb-4">
            {editingId ? 'Editar dirección' : 'Nueva dirección'}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Etiqueta">
              <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="input-aura" placeholder="Casa, Oficina…" />
            </Field>
            <Field label="Nombre del destinatario">
              <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input-aura" />
            </Field>
            <Field label="Celular">
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-aura" placeholder="3XXXXXXXXX" />
            </Field>
            <Field label="Correo (opcional)">
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-aura" type="email" />
            </Field>
            <Field label="Ciudad">
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-aura" />
            </Field>
            <Field label="Barrio / Sector">
              <input value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} className="input-aura" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Dirección">
                <input value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} className="input-aura" placeholder="Cra 43A # 5 - 50" />
              </Field>
            </div>
            <Field label="Referencia">
              <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} className="input-aura" placeholder="Torre, apto, color…" />
            </Field>
            <Field label="Notas para el repartidor">
              <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-aura" />
            </Field>
            <div className="sm:col-span-2">
              <label className="inline-flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={!!form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="w-4 h-4 accent-gold-500" />
                <span className="text-sm text-ink-700">Usar como dirección predeterminada</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={closeForm} className="btn-ghost flex-1">Cancelar</button>
            <button onClick={save} className="btn-gold flex-1">{editingId ? 'Guardar cambios' : 'Guardar dirección'}</button>
          </div>
        </div>
      )}

      {user.addresses.length === 0 ? (
        <div className="card-soft p-12 text-center text-ink-600">
          Aún no tienes direcciones guardadas. Crea una para agilizar el checkout.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {user.addresses.map((a) => (
            <div key={a.id} className="card-soft p-5 flex flex-col">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest2 text-gold-600">{a.label}</p>
                  <p className="font-serif text-lg text-ink-900">{a.fullName}</p>
                </div>
                {a.isDefault && (
                  <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Predeterminada
                  </span>
                )}
              </div>
              <p className="text-sm text-ink-700 mt-2">{a.addressLine1}</p>
              <p className="text-sm text-ink-700">{a.neighborhood}, {a.city}</p>
              {a.reference && <p className="text-xs text-ink-600 mt-1">Ref: {a.reference}</p>}
              <p className="text-xs text-ink-600 mt-1 font-mono">{a.phone}</p>

              <div className="flex gap-2 mt-4 flex-wrap">
                {!a.isDefault && (
                  <button onClick={() => setDefault(a)} className="text-[10px] uppercase tracking-widest text-gold-600 hover:text-gold-700">
                    Marcar predeterminada
                  </button>
                )}
                <button onClick={() => openEdit(a)} className="text-[10px] uppercase tracking-widest text-ink-700 hover:text-gold-600">
                  Editar
                </button>
                <button onClick={() => setConfirmDelete(a)} className="text-[10px] uppercase tracking-widest text-rose-600 hover:text-rose-700">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!confirmDelete}
        title="¿Eliminar dirección?"
        description={confirmDelete ? `"${confirmDelete.label} · ${confirmDelete.addressLine1}" se eliminará de tu libreta.` : ''}
        variant="danger"
        confirmLabel="Eliminar"
        cancelLabel="Volver"
        onConfirm={async () => {
          if (confirmDelete) await remove(confirmDelete);
        }}
        onClose={() => setConfirmDelete(null)}
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label-aura">{label}</label>
      {children}
    </div>
  );
}
