'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/utils/api';

interface AffiliateRequest {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  bank_name: string;
  bank_account: string;
  address: string;
  dob: string;
  status: 'pending' | 'approved' | 'rejected' | 'terminated';
  ctv_code?: string;
  ma_ctv?: string;
  affiliate_link?: string;
  created_at: string;
}

export default function AdminAffiliatesPage() {
  const [requests, setRequests] = useState<AffiliateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ctvCodeFilter, setCtvCodeFilter] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const AFFILIATES_PER_PAGE = 10;

  const filteredRequests = requests.filter(req => {
    const q = ctvCodeFilter.toLowerCase().trim();
    const code = (req.ma_ctv || req.ctv_code || '').toLowerCase();
    const name = (req.full_name || '').toLowerCase();
    const email = (req.email || '').toLowerCase();
    const phone = (req.phone || '').toLowerCase();
    return code.includes(q) || name.includes(q) || email.includes(q) || phone.includes(q);
  });

  const totalPages = Math.ceil(filteredRequests.length / AFFILIATES_PER_PAGE);
  const visibleRequests = filteredRequests.slice((currentPage - 1) * AFFILIATES_PER_PAGE, currentPage * AFFILIATES_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [requests.length, ctvCodeFilter]);

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminAffiliates();
      setRequests(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách đăng ký affiliate.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected' | 'terminated' | 'pending') => {
    setUpdatingId(id);
    try {
      await api.updateAffiliateStatus(id, status);
      await fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Đang tải danh sách đăng ký...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý đối tác Affiliate</h1>
          <p className="text-gray-400 text-sm mt-1">Xét duyệt các yêu cầu đăng ký làm đại sứ tiếp thị liên kết.</p>
        </div>
        <div>
          <input
            type="text"
            placeholder="Lọc theo mã CTV..."
            value={ctvCodeFilter}
            onChange={(e) => setCtvCodeFilter(e.target.value)}
            className="bg-gray-950 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm focus:border-primary-500 focus:outline-none placeholder-gray-500 min-w-56"
          />
        </div>
      </div>

      {error && <div className="p-4 bg-red-900/30 border border-red-800 text-red-400 rounded-xl text-sm">{error}</div>}

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50 text-xs font-bold uppercase tracking-wider text-gray-400">
                <th className="px-6 py-4">MÃ CTV</th>
                <th className="px-6 py-4">THÔNG TIN CÁ NHÂN</th>
                <th className="px-6 py-4">LIÊN HỆ & ĐỊA CHỈ</th>
                <th className="px-6 py-4">THÔNG TIN NGÂN HÀNG</th>
                <th className="px-6 py-4">TRẠNG THÁI</th>
                <th className="px-6 py-4 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm text-gray-300">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {ctvCodeFilter.trim() ? 'Không tìm thấy yêu cầu đăng ký nào khớp bộ lọc.' : 'Chưa có yêu cầu đăng ký nào.'}
                  </td>
                </tr>
              ) : (
                visibleRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-blue-400">
                      {req.ma_ctv || req.ctv_code || 'Chưa cấp'}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-white">{req.full_name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Ngày sinh: {req.dob}</p>
                        <p className="text-xs text-gray-500">Đăng ký: {new Date(req.created_at).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p>{req.email}</p>
                        <p className="text-xs text-gray-400 mt-0.5">SĐT: {req.phone}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">{req.address}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold">{req.bank_name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">STK: {req.bank_account}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        req.status === 'approved'
                          ? 'bg-green-900/30 text-green-400 border border-green-800/50'
                          : req.status === 'rejected'
                          ? 'bg-red-900/30 text-red-400 border border-red-800/50'
                          : req.status === 'terminated'
                          ? 'bg-red-900/35 text-red-500 border border-red-700/50'
                          : 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/50'
                      }`}>
                        {req.status === 'approved' ? 'Đã duyệt' : req.status === 'rejected' ? 'Từ chối' : req.status === 'terminated' ? 'Ngừng cộng tác' : 'Chờ duyệt'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {req.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'approved')}
                            disabled={updatingId === req.id}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg transition-all disabled:opacity-50"
                          >
                            Phê duyệt
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'rejected')}
                            disabled={updatingId === req.id}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-all disabled:opacity-50"
                          >
                            Từ chối
                          </button>
                        </div>
                      )}
                      {req.status === 'approved' && (
                        <button
                          onClick={() => {
                            if (confirm('Bạn có chắc chắn muốn ngừng cộng tác với đối tác này không?')) {
                              handleUpdateStatus(req.id, 'terminated');
                            }
                          }}
                          disabled={updatingId === req.id}
                          className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 font-bold text-xs rounded-lg transition-all border border-red-500/20 disabled:opacity-50"
                        >
                          Ngừng cộng tác
                        </button>
                      )}
                      {req.status === 'terminated' && (
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'pending')}
                          disabled={updatingId === req.id}
                          className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white font-bold text-xs rounded-lg transition-all disabled:opacity-50"
                        >
                          Xét duyệt lại
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
      </div>
    </div>
  );
}
