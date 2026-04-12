import Link from 'next/link';
import { Logo } from './brand/Logo';

export default function Footer() {
  return (
    <footer className="mt-24 bg-ink-900 text-rose-50">
      <div className="container-aura py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <Logo variant="full" invert />
          <p className="mt-6 max-w-md text-sm text-rose-150/80 leading-relaxed">
            Aura Divina es una marca colombiana de accesorios premium para mujeres que aman brillar
            con autenticidad. Diseños minimalistas, materiales hipoalergénicos y un servicio de
            contraentrega en toda Medellín.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <a
              href="https://www.instagram.com/auradivina.shoping"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram @auradivina.shoping"
              className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 hover:bg-gold-500 hover:text-ink-900 border border-white/10 hover:border-gold-500 transition"
            >
              <SocialInstagram />
              <span className="text-xs uppercase tracking-widest">@auradivina.shoping</span>
            </a>
            <a
              href="https://www.facebook.com/share/1BU2bxyGPp/?mibextid=wwXIfr"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="grid place-items-center w-11 h-11 rounded-full bg-white/5 hover:bg-gold-500 hover:text-ink-900 border border-white/10 hover:border-gold-500 transition"
            >
              <SocialFacebook />
            </a>
            <a
              href="https://wa.me/573187307977"
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="grid place-items-center w-11 h-11 rounded-full bg-white/5 hover:bg-[#25D366] hover:text-white border border-white/10 hover:border-[#25D366] transition"
            >
              <SocialWhatsapp />
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest2 text-gold-400 mb-4">Tienda</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/productos?cat=anillos" className="hover:text-gold-400">Anillos</Link></li>
            <li><Link href="/productos?cat=collares" className="hover:text-gold-400">Collares</Link></li>
            <li><Link href="/productos?cat=aretes" className="hover:text-gold-400">Aretes</Link></li>
            <li><Link href="/productos?cat=sets" className="hover:text-gold-400">Sets</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest2 text-gold-400 mb-4">Ayuda</h4>
          <ul className="space-y-2 text-sm text-rose-150/80">
            <li><Link href="/pedido" className="hover:text-gold-400">Rastrear pedido</Link></li>
            <li>WhatsApp: <a href="https://wa.me/573187307977" className="text-gold-400 hover:underline">318 730 7977</a></li>
            <li>Medellín · Colombia</li>
            <li>Pago contraentrega</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-rose-50/10">
        <div className="container-aura py-6 flex flex-col md:flex-row justify-between gap-3 text-xs text-rose-150/60">
          <span>© {new Date().getFullYear()} Aura Divina. Todos los derechos reservados.</span>
          <span className="tracking-widest uppercase">Tu esencia · Tu estilo · Tu aura divina</span>
        </div>
      </div>
    </footer>
  );
}

function SocialInstagram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeLinecap="round" />
    </svg>
  );
}
function SocialFacebook() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
    </svg>
  );
}
function SocialWhatsapp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.52 3.48A11.93 11.93 0 0012 0C5.37 0 0 5.37 0 12a11.9 11.9 0 001.64 6L0 24l6.18-1.62A11.93 11.93 0 0012 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52z" />
    </svg>
  );
}
