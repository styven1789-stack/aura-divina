'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@auradivina.co');
  const [password, setPassword] = useState('AuraDivina2026!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? 'Credenciales inválidas');
      }
      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-aura flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="card-soft p-10 w-full max-w-md">
        <div className="flex justify-center">
          <Logo variant="stacked" />
        </div>
        <div className="mt-8 gold-divider" />
        <h1 className="mt-6 font-serif text-2xl text-center text-ink-900">Panel administrativo</h1>
        <p className="text-center text-xs uppercase tracking-widest text-ink-600 mt-1">Acceso restringido</p>

        <div className="mt-8 space-y-4">
          <div>
            <label className="label-aura">Correo</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="input-aura" type="email" required />
          </div>
          <div>
            <label className="label-aura">Contraseña</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} className="input-aura" type="password" required />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-rose-600 text-center">{error}</p>}

        <button disabled={loading} className="btn-gold w-full mt-6 disabled:opacity-50">
          {loading ? 'Ingresando…' : 'Entrar al panel'}
        </button>

        <p className="mt-6 text-center text-[11px] text-ink-600">
          Credenciales por defecto: <code>admin@auradivina.co</code> / <code>AuraDivina2026!</code>
        </p>
      </form>
    </div>
  );
}
