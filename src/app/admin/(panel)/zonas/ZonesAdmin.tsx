'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CoverageZone } from '@/core/domain/coverage-zone';
import { formatCOP } from '@/lib/money';

export default function ZonesAdmin({ initial }: { initial: CoverageZone[] }) {
  const router = useRouter();
  const [zones, setZones] = useState(initial);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Partial<CoverageZone>>({
    city: 'Medellín',
    neighborhood: '',
    shippingCOP: 8000,
    estimatedDelivery: '24h',
    active: true,
  });

  const refresh = async () => {
    const r = await fetch('/api/zones');
    const d = await r.json();
    setZones(d.zones);
    router.refresh();
  };

  const create = async () => {
    await fetch('/api/zones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setCreating(false);
    setForm({ city: 'Medellín', neighborhood: '', shippingCOP: 8000, estimatedDelivery: '24h', active: true });
    await refresh();
  };

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar esta zona?')) return;
    await fetch(`/api/zones?id=${id}`, { method: 'DELETE' });
    setZones((zs) => zs.filter((z) => z.id !== id));
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="h-display text-4xl text-ink-900">Zonas de cobertura</h1>
          <p className="text-ink-700/70 mt-1">{zones.length} zonas configuradas para contraentrega</p>
        </div>
        <button onClick={() => setCreating((v) => !v)} className="btn-gold">+ Nueva zona</button>
      </div>

      {creating && (
        <div className="card-soft p-6 mb-6">
          <h2 className="font-serif text-2xl mb-4">Nueva zona de cobertura</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Ciudad"><input className="input-aura" value={form.city ?? ''} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
            <Field label="Barrio / Sector"><input className="input-aura" value={form.neighborhood ?? ''} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} /></Field>
            <Field label="Costo envío (COP)"><input type="number" className="input-aura" value={form.shippingCOP ?? 0} onChange={(e) => setForm({ ...form, shippingCOP: Number(e.target.value) })} /></Field>
            <Field label="Tiempo estimado"><input className="input-aura" value={form.estimatedDelivery ?? ''} onChange={(e) => setForm({ ...form, estimatedDelivery: e.target.value })} /></Field>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setCreating(false)} className="btn-ghost flex-1">Cancelar</button>
            <button onClick={create} className="btn-gold flex-1">Guardar zona</button>
          </div>
        </div>
      )}

      <div className="card-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-rose-100/50 text-left text-[10px] uppercase tracking-widest2 text-ink-700">
            <tr>
              <th className="px-4 py-3">Ciudad</th>
              <th>Barrio</th>
              <th>Envío</th>
              <th>Tiempo</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {zones.map((z) => (
              <tr key={z.id} className="border-t border-rose-150/60 hover:bg-rose-50/50">
                <td className="px-4 py-3">{z.city}</td>
                <td className="font-medium text-ink-900">{z.neighborhood}</td>
                <td>{formatCOP(z.shippingCOP)}</td>
                <td>{z.estimatedDelivery}</td>
                <td><span className={`chip ${z.active ? '' : 'opacity-50'}`}>{z.active ? 'Activa' : 'Inactiva'}</span></td>
                <td className="text-right pr-4">
                  <button onClick={() => remove(z.id)} className="text-xs uppercase tracking-widest text-rose-600 hover:text-rose-700">Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
