'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/utils/api';

interface AffiliateStats {
  affiliate_id: string;
  ctv_code: string;
  full_name: string;
  phone: string;
  email: string;
  monthly_commission: number;
  total_commission: number;
}

export default function AdminAffiliateStatsPage() {
  const [stats, setStats] = useState<AffiliateStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedCtv, setSelectedCtv] = useState('all');
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [allTimeTotal, setAllTimeTotal] = useState(0);
  const [affiliates, setAffiliates] = useState<any[]>([]);

  const fetchStats = async (month: string) => {
    try {
      setLoading(true);
      const data = await api.getAdminAffiliateCommissionStats(month);
      // Sort by created_at DESC to show newest affiliates first
      const sortedData = (data || []).sort((a: any, b: any) => 
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
      setStats(sortedData);
      
      // Calculate totals
      const mTotal = sortedData.reduce((sum: number, item: any) => sum + (item.monthly_commission || 0), 0);
      const aTotal = sortedData.reduce((sum: number, item: any) => sum + (item.total_commission || 0), 0);
      setMonthlyTotal(mTotal);
      setAllTimeTotal(aTotal);
    } catch (err: any) {
      setError(err.message || 'Không thể tải thống kê affiliate.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAffiliates = async () => {
    try {
      const data = await api.getAdminAffiliates();
      // Filter to only show affiliates that have CTV codes
      const affiliatesWithCode = (data || []).filter((aff: any) => aff.ma_ctv || aff.ctv_code);
      setAffiliates(affiliatesWithCode);
    } catch (err) {
      console.error('Failed to fetch affiliates:', err);
    }
  };

  useEffect(() => {
    fetchStats(selectedMonth);
    fetchAffiliates();
  }, [selectedMonth]);

  const handleCtvChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCtv(e.target.value);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(e.target.value);
  };

  // Filter stats by selected CTV
  const filteredStats = selectedCtv === 'all' 
    ? stats 
    : stats.filter((stat: any) => stat.affiliate_id === selectedCtv);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const STATS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredStats.length / STATS_PER_PAGE);
  const visibleStats = filteredStats.slice((currentPage - 1) * STATS_PER_PAGE, currentPage * STATS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredStats.length]);

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Đang tải thống kê affiliate...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Thống kê Doanh thu CTV</h1>
          <p className="text-gray-400 text-sm mt-1">Bảng theo dõi thông tin và doanh thu của các Cộng tác viên.</p>
        </div>
      </div>

      {error && <div className="p-4 bg-red-900/30 border border-red-800 text-red-400 rounded-xl text-sm">{error}</div>}

      {/* Summary Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-400">Tổng hoa hồng tháng {selectedMonth}</p>
              <h3 className="text-3xl font-bold text-white mt-2">{monthlyTotal.toLocaleString('vi-VN')}đ</h3>
            </div>
            <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-400">Tổng hoa hồng tất cả CTV</p>
              <h3 className="text-3xl font-bold text-amber-400 mt-2">{allTimeTotal.toLocaleString('vi-VN')}đ</h3>
            </div>
            <div className="w-12 h-12 bg-amber-600/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <style dangerouslySetInnerHTML={{ __html: `
            #affiliate-month-filter::-webkit-calendar-picker-indicator {
              filter: invert(1);
              cursor: pointer;
            }
          ` }} />
          <label className="text-sm font-semibold text-gray-400">Chọn tháng:</label>
          <input
            id="affiliate-month-filter"
            type="month"
            value={selectedMonth}
            onChange={handleMonthChange}
            className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="text-sm font-semibold text-gray-400">Lọc theo CTV:</label>
          <select
            value={selectedCtv}
            onChange={handleCtvChange}
            className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Tất cả CTV</option>
            {affiliates.map((aff) => (
              <option key={aff.id} value={aff.id}>
                {aff.full_name} ({aff.ma_ctv || aff.ctv_code || 'Chưa có mã'})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50 text-xs font-bold uppercase tracking-wider text-gray-400">
                <th className="px-6 py-4">Mã CTV</th>
                <th className="px-6 py-4">Họ tên</th>
                <th className="px-6 py-4">Số điện thoại</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4 text-right">Doanh thu tháng</th>
                <th className="px-6 py-4 text-right">Tổng doanh thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm text-gray-300">
              {filteredStats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Chưa có dữ liệu CTV nào.</td>
                </tr>
              ) : (
                filteredStats.map((stat) => (
                  <tr key={stat.affiliate_id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-blue-400">
                      {stat.ctv_code || 'Chưa có mã'}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-white">{stat.full_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300">{stat.phone || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300">
                        {stat.email ? stat.email.replace(/\.drive/gi, '') : 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-semibold text-white">{stat.monthly_commission.toLocaleString('vi-VN')}đ</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-semibold text-amber-400">{stat.total_commission.toLocaleString('vi-VN')}đ</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}