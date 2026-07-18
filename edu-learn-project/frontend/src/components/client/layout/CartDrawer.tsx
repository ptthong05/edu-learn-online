'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/hooks/useCart';
import { formatPrice } from '@/lib/utils/helpers';

export default function CartDrawer() {
  const { cartItems, removeFromCart, isCartOpen, setIsCartOpen } = useCart();

  if (!isCartOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => {
    if (item.type === 'course' && item.course) {
      return sum + (item.course.sale_price || item.course.price);
    }
    if (item.type === 'combo' && item.combo) {
      return sum + (item.combo.sale_price || item.combo.price);
    }
    return sum;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity backdrop-blur-sm animate-fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        {/* Sliding Panel */}
        <div className="w-screen max-w-md transform bg-white shadow-2xl transition-all duration-300 ease-in-out flex flex-col h-full animate-slide-up">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Giỏ hàng
              <span className="text-sm font-semibold bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
                {cartItems.length}
              </span>
            </h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 -mr-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto py-6 px-6">
            {cartItems.length > 0 ? (
              <div className="space-y-6">
                {cartItems.map((item) => {
                  const title = item.type === 'course' ? item.course?.title : item.combo?.title;
                  const image = item.type === 'course' ? item.course?.image : item.combo?.image;
                  const instructor = item.type === 'course' ? item.course?.instructor : 'Trọn bộ combo';
                  const price = item.type === 'course'
                    ? (item.course?.sale_price || item.course?.price)
                    : (item.combo?.sale_price || item.combo?.price);
                  const originalPrice = item.type === 'course' ? item.course?.price : item.combo?.price;
                  const isSale = item.type === 'course' ? !!item.course?.sale_price : !!item.combo?.sale_price;

                  return (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="relative w-20 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                        {image && (
                          <Image src={image} alt={title || ''} fill className="object-cover" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <Link
                          href={item.type === 'course' ? `/courses/${item.id}` : `/combos`}
                          onClick={() => setIsCartOpen(false)}
                          className="text-sm font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 leading-snug"
                        >
                          {title}
                        </Link>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.type === 'course' ? `👨‍🏫 ${instructor}` : `📦 ${instructor}`}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-sm font-bold text-primary-600">
                            {formatPrice(price || 0)}
                          </span>
                          {isSale && originalPrice && (
                            <span className="text-xs text-gray-400 line-through">
                              {formatPrice(originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all self-start flex-shrink-0"
                        title="Xóa khỏi giỏ"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty State Mockup */
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
                  {/* SVG Shopping Cart Illustration matching the colors/theme */}
                  <svg className="w-40 h-40 text-blue-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeWidth={0.5} fill="#eff6ff" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {/* Floating blue cart highlight */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-24 h-24 text-primary-500 animate-bounce-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Giỏ hàng đang trống</h3>
                <p className="text-sm text-gray-400 max-w-xs mb-8">
                  Hãy thêm những khóa học yêu thích vào giỏ hàng và nâng cao kỹ năng của bạn nhé!
                </p>
                <Link
                  href="/courses"
                  onClick={() => setIsCartOpen(false)}
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-bold rounded-xl transition-all duration-300 w-full"
                >
                  Khám phá khóa học
                </Link>
              </div>
            )}
          </div>

          {/* Footer Order Summary */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-100 px-6 py-6 bg-gray-50">
              <div className="flex justify-between text-base font-bold text-gray-900 mb-4">
                <span>Tổng tiền tạm tính:</span>
                <span className="text-primary-600 text-lg">{formatPrice(subtotal)}</span>
              </div>
              <div className="space-y-3">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="block w-full text-center py-3.5 bg-gradient-brand text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Thanh toán ngay
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="block w-full text-center py-3 border border-gray-200 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Xem chi tiết giỏ hàng
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
