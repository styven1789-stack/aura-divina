'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Product } from '@/core/domain/product';
import { formatCOP } from '@/lib/money';

export default function ProductsAdmin({ initial }: { initial: Product[] }) {
  const router = useRouter();
  const [items, setItems] = useState<Product[]>(initial);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  const refresh = async () => {
    const r = await fetch('/api/products');
    const d = await r.json();
    setItems(d.products);
    router.refresh();
  };

  const onSave = async (p: Partial<Product>) => {
    if (editing) {
      await fetch(`/api/products/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p),
      });
    } else {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p),
      });
    }
    setEditing(null);
    setCreating(false);
    await refresh();
  };

  const onDelete = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    await refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="h-display text-4xl text-ink-900">Productos</h1>
          <p className="text-ink-700/70 mt-1">{items.length} productos en catálogo</p>
        </div>
        <button onClick={() => setCreating(true)} className="btn-gold">+ Nuevo producto</button>
      </div>

      <div className="card-soft overflow-hidden">
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
            {items.map((p) => {
              const stock = p.variants.reduce((s, v) => s + v.stock, 0);
              return (
                <tr key={p.id} className="border-t border-rose-150/60 hover:bg-rose-50/50">
                  <td className="px-4 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover" />
                  </td>
                  <td className="font-medium text-ink-900">{p.name}</td>
                  <td className="capitalize">{p.category}</td>
                  <td>{formatCOP(p.priceCOP)}</td>
                  <td className={stock < 5 ? 'text-amber-700 font-semibold' : ''}>{stock}</td>
                  <td>
                    <span className={`chip ${p.active ? '' : 'opacity-50'}`}>
                      {p.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="text-right pr-4 py-3 space-x-2">
                    <button onClick={() => setEditing(p)} className="text-xs uppercase tracking-widest text-gold-600 hover:text-gold-700">Editar</button>
                    <button onClick={() => onDelete(p.id)} className="text-xs uppercase tracking-widest text-rose-600 hover:text-rose-700">Borrar</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {(editing || creating) && (
        <ProductForm
          initial={editing ?? undefined}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSave={onSave}
        />
      )}
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

  return (
    <div className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-rose-50 rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="font-serif text-2xl text-ink-900 mb-6">{initial ? 'Editar producto' : 'Nuevo producto'}</h2>
        <div className="space-y-4">
          <Field label="Nombre"><input className="input-aura" value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Slug (url)"><input className="input-aura" value={form.slug ?? ''} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="anillo-aurora" /></Field>
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
          <div className="flex gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Activo</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Destacado</label>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="btn-ghost flex-1">Cancelar</button>
          <button onClick={() => onSave(form)} className="btn-gold flex-1">Guardar</button>
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
