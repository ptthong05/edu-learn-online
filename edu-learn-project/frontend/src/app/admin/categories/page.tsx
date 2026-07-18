'use client';
import React, { useState, useEffect } from 'react';
import { Category } from '@/types';
import Badge from '@/components/ui/Badge';
import { api } from '@/lib/utils/api';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await api.getCategories();
      setCategories(data);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tải danh mục.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddForm = () => {
    setEditCategory(null);
    setName('');
    setShowForm(true);
  };

  const openEditForm = (c: Category) => {
    setEditCategory(c);
    setName(c.name);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Vui lòng nhập tên danh mục.');
    setSaving(true);
    try {
      if (editCategory) {
        await api.updateCategory(editCategory.id, name.trim());
        toast.success('Cập nhật danh mục thành công.');
      } else {
        await api.createCategory(name.trim());
        toast.success('Thêm danh mục thành công.');
      }
      fetchCategories();
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu danh mục.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn chắc chắn muốn xóa danh mục này?')) return;
    try {
      await api.deleteCategory(id);
      toast.success('Xóa danh mục thành công.');
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xóa danh mục.');
    }
  };

  return (
    <div className="space-y-6">
      {/* List */}
      {!showForm && (
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-white text-lg">Danh sách danh mục</h3>
              <p className="text-gray-400 text-xs mt-0.5">Danh mục khóa học — dùng chung trong form thêm/sửa khóa học</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                placeholder="Lọc theo tên danh mục..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-950 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm focus:border-primary-500 focus:outline-none placeholder-gray-500 min-w-56"
              />
              <button onClick={openAddForm} className="bg-primary-600 hover:bg-primary-500 transition-colors px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md whitespace-nowrap">
                + Thêm danh mục
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-800 rounded-xl bg-gray-950">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-900/30 border-b border-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="p-4">#</th>
                  <th className="p-4">Tên danh mục</th>
                  <th className="p-4">ID</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-sm">
                {loading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500">Đang tải...</td></tr>
                ) : (() => {
                  const filtered = categories.filter(c => 
                    c.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
                  );
                  return filtered.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-gray-500">{searchQuery.trim() ? 'Không tìm thấy danh mục nào khớp bộ lọc.' : 'Chưa có danh mục nào.'}</td></tr>
                  ) : (
                    filtered.map((c, idx) => (
                    <tr key={c.id} className="hover:bg-gray-900/20 transition-all">
                      <td className="p-4 text-gray-500 text-xs">{idx + 1}</td>
                      <td className="p-4 font-semibold text-white">{c.name}</td>
                      <td className="p-4">
                        <Badge variant="gray">{c.id}</Badge>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => openEditForm(c)} className="text-primary-400 hover:text-primary-300 text-xs font-bold px-2 py-1 rounded hover:bg-primary-950/20 transition-colors">Sửa</button>
                        <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-300 text-xs font-bold px-2 py-1 rounded hover:bg-red-950/20 transition-colors">Xóa</button>
                      </td>
                    </tr>
                    ))
                  );
                })()}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Form */}
      {showForm && (
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5 animate-fade-in">
          <div className="flex justify-between items-center border-b border-gray-800 pb-4">
            <h3 className="font-bold text-white text-lg">
              {editCategory ? '✏️ Sửa danh mục' : '➕ Thêm danh mục mới'}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white text-sm font-bold transition-colors">
              Hủy bỏ &amp; Quay lại
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Tên danh mục</label>
              <input
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ví dụ: Lập trình Web, Thiết kế đồ họa..."
                required
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:outline-none transition-colors text-sm"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button type="button" onClick={() => setShowForm(false)}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold px-6 py-3 rounded-xl text-sm transition-colors">
                Hủy bỏ
              </button>
              <button type="submit" disabled={saving}
                className="bg-primary-600 hover:bg-primary-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-md disabled:opacity-60">
                {saving ? 'Đang lưu...' : editCategory ? 'Lưu cập nhật' : 'Thêm danh mục'}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
