'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { getAuthToken } from '@/lib/utils/auth';

const API_BASE = '';  // use Next.js proxy routes (relative URLs)

// Field component defined OUTSIDE the page component to prevent remount on every keystroke
function Field<K extends string>({
  label,
  fieldKey,
  value,
  onChange,
  textarea = false,
  placeholder = '',
}: {
  label: string;
  fieldKey: K;
  value: string;
  onChange: (key: K, value: string) => void;
  textarea?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={e => onChange(fieldKey, e.target.value)}
          placeholder={placeholder}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none transition"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(fieldKey, e.target.value)}
          placeholder={placeholder}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
        />
      )}
    </div>
  );
}

const DEFAULT_BANNER = {
  title_line1: 'HỌC ONLINE',
  title_line2: 'CHỦ ĐỘNG THỜI GIAN',
  title_line3: 'NÂNG TẦM KỸ NĂNG',
  description: 'Hàng nghìn khóa học chất lượng từ các chuyên gia. Từ cơ bản đến chuyên sâu.',
  badge_text: 'Hơn 1000+ khóa học chất lượng',
  floating_badge_title: 'Học mọi lúc, mọi nơi',
  floating_badge_subtitle: 'Truy cập trọn đời sau khi mua',
  stat1_value: '1000+',
  stat1_label: 'Khóa học chất lượng',
  stat2_value: '200K+',
  stat2_label: 'Khách hàng tin tưởng',
  stat3_value: '50+',
  stat3_label: 'Danh mục đa dạng',
  image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
};

