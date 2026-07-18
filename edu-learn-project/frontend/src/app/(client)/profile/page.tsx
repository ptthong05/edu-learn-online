'use client';
import { useState } from 'react';
import Image from 'next/image';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ProfilePage() {
  const [tab, setTab] = useState<'info' | 'password'>('info');
  const [name, setName] = useState('Nguyễn Minh Tuấn');
  const [email] = useState('tuan.nguyen@gmail.com');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold">Hồ sơ cá nhân</h1>
          <p className="text-blue-200 mt-1">Quản lý thông tin tài khoản của bạn</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left - Avatar card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-card p-6 text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <Image
                  src="https://ui-avatars.com/api/?name=Nguyen+Minh+Tuan&background=2563eb&color=fff&size=96"
                  alt="Avatar" width={96} height={96} className="rounded-full" />
                <button className="absolute bottom-0 right-0 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center shadow-lg hover:bg-primary-700 transition-colors">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              <h3 className="font-bold text-gray-900">{name}</h3>
              <p className="text-sm text-gray-400 mt-0.5">{email}</p>
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Khóa học</span>
                  <span className="font-semibold text-gray-900">3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Hoàn thành</span>
                  <span className="font-semibold text-green-600">1</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tham gia</span>
                  <span className="font-semibold text-gray-900">10/01/2024</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Form */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-2 mb-5 bg-white rounded-xl shadow-card p-1.5 w-fit">
              {[['info', 'Thông tin'], ['password', 'Đổi mật khẩu']].map(([val, label]) => (
                <button key={val} onClick={() => setTab(val as typeof tab)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                    tab === val ? 'bg-primary-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
                  }`}>
                  {label}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-card p-6">
              {tab === 'info' ? (
                <div className="space-y-5">
                  <h2 className="font-bold text-gray-900 mb-4">Thông tin cá nhân</h2>
                  <Input label="Họ và tên" value={name} onChange={e => setName(e.target.value)}
                    icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
                  <Input label="Email" value={email} readOnly className="bg-gray-50 cursor-not-allowed"
                    icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Ảnh đại diện</label>
                    <div className="flex items-center gap-4">
                      <Image src="https://ui-avatars.com/api/?name=Nguyen+Minh+Tuan&background=2563eb&color=fff&size=48"
                        alt="Avatar" width={48} height={48} className="rounded-full" />
                      <label className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:border-primary-400 hover:text-primary-600 cursor-pointer transition-all">
                        Chọn ảnh mới
                        <input type="file" className="hidden" accept="image/*" />
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <Button onClick={handleSave} fullWidth>
                      {saved ? '✓ Đã lưu!' : 'Lưu thay đổi'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <h2 className="font-bold text-gray-900 mb-4">Đổi mật khẩu</h2>
                  <Input label="Mật khẩu hiện tại" type="password" placeholder="••••••••"
                    icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>} />
                  <Input label="Mật khẩu mới" type="password" placeholder="••••••••"
                    icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>} />
                  <Input label="Xác nhận mật khẩu mới" type="password" placeholder="••••••••"
                    icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>} />
                  <div className="flex items-center gap-3 pt-2">
                    <Button onClick={handleSave} fullWidth>
                      {saved ? '✓ Đã lưu!' : 'Đổi mật khẩu'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
