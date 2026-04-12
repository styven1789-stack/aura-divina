import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'Aura Divina · Tu esencia, tu estilo, tu aura divina',
  description:
    'Joyería premium para mujeres en Medellín. Anillos, collares y aretes hipoalergénicos. Pago contraentrega + envío 24h.',
  keywords: ['joyería Medellín', 'anillos', 'collares', 'aretes', 'contraentrega', 'hipoalergénico', 'oro 18k'],
  openGraph: {
    title: 'Aura Divina',
    description: 'Tu esencia, tu estilo, tu aura divina.',
    type: 'website',
    locale: 'es_CO',
  },
  formatDetection: { telephone: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
