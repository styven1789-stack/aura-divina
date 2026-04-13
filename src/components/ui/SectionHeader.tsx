/**
 * SectionHeader — eyebrow + heading serif + subtitle. Patrón repetido en
 * todas las secciones del home, catálogo y dashboards.
 */

import Eyebrow from './Eyebrow';

interface SectionHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
  titleSize?: 'md' | 'lg' | 'xl';
}

const TITLE_CLASS: Record<NonNullable<SectionHeaderProps['titleSize']>, string> = {
  md: 'text-3xl md:text-4xl',
  lg: 'text-4xl md:text-5xl',
  xl: 'text-5xl md:text-6xl',
};

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  className = '',
  titleSize = 'lg',
}: SectionHeaderProps) {
  const alignCls = align === 'center' ? 'text-center mx-auto' : 'text-left';
  return (
    <header className={`max-w-2xl ${alignCls} ${className}`}>
      {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
      <h2 className={`h-display text-ink-900 ${TITLE_CLASS[titleSize]}`}>{title}</h2>
      {subtitle && <p className="mt-3 text-ink-700/70 text-base md:text-lg leading-relaxed">{subtitle}</p>}
    </header>
  );
}
