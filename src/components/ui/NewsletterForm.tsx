'use client';

/**
 * NewsletterForm — banda de suscripción. Sin backend en Fase 1:
 * el submit solo muestra un toast placeholder.
 */

import { useState } from 'react';
import { useToast } from './Toast';
import { MailIcon, SparkleIcon } from '@/components/icons';

interface NewsletterFormProps {
  variant?: 'inline' | 'card';
  className?: string;
}

export default function NewsletterForm({ variant = 'inline', className = '' }: NewsletterFormProps) {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      toast.warning('Correo inválido', 'Revisa el formato de tu email.');
      return;
    }
    setSubmitted(true);
    toast.success('¡Genial!', 'Te avisaremos cuando lancemos nuestra newsletter ✨');
    setEmail('');
  };

  if (variant === 'card') {
    return (
      <div className={`card-luxe p-8 ${className}`}>
        <div className="flex items-start gap-4">
          <div className="grid place-items-center w-12 h-12 rounded-2xl bg-rose-100 text-gold-600 shrink-0">
            <MailIcon size={22} />
          </div>
          <div className="flex-1">
            <h3 className="font-serif text-2xl text-ink-900">Enredémonos bonito</h3>
            <p className="text-sm text-ink-700/70 mt-1">10% OFF en tu primera compra ✨</p>
            <form onSubmit={onSubmit} className="mt-4 flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                className="input-aura flex-1"
                disabled={submitted}
              />
              <button type="submit" disabled={submitted} className="btn-gold disabled:opacity-50">
                {submitted ? '¡Listo!' : 'Suscribirme'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className={`container-aura py-14 ${className}`}>
      <div className="card-luxe p-6 sm:p-8 md:p-12 text-center max-w-3xl mx-auto">
        <div className="inline-grid place-items-center w-14 h-14 rounded-2xl bg-rose-100 text-gold-600 mb-5">
          <SparkleIcon size={24} />
        </div>
        <h3 className="font-serif text-fluid-4xl text-ink-900">Enredémonos bonito</h3>
        <p className="mt-3 text-ink-700/70 max-w-md mx-auto">
          Suscríbete y recibe 10% OFF en tu primera compra. Noticias de lanzamientos y promociones exclusivas — sin spam, lo prometemos.
        </p>
        <form onSubmit={onSubmit} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            required
            inputMode="email"
            autoComplete="email"
            autoCapitalize="off"
            spellCheck={false}
            className="input-aura flex-1"
            disabled={submitted}
            aria-label="Correo electrónico"
          />
          <button type="submit" disabled={submitted} className="btn-gold disabled:opacity-50">
            {submitted ? '¡Listo!' : 'Suscribirme ✨'}
          </button>
        </form>
      </div>
    </section>
  );
}
