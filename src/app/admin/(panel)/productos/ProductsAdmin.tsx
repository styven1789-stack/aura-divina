'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Product } from '@/core/domain/product';
import { formatCOP } from '@/lib/money';
import { useToast, useEscape } from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';

type FilterMode = 'all' | 'active' | 'lowStock' | 'inactive';

export default function ProductsAdmin({
  initial,
  initialFilter = 'all',
  autoNew = false,
}: {
  initial: Product[];
  initialFilter?: FilterMode;
  autoNew?: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [items, setItems] = useState<Product[]>(initial);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(autoNew);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterMode>(initialFilter);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  useEffect(() => { setFilter(initialFilter); }, [initialFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((p) => {
      const totalStock = p.variants.reduce((s, v) => s + v.stock, 0);
      if (filter === 'active' && !p.active) return false;
      if (filter === 'inactive' && p.active) return false;
      if (filter === 'lowStock' && !p.variants.some((v) => v.stock < 5)) return false;
      if (q && !(
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        String(totalStock).includes(q)
      )) return false;
      return true;
    });
  }, [items, search, filter]);

  const counts = useMemo(() => ({
    all: items.length,
    active: items.filter((p) => p.active).length,
    inactive: items.filter((p) => !p.active).length,
    lowStock: items.filter((p) => p.variants.some((v) => v.stock < 5)).length,
  }), [items]);

  const refresh = async () => {
    const r = await fetch('/api/products');
    const d = await r.json();
    setItems(d.products);
    router.refresh();
  };

  const onSave = async (p: Partial<Product>) => {
    try {
      if (editing) {
        const r = await fetch(`/api/products/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p),
        });
        if (!r.ok) throw new Error('No se pudo guardar');
        toast.success('Producto actualizado', p.name);
      } else {
        const r = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p),
        });
        if (!r.ok) throw new Error('No se pudo crear');
        toast.success('Producto creado', `${p.name} ya está en el catálogo`);
      }
      setEditing(null);
      setCreating(false);
      await refresh();
    } catch (err) {
      toast.error('Error', (err as Error).message);
    }
  };

  const onDelete = async (p: Product) => {
    try {
      await fetch(`/api/products/${p.id}`, { method: 'DELETE' });
      toast.success('Producto eliminado', p.name);
      await refresh();
    } catch (err) {
      toast.error('Error', (err as Error).message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="h-display text-4xl text-ink-900">Productos</h1>
          <p className="text-ink-700/70 mt-1 text-sm">{counts.all} productos · {counts.active} activos · {counts.lowStock} con stock bajo</p>
        </div>
        <button onClick={() => setCreating(true)} className="btn-gold">+ Nuevo producto</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, categoría o slug…"
            className="input-aura !pl-11"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-600">
            <SearchIcon />
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Chip active={filter === 'all'} onClick={() => setFilter('all')}>Todos · {counts.all}</Chip>
        <Chip active={filter === 'active'} onClick={() => setFilter('active')}>Activos · {counts.active}</Chip>
        <Chip active={filter === 'inactive'} onClick={() => setFilter('inactive')}>Inactivos · {counts.inactive}</Chip>
        <Chip active={filter === 'lowStock'} onClick={() => setFilter('lowStock')} accent="warn">⚠️ Stock bajo · {counts.lowStock}</Chip>
      </div>

      {filtered.length === 0 ? (
        <div className="card-soft p-16 text-center">
          <div className="text-4xl mb-2">🔎</div>
          <p className="text-ink-600">No se encontraron productos con estos filtros.</p>
          <button onClick={() => { setSearch(''); setFilter('all'); }} className="btn-ghost mt-4">Limpiar filtros</button>
        </div>
      ) : (
        <div className="card-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-rose-100/50 text-left text-[10px] uppercase tracking-widest2 text-ink-700">
                <tr>
                  <th className="px-4 py-3">Imagen</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock total</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const stock = p.variants.reduce((s, v) => s + v.stock, 0);
                  const low = stock < 5;
                  return (
                    <tr key={p.id} className="border-t border-rose-150/60 hover:bg-rose-50/50">
                      <td className="px-4 py-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-rose-100">
                          <Image
                            src={p.images[0]}
                            alt=""
                            fill
                            sizes="48px"
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                      </td>
                      <td className="font-medium text-ink-900">
                        <div>{p.name}</div>
                        <div className="text-[11px] text-ink-600 font-mono">{p.slug}</div>
                      </td>
                      <td className="capitalize">{p.category}</td>
                      <td>{formatCOP(p.priceCOP)}</td>
                      <td>
                        <span className={low ? 'text-amber-700 font-semibold' : ''}>
                          {stock}
                          {low && <span className="ml-1.5 text-[10px] uppercase">⚠</span>}
                        </span>
                      </td>
                      <td>
                        <span className={`chip ${p.active ? '' : 'opacity-50'}`}>
                          {p.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="text-right pr-4 py-3 space-x-3 whitespace-nowrap">
                        <button onClick={() => setEditing(p)} className="text-xs uppercase tracking-widest text-gold-600 hover:text-gold-700">Editar</button>
                        <button onClick={() => setConfirmDelete(p)} className="text-xs uppercase tracking-widest text-rose-600 hover:text-rose-700">Borrar</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(editing || creating) && (
        <ProductForm
          initial={editing ?? undefined}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSave={onSave}
        />
      )}

      <ConfirmModal
        open={!!confirmDelete}
        title="¿Eliminar producto?"
        description={confirmDelete ? `"${confirmDelete.name}" será eliminado del catálogo. Esta acción no puede deshacerse.` : ''}
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={async () => {
          if (confirmDelete) await onDelete(confirmDelete);
        }}
        onClose={() => setConfirmDelete(null)}
      />
    </div>
  );
}

function ProductForm({
  initial,
  onClose,
  onSave,
}: {
  initial?: Product;
  onClose: () => void;
  onSave: (p: Partial<Product>) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<Product>>(
    initial ?? {
      name: '',
      slug: '',
      category: 'anillos',
      shortDescription: '',
      description: '',
      priceCOP: 0,
      images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=80'],
      tags: [],
      active: true,
      featured: false,
    },
  );
  const [saving, setSaving] = useState(false);
  useEscape(true, onClose);

  // Auto-slug a partir del nombre cuando se está creando
  useEffect(() => {
    if (initial || !form.name) return;
    const slug = form.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    setForm((f) => ({ ...f, slug }));
  }, [form.name, initial]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] bg-ink-900/60 backdrop-blur-sm grid place-items-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-rose-50 rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <h2 className="font-serif text-2xl text-ink-900">{initial ? 'Editar producto' : 'Nuevo producto'}</h2>
          <button onClick={onClose} className="btn-ghost !py-2 !px-4">×</button>
        </div>
        <div className="space-y-4">
          <Field label="Nombre"><input className="input-aura" value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Slug (url)"><input className="input-aura font-mono text-sm" value={form.slug ?? ''} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="anillo-aurora" /></Field>
          <Field label="Categoría">
            <select className="input-aura" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Product['category'] })}>
              <option value="anillos">Anillos</option>
              <option value="collares">Collares</option>
              <option value="aretes">Aretes</option>
              <option value="pulseras">Pulseras</option>
              <option value="sets">Sets</option>
            </select>
          </Field>
          <Field label="Descripción corta"><input className="input-aura" value={form.shortDescription ?? ''} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} /></Field>
          <Field label="Descripción larga"><textarea className="input-aura" rows={4} value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Precio (COP)"><input type="number" className="input-aura" value={form.priceCOP ?? 0} onChange={(e) => setForm({ ...form, priceCOP: Number(e.target.value) })} /></Field>
            <Field label="Precio antes (opcional)"><input type="number" className="input-aura" value={form.compareAtPriceCOP ?? ''} onChange={(e) => setForm({ ...form, compareAtPriceCOP: e.target.value ? Number(e.target.value) : undefined })} /></Field>
          </div>
          <Field label="Imagen URL"><input className="input-aura" value={form.images?.[0] ?? ''} onChange={(e) => setForm({ ...form, images: [e.target.value] })} /></Field>
          {form.images?.[0] && (
            <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-rose-100 border border-rose-150">
              <Image
                src={form.images[0]}
                alt="preview"
                fill
                sizes="128px"
                unoptimized
                className="object-cover"
              />
            </div>
          )}
          <div className="flex gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Activo</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Destacado</label>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="btn-ghost flex-1">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="btn-gold flex-1 disabled:opacity-50">
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
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

function Chip({
  active, onClick, accent, children,
}: { active: boolean; onClick: () => void; accent?: 'warn'; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={
        'text-xs uppercase tracking-widest px-4 py-2 rounded-full border transition ' +
        (active
          ? accent === 'warn'
            ? 'bg-amber-500 text-white border-amber-500'
            : 'bg-ink-900 text-white border-ink-900'
          : 'bg-white text-ink-700 border-rose-150 hover:border-gold-500')
      }
    >
      {children}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
    </svg>
  );
}
