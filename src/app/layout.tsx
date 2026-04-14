import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#fff5f8',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://auradivina.co'),
  title: {
    default: 'Aura Divina · Tu esencia, tu estilo, tu aura divina',
    template: '%s · Aura Divina',
  },
  description:
    'Joyería premium para mujeres en Medellín. Anillos, collares y aretes con baño de rodio. Pago contraentrega y envío en 24h.',
  keywords: [
    'joyería Medellín',
    'anillos',
    'collares',
    'aretes',
    'contraentrega',
    'baño de rodio',
    'rodio',
    'regalo mujer',
    'Aura Divina',
  ],
  authors: [{ name: 'Aura Divina' }],
  creator: 'Aura Divina',
  openGraph: {
    title: 'Aura Divina · Joyería que revela tu luz',
    description:
      'Piezas con baño de rodio, hechas con alma en Medellín. Envío 24h y pago contraentrega.',
    type: 'website',
    locale: 'es_CO',
    siteName: 'Aura Divina',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aura Divina · Joyería que revela tu luz',
    description: 'Piezas con baño de rodio, hechas con alma en Medellín.',
  },
  formatDetection: { telephone: true },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
