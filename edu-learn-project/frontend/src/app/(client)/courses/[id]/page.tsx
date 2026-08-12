'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/lib/hooks/useCart';
import { api } from '@/lib/utils/api';
import { Course, Category, CourseContent } from '@/types';
import { getAuthToken } from '@/lib/utils/auth';
import { formatPrice, calcDiscount } from '@/lib/utils/helpers';
import StarRating from '@/components/ui/StarRating';
import Badge from '@/components/ui/Badge';
import CourseCard from '@/components/client/course/CourseCard';
import { useSiteSettings } from '@/lib/useSiteSettings';

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { settings } = useSiteSettings();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [related, setRelated] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPurchased, setIsPurchased] = useState(false);

  const [activeTab, setActiveTab] = useState<'overview' | 'content'>('overview');
  const [openChapters, setOpenChapters] = useState<string[]>([]);
  
  const { cartItems, addToCart, removeFromCart } = useCart();

  const contentChapters: CourseContent[] = course
    ? (course.content && course.content.length > 0
      ? course.content
      : getDefaultContentChapters(course.title))
    : [];

  // Automatically expand the first chapter on load
  useEffect(() => {
    if (contentChapters.length > 0 && openChapters.length === 0) {
      setOpenChapters([contentChapters[0].id]);
    }
  }, [contentChapters]);

  useEffect(() => {
    setLoading(true);
    api.getCourseDetail(params.id)
      .then(async (data) => {
        setCourse(data);
        if (data) {
          const cats = await api.getCategories();
          const cat = cats.find((c: any) => c.id === data.category_id);
          setCategory(cat || null);

          // Get related courses from database
          const allCourses = await api.getCourses();
          const rel = allCourses.filter((c: any) => c.category_id === data.category_id && c.id !== data.id).slice(0, 4);
          setRelated(rel);

          // Check if this course is purchased by the current user
          const token = getAuthToken();
          if (token) {
            try {
              const myCourses = await api.getMyCourses();
              const purchased = myCourses.some((c: any) => c.id === data.id);
              setIsPurchased(purchased);
            } catch (err) {
              console.error('Lỗi khi kiểm tra trạng thái sở hữu khóa học:', err);
            }
          }
        }
      })
      .catch((err) => {
        console.error('Lỗi khi tải chi tiết khóa học:', err);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  // Capture affiliate ref param and persist it for checkout
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      localStorage.setItem('affiliate_ref', ref);
    }
  }, [searchParams]);

  // Set page-specific document title for SEO
  useEffect(() => {
    if (course) {
      document.title = `${course.title} | ${settings?.site_name || 'DRIVE ORD'}`;
    }
  }, [course, settings]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium">Đang tải chi tiết khóa học...</p>
      </div>
    );
  }

  if (!course) {
    return notFound();
  }

  const inCart = cartItems.some(item => item.id === course.id);
  const discount = course.sale_price ? calcDiscount(course.price, course.sale_price) : 0;

  const handleToggleCart = () => {
    if (inCart) {
      removeFromCart(course.id);
    } else {
      addToCart(course, 'course');
    }
  };

  const handleBuyNow = () => {
    const buyNowData = {
      id: course.id,
      type: 'course',
      course: course,
      quantity: 1
    };
    sessionStorage.setItem('buyNowItem', JSON.stringify(buyNowData));
    router.push('/checkout?buynow=true');
  };

  const toggleChapter = (chapterId: string) => {
    setOpenChapters(current => (
      current.includes(chapterId)
        ? current.filter(id => id !== chapterId)
        : [...current, chapterId]
    ));
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Top info bar */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <nav className="text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-white">Trang chủ</Link>
            <span className="mx-2">/</span>
            <Link href="/courses" className="hover:text-white">Khóa học</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-250">{course.title}</span>
          </nav>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Badge variant="blue" size="md" className="mb-3">{category?.name || 'Khác'}</Badge>
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-4">{course.title}</h1>
              <div className="text-gray-300 mb-5 leading-relaxed text-sm prose prose-invert" dangerouslySetInnerHTML={{ __html: course.description }} />
              {course.rating && (
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-yellow-400 font-bold text-base">{course.rating}</span>
                    <StarRating rating={course.rating} showValue={false} />
                  </div>
                  <span className="text-sm text-gray-450">({course.reviews_count || 0} đánh giá)</span>
                  <span className="text-sm text-gray-450">{course.students_count || 0} khách hàng</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="flex border-b border-gray-100 bg-gray-50/50">
                {[['overview', 'Mô tả'], ['content', 'Nội dung khóa học']].map(([tab, label]) => (
                  <button key={tab} onClick={() => setActiveTab(tab as typeof activeTab)}
                    className={`flex-1 py-4 text-sm font-medium transition-all ${
                      activeTab === tab ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50' : 'text-gray-500 hover:text-gray-700'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div>
                    {course.description ? (
                      <div className="text-gray-650 text-sm leading-relaxed prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: course.description }} />
                    ) : (
                      <p className="text-sm text-gray-400">Chưa có mô tả cho khóa học này.</p>
                    )}
                  </div>
                )}

                {/* Content Tab */}
                {activeTab === 'content' && (
                  <div className="space-y-3">
                    {contentChapters.length > 0 ? contentChapters.map((chapter, index) => {
                      const isOpen = openChapters.includes(chapter.id);
                      return (
                        <div key={chapter.id} className="bg-slate-50/50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-200">
                          <button
                            type="button"
                            onClick={() => toggleChapter(chapter.id)}
                            className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-slate-800 hover:bg-white transition-colors"
                          >
                            <span><span className="mr-2 text-primary-600">Chương {index + 1}:</span>{chapter.title}</span>
                            <svg className={`w-5 h-5 flex-shrink-0 text-primary-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {isOpen && (
                            <div className="divide-y divide-slate-100 border-t border-slate-100">
                              {chapter.lessons.length > 0 ? chapter.lessons.map((lesson, lessonIndex) => (
                                <div key={lesson.id} className="flex gap-3 px-5 py-3 text-sm text-slate-600">
                                  <span className="font-semibold text-primary-600">{index + 1}.{lessonIndex + 1}</span>
                                  <span>{lesson.title}</span>
                                </div>
                              )) : (
                                <p className="px-5 py-4 text-sm text-slate-500">Chưa có mục con cho chương này.</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }) : (
                      <p className="text-center py-8 text-sm text-slate-500">Admin đang cập nhật nội dung khóa học.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Related Courses */}
            {related.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-5">Khóa học liên quan</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {related.map(r => <CourseCard key={r.id} course={{ ...r, category: category || undefined }} size="sm" />)}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Purchase Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-card sticky top-20 overflow-hidden border border-gray-100">
              {/* Thumbnail */}
              <div className="relative h-48 overflow-hidden bg-slate-100">
                {course.image ? (
                  <Image src={course.image} alt={course.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-semibold">No Image</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              <div className="p-5">
                {/* Price */}
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-3xl font-bold text-primary-600">{formatPrice(course.sale_price || course.price)}</span>
                  {discount > 0 && <span className="text-base text-red-500 font-bold mb-0.5">-{discount}%</span>}
                </div>
                {course.sale_price && (
                  <p className="text-sm text-gray-400 line-through mb-4">{formatPrice(course.price)}</p>
                )}

                {/* Actions */}
                <div className="space-y-3 mb-5">
                  {isPurchased ? (
                    <div className="space-y-3">
                      <div className="w-full text-center py-2.5 bg-green-50 text-green-700 text-sm font-bold rounded-xl border border-green-200">
                        ✓ Bạn đã sở hữu khóa học này
                      </div>
                      <Link href="/tai-khoan?tab=courses" className="block w-full text-center py-3.5 bg-gradient-brand text-white font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                        Vào học ngay
                      </Link>
                      <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-200 text-xs leading-relaxed text-left">
                        <span className="font-bold text-red-700">⚠️ Hướng dẫn vào học: </span>
                        <span className="font-bold text-red-600">Kiểm tra email đã đăng ký, mở thư hướng dẫn và dùng liên kết Google Drive để bắt đầu học.</span>
                      </div>
                    </div>
                  ) : course.status === 'inactive' ? (
                    <button
                      disabled
                      title="Khóa học này hiện đang ngừng cung cấp"
                      className="w-full text-center py-3.5 bg-gray-300 text-gray-500 font-bold rounded-xl cursor-not-allowed relative group/tooltip"
                    >
                      Ngừng cung cấp
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block bg-gray-950 text-white text-[11px] font-medium py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap z-20 pointer-events-none border border-gray-800">
                        Khóa học này hiện đã ngừng cung cấp!
                      </span>
                    </button>
                  ) : (
                    <>
                      <button onClick={handleBuyNow} className="block w-full text-center py-3.5 bg-gradient-brand text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all duration-300">
                        Mua ngay
                      </button>
                      <button onClick={handleToggleCart}
                        className={`w-full py-3.5 font-bold rounded-xl border-2 transition-all duration-300 ${
                          inCart ? 'border-green-500 text-green-600 bg-green-50' : 'border-primary-600 text-primary-600 hover:bg-primary-50'
                        }`}>
                        {inCart ? '✓ Đã thêm vào giỏ' : 'Thêm vào giỏ hàng'}
                      </button>
                    </>
                  )}
                </div>

                {/* Features / Highlights */}
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="font-bold text-gray-900 text-sm mb-3">Bạn sẽ nhận được gì?</h4>
                  <div className="space-y-2.5 text-sm text-gray-650">
                    {course.highlights && course.highlights.length > 0 ? (
                      course.highlights.map((highlight, index) => (
                        <div key={`${highlight}-${index}`} className="flex items-start gap-2.5">
                          <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="leading-tight">{highlight}</span>
                        </div>
                      ))
                    ) : (
                      // Fallback highlights if database has none
                      [
                        'Kiến thức chuyên sâu và thực chiến',
                        'Tài liệu & source code dự án',
                        'Hỗ trợ giải đáp thắc mắc từ giảng viên',
                        'Chứng chỉ hoàn thành khóa học',
                        'Cập nhật nội dung học tập trọn đời'
                      ].map((text, idx) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="leading-tight">{text}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fallback curriculum if database has none
function getDefaultContentChapters(courseTitle: string): CourseContent[] {
  const titleLower = courseTitle.toLowerCase();
  if (titleLower.includes('web') || titleLower.includes('frontend') || titleLower.includes('full stack') || titleLower.includes('next.js') || titleLower.includes('react') || titleLower.includes('node') || titleLower.includes('javascript') || titleLower.includes('python')) {
    return [
      {
        id: 'fb-ch-1',
        title: 'Chương 1: Giới thiệu & Thiết lập Môi trường',
        lessons: [
          { id: 'fb-le-1-1', title: 'Giới thiệu tổng quan lộ trình học lập trình Web', duration: '12:00', type: 'video' },
          { id: 'fb-le-1-2', title: 'Cài đặt và cấu hình công cụ lập trình VS Code', duration: '18:30', type: 'video' },
          { id: 'fb-le-1-3', title: 'Hướng dẫn sử dụng tài liệu học tập hiệu quả', duration: '05:00', type: 'document' }
        ]
      },
      {
        id: 'fb-ch-2',
        title: 'Chương 2: Kiến thức nền tảng và cú pháp cơ bản',
        lessons: [
          { id: 'fb-le-2-1', title: 'Cấu trúc thư mục dự án và các lệnh cơ bản', duration: '22:15', type: 'video' },
          { id: 'fb-le-2-2', title: 'Làm quen với cú pháp và các kiểu dữ liệu cốt lõi', duration: '28:40', type: 'video' },
          { id: 'fb-le-2-3', title: 'Thực hành: Viết chương trình đầu tiên của bạn', duration: '45:00', type: 'video' }
        ]
      },
      {
        id: 'fb-ch-3',
        title: 'Chương 3: Đi sâu thực hành và xây dựng tính năng',
        lessons: [
          { id: 'fb-le-3-1', title: 'Xử lý logic phức tạp, làm việc với hàm và sự kiện', duration: '25:10', type: 'video' },
          { id: 'fb-le-3-2', title: 'Tương tác dữ liệu và cấu trúc lưu trữ thông tin', duration: '30:20', type: 'video' },
          { id: 'fb-le-3-3', title: 'Thực hành: Hoàn thiện tính năng chính của ứng dụng', duration: '40:15', type: 'video' }
        ]
      },
      {
        id: 'fb-ch-4',
        title: 'Chương 4: Tối ưu hóa hiệu năng & Triển khai dự án',
        lessons: [
          { id: 'fb-le-4-1', title: 'Kiểm thử ứng dụng và xử lý các trường hợp lỗi thường gặp', duration: '35:00', type: 'video' },
          { id: 'fb-le-4-2', title: 'Tối ưu hóa tốc độ tải và hiệu năng xử lý', duration: '28:30', type: 'video' },
          { id: 'fb-le-4-3', title: 'Hướng dẫn đưa dự án lên Internet (Deploy / Hosting)', duration: '50:00', type: 'video' }
        ]
      }
    ];
  } else if (titleLower.includes('design') || titleLower.includes('ui') || titleLower.includes('ux') || titleLower.includes('figma')) {
    return [
      {
        id: 'fb-ch-1',
        title: 'Chương 1: Tư duy Thiết kế & Quy trình UX',
        lessons: [
          { id: 'fb-le-1-1', title: 'Tổng quan về ngành UI/UX Design', duration: '10:00', type: 'video' },
          { id: 'fb-le-1-2', title: 'Nghiên cứu người dùng (User Research) & Xây dựng Persona', duration: '20:30', type: 'video' },
          { id: 'fb-le-1-3', title: 'Sơ đồ trải nghiệm người dùng (User Journey Map)', duration: '15:00', type: 'video' }
        ]
      },
      {
        id: 'fb-ch-2',
        title: 'Chương 2: Làm chủ Công cụ Thiết kế Figma',
        lessons: [
          { id: 'fb-le-2-1', title: 'Làm quen giao diện Figma & Các phím tắt cơ bản', duration: '15:45', type: 'video' },
          { id: 'fb-le-2-2', title: 'Sử dụng Auto Layout để thiết kế responsive', duration: '32:10', type: 'video' },
          { id: 'fb-le-2-3', title: 'Quản lý màu sắc, Typography với Text & Color Styles', duration: '25:00', type: 'video' }
        ]
      },
      {
        id: 'fb-ch-3',
        title: 'Chương 3: Thiết kế Giao diện Chi tiết (UI Design)',
        lessons: [
          { id: 'fb-le-3-1', title: 'Nguyên lý thiết kế: Tương phản, Cân bằng, Nhịp điệu', duration: '18:20', type: 'video' },
          { id: 'fb-le-3-2', title: 'Thiết kế hệ thống Component: Buttons, Inputs, Cards', duration: '30:15', type: 'video' },
          { id: 'fb-le-3-3', title: 'Thực hành: Thiết kế giao diện Mobile App bán hàng', duration: '55:00', type: 'video' }
        ]
      }
    ];
  } else {
    return [
      {
        id: 'fb-ch-1',
        title: 'Chương 1: Nhập môn và kiến thức nền tảng',
        lessons: [
          { id: 'fb-le-1-1', title: 'Giới thiệu tổng quan về khóa học', duration: '08:30', type: 'video' },
          { id: 'fb-le-1-2', title: 'Các thuật ngữ và khái niệm cốt lõi cần nhớ', duration: '14:20', type: 'video' },
          { id: 'fb-le-1-3', title: 'Tài liệu hướng dẫn cài đặt và học tập đi kèm', duration: '05:00', type: 'document' }
        ]
      },
      {
        id: 'fb-ch-2',
        title: 'Chương 2: Đi sâu vào chi tiết các nội dung trọng tâm',
        lessons: [
          { id: 'fb-le-2-1', title: 'Phương pháp tiếp cận và giải quyết vấn đề', duration: '18:15', type: 'video' },
          { id: 'fb-le-2-2', title: 'Các bước thực hành thực tế chi tiết theo bài học', duration: '24:50', type: 'video' },
          { id: 'fb-le-2-3', title: 'Bài tập tình huống và phân tích tình huống thực tế', duration: '15:00', type: 'document' }
        ]
      },
      {
        id: 'fb-ch-3',
        title: 'Chương 3: Thực hành dự án cuối khóa & Tổng kết',
        lessons: [
          { id: 'fb-le-3-1', title: 'Hướng dẫn làm bài tập lớn/dự án cuối khóa', duration: '22:10', type: 'video' },
          { id: 'fb-le-3-2', title: 'Đánh giá, sửa lỗi và tối ưu kết quả thực hành', duration: '19:45', type: 'video' },
          { id: 'fb-le-3-3', title: 'Lời khuyên từ giảng viên và các bước đi tiếp theo', duration: '12:00', type: 'video' }
        ]
      }
    ];
  }
}
