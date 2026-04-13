/**
 * Wrapper estándar de Aura Divina sobre next/image con aspect ratio,
 * fill y wrapper relativo preconfigurados. Es el primitivo único para
 * todas las imágenes del sitio.
 */

import Image from 'next/image';

export type AspectRatio = 'square' | '4/5' | '3/4' | '16/9' | '4/3' | '5/4';

const ASPECT_CLASS: Record<AspectRatio, string> = {
  square: 'aspect-square',
  '4/5': 'aspect-[4/5]',
  '3/4': 'aspect-[3/4]',
  '16/9': 'aspect-[16/9]',
  '4/3': 'aspect-[4/3]',
  '5/4': 'aspect-[5/4]',
};

interface AspectImageProps {
  src: string;
  alt: string;
  ratio?: AspectRatio;
  priority?: boolean;
  sizes?: string;
  className?: string;
  wrapperClassName?: string;
  rounded?: string;
  fallbackBg?: string;
}

export default function AspectImage({
  src,
  alt,
  ratio = 'square',
  priority = false,
  sizes = '(max-width: 768px) 100vw, 50vw',
  className = '',
  wrapperClassName = '',
  rounded = 'rounded-2xl',
  fallbackBg = 'bg-rose-100',
}: AspectImageProps) {
  return (
    <div className={`relative ${ASPECT_CLASS[ratio]} ${rounded} overflow-hidden ${fallbackBg} ${wrapperClassName}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover ${className}`}
      />
    </div>
  );
}
