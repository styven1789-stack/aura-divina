/**
 * IconButton — botón icónico accesible con aria-label obligatorio.
 */

type Variant = 'ghost' | 'solid' | 'float';
type Size = 'sm' | 'md' | 'lg';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: React.ReactNode;
  variant?: Variant;
  size?: Size;
}

const VARIANT_CLASS: Record<Variant, string> = {
  ghost: 'bg-transparent hover:bg-white border border-transparent hover:border-rose-150',
  solid: 'bg-white border border-rose-150 hover:border-gold-500 shadow-soft',
  float: 'bg-white shadow-float hover:shadow-luxe',
};

const SIZE_CLASS: Record<Size, string> = {
  sm: 'w-8 h-8',
  md: 'w-11 h-11',
  lg: 'w-12 h-12',
};

export default function IconButton({
  label,
  icon,
  variant = 'ghost',
  size = 'md',
  className = '',
  ...rest
}: IconButtonProps) {
  return (
    <button
      {...rest}
      aria-label={label}
      className={`grid place-items-center rounded-full text-ink-900 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 ${SIZE_CLASS[size]} ${VARIANT_CLASS[variant]} ${className}`}
    >
      {icon}
    </button>
  );
}
