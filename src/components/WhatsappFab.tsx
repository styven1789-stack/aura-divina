'use client';

/**
 * Floating WhatsApp action button — visible en todo el storefront.
 *
 * - Burbuja flotante esquina inferior derecha (mobile-first).
 * - Click → abre un mini-menú con dos acciones:
 *     1) "Quiero hacer un pedido"  → mensaje pre-llenado de pedido
 *     2) "Hablar con una asesora"  → mensaje pre-llenado de duda
 * - Animación pulse sutil + tooltip "¿Te ayudamos?" tras 4s.
 */

import { useEffect, useState } from 'react';

const ADMIN_WA = '573187307977';

const MSG_ORDER =
  'Hola Aura Divina ✨ Quiero hacer un pedido contraentrega. ¿Me ayudan?';
const MSG_HELP =
  'Hola Aura Divina ✨ Tengo una pregunta sobre sus productos.';

function waLink(message: string) {
  return `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(message)}`;
}

export default function WhatsappFab() {
  const [open, setOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowTooltip(true), 4000);
    const t2 = setTimeout(() => setShowTooltip(false), 12000);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);

  return (
    <div className="fixed bottom-20 right-5 md:bottom-5 z-40 flex flex-col items-end gap-3">
      {/* Mini-menú de acciones */}
      {open && (
        <div className="animate-in fade-in slide-in-from-bottom-2 flex flex-col gap-2 mb-1">
          <ChatCard
            title="Hacer un pedido"
            subtitle="Te ayudamos a confirmar contraentrega"
            href={waLink(MSG_ORDER)}
            emoji="🛒"
          />
          <ChatCard
            title="Hablar con una asesora"
            subtitle="Resolvemos tus dudas al instante"
            href={waLink(MSG_HELP)}
            emoji="💬"
          />
        </div>
      )}

      {/* Tooltip burbuja */}
      {showTooltip && !open && (
        <div className="relative bg-white shadow-soft rounded-2xl px-4 py-2.5 border border-rose-150 max-w-[220px] mr-1 animate-in fade-in slide-in-from-right-2">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-ink-900 text-white text-[10px] grid place-items-center shadow"
            aria-label="Cerrar"
          >
            ×
          </button>
          <p className="text-xs text-ink-900 leading-snug">
            <strong className="text-gold-600">¿Te ayudamos?</strong>
            <br />
            Escríbenos por WhatsApp ✨
          </p>
          <span className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-r border-b border-rose-150 rotate-45" />
        </div>
      )}

      {/* Botón principal */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Chatear por WhatsApp"
        className="relative group"
      >
        {/* Pulso */}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 animate-ping" />
        )}
        <span className="relative grid place-items-center w-14 h-14 rounded-full bg-[#25D366] shadow-[0_10px_30px_-8px_rgba(37,211,102,0.55)] border-2 border-white transition-transform group-hover:scale-110">
          {open ? <CloseIcon /> : <WhatsappIcon />}
        </span>
      </button>
    </div>
  );
}

function ChatCard({
  title, subtitle, href, emoji,
}: { title: string; subtitle: string; href: string; emoji: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 bg-white rounded-2xl pl-3 pr-5 py-3 shadow-soft border border-rose-150 hover:border-gold-500 hover:shadow-gold transition w-[260px]"
    >
      <span className="grid place-items-center w-10 h-10 rounded-xl bg-rose-100 text-xl">
        {emoji}
      </span>
      <span className="flex-1">
        <span className="block text-sm font-semibold text-ink-900">{title}</span>
        <span className="block text-[11px] text-ink-600">{subtitle}</span>
      </span>
      <span className="text-[#25D366] text-xl">›</span>
    </a>
  );
}

function WhatsappIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
      <path d="M20.52 3.48A11.93 11.93 0 0012 0C5.37 0 0 5.37 0 12a11.9 11.9 0 001.64 6L0 24l6.18-1.62A11.93 11.93 0 0012 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 22a9.93 9.93 0 01-5.06-1.38l-.36-.21-3.67.96.98-3.58-.23-.37A9.93 9.93 0 1122 12c0 5.51-4.49 10-10 10zm5.46-7.45c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15s-.77.97-.94 1.17-.34.22-.64.07-1.26-.46-2.4-1.48c-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37s-1.04 1.02-1.04 2.49 1.07 2.89 1.22 3.09c.15.2 2.1 3.21 5.09 4.5.71.31 1.27.5 1.7.64.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
      <path d="M6 6l12 12M6 18L18 6" />
    </svg>
  );
}
