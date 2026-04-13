/**
 * CategoryCard — tile grande con imagen full-bleed + overlay + título serif.
 */

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from '@/components/icons';

interface CategoryCardProps {
  title: string;
  href: string;
  image: string;
  subtitle?: string;
  className?: string;
}

export default function CategoryCard({ title, href, image, subtitle, className = '' }: CategoryCardProps) {
  return (
    <Link
      href={href}
      className={`group relative block rounded-4xl overflow-hidden shadow-luxe aspect-[4/5] ${className}`}
    >
      <Image
        src={image}
        alt={`Colección ${title}`}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-ink-900/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
        {subtitle && <p className="eyebrow text-gold-300 mb-2 !text-[10px]">{subtitle}</p>}
        <h3 className="font-serif text-3xl md:text-4xl leading-tight">{title}</h3>
        <div className="mt-3 inline-flex items-center gap-1 text-sm opacity-90 group-hover:gap-2 transition-all">
          Explorar <ChevronRight size={14} />
        </div>
      </div>
    </Link>
  );
}
