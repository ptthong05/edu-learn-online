'use client';
import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { api } from '@/lib/utils/api';
import { Category, Course, CourseContent, Lesson, Combo } from '@/types';
import { formatPrice } from '@/lib/utils/helpers';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const richTextModules = {
  toolbar: {
    container: [
    [{ header: [1, 2, 3, false] }],
    [{ font: [] }, { size: [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ align: [] }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    ['clean'],
    ],
  },
};

const richTextFormats = [
  'header', 'font', 'size', 'bold', 'italic', 'underline', 'strike',
  'color', 'background', 'script', 'list', 'bullet', 'indent', 'align',
  'blockquote', 'code-block', 'link', 'image', 'video',
];

const createLesson = (): Lesson => ({
  id: `lesson-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title: '',
  duration: '',
  type: 'document',
});

const createChapter = (): CourseContent => ({
  id: `chapter-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title: '',
  lessons: [createLesson()],
});

function RichEditor({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <div className="course-rich-editor w-full">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={richTextModules}
        formats={richTextFormats}
        placeholder={placeholder}
      />
    </div>
  );
}

function CategorySearchInput({
  categories,
  value,
  onChange,
  onCategoryCreated
}: {
  categories: Category[];
  value: string;
  onChange: (id: string) => void;
  onCategoryCreated: (cat: Category) => void;
}) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = categories.find(c => c.id === value);
  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  const exactMatch = categories.some(c => c.name.toLowerCase() === search.toLowerCase());

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCreate = async () => {
    if (!search.trim() || creating) return;
    setCreating(true);
    try {
      const newCat = await api.createCategory(search.trim());
      onCategoryCreated(newCat);
      onChange(newCat.id);
      setOpen(false);
      setSearch('');
      toast.success(`Đã tạo danh mục "${newCat.name}"`);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tạo danh mục.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <div
        className={`flex items-center w-full bg-gray-950 border rounded-xl px-4 py-3 cursor-pointer transition-colors text-sm ${
          open ? 'border-primary-500' : 'border-gray-700'
        }`}
        onClick={() => { setOpen(o => !o); setSearch(''); }}
      >
        <span className={`flex-1 ${selected ? 'text-white' : 'text-gray-500'}`}>
          {selected ? selected.name : 'Chọn danh mục'}
        </span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
          {/* Search box */}
          <div className="p-2 border-b border-gray-800">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && search.trim() && !exactMatch) { e.preventDefault(); handleCreate(); } }}
              placeholder="Tìm hoặc tạo danh mục mới..."
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-primary-500 focus:outline-none"
              onClick={e => e.stopPropagation()}
            />
          </div>

          {/* Options list */}
          <div className="max-h-48 overflow-y-auto">
            <div
              className="px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800 cursor-pointer"
              onClick={() => { onChange(''); setOpen(false); setSearch(''); }}
            >
              — Không có danh mục —
            </div>
            {filtered.map(cat => (
              <div
                key={cat.id}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                  cat.id === value
                    ? 'bg-primary-600/20 text-primary-400'
                    : 'text-gray-200 hover:bg-gray-800'
                }`}
                onClick={() => { onChange(cat.id); setOpen(false); setSearch(''); }}
              >
                {cat.name}
                {cat.id === value && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            ))}
            {filtered.length === 0 && !search.trim() && (
              <p className="px-4 py-3 text-sm text-gray-500 text-center">Chưa có danh mục nào</p>
            )}
          </div>

          {/* Create new category button */}
          {search.trim() && !exactMatch && (
            <div className="border-t border-gray-800 p-2">
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-primary-400 hover:bg-primary-600/10 rounded-lg transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {creating ? 'Đang tạo...' : `Tạo danh mục "${search.trim()}"`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [combosList, setCombosList] = useState<Combo[]>([]);
  const [comboFilter, setComboFilter] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const COURSES_PER_PAGE = 10;

  const filteredCourses = React.useMemo(() => {
    return courses.filter(course => {
      if (!comboFilter.trim()) return true;
      const q = comboFilter.toLowerCase().trim();
      const matchesCourseTitle = course.title.toLowerCase().includes(q);
      const matchesInstructor = (course.instructor || '').toLowerCase().includes(q);
      const matchingCombos = combosList.filter(combo =>
        combo.title.toLowerCase().includes(q)
      );
      const matchesCombo = matchingCombos.some(combo =>
        combo.courses?.some(c => c.id === course.id)
      );
      return matchesCourseTitle || matchesInstructor || matchesCombo;
    });
  }, [courses, comboFilter, combosList]);

  const totalPages = Math.ceil(filteredCourses.length / COURSES_PER_PAGE);
  const visibleCourses = filteredCourses.slice((currentPage - 1) * COURSES_PER_PAGE, currentPage * COURSES_PER_PAGE);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const [coursesData, catsData, combosData] = await Promise.all([
        api.getAdminCourses(),
        api.getCategories(),
        api.getCombos()
      ]);
      setCourses(coursesData);
      setCategoriesList(catsData);
      setCombosList(combosData || []);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tải danh sách khóa học.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [comboFilter]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [courses.length]);

  // Form states
  const [title, setTitle] = useState('');
  const [instructor, setInstructor] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [description, setDescription] = useState('');
  const [highlights, setHighlights] = useState<string[]>(['']);
  const [courseContent, setCourseContent] = useState<CourseContent[]>([]);
  const [courseImage, setCourseImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'published' | 'inactive' | 'draft'>('published');

  const openAddForm = () => {
    setEditCourse(null);
    setTitle('');
    setInstructor('');
    setCategory('');
    setPrice(0);
    setSalePrice(0);
    setDescription('');
    setHighlights(['']);
    setCourseContent([]);
    setCourseImage('');
    setStatus('published');
    setShowCourseForm(true);
  };

  const openEditForm = (c: Course) => {
    setEditCourse(c);
    setTitle(c.title);
    setInstructor(c.instructor || '');
    setCategory(c.category_id);
    setPrice(c.price);
    setSalePrice(c.sale_price || 0);
    setDescription(c.description || '');
    setHighlights(c.highlights?.length ? c.highlights : ['']);
    setCourseContent(c.content || []);
    setCourseImage(c.image || '');
    setStatus((c.status as any) || 'published');
    setShowCourseForm(true);
  };

  const handleSave = async () => {
    if (!title.trim() || price === undefined) {
      toast.error('Vui lòng nhập tên khóa học và giá.');
      return;
    }
    if (!category) {
      toast.error('Vui lòng chọn Category / Danh mục.');
      return;
    }
    if (!description || !description.replace(/<[^>]*>/g, '').trim()) {
      toast.error('Vui lòng nhập Short Description / Mô tả ngắn.');
      return;
    }

    try {
      const payload = {
        title: title.trim(),
        instructor: instructor.trim() || undefined,
        category_id: category,
        price,
        sale_price: salePrice > 0 ? salePrice : null,
        description,
        highlights: highlights.map(item => item.trim()).filter(Boolean),
        content: courseContent,
        image: courseImage || undefined,
        status
      };

      if (editCourse) {
        await api.updateCourse(editCourse.id, payload);
        toast.success('Cập nhật khóa học thành công.');
      } else {
        await api.createCourse(payload);
        toast.success('Thêm khóa học thành công.');
      }
      fetchCourses();
      setShowCourseForm(false);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu thông tin khóa học.');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.uploadImage(file);
      setCourseImage(res.url || res.image_url || res.imageUrl);
      toast.success('Tải ảnh bìa thành công!');
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải ảnh.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn chắc chắn muốn xóa khóa học này?')) {
      try {
        await api.deleteCourse(id);
        toast.success('Xóa khóa học thành công.');
        fetchCourses();
      } catch (err: any) {
        toast.error(err.message || 'Lỗi khi xóa khóa học.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Course List Table */}
      {!showCourseForm && (
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5 animate-fade-in">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-bold text-white text-lg">Danh sách khóa học</h3>
              <p className="mt-1 text-sm text-gray-400">Tạo mới hoặc chỉnh sửa thông tin khóa học.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                placeholder="Lọc theo tên combo..."
                value={comboFilter}
                onChange={(e) => setComboFilter(e.target.value)}
                className="bg-gray-950 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm focus:border-primary-500 focus:outline-none placeholder-gray-500 min-w-56"
              />
              <button type="button" onClick={openAddForm} className="w-full sm:w-auto bg-primary-600 hover:bg-primary-500 transition-colors px-5 py-3 rounded-xl text-sm font-bold text-white shadow-md whitespace-nowrap">
                + Tạo khóa học
              </button>
            </div>
          </div>
          <div className="overflow-x-auto border border-gray-800 rounded-xl bg-gray-950">
            <table className="w-full text-left border-collapse">
          <thead>
              <tr className="bg-gray-900/30 border-b border-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="p-4">KHÓA HỌC / Course Name</th>
                <th className="p-4">DANH MỤC / Category</th>
                <th className="p-4">GIÁ GỐC / Price/Sale Price</th>
                <th className="p-4">GIÁ BÁN / Students</th>
                <th className="p-4">TRẠNG THÁI / Status</th>
                <th className="p-4 text-right">THAO TÁC / Actions</th>
              </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 text-sm">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Đang tải danh sách khóa học...</td></tr>
              ) : visibleCourses.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">{comboFilter.trim() ? 'Không tìm thấy khóa học nào khớp bộ lọc.' : 'Chưa có khóa học nào.'}</td></tr>
              ) : (
                visibleCourses.map(c => {
                  const cat = categoriesList.find(catItem => catItem.id === c.category_id);
                  const courseImg = c.image || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80';
                  return (
                    <tr key={c.id} className="hover:bg-gray-900/20 transition-all">
                    <td className="p-4 flex items-center gap-3">
                        <img src={courseImg} alt={c.title} className="w-12 h-9 object-cover rounded-lg" />
                        <div>
                          <p className="font-semibold text-white">{c.title}</p>
                          <p className="text-xs text-gray-500">{c.instructor || 'Nguyễn Văn A'}</p>
                        </div>
                      </td>
                      <td className="p-4"><Badge variant="blue">{cat?.name || 'Khác'}</Badge></td>
                      <td className="p-4 text-gray-400">{formatPrice(c.price)}</td>
                      <td className="p-4 text-primary-400 font-semibold">{formatPrice(c.sale_price || c.price)}</td>
                      <td className="p-4">
                        {c.status === 'published' ? (
                          <Badge variant="green">Còn hàng / Đang bán</Badge>
                        ) : c.status === 'inactive' ? (
                          <Badge variant="red">Ngừng cung cấp</Badge>
                        ) : (
                          <Badge variant="gray">Bản nháp</Badge>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => openEditForm(c)} className="text-primary-400 hover:text-primary-300 text-xs font-bold px-2 py-1 rounded hover:bg-primary-950/20 transition-colors">Sửa</button>
                        <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-300 text-xs font-bold px-2 py-1 rounded hover:bg-red-950/20 transition-colors">Xóa</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 bg-gray-950/40 border-t border-gray-800 text-xs">
              <p className="text-gray-400">
                Hiển thị trang <span className="font-semibold text-white">{currentPage}</span> trên <span className="font-semibold text-white">{totalPages}</span>
              </p>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg border border-gray-800 bg-gray-900 text-gray-300 hover:bg-gray-800 disabled:opacity-40 transition font-bold">Trước</button>
                <button type="button" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg border border-gray-800 bg-gray-900 text-gray-300 hover:bg-gray-800 disabled:opacity-40 transition font-bold">Sau</button>
              </div>
            </div>
          )}
        </div>
      </section>
      )}

      {/* Course Editor Form */}
      {showCourseForm && (
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5 animate-fade-in">
          <div className="flex justify-between items-center border-b border-gray-800 pb-4">
            <h3 className="font-bold text-white text-lg">
              {editCourse ? '✏️ Chỉnh sửa khóa học' : '📚 Thêm khóa học mới'}
            </h3>
            <button onClick={() => setShowCourseForm(false)} className="text-gray-400 hover:text-white text-sm font-bold transition-colors">
              Hủy bỏ &amp; Quay lại
            </button>
          </div>

          <form onSubmit={e => { e.preventDefault(); handleSave(); }} className="space-y-5">
            <div className="grid gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Course Name / Tên khóa học</label>
                <input name="Course Name" value={title} onChange={e => setTitle(e.target.value)} placeholder="Nhập tên khóa học / Course Name" required
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:outline-none transition-colors text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Giảng viên</label>
                <input value={instructor} onChange={e => setInstructor(e.target.value)} placeholder="Nhập tên giảng viên (VD: Nguyễn Văn A)"
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:outline-none transition-colors text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Category / Danh mục</label>
              <CategorySearchInput
                categories={categoriesList}
                value={category}
                onChange={setCategory}
                onCategoryCreated={newCat => setCategoriesList(prev => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)))}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Original Price / Giá gốc (VNĐ)</label>
                <input name="Original Price" type="number" value={price || ''} onChange={e => setPrice(Number(e.target.value))}
                  onFocus={e => { if (e.target.value === '0') e.target.value = ''; }}
                  onBlur={e => { if (e.target.value === '') setPrice(0); }}
                  placeholder="0"
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:outline-none transition-colors text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Giá ưu đãi (VNĐ)</label>
                <input type="number" value={salePrice || ''} onChange={e => setSalePrice(Number(e.target.value))}
                  onFocus={e => { if (e.target.value === '0') e.target.value = ''; }}
                  onBlur={e => { if (e.target.value === '') setSalePrice(0); }}
                  placeholder="0"
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:outline-none transition-colors text-sm" />
              </div>
            </div>


            {/* Image Upload */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Ảnh bìa khóa học</label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-600/25 file:text-primary-400 hover:file:bg-primary-600/30 file:cursor-pointer disabled:opacity-50"
                  />
                  {uploading && (
                    <p className="text-xs text-gray-400 animate-pulse mt-2">Đang tải ảnh lên...</p>
                  )}
                  {courseImage && (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        value={courseImage}
                        onChange={e => setCourseImage(e.target.value)}
                        placeholder="hoặc dán URL ảnh tại đây"
                        className="flex-1 bg-gray-950 border border-gray-700 rounded-lg px-3 py-1.5 text-gray-300 text-xs focus:border-primary-500 focus:outline-none"
                      />
                      <button type="button" onClick={() => setCourseImage('')}
                        className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-950/20 transition-colors">
                        Xóa
                      </button>
                    </div>
                  )}
                  {!courseImage && (
                    <input
                      type="text"
                      value={courseImage}
                      onChange={e => setCourseImage(e.target.value)}
                      placeholder="hoặc dán URL ảnh tại đây"
                      className="mt-2 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 text-xs focus:border-primary-500 focus:outline-none"
                    />
                  )}
                </div>
                {courseImage && (
                  <div className="relative w-40 h-24 rounded-xl overflow-hidden border border-gray-700 bg-gray-950 shadow-md flex-shrink-0">
                    <img src={courseImage} alt="Ảnh bìa" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>


            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Short Description / Mô tả ngắn</label>
              <RichEditor
                value={description}
                onChange={setDescription}
                placeholder="Viết mô tả ngắn về khóa học... Short Description"
              />
            </div>

            <div className="rounded-xl border border-gray-700 bg-gray-950/50 p-4">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">Bạn sẽ học được gì?</label>
                  <p className="mt-1 text-xs text-gray-500">Các ý ngắn này sẽ hiển thị tại trang chi tiết khóa học phía người dùng.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setHighlights(items => [...items, ''])}
                  className="w-fit rounded-lg border border-primary-500/50 px-3 py-2 text-xs font-bold text-primary-400 hover:bg-primary-500/10 transition-colors"
                >
                  + Thêm mô tả
                </button>
              </div>
              <div className="space-y-2">
                {highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <input
                      value={highlight}
                      onChange={event => setHighlights(items => items.map((item, itemIndex) => itemIndex === index ? event.target.value : item))}
                      placeholder={`Ví dụ: Kỹ năng hoặc kiến thức đạt được #${index + 1}`}
                      className="min-w-0 flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-primary-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setHighlights(items => items.length === 1 ? [''] : items.filter((_, itemIndex) => itemIndex !== index))}
                      className="rounded-lg p-2 text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      aria-label={`Xóa mô tả ${index + 1}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-gray-700 bg-gray-950/50 p-4">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">Nội dung khóa học</label>
                  <p className="mt-1 text-xs text-gray-500">Thêm chương và các mục con. Mỗi chương sẽ là một box xổ xuống ở client.</p>
                </div>
                <button type="button" onClick={() => setCourseContent(chapters => [...chapters, createChapter()])} className="w-fit rounded-lg border border-primary-500/50 px-3 py-2 text-xs font-bold text-primary-400 hover:bg-primary-500/10 transition-colors">
                  + Thêm chương
                </button>
              </div>

              <div className="space-y-4">
                {courseContent.map((chapter, chapterIndex) => (
                  <div key={chapter.id} className="rounded-xl border border-gray-700 bg-gray-900 p-3">
                    <div className="flex items-center gap-2">
                      <span className="whitespace-nowrap text-sm font-bold text-primary-400">Chương {chapterIndex + 1}</span>
                      <input
                        value={chapter.title}
                        onChange={event => setCourseContent(chapters => chapters.map((item, index) => index === chapterIndex ? { ...item, title: event.target.value } : item))}
                        placeholder="Tên chương"
                        className="min-w-0 flex-1 bg-gray-950 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-primary-500 focus:outline-none"
                      />
                      <button type="button" onClick={() => setCourseContent(chapters => chapters.filter((_, index) => index !== chapterIndex))} className="rounded-lg p-2 text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors" aria-label={`Xóa chương ${chapterIndex + 1}`}>×</button>
                    </div>

                    <div className="mt-3 space-y-2 border-l border-gray-700 pl-3">
                      {chapter.lessons.map((lesson, lessonIndex) => (
                        <div key={lesson.id} className="flex items-center gap-2">
                          <span className="w-10 text-xs font-semibold text-gray-500">{chapterIndex + 1}.{lessonIndex + 1}</span>
                          <input
                            value={lesson.title}
                            onChange={event => setCourseContent(chapters => chapters.map((item, index) => index !== chapterIndex ? item : {
                              ...item,
                              lessons: item.lessons.map((subItem, subIndex) => subIndex === lessonIndex ? { ...subItem, title: event.target.value } : subItem),
                            }))}
                            placeholder="Tên mục con"
                            className="min-w-0 flex-1 bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
                          />
                          <button type="button" onClick={() => setCourseContent(chapters => chapters.map((item, index) => index !== chapterIndex ? item : { ...item, lessons: item.lessons.filter((_, subIndex) => subIndex !== lessonIndex) }))} className="rounded-lg p-1.5 text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors" aria-label={`Xóa mục ${lessonIndex + 1}`}>×</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setCourseContent(chapters => chapters.map((item, index) => index === chapterIndex ? { ...item, lessons: [...item.lessons, createLesson()] } : item))} className="text-xs font-bold text-primary-400 hover:text-primary-300">
                        + Thêm mục con
                      </button>
                    </div>
                  </div>
                ))}
                {courseContent.length === 0 && <p className="rounded-lg border border-dashed border-gray-700 px-4 py-5 text-center text-sm text-gray-500">Chưa có chương nào. Nhấn “Thêm chương” để bắt đầu.</p>}
              </div>
            </div>


            {/* Status Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Trạng thái bán</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as 'published' | 'inactive' | 'draft')}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:outline-none transition-all text-sm cursor-pointer"
              >
                <option value="published">🟢 Còn hàng / Đang hiển thị</option>
                <option value="inactive">🔴 Ngừng cung cấp / Tắt bán</option>
                <option value="draft">📁 Bản nháp (Ẩn hoàn toàn)</option>
              </select>
            </div>

            <div className="pt-4 border-t border-gray-800 flex justify-end gap-3">
              <button type="button" onClick={() => setShowCourseForm(false)}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold px-6 py-3 rounded-xl text-sm transition-colors">
                Hủy bỏ
              </button>
              <button type="submit"
                className="bg-primary-600 hover:bg-primary-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-md">
                {editCourse ? 'Lưu cập nhật' : 'Lưu / Thêm khóa học'}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
