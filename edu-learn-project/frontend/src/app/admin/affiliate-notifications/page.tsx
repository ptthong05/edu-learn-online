'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/utils/api';

interface AffiliateCommissionStatistic {
  affiliate_id: string;
  ctv_code: string;
  full_name: string;
  phone: string;
  email: string;
  monthly_commission: number;
  total_commission: number;
}

type SortOption = 'monthly-desc' | 'monthly-asc' | 'total-desc' | 'total-asc';

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function formatVND(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value) || 0);
}

function formatMonth(month: string) {
  const [year, value] = month.split('-');
  return `tháng ${Number(value)}/${year}`;
}

export default function AdminAffiliateNotificationsPage() {
  const [statistics, setStatistics] = useState<AffiliateCommissionStatistic[]>([]);
  const [month, setMonth] = useState(getCurrentMonth);
  const [sort, setSort] = useState<SortOption>('total-desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    api.getAdminAffiliateCommissionStats(month)
      .then((data) => { if (active) setStatistics(data || []); })
      .catch((err: Error) => { if (active) setError(err.message || 'Không thể tải thống kê doanh thu CTV.'); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [month]);

  const sortedStatistics = useMemo(() => {
    const [field, direction] = sort.split('-') as ['monthly' | 'total', 'asc' | 'desc'];
    const key = field === 'monthly' ? 'monthly_commission' : 'total_commission';
    const multiplier = direction === 'asc' ? 1 : -1;
    return [...statistics].sort((a, b) => ((Number(a[key]) || 0) - (Number(b[key]) || 0)) * multiplier);
  }, [statistics, sort]);

  const monthlyTotal = statistics.reduce((sum, item) => sum + (Number(item.monthly_commission) || 0), 0);
  const allTimeTotal = statistics.reduce((sum, item) => sum + (Number(item.total_commission) || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Thống kê doanh thu CTV</h1>
        <p className="mt-1 text-sm text-gray-400">Mỗi CTV hiển thị một box, cộng dồn hoa hồng từ các đơn thành công theo tháng và toàn bộ lịch sử.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-800/50 bg-emerald-950/20 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Hoa hồng {formatMonth(month)}</p>
          <p className="mt-2 text-2xl font-extrabold text-white">{formatVND(monthlyTotal)}</p>
        </div>
        <div className="rounded-2xl border border-primary-800/50 bg-primary-950/20 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-primary-400">Tổng hoa hồng tích lũy</p>
          <p className="mt-2 text-2xl font-extrabold text-white">{formatVND(allTimeTotal)}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-gray-800 bg-gray-900/60 p-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <label htmlFor="commission-month" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Lọc hoa hồng theo tháng</label>
          <input id="commission-month" type="month" value={month} max={getCurrentMonth()} onChange={(event) => setMonth(event.target.value)} className="rounded-xl border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm text-white outline-none focus:border-primary-500" />
        </div>
        <div>
          <label htmlFor="commission-sort" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Sắp xếp</label>
          <select id="commission-sort" value={sort} onChange={(event) => setSort(event.target.value as SortOption)} className="rounded-xl border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm text-white outline-none focus:border-primary-500">
            <option value="total-desc">Tổng hoa hồng: cao đến thấp</option>
            <option value="total-asc">Tổng hoa hồng: thấp đến cao</option>
            <option value="monthly-desc">Hoa hồng tháng: cao đến thấp</option>
            <option value="monthly-asc">Hoa hồng tháng: thấp đến cao</option>
          </select>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-800/50 bg-red-900/20 px-5 py-3 text-sm text-red-400">{error}</div>}

      <div>
        {loading ? (
          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 py-16 text-center text-sm text-gray-500">Đang tải thống kê...</div>
        ) : sortedStatistics.length === 0 ? (
          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 py-16 text-center text-sm text-gray-500">Chưa có CTV đã được duyệt.</div>
        ) : (
          <div className="space-y-4">
            {sortedStatistics.map((item, index) => (
              <article key={item.affiliate_id} className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5 transition-colors hover:border-primary-700/60 hover:bg-gray-900">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-primary-500/15 px-2 text-sm font-bold text-primary-400">#{index + 1}</span>
                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-white">{item.full_name}</p>
                      <p className="mt-1 font-mono text-xs font-semibold text-primary-400">Mã CTV: {item.ctv_code || '—'}</p>
                      <div className="mt-3 flex flex-col gap-1 text-sm text-gray-400 sm:flex-row sm:gap-5">
                        <span>SĐT: {item.phone || '—'}</span>
                        <span className="truncate" title={item.email}>Email Affiliate: {item.email || '—'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid shrink-0 grid-cols-2 gap-3 lg:min-w-[420px]">
                    <div className="rounded-xl bg-emerald-950/30 p-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-500">Hoa hồng {formatMonth(month)}</p>
                      <p className="mt-1 text-base font-extrabold text-emerald-400">{formatVND(item.monthly_commission)}</p>
                    </div>
                    <div className="rounded-xl bg-primary-950/30 p-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-primary-400">Tổng hoa hồng</p>
                      <p className="mt-1 text-base font-extrabold text-primary-300">{formatVND(item.total_commission)}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
