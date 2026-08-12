'use client';
export const dynamic = 'force-dynamic';
import { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/lib/hooks/useCart';
import { categories } from '@/lib/data/mockData';
import { formatPrice, calcDiscount } from '@/lib/utils/helpers';
import StarRating from '@/components/ui/StarRating';
import { Combo } from '@/types';
import { api } from '@/lib/utils/api';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/client/layout/AuthModal';

function CombosContent() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get('category') || 'all';
  const urlSearch = searchParams.get('search') || '';

  const [search, setSearch] = useState(urlSearch);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [page, setPage] = useState(1);
  const perPage = 16;

  const [combosList, setCombosList] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);

  const { addToCart, cartItems, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRedirectUrl, setAuthRedirectUrl] = useState('/combos');

  useEffect(() => {
    setLoading(true);
    api.getCombos()
      .then(data => setCombosList(data))
      .catch(err => console.error('Lỗi khi tải combo:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'all');
  }, [searchParams]);

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  const filtered = useMemo(() => {
    let result = [...combosList];
    
    // Filter by search
    if (search) {
      const keyword = search.toLowerCase();
      result = result.filter(
        c => c.title.toLowerCase().includes(keyword) || 
             c.description.toLowerCase().includes(keyword)
      );
    }
    
    // Filter by category: a combo matches if it has any course in the selected category
    if (selectedCategory !== 'all') {
      result = result.filter(c => 
        c.courses?.some(course => course.category_id === selectedCategory)
      );
    }
    
    return result;
  }, [search, selectedCategory, combosList]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleBuyCombo = (combo: Combo) => {
    addToCart(combo, 'combo');
    setIsCartOpen(true);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Header */}
      <div className="bg-gradient-hero text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-blue-200 mb-3">
            <Link href="/" className="hover:text-white">Trang chủ</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Combo khóa học</span>
          </nav>
          <h1 className="text-3xl font-bold">Combo khóa học tiết kiệm</h1>
          <p className="text-blue-200 mt-1">Mua combo để tiết kiệm tối đa chi phí học tập lên tới 45%</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <p className="text-gray-500 font-medium animate-pulse">Đang tải danh sách combo...</p>
          </div>
        ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl p-5 shadow-card sticky top-20">
              <h3 className="font-semibold text-gray-900 mb-4">Bộ lọc Combo</h3>

              {/* Search Filter */}
              <div className="mb-5 pb-5 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-2">Tìm kiếm Combo</p>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm combo..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50/50"
                  />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2.5">Danh mục thuộc Combo</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input type="radio" name="category" value="all" checked={selectedCategory === 'all'}
                      onChange={e => { setSelectedCategory(e.target.value); setPage(1); }}
                      className="text-primary-600 focus:ring-primary-500 h-4 w-4 border-gray-300" />
                    <span className="text-sm text-gray-600 group-hover:text-primary-600 font-medium">Tất cả</span>
                  </label>
                  {categories.map(cat => (
                    <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer group">
                      <input type="radio" name="category" value={cat.id} checked={selectedCategory === cat.id}
                        onChange={e => { setSelectedCategory(e.target.value); setPage(1); }}
                        className="text-primary-600 focus:ring-primary-500 h-4 w-4 border-gray-300" />
                      <span className="text-sm text-gray-600 group-hover:text-primary-600 font-medium">{cat.icon} {cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid Content */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl p-4 shadow-card mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500">
                Tìm thấy <span className="font-semibold text-gray-900">{filtered.length}</span> combo khóa học
              </p>
            </div>

            {paginated.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {paginated.map(combo => {
                  const discount = combo.sale_price ? calcDiscount(combo.price, combo.sale_price) : 0;
                  const originalTotal = combo.courses?.reduce((sum, c) => sum + (c.sale_price || c.price), 0) || 0;
                  const inCart = cartItems?.some(item => item.id === combo.id) || false;
                  return (
                    <div key={combo.id} className="bg-white rounded-2xl shadow-card overflow-hidden group hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                      <div className="relative h-52 overflow-hidden flex-shrink-0">
                        <Image src={combo.image} alt={combo.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          Tiết kiệm {discount}%
                        </div>
                        <div className="absolute bottom-3 left-3 text-white">
                          <span className="text-xs font-medium bg-black/40 rounded-full px-2 py-0.5">{combo.courses?.length} khóa học</span>
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h2 className="text-base font-bold text-gray-900 mb-1.5 leading-snug line-clamp-2">{combo.title}</h2>
                          <p className="text-xs text-gray-500 mb-4 leading-relaxed line-clamp-2">{combo.description}</p>

                          {/* Included Courses */}
                          <div className="space-y-2.5 mb-5">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Khóa học bao gồm</p>
                            {combo.courses?.map(course => (
                              <div key={course.id} className="flex items-center gap-2.5">
                                <div className="relative w-10 h-7 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                  <Image src={course.image} alt={course.title} fill className="object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-gray-800 line-clamp-1">{course.title}</p>
                                  {course.rating && <StarRating rating={course.rating} size="sm" reviews={course.reviews_count} />}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Pricing and Button */}
                        <div>
                          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-3.5 mb-4">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-500">Mua lẻ từng khóa</span>
                              <span className="text-gray-400 line-through">{formatPrice(originalTotal)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm text-gray-900">Giá combo</span>
                              <span className="text-lg font-black text-primary-600">{formatPrice(combo.sale_price || combo.price)}</span>
                            </div>
                          </div>

                          {combo.status === 'inactive' ? (
                            <button
                              disabled
                              title="Combo này hiện đang ngừng cung cấp"
                              className="w-full text-center py-3 bg-gray-300 text-gray-500 text-sm font-bold rounded-xl cursor-not-allowed relative group/tooltip"
                            >
                              Ngừng cung cấp
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block bg-gray-900 text-white text-[11px] font-medium py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap z-25 transition-all pointer-events-none border border-gray-800">
                                Combo này hiện đã ngừng cung cấp!
                              </span>
                            </button>
                          ) : (
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={() => {
                                  if (!user) {
                                    setAuthRedirectUrl('/combos');
                                    setShowAuthModal(true);
                                    return;
                                  }
                                  addToCart(combo, 'combo');
                                  setIsCartOpen(true);
                                }}
                                className={`text-center py-3 text-xs font-bold rounded-xl border transition-all duration-300 ${
                                  inCart
                                    ? 'border-green-500 text-green-600 bg-green-50'
                                    : 'border-primary-500 text-primary-600 hover:bg-primary-50'
                                }`}
                              >
                                {inCart ? '✓ Đã thêm' : 'Thêm giỏ hàng'}
                              </button>
                              <button
                                onClick={() => {
                                  if (!user) {
                                    setAuthRedirectUrl('/checkout');
                                    setShowAuthModal(true);
                                    return;
                                  }
                                  const buyNowData = {
                                    id: combo.id,
                                    type: 'combo',
                                    combo: combo,
                                    quantity: 1
                                  };
                                  sessionStorage.setItem('buyNowItem', JSON.stringify(buyNowData));
                                  router.push('/checkout?buynow=true');
                                }}
                                className="text-center py-3 bg-gradient-brand text-white text-xs font-bold rounded-xl hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all duration-300"
                              >
                                Mua ngay
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl shadow-card">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Không tìm thấy combo nào</h3>
                <p className="text-gray-400">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-primary-400 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  ← Trước
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                      page === i + 1 ? 'bg-primary-600 text-white shadow-md' : 'border border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-600'
                    }`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-primary-400 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  Sau →
                </button>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} redirectUrl={authRedirectUrl} />
    </div>
  );
}

export default function CombosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-500 font-medium">Đang tải danh sách combo...</p></div>}>
      <CombosContent />
    </Suspense>
  );
}
