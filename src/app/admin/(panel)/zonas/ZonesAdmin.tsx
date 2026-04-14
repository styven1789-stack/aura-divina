'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CoverageZone } from '@/core/domain/coverage-zone';
import { formatCOP } from '@/lib/money';
import { useToast } from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';

const DEFAULT_FORM: Partial<CoverageZone> = {
  city: 'Medellín',
  neighborhood: '',
  shippingCOP: 8000,
  estimatedDelivery: '24h',
  active: true,
};

export default function ZonesAdmin({ initial }: { initial: CoverageZone[] }) {
  const router = useRouter();
  const toast = useToast();
  const [zones, setZones] = useState(initial);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<CoverageZone | null>(null);
  const [form, setForm] = useState<Partial<CoverageZone>>(DEFAULT_FORM);
  const [confirmDelete, setConfirmDelete] = useState<CoverageZone | null>(null);
  const [pendingActiveSave, setPendingActiveSave] = useState(false);
  const [pendingToggle, setPendingToggle] = useState<CoverageZone | null>(null);

  const formVisible = creating || !!editing;

  const openCreate = () => {
    setEditing(null);
    setForm(DEFAULT_FORM);
    setCreating(true);
  };

  const openEdit = (zone: CoverageZone) => {
    setCreating(false);
    setEditing(zone);
    setForm({ ...zone });
  };

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
    setForm(DEFAULT_FORM);
  };

  const persistCreate = async () => {
    if (!form.neighborhood) {
      toast.warning('Falta el barrio', 'Especifica el sector exacto.');
      return;
    }
    try {
      const r = await fetch('/api/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error('No se pudo crear');
      const { zone } = (await r.json()) as { zone: CoverageZone };
      setZones((zs) => [...zs, zone]);
      closeForm();
      router.refresh();
      toast.success('Zona creada', `${zone.neighborhood}, ${zone.city}`);
    } catch (err) {
      toast.error('Error', (err as Error).message);
    }
  };

  const persistEdit = async () => {
    if (!editing) return;
    if (!form.neighborhood) {
      toast.warning('Falta el barrio', 'Especifica el sector exacto.');
      return;
    }
    try {
      const r = await fetch(`/api/zones?id=${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!r.ok) {
        const body = (await r.json().catch(() => ({}))) as { message?: string };
        throw new Error(body.message || 'No se pudo actualizar');
      }
      const updated: CoverageZone = { ...editing, ...form } as CoverageZone;
      setZones((zs) => zs.map((z) => (z.id === editing.id ? updated : z)));
      closeForm();
      router.refresh();
      toast.success('Zona actualizada', `${updated.neighborhood}, ${updated.city}`);
    } catch (err) {
      toast.error('Error', (err as Error).message);
    }
  };

  const save = () => {
    if (editing) {
      const activeChanged = editing.active !== !!form.active;
      if (activeChanged) {
        setPendingActiveSave(true);
        return;
      }
      persistEdit();
    } else {
      persistCreate();
    }
  };

  const toggleActive = async (zone: CoverageZone) => {
    const nextActive = !zone.active;
    try {
      const r = await fetch(`/api/zones?id=${zone.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: nextActive }),
      });
      if (!r.ok) {
        const body = (await r.json().catch(() => ({}))) as { message?: string };
        throw new Error(body.message || 'No se pudo actualizar');
      }
      setZones((zs) => zs.map((z) => (z.id === zone.id ? { ...z, active: nextActive } : z)));
      router.refresh();
      toast.success(
        nextActive ? 'Zona activada' : 'Zona desactivada',
        `${zone.neighborhood}, ${zone.city}`,
      );
    } catch (err) {
      toast.error('Error', (err as Error).message);
    }
  };

  const remove = async (zone: CoverageZone) => {
    try {
      const r = await fetch(`/api/zones?id=${zone.id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('No se pudo eliminar');
      setZones((zs) => zs.filter((z) => z.id !== zone.id));
      router.refresh();
      toast.success('Zona eliminada', `${zone.neighborhood}, ${zone.city}`);
    } catch (err) {
      toast.error('Error', (err as Error).message);
    }
  };

  return (
    <div>
      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between mb-6 md:mb-8 gap-3">
        <div>
          <h1 className="h-display text-fluid-4xl text-ink-900">Zonas de cobertura</h1>
          <p className="text-ink-700/70 mt-1 text-fluid-sm">{zones.length} zonas configuradas para contraentrega</p>
        </div>
        <button onClick={() => (formVisible ? closeForm() : openCreate())} className="btn-gold w-full xs:w-auto">
          {formVisible ? 'Cerrar' : '+ Nueva zona'}
        </button>
      </div>

      {formVisible && (
        <div className="card-soft p-5 sm:p-6 mb-6">
          <h2 className="font-serif text-fluid-2xl mb-4">
            {editing ? `Editar zona · ${editing.neighborhood}` : 'Nueva zona de cobertura'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Ciudad">
              <input
                className="input-aura"
                value={form.city ?? ''}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </Field>
            <Field label="Barrio / Sector">
              <input
                className="input-aura"
                value={form.neighborhood ?? ''}
                onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
              />
            </Field>
            <Field label="Costo envío (COP)">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min="0"
                className="input-aura"
                value={form.shippingCOP ?? 0}
                onChange={(e) => setForm({ ...form, shippingCOP: Number(e.target.value) })}
              />
            </Field>
            <Field label="Tiempo estimado">
              <input
                className="input-aura"
                value={form.estimatedDelivery ?? ''}
                onChange={(e) => setForm({ ...form, estimatedDelivery: e.target.value })}
              />
            </Field>
            <Field label="Estado">
              <label className="inline-flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.active ?? true}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="w-4 h-4 accent-gold-500"
                />
                <span className="text-fluid-sm text-ink-700">
                  {form.active ? 'Activa (visible en checkout)' : 'Inactiva (oculta del checkout)'}
                </span>
              </label>
            </Field>
          </div>
          <div className="flex flex-col-reverse xs:flex-row gap-3 mt-6">
            <button onClick={closeForm} className="btn-ghost flex-1">
              Cancelar
            </button>
            <button onClick={save} className="btn-gold flex-1">
              {editing ? 'Guardar cambios' : 'Guardar zona'}
            </button>
          </div>
        </div>
      )}

      {/* Card view móvil */}
      <ul className="md:hidden grid gap-3">
        {zones.map((z) => (
          <li key={z.id} className="card-soft p-4 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 items-center">
            <div className="min-w-0">
              <p className="font-medium text-ink-900">{z.neighborhood}</p>
              <p className="text-fluid-xs text-ink-600">{z.city}</p>
            </div>
            <button
              onClick={() => setPendingToggle(z)}
              title={z.active ? 'Click para desactivar' : 'Click para activar'}
              className={`text-fluid-xs uppercase tracking-widest px-3 py-1.5 rounded-full border transition tap-target ${
                z.active
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200'
                  : 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200 opacity-80'
              }`}
            >
              {z.active ? 'Activa' : 'Inactiva'}
            </button>
            <div className="col-span-2 flex flex-wrap gap-2 text-fluid-xs">
              <span className="chip">{formatCOP(z.shippingCOP)}</span>
              <span className="chip">{z.estimatedDelivery}</span>
            </div>
            <div className="col-span-2 flex gap-3 mt-1">
              <button
                onClick={() => openEdit(z)}
                className="text-fluid-xs uppercase tracking-widest text-gold-600 hover:text-gold-700 py-2"
              >
                Editar
              </button>
              <button
                onClick={() => setConfirmDelete(z)}
                className="text-fluid-xs uppercase tracking-widest text-rose-600 hover:text-rose-700 py-2"
              >
                Borrar
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Tabla md+ */}
      <div className="hidden md:block card-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-fluid-sm min-w-[640px]">
            <thead className="bg-rose-100/50 text-left text-fluid-xs uppercase tracking-widest2 text-ink-700">
              <tr>
                <th className="px-4 py-3">Ciudad</th>
                <th>Barrio</th>
                <th>Envío</th>
                <th>Tiempo</th>
                <th>Estado</th>
                <th className="text-right pr-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((z) => (
                <tr key={z.id} className="border-t border-rose-150/60 hover:bg-rose-50/50">
                  <td className="px-4 py-3">{z.city}</td>
                  <td className="font-medium text-ink-900">{z.neighborhood}</td>
                  <td>{formatCOP(z.shippingCOP)}</td>
                  <td>{z.estimatedDelivery}</td>
                  <td>
                    <button
                      onClick={() => setPendingToggle(z)}
                      title={z.active ? 'Click para desactivar' : 'Click para activar'}
                      className={`text-fluid-xs uppercase tracking-widest px-3 py-1.5 rounded-full border transition ${
                        z.active
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200 opacity-80'
                      }`}
                    >
                      {z.active ? 'Activa' : 'Inactiva'}
                    </button>
                  </td>
                  <td className="text-right pr-4 whitespace-nowrap">
                    <button
                      onClick={() => openEdit(z)}
                      className="text-fluid-xs uppercase tracking-widest text-gold-600 hover:text-gold-700 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setConfirmDelete(z)}
                      className="text-fluid-xs uppercase tracking-widest text-rose-600 hover:text-rose-700"
                    >
                      Borrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        open={!!confirmDelete}
        title="¿Eliminar zona de cobertura?"
        description={
          confirmDelete
            ? `"${confirmDelete.neighborhood}, ${confirmDelete.city}" dejará de estar disponible para nuevos pedidos.`
            : ''
        }
        confirmLabel="Sí, eliminar"
        variant="danger"
        onConfirm={async () => {
          if (confirmDelete) await remove(confirmDelete);
        }}
        onClose={() => setConfirmDelete(null)}
      />

      <ConfirmModal
        open={!!pendingToggle}
        title={pendingToggle?.active ? '¿Desactivar zona?' : '¿Activar zona?'}
        description={
          pendingToggle
            ? pendingToggle.active
              ? `"${pendingToggle.neighborhood}, ${pendingToggle.city}" se ocultará del checkout y no estará disponible para nuevos pedidos. Los pedidos ya creados no se ven afectados.`
              : `"${pendingToggle.neighborhood}, ${pendingToggle.city}" volverá a aparecer en el checkout para nuevos pedidos.`
            : ''
        }
        variant={pendingToggle?.active ? 'warning' : 'info'}
        confirmLabel={pendingToggle?.active ? 'Desactivar' : 'Activar'}
        cancelLabel="Volver"
        onConfirm={async () => {
          if (pendingToggle) await toggleActive(pendingToggle);
        }}
        onClose={() => setPendingToggle(null)}
      />

      <ConfirmModal
        open={pendingActiveSave}
        title={form.active ? '¿Activar zona?' : '¿Desactivar zona?'}
        description={
          form.active
            ? `"${form.neighborhood}, ${form.city}" volverá a aparecer en el checkout. Los clientes podrán seleccionar esta zona para nuevos pedidos.`
            : `"${form.neighborhood}, ${form.city}" se ocultará del checkout y no estará disponible para nuevos pedidos. Los pedidos ya creados no se ven afectados.`
        }
        variant={form.active ? 'info' : 'warning'}
        confirmLabel={form.active ? 'Activar y guardar' : 'Desactivar y guardar'}
        cancelLabel="Volver"
        onConfirm={async () => {
          await persistEdit();
        }}
        onClose={() => setPendingActiveSave(false)}
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
