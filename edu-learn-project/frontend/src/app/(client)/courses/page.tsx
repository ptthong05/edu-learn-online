'use client';
export const dynamic = 'force-dynamic';
import { useState, useMemo, useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import CourseCard from '@/components/client/course/CourseCard';
import { api } from '@/lib/utils/api';
import { Course, Category } from '@/types';

function CoursesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlCategory = searchParams.get('category') || 'all';
  const urlSearch = searchParams.get('search') || '';

  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(urlSearch);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  const [visibleCount, setVisibleCount] = useState(8);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  // Reset pagination on filter or search changes
  useEffect(() => {
    setVisibleCount(8);
  }, [search, selectedCategory, priceRange, sortBy]);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getCourses(), api.getCategories()])
      .then(([coursesData, categoriesData]) => {
        setCoursesList(coursesData || []);
        setCategoriesList(categoriesData || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Sync URL params to state when header dropdown or search bar navigates
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'all');
  }, [searchParams]);

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  // Derive the active category object for title/breadcrumb
  const activeCat = selectedCategory !== 'all'
    ? categoriesList.find(c => c.id === selectedCategory)
    : null;

  const filtered = useMemo(() => {
    let result = coursesList.map(c => ({ ...c, category: categoriesList.find(cat => cat.id === c.category_id) }));
    if (search) result = result.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
    if (selectedCategory !== 'all') result = result.filter(c => c.category_id === selectedCategory);
    if (priceRange === 'free') result = result.filter(c => c.price === 0);
    else if (priceRange === 'under500k') result = result.filter(c => (c.sale_price || c.price) < 500000);
    else if (priceRange === 'under1m') result = result.filter(c => (c.sale_price || c.price) < 1000000);
    else if (priceRange === 'over1m') result = result.filter(c => (c.sale_price || c.price) >= 1000000);
    if (sortBy === 'price-asc') result.sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price));
    else if (sortBy === 'price-desc') result.sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price));
    else if (sortBy === 'rating') result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortBy === 'newest') result.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
    return result;
  }, [coursesList, categoriesList, search, selectedCategory, priceRange, sortBy]);

  const hasMore = visibleCount < filtered.length;

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + 8, filtered.length));
          }, 300);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, filtered.length]);

  const handleCategorySelect = (val: string) => {
    setSelectedCategory(val);
    if (val === 'all') {
      router.push('/courses');
    } else {
      router.push(`/courses?category=${val}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium">Đang tải danh sách khóa học...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-gradient-hero text-white py-12 md:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-blue-200 mb-3 flex items-center gap-1.5 flex-wrap">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            {activeCat && (
              <>
                <span>/</span>
                <Link href="/courses" className="hover:text-white transition-colors">Danh mục</Link>
                <span>/</span>
                <span className="text-white font-medium">{activeCat.name}</span>
              </>
            )}
            {!activeCat && (
              <>
                <span>/</span>
                <span className="text-white">Khóa học</span>
              </>
            )}
          </nav>

          {/* Dynamic Title */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold">
            {activeCat
              ? `Khóa học về ${activeCat.name}`
              : 'Tất cả khóa học'}
          </h1>
          <p className="text-sm md:text-base lg:text-lg text-blue-200 mt-2">
            {activeCat
              ? `${filtered.length} khóa học trong danh mục ${activeCat.name}`
              : `${coursesList.length > 0 ? coursesList.length + '+' : ''} khóa học chất lượng cho bạn lựa chọn`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8">
          {/* Mobile: Filter Toggle Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl shadow-md text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 010 2H4a1 1 0 01-1-1zM6 10a1 1 0 011-1h10a1 1 0 010 2H7a1 1 0 01-1-1zM9 16a1 1 0 011-1h4a1 1 0 010 2h-4a1 1 0 01-1-1z" />
                </svg>
                Bộ lọc
              </span>
              <svg className={`w-4 h-4 transition-transform ${filterOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Sidebar Filters */}
          <div className={`lg:w-64 flex-shrink-0 ${filterOpen ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-white rounded-xl p-4 md:p-6 lg:p-8 shadow-md sticky top-20">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Bộ lọc</h3>

              {/* Search Filter */}
              <div className="mb-5 pb-5 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-2">Tìm kiếm</p>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm khóa học..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50/50"
                  />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-5 pb-5 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-2.5">Danh mục</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input type="radio" name="category" value="all" checked={selectedCategory === 'all'}
                      onChange={() => handleCategorySelect('all')}
                      className="text-primary-600 focus:ring-primary-500 h-4 w-4 border-gray-300" />
                    <span className="text-sm text-gray-600 group-hover:text-primary-600 font-medium">Tất cả</span>
                  </label>
                  {categoriesList.map(cat => (
                    <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer group">
                      <input type="radio" name="category" value={cat.id} checked={selectedCategory === cat.id}
                        onChange={() => handleCategorySelect(cat.id)}
                        className="text-primary-600 focus:ring-primary-500 h-4 w-4 border-gray-300" />
                      <span className="text-sm text-gray-600 group-hover:text-primary-600 font-medium">{cat.icon} {cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2.5">Mức giá</p>
                <div className="space-y-2">
                  {[['all', 'Tất cả'], ['free', 'Miễn phí'], ['under500k', 'Dưới 500K'], ['under1m', 'Dưới 1 triệu'], ['over1m', 'Trên 1 triệu']].map(([val, label]) => (
                    <label key={val} className="flex items-center gap-2.5 cursor-pointer group">
                      <input type="radio" name="price" value={val} checked={priceRange === val}
                        onChange={e => setPriceRange(e.target.value)}
                        className="text-primary-600 focus:ring-primary-500 h-4 w-4 border-gray-300" />
                      <span className="text-sm text-gray-600 group-hover:text-primary-600 font-medium">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sorting Bar */}
            <div className="bg-white rounded-xl p-4 shadow-md mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500">
                Tìm thấy <span className="font-semibold text-gray-900">{filtered.length}</span> khóa học
                {activeCat && <span className="text-primary-600 font-semibold"> trong {activeCat.name}</span>}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-400 uppercase">Sắp xếp:</span>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                  <option value="popular">Phổ biến nhất</option>
                  <option value="rating">Đánh giá cao nhất</option>
                  <option value="newest">Mới nhất</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                </select>
              </div>
            </div>

            {/* Course Grid */}
            {filtered.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mb-8">
                  {filtered.slice(0, visibleCount).map(course => <CourseCard key={course.id} course={course} showActions />)}
                </div>
                
                {/* Sentinel for Infinite Scroll */}
                {hasMore && (
                  <div ref={loadMoreRef} className="py-8 flex justify-center items-center w-full">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-gray-500 font-medium">Đang tải thêm khóa học...</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 md:py-16 lg:py-20 px-4 bg-white rounded-xl shadow-md">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-700 mb-2">Không tìm thấy khóa học</h3>
                <p className="text-sm md:text-base lg:text-lg text-gray-400">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-500 font-medium">Đang tải danh sách khóa học...</p></div>}>
      <CoursesContent />
    </Suspense>
  );
}
