'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/utils/api';
import Image from 'next/image';

type Category = { id: string; name: string; created_at: string };
type Blog = {
  id: string;
  title: string;
  category_id: string | null;
  category_name?: string;
  toc: string;
  excerpt: string;
  content: string;
  image: string;
  created_at: string;
};

function RichEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  // Sync content with value ONLY when it changes externally (prevents caret jumping when typing)
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const command = (name: string) => {
    ref.current?.focus();
    document.execCommand(name);
    onChange(ref.current?.innerHTML || '');
  };

  const formatBlock = (tag: string) => {
    ref.current?.focus();
    document.execCommand('formatBlock', false, `<${tag}>`);
    onChange(ref.current?.innerHTML || '');
  };
  
  return (
    <div className="rounded-xl overflow-hidden border border-gray-700 bg-gray-950">
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-700 bg-gray-900/50 items-center">
        <button type="button" onClick={() => command('bold')} className="px-3 py-1 rounded hover:bg-gray-800 font-bold text-gray-200">B</button>
        <button type="button" onClick={() => command('italic')} className="px-3 py-1 rounded hover:bg-gray-800 italic text-gray-200">I</button>
        <button type="button" onClick={() => command('underline')} className="px-3 py-1 rounded hover:bg-gray-800 underline text-gray-200">U</button>
        <button type="button" onClick={() => command('justifyCenter')} className="px-3 py-1 rounded hover:bg-gray-800 text-sm text-gray-200">Căn giữa</button>
        <button type="button" onClick={() => command('insertUnorderedList')} className="px-3 py-1 rounded hover:bg-gray-800 text-sm text-gray-200">• Danh sách</button>
        <div className="w-px h-6 bg-gray-700 mx-1" />
        <button type="button" onClick={() => formatBlock('h2')} className="px-2.5 py-1 rounded hover:bg-gray-800 text-xs font-bold text-gray-300">Tiêu đề H2</button>
        <button type="button" onClick={() => formatBlock('h3')} className="px-2.5 py-1 rounded hover:bg-gray-800 text-xs font-bold text-gray-300">Tiêu đề H3</button>
        <button type="button" onClick={() => formatBlock('p')} className="px-2.5 py-1 rounded hover:bg-gray-800 text-xs font-bold text-gray-300">Văn bản</button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(ref.current?.innerHTML || '')}
        className="min-h-48 max-h-[30rem] overflow-y-auto p-3 outline-none text-sm leading-6 text-gray-100 bg-gray-950"
      />
    </div>
  );
}

