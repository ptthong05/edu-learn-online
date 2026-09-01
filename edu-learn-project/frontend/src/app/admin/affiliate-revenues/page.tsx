'use client';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/utils/api';
import toast from 'react-hot-toast';
import Pagination from '@/components/ui/Pagination';

interface Affiliate {
  id: string;
  full_name: string;
  ctv_code?: string;
  ma_ctv?: string;
  status: 'pending' | 'approved' | 'rejected' | 'terminated';
}

interface AffiliateRevenue {
  id: string;
  affiliate_id: string;
  order_id: string;
  course_id: string;
  buyer_name: string;
  order_total: number;
  commission_rate: number;
  commission_amount: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  created_at: string;
  affiliate_name: string;
  ctv_code: string;
}

export default function AdminAffiliateRevenuesPage() {
  const [revenues, setRevenues] = useState<AffiliateRevenue[]>([]);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // CTV Filter state
  const [selectedCtv, setSelectedCtv] = useState<string>('all');
  const [ctvSearch, setCtvSearch] = useState('');
  const [isCtvListOpen, setIsCtvListOpen] = useState(false);
  const ctvFilterRef = useRef<HTMLDivElement>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const REVENUES_PER_PAGE = 10;

  // Filtered revenues
  const filteredRevenues = revenues.filter(rev => {
    if (selectedCtv === 'all') return true;
    return rev.affiliate_id === selectedCtv;
  });

  const totalPages = Math.ceil(filteredRevenues.length / REVENUES_PER_PAGE);
  const visibleRevenues = filteredRevenues.slice((currentPage - 1) * REVENUES_PER_PAGE, currentPage * REVENUES_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [revenues.length, selectedCtv]);

  // Chỉ CTV đã được duyệt mới được dùng để lọc doanh thu.
  const approvedAffiliates = affiliates.filter(
    (affiliate) => affiliate.status === 'approved' && Boolean(affiliate.ma_ctv || affiliate.ctv_code)
  );
  const normalizedSearch = ctvSearch.trim().toLocaleLowerCase('vi-VN');
  const visibleCtvList = approvedAffiliates.filter((affiliate) => {
    const ctvCode = affiliate.ma_ctv || affiliate.ctv_code || '';
    return !normalizedSearch ||
      affiliate.full_name.toLocaleLowerCase('vi-VN').includes(normalizedSearch) ||
      ctvCode.toLocaleLowerCase('vi-VN').includes(normalizedSearch);
  });
  const selectedAffiliate = approvedAffiliates.find((affiliate) => affiliate.id === selectedCtv);

  useEffect(() => {
    const closeCtvList = (event: MouseEvent) => {
      if (!ctvFilterRef.current?.contains(event.target as Node)) {
        setIsCtvListOpen(false);
      }
    };

    document.addEventListener('mousedown', closeCtvList);
    return () => document.removeEventListener('mousedown', closeCtvList);
  }, []);

  const fetchRevenues = async () => {
    try {
      setLoading(true);
      const [revenueData, affiliateData] = await Promise.all([
        api.getAdminAffiliateRevenues(),
        api.getAdminAffiliates(),
      ]);
      setRevenues(revenueData || []);
      setAffiliates(affiliateData || []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách doanh thu affiliate.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenues();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'paid' | 'cancelled' | 'pending') => {
    setUpdatingId(id);
    try {
      await api.updateAdminAffiliateRevenueStatus(id, status);
      toast.success('Cập nhật trạng thái doanh thu thành công!');
      await fetchRevenues();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi cập nhật trạng thái.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Đang tải danh sách doanh thu...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý Doanh thu Affiliate</h1>
          <p className="text-gray-400 text-sm mt-1">Theo dõi hoa hồng phát sinh từ các đơn hàng được giới thiệu và thực hiện đối soát thanh toán.</p>
        </div>
        
        {/* CTV Filter */}
        <div ref={ctvFilterRef} className="relative flex items-center gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Lọc theo CTV:</label>
          <select
            value={selectedCtv}
            onChange={e => setSelectedCtv(e.target.value)}
            className="hidden"
          >
            <option value="all">Tất cả CTV</option>
            {approvedAffiliates.map((affiliate) => (
              <option key={affiliate.id} value={affiliate.id}>
                {affiliate.full_name} ({affiliate.ma_ctv || affiliate.ctv_code || 'Chưa có mã'})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setIsCtvListOpen((isOpen) => !isOpen)}
            className="min-w-56 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-left text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500 flex items-center justify-between gap-2"
          >
            <span>
              {selectedAffiliate
                ? `${selectedAffiliate.full_name} (${selectedAffiliate.ma_ctv || selectedAffiliate.ctv_code})`
                : 'Tất cả CTV'}
            </span>
            <svg className="w-4 h-4 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isCtvListOpen && (
            <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-xl border border-gray-800 bg-gray-950 p-2 shadow-xl">
              <input
                autoFocus
                type="search"
                value={ctvSearch}
                onChange={(event) => setCtvSearch(event.target.value)}
                placeholder="Tìm tên hoặc mã CTV..."
                className="mb-2 w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <div className="max-h-72 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCtv('all');
                    setCtvSearch('');
                    setIsCtvListOpen(false);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-white hover:bg-white/10"
                >
                  Tất cả CTV
                </button>
                {visibleCtvList.map((affiliate) => {
                  const ctvCode = affiliate.ma_ctv || affiliate.ctv_code;
                  return (
                    <button
                      key={affiliate.id}
                      type="button"
                      onClick={() => {
                        setSelectedCtv(affiliate.id);
                        setCtvSearch('');
                        setIsCtvListOpen(false);
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-white hover:bg-white/10"
                    >
                      <span className="block truncate">{affiliate.full_name}</span>
                      <span className="block text-xs text-primary-400">{ctvCode}</span>
                    </button>
                  );
                })}
                {visibleCtvList.length === 0 && (
                  <p className="px-3 py-3 text-sm text-gray-500">Không tìm thấy CTV phù hợp.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {error && <div className="p-4 bg-red-900/30 border border-red-800 text-red-400 rounded-xl text-sm">{error}</div>}

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50 text-xs font-bold uppercase tracking-wider text-gray-400">
                <th className="px-6 py-4">Mã giao dịch</th>
                <th className="px-6 py-4">Đối tác giới thiệu</th>
                <th className="px-6 py-4">Thông tin đơn hàng</th>
                <th className="px-6 py-4">Doanh thu & Hoa hồng</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm text-gray-300">
              {filteredRevenues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Chưa có giao dịch doanh thu nào phù hợp.</td>
                </tr>
              ) : (
                visibleRevenues.map((rev) => (
                  <tr key={rev.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">
                      <div>{rev.id}</div>
                      <div className="text-[10px] text-gray-500 mt-1">{new Date(rev.created_at).toLocaleString('vi-VN')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-white">{rev.affiliate_name}</p>
                        <p className="text-xs text-primary-400 font-mono font-bold mt-0.5">Mã CTV: {rev.ctv_code || 'CTV001'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-xs text-gray-400">Đơn hàng: <span className="font-semibold text-white font-mono">{rev.order_id}</span></p>
                        <p className="text-xs text-gray-500 mt-1">Người mua: {rev.buyer_name || 'Khách hàng'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-white">{rev.order_total.toLocaleString('vi-VN')}đ</p>
                        <p className="text-xs text-amber-500 font-medium mt-0.5">Hoa hồng ({rev.commission_rate}%): +{rev.commission_amount.toLocaleString('vi-VN')}đ</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rev.status === 'approved'
                          ? 'bg-green-900/30 text-green-400 border border-green-800/50'
                          : rev.status === 'paid'
                          ? 'bg-blue-900/30 text-blue-400 border border-blue-800/50'
                          : rev.status === 'cancelled'
                          ? 'bg-red-900/30 text-red-400 border border-red-800/50'
                          : 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/50'
                      }`}>
                        {rev.status === 'approved' ? 'Đã duyệt' : 
                         rev.status === 'paid' ? 'Đã thanh toán' : 
                         rev.status === 'cancelled' ? 'Hủy bỏ' : 'Chờ duyệt'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {rev.status === 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(rev.id, 'paid')}
                            disabled={updatingId === rev.id}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all disabled:opacity-50"
                          >
                            Đã thanh toán
                          </button>
                        )}
                        {rev.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(rev.id, 'approved')}
                            disabled={updatingId === rev.id}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg transition-all disabled:opacity-50"
                          >
                            Duyệt hoa hồng
                          </button>
                        )}
                        {['pending', 'approved'].includes(rev.status) && (
                          <button
                            onClick={() => handleUpdateStatus(rev.id, 'cancelled')}
                            disabled={updatingId === rev.id}
                            className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 font-bold text-xs rounded-lg transition-all border border-red-500/20 disabled:opacity-50"
                          >
                            Hủy
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
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
