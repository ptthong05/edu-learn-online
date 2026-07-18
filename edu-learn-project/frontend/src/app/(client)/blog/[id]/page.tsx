'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/utils/api';
import { useSiteSettings } from '@/lib/useSiteSettings';

interface Blog {
  id: string;
  title: string;
  category_id: string | null;
  category_name?: string;
  toc: string;
  excerpt: string;
  content: string;
  image: string;
  created_at: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number; // 2 = h2, 3 = h3
  index: number;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

/** Parse headings from HTML string and inject IDs */
function parseAndInjectIds(html: string): { toc: TocItem[]; processedHtml: string } {
  const toc: TocItem[] = [];
  let index = 0;

  const processedHtml = html.replace(/<(h[23])[^>]*>(.*?)<\/h[23]>/gi, (match, tag, inner) => {
    const level = parseInt(tag[1]);
    const text = inner.replace(/<[^>]+>/g, '').trim();
    const id = `heading-${index}`;
    toc.push({ id, text, level, index });
    index++;
    return `<${tag} id="${id}">${inner}</${tag}>`;
  });

  return { toc, processedHtml };
}

export default function BlogDetailPage() {
  const params = useParams();
  const { settings } = useSiteSettings();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [allBlogs, setAllBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoToc, setAutoToc] = useState<TocItem[]>([]);
  const [processedContent, setProcessedContent] = useState('');
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [blogData, blogsData] = await Promise.all([
          api.getBlogDetail(params.id as string),
          api.getBlogs(),
        ]);
        setBlog(blogData);
        setAllBlogs(blogsData);

        const { toc: parsedToc, processedHtml } = parseAndInjectIds(blogData.content);
        setAutoToc(parsedToc);
        setProcessedContent(processedHtml);
      } catch (err: any) {
        setError(err.message || 'Không thể tải bài viết.');
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchData();
  }, [params.id]);

  // Highlight active TOC item on scroll (only if using auto TOC)
  useEffect(() => {
    if (autoToc.length === 0) return;
    const handleScroll = () => {
      const scrollY = window.scrollY + 140;
      let current = autoToc[0]?.id || '';
      for (const item of autoToc) {
        const el = document.getElementById(item.id);
        if (el && el.offsetTop <= scrollY) current = item.id;
      }
      setActiveId(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [autoToc]);

  // Set page-specific document title for SEO
  useEffect(() => {
    if (blog) {
      document.title = `${blog.title} | ${settings?.site_name || 'DRIVE ORD'}`;
    }
  }, [blog, settings]);

  // Handle TOC navigation (smart text matching for custom TOC or direct scroll for auto TOC)
  const handleTocClick = (item: { id: string; text: string }, isCustom: boolean) => {
    if (!isCustom) {
      const el = document.getElementById(item.id);
      if (el) {
        const offset = 120;
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    } else {
      // Custom TOC: search for matching header content
      const headings = Array.from(document.querySelectorAll('h2, h3, h4'));
      const cleanedText = item.text.replace(/^\d+[\.\s]*/, '').toLowerCase().trim(); // remove leading "1.", "1.1"
      const target = headings.find(h => h.textContent?.toLowerCase().includes(cleanedText));
      if (target) {
        const offset = 120;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
        <div className="flex gap-8">
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-200 rounded w-1/2" />
            <div className="h-64 bg-slate-200 rounded-3xl mt-6" />
          </div>
          <div className="w-72 space-y-4">
            <div className="h-6 bg-slate-200 rounded" />
            {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-slate-200 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Oops!</h1>
        <p className="text-slate-500 mb-8">{error || 'Bài viết không tồn tại.'}</p>
        <Link href="/blog" className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-500 transition-colors">
          Quay lại danh sách Blog
        </Link>
      </div>
    );
  }

  const recentBlogs = allBlogs.filter(b => b.id !== blog.id).slice(0, 5);
  const relatedBlogs = allBlogs.filter(b => b.id !== blog.id).slice(0, 3);

  const displayTocItems = autoToc;
  const hasCustomToc = false;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Banner */}
      <div className="bg-[#302E81] py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900 opacity-90"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <nav className="flex items-center gap-2 text-sm text-blue-200 mb-3">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-white font-medium line-clamp-1 max-w-xs">{blog.title}</span>
          </nav>
          <div className="flex flex-wrap gap-2 items-center mb-2">
            {blog.category_name && (
              <span className="bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                {blog.category_name}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight max-w-3xl">
            {blog.title}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Main Content */}
          <article className="flex-1 min-w-0 bg-white rounded-3xl shadow-card border border-slate-100 p-6 lg:p-10">
            {/* Meta */}
            <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-400 mb-6 pb-5 border-b border-slate-100">
              <span className="flex items-center gap-1.5 font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Admin Website
              </span>
              <span className="text-slate-200">|</span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDate(blog.created_at)}
              </span>
            </div>

            {/* Table of Contents */}
            {displayTocItems.length > 0 && (
              <div className="mb-8 p-5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <p className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-2">
                  <span>📝</span> Mục lục bài viết
                </p>
                <ol className="space-y-2">
                  {displayTocItems.map((item) => (
                    <li
                      key={item.id}
                      className={item.level === 3 ? 'ml-5' : ''}
                    >
                      <button
                        onClick={() => handleTocClick(item, hasCustomToc)}
                        className={`text-left text-sm transition-colors hover:text-primary-600 ${
                          !hasCustomToc && activeId === item.id
                            ? 'text-primary-600 font-bold'
                            : 'text-slate-600 hover:underline'
                        } ${item.level === 2 ? 'font-semibold' : 'font-normal text-[13px]'}`}
                      >
                        {item.text}
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Featured Cover Image */}
            {blog.image && (
              <div className="relative w-full h-[240px] sm:h-[400px] rounded-3xl overflow-hidden shadow-sm mb-8 border border-slate-100">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Blog Content */}
            <div
              className="prose prose-base prose-slate max-w-none text-slate-600 leading-8 text-sm
                prose-h2:text-xl prose-h2:font-bold prose-h2:text-slate-900 prose-h2:mt-8 prose-h2:mb-3 prose-h2:border-b prose-h2:pb-2 prose-h2:border-slate-100
                prose-h3:text-base prose-h3:font-semibold prose-h3:text-slate-800 prose-h3:mt-5 prose-h3:mb-2
                prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-4
                prose-a:text-primary-600 prose-a:underline hover:prose-a:text-primary-500
                prose-img:rounded-3xl prose-img:shadow-sm"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />

            {/* Back button */}
            <div className="mt-12 pt-8 border-t border-slate-100">
              <Link href="/blog" className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-100 transition-all text-sm shadow-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                Quay lại danh sách Blog
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0 space-y-6">
            {/* Recent Posts */}
            <div className="bg-white rounded-3xl shadow-card overflow-hidden border border-slate-100/80 p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">🔥 Bài viết mới nhất</h3>
              <div className="space-y-4">
                {recentBlogs.length === 0 ? (
                  <p className="text-xs text-slate-400">Không có bài viết khác.</p>
                ) : (
                  recentBlogs.map(rb => (
                    <Link
                      key={rb.id}
                      href={`/blog/${rb.id}`}
                      className="flex gap-3 hover:opacity-85 transition-opacity group"
                    >
                      <div className="relative w-16 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-100">
                        {rb.image ? (
                          <Image
                            src={rb.image}
                            alt={rb.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                            <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-slate-400 mb-0.5">{formatDate(rb.created_at)}</p>
                        <p className="text-xs font-bold text-slate-700 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
                          {rb.title}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Related Posts */}
      {relatedBlogs.length > 0 && (
        <section className="bg-slate-100/60 py-12 border-t border-slate-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6">💡 Bài viết có thể bạn quan tâm</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedBlogs.map(rb => (
                <Link
                  key={rb.id}
                  href={`/blog/${rb.id}`}
                  className="group bg-white rounded-3xl overflow-hidden shadow-card border border-slate-100 hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    {rb.image ? (
                      <Image
                        src={rb.image}
                        alt={rb.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center text-slate-500 gap-1.5">
                        <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 mb-2">
                      <span>{formatDate(rb.created_at)}</span>
                      <span>•</span>
                      <span>Admin</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-primary-700 transition-colors mb-3 flex-1">
                      {rb.title}
                    </h3>
                    <div className="flex items-center gap-1 text-primary-600 text-xs font-semibold group-hover:gap-2 transition-all">
                      Đọc tiếp
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
