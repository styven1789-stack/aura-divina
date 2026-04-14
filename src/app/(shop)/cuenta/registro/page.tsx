'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { useToast } from '@/components/ui/Toast';

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.warning('Contraseña muy corta', 'Usa al menos 8 caracteres.');
      return;
    }
    setLoading(true);
    try {
      const r = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.message || 'No se pudo crear la cuenta');
      const greeting = `Bienvenida, ${data.user.name}`;
      const extra = data.claimedOrdersCount > 0
        ? `Vinculamos ${data.claimedOrdersCount} pedido${data.claimedOrdersCount === 1 ? '' : 's'} previo${data.claimedOrdersCount === 1 ? '' : 's'} a tu cuenta ✨`
        : 'Tu cuenta está lista ✨';
      toast.success(greeting, extra);
      router.push('/cuenta');
      router.refresh();
    } catch (err) {
      toast.error('No se pudo registrar', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80dvh] hero-aura flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <form onSubmit={onSubmit} className="card-soft p-6 sm:p-10">
          <div className="flex justify-center">
            <Logo variant="stacked" />
          </div>
          <div className="mt-8 gold-divider" />
          <h1 className="mt-6 font-serif text-fluid-3xl text-center text-ink-900">Crear cuenta</h1>
          <p className="text-center text-xs uppercase tracking-widest text-ink-600 mt-1">Guarda direcciones y pedidos</p>

          <a href="/api/auth/google/start" className="btn-ghost w-full mt-8 inline-flex items-center justify-center gap-2">
            <GoogleIcon /> Continuar con Google
          </a>

          <div className="my-6 flex items-center gap-3 text-fluid-xs uppercase tracking-widest2 text-ink-600">
            <span className="flex-1 h-px bg-rose-150" />
            <span>o con un formulario</span>
            <span className="flex-1 h-px bg-rose-150" />
          </div>

          <div className="space-y-4">
            <div>
              <label className="label-aura">Nombre completo</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-aura"
                autoComplete="name"
                autoCapitalize="words"
                required
              />
            </div>
            <div>
              <label className="label-aura">Correo</label>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-aura"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="off"
                spellCheck={false}
                required
              />
            </div>
            <div>
              <label className="label-aura">Celular (opcional)</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-aura"
                placeholder="3XXXXXXXXX"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                pattern="[0-9]{10}"
              />
            </div>
            <div>
              <label className="label-aura">Contraseña</label>
              <input
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-aura"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
              <p className="text-fluid-xs text-ink-600 mt-1">Mínimo 8 caracteres.</p>
            </div>
          </div>

          <button disabled={loading} className="btn-gold w-full mt-6 disabled:opacity-50">
            {loading ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>

          <p className="mt-6 text-center text-fluid-sm text-ink-700">
            ¿Ya tienes cuenta?{' '}
            <Link href="/cuenta/ingresar" className="text-gold-600 font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.4 29.4 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.7 6.4 29.1 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.3-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.1 19 13 24 13c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.7 6.9 29.1 5 24 5 16.3 5 9.7 9.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 43.5c5 0 9.6-1.9 13.1-5l-6-5C29.2 34.8 26.7 36 24 36c-5.3 0-9.8-3-11.3-7.4l-6.5 5C9.5 39.5 16.2 43.5 24 43.5z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2 3.7-3.7 5l6 5c-.4.4 6.4-4.7 6.4-14 0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}
