/**
 * Breadcrumb — navegación jerárquica semántica.
 */

import Link from 'next/link';
import { ChevronRight } from '@/components/icons';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-2 text-xs text-ink-600">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={`${item.label}-${idx}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-gold-600 transition">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'text-ink-900 font-medium' : ''} aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight size={12} className="text-ink-600/40" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
