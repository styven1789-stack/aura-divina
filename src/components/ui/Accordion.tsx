'use client';

/**
 * Accordion — grupo colapsable con soporte de múltiples abiertos a la vez
 * o exclusivo. Usa pattern aria-expanded manual para máximo control.
 */

import { useState } from 'react';
import { ChevronDown } from '@/components/icons';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpenIndex?: number;
  className?: string;
}

export default function Accordion({
  items,
  allowMultiple = false,
  defaultOpenIndex = 0,
  className = '',
}: AccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(items[defaultOpenIndex] ? [items[defaultOpenIndex].id] : []),
  );

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className={`divide-y divide-rose-150 ${className}`}>
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              aria-controls={`accordion-${item.id}`}
              className="w-full flex items-center justify-between gap-4 py-3 sm:py-4 text-left font-serif text-fluid-lg text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded-2xl px-2 tap-target"
            >
              <span>{item.title}</span>
              <span className={`text-gold-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                <ChevronDown />
              </span>
            </button>
            {isOpen && (
              <div
                id={`accordion-${item.id}`}
                className="pb-4 px-2 text-fluid-sm text-ink-700 leading-relaxed animate-in fade-in"
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
