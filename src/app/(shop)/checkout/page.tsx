'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/store/cart.store';
import { formatCOP } from '@/lib/money';
import { useToast } from '@/components/ui/Toast';
import type { PublicUser, SavedAddress } from '@/core/domain/user';

interface CoverageZone {
  id: string;
  city: string;
  neighborhood: string;
  shippingCOP: number;
  estimatedDelivery: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const toast = useToast();
  const lines = useCart((s) => s.lines);
  const subtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);

  const [zones, setZones] = useState<CoverageZone[]>([]);
  const [city, setCity] = useState('Medellín');
  const [neighborhood, setNeighborhood] = useState('');
  const [coverage, setCoverage] = useState<CoverageZone | null>(null);
  const [coverageError, setCoverageError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    reference: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<{ code: string; whatsappDeepLink: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState<PublicUser | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [saveAddress, setSaveAddress] = useState(false);

  // Cargar zonas para selector inteligente
  useEffect(() => {
    fetch('/api/zones')
      .then((r) => r.json())
      .then((data) => setZones(data.zones ?? []));
  }, []);

  // Cargar sesión del usuario y prefillar con dirección predeterminada si existe
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data: { user: PublicUser | null }) => {
        if (!data.user) return;
        setUser(data.user);
        const def = data.user.addresses.find((a) => a.isDefault) ?? data.user.addresses[0];
        if (def) {
          applyAddress(def);
          setSelectedAddressId(def.id);
        } else {
          setForm((f) => ({
            ...f,
            fullName: data.user!.name,
            phone: data.user!.phone ?? '',
            email: data.user!.email,
          }));
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyAddress = (a: SavedAddress) => {
    setForm({
      fullName: a.fullName,
      phone: a.phone,
      email: a.email ?? '',
      addressLine1: a.addressLine1,
      addressLine2: a.addressLine2 ?? '',
      reference: a.reference ?? '',
      notes: a.notes ?? '',
    });
    setCity(a.city);
    setNeighborhood(a.neighborhood);
  };

  const cityOptions = useMemo(() => Array.from(new Set(zones.map((z) => z.city))), [zones]);
  const neighborhoodOptions = useMemo(
    () => zones.filter((z) => z.city === city).map((z) => z.neighborhood),
    [zones, city],
  );

  // Validar cobertura cuando cambien city/neighborhood
  useEffect(() => {
    if (!city || !neighborhood) {
      setCoverage(null);
      setCoverageError(null);
      return;
    }
    setValidating(true);
    fetch('/api/zones/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city, neighborhood }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.zone) {
          setCoverage(data.zone);
          setCoverageError(null);
        } else {
          setCoverage(null);
          setCoverageError('Aún no entregamos en esta zona. Te avisaremos cuando expandamos cobertura.');
        }
      })
      .finally(() => setValidating(false));
  }, [city, neighborhood]);

  const total = subtotal + (coverage?.shippingCOP ?? 0);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverage) {
      setError('Debes seleccionar una zona con cobertura.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: lines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId,
            quantity: l.quantity,
          })),
          shipping: { ...form, city, neighborhood },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? 'Error al crear el pedido');

      if (user && saveAddress) {
        try {
          await fetch('/api/account/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              label: 'Checkout',
              fullName: form.fullName,
              phone: form.phone,
              email: form.email,
              city,
              neighborhood,
              addressLine1: form.addressLine1,
              addressLine2: form.addressLine2,
              reference: form.reference,
              notes: form.notes,
              isDefault: user.addresses.length === 0,
            }),
          });
        } catch {
          // no bloquea el éxito del pedido
        }
      }

      setOrderResult({ code: data.order.code, whatsappDeepLink: data.whatsappDeepLink });
      clear();
      toast.success('¡Pedido recibido!', `Código ${data.order.code}`);
    } catch (err: unknown) {
      const message = (err as Error).message;
      setError(message);
      toast.error('No se pudo crear el pedido', message);
    } finally {
      setSubmitting(false);
    }
  };

  if (orderResult) {
    return (
      <section className="container-aura py-20 max-w-2xl">
        <div className="card-soft p-10 text-center animate-in zoom-in-95">
          <div className="text-6xl mb-4 animate-pulse">🎉</div>
          <h1 className="h-display text-4xl text-ink-900">¡Pedido recibido!</h1>
          <p className="mt-3 text-ink-700/80">
            Tu pedido <span className="font-semibold text-gold-600 font-mono">{orderResult.code}</span> está pendiente de confirmación.
          </p>
          <p className="mt-2 text-sm text-ink-600">
            <strong>Paso 1:</strong> Confírmanos por WhatsApp para preparar tu envío contraentrega.
          </p>
          <a
            href={orderResult.whatsappDeepLink}
            target="_blank"
            rel="noreferrer"
            className="btn-gold mt-8 inline-flex"
          >
            <WhatsappIcon /> Confirmar por WhatsApp
          </a>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/pedido/${orderResult.code}`} className="btn-ghost">
              Ver estado del pedido →
            </Link>
            <Link href="/productos" className="text-sm uppercase tracking-widest text-ink-600 hover:text-gold-600 self-center">
              Seguir comprando
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (lines.length === 0) {
    return (
      <section className="container-aura py-24 text-center">
        <h1 className="h-display text-4xl">Tu carrito está vacío</h1>
        <Link href="/productos" className="btn-gold mt-6 inline-flex">Explorar productos</Link>
      </section>
    );
  }

  return (
    <section className="container-aura py-12">
      <h1 className="h-display text-fluid-4xl text-ink-900 mb-2">Checkout</h1>
      <p className="text-ink-700/70 mb-8">Pago contraentrega · Solo completa los datos de envío.</p>

      {user && user.addresses.length > 0 && (
        <div className="card-soft p-5 mb-6 flex items-center gap-4 flex-wrap">
          <label className="label-aura !mb-0">Usar dirección guardada</label>
          <select
            value={selectedAddressId}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedAddressId(id);
              const a = user.addresses.find((x) => x.id === id);
              if (a) applyAddress(a);
            }}
            className="input-aura flex-1 min-w-[14rem]"
          >
            <option value="">— Ingresar otra dirección —</option>
            {user.addresses.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label} · {a.addressLine1}, {a.neighborhood}
                {a.isDefault ? ' (predeterminada)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {!user && (
        <div className="card-soft p-4 mb-6 text-sm text-ink-700 flex flex-wrap gap-2 items-center">
          <span>¿Ya tienes cuenta?</span>
          <Link href={`/cuenta/ingresar?next=/checkout`} className="text-gold-600 font-semibold hover:underline">Ingresar</Link>
          <span className="text-ink-600">para prefillar tus datos y ver pedidos anteriores.</span>
        </div>
      )}

      <form id="checkout-form" onSubmit={onSubmit} className="grid lg:grid-cols-3 gap-8 pb-32 lg:pb-0">
        <div className="lg:col-span-2 space-y-6">
          {/* Cobertura primero */}
          <section className="card-soft p-4 sm:p-6">
            <h2 className="font-serif text-fluid-2xl text-ink-900 mb-4">1. ¿Dónde lo recibes?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-aura">Ciudad</label>
                <select value={city} onChange={(e) => { setCity(e.target.value); setNeighborhood(''); }} className="input-aura">
                  {cityOptions.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>
              <div>
                <label className="label-aura">Barrio / Sector</label>
                <select value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className="input-aura" required>
                  <option value="">Selecciona…</option>
                  {neighborhoodOptions.map((n) => (<option key={n} value={n}>{n}</option>))}
                </select>
              </div>
            </div>

            {validating && <p className="mt-4 text-sm text-ink-600">Verificando cobertura…</p>}
            {coverage && (
              <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <p className="text-sm text-emerald-800">
                  ✓ ¡Sí entregamos en <strong>{coverage.neighborhood}</strong>! Envío {formatCOP(coverage.shippingCOP)} · {coverage.estimatedDelivery}
                </p>
              </div>
            )}
            {coverageError && (
              <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200">
                <p className="text-sm text-rose-700">{coverageError}</p>
              </div>
            )}
          </section>

          {/* Datos */}
          <section className="card-soft p-4 sm:p-6">
            <h2 className="font-serif text-fluid-2xl text-ink-900 mb-4">2. Tus datos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nombre completo"
                value={form.fullName}
                onChange={(v) => setForm({ ...form, fullName: v })}
                required
                autoComplete="name"
                autoCapitalize="words"
              />
              <Input
                label="Celular (WhatsApp)"
                value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v })}
                placeholder="3XXXXXXXXX"
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                pattern="[0-9]{10}"
              />
              <Input
                label="Correo (opcional)"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="off"
                spellCheck={false}
              />
              <Input
                label="Referencia (torre, apto, color)"
                value={form.reference}
                onChange={(v) => setForm({ ...form, reference: v })}
                autoComplete="address-line2"
              />
              <div className="sm:col-span-2">
                <Input
                  label="Dirección"
                  value={form.addressLine1}
                  onChange={(v) => setForm({ ...form, addressLine1: v })}
                  placeholder="Cra 43A # 5 - 50"
                  required
                  autoComplete="address-line1"
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  label="Notas para el repartidor"
                  value={form.notes}
                  onChange={(v) => setForm({ ...form, notes: v })}
                  rows={3}
                />
              </div>
            </div>

            {user && !selectedAddressId && (
              <label className="mt-4 inline-flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                  className="w-4 h-4 accent-gold-500"
                />
                <span className="text-sm text-ink-700">Guardar esta dirección en mi libreta</span>
              </label>
            )}
          </section>

          {error && <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">{error}</div>}
        </div>

        <aside className="card-soft p-5 md:p-6 h-fit space-y-4 lg:sticky lg:top-24 lg:self-start">
          <h2 className="font-serif text-fluid-2xl text-ink-900">Tu pedido</h2>
          <div className="space-y-3">
            {lines.map((l) => (
              <div key={l.productId + l.variantId} className="flex gap-3 items-center">
                {l.image && (
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-rose-100 shrink-0">
                    <Image src={l.image} alt="" fill sizes="56px" className="object-cover" />
                  </div>
                )}
                <div className="flex-1 text-sm">
                  <p className="text-ink-900">{l.name} <span className="text-ink-600">×{l.quantity}</span></p>
                  {l.variantLabel && <p className="text-fluid-xs uppercase tracking-widest text-ink-600">{l.variantLabel}</p>}
                </div>
                <p className="text-sm font-semibold">{formatCOP(l.unitPriceCOP * l.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="gold-divider" />
          <div className="space-y-1.5 text-sm">
            <Row label="Subtotal" value={formatCOP(subtotal)} />
            <Row label="Envío" value={coverage ? formatCOP(coverage.shippingCOP) : '—'} />
          </div>
          <div className="gold-divider" />
          <div className="flex justify-between items-baseline">
            <span className="text-fluid-xs uppercase tracking-widest2 text-ink-600">Total contraentrega</span>
            <span className="text-fluid-2xl font-serif text-ink-900">{formatCOP(total)}</span>
          </div>
          <button type="submit" disabled={!coverage || submitting} className="btn-gold w-full disabled:opacity-50">
            {submitting ? 'Procesando…' : 'Confirmar pedido contraentrega'}
          </button>
          <p className="text-fluid-xs text-center text-ink-600 leading-relaxed">
            Al confirmar te llevaremos a WhatsApp para validar tu pedido con nuestro equipo y agendar tu entrega.
          </p>
        </aside>
      </form>

      {/* Sticky mobile submit bar */}
      <div className="lg:hidden fixed left-0 right-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 pointer-events-none">
        <div className="mx-3 card-luxe !rounded-3xl !shadow-luxe p-3 flex items-center gap-3 pointer-events-auto">
          <div className="flex-1 min-w-0">
            <p className="text-fluid-xs uppercase tracking-widest2 text-ink-600">Total contraentrega</p>
            <p className="font-serif text-fluid-xl text-ink-900 truncate">{formatCOP(total)}</p>
          </div>
          <button
            type="submit"
            form="checkout-form"
            disabled={!coverage || submitting}
            className="btn-gold !px-4 !py-3 text-fluid-sm shrink-0 tap-target disabled:opacity-50"
          >
            {submitting ? '…' : 'Confirmar'}
          </button>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-ink-700">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Input({
  label, value, onChange, placeholder, type = 'text', required,
  inputMode, autoComplete, pattern, autoCapitalize, spellCheck, rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  inputMode?: 'text' | 'tel' | 'email' | 'numeric' | 'search' | 'decimal' | 'url';
  autoComplete?: string;
  pattern?: string;
  autoCapitalize?: 'off' | 'none' | 'sentences' | 'words' | 'characters';
  spellCheck?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <label className="label-aura">{label}{required && <span className="text-gold-600 ml-1">*</span>}</label>
      {rows ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          rows={rows}
          autoComplete={autoComplete}
          autoCapitalize={autoCapitalize}
          spellCheck={spellCheck}
          className="input-aura resize-y"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type={type}
          required={required}
          inputMode={inputMode}
          autoComplete={autoComplete}
          pattern={pattern}
          autoCapitalize={autoCapitalize}
          spellCheck={spellCheck}
          className="input-aura"
        />
      )}
    </div>
  );
}

function WhatsappIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.52 3.48A11.93 11.93 0 0012 0C5.37 0 0 5.37 0 12a11.9 11.9 0 001.64 6L0 24l6.18-1.62A11.93 11.93 0 0012 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 22a9.93 9.93 0 01-5.06-1.38l-.36-.21-3.67.96.98-3.58-.23-.37A9.93 9.93 0 1122 12c0 5.51-4.49 10-10 10zm5.46-7.45c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15s-.77.97-.94 1.17-.34.22-.64.07-1.26-.46-2.4-1.48c-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37s-1.04 1.02-1.04 2.49 1.07 2.89 1.22 3.09c.15.2 2.1 3.21 5.09 4.5.71.31 1.27.5 1.7.64.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
    </svg>
  );
}
