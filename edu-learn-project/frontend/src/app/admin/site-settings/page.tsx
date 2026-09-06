'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/lib/utils/auth';

interface SiteSettings {
  id: string;
  site_name: string;
  site_tagline: string;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  secondary_color: string;
  updated_at: string;
}

export default function SiteSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [settings, setSettings] = useState<SiteSettings>({
    id: 'settings-main',
    site_name: 'DRIVE MH',
    site_tagline: 'Học Trực Tuyến',
    logo_url: '',
    favicon_url: '',
    primary_color: '#2563eb',
    secondary_color: '#1e40af',
    updated_at: ''
  });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3500);
  };

  useEffect(() => {
    fetchSettings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSettings = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch('http://localhost:5000/api/admin/site-settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) { router.push('/login'); return; }
      if (res.ok) { const data = await res.json(); setSettings(data); }
    } catch (err) {
      setError('Không thể tải cài đặt website');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    setError('');
    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('http://localhost:5000/api/admin/upload-image', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setSettings(prev => ({ ...prev, logo_url: data.url }));
        showToast('Upload logo thành công! Nhấn "Lưu thay đổi" để áp dụng.');
      } else {
        setError(data.message || 'Có lỗi xảy ra khi upload logo');
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = getAuthToken();
      const res = await fetch('http://localhost:5000/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings);
        showToast('Cập nhật cài đặt website thành công!', 'success');
      } else {
        showToast(data.message || 'Có lỗi xảy ra', 'error');
      }
    } catch (err) {
      showToast('Không thể kết nối đến server', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-400">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      {/* Bottom-right toast notification */}
      <div
        className={`fixed bottom-6 right-6 z-[9999] transition-all duration-500 ${
          toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl font-semibold text-sm ${
          toastType === 'success'
            ? 'bg-emerald-600 text-white'
            : 'bg-red-600 text-white'
        }`}>
          {toastType === 'success' ? (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {toastMsg}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-white mb-8">Cài đặt Website</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-800 text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Site name */}
            <div>
              <label htmlFor="site_name" className="block text-sm font-semibold text-gray-300 mb-2">
                Tên Website <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="site_name"
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ví dụ: DRIVE MH, EduLearn, ..."
                required
              />
              <p className="mt-1 text-xs text-gray-500">Tên hiển thị trên header, footer và các trang khác của website</p>
            </div>

            {/* Tagline */}
            <div>
              <label htmlFor="site_tagline" className="block text-sm font-semibold text-gray-300 mb-2">
                Slogan / Tagline
              </label>
              <input
                type="text"
                id="site_tagline"
                value={settings.site_tagline}
                onChange={(e) => setSettings({ ...settings, site_tagline: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ví dụ: Nền tảng học trực tuyến hàng đầu"
              />
            </div>

            {/* Logo */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Logo Website Preview</label>
              <div className="mb-3 p-4 bg-gray-950 border border-gray-800 rounded-xl min-h-[5rem] flex items-center justify-center">
                {settings.logo_url ? (
                  <img
                    src={settings.logo_url}
                    alt="Logo preview"
                    className="h-16 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-white font-black text-sm tracking-tight">
                        {(() => {
                          const name = settings.site_name || 'DRIVE MH';
                          const words = name.trim().split(/\s+/);
                          return words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
                        })()}
                      </span>
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-base font-black text-blue-600 tracking-tight">
                        {settings.site_name || 'DRIVE MH'}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium tracking-wide">
                        {settings.site_tagline || 'Học Trực Tuyến'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mb-3">
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl cursor-pointer hover:bg-gray-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{uploadingLogo ? 'Đang upload...' : 'Chọn ảnh logo'}</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo} className="hidden" />
                </label>
                
                {settings.logo_url && (
                  <button
                    type="button"
                    onClick={() => {
                      setSettings(prev => ({ ...prev, logo_url: '' }));
                      showToast('Đã xóa logo tạm thời. Hãy nhấn "Lưu thay đổi" để xác nhận.');
                    }}
                    className="px-4 py-3 bg-red-950 text-red-400 border border-red-500/20 hover:bg-red-900/40 rounded-xl flex items-center gap-2 transition-colors font-semibold text-sm"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Xóa logo</span>
                  </button>
                )}
              </div>
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-700"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-gray-900 text-gray-400">Hoặc nhập URL</span></div>
              </div>
              <input
                type="text"
                value={settings.logo_url || ''}
                onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://example.com/logo.png"
              />
            </div>


            {/* Footer actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-800">
              <div className="text-xs text-gray-500">
                Cập nhật lần cuối: {settings.updated_at ? new Date(settings.updated_at).toLocaleString('vi-VN') : '—'}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2.5 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors text-sm font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                >
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
