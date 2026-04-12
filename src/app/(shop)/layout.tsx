import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsappFab from '@/components/WhatsappFab';
import MobileBottomNav from '@/components/MobileBottomNav';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[60vh] pb-24 md:pb-0">{children}</main>
      <Footer />
      <WhatsappFab />
      <MobileBottomNav />
    </>
  );
}
