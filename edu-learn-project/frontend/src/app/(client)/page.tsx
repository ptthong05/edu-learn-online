'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CourseCard from '@/components/client/course/CourseCard';
import { Users, DollarSign, Laptop, RefreshCw } from 'lucide-react';
import { courses, categories } from '@/lib/data/mockData';
import { formatPrice, calcDiscount } from '@/lib/utils/helpers';
import { api } from '@/lib/utils/api';
import { Combo } from '@/types';
import { useCart } from '@/lib/hooks/useCart';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/client/layout/AuthModal';
import ScrollReveal from '@/components/ui/ScrollReveal';

const DEFAULT_BANNER = {
  title_line1: 'HỌC ONLINE',
  title_line2: 'CHỦ ĐỘNG THỜI GIAN',
  title_line3: 'NÂNG TẦM KỸ NĂNG',
  description: 'Hàng nghìn khóa học chất lượng từ các chuyên gia. Từ cơ bản đến chuyên sâu.',
  badge_text: 'Hơn 1000+ khóa học chất lượng',
  floating_badge_title: 'Học mọi lúc, mọi nơi',
  floating_badge_subtitle: 'Truy cập trọn đời sau khi mua',
  stat1_value: '1000+', stat1_label: 'Khóa học chất lượng',
  stat2_value: '200K+', stat2_label: 'Khách hàng tin tưởng',
  stat3_value: '50+', stat3_label: 'Danh mục đa dạng',
  image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
};

