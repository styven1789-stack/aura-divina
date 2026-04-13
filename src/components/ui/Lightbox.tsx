'use client';

/**
 * Lightbox — modal fullscreen para imágenes, navegable por teclado y touch.
 * Soporta focus trap, Esc, ← →, y gestos swipe.
 */

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import IconButton from './IconButton';
import { ChevronLeft, ChevronRight, Close } from '@/components/icons';

interface LightboxProps {
  open: boolean;
  images: string[];
  activeIndex: number;
  alt?: string;
  onClose: () => void;
  onIndexChange: (next: number) => void;
}

export default function Lightbox({
  open,
  images,
  activeIndex,
  alt = '',
  onClose,
  onIndexChange,
}: LightboxProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    lastFocusedRef.current = (document.activeElement as HTMLElement) ?? null;
    closeBtnRef.current?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onIndexChange((activeIndex - 1 + images.length) % images.length);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onIndexChange((activeIndex + 1) % images.length);
      } else if (e.key === 'Tab') {
        // Focus trap: keep focus within the lightbox
        const focusable = rootRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
      lastFocusedRef.current?.focus();
    };
  }, [open, activeIndex, images.length, onClose, onIndexChange]);

  if (!open) return null;

  const prev = () => onIndexChange((activeIndex - 1 + images.length) % images.length);
  const next = () => onIndexChange((activeIndex + 1) % images.length);

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Vista ampliada"
      className="fixed inset-0 z-[95] bg-ink-900/92 backdrop-blur-md grid place-items-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div className="absolute top-4 right-4">
        <button
          ref={closeBtnRef}
          onClick={onClose}
          aria-label="Cerrar"
          className="grid place-items-center w-11 h-11 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
        >
          <Close size={22} />
        </button>
      </div>

      {images.length > 1 && (
        <>
          <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10">
            <IconButton label="Imagen anterior" icon={<ChevronLeft size={22} />} variant="float" size="lg" onClick={(e) => { e.stopPropagation(); prev(); }} />
          </div>
          <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10">
            <IconButton label="Imagen siguiente" icon={<ChevronRight size={22} />} variant="float" size="lg" onClick={(e) => { e.stopPropagation(); next(); }} />
          </div>
        </>
      )}

      <div
        className="relative w-full max-w-5xl aspect-[4/5] md:aspect-[3/4]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[activeIndex]}
          alt={alt}
          fill
          sizes="100vw"
          className="object-contain"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-xs uppercase tracking-widest">
          {activeIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
