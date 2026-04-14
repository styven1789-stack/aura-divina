/**
 * FeatureCard — card con icono + título + descripción para secciones
 * tipo "Por qué elegirnos" / propuestas de valor.
 */

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

export default function FeatureCard({ icon, title, description, className = '' }: FeatureCardProps) {
  return (
    <div className={`card-luxe p-5 sm:p-7 ${className}`}>
      <div className="grid place-items-center w-14 h-14 rounded-2xl bg-rose-75 text-gold-600 border border-gold-500/20">
        {icon}
      </div>
      <h3 className="mt-5 font-serif text-fluid-2xl text-ink-900">{title}</h3>
      <p className="mt-2 text-fluid-sm text-ink-700/80 leading-relaxed">{description}</p>
    </div>
  );
}
