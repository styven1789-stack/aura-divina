'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { PublicUser } from '@/core/domain/user';
import { useToast } from '@/components/ui/Toast';

export default function ProfileSection({ user, onChange }: { user: PublicUser; onChange: (u: PublicUser) => void }) {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? '');
  const [saving, setSaving] = useState(false);

  const dirty = name !== user.name || phone !== (user.phone ?? '');

  const save = async () => {
    setSaving(true);
    try {
      const r = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.message || 'No se pudo actualizar');
      onChange(data.user);
      router.refresh();
      toast.success('Perfil actualizado');
    } catch (err) {
      toast.error('Error', (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card-soft p-6 max-w-xl">
      <div className="flex items-center gap-4 mb-6">
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt=""
            width={64}
            height={64}
            className="w-16 h-16 rounded-full object-cover border border-rose-150"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-rose-100 border border-rose-150 grid place-items-center font-serif text-2xl text-gold-600">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-serif text-xl text-ink-900">{user.name}</p>
          <p className="text-xs text-ink-600">
            {user.provider === 'google' ? 'Cuenta vinculada con Google' : 'Cuenta con correo y contraseña'}
            {user.emailVerified ? ' · verificada' : ''}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="label-aura">Nombre completo</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input-aura" />
        </div>
        <div>
          <label className="label-aura">Celular</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-aura" placeholder="3XXXXXXXXX" />
        </div>
        <div>
          <label className="label-aura">Correo</label>
          <input value={user.email} readOnly className="input-aura opacity-60 cursor-not-allowed" />
        </div>
      </div>

      <button onClick={save} disabled={!dirty || saving} className="btn-gold mt-6 disabled:opacity-50">
        {saving ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </div>
  );
}
