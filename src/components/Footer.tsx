import Link from 'next/link';
import { Logo } from './brand/Logo';
import { InstagramIcon, FacebookIcon } from './icons';

export default function Footer() {
  return (
    <footer className="mt-16 md:mt-24 bg-ink-900 text-rose-50">
      <div className="container-aura py-12 md:py-16 lg:py-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
        <div className="sm:col-span-2 md:col-span-2">
          <Logo variant="full" invert />
          <p className="mt-6 max-w-md text-sm text-rose-150/80 leading-relaxed">
            Aura Divina es una marca colombiana de accesorios premium para mujeres que aman brillar
            con autenticidad. Diseños minimalistas, materiales de calidad y un servicio de
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
              <InstagramIcon size={18} />
              <span className="text-xs uppercase tracking-widest">@auradivina.shoping</span>
            </a>
            <a
              href="https://www.facebook.com/share/1BU2bxyGPp/?mibextid=wwXIfr"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="grid place-items-center w-11 h-11 rounded-full bg-white/5 hover:bg-gold-500 hover:text-ink-900 border border-white/10 hover:border-gold-500 transition"
            >
              <FacebookIcon size={18} />
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
        <div className="container-aura py-5 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-5 flex flex-col md:flex-row justify-between gap-3 text-fluid-xs text-rose-150/60">
          <span>© {new Date().getFullYear()} Aura Divina. Todos los derechos reservados.</span>
          <span className="tracking-widest uppercase">Tu esencia · Tu estilo · Tu aura divina</span>
        </div>
      </div>
    </footer>
  );
}

function SocialWhatsapp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.52 3.48A11.93 11.93 0 0012 0C5.37 0 0 5.37 0 12a11.9 11.9 0 001.64 6L0 24l6.18-1.62A11.93 11.93 0 0012 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52z" />
    </svg>
  );
}
