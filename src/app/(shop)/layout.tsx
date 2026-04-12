import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsappFab from '@/components/WhatsappFab';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
      <WhatsappFab />
    </>
  );
}
