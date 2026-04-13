/**
 * Eyebrow — micro-label uppercase que precede a un heading. Semánticamente
 * puede ser un span o un p según contexto.
 */

interface EyebrowProps {
  children: React.ReactNode;
  as?: 'span' | 'p' | 'div';
  className?: string;
}

export default function Eyebrow({ children, as = 'p', className = '' }: EyebrowProps) {
  const Tag = as;
  return <Tag className={`eyebrow ${className}`}>{children}</Tag>;
}
