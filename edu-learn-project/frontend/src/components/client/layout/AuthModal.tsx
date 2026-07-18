'use client';
import Link from 'next/link';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectUrl?: string;
}

export default function AuthModal({ isOpen, onClose, redirectUrl = '' }: AuthModalProps) {
  if (!isOpen) return null;

  const loginHref = redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login';
  const registerHref = redirectUrl ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : '/register';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-scale-in text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">Bạn cần đăng nhập</h2>
        <p className="text-sm text-gray-500 mb-7 leading-relaxed">
          Vui lòng đăng nhập hoặc đăng ký tài khoản để mua khoá học và theo dõi tiến trình học tập của bạn.
        </p>

        <div className="space-y-3">
          <Link
            href={loginHref}
            onClick={onClose}
            className="block w-full py-3.5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            Đăng nhập
          </Link>
          <Link
            href={registerHref}
            onClick={onClose}
            className="block w-full py-3.5 border-2 border-primary-600 text-primary-600 font-bold rounded-xl hover:bg-primary-50 transition-all duration-300"
          >
            Đăng ký miễn phí
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-5">
          Bằng cách tiếp tục, bạn đồng ý với{' '}
          <Link href="/terms" className="text-primary-600 hover:underline">điều khoản</Link>{' '}
          của chúng tôi.
        </p>
      </div>
    </div>
  );
}
