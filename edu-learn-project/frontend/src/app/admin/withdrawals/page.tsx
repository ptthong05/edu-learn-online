'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/utils/api';
import Pagination from '@/components/ui/Pagination';

interface Withdrawal {
  id: string;
  amount: number;
  bank_name: string;
  bank_account: string;
  account_holder: string;
  phone: string;
  email: string;
  status: 'pending' | 'completed' | 'rejected';
  created_at: string;
  affiliate_name: string;
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const WITHDRAWALS_PER_PAGE = 10;

  const filteredWithdrawals = withdrawals.filter(w => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return w.id.toLowerCase().includes(q) || 
           w.affiliate_name.toLowerCase().includes(q) ||
           w.account_holder.toLowerCase().includes(q) ||
           (w.phone || '').toLowerCase().includes(q) ||
           (w.email || '').toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filteredWithdrawals.length / WITHDRAWALS_PER_PAGE);
  const visibleWithdrawals = filteredWithdrawals.slice((currentPage - 1) * WITHDRAWALS_PER_PAGE, currentPage * WITHDRAWALS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [withdrawals.length, searchQuery]);

  const load = async () => {
    try {
      setLoading(true);
      setWithdrawals(await api.getAdminWithdrawals());
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải danh sách thanh toán.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const updateStatus = async (id: string, status: Withdrawal['status']) => {
    try {
      setUpdatingId(id);
      await api.updateWithdrawalStatus(id, status);
      toast.success(status === 'completed' ? 'Đã xác nhận thanh toán.' : 'Đã từ chối yêu cầu.');
      await load();
    } catch (error: any) {
      toast.error(error.message || 'Không thể cập nhật trạng thái.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Đang tải danh sách thanh toán...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Thanh toán rút tiền</h1>
          <p className="mt-1 text-sm text-gray-400">Xử lý các yêu cầu rút hoa hồng của đối tác Affiliate.</p>
        </div>
        <div>
          <input
            type="text"
            placeholder="Lọc theo mã yêu cầu hoặc tên CTV..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-950 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm focus:border-primary-500 focus:outline-none placeholder-gray-500 min-w-72"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-800 bg-gray-900/50 text-xs font-bold uppercase tracking-wider text-gray-400">
              <tr>
                <th className="px-5 py-4">Yêu cầu</th>
                <th className="px-5 py-4">Đối tác</th>
                <th className="px-5 py-4">Thông tin nhận tiền</th>
                <th className="px-5 py-4">Số tiền</th>
                <th className="px-5 py-4">Trạng thái</th>
                <th className="px-5 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-300">
              {filteredWithdrawals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-500">
                    {searchQuery.trim() ? 'Không tìm thấy yêu cầu rút tiền nào khớp bộ lọc.' : 'Chưa có yêu cầu rút tiền.'}
                  </td>
                </tr>
              ) : visibleWithdrawals.map(item => (
                <tr key={item.id} className="hover:bg-white/5">
                  <td className="px-5 py-4 font-mono text-xs"><div>{item.id}</div><div className="mt-1 text-gray-500">{new Date(item.created_at).toLocaleString('vi-VN')}</div></td>
                  <td className="px-5 py-4 font-semibold text-white">{item.affiliate_name}</td>
                  <td className="px-5 py-4 text-xs leading-5"><div>{item.bank_name} · {item.bank_account}</div><div>{item.account_holder}</div><div>{item.phone} · {item.email}</div></td>
                  <td className="px-5 py-4 font-bold text-white">{Number(item.amount).toLocaleString('vi-VN')}đ</td>
                  <td className="px-5 py-4"><span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${item.status === 'completed' ? 'border-green-800/50 bg-green-900/30 text-green-400' : item.status === 'rejected' ? 'border-red-800/50 bg-red-900/30 text-red-400' : 'border-yellow-800/50 bg-yellow-900/30 text-yellow-400'}`}>{item.status === 'completed' ? 'Đã thanh toán' : item.status === 'rejected' ? 'Từ chối' : 'Chờ xử lý'}</span></td>
                  <td className="px-5 py-4 text-right"><div className="flex justify-end gap-2">
                    {item.status === 'pending' && <><button onClick={() => void updateStatus(item.id, 'completed')} disabled={updatingId === item.id} className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-50">Đã thanh toán</button><button onClick={() => void updateStatus(item.id, 'rejected')} disabled={updatingId === item.id} className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/10 disabled:opacity-50">Từ chối</button></>}
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
