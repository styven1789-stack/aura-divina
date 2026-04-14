/**
 * StarRating — estrellas copper con soporte de media estrella.
 */

import { StarIcon } from '@/components/icons';

type Size = 'sm' | 'md' | 'lg';

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: Size;
  showCount?: boolean;
  className?: string;
}

const SIZE_PX: Record<Size, number> = { sm: 14, md: 16, lg: 22 };
const COUNT_CLS: Record<Size, string> = {
  sm: 'text-fluid-xs',
  md: 'text-fluid-xs',
  lg: 'text-fluid-sm',
};

export default function StarRating({
  rating,
  count,
  size = 'md',
  showCount = false,
  className = '',
}: StarRatingProps) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.25 && rating - full < 0.75;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  return (
    <div
      className={`inline-flex items-center gap-1.5 text-gold-600 ${className}`}
      role="img"
      aria-label={`${rating.toFixed(1)} de 5 estrellas${count ? `, basado en ${count} reseñas` : ''}`}
    >
      <div className="inline-flex items-center gap-0.5">
        {Array.from({ length: full }).map((_, i) => (
          <StarIcon key={`f${i}`} size={SIZE_PX[size]} filled />
        ))}
        {hasHalf && <StarIcon key="h" size={SIZE_PX[size]} half />}
        {Array.from({ length: empty }).map((_, i) => (
          <StarIcon key={`e${i}`} size={SIZE_PX[size]} className="opacity-30" filled />
        ))}
      </div>
      {showCount && count !== undefined && (
        <span className={`${COUNT_CLS[size]} text-ink-600 font-medium`}>
          {rating.toFixed(1)} · {count} reseñas
        </span>
      )}
    </div>
  );
}
