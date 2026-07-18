'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/utils/api';

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category_name?: string;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [visibleCount, setVisibleCount] = useState(6);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Reset pagination on search query or category changes
  useEffect(() => {
    setVisibleCount(6);
  }, [searchQuery, selectedCatId]);

  // Fetch categories once on mount
  useEffect(() => {
    api.getBlogCategories()
      .then(setCategories)
      .catch(err => console.error('Failed to fetch categories:', err));
  }, []);

  // Fetch blogs when selected category changes
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const data = await api.getBlogs(selectedCatId || undefined);
        setBlogs(data);
      } catch (err) {
        console.error('Failed to fetch blogs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [selectedCatId]);

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasMore = visibleCount < filteredBlogs.length;

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + 6, filteredBlogs.length));
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
  }, [hasMore, filteredBlogs.length]);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Banner */}
      <div className="bg-[#302E81] py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900 opacity-90"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <nav className="flex items-center gap-2 text-sm text-blue-200 mb-3">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-white font-medium">Blog</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Blog & Tin tức</h1>
          <p className="text-blue-200 mt-2 text-sm max-w-xl">
            Cập nhật kiến thức mới nhất, tin tức sự kiện và hướng dẫn học tập từ các chuyên gia.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Category Filter Sidebar */}
          <aside className="w-full lg:w-64 shrink-0 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-4 uppercase tracking-wider">📁 Chuyên mục</h3>
              <div className="flex flex-wrap lg:flex-col gap-2">
                <button
                  onClick={() => setSelectedCatId('')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-left transition-all ${
                    selectedCatId === ''
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  Tất cả bài viết
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCatId(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-left transition-all ${
                      selectedCatId === cat.id
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Blogs Grid & Search */}
          <div className="flex-1">
            {/* Search Input */}
            <div className="mb-6 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="🔍 Tìm kiếm bài viết theo tiêu đề..."
                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 pl-12 text-slate-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 focus:outline-none transition-all shadow-sm text-sm"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

             {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm animate-pulse border border-slate-100">
                    <div className="h-44 bg-slate-200" />
                    <div className="p-5 space-y-3">
                      <div className="h-3 bg-slate-200 rounded w-1/3" />
                      <div className="h-5 bg-slate-200 rounded" />
                      <div className="h-5 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/4 mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="text-center py-20 text-slate-400 bg-white rounded-3xl border border-slate-100">
                Chưa có bài viết nào phù hợp với tìm kiếm của bạn.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBlogs.slice(0, visibleCount).map((blog) => (
                    <Link
                    key={blog.id}
                    href={`/blog/${blog.id}`}
                    className="group bg-white rounded-3xl overflow-hidden shadow-card border border-slate-100/80 hover:shadow-lg transition-all duration-300 flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                      {blog.image ? (
                        <Image
                          src={blog.image}
                          alt={blog.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center text-slate-500 gap-2">
                          <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">No Image</span>
                        </div>
                      )}
                      {blog.category_name && (
                        <span className="absolute top-3 left-3 bg-primary-600/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-sm">
                          {blog.category_name}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                      {/* Meta */}
                      <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatDate(blog.created_at)}
                        </span>
                        <span>•</span>
                        <span>Admin</span>
                      </div>

                      {/* Title */}
                      <h2 className="font-bold text-slate-800 text-base leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors mb-3 flex-1">
                        {blog.title}
                      </h2>

                      {/* Read more */}
                      <div className="flex items-center gap-1 text-primary-600 text-sm font-semibold group-hover:gap-2 transition-all mt-2 border-t border-slate-100 pt-3">
                        Đọc bài viết
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
                </div>

                {/* Sentinel for Infinite Scroll */}
                {hasMore && (
                  <div ref={loadMoreRef} className="py-8 flex justify-center items-center w-full">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-slate-500 font-medium">Đang tải thêm bài viết...</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
