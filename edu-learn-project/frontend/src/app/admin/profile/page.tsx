'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/utils/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { cleanPassword } from '@/lib/utils/helpers';

export default function AdminProfile() {
  const { user, updateUser, logout } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Họ và tên không được để trống.');
      return;
    }
    if (!email.trim()) {
      toast.error('Email không được để trống.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('Email không đúng định dạng.');
      return;
    }

    const phoneDigits = phone ? phone.replace(/\D/g, '') : '';
    const phonePattern = /^(03|05|07|08|09|02[0-9])[0-9]{8}$/;
    if (phone && phone.trim() && !phonePattern.test(phoneDigits)) {
      toast.error('Số điện thoại phải đúng định dạng Việt Nam (10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09 hoặc 02).');
      return;
    }

    if (newPassword) {
      if (!oldPassword) {
        toast.error('Vui lòng nhập mật khẩu cũ để đổi mật khẩu.');
        return;
      }
      if (newPassword.length < 6) {
        toast.error('Mật khẩu mới phải từ 6 ký tự trở lên.');
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error('Mật khẩu mới và mật khẩu xác nhận không khớp.');
        return;
      }
    }

    setSaving(true);
    try {
      const payload: any = {
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone && phone.trim() ? phoneDigits : null,
      };

      if (newPassword) {
        payload.old_password = oldPassword;
        payload.new_password = newPassword;
      }

      const res = await api.updateProfile(payload);

      if (newPassword) {
        toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
        logout();
        router.push('/login');
        return;
      }

      toast.success(res.message || 'Cập nhật tài khoản thành công.');
      
      // Update local storage and context state
      updateUser(res.user);

      // Reset password fields
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi cập nhật tài khoản.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans text-gray-200">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div>
          <h3 className="text-xl font-bold text-white">⚙️ Thiết lập tài khoản</h3>
          <p className="text-gray-400 text-xs mt-1">Cập nhật thông tin hồ sơ cá nhân và đổi mật khẩu bảo mật.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-primary-400 uppercase tracking-wider border-b border-gray-800 pb-2">Thông tin cá nhân</h4>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Họ và tên</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên"
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Số điện thoại</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Nhập số điện thoại"
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Địa chỉ Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Nhập địa chỉ email"
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Password Change Section */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold text-primary-400 uppercase tracking-wider border-b border-gray-800 pb-2">Thay đổi mật khẩu</h4>
            
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Mật khẩu hiện tại</label>
              <input
                type="password"
                value={oldPassword}
                onChange={e => setOldPassword(cleanPassword(e.target.value))}
                placeholder="Nhập mật khẩu cũ (bỏ qua nếu không đổi mật khẩu)"
                autoComplete="new-password"
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Mật khẩu mới</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(cleanPassword(e.target.value))}
                  placeholder="Nhập ít nhất 6 ký tự"
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(cleanPassword(e.target.value))}
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary-600 hover:bg-primary-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-md disabled:opacity-55"
            >
              {saving ? 'Đang cập nhật...' : 'Lưu thông tin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
