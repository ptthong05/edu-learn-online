import Image from 'next/image';
import Header from '@/components/client/layout/Header';
import Footer from '@/components/client/layout/Footer';
import CartDrawer from '@/components/client/layout/CartDrawer';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />

      {/* Main content area with top margin to clear the fixed header */}
      <main className="flex-1 flex items-center justify-center px-4 mt-[116px] py-12">
        {/* Card container — 2 columns like the reference image */}
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden flex">

          {/* Left: Illustration panel */}
          <div className="hidden md:flex md:w-[45%] bg-gray-50 items-center justify-center p-8">
            <Image
              src="/auth-illustration.png"
              alt="Đăng nhập minh hoạ"
              width={340}
              height={340}
              className="object-contain w-full h-auto select-none"
              priority
            />
          </div>

          {/* Right: Form area */}
          <div className="flex-1 p-8 md:p-10">
            {children}
          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}
