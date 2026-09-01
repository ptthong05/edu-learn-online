'use client';
import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { formatPrice } from '@/lib/utils/helpers';
import { api } from '@/lib/utils/api';
import toast from 'react-hot-toast';
import Pagination from '@/components/ui/Pagination';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const USERS_PER_PAGE = 10;
  const totalPages = Math.ceil(users.length / USERS_PER_PAGE);
  const visibleUsers = users.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [users.length]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminUsers();
      setUsers(data);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleBlockStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      await api.updateAdminUserStatus(id, newStatus);
      toast.success(newStatus === 'active' ? 'Mở khóa tài khoản thành công' : 'Khóa tài khoản thành công');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Cập nhật trạng thái thất bại');
    }
  };

  const showHistory = async (u: User) => {
    setSelectedUser(u);
    setIsOpen(true);
    setLoadingOrders(true);
    try {
      const data = await api.getAdminUserOrders(u.id);
      setUserOrders(data);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tải lịch sử mua hàng');
    } finally {
      setLoadingOrders(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-400 text-sm">Quản lý và xem thông tin tài khoản người dùng cuối.</p>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-950 border-b border-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <th className="p-4">Họ và tên</th>
              <th className="p-4">Email</th>
              <th className="p-4">Số điện thoại</th>
              <th className="p-4">Mật khẩu</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4">Ngày đăng ký</th>
              <th className="p-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 text-sm">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  Đang tải danh sách người dùng...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  Không tìm thấy người dùng nào.
                </td>
              </tr>
            ) : (
              visibleUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-950/40 transition-all">
                  <td className="p-4 flex items-center gap-3">
                    <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.full_name}`} alt={u.full_name} className="w-10 h-10 rounded-full" />
                    <span className="font-semibold text-white">{u.full_name}</span>
                  </td>
                  <td className="p-4 text-gray-300">{u.email}</td>
                  <td className="p-4 text-gray-300">{u.phone || '—'}</td>
                  <td className="p-4 text-gray-400 font-mono text-xs max-w-[120px] truncate" title={u.password}>
                    {u.password || '—'}
                  </td>
                  <td className="p-4">
                    {u.status === 'active' ? (
                      <Badge variant="green">Đang hoạt động</Badge>
                    ) : (
                      <Badge variant="red">Bị khóa</Badge>
                    )}
                  </td>
                  <td className="p-4 text-gray-500">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => showHistory(u)} className="text-xs font-bold text-primary-400 hover:underline">
                      Lịch sử mua hàng
                    </button>
                    <button
                      onClick={() => toggleBlockStatus(u.id, u.status)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                        u.status === 'active'
                          ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                          : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                      }`}
                    >
                      {u.status === 'active' ? 'Khóa' : 'Mở khóa'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Lịch sử mua hàng Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={`Lịch sử mua hàng - ${selectedUser?.full_name}`}>
        <div className="space-y-4 font-sans text-gray-800">
          {loadingOrders ? (
            <p className="text-center py-6 text-gray-500 text-sm">Đang tải lịch sử giao dịch...</p>
          ) : userOrders.length > 0 ? (
            <div className="divide-y divide-gray-300 max-h-[400px] overflow-y-auto pr-1">
              {userOrders.map(o => (
                <div key={o.id} className="py-4 flex flex-col gap-2.5 text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{o.id}</p>
                      <p className="text-xs text-gray-500">
                        {o.created_at ? new Date(o.created_at).toLocaleString('vi-VN') : '—'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-primary-600 text-base">{formatPrice(o.total)}</p>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        o.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                        o.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {o.status === 'completed' ? 'Đã hoàn thành' :
                         o.status === 'cancelled' ? 'Đã hủy' : 'Chờ xử lý'}
                      </span>
                    </div>
                  </div>
                  {o.items && o.items.length > 0 && (
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1.5 shadow-sm">
                      {o.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="truncate max-w-[280px] text-gray-700 font-medium" title={item.title}>• {item.title}</span>
                          <span className="font-bold text-gray-900">{formatPrice(item.price)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Phương thức: <span className="uppercase font-bold text-gray-800">{o.payment_method}</span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-gray-500 text-sm">Chưa thực hiện giao dịch nào.</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
