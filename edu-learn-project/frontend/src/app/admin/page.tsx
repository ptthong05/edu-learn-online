'use client';
import React, { useEffect, useState } from 'react';
import { api } from '@/lib/utils/api';
import { formatPrice } from '@/lib/utils/helpers';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [monthlyStats, setMonthlyStats] = useState<any>(null);
  const [cumulativeStats, setCumulativeStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getAdminStats()
      .then(res => setStats(res))
      .catch(err => {
        console.error('Error fetching stats:', err);
        setError(err.message || 'Không thể tải số liệu thống kê');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.getAdminMonthlyStats(selectedMonth)
      .then(res => setMonthlyStats(res))
      .catch(err => {
        console.error('Error fetching monthly stats:', err);
        setError(err.message || 'Không thể tải thống kê theo tháng');
      });
  }, [selectedMonth]);

  useEffect(() => {
    api.getAdminMonthlyCumulativeStats(selectedMonth)
      .then(res => setCumulativeStats(res))
      .catch(err => {
        console.error('Error fetching cumulative stats:', err);
        setError(err.message || 'Không thể tải thống kê tích lũy');
      });
  }, [selectedMonth]);

  const getCurrentMonthLabel = () => {
    const [year, month] = selectedMonth.split('-');
    const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  if (loading) return <div className="text-gray-400">Đang tải số liệu thống kê từ database...</div>;

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white mb-4">Tổng quan hệ thống</h2>
        <div className="p-6 rounded-2xl border border-red-800 bg-red-900/20 backdrop-blur-sm shadow-xl">
          <p className="text-red-400 font-semibold">⚠️ Lỗi khi tải số liệu</p>
          <p className="text-gray-300 mt-2">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const cardList = [
    { title: 'Tổng doanh thu', value: formatPrice(cumulativeStats?.cumulative_revenue || 0), color: 'text-emerald-400' },
    { title: 'Tổng số khách hàng', value: cumulativeStats?.cumulative_students?.toLocaleString() || 0, color: 'text-primary-400' },
    { title: 'Số lượng khóa học', value: cumulativeStats?.cumulative_courses_sold?.toLocaleString() || 0, color: 'text-purple-400' },
    { title: 'Đơn hàng thành công', value: cumulativeStats?.cumulative_success_orders?.toLocaleString() || 0, color: 'text-amber-400' },
  ];

  const monthlyCardList = [
    { title: `Doanh thu ${getCurrentMonthLabel()}`, value: formatPrice(monthlyStats?.monthly_revenue || 0), color: 'text-emerald-400' },
    { title: `Đơn hàng ${getCurrentMonthLabel()}`, value: monthlyStats?.monthly_orders?.toLocaleString() || 0, color: 'text-blue-400' },
    { title: `Khách hàng mới`, value: monthlyStats?.monthly_students?.toLocaleString() || 0, color: 'text-primary-400' },
    { title: `Khóa học đã bán`, value: monthlyStats?.monthly_courses_sold?.toLocaleString() || 0, color: 'text-purple-400' },
    { title: `Đơn hàng thành công`, value: monthlyStats?.monthly_success_orders?.toLocaleString() || 0, color: 'text-green-400' },
    { title: `Đơn hàng hủy`, value: monthlyStats?.monthly_cancelled_orders?.toLocaleString() || 0, color: 'text-red-450' },
  ];

  return (
      <div className="space-y-8">
        {/* Total Statistics */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Tổng quan hệ thống</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {cardList.map((stat, i) => (
              <div key={i} className="p-4 sm:p-6 rounded-2xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-400">{stat.title}</p>
                  <h3 className={`text-lg sm:text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Statistics */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Thống kê theo tháng</h2>
            <div className="flex items-center gap-3">
              <style dangerouslySetInnerHTML={{ __html: `
                #month-filter::-webkit-calendar-picker-indicator {
                  filter: invert(1);
                  cursor: pointer;
                }
              ` }} />
              <label htmlFor="month-filter" className="text-xs sm:text-sm text-gray-400">Chọn tháng:</label>
              <div className="relative flex items-center">
                <input
                  type="month"
                  id="month-filter"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="pl-4 pr-10 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer text-sm"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {monthlyCardList.map((stat, i) => (
              <div key={i} className="p-4 sm:p-6 rounded-2xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-400">{stat.title}</p>
                  <h3 className={`text-lg sm:text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}
