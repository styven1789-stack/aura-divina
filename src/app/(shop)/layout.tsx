import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsappFab from '@/components/WhatsappFab';
import MobileBottomNav from '@/components/MobileBottomNav';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[60dvh] pb-24 lg:pb-0">{children}</main>
      <Footer />
      <WhatsappFab />
      <MobileBottomNav />
    </>
  );
}
