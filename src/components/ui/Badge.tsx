/**
 * Badge — etiqueta reutilizable con variantes semánticas.
 */

type BadgeVariant = 'sale' | 'new' | 'sold-out' | 'low-stock' | 'hot' | 'neutral';

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  sale: 'badge-discount',
  new: 'bg-ink-900 text-rose-50 border border-ink-900',
  'sold-out': 'bg-rose-100 text-rose-700 border border-rose-200',
  'low-stock': 'bg-white text-gold-700 border border-gold-500/40',
  hot: 'bg-gradient-to-r from-rose-500 to-gold-500 text-white',
  neutral: 'bg-white text-ink-700 border border-rose-150',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  const base =
    variant === 'sale'
      ? VARIANT_CLASS[variant]
      : `inline-flex items-center gap-1 rounded-full px-3 py-1 text-fluid-xs font-semibold uppercase tracking-widest ${VARIANT_CLASS[variant]}`;
  return <span className={`${base} ${className}`}>{children}</span>;
}
