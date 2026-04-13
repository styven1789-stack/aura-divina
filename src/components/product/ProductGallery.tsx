'use client';

/**
 * ProductGallery — galería con thumbnails + imagen principal + lightbox.
 * Desktop: thumbnails en columna vertical a la izquierda.
 * Mobile: thumbnails en fila horizontal debajo.
 * Click en imagen principal abre el Lightbox compartido.
 */

import { useState } from 'react';
import Image from 'next/image';
import Lightbox from '@/components/ui/Lightbox';
import IconButton from '@/components/ui/IconButton';
import { Zoom } from '@/components/icons';

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (images.length === 0) return null;

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="order-2 md:order-1 flex md:flex-col gap-3 md:w-20 overflow-x-auto md:overflow-visible">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Ver imagen ${i + 1}`}
              className={`relative shrink-0 w-20 h-20 md:w-full md:aspect-square rounded-2xl overflow-hidden border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 ${
                activeIndex === i
                  ? 'border-gold-500 shadow-gold'
                  : 'border-rose-150 hover:border-gold-500/50'
              }`}
            >
              <Image
                src={img}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="order-1 md:order-2 flex-1 relative">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="Ampliar imagen"
          className="relative block w-full aspect-[4/5] rounded-4xl overflow-hidden bg-rose-100 shadow-luxe focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 group"
        >
          <Image
            src={images[activeIndex]}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            priority={activeIndex === 0}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <IconButton label="Ampliar" icon={<Zoom size={18} />} variant="float" size="md" />
          </div>
        </button>
      </div>

      <Lightbox
        open={lightboxOpen}
        images={images}
        activeIndex={activeIndex}
        alt={name}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setActiveIndex}
      />
    </div>
  );
}
