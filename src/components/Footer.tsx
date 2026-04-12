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
          <h4 className="text-xs uppercase tracking-widest2 text-gold-400 mb-4">Contacto</h4>
          <ul className="space-y-2 text-sm text-rose-150/80">
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
