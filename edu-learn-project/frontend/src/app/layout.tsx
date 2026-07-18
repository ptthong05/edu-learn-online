import type { Metadata } from 'next';
import './globals.css';
import 'react-quill/dist/quill.snow.css';
import { AuthProvider } from '@/lib/hooks/useAuth';
import { CartProvider } from '@/lib/hooks/useCart';
import { Toaster } from 'react-hot-toast';
import { SiteTitleUpdater } from '@/components/SiteTitleUpdater';

export const metadata: Metadata = {
  title: { default: 'DRIVE ORD - Nền tảng học trực tuyến hàng đầu | Khóa học Online, Đào tạo kỹ năng', template: '%s | DRIVE ORD' },
  description: 'DRIVE ORD - Nền tảng học trực tuyến hàng đầu Việt Nam. Khám phá hàng ngàn khóa học online, đào tạo kỹ năng chuyên nghiệp, học tập linh hoạt, chất lượng cao với giáo viên giàu kinh nghiệm.',
  keywords: ['học trực tuyến', 'khóa học online', 'đào tạo kỹ năng', 'e-learning', 'học online', 'khóa học chuyên nghiệp', 'nền tảng học tập', 'DRIVE ORD', 'học tập linh hoạt', 'chứng chỉ nghề nghiệp'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="font-poppins antialiased">
        <AuthProvider>
          <CartProvider>
            <SiteTitleUpdater />
            {children}
            <Toaster position="top-center" reverseOrder={false} />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