export default function AdminHomeBannerPage() {
  const [form, setForm] = useState(DEFAULT_BANNER);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = getAuthToken();
    fetch(`${API_BASE}/api/home-banner`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setForm({ ...DEFAULT_BANNER, ...data }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: keyof typeof DEFAULT_BANNER, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ chấp nhận file ảnh (jpg, png, webp...)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh không được vượt quá 5MB');
      return;
    }
    setUploading(true);
    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${API_BASE}/api/admin/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      let data: any = {};
      try { data = await res.json(); } catch { data = {}; }
      if (res.ok && data.url) {
        setForm(prev => ({ ...prev, image_url: data.url }));
        toast.success('Tải ảnh lên thành công!');
      } else {
        console.error('Upload error:', res.status, data);
        toast.error(data.message || `Lỗi ${res.status}: Không thể tải ảnh lên`);
      }
    } catch (err) {
      console.error('Upload fetch error:', err);
      toast.error('Không thể kết nối server — backend có đang chạy không?');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/admin/home-banner`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Cập nhật banner trang chủ thành công!');
      } else {
        toast.error(data.message || 'Lỗi khi lưu');
      }
    } catch {
      toast.error('Không thể kết nối server');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-sm animate-pulse">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Banner Trang chủ</h1>
          <p className="text-sm text-gray-400 mt-1">Chỉnh sửa nội dung banner hiển thị ở đầu trang chủ</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl shadow-lg hover:opacity-90 disabled:opacity-50 transition text-sm"
        >
          {saving ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Đang lưu...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Lưu thay đổi
            </>
          )}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="space-y-6">

          {/* Badge */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-primary-400 mb-4 uppercase tracking-wider">🏷️ Badge nhỏ</h2>
            <Field label="Nội dung badge" fieldKey="badge_text" value={form.badge_text} onChange={handleChange} placeholder="Hơn 1000+ khóa học..." />
          </div>

          {/* Tiêu đề chính */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-yellow-400 mb-4 uppercase tracking-wider">📝 Tiêu đề chính (3 dòng)</h2>
            <Field label="Dòng 1 (trắng)" fieldKey="title_line1" value={form.title_line1} onChange={handleChange} placeholder="HỌC ONLINE" />
            <Field label="Dòng 2 (màu vàng-cam)" fieldKey="title_line2" value={form.title_line2} onChange={handleChange} placeholder="CHỦ ĐỘNG THỜI GIAN" />
            <Field label="Dòng 3 (màu vàng-cam)" fieldKey="title_line3" value={form.title_line3} onChange={handleChange} placeholder="NÂNG TẦM KỸ NĂNG" />
          </div>

          {/* Mô tả */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-blue-400 mb-4 uppercase tracking-wider">💬 Mô tả ngắn</h2>
            <Field label="Đoạn mô tả" fieldKey="description" value={form.description} onChange={handleChange} textarea placeholder="Hàng nghìn khóa học..." />
          </div>

          {/* Floating card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-green-400 mb-4 uppercase tracking-wider">💡 Card nổi trên ảnh</h2>
            <Field label="Tiêu đề card" fieldKey="floating_badge_title" value={form.floating_badge_title} onChange={handleChange} placeholder="Học mọi lúc, mọi nơi" />
            <Field label="Phụ đề card" fieldKey="floating_badge_subtitle" value={form.floating_badge_subtitle} onChange={handleChange} placeholder="Truy cập trọn đời..." />
          </div>

          {/* Thống kê */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-orange-400 mb-4 uppercase tracking-wider">📊 Thống kê (3 ô)</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-3">
                <Field label="Số liệu 1" fieldKey="stat1_value" value={form.stat1_value} onChange={handleChange} placeholder="1000+" />
                <Field label="Nhãn 1" fieldKey="stat1_label" value={form.stat1_label} onChange={handleChange} placeholder="Khóa học..." />
              </div>
              <div className="space-y-3">
                <Field label="Số liệu 2" fieldKey="stat2_value" value={form.stat2_value} onChange={handleChange} placeholder="200K+" />
                <Field label="Nhãn 2" fieldKey="stat2_label" value={form.stat2_label} onChange={handleChange} placeholder="Khách hàng..." />
              </div>
              <div className="space-y-3">
                <Field label="Số liệu 3" fieldKey="stat3_value" value={form.stat3_value} onChange={handleChange} placeholder="50+" />
                <Field label="Nhãn 3" fieldKey="stat3_label" value={form.stat3_label} onChange={handleChange} placeholder="Danh mục..." />
              </div>
            </div>
          </div>

          {/* Ảnh */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-purple-400 mb-4 uppercase tracking-wider">🖼️ Ảnh minh họa</h2>

            {/* File picker + drag & drop */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-purple-400 bg-purple-500/10'
                  : 'border-gray-600 hover:border-purple-500 hover:bg-purple-500/5'
              }`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileUpload(file);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                  e.target.value = '';
                }}
              />
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <svg className="animate-spin w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-sm text-gray-400">Đang tải lên...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-semibold text-gray-300">Kéo ảnh vào đây hoặc <span className="text-purple-400">nhấn để chọn file</span></p>
                  <p className="text-xs text-gray-500">JPG, PNG, WEBP · Tối đa 5MB</p>
                </div>
              )}
            </div>

            {/* Current image preview */}
            {form.image_url && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Ảnh hiện tại:</p>
                <div className="relative h-36 rounded-xl overflow-hidden border border-gray-700 group">
                  <Image
                    src={form.image_url}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      className="px-4 py-2 bg-white/90 text-gray-900 text-xs font-bold rounded-xl"
                    >
                      Đổi ảnh khác
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Also allow direct URL paste as fallback */}
            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Hoặc dán URL ảnh trực tiếp</label>
              <input
                type="text"
                value={form.image_url}
                onChange={e => handleChange('image_url', e.target.value)}
                placeholder="https://..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="sticky top-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">👁️ Xem trước (Live Preview)</h2>
          <div className="rounded-2xl overflow-hidden border border-gray-700 shadow-2xl">
            {/* Fake hero banner preview */}
            <div className="relative bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 p-6 min-h-[320px] flex flex-col justify-between">
              {/* Blur blobs */}
              <div className="absolute top-4 left-8 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-[10px] font-medium text-white mb-3">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  {form.badge_text}
                </div>
                {/* Title */}
                <h1 className="text-xl font-black leading-tight text-white mb-2">
                  {form.title_line1}<br />
                  <span className="text-yellow-300">{form.title_line2}</span><br />
                  <span className="text-yellow-300">{form.title_line3}</span>
                </h1>
                {/* Description */}
                <p className="text-[11px] text-blue-200 mb-4 max-w-xs">{form.description}</p>
                {/* Buttons */}
                <div className="flex gap-2">
                  <div className="px-4 py-1.5 bg-white rounded-xl text-[10px] font-bold text-indigo-700">▶ Khám phá ngay</div>
                  <div className="px-4 py-1.5 border border-white/50 rounded-xl text-[10px] font-bold text-white">Đăng ký ngay</div>
                </div>
              </div>

              {/* Image preview inside the banner */}
              {form.image_url && (
                <div className="absolute right-4 top-4 w-32 h-24 rounded-xl overflow-hidden border border-white/20 shadow-xl hidden lg:block">
                  <div className="relative w-full h-full">
                    <Image src={form.image_url} alt="preview" fill className="object-cover" />
                    {/* Floating badge on image */}
                    <div className="absolute bottom-1 left-1 right-1 bg-white/15 backdrop-blur-sm border border-white/20 rounded-lg p-1.5">
                      <div className="text-[8px] font-bold text-white">{form.floating_badge_title}</div>
                      <div className="text-[7px] text-blue-200">{form.floating_badge_subtitle}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats preview */}
              <div className="relative z-10 border-t border-white/10 pt-3 mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  [form.stat1_value, form.stat1_label],
                  [form.stat2_value, form.stat2_label],
                  [form.stat3_value, form.stat3_label],
                ].map(([val, lbl]) => (
                  <div key={val}>
                    <div className="text-sm font-black text-white">{val}</div>
                    <div className="text-[9px] text-blue-200">{lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tip */}
          <div className="mt-4 bg-blue-950/50 border border-blue-800/40 rounded-xl p-4 text-xs text-blue-300">
            <strong className="text-blue-200">💡 Lưu ý:</strong> Sau khi nhấn &quot;Lưu thay đổi&quot;, trang chủ sẽ cập nhật nội dung mới ngay lập tức khi người dùng tải lại trang.
          </div>
        </div>
      </div>
    </div>
  );
}