export default function HomePage() {
  const router = useRouter();
  const { addToCart, cartItems, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRedirectUrl, setAuthRedirectUrl] = useState('/');
  const [banner, setBanner] = useState(DEFAULT_BANNER);
  const [combosList, setCombosList] = useState<Combo[]>([]);

  useEffect(() => {
    fetch('/api/home-banner')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setBanner(data); })
      .catch(() => {}); // fallback to default silently

    api.getCombos()
      .then(data => setCombosList(data))
      .catch(err => console.error('Lỗi khi tải combo:', err));
  }, []);

  const featured = courses.filter(c => c.is_featured);
  const bestsellers = courses.filter(c => c.is_bestseller);
  const newCourses = courses.filter(c => c.is_new);
  const onSale = courses.filter(c => c.is_on_sale);

  return (
    <div className="bg-gray-50">
      {/* ===== HERO BANNER ===== */}
      <section className="bg-gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-20 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl" />
          
          {/* Wave SVG vector background in the middle */}
          <svg className="absolute inset-y-0 left-1/4 right-0 w-[70%] h-full opacity-10 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
            <path d="M0,50 Q25,30 50,50 T100,50" stroke="white" strokeWidth="0.5" />
            <path d="M0,60 Q30,40 60,60 T100,60" stroke="white" strokeWidth="0.3" />
          </svg>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 lg:pt-24 lg:pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse-slow" />
                {banner.badge_text}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-6 flex flex-col gap-1.5">
                <span>{banner.title_line1}</span>
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent leading-tight">
                  {banner.title_line2}
                </span>
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent leading-tight">
                  {banner.title_line3}
                </span>
              </h1>
              <p className="text-sm md:text-base lg:text-lg text-blue-100 mb-8 leading-relaxed max-w-lg">
                {banner.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/courses"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 md:px-5 md:py-2.5 lg:px-6 lg:py-3 bg-white text-primary-700 font-bold rounded-xl hover:bg-gray-100 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 text-sm md:text-base">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                  Khám phá ngay
                </Link>
                {user ? (
                  <Link href="/tai-khoan?tab=courses"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 md:px-5 md:py-2.5 lg:px-6 lg:py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 hover:-translate-y-0.5 transition-all duration-300 text-sm md:text-base">
                    Vào học ngay
                  </Link>
                ) : (
                  <Link href="/register"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 md:px-5 md:py-2.5 lg:px-6 lg:py-3 border-2 border-white/50 text-white font-bold rounded-xl hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-300 text-sm md:text-base">
                    Đăng ký ngay
                  </Link>
                )}
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="relative">
                <div className="w-80 h-80 bg-gradient-to-br from-primary-400/30 to-secondary-400/30 rounded-full absolute inset-0 blur-2xl" />
                <div className="relative w-[480px] h-[300px] rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
                  <Image
                    src={banner.image_url || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80'}
                    alt="Học online cùng EduLearn"
                    fill className="object-cover"
                    priority
                  />
                  {/* Floating card */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600/90 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white leading-snug">{banner.floating_badge_title}</div>
                        <div className="text-[10px] text-blue-200">{banner.floating_badge_subtitle}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Centered stats at the bottom of the section */}
          <div className="border-t border-white/10 mt-12 pt-8 w-full">
            <div className="grid grid-cols-3 gap-6 text-center max-w-4xl mx-auto">
              {[
                [banner.stat1_value, banner.stat1_label],
                [banner.stat2_value, banner.stat2_label],
                [banner.stat3_value, banner.stat3_label],
              ].map(([num, label]) => (
                <div key={num} className="flex flex-col items-center">
                  <div className="text-2xl font-black text-white">{num}</div>
                  <div className="text-xs text-blue-200 mt-1 tracking-wide">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <ScrollReveal>
        <section className="py-12 md:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-title">Danh mục khóa học</h2>
              <p className="section-subtitle">Khám phá hàng trăm khóa học theo lĩnh vực</p>
            </div>
            <Link href="/courses" className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
              Xem tất cả →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map(cat => (
              <Link key={cat.id} href={`/courses?category=${cat.id}`}
                className="group flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-all duration-300 hover:-translate-y-1">
                <span className="text-3xl">{cat.icon}</span>
                <span className="text-xs font-medium text-gray-700 group-hover:text-primary-700 text-center leading-tight">{cat.name}</span>
                <span className="text-xs text-gray-400">{cat.course_count} khóa</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ===== FEATURED COURSES ===== */}
      <ScrollReveal>
        <section className="py-12 md:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-title">Khóa học nổi bật</h2>
              <p className="section-subtitle">Được khách hàng yêu thích và đánh giá cao nhất</p>
            </div>
            <Link href="/courses?filter=featured" className="text-sm font-medium text-primary-600 hover:text-primary-700">Xem tất cả →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.slice(0, 4).map(course => (
              <CourseCard key={course.id} course={{ ...course, category: categories.find(c => c.id === course.category_id) }} showActions={true} />
            ))}
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ===== COMBO SECTION ===== */}
      <ScrollReveal>
        <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-primary-900 via-secondary-900 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Combo tiết kiệm</h2>
              <p className="text-blue-200 mt-1">Mua combo, tiết kiệm đến 45%</p>
            </div>
            <Link href="/combos" className="text-sm font-medium text-blue-300 hover:text-white transition-colors">Xem tất cả →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {combosList.slice(0, 3).map(combo => {
              const discount = combo.sale_price ? calcDiscount(combo.price, combo.sale_price) : 0;
              const inCart = cartItems.some(item => item.id === combo.id);
              return (
                <Link key={combo.id} href="/combos"
                  className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden hover:bg-white/20 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                  <div className="relative h-40 overflow-hidden flex-shrink-0">
                    <Image src={combo.image} alt={combo.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      -{discount}%
                    </div>
                    <div className="absolute bottom-3 left-3 text-white text-xs font-medium">
                      {combo.courses?.length} khóa học
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-white mb-1 line-clamp-2 leading-snug">{combo.title}</h3>
                      <p className="text-xs text-blue-200 mb-3 line-clamp-2">{combo.description}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg font-bold text-yellow-400">{formatPrice(combo.sale_price || combo.price)}</span>
                        {combo.sale_price && <span className="text-sm text-gray-400 line-through">{formatPrice(combo.price)}</span>}
                      </div>
                      {combo.status === 'inactive' ? (
                        <div className="mt-auto animate-fade-in" onClick={e => e.preventDefault()}>
                          <button
                            disabled
                            title="Combo này hiện đang ngừng cung cấp"
                            className="w-full text-center py-2 bg-gray-500/20 text-gray-400 text-xs font-bold rounded-xl cursor-not-allowed relative group/tooltip border border-gray-700/50"
                          >
                            Ngừng cung cấp
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block bg-gray-950 text-white text-[10px] font-medium py-1 px-2 rounded shadow-lg whitespace-nowrap z-20 pointer-events-none border border-gray-800">
                              Combo này hiện đã ngừng cung cấp!
                            </span>
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 mt-auto" onClick={e => e.preventDefault()}>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (!user) {
                                setAuthRedirectUrl('/');
                                setShowAuthModal(true);
                                return;
                              }
                              addToCart(combo, 'combo');
                              setIsCartOpen(true);
                            }}
                            className={`py-2 text-xs font-bold rounded-xl border transition-all duration-200 ${
                              inCart
                                ? 'border-green-500 text-green-400 bg-green-500/10'
                                : 'border-white/30 text-white hover:bg-white/10'
                            }`}
                          >
                            {inCart ? '✓ Đã thêm' : 'Thêm giỏ'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
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
                            className="py-2 text-xs font-bold rounded-xl bg-yellow-500 text-gray-900 hover:bg-yellow-400 hover:shadow-md transition-all duration-200"
                          >
                            Mua ngay
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ===== NEW COURSES ===== */}
      <ScrollReveal>
        <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-title">Khóa học mới ra mắt</h2>
              <p className="section-subtitle">Cập nhật những kiến thức mới nhất</p>
            </div>
            <Link href="/courses?filter=new" className="text-sm font-medium text-primary-600 hover:text-primary-700">Xem tất cả →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newCourses.slice(0, 4).map(course => (
              <CourseCard key={course.id} course={{ ...course, category: categories.find(c => c.id === course.category_id) }} showActions={true} />
            ))}
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ===== BESTSELLERS ===== */}
      <ScrollReveal>
        <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-title">Khóa học bán chạy</h2>
              <p className="section-subtitle">Được hàng nghìn khách hàng đăng ký</p>
            </div>
            <Link href="/courses?filter=bestseller" className="text-sm font-medium text-primary-600 hover:text-primary-700">Xem tất cả →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestsellers.map(course => (
              <CourseCard key={course.id} course={{ ...course, category: categories.find(c => c.id === course.category_id) }} showActions={true} />
            ))}
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ===== ON SALE ===== */}
      <ScrollReveal>
        <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <h2 className="section-title text-red-600">Đang khuyến mãi</h2>
              </div>
              <p className="section-subtitle">Ưu đãi có giới hạn — Đừng bỏ lỡ!</p>
            </div>
            <Link href="/courses?filter=sale" className="text-sm font-medium text-primary-600 hover:text-primary-700">Xem tất cả →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {onSale.slice(0, 4).map(course => (
              <CourseCard key={course.id} course={{ ...course, category: categories.find(c => c.id === course.category_id) }} showActions={true} />
            ))}
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ===== SECTION 1: LÝ DO MUA KHÓA HỌC ===== */}
      <ScrollReveal>
        <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-gray-800 tracking-tight uppercase relative inline-block pb-3">
              LÝ DO BẠN NÊN MUA KHOÁ HỌC CỦA CHÚNG TÔI
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-yellow-500 rounded-full" />
            </h2>
          </div>
          
          <div className="border border-gray-200/80 rounded-3xl bg-white p-8 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Item 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-9 h-9 text-gray-500" strokeWidth={1.5} />
                </div>
                <div className="flex items-center gap-0.5 text-yellow-500 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-sm">★</span>
                  ))}
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-1">Giảng viên uy tín</h3>
                <p className="text-xs text-gray-500">Bài giảng chất lượng</p>
              </div>

              {/* Item 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <DollarSign className="w-9 h-9 text-gray-500" strokeWidth={1.5} />
                </div>
                <div className="flex items-center gap-0.5 text-yellow-500 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-sm">★</span>
                  ))}
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-1">Thanh toán 1 lần</h3>
                <p className="text-xs text-gray-500">Học mãi mãi</p>
              </div>

              {/* Item 3 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Laptop className="w-9 h-9 text-gray-500" strokeWidth={1.5} />
                </div>
                <div className="flex items-center gap-0.5 text-yellow-500 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-sm">★</span>
                  ))}
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-1">Học trên Google Drive</h3>
                <p className="text-xs text-gray-500">Dễ dàng tiện lợi</p>
              </div>

              {/* Item 4 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <RefreshCw className="w-9 h-9 text-gray-500" strokeWidth={1.5} />
                </div>
                <div className="flex items-center gap-0.5 text-yellow-500 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-sm">★</span>
                  ))}
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-1">Update Liên Tục</h3>
                <p className="text-xs text-gray-500">Cập Nhật Khóa Học Mỗi Ngày</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>



      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        redirectUrl={authRedirectUrl}
      />
    </div>
  );
}
