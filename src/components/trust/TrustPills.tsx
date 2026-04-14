/**
 * TrustPills — fila de 3 trust signals (envío, contraentrega, garantía).
 */

import { TruckIcon, CashIcon, ShieldIcon } from '@/components/icons';

type Variant = 'hero' | 'compact' | 'badge';

const PILLS = [
  { icon: TruckIcon, label: 'Envío 24h Medellín' },
  { icon: CashIcon, label: 'Contraentrega' },
  { icon: ShieldIcon, label: 'Garantía 30 días' },
];

interface TrustPillsProps {
  variant?: Variant;
  className?: string;
}

export default function TrustPills({ variant = 'hero', className = '' }: TrustPillsProps) {
  if (variant === 'badge') {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        {PILLS.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full bg-white border border-rose-150 px-3 py-1 text-fluid-xs uppercase tracking-widest text-ink-700"
          >
            <Icon size={13} className="text-gold-600" />
            {label}
          </span>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-rose-75 border border-rose-150 ${className}`}>
        {PILLS.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-fluid-xs text-ink-700">
            <span className="grid place-items-center w-8 h-8 rounded-xl bg-white text-gold-600 shrink-0">
              <Icon size={16} />
            </span>
            <span className="font-medium">{label}</span>
          </div>
        ))}
      </div>
    );
  }

  // hero
  return (
    <div className={`flex flex-wrap items-center gap-x-5 gap-y-3 ${className}`}>
      {PILLS.map(({ icon: Icon, label }) => (
        <div key={label} className="inline-flex items-center gap-2 text-fluid-sm text-ink-700">
          <span className="grid place-items-center w-9 h-9 rounded-full bg-white border border-gold-500/30 text-gold-600 shadow-soft">
            <Icon size={16} />
          </span>
          <span className="font-medium">{label}</span>
        </div>
      ))}
    </div>
  );
}
