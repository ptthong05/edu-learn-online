'use client';
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/utils/api';
import { Combo, Course } from '@/types';
import { formatPrice } from '@/lib/utils/helpers';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';

export default function AdminCombos() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCombo, setEditCombo] = useState<Combo | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [salePrice, setSalePrice] = useState(0);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [comboImage, setComboImage] = useState('');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [combosData, coursesData] = await Promise.all([
        api.getCombos(),
        api.getCourses()
      ]);
      setCombos(combosData);
      setCoursesList(coursesData);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddForm = () => {
    setEditCombo(null);
    setTitle('');
    setDescription('');
    setSalePrice(0);
    setStatus('active');
    setComboImage('');
    setSelectedCourseIds([]);
    setCourseSearch('');
    setShowForm(true);
  };

  const openEditForm = (c: Combo) => {
    setEditCombo(c);
    setTitle(c.title);
    setDescription(c.description);
    setSalePrice(c.sale_price || 0);
    setStatus(c.status === 'inactive' ? 'inactive' : 'active');
    setComboImage(c.image || '');
    setSelectedCourseIds(c.courses?.map(course => course.id) || []);
    setCourseSearch('');
    setShowForm(true);
  };

  // Automatically calculate the original total price of selected courses
  const calculatedOriginalPrice = coursesList
    .filter(c => selectedCourseIds.includes(c.id))
    .reduce((sum, c) => sum + (c.sale_price || c.price), 0);

  const handleToggleCourse = (courseId: string) => {
    setSelectedCourseIds(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.uploadImage(file);
      setComboImage(res.url || res.image_url || res.imageUrl);
      toast.success('Tải ảnh bìa thành công!');
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải ảnh.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Vui lòng nhập tên Combo.');
      return;
    }
    if (selectedCourseIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất một khóa học.');
      return;
    }

    const payload = {
      title: title.trim(),
      description,
      sale_price: salePrice > 0 ? salePrice : null,
      status,
      course_ids: selectedCourseIds,
      image: comboImage || undefined
    };

    try {
      if (editCombo) {
        await api.updateCombo(editCombo.id, payload);
        toast.success('Cập nhật Combo thành công.');
      } else {
        await api.createCombo(payload);
        toast.success('Tạo Combo mới thành công.');
      }
      fetchData();
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu thông tin.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn chắc chắn muốn xóa Combo này?')) {
      try {
        await api.deleteCombo(id);
        toast.success('Xóa Combo thành công.');
        fetchData();
      } catch (err: any) {
        toast.error(err.message || 'Lỗi khi xóa Combo.');
      }
    }
  };

  if (loading && combos.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-400 font-medium animate-pulse">Đang tải danh sách combo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Combos List */}
      {!showForm && (
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-white text-lg">Danh sách Combo khóa học</h3>
              <p className="text-gray-400 text-xs mt-0.5">Quản lý các Combo khóa học để thúc đẩy doanh số.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                placeholder="Lọc theo tên khóa học..."
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="bg-gray-950 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm focus:border-primary-500 focus:outline-none placeholder-gray-500 min-w-56"
              />
              <button onClick={openAddForm} className="bg-primary-600 hover:bg-primary-500 transition-colors px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md whitespace-nowrap">
                + Tạo Combo mới
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-800 rounded-xl bg-gray-950">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-900/30 border-b border-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="p-4">Combo</th>
                  <th className="p-4">Khóa học đi kèm</th>
                  <th className="p-4">Giá gốc</th>
                  <th className="p-4">Giá bán</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-sm">
                {(() => {
                  const filteredCombos = combos.filter(c => {
                    if (!courseFilter.trim()) return true;
                    const q = courseFilter.toLowerCase().trim();
                    const matchesComboTitle = c.title.toLowerCase().includes(q);
                    const matchesCourseTitle = c.courses?.some(course => 
                      course.title.toLowerCase().includes(q)
                    );
                    return matchesComboTitle || matchesCourseTitle;
                  });
                  return filteredCombos.length > 0 ? (
                    filteredCombos.map(c => (
                    <tr key={c.id} className="hover:bg-gray-900/20 transition-all">
                      <td className="p-4 flex items-center gap-3">
                        <div className="relative w-14 h-10 overflow-hidden rounded-lg bg-gray-950 border border-gray-800 flex-shrink-0">
                          {c.image ? (
                            <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500 font-semibold">NO IMG</div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white leading-tight">{c.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-1 max-w-xs mt-0.5">{c.description}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {c.courses && c.courses.length > 0 ? (
                            c.courses.map(course => (
                              <span key={course.id} className="inline-block bg-gray-800 text-gray-300 text-[11px] px-2 py-0.5 rounded border border-gray-700">
                                {course.title}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 text-xs italic">Chưa có khóa học nào</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-gray-450">{formatPrice(c.price)}</td>
                      <td className="p-4 text-primary-400 font-bold">{formatPrice(c.sale_price || c.price)}</td>
                      <td className="p-4">
                        {c.status === 'inactive' ? (
                          <Badge variant="red">Ngừng cung cấp</Badge>
                        ) : (
                          <Badge variant="green">Còn hàng / Đang bán</Badge>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => openEditForm(c)} className="text-primary-400 hover:text-primary-300 text-xs font-bold px-2 py-1 rounded hover:bg-primary-950/20 transition-colors">
                          Sửa
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-300 text-xs font-bold px-2 py-1 rounded hover:bg-red-950/20 transition-colors">
                          Xóa
                        </button>
                      </td>
                    </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500 font-medium">
                        {courseFilter.trim() ? 'Không tìm thấy Combo nào khớp bộ lọc.' : 'Chưa có Combo nào được tạo.'}
                      </td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Editor Form */}
      {showForm && (
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5 animate-fade-in">
          <div className="flex justify-between items-center border-b border-gray-800 pb-4">
            <h3 className="font-bold text-white text-lg">
              {editCombo ? '✏️ Chỉnh sửa Combo' : '➕ Tạo Combo mới'}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white text-sm font-bold transition-colors">
              Hủy bỏ &amp; Quay lại
            </button>
          </div>

          <form onSubmit={e => { e.preventDefault(); handleSave(); }} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Tên Combo</label>
              <input
                autoFocus
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Nhập tên Combo..."
                required
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:outline-none transition-colors text-sm"
              />
            </div>

            {/* Cover Image Upload */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Ảnh bìa Combo</label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex-1 w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="block w-full text-xs text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-600/25 file:text-primary-400 hover:file:bg-primary-600/30 file:cursor-pointer disabled:opacity-50"
                  />
                  {uploading && (
                    <p className="text-[11px] text-gray-400 animate-pulse mt-1">Đang tải ảnh lên...</p>
                  )}
                  <input
                    type="text"
                    value={comboImage}
                    onChange={e => setComboImage(e.target.value)}
                    placeholder="hoặc dán URL ảnh tại đây"
                    className="mt-2 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-gray-350 text-xs focus:border-primary-500 focus:outline-none"
                  />
                </div>
                {comboImage && (
                  <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-gray-800 bg-gray-950 flex-shrink-0">
                    <img src={comboImage} alt="Ảnh bìa" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Mô tả Combo</label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-950 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm"
                placeholder="Nhập mô tả chi tiết của Combo..."
              />
            </div>

            {/* Course Selection List */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Chọn khóa học để gộp</label>
              
              {/* Course Search Filter */}
              <input
                type="text"
                value={courseSearch}
                onChange={e => setCourseSearch(e.target.value)}
                placeholder="🔍 Tìm kiếm nhanh khóa học..."
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none mb-2"
              />

              <div className="border border-gray-700 rounded-xl bg-gray-950 p-3 max-h-40 overflow-y-auto space-y-2">
                {coursesList
                  .filter(course => course.title.toLowerCase().includes(courseSearch.toLowerCase()))
                  .map(course => (
                    <label key={course.id} className="flex items-center gap-3 cursor-pointer group text-xs text-gray-300 hover:text-white transition-all">
                      <input
                        type="checkbox"
                        checked={selectedCourseIds.includes(course.id)}
                        onChange={() => handleToggleCourse(course.id)}
                        className="rounded border-gray-700 bg-gray-900 text-primary-600 focus:ring-primary-500 focus:ring-offset-gray-950"
                      />
                      <span className="flex-1 font-medium">{course.title}</span>
                      <span className="text-gray-500 font-semibold">{formatPrice(course.sale_price || course.price)}</span>
                    </label>
                  ))}
                {coursesList.filter(course => course.title.toLowerCase().includes(courseSearch.toLowerCase())).length === 0 && (
                  <p className="text-center text-xs text-gray-500 py-4">Không tìm thấy khóa học nào.</p>
                )}
              </div>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Giá gốc (Tự tính)</label>
                <div className="w-full bg-gray-950/60 border border-gray-700 rounded-xl px-4 py-3 text-gray-400 text-sm font-semibold">
                  {formatPrice(calculatedOriginalPrice)}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Giá ưu đãi Combo</label>
                <input
                  type="number"
                  value={salePrice || ''}
                  onChange={e => setSalePrice(Number(e.target.value))}
                  placeholder="Nhập giá ưu đãi..."
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:outline-none transition-all text-sm"
                />
              </div>
            </div>

            {/* Status Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Trạng thái bán</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as 'active' | 'inactive')}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:outline-none transition-all text-sm cursor-pointer"
              >
                <option value="active">🟢 Còn hàng / Đang hoạt động</option>
                <option value="inactive">🔴 Ngừng cung cấp / Tắt bán</option>
              </select>
            </div>

            <div className="pt-4 border-t border-gray-800 flex gap-3">
              <button type="button" onClick={() => setShowForm(false)}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold px-6 py-3 rounded-xl text-sm transition-colors">
                Hủy bỏ
              </button>
              <button type="submit"
                className="bg-primary-600 hover:bg-primary-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-md">
                {editCombo ? 'Lưu cập nhật' : 'Tạo Combo'}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