export default function AdminBlogsPage() {
  const [activeTab, setActiveTab] = useState<'posts' | 'categories'>('posts');
  const [categories, setCategories] = useState<Category[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [blogPage, setBlogPage] = useState(1);
  const [blogTitleFilter, setBlogTitleFilter] = useState('');
  const BLOGS_PER_PAGE = 10;

  const filteredBlogs = blogs.filter(blog => {
    const q = blogTitleFilter.toLowerCase().trim();
    return blog.title.toLowerCase().includes(q) || 
           (blog.category_name || '').toLowerCase().includes(q) ||
           (blog.excerpt || '').toLowerCase().includes(q);
  });

  const totalBlogPages = Math.ceil(filteredBlogs.length / BLOGS_PER_PAGE);
  const visibleBlogs = filteredBlogs.slice((blogPage - 1) * BLOGS_PER_PAGE, blogPage * BLOGS_PER_PAGE);

  useEffect(() => {
    setBlogPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogs.length, blogTitleFilter]);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);

  // Category State
  const [catName, setCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  // Blog Form State
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogCatId, setBlogCatId] = useState('');
  const [blogToc, setBlogToc] = useState('');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogImage, setBlogImage] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [catsData, blogsData] = await Promise.all([
        api.getBlogCategories(),
        api.getBlogs()
      ]);
      setCategories(catsData);
      setBlogs(blogsData);
    } catch (err: any) {
      showFeedback(err.message || 'Lỗi tải dữ liệu', false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showFeedback = (msg: string, success = true) => {
    setMessage(msg);
    setIsSuccess(success);
    setTimeout(() => setMessage(''), 3000);
  };

  // Category Handlers
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    try {
      if (editingCatId) {
        await api.updateAdminBlogCategory(editingCatId, { name: catName });
        showFeedback('Cập nhật chuyên mục thành công!');
      } else {
        await api.createAdminBlogCategory({ name: catName });
        showFeedback('Thêm chuyên mục thành công!');
      }
      setCatName('');
      setEditingCatId(null);
      fetchInitialData();
    } catch (err: any) {
      showFeedback(err.message, false);
    }
  };

  const handleEditCat = (cat: Category) => {
    setEditingCatId(cat.id);
    setCatName(cat.name);
  };

  const handleDeleteCat = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa chuyên mục này? Các bài viết thuộc chuyên mục này sẽ được chuyển về Không phân loại.')) return;
    try {
      await api.deleteAdminBlogCategory(id);
      showFeedback('Xóa chuyên mục thành công!');
      fetchInitialData();
    } catch (err: any) {
      showFeedback(err.message, false);
    }
  };

  // Blog Post Handlers
  const handleAddBlogClick = () => {
    setEditingBlogId(null);
    setBlogTitle('');
    setBlogCatId('');
    setBlogToc('');
    setBlogExcerpt('');
    setBlogContent('');
    setBlogImage('');
    setShowBlogForm(true);
  };

  const handleEditBlog = (blog: Blog) => {
    setEditingBlogId(blog.id);
    setBlogTitle(blog.title);
    setBlogCatId(blog.category_id || '');
    setBlogToc(blog.toc || '');
    setBlogExcerpt(blog.excerpt || '');
    setBlogContent(blog.content);
    setBlogImage(blog.image);
    setShowBlogForm(true);
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    try {
      await api.deleteAdminBlog(id);
      showFeedback('Xóa bài viết thành công!');
      fetchInitialData();
    } catch (err: any) {
      showFeedback(err.message, false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.uploadImage(file);
      setBlogImage(res.url || res.image_url || res.imageUrl);
      showFeedback('Tải ảnh bìa thành công!');
    } catch (err: any) {
      showFeedback(err.message || 'Không thể tải ảnh', false);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle.trim()) return showFeedback('Vui lòng nhập tiêu đề.', false);
    if (!blogContent.trim()) return showFeedback('Vui lòng nhập nội dung.', false);

    const data = {
      title: blogTitle,
      category_id: blogCatId || null,
      toc: blogToc,
      excerpt: blogExcerpt || blogTitle,
      content: blogContent,
      image: blogImage
    };

    try {
      if (editingBlogId) {
        await api.updateAdminBlog(editingBlogId, data);
        showFeedback('Cập nhật bài viết thành công!');
      } else {
        await api.createAdminBlog(data);
        showFeedback('Thêm bài viết thành công!');
      }
      setShowBlogForm(false);
      fetchInitialData();
    } catch (err: any) {
      showFeedback(err.message, false);
    }
  };

  if (loading && blogs.length === 0) {
    return (
      <div className="flex justify-center items-center py-24 text-gray-400">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 font-semibold text-sm">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Quản lý Blog & Tin tức</h2>
          <p className="text-gray-400 text-sm mt-1">Quản lý các chuyên mục và bài viết trên trang tin tức.</p>
        </div>
        {message && (
          <span className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg animate-fade-in ${
            isSuccess ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {message}
          </span>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-gray-800 pb-4">
        <button
          onClick={() => { setActiveTab('posts'); setShowBlogForm(false); }}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
            activeTab === 'posts' && !showBlogForm
              ? 'bg-primary-600 text-white shadow-lg'
              : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-800'
          }`}
        >
          📰 Danh sách bài viết
        </button>
        <button
          onClick={() => { setActiveTab('categories'); setShowBlogForm(false); }}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
            activeTab === 'categories'
              ? 'bg-primary-600 text-white shadow-lg'
              : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-800'
          }`}
        >
          📁 Chuyên mục Blog
        </button>
      </div>

      {/* Categories Management Tab */}
      {activeTab === 'categories' && (
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6 animate-fade-in">
          <h3 className="font-bold text-white text-lg">Quản lý chuyên mục</h3>
          
          <form onSubmit={handleSaveCategory} className="flex gap-3 max-w-md">
            <input
              value={catName}
              onChange={e => setCatName(e.target.value)}
              placeholder="Tên chuyên mục mới"
              className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:outline-none transition-colors text-sm"
              required
            />
            <button
              type="submit"
              className="bg-primary-600 hover:bg-primary-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-md"
            >
              {editingCatId ? 'Cập nhật' : 'Thêm mới'}
            </button>
            {editingCatId && (
              <button
                type="button"
                onClick={() => { setEditingCatId(null); setCatName(''); }}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold px-4 py-3 rounded-xl text-sm transition-colors"
              >
                Hủy
              </button>
            )}
          </form>

          <div className="overflow-x-auto border border-gray-800 rounded-xl bg-gray-950">
            <table className="w-full text-sm text-left">
              <thead className="text-gray-400 border-b border-gray-800 bg-gray-900/30">
                <tr>
                  <th className="py-3 px-4 w-1/12">STT</th>
                  <th className="py-3 px-4 w-7/12">Tên chuyên mục</th>
                  <th className="py-3 px-4 w-4/12 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {categories.map((cat, index) => (
                  <tr key={cat.id} className="hover:bg-gray-900/20 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-500">{index + 1}</td>
                    <td className="py-3 px-4 font-semibold text-white">{cat.name}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleEditCat(cat)}
                        className="text-primary-400 hover:text-primary-300 text-xs font-bold px-2 py-1 rounded hover:bg-primary-950/20 transition-colors"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteCat(cat.id)}
                        className="text-red-400 hover:text-red-300 text-xs font-bold px-2 py-1 rounded hover:bg-red-950/20 transition-colors"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-gray-500 text-xs">Chưa có chuyên mục nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Blogs Management Tab */}
      {activeTab === 'posts' && !showBlogForm && (
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-bold text-white text-lg">Bài viết đã đăng</h3>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                placeholder="Lọc theo tiêu đề bài viết..."
                value={blogTitleFilter}
                onChange={(e) => setBlogTitleFilter(e.target.value)}
                className="bg-gray-950 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm focus:border-primary-500 focus:outline-none placeholder-gray-500 min-w-56"
              />
              <button
                onClick={handleAddBlogClick}
                className="bg-primary-600 hover:bg-primary-500 transition-colors px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md whitespace-nowrap"
              >
                + Đăng bài viết
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-800 rounded-xl bg-gray-950">
            <table className="w-full text-sm text-left">
              <thead className="text-gray-400 border-b border-gray-800 bg-gray-900/30">
                <tr>
                  <th className="py-3 px-4 w-2/12">Ảnh bìa</th>
                  <th className="py-3 px-4 w-4/12">Tiêu đề bài viết</th>
                  <th className="py-3 px-4 w-2/12">Chuyên mục</th>
                  <th className="py-3 px-4 w-2/12">Ngày tạo</th>
                  <th className="py-3 px-4 w-2/12 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {visibleBlogs.map(blog => (
                  <tr key={blog.id} className="hover:bg-gray-900/20 transition-colors">
                    <td className="py-3 px-4">
                      {blog.image ? (
                        <div className="relative w-20 h-12 rounded overflow-hidden bg-gray-900">
                          <Image src={blog.image} alt={blog.title} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-20 h-12 rounded bg-gray-800/60 flex items-center justify-center text-xs text-gray-500 font-medium">No Image</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white vertical-align-top">
                      <p className="line-clamp-2">{blog.title}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-300 vertical-align-top">
                      <span className="bg-gray-800 text-gray-300 text-xs px-2.5 py-1 rounded-full font-medium">
                        {blog.category_name || 'Không phân loại'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 vertical-align-top">
                      {new Date(blog.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2 vertical-align-top">
                      <button
                        onClick={() => handleEditBlog(blog)}
                        className="text-primary-400 hover:text-primary-300 text-xs font-bold px-2 py-1 rounded hover:bg-primary-950/20 transition-colors"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteBlog(blog.id)}
                        className="text-red-400 hover:text-red-300 text-xs font-bold px-2 py-1 rounded hover:bg-red-950/20 transition-colors"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredBlogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500 text-xs">
                      {blogTitleFilter.trim() ? 'Không tìm thấy bài viết nào khớp bộ lọc.' : 'Chưa có bài viết nào được đăng.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {totalBlogPages > 1 && (
              <div className="flex justify-between items-center px-6 py-4 bg-gray-950/40 border-t border-gray-800 text-xs">
                <p className="text-gray-400">
                  Hiển thị trang <span className="font-semibold text-white">{blogPage}</span> trên <span className="font-semibold text-white">{totalBlogPages}</span>
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setBlogPage(p => Math.max(1, p - 1))}
                    disabled={blogPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-gray-800 bg-gray-900 text-gray-300 hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-gray-900 transition font-bold"
                  >
                    Trước
                  </button>
                  <button
                    type="button"
                    onClick={() => setBlogPage(p => Math.min(totalBlogPages, p + 1))}
                    disabled={blogPage === totalBlogPages}
                    className="px-3 py-1.5 rounded-lg border border-gray-800 bg-gray-900 text-gray-300 hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-gray-900 transition font-bold"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Blog Editor Form */}
      {showBlogForm && (
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5 animate-fade-in">
          <div className="flex justify-between items-center border-b border-gray-800 pb-4">
            <h3 className="font-bold text-white text-lg">
              {editingBlogId ? '✏️ Chỉnh sửa bài viết' : '✍️ Thêm bài viết mới'}
            </h3>
            <button
              onClick={() => setShowBlogForm(false)}
              className="text-gray-400 hover:text-white text-sm font-bold transition-colors"
            >
              Hủy bỏ & Quay lại
            </button>
          </div>

          <form onSubmit={handleSaveBlog} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Tiêu đề bài viết</label>
                <input
                  value={blogTitle}
                  onChange={e => setBlogTitle(e.target.value)}
                  placeholder="Tiêu đề bài viết"
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:outline-none transition-colors text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Chuyên mục</label>
                <select
                  value={blogCatId}
                  onChange={e => setBlogCatId(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:outline-none transition-colors text-sm"
                >
                  <option value="">Chọn chuyên mục</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Ảnh bìa bài viết</label>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="block text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-600/25 file:text-primary-400 hover:file:bg-primary-600/30 file:cursor-pointer disabled:opacity-50"
                />
                {uploading && <span className="text-xs text-gray-400 animate-pulse">Đang tải ảnh lên...</span>}
              </div>
              {blogImage && (
                <div className="relative w-48 h-28 rounded-xl overflow-hidden border border-gray-700 bg-gray-950 mt-3 shadow-md">
                  <Image src={blogImage} alt="Cover Preview" fill className="object-cover" />
                </div>
              )}
            </div>


            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Nội dung bài viết (Định dạng Word)</label>
              <RichEditor value={blogContent} onChange={setBlogContent} />
            </div>

            <div className="pt-4 border-t border-gray-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowBlogForm(false)}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold px-6 py-3 rounded-xl text-sm transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-md"
              >
                {editingBlogId ? 'Lưu cập nhật' : 'Đăng bài viết'}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
