'use client';
import React, { useState, useEffect } from 'react';
import { Admin } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { api } from '@/lib/utils/api';
import toast from 'react-hot-toast';

export default function AdminAccounts() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<Admin | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ACCOUNTS_PER_PAGE = 10;
  const totalPages = Math.ceil(admins.length / ACCOUNTS_PER_PAGE);
  const visibleAdmins = admins.slice((currentPage - 1) * ACCOUNTS_PER_PAGE, currentPage * ACCOUNTS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [admins.length]);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'MANAGER' | 'STAFF'>('STAFF');
  
  // Specific Field Errors
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminAccounts();
      // Sort by created_at descending (newest first)
      const sortedData = data.sort((a: Admin, b: Admin) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
      setAdmins(sortedData);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tải danh sách tài khoản quản trị');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const openAddModal = () => {
    setEditAdmin(null);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setRole('STAFF');
    setNameError('');
    setEmailError('');
    setPhoneError('');
    setPasswordError('');
    setIsOpen(true);
  };

  const openEditModal = (a: Admin) => {
    setEditAdmin(a);
    setName(a.full_name);
    setEmail(a.email);
    setPhone(a.phone || '');
    setPassword('');
    setRole(a.role);
    setNameError('');
    setEmailError('');
    setPhoneError('');
    setPasswordError('');
    setIsOpen(true);
  };

  const handleSave = async () => {
    let hasError = false;
    
    // Clear errors first
    setNameError('');
    setEmailError('');
    setPhoneError('');
    setPasswordError('');

    if (editAdmin) {
      // Edit existing admin
      if (!name.trim()) {
        setNameError('Vui lòng nhập họ tên.');
        hasError = true;
      }
      if (!email.trim()) {
        setEmailError('Vui lòng nhập địa chỉ email.');
        hasError = true;
      } else if (!/^[^\s@]+@gmail\.com$/.test(email.trim().toLowerCase())) {
        setEmailError('Email phải có đuôi @gmail.com.');
        hasError = true;
      }
      if (!phone.trim()) {
        setPhoneError('Vui lòng nhập số điện thoại.');
        hasError = true;
      } else {
        const phoneDigits = phone.replace(/\D/g, '');
        if (!/^(03|05|07|08|09|02[0-9])[0-9]{8}$/.test(phoneDigits)) {
          setPhoneError('Số điện thoại phải đúng định dạng Việt Nam (10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09 hoặc 02).');
          hasError = true;
        }
      }

      if (hasError) return;

      try {
        const phoneDigits = phone.replace(/\D/g, '');
        await api.updateAdminAccount(editAdmin.id, { full_name: name, email, phone: phoneDigits, role, ...(password && { password }) });
        toast.success('Cập nhật tài khoản quản trị thành công.');
        setIsOpen(false);
        fetchAccounts();
      } catch (err: any) {
        toast.error(err.message || 'Lỗi khi cập nhật tài khoản.');
      }
    } else {
      // Create new admin
      if (!name.trim()) {
        setNameError('Vui lòng nhập họ tên nhân viên.');
        hasError = true;
      }
      if (!email.trim()) {
        setEmailError('Vui lòng nhập địa chỉ email.');
        hasError = true;
      } else if (!/^[^\s@]+@gmail\.com$/.test(email.trim().toLowerCase())) {
        setEmailError('Email phải có đuôi @gmail.com.');
        hasError = true;
      }
      if (!phone.trim()) {
        setPhoneError('Vui lòng nhập số điện thoại.');
        hasError = true;
      } else {
        const phoneDigits = phone.replace(/\D/g, '');
        if (!/^(03|05|07|08|09|02[0-9])[0-9]{8}$/.test(phoneDigits)) {
          setPhoneError('Số điện thoại không đúng định dạng Việt Nam (10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09 hoặc 02).');
          hasError = true;
        }
      }
      if (!password) {
        setPasswordError('Vui lòng nhập mật khẩu.');
        hasError = true;
      }

      if (hasError) return;

      try {
        const phoneDigits = phone.replace(/\D/g, '');
        await api.createAdminAccount({ full_name: name, email, phone: phoneDigits, password, role });
        toast.success('Thêm tài khoản quản trị thành công.');
        setIsOpen(false);
        fetchAccounts();
      } catch (err: any) {
        toast.error(err.message || 'Lỗi khi tạo tài khoản.');
      }
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const admin = admins.find(a => a.id === id);
      if (!admin) return;
      
      const newStatus = admin.status === 'active' ? 'blocked' : 'active';
      await api.updateAdminAccountStatus(id, newStatus);
      toast.success(newStatus === 'active' ? 'Mở khóa tài khoản thành công' : 'Khóa tài khoản thành công');
      fetchAccounts();
    } catch (err: any) {
      toast.error(err.message || 'Cập nhật trạng thái thất bại');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.updateAdminAccountStatus(id, 'blocked');
      toast.success('Đã khóa tài khoản quản trị thành công.');
      fetchAccounts();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi khóa tài khoản.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm">Quản lý và cấp quyền các tài khoản quản trị (Chỉ Quản lý - Manager mới có quyền này).</p>
        <Button onClick={openAddModal}>+ Thêm nhân viên</Button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-950 border-b border-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <th className="p-4">Nhân sự</th>
              <th className="p-4">Email</th>
              <th className="p-4">Số điện thoại</th>
              <th className="p-4">Mật khẩu</th>
              <th className="p-4">Vai trò</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4">Ngày tạo</th>
              <th className="p-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 text-sm">
            {loading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-500">
                  Đang tải danh sách tài khoản...
                </td>
              </tr>
            ) : admins.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-500">
                  Không tìm thấy tài khoản quản trị nào.
                </td>
              </tr>
            ) : (
              visibleAdmins.map(a => (
                <tr key={a.id} className="hover:bg-gray-950/40 transition-all">
                  <td className="p-4 font-semibold text-white">{a.full_name}</td>
                  <td className="p-4 text-gray-300">{a.email}</td>
                  <td className="p-4 text-gray-300">{a.phone || '—'}</td>
                  <td className="p-4 text-gray-400 font-mono text-xs max-w-[120px] truncate" title={a.password}>
                    {a.password || '—'}
                  </td>
                  <td className="p-4">
                    {a.role === 'MANAGER' ? (
                      <Badge variant="purple">Quản lý</Badge>
                    ) : (
                      <Badge variant="blue">Nhân viên</Badge>
                    )}
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => toggleStatus(a.id)}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      title="Nhấn để thay đổi trạng thái"
                    >
                      {a.status === 'active' ? (
                        <Badge variant="green">Đang hoạt động</Badge>
                      ) : (
                        <Badge variant="red">Bị khóa</Badge>
                      )}
                    </button>
                  </td>
                  <td className="p-4 text-gray-555">
                    {a.created_at ? new Date(a.created_at).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => openEditModal(a)} className="p-1.5 hover:bg-white/5 rounded-lg text-primary-400 transition-all">
                      Sửa
                    </button>
                    {a.role !== 'MANAGER' && (
                      <button onClick={() => handleDelete(a.id)} className="p-1.5 hover:bg-white/5 rounded-lg text-red-500 transition-all">
                        Xóa
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 bg-gray-950/40 border-t border-gray-800 text-xs">
            <p className="text-gray-400">
              Hiển thị trang <span className="font-semibold text-white">{currentPage}</span> trên <span className="font-semibold text-white">{totalPages}</span>
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-800 bg-gray-900 text-gray-300 hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-gray-900 transition font-bold"
              >
                Trước
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-800 bg-gray-900 text-gray-300 hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-gray-900 transition font-bold"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editAdmin ? 'Sửa thông tin' : 'Thêm tài khoản quản trị mới'}>
        <div className="space-y-4">
          <Input label="Họ tên nhân viên" placeholder="Nhập tên nhân viên" value={name} onChange={e => { setName(e.target.value); setNameError(''); }} error={nameError} />
          <Input label="Địa chỉ Email" type="email" autoComplete="off" value={email} onChange={e => { setEmail(e.target.value); setEmailError(''); }} error={emailError} />
          <Input label="Số điện thoại" type="tel" placeholder="Nhập số điện thoại" value={phone} onChange={e => { setPhone(e.target.value); setPhoneError(''); }} error={phoneError} />
          {!editAdmin && (
            <Input label="Mật khẩu" type="password" autoComplete="new-password" value={password} onChange={e => { setPassword(e.target.value); setPasswordError(''); }} error={passwordError} />
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Vai trò (Phân quyền)</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as 'MANAGER' | 'STAFF')}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              <option value="STAFF">Nhân viên (Staff)</option>
              <option value="MANAGER">Quản lý (Manager)</option>
            </select>
          </div>

          <Button fullWidth onClick={handleSave}>Lưu thông tin</Button>
        </div>
      </Modal>
    </div>
  );
}
