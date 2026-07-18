'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/hooks/useCart';
import { formatPrice } from '@/lib/utils/helpers';

export default function CartPage() {
  const { cartItems: items, removeFromCart } = useCart();
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');

  const removeItem = (id: string) => removeFromCart(id);

  const subtotal = items.reduce((sum, item) => {
    const price = item.type === 'course' 
      ? (item.course?.sale_price || item.course?.price) 
      : (item.combo?.sale_price || item.combo?.price);
    return sum + (price || 0);
  }, 0);
  
  const total = subtotal - discount;

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'SALE30') {
      setDiscount(Math.round(subtotal * 0.3));
      setCouponMsg('🎉 Áp dụng mã giảm 30% thành công!');
    } else if (coupon.toUpperCase() === 'SUMMER50') {
      setDiscount(Math.round(subtotal * 0.5));
      setCouponMsg('🎉 Áp dụng mã giảm 50% thành công!');
    } else if (coupon.toUpperCase() === 'NEWUSER') {
      setDiscount(Math.min(subtotal, 100000));
      setCouponMsg('🎉 Áp dụng mã giảm 100k thành công!');
    } else {
      setDiscount(0);
      setCouponMsg('❌ Mã giảm giá không hợp lệ hoặc đã hết hạn');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-hero text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold">Giỏ hàng</h1>
          <p className="text-blue-200 mt-1">{items.length} sản phẩm trong giỏ hàng</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items.length > 0 ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {items.map(item => {
                    const title = item.type === 'course' ? item.course?.title : item.combo?.title;
                    const image = item.type === 'course' ? item.course?.image : item.combo?.image;
                    const instructor = item.type === 'course' ? item.course?.instructor : 'Trọn bộ combo tiết kiệm';
                    const price = item.type === 'course'
                      ? (item.course?.sale_price || item.course?.price)
                      : (item.combo?.sale_price || item.combo?.price);
                    const originalPrice = item.type === 'course' ? item.course?.price : item.combo?.price;
                    const isSale = item.type === 'course' ? !!item.course?.sale_price : !!item.combo?.sale_price;

                    return (
                      <div key={item.id} className="flex gap-4 p-5">
                        <div className="relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-100">
                          {image && <Image src={image} alt={title || ''} fill className="object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link 
                            href={item.type === 'course' ? `/courses/${item.id}` : `/combos`} 
                            className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 text-sm leading-snug"
                          >
                            {title}
                          </Link>
                          <p className="text-xs text-gray-400 mt-1">{instructor}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="font-bold text-primary-600">{formatPrice(price || 0)}</span>
                            {isSale && originalPrice && (
                              <span className="text-xs text-gray-400 line-through">{formatPrice(originalPrice)}</span>
                            )}
                          </div>
                        </div>
                        <button onClick={() => removeItem(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0 self-start">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-card p-5 sticky top-20">
                <h2 className="font-bold text-gray-900 mb-5">Tóm tắt đơn hàng</h2>
                
                {/* Coupon */}
                <div className="mb-5">
                  <div className="flex gap-2">
                    <input type="text" placeholder="Mã giảm giá" value={coupon}
                      onChange={e => setCoupon(e.target.value)}
                      className="flex-1 px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    <button onClick={applyCoupon}
                      className="px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors">
                      Áp dụng
                    </button>
                  </div>
                  {couponMsg && (
                    <p className={`mt-2 text-xs ${couponMsg.startsWith('🎉') ? 'text-green-600' : 'text-red-500'}`}>
                      {couponMsg}
                    </p>
                  )}
                </div>

                {/* Price breakdown */}
                <div className="space-y-3 text-sm mb-5">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính ({items.length} món)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá coupon</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-base">
                    <span>Tổng cộng</span>
                    <span className="text-primary-600 text-xl">{formatPrice(total)}</span>
                  </div>
                </div>

                <Link href="/checkout"
                  className="block w-full text-center py-4 bg-gradient-brand text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all duration-300 mb-3">
                  Thanh toán ngay
                </Link>
                <Link href="/courses" className="block text-center text-sm text-primary-600 hover:underline">
                  ← Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-card max-w-lg mx-auto">
            <div className="text-8xl mb-6">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Giỏ hàng của bạn đang trống</h2>
            <p className="text-gray-500 mb-8">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục học tập</p>
            <Link href="/courses" className="btn-primary">Khám phá khóa học</Link>
          </div>
        )}
      </div>
    </div>
  );
}
