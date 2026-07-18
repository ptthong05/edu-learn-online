import Header from '@/components/client/layout/Header';
import Footer from '@/components/client/layout/Footer';
import CartDrawer from '@/components/client/layout/CartDrawer';
import SupportIcons from '@/components/client/layout/SupportIcons';
import FeatureBox from '@/components/client/layout/FeatureBox';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-[116px]">{children}</main>
      <FeatureBox />
      <Footer />
      <CartDrawer />
      <SupportIcons />
    </div>
  );
}
