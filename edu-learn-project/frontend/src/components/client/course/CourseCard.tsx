'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Course } from '@/types';
import { formatPrice, calcDiscount } from '@/lib/utils/helpers';
import StarRating from '@/components/ui/StarRating';
import { useCart } from '@/lib/hooks/useCart';
import { useAuth } from '@/lib/hooks/useAuth';
import AuthModal from '@/components/client/layout/AuthModal';

interface CourseCardProps {
  course: Course;
  size?: 'sm' | 'md';
  showActions?: boolean;
}

export default function CourseCard({ course, size = 'md', showActions = false }: CourseCardProps) {
  const router = useRouter();
  const discount = course.sale_price ? calcDiscount(course.price, course.sale_price) : 0;
  const { addToCart, cartItems, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const inCart = cartItems.some(item => item.id === course.id);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { setShowAuthModal(true); return; }
    addToCart(course, 'course');
    setIsCartOpen(true);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { setShowAuthModal(true); return; }
    const buyNowData = {
      id: course.id,
      type: 'course',
      course: course,
      quantity: 1
    };
    sessionStorage.setItem('buyNowItem', JSON.stringify(buyNowData));
    router.push('/checkout?buynow=true');
  };

  return (
    <Link href={`/courses/${course.id}`} className="group block">
      <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 h-full flex flex-col">
        {/* Thumbnail */}
        <div className="relative overflow-hidden aspect-video flex-shrink-0">
          <Image src={course.image} alt={course.title} fill className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 400px" />
          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex gap-1.5">
            {course.is_bestseller && <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Bán chạy</span>}
            {course.is_new && <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Mới</span>}
            {discount > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">-{discount}%</span>}
          </div>
          {/* Play overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300">
              <svg className="w-5 h-5 text-primary-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 flex-1 flex flex-col">
          {/* Category */}
          <span className="text-xs font-medium text-primary-600 mb-1.5 block">
            {course.category?.name || 'Khóa học'}
          </span>

          {/* Title */}
          <h3 className={`font-semibold text-gray-900 line-clamp-2 mb-2 leading-snug flex-1 ${size === 'sm' ? 'text-xs sm:text-sm' : 'text-sm md:text-base lg:text-lg'}`}>
            {course.title}
          </h3>

          {/* Instructor */}
          {course.instructor && (
            <p className="text-xs md:text-sm text-gray-500 mb-2">👨‍🏫 {course.instructor}</p>
          )}

          {/* Rating */}
          {course.rating && (
            <div className="mb-3">
              <StarRating rating={course.rating} reviews={course.reviews_count} />
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-400 mb-3">
            {course.lessons_count && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {course.lessons_count} bài
              </span>
            )}
            {course.duration && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {course.duration}
              </span>
            )}
            {course.level && (() => {
              const lvl = course.level.toLowerCase();
              const isAdv = lvl.includes('nâng') || lvl.includes('adv') || lvl.includes('advanced');
              const isMid = lvl.includes('trung') || lvl.includes('inter') || lvl.includes('mid');
              const color = isAdv
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : isMid
                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                : 'bg-emerald-50 text-emerald-600 border border-emerald-200';
              const dot = isAdv ? 'bg-rose-500' : isMid ? 'bg-amber-500' : 'bg-emerald-500';
              return (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full ${color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                  {course.level}
                </span>
              );
            })()}
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100 mb-3">
            <span className="text-base sm:text-lg font-bold text-primary-600">
              {formatPrice(course.sale_price || course.price)}
            </span>
            {course.sale_price && (
              <span className="text-xs sm:text-sm text-gray-400 line-through">{formatPrice(course.price)}</span>
            )}
          </div>

          {/* Action Buttons (only when showActions = true) */}
          {showActions && (
            course.status === 'inactive' ? (
              <div className="mt-auto" onClick={e => { e.preventDefault(); e.stopPropagation(); }}>
                <button
                  disabled
                  title="Khóa học này hiện đang ngừng cung cấp"
                  className="w-full text-center py-2 bg-gray-300 text-gray-500 text-xs font-bold rounded-xl cursor-not-allowed relative group/tooltip"
                >
                  Ngừng cung cấp
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block bg-gray-900 text-white text-[10px] font-medium py-1.5 px-2.5 rounded-lg shadow-xl whitespace-nowrap z-20 pointer-events-none border border-gray-800">
                    Khóa học này hiện đã ngừng cung cấp!
                  </span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 mt-auto" onClick={e => e.preventDefault()}>
                <button
                  onClick={handleAddToCart}
                  className={`py-2 text-xs font-bold rounded-lg border-2 transition-all duration-300 ${
                    inCart
                      ? 'border-green-500 text-green-600 bg-green-50'
                      : 'border-primary-500 text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  {inCart ? '✓ Đã thêm' : 'Thêm giỏ'}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                >
                  Mua ngay
                </button>
              </div>
            )
          )}
        </div>
      </div>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        redirectUrl={`/courses/${course.id}`}
      />
    </Link>
  );
}

