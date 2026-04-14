/**
 * TestimonialsSection — sección completa que lee de testimonials.json.
 */

import SectionHeader from '@/components/ui/SectionHeader';
import TestimonialCard, { type Testimonial } from './TestimonialCard';
import testimonialsData from '@/data/testimonials.json';
import brandStats from '@/data/brand-stats.json';
import StarRating from './StarRating';

interface TestimonialsSectionProps {
  limit?: number;
  title?: string;
  eyebrow?: string;
  subtitle?: string;
  showStats?: boolean;
  className?: string;
}

export default function TestimonialsSection({
  limit,
  title = 'Historias reales de quienes ya brillan con nosotras',
  eyebrow = 'Testimonios',
  subtitle,
  showStats = true,
  className = '',
}: TestimonialsSectionProps) {
  const items = (testimonialsData as Testimonial[]).slice(0, limit);

  return (
    <section className={`container-aura py-16 md:py-20 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
        <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} titleSize="md" />
        {showStats && (
          <div className="flex items-center gap-3">
            <StarRating rating={brandStats.averageRating} size="lg" />
            <div className="text-right">
              <p className="font-serif text-2xl text-ink-900">{brandStats.averageRating}</p>
              <p className="text-fluid-xs uppercase tracking-widest text-ink-600">{brandStats.reviewCount} reseñas</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {items.map((t) => (
          <TestimonialCard key={t.id} testimonial={t} />
        ))}
      </div>
    </section>
  );
}
