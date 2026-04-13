/**
 * TestimonialCard — tarjeta individual de testimonio.
 */

import Image from 'next/image';
import StarRating from './StarRating';

export interface Testimonial {
  id: string;
  name: string;
  city: string;
  rating: number;
  text: string;
  product?: string;
  avatarUrl?: string;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  className?: string;
}

export default function TestimonialCard({ testimonial, className = '' }: TestimonialCardProps) {
  return (
    <article className={`card-luxe p-7 flex flex-col h-full ${className}`}>
      <StarRating rating={testimonial.rating} size="md" />
      <blockquote className="mt-4 font-serif italic text-lg text-ink-800 leading-relaxed flex-1">
        “{testimonial.text}”
      </blockquote>
      <div className="mt-5 flex items-center gap-3 pt-5 border-t border-rose-150">
        {testimonial.avatarUrl ? (
          <Image
            src={testimonial.avatarUrl}
            alt={testimonial.name}
            width={44}
            height={44}
            className="w-11 h-11 rounded-full object-cover border border-rose-150"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-rose-100 border border-rose-150 grid place-items-center font-serif text-gold-600">
            {testimonial.name.charAt(0)}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-ink-900">{testimonial.name}</p>
          <p className="text-[11px] text-ink-600">
            {testimonial.city}
            {testimonial.product ? ` · ${testimonial.product}` : ''}
          </p>
        </div>
      </div>
    </article>
  );
}
