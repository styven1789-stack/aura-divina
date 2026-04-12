import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aura Divina · Tu esencia, tu estilo, tu aura divina',
  description:
    'Joyería premium para mujeres en Medellín. Anillos, collares y aretes hipoalergénicos. Pago contraentrega.',
  openGraph: {
    title: 'Aura Divina',
    description: 'Tu esencia, tu estilo, tu aura divina.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
