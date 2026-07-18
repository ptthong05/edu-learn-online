'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/hooks/useCart';
import { Coupon } from '@/types';
import { api } from '@/lib/utils/api';
import { useAuth } from '@/lib/hooks/useAuth';

export default function PromotionsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'my-vouchers'>('all');
  const { savedCoupons, saveCoupon, removeCoupon } = useCart();
  const [couponsList, setCouponsList] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 12;

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const totalPagesAll = Math.ceil(couponsList.length / perPage);
  const paginatedAllCoupons = couponsList.slice((page - 1) * perPage, page * perPage);

  const totalPagesMy = Math.ceil(savedCoupons.length / perPage);
  const paginatedMyCoupons = savedCoupons.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    api.getCoupons()
      .then(data => {
        setCouponsList(data || []);
      })
      .catch(err => {
        console.error('Lỗi khi tải mã giảm giá:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveCoupon = (coupon: Coupon) => {
    if (!user) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    saveCoupon(coupon);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Header */}
      <div className="bg-gradient-hero text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-blue-200 mb-3">
            <Link href="/" className="hover:text-white">Trang chủ</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Khuyến mãi</span>
          </nav>
          <h1 className="text-3xl font-bold">Mã Giảm Giá & Quà Tặng</h1>
          <p className="text-blue-200 mt-1">Lưu voucher cực khủng để nhận ưu đãi lên đến 50% khi mua khóa học</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Tab Controls */}
        <div className="flex border-b border-gray-200 mb-8 max-w-md mx-auto bg-white p-1.5 rounded-xl shadow-sm">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🔥 Tất cả khuyến mãi
          </button>
          <button
            onClick={() => setActiveTab('my-vouchers')}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'my-vouchers'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🎟️ Voucher của tôi
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${activeTab === 'my-vouchers' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {savedCoupons.length}
            </span>
          </button>
        </div>

        {/* Tab 1: All Vouchers */}
        {activeTab === 'all' && (
          loading ? (
            <div className="flex justify-center items-center py-20 w-full">
              <p className="text-gray-500 font-medium animate-pulse">Đang tải danh sách khuyến mãi...</p>
            </div>
          ) : couponsList.length > 0 ? (
            <div className="space-y-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedAllCoupons.map((coupon) => {
                  const isSaved = savedCoupons.some(c => c.id === coupon.id);
                  const isPercent = coupon.discount_type === 'percent';
                  
                  return (
                    <div key={coupon.id} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex h-40">
                      {/* Left Graphic Part */}
                      <div className="w-24 bg-gradient-to-br from-primary-500 to-indigo-600 text-white flex flex-col items-center justify-center relative p-3 border-r border-dashed border-gray-200">
                        <span className="text-xl font-bold">🎟️</span>
                        <span className="text-xs uppercase font-semibold tracking-wider mt-1.5">Giảm</span>
                        <span className="text-sm font-black mt-0.5">
                          {isPercent ? `${coupon.discount}%` : `${coupon.discount / 1000}K`}
                        </span>
                        
                        {/* Half Circles for Coupon look */}
                        <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-50" />
                        <div className="absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full bg-gray-50" />
                      </div>
                      
                      {/* Right Detail Part */}
                      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full border border-primary-100">
                              MÃ: {coupon.code}
                            </span>
                            <span className="text-[10px] text-gray-400 font-semibold">
                              HSD: {new Date(coupon.expired_date).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-primary-600 transition-colors">
                            Voucher giảm {isPercent ? `${coupon.discount}%` : `${coupon.discount.toLocaleString()} đ`}
                          </h3>
                          <p className="text-[11px] text-gray-500 mb-4 leading-relaxed truncate" title={coupon.description}>
                            {coupon.description || 'Áp dụng cho mọi hóa đơn thanh toán khóa học. Số lượng có hạn.'}
                          </p>
                        </div>
    
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <span className="text-[10px] text-gray-400">
                            Còn lại: {coupon.quantity - coupon.used_count} lượt
                          </span>
                          
                          <button
                            onClick={() => handleSaveCoupon(coupon)}
                            disabled={isSaved}
                            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
                              isSaved
                                ? 'bg-green-500 text-white cursor-default'
                                : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-md'
                            }`}
                          >
                            {isSaved ? '✓ Đã lưu' : 'Lưu voucher'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPagesAll > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-primary-400 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                    ← Trước
                  </button>
                  {Array.from({ length: totalPagesAll }).map((_, i) => (
                    <button key={i} onClick={() => setPage(i + 1)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                        page === i + 1 ? 'bg-primary-600 text-white shadow-md' : 'border border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-600'
                      }`}>
                      {i + 1}
                    </button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPagesAll, p + 1))} disabled={page === totalPagesAll}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-primary-400 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                    Sau →
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl shadow-card max-w-lg mx-auto w-full">
              <div className="text-6xl mb-4">🎟️</div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Không có chương trình khuyến mãi nào</h3>
              <p className="text-sm text-gray-500">Hiện tại hệ thống chưa có mã giảm giá nào hoạt động. Hãy quay lại sau nhé!</p>
            </div>
          )
        )}

        {/* Tab 2: Saved Vouchers */}
        {activeTab === 'my-vouchers' && (
          <div>
            {savedCoupons.length > 0 ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedMyCoupons.map((coupon) => {
                    const isPercent = coupon.discount_type === 'percent';
                    
                    return (
                      <div 
                        key={coupon.id} 
                        className="bg-white rounded-2xl shadow-card overflow-hidden flex relative border border-gray-100"
                      >
                        {/* Left Ticket Part */}
                        <div className="w-1/3 bg-gradient-to-br from-green-500 to-emerald-600 text-white p-4 flex flex-col items-center justify-center text-center relative border-r-2 border-dashed border-gray-200">
                          <div className="absolute top-1/2 -translate-y-1/2 -left-3 w-6 h-6 bg-gray-50 rounded-full z-10" />
                          <div className="absolute top-0 right-0 w-3 h-3 bg-gray-50 rounded-full translate-y-[-50%] translate-x-[50%] z-10" />
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-50 rounded-full translate-y-[50%] translate-x-[50%] z-10" />
                          
                          <span className="text-xs uppercase tracking-wider text-green-100 font-semibold mb-1">GIẢM</span>
                          <span className="text-3xl font-black">
                            {isPercent ? `${coupon.discount}%` : `${coupon.discount / 1000}K`}
                          </span>
                        </div>
  
                        {/* Right Detail Part */}
                        <div className="flex-1 p-5 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold px-2 py-0.5 bg-green-50 text-green-700 rounded-full border border-green-100">
                                MÃ: {coupon.code}
                              </span>
                              <span className="text-[10px] text-gray-400 font-semibold">
                                HSD: {new Date(coupon.expired_date).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <h3 className="font-bold text-gray-900 text-sm mb-1">
                              Voucher giảm {isPercent ? `${coupon.discount}%` : `${coupon.discount.toLocaleString()} đ`}
                            </h3>
                            <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">
                              Mã này đã được lưu vào ví của bạn. Bạn hãy sao chép hoặc áp dụng mã này ở bước thanh toán đơn hàng.
                            </p>
                          </div>
  
                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(coupon.code);
                                alert(`Đã copy mã: ${coupon.code}`);
                              }}
                              className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline"
                            >
                              Copy mã code
                            </button>
                            
                            <button
                              onClick={() => removeCoupon(coupon.id)}
                              className="px-3.5 py-1.5 text-xs font-bold border border-red-200 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                              Gỡ bỏ
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPagesMy > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-primary-400 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                      ← Trước
                    </button>
                    {Array.from({ length: totalPagesMy }).map((_, i) => (
                      <button key={i} onClick={() => setPage(i + 1)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                          page === i + 1 ? 'bg-primary-600 text-white shadow-md' : 'border border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-600'
                        }`}>
                        {i + 1}
                      </button>
                    ))}
                    <button onClick={() => setPage(p => Math.min(totalPagesMy, p + 1))} disabled={page === totalPagesMy}
                      className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-primary-400 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                      Sau →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl shadow-card max-w-lg mx-auto">
                <div className="text-6xl mb-4">🎟️</div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Ví voucher của bạn đang trống</h3>
                <p className="text-sm text-gray-500 mb-6">Bạn chưa lưu mã giảm giá nào. Hãy ghé trang tất cả khuyến mãi để săn deal nhé!</p>
                <button
                  onClick={() => setActiveTab('all')}
                  className="px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
                >
                  Xem khuyến mãi ngay
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
