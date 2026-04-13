/**
 * EmptyState — estado vacío reutilizable.
 */

import Link from 'next/link';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; href?: string; onClick?: () => void };
  className?: string;
}

export default function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`card-soft p-12 md:p-16 text-center ${className}`}>
      {icon && <div className="mx-auto mb-5 w-16 h-16 grid place-items-center text-gold-600">{icon}</div>}
      <h3 className="font-serif text-2xl text-ink-900">{title}</h3>
      {description && <p className="mt-2 text-ink-700/70 max-w-md mx-auto">{description}</p>}
      {action && (
        <div className="mt-6">
          {action.href ? (
            <Link href={action.href} className="btn-gold">
              {action.label}
            </Link>
          ) : (
            <button onClick={action.onClick} className="btn-gold">
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
