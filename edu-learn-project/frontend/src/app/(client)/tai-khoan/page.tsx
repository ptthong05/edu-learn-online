'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/utils/api';
import Image from 'next/image';
import { Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react';
import { UserOrder } from '@/lib/data/userOrders';
import { formatPrice } from '@/lib/utils/helpers';
import toast from 'react-hot-toast';
import { coupons as mockCoupons } from '@/lib/data/mockData';
import { Coupon } from '@/types';

// Sidebar nav items
const NAV_ITEMS = [
  { id: 'overview', icon: '🏠', label: 'Tổng quan', href: '/tai-khoan' },
  { id: 'orders', icon: '📋', label: 'Đơn hàng', href: '/tai-khoan/don-hang' },
  { id: 'courses', icon: '📚', label: 'Khoá học', href: '/tai-khoan/khoa-hoc' },
  { id: 'affiliate', icon: '🔗', label: 'Chương trình tiếp thị liên kết', href: '/tai-khoan/affiliate' },
  { id: 'settings', icon: '⚙️', label: 'Cài đặt tài khoản', href: '/tai-khoan/cai-dat' },
];

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  qr_banking: 'QR ngân hàng',
  momo: 'Ví MoMo',
  vnpay: 'VNPay',
  banking: 'Chuyển khoản ngân hàng',
};

const PAGE_SIZE = 10;

// Base URL for affiliate referral links
const CLIENT_BASE_URL = process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000';

function Pagination({ page, totalItems, onPageChange, pageSize = PAGE_SIZE }: { page: number; totalItems: number; onPageChange: (page: number) => void; pageSize?: number }) {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-2 pt-6" aria-label="Phân trang">
      {page > 1 && (
        <button 
          onClick={() => onPageChange(page - 1)} 
          className="w-10 h-10 flex items-center justify-center text-sm font-bold border border-gray-200 rounded-xl bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200"
          aria-label="Trang trước"
        >
          ‹
        </button>
      )}
      {Array.from({ length: totalPages }, (_, index) => index + 1).map(pageNumber => (
        <button 
          key={pageNumber} 
          onClick={() => onPageChange(pageNumber)} 
          className={`w-10 h-10 flex items-center justify-center text-sm font-bold rounded-xl transition-all duration-200 ${
            page === pageNumber 
              ? 'bg-[#12c46e] text-white shadow-sm font-bold' 
              : 'border border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
          }`}
        >
          {pageNumber}
        </button>
      ))}
      {page < totalPages && (
        <button 
          onClick={() => onPageChange(page + 1)} 
          className="w-10 h-10 flex items-center justify-center text-sm font-bold border border-gray-200 rounded-xl bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200"
          aria-label="Trang sau"
        >
          ›
        </button>
      )}
    </nav>
  );
}

function PasswordField({ id, label, placeholder, visible, onToggle }: { id: string; label: string; placeholder: string; visible: boolean; onToggle: () => void }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-gray-700">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input id={id} type={visible ? 'text' : 'password'} placeholder={placeholder} required className="w-full border border-gray-300 px-3 py-2.5 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
        <button type="button" onClick={onToggle} aria-label={visible ? `Ẩn ${label.toLowerCase()}` : `Hiện ${label.toLowerCase()}`} className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-gray-400 hover:text-gray-700">
          {visible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}

function AccountPageContent() {
  const { user, logout, updateUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [userOrders, setUserOrders] = useState<UserOrder[]>([]);
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [ordersPage, setOrdersPage] = useState(1);
  const [coursesPage, setCoursesPage] = useState(1);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Affiliate state
  const [affiliateInfo, setAffiliateInfo] = useState<any>(null);
  const [fetchingAff, setFetchingAff] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawalMethod, setWithdrawalMethod] = useState<'bank_transfer' | null>(null);
  const [showReRegisterAlert, setShowReRegisterAlert] = useState(false);
  const [showReRegisterForm, setShowReRegisterForm] = useState(false);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [showWithdrawalHistory, setShowWithdrawalHistory] = useState(true);
  const [showReportView, setShowReportView] = useState(false);
  const [showCouponsView, setShowCouponsView] = useState(false);
  const [dbCoupons, setDbCoupons] = useState<Coupon[]>([]);
  const [affiliateCouponPage, setAffiliateCouponPage] = useState(1);
  const [showGuidesView, setShowGuidesView] = useState(false);
  const [guides, setGuides] = useState<any[]>([]);
  const [guidesLoading, setGuidesLoading] = useState(false);
  const [termsContent, setTermsContent] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [clickPage, setClickPage] = useState(1);
  const [revenuePage, setRevenuePage] = useState(1);
  const [detailPage, setDetailPage] = useState(1);
  const [recentWdPage, setRecentWdPage] = useState(1);
  const [wdFilterStartDate, setWdFilterStartDate] = useState('');
  const [wdFilterEndDate, setWdFilterEndDate] = useState('');
  const [appliedWdFilter, setAppliedWdFilter] = useState({ start: '', end: '' });
  const [detailStatusFilter, setDetailStatusFilter] = useState('all');
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    bank_name: '',
    bank_account: '',
    account_holder: '',
    phone: '',
    email: ''
  });
  
  // Payment proof upload state
  const [uploadingProofOrderId, setUploadingProofOrderId] = useState<string | null>(null);
  const [proofMessages, setProofMessages] = useState<Record<string, string>>({});

  const formatWithdrawalAmount = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits ? Number(digits).toLocaleString('vi-VN') : '';
  };
  const withdrawalAmount = Number(withdrawalForm.amount.replace(/\D/g, '')) || 0;
  const selectBankTransfer = () => {
    if (withdrawalMethod === 'bank_transfer') {
      setWithdrawalMethod(null);
    } else {
      setWithdrawalMethod('bank_transfer');
      setWithdrawalForm(current => ({ ...current,
        bank_name: affiliateInfo?.bank_name || '', bank_account: affiliateInfo?.bank_account || '',
        account_holder: affiliateInfo?.full_name || '', phone: affiliateInfo?.phone || '', email: affiliateInfo?.email || ''
      }));
    }
  };

  // Dynamic stats calculation
  const allRevenues = reportData?.revenues || [];
  const approvedRevenues = allRevenues.filter((r: any) => r.status === 'approved' || r.status === 'paid');
  const totalCommission = approvedRevenues.reduce((sum: number, r: any) => sum + r.commission_amount, 0);
  const totalWithdrawn = withdrawals.filter((w: any) => w.status === 'completed').reduce((sum: number, w: any) => sum + w.amount, 0);
  const totalPendingWithdrawn = withdrawals.filter((w: any) => w.status === 'pending').reduce((sum: number, w: any) => sum + w.amount, 0);
  const balance = Math.max(0, totalCommission - totalWithdrawn - totalPendingWithdrawn);
  const pendingCommission = allRevenues.filter((r: any) => r.status === 'pending').reduce((sum: number, r: any) => sum + r.commission_amount, 0);
  const totalRevenue = approvedRevenues.reduce((sum: number, r: any) => sum + (r.order_total || 0), 0);
  // Commission earned in the current calendar month (approved only) — resets to 0 next month
  const now = new Date();
  const thisMonthCommission = approvedRevenues
    .filter((r: any) => {
      const d = new Date(r.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum: number, r: any) => sum + r.commission_amount, 0);

  const totalClicks = reportData?.clicks?.length || 0;
  const convRate = totalClicks > 0 ? Math.round((approvedRevenues.length / totalClicks) * 100) : 0;
  
  const thisMonthClicks = (reportData?.clicks || []).filter((c: any) => {
    const d = new Date(c.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  
  const thisMonthConvs = approvedRevenues.filter((r: any) => {
    const d = new Date(r.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const recentRevenues = approvedRevenues.slice(0, 5);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/tai-khoan');
    }
  }, [user, authLoading, router]);



  // Mock user fallback for demo
  const displayUser = user || {
    full_name: 'Phạm Tấn Thông',
    email: 'phamtanthong77c1@gmail.com',
    phone: '0987654321',
    avatar: null,
  };

  const initials = displayUser.full_name
    ? displayUser.full_name.split(' ').map((n: string) => n[0]).slice(-2).join('').toUpperCase()
    : 'U';

  const handleLogout = () => {
    logout();
    window.location.href = '/courses';
  };

  const uploadPaymentProof = async (orderId: string, file?: File) => {
    if (!file || !orderId) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Vui lòng chọn tệp không quá 5MB.');
      return;
    }

    setUploadingProofOrderId(orderId);
    try {
      const base64Proof = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Không thể đọc tệp.'));
        reader.readAsDataURL(file);
      });

      await api.uploadPaymentProof(orderId, base64Proof);
      
      setProofMessages(prev => ({ ...prev, [orderId]: '✅ Tải lên bằng chứng thanh toán thành công!' }));
      toast.success('Tải lên bằng chứng thanh toán thành công!');
      
      // Reload orders to show updated proof
      await loadOrders();
    } catch (error: any) {
      setProofMessages(prev => ({ ...prev, [orderId]: '❌ Lỗi khi tải lên: ' + (error.message || 'Vui lòng thử lại') }));
      toast.error('Lỗi khi tải lên bằng chứng thanh toán');
    } finally {
      setUploadingProofOrderId(null);
    }
  };

  const loadOrders = async () => {
    if (!user) {
      setUserOrders([]);
      setMyCourses([]);
      return;
    }

    try {
      const [orders, courses] = await Promise.all([
        api.getMyOrders(),
        api.getMyCourses()
      ]);
      setUserOrders(orders.map((order: any) => ({
        id: order.id,
        userId: order.user_id,
        createdAt: order.created_at,
        paymentMethod: order.payment_method,
        total: order.total,
        status: order.status,
        paymentProof: order.payment_proof,
        items: (order.items || []).map((item: any) => ({
          id: item.course_id,
          title: item.title,
          image: item.image,
          price: item.price,
          type: 'course',
        })),
      })));
      const sortedCourses = (courses || []).sort((a: any, b: any) => {
        return new Date(b.orderDate || 0).getTime() - new Date(a.orderDate || 0).getTime();
      });
      setMyCourses(sortedCourses);
      setOrdersPage(1);
      setCoursesPage(1);
    } catch (error) {
      console.error('Không thể tải thông tin tài khoản:', error);
    }
  };

  const fetchAffiliateStatus = async () => {
    if (!user) return;
    try {
      const status = await api.getAffiliateStatus();
      if (status.registered) {
        setAffiliateInfo(status);
        if (status.status !== 'terminated') {
          setShowReRegisterAlert(false);
        }
      } else {
        setAffiliateInfo(null);
      }
    } catch (error) {
      console.error('Failed to fetch affiliate status:', error);
    } finally {
      setFetchingAff(false);
    }
  };

  const fetchWithdrawals = async () => {
    if (!user) return;
    try {
      const data = await api.getWithdrawals();
      setWithdrawals(data);
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
    }
  };

  const fetchReport = async (start?: string, end?: string) => {
    try {
      setReportLoading(true);
      const data = await api.getAffiliateReport(start, end);
      setReportData(data);
    } catch (error) {
      console.error('Failed to fetch report:', error);
      toast.error('Không thể tải báo cáo tiếp thị.');
    } finally {
      setReportLoading(false);
    }
  };

  const fetchGuides = async () => {
    setGuidesLoading(true);
    try {
      const res = await api.getAffiliateGuides();
      setGuides(res || []);
    } catch (err) {
      console.error('Lỗi tải tài liệu hướng dẫn:', err);
    } finally {
      setGuidesLoading(false);
    }
  };

  const fetchTerms = async () => {
    try {
      const res = await api.getAffiliateTerms();
      setTermsContent(res?.terms || '');
    } catch (err) {
      console.error('Lỗi tải điều khoản:', err);
    }
  };

  const fetchDbCoupons = async () => {
    try {
      const res = await api.getCoupons();
      setDbCoupons(res || []);
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    }
  };

  useEffect(() => {
    if (showReportView) {
      setFilterStartDate('');
      setFilterEndDate('');
      setClickPage(1);
      setRevenuePage(1);
      setDetailPage(1);
      fetchReport();
    }
  }, [showReportView]);

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!withdrawalForm.amount || !withdrawalForm.bank_name || !withdrawalForm.bank_account || 
        !withdrawalForm.account_holder || !withdrawalForm.phone || !withdrawalForm.email) {
      toast.error('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    if (withdrawalAmount < 50000) {
      toast.error('Số tiền rút tối thiểu là 50.000đ.');
      return;
    }

    if (withdrawalAmount > balance) {
      toast.error('Số dư khả dụng không đủ.');
      return;
    }

    try {
      await api.createWithdrawal({
        amount: withdrawalAmount,
        bank_name: withdrawalForm.bank_name,
        bank_account: withdrawalForm.bank_account,
        account_holder: withdrawalForm.account_holder,
        phone: withdrawalForm.phone,
        email: withdrawalForm.email
      });
      
      toast.success('Tạo yêu cầu rút tiền thành công!');
      setWithdrawalForm({
        amount: '',
        bank_name: '',
        bank_account: '',
        account_holder: '',
        phone: '',
        email: ''
      });
      setWithdrawalMethod(null);
      await fetchWithdrawals();
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  };

  useEffect(() => {
    if (activeTab === 'affiliate' && user) {
      setFetchingAff(true);
      fetchAffiliateStatus();
      fetchWithdrawals();
      fetchReport();
      fetchGuides();
      fetchTerms();
      fetchDbCoupons();
    }
  }, [activeTab, user]);

  useEffect(() => {
    setAffiliateCouponPage(1);
  }, [showCouponsView]);

  useEffect(() => {
    if (showWithdrawForm && affiliateInfo) {
      fetchWithdrawals();
    }
  }, [showWithdrawForm, affiliateInfo]);

  useEffect(() => {
    void loadOrders();
  }, [user]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && NAV_ITEMS.some(item => item.id === tab)) setActiveTab(tab);
  }, [searchParams]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl animate-spin inline-block mb-3 text-primary-600">⟳</div>
          <p className="text-sm font-semibold text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left Sidebar */}
          <aside className="lg:w-60 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              {/* User mini card */}
              <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                  {displayUser.avatar
                    ? <Image src={displayUser.avatar} alt="avatar" width={40} height={40} className="rounded-full" />
                    : initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{displayUser.full_name}</p>
                  <p className="text-[11px] text-gray-400 truncate">{displayUser.email}</p>
                </div>
              </div>

              {/* Nav items */}
              <nav className="p-3 space-y-1">
                {NAV_ITEMS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      router.push(`/tai-khoan?tab=${item.id}`);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                      activeTab === item.id
                        ? 'bg-primary-50 text-primary-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="leading-tight">{item.label}</span>
                  </button>
                ))}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all mt-2 border-t border-gray-100 pt-4"
                >
                  <span className="text-base">🚪</span>
                  <span>Đăng xuất</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-5">
                {/* Welcome Card */}
                <div className="bg-white rounded-2xl shadow-card p-6 flex items-center gap-5 border border-gray-100">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-black text-2xl flex-shrink-0">
                    {initials}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      Chào mừng trở lại, {displayUser.full_name}!
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                      Quản lý{' '}
                      <button onClick={() => { setActiveTab('settings'); router.push('/tai-khoan?tab=settings'); }} className="text-primary-600 hover:underline font-medium">
                        tài khoản
                      </button>
                      , xem đơn hàng và cập nhật tùy chọn từ bảng điều khiển cá nhân.
                    </p>
                  </div>
                </div>

                {/* Quick Action Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Đơn hàng card */}
                  <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">Xem đơn hàng</h3>
                    <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                      Theo dõi đơn hàng gần đây và lịch sử đơn hàng
                    </p>
                    <button
                      onClick={() => { setActiveTab('orders'); router.push('/tai-khoan?tab=orders'); }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Xem đơn hàng →
                    </button>
                  </div>

                  {/* Cài đặt card */}
                  <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-100">
                    <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">Cài đặt tài khoản</h3>
                    <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                      Chỉnh sửa hồ sơ và thông tin tài khoản của bạn.
                    </p>
                    <button
                      onClick={() => { setActiveTab('settings'); router.push('/tai-khoan?tab=settings'); }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white text-xs font-bold rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      Chỉnh sửa tài khoản →
                    </button>
                  </div>
                </div>

                {/* Khoá học card */}
                <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Khoá học của tôi</h3>
                    <button onClick={() => { setActiveTab('courses'); router.push('/tai-khoan?tab=courses'); }} className="text-xs text-primary-600 font-semibold hover:underline">
                      Xem tất cả →
                    </button>
                  </div>
                  {myCourses.length > 0 ? (
                    <div className="space-y-3">
                      {myCourses
                        .slice(0, 3)
                        .map((item, idx) => (
                          <div key={`ov-${item.id}-${idx}`} className="flex items-center gap-3">
                            {item.image && (
                              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                              <p className="text-xs text-green-600 font-medium">✓ Đã kích hoạt</p>
                            </div>
                          </div>
                        ))}
                      {myCourses.length > 3 && (
                        <p className="text-xs text-gray-400 pt-1">
                          +{myCourses.length - 3} khóa học khác
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-gray-400">
                      <div className="text-4xl mb-2">📚</div>
                      <p className="text-sm">Bạn chưa có khóa học nào.</p>
                      <Link href="/courses" className="mt-3 inline-block px-4 py-2 bg-primary-600 text-white text-xs font-bold rounded-xl hover:bg-primary-700 transition-colors">
                        Khám phá khóa học
                      </Link>
                    </div>
                  )}
                </div>

              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl shadow-card p-6 lg:p-8">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Đơn hàng của tôi</h2>
                    <p className="text-sm text-gray-500 mt-1">Theo dõi thanh toán và xác nhận sau khi đã chuyển khoản.</p>
                  </div>
                  <span className="text-sm font-semibold text-primary-600">{userOrders.length} đơn hàng</span>
                </div>

                {userOrders.length > 0 ? (
                  <div className="space-y-5">
                    {userOrders.slice((ordersPage - 1) * PAGE_SIZE, ordersPage * PAGE_SIZE).map(order => (
                      <article key={order.id} className="border border-gray-200 rounded-2xl overflow-hidden">
                        <div className="p-5 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Mã đơn hàng</p>
                            <p className="font-bold text-gray-900">{order.id}</p>
                            <p className="text-sm text-gray-500 mt-1">Ngày đặt hàng: {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                          </div>
                          <span className={`w-fit px-3 py-1 rounded-full text-xs font-bold ${order.status === 'completed' ? 'bg-green-100 text-green-700' : order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {order.status === 'completed' ? 'Đã hoàn thành' : order.status === 'cancelled' ? 'Đã hủy' : 'Chờ xử lý'}
                          </span>
                        </div>
                        <div className="p-5 space-y-4">
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Sản phẩm</p>
                            <div className="space-y-2">
                              {order.items.map(item => (
                                <div key={`${order.id}-${item.id}`} className="flex justify-between gap-4 text-sm">
                                  <span className="font-medium text-gray-800">{item.title}</span>
                                  <span className="font-semibold text-primary-600 whitespace-nowrap">{formatPrice(item.price)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="pt-4 border-t border-gray-100 grid sm:grid-cols-2 gap-3 text-sm">
                            <p className="text-gray-500">Phương thức thanh toán: <span className="font-semibold text-gray-800">{PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}</span></p>
                            <p className="text-gray-500 sm:text-right">Số tiền: <span className="font-bold text-primary-600">{formatPrice(order.total)}</span></p>
                          </div>
                          
                          {/* Payment Proof Section */}
                          {(order.status === 'pending' || order.status === 'completed') && (
                            <div className="pt-4 border-t border-gray-100">
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Bằng chứng thanh toán</p>
                              
                              {order.paymentProof ? (
                                <div className="flex flex-wrap items-center gap-3">
                                  {order.paymentProof.startsWith('data:image') && (
                                    <img src={order.paymentProof} alt="Bằng chứng thanh toán" className="w-24 h-16 object-cover rounded-lg border border-gray-200" />
                                  )}
                                  <a href={order.paymentProof} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary-600 hover:underline">
                                    Xem bằng chứng đã tải lên
                                  </a>
                                  <label className="text-sm text-gray-500 cursor-pointer hover:text-primary-600">
                                    Thay tệp
                                    <input 
                                      type="file" 
                                      accept="image/*,.pdf" 
                                      className="hidden" 
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) uploadPaymentProof(order.id, file);
                                      }} 
                                    />
                                  </label>
                                </div>
                              ) : (
                                <label className="inline-flex items-center gap-2 px-4 py-2.5 border border-dashed border-primary-300 rounded-xl text-sm font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 cursor-pointer transition-colors">
                                  {uploadingProofOrderId === order.id ? 'Đang tải lên...' : 'Tải lên bằng chứng thanh toán'}
                                  <input 
                                    type="file" 
                                    accept="image/*,.pdf" 
                                    className="hidden" 
                                    disabled={uploadingProofOrderId === order.id}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) uploadPaymentProof(order.id, file);
                                    }} 
                                  />
                                </label>
                              )}
                              
                              {proofMessages[order.id] && (
                                <p className={`text-sm mt-2 ${proofMessages[order.id].startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>
                                  {proofMessages[order.id]}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </article>
                    ))}
                    <Pagination page={ordersPage} totalItems={userOrders.length} onPageChange={setOrdersPage} />
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-5xl mb-3">📋</div>
                    <p className="text-sm">Bạn chưa có đơn hàng nào.</p>
                    <Link href="/courses" className="mt-4 inline-block px-5 py-2.5 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 transition-colors">Khám phá khóa học</Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'courses' && (
              <div className="bg-white rounded-2xl shadow-card p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Khóa học đã mua</h2>
                  {myCourses.length > 0 && (
                    <span className="text-sm font-semibold text-primary-600">
                      {myCourses.length} khóa học
                    </span>
                  )}
                </div>
                {myCourses.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {myCourses
                      .slice((coursesPage - 1) * PAGE_SIZE, coursesPage * PAGE_SIZE)
                      .map((item, index) => (
                      <div key={`${item.id}-${index}`} className="border border-green-200 bg-green-50/30 rounded-2xl p-5 transition-all hover:shadow-md hover:border-green-300">
                        <div className="flex flex-col sm:flex-row gap-4">
                          {/* Thumbnail */}
                          {item.image && (
                            <div className="relative w-full sm:w-32 h-24 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                          )}
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-base font-bold text-gray-900 leading-snug">{item.title}</p>
                                <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                  <span className="text-sm font-semibold text-primary-600">{formatPrice(item.price || 0)}</span>
                                  {item.orderId && (
                                    <>
                                      <span className="text-xs text-gray-400">•</span>
                                      <span className="text-xs text-gray-500">Đơn: <span className="font-mono font-semibold">{item.orderId}</span></span>
                                    </>
                                  )}
                                </div>
                                {item.orderDate && (
                                  <p className="text-xs text-gray-400 mt-1">{new Date(item.orderDate).toLocaleString('vi-VN')}</p>
                                )}
                              </div>
                              <span className="w-fit flex-shrink-0 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">✓ Đã kích hoạt</span>
                            </div>
                            <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-200 text-xs leading-relaxed">
                              <span className="font-bold text-red-700">⚠️ Hướng dẫn vào học: </span>
                              <span className="font-bold text-red-600">Kiểm tra email đã đăng ký, mở thư hướng dẫn và dùng liên kết Google Drive để bắt đầu học.</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Pagination page={coursesPage} totalItems={myCourses.length} onPageChange={setCoursesPage} />
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-5xl mb-3">📚</div>
                    <p className="text-sm">Khóa học sẽ xuất hiện ở đây sau khi bạn hoàn thành đơn hàng.</p>
                    <Link href="/courses" className="mt-4 inline-block px-5 py-2.5 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 transition-colors">Khám phá khóa học</Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'affiliate' && (
              <div className="bg-white rounded-2xl shadow-card p-6 lg:p-8 animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Chương trình Tiếp thị liên kết (Affiliate)</h2>
                <p className="text-base text-gray-500 mb-6">Đồng hành cùng DRIVE MH chia sẻ khóa học hữu ích và nhận hoa hồng hấp dẫn lên tới 30%.</p>

                {fetchingAff ? (
                  <div className="py-12 text-center text-gray-400 animate-pulse">
                    <div className="text-4xl animate-spin inline-block mb-3">⟳</div>
                    <p className="text-sm">Đang tải thông tin...</p>
                  </div>
                ) : !affiliateInfo ? (
                  /* Chưa đăng ký - Hiển thị form đăng ký */
                  <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-6 border border-primary-100">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center text-white text-2xl flex-shrink-0">
                        💰
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Chương trình Tiếp thị liên kết</h3>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                          Đồng hành cùng DRIVE MH chia sẻ khóa học hữu ích và nhận hoa hồng hấp dẫn lên tới 30%.
                        </p>
                        <button 
                          onClick={() => {
                            const formContainer = document.createElement('div');
                            if (!formContainer) return;
                            formContainer.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
                            formContainer.innerHTML = `
                              <div class="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                                <h3 class="text-lg font-bold text-gray-900 mb-4">Đăng ký Affiliate</h3>
                                <form id="affiliateForm" class="space-y-4">
                                  <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                    <input type="text" name="full_name" value="${displayUser.full_name || ''}" class="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm" required />
                                  </div>
                                  <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input type="email" name="email" value="${displayUser.email || ''}" class="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm" required />
                                  </div>
                                  <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                    <input type="tel" name="phone" value="${displayUser.phone || ''}" placeholder="0987654321" class="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm" required />
                                  </div>
                                  <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                                    <input type="date" name="dob" class="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm" required />
                                  </div>
                                  <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Ngân hàng</label>
                                    <input type="text" name="bank_name" placeholder="Vietcombank" class="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm" required />
                                  </div>
                                  <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Số tài khoản</label>
                                    <input type="text" name="bank_account" class="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm" required />
                                  </div>
                                  <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                                    <input type="text" name="address" class="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm" required />
                                  </div>
                                  <div class="flex items-start gap-2 pt-1 text-xs">
                                    <input type="checkbox" id="agreeTermsCheckbox" class="mt-0.5 flex-shrink-0" required />
                                    <label for="agreeTermsCheckbox" class="text-gray-600 select-none leading-relaxed">
                                      Tôi đồng ý với các <button type="button" id="openTermsModalBtn" class="font-bold text-blue-600 hover:underline inline">điều khoản và dịch vụ</button> của chương trình affiliate
                                    </label>
                                  </div>
                                  <div class="flex gap-2 pt-2">
                                    <button type="submit" class="flex-1 px-4 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700">
                                      Đăng ký
                                    </button>
                                    <button type="button" id="closeModal" class="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                                      Hủy
                                    </button>
                                  </div>
                                </form>
                              </div>
                            `;
                            document.body.appendChild(formContainer);
                            
                            const closeBtn = formContainer.querySelector('#closeModal');
                            if (closeBtn) {
                              closeBtn.addEventListener('click', () => {
                                document.body.removeChild(formContainer);
                              });
                            }

                            const openTermsBtn = formContainer.querySelector('#openTermsModalBtn');
                            if (openTermsBtn) {
                              openTermsBtn.addEventListener('click', () => {
                                const termsModal = document.createElement('div');
                                termsModal.className = 'fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4';
                                termsModal.innerHTML = `
                                  <div class="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl relative text-left">
                                    <div class="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                                      <h3 class="text-lg font-bold text-gray-900">Điều khoản & Dịch vụ</h3>
                                      <button type="button" id="closeTermsModal" class="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    </div>
                                    <div class="text-sm text-gray-700 leading-relaxed text-justify ql-editor prose max-w-none">
                                      ${termsContent || '<h3>Chính sách chương trình Tiếp thị liên kết</h3><p>Đang tải nội dung điều khoản...</p>'}
                                    </div>
                                    <div class="mt-6 text-right">
                                      <button type="button" id="agreeTermsModalBtn" class="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
                                        Đồng ý & Đóng
                                      </button>
                                    </div>
                                  </div>
                                `;
                                document.body.appendChild(termsModal);

                                const closeTerms = () => {
                                  document.body.removeChild(termsModal);
                                };

                                termsModal.querySelector('#closeTermsModal')?.addEventListener('click', closeTerms);
                                termsModal.querySelector('#agreeTermsModalBtn')?.addEventListener('click', () => {
                                  const check = formContainer.querySelector('#agreeTermsCheckbox') as HTMLInputElement;
                                  if (check) check.checked = true;
                                  closeTerms();
                                });
                              });
                            }
                            
                              const formEl = formContainer.querySelector('#affiliateForm');
                              if (formEl) {
                                formEl.addEventListener('submit', async (e: Event) => {
                                  e.preventDefault();
                                  const formData = new FormData(formEl as HTMLFormElement);
                                  const data = {
                                    full_name: formData.get('full_name'),
                                    email: formData.get('email'),
                                    phone: formData.get('phone'),
                                    dob: formData.get('dob'),
                                    bank_name: formData.get('bank_name'),
                                    bank_account: formData.get('bank_account'),
                                    address: formData.get('address')
                                  };
                                  
                                  try {
                                    await api.registerAffiliate(data);
                                    toast.success('Đăng ký thành công!', {
                                      position: 'top-right',
                                      style: {
                                        border: '1px solid #10B981',
                                        padding: '16px',
                                        color: '#065F46',
                                        background: '#ECFDF5',
                                        fontWeight: 'bold'
                                      },
                                      iconTheme: {
                                        primary: '#10B981',
                                        secondary: '#FFFFFF'
                                      }
                                    });
                                    document.body.removeChild(formContainer);
                                    fetchAffiliateStatus();
                                  } catch (error: any) {
                                    toast.error(error.message || 'Có lỗi xảy ra', {
                                      position: 'top-right'
                                    });
                                  }
                                });
                              }
                            }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-brand text-white font-bold text-sm rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                          >
                            Đăng ký ngay
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : affiliateInfo.status === 'pending' ? (
                  /* Trạng thái chờ xét duyệt */
                  <div className="border border-yellow-200 bg-yellow-50/50 rounded-2xl p-6 lg:p-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-white text-2xl flex-shrink-0">⏳</div>
                      <div>
                        <h3 className="text-xl font-bold text-yellow-800">Chờ xét duyệt</h3>
                        <p className="text-base text-yellow-700">Yêu cầu đăng ký làm affiliate của bạn đã được tiếp nhận và đang được Admin xét duyệt.</p>
                      </div>
                    </div>
                    
                    <div className="border-t border-yellow-200 pt-6">
                      <h4 className="font-bold text-gray-900 mb-4 text-base">Thông tin đăng ký của bạn:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-base text-gray-800">
                        <div><span className="font-semibold text-gray-500 block mb-0.5">Họ và tên:</span> {affiliateInfo.full_name}</div>
                        <div><span className="font-semibold text-gray-500 block mb-0.5">Email liên hệ:</span> {affiliateInfo.email}</div>
                        <div><span className="font-semibold text-gray-500 block mb-0.5">Số điện thoại:</span> {affiliateInfo.phone}</div>
                        <div><span className="font-semibold text-gray-500 block mb-0.5">Ngày sinh:</span> {affiliateInfo.dob}</div>
                        <div><span className="font-semibold text-gray-500 block mb-0.5">Ngân hàng:</span> {affiliateInfo.bank_name}</div>
                        <div><span className="font-semibold text-gray-500 block mb-0.5">Số tài khoản:</span> {affiliateInfo.bank_account}</div>
                        <div className="sm:col-span-2"><span className="font-semibold text-gray-500 block mb-0.5">Địa chỉ:</span> {affiliateInfo.address}</div>
                      </div>
                    </div>
                  </div>
                ) : affiliateInfo.status === 'approved' ? (
                  showReportView ? (
                    /* Giao diện Báo cáo Tiếp thị liên kết */
                    <div className="space-y-6 animate-fade-in">
                      {/* Bộ lọc báo cáo */}
                      <div className="bg-white rounded-xl p-5 border border-gray-200 space-y-5">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Bộ Lọc Báo Cáo
                          </h3>
                          <button 
                            onClick={() => setShowReportView(false)} 
                            className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-bold transition-all duration-200"
                          >
                            ← Quay lại
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">📅 Ngày bắt đầu</label>
                            <input 
                              type="date" 
                              value={filterStartDate} 
                              onChange={(e) => setFilterStartDate(e.target.value)} 
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-950 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white" 
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">📅 Ngày kết thúc</label>
                            <input 
                              type="date" 
                              value={filterEndDate} 
                              onChange={(e) => setFilterEndDate(e.target.value)} 
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-950 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white" 
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setClickPage(1);
                                setRevenuePage(1);
                                setDetailPage(1);
                                fetchReport(filterStartDate, filterEndDate);
                              }} 
                              className="flex-1 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              🔍 Lọc
                            </button>
                            <button 
                              onClick={() => {
                                setFilterStartDate('');
                                setFilterEndDate('');
                                setClickPage(1);
                                setRevenuePage(1);
                                setDetailPage(1);
                                fetchReport();
                              }} 
                              className="px-3 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-sm rounded-lg transition-all"
                            >
                              🔄 Đặt lại
                            </button>
                          </div>

                        </div>
                      </div>

                      {reportLoading ? (
                        <div className="py-12 text-center text-gray-400 animate-pulse">
                          <div className="text-4xl animate-spin inline-block mb-3">⟳</div>
                          <p className="text-xs font-medium">Đang tải dữ liệu báo cáo...</p>
                        </div>
                      ) : (
                        <>
                          {/* Filtered Transaction Cards List (Paginated Grid) */}
                          <div className="space-y-3">
                            {(() => {
                              const filteredRevenues = (reportData?.revenues || []).filter((rev: any) => {
                                // Status filter
                                const isSuccess = rev.status === 'approved' || rev.status === 'paid';
                                if (detailStatusFilter === 'approved' && !isSuccess) return false;
                                if (detailStatusFilter === 'pending' && rev.status !== 'pending') return false;
                                if (detailStatusFilter === 'cancelled' && rev.status !== 'cancelled') return false;
                                return true;
                              });

                              if (filteredRevenues.length === 0) {
                                return (
                                  <div className="space-y-3">
                                    <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between border-b border-gray-100 pb-3">
                                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Chi Tiết Giao Dịch Báo Cáo</h4>
                                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                        <select 
                                          value={detailStatusFilter}
                                          onChange={(e) => {
                                            setDetailStatusFilter(e.target.value);
                                            setDetailPage(1);
                                          }}
                                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-950 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                                        >
                                          <option value="all">Tất cả trạng thái</option>
                                          <option value="approved">Đã xác thực</option>
                                          <option value="pending">Chờ xác duyệt</option>
                                          <option value="cancelled">Đã hủy</option>
                                        </select>
                                      </div>
                                    </div>
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center text-gray-400 text-sm">
                                      Không tìm thấy giao dịch hoa hồng nào khớp với bộ lọc.
                                    </div>
                                  </div>
                                );
                              }

                              const paginatedRevenues = filteredRevenues.slice((detailPage - 1) * 5, detailPage * 5);

                              return (
                                <div className="space-y-3">
                                  <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between border-b border-gray-100 pb-3">
                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Chi Tiết Giao Dịch Báo Cáo</h4>
                                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                      <select 
                                        value={detailStatusFilter}
                                        onChange={(e) => {
                                          setDetailStatusFilter(e.target.value);
                                          setDetailPage(1);
                                        }}
                                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-950 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                                      >
                                        <option value="all">Tất cả trạng thái</option>
                                        <option value="approved">Đã xác thực</option>
                                        <option value="pending">Chờ xác duyệt</option>
                                        <option value="cancelled">Đã hủy</option>
                                      </select>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-3">
                                    {paginatedRevenues.map((rev: any) => {
                                      const ctvCode = affiliateInfo.ma_ctv || affiliateInfo.ctv_code || affiliateInfo.id || 'CTV001';
                                      const isSuccess = rev.status === 'approved' || rev.status === 'paid';
                                      return (
                                        <div key={rev.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm space-y-2.5">
                                          <div className="flex items-start justify-between border-b border-gray-200 pb-2">
                                            <div>
                                              <span className="font-mono text-gray-500 font-medium">Đơn: #{rev.order_id}</span>
                                              <h5 className="font-semibold text-gray-900 mt-0.5">{rev.course_title || rev.course_id}</h5>
                                              <p className="text-xs text-primary-600 font-mono font-bold mt-0.5">CTV: {ctvCode}</p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${
                                              isSuccess ? 'bg-green-100 text-green-700' :
                                              rev.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                              'bg-yellow-100 text-yellow-700'
                                            }`}>
                                              {isSuccess ? 'Đã xác thực' : rev.status === 'cancelled' ? 'Đã hủy' : 'Chờ xác duyệt'}
                                            </span>
                                          </div>
                                          
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
                                            <div className="flex justify-between sm:justify-start">
                                              <span className="text-gray-400">Tiền khóa học:</span>
                                              <span className="font-semibold text-gray-800 ml-1.5">{rev.order_total.toLocaleString('vi-VN')}đ</span>
                                            </div>
                                            <div className="flex justify-between sm:justify-end">
                                              <span className="text-gray-400">Hoa hồng ({rev.commission_rate}%):</span>
                                              <span className="font-bold text-amber-600 ml-1.5">+{rev.commission_amount.toLocaleString('vi-VN')}đ</span>
                                            </div>
                                          </div>

                                          <div className="text-sm text-gray-600 font-semibold text-right pt-2 border-t border-dashed border-gray-200">
                                            Đặt lúc: {new Date(rev.created_at).toLocaleString('vi-VN')}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  
                                  <Pagination page={detailPage} totalItems={filteredRevenues.length} onPageChange={setDetailPage} pageSize={5} />
                                </div>
                              );
                            })()}
                          </div>

                          {/* 4 Performance Cards */}
                          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Tổng Quan Hiệu Suất</h4>
                              <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-100">
                                {filterStartDate && filterEndDate 
                                  ? `${new Date(filterStartDate).toLocaleDateString('vi-VN')} - ${new Date(filterEndDate).toLocaleDateString('vi-VN')}` 
                                  : 'Toàn bộ thời gian'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                              {/* Card 1: Tổng số nhấp chuột */}
                              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg">🖱️</div>
                                <div>
                                  <p className="text-xs text-gray-500 font-semibold leading-none">Tổng nhấp chuột</p>
                                  <p className="text-xl font-bold text-gray-900 mt-1">{reportData?.stats?.totalClicks || 0}</p>
                                </div>
                              </div>
                              
                              {/* Card 2: Tổng đơn hàng */}
                              <div className="bg-green-50/50 border border-green-100 rounded-xl p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-lg">📦</div>
                                <div>
                                  <p className="text-xs text-gray-500 font-semibold leading-none">Tổng đơn hàng</p>
                                  <p className="text-xl font-bold text-gray-900 mt-1">{reportData?.stats?.totalOrders || 0}</p>
                                </div>
                              </div>
                              
                              {/* Card 3: Tổng hoa hồng */}
                              <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-lg">💰</div>
                                <div>
                                  <p className="text-xs text-gray-500 font-semibold leading-none">Tổng hoa hồng</p>
                                  <p className="text-xl font-bold text-gray-950 mt-1">{(reportData?.stats?.totalCommission || 0).toLocaleString('vi-VN')}đ</p>
                                </div>
                              </div>
                              
                              {/* Card 4: Tổng doanh thu */}
                              <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-lg">💸</div>
                                <div>
                                  <p className="text-xs text-gray-500 font-semibold leading-none">Tổng doanh thu</p>
                                  <p className="text-xl font-bold text-gray-950 mt-1">{(reportData?.stats?.totalRevenue || 0).toLocaleString('vi-VN')}đ</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Click History Block */}
                          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Lịch Sử Nhấp Chuột</h4>
                            {(!reportData?.clicks || reportData.clicks.length === 0) ? (
                              <div className="text-center py-6 text-gray-400 text-sm">Chưa có lịch sử nhấp chuột nào.</div>
                            ) : (
                              <>
                                <div className="space-y-2">
                                  {reportData.clicks.slice((clickPage - 1) * 5, clickPage * 5).map((clk: any) => (
                                    <div key={clk.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between text-sm border border-gray-100">
                                      <div className="truncate max-w-[70%]">
                                        <span className="font-semibold text-gray-500 block mb-0.5">Đường dẫn:</span>
                                        <span className="font-mono text-gray-700">{clk.url || '/'}</span>
                                      </div>
                                      <div className="text-right text-sm text-gray-700 font-semibold">
                                        {new Date(clk.created_at).toLocaleString('vi-VN')}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                <Pagination page={clickPage} totalItems={reportData.clicks.length} onPageChange={setClickPage} pageSize={5} />
                              </>
                            )}
                          </div>

                          {/* Commission History Block */}
                          <div id="lich-su-hoa-hong" className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                            {(() => {
                              const filteredHistoryRevenues = (reportData?.revenues || [])
                                .filter((rev: any) => rev.status === 'approved' || rev.status === 'paid');

                              if (filteredHistoryRevenues.length === 0) {
                                return (
                                  <div className="space-y-3">
                                    <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between border-b border-gray-100 pb-3">
                                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Lịch Sử Hoa Hồng</h4>
                                    </div>
                                    <div className="text-center py-6 text-gray-400 text-sm">Chưa có lịch sử hoa hồng nào.</div>
                                  </div>
                                );
                              }

                              const paginatedHistoryRevenues = filteredHistoryRevenues.slice((revenuePage - 1) * 5, revenuePage * 5);

                              return (
                                <div className="space-y-3">
                                  <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between border-b border-gray-100 pb-3">
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Lịch Sử Hoa Hồng</h4>
                                  </div>
                                  
                                  <div className="space-y-3">
                                    {paginatedHistoryRevenues.map((rev: any) => {
                                      const ctvCode = affiliateInfo.ma_ctv || affiliateInfo.ctv_code || affiliateInfo.id || 'CTV001';
                                      return (
                                        <div key={rev.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm space-y-2.5">
                                          <div className="flex items-start justify-between border-b border-gray-200 pb-2">
                                            <div>
                                              <span className="font-mono text-gray-500 font-medium">Đơn: #{rev.order_id}</span>
                                              <h5 className="font-semibold text-gray-900 mt-0.5">{rev.course_title || rev.course_id}</h5>
                                              <p className="text-xs text-primary-600 font-mono font-bold mt-0.5">CTV: {ctvCode}</p>
                                            </div>
                                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 flex-shrink-0">
                                              Đã xác thực
                                            </span>
                                          </div>
                                          
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
                                            <div className="flex justify-between sm:justify-start">
                                              <span className="text-gray-400">Tiền khóa học:</span>
                                              <span className="font-semibold text-gray-800 ml-1.5">{rev.order_total.toLocaleString('vi-VN')}đ</span>
                                            </div>
                                            <div className="flex justify-between sm:justify-end">
                                              <span className="text-gray-400">Hoa hồng ({rev.commission_rate}%):</span>
                                              <span className="font-bold text-amber-600 ml-1.5">+{rev.commission_amount.toLocaleString('vi-VN')}đ</span>
                                            </div>
                                          </div>

                                          <div className="text-sm text-gray-600 font-semibold text-right pt-2 border-t border-dashed border-gray-200">
                                            Đặt lúc: {new Date(rev.created_at).toLocaleString('vi-VN')}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  
                                  <Pagination page={revenuePage} totalItems={filteredHistoryRevenues.length} onPageChange={setRevenuePage} pageSize={5} />
                                </div>
                              );
                            })()}
                          </div>
                        </>
                      )}
                    </div>
                  ) : showCouponsView ? (
                    /* Giao diện Phiếu giảm giá tiếp thị liên kết */
                    (() => {
                      const affiliateCouponsLimit = 10;
                      const filteredAffiliateCoupons = dbCoupons.filter(c => c.usable_by === 'affiliate' && c.status === 'active');
                      const paginatedAffCoupons = filteredAffiliateCoupons.slice((affiliateCouponPage - 1) * affiliateCouponsLimit, affiliateCouponPage * affiliateCouponsLimit);
                      return (
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 animate-fade-in max-w-3xl mx-auto">
                          {/* Tiêu đề */}
                          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => setShowCouponsView(false)} 
                                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-bold transition-all duration-200"
                              >
                                ← Quay lại
                              </button>
                              <h3 className="text-lg font-bold text-gray-900">Mã giảm giá tiếp thị liên kết</h3>
                            </div>
                            <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-0.5 rounded">
                              {filteredAffiliateCoupons.length}
                            </span>
                          </div>

                          {/* Info banner */}
                          <div className="flex items-center gap-2.5 p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-600">
                            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Xem phiếu giảm giá đối tác để chia sẻ với khách hàng của bạn.</span>
                          </div>

                          {/* Danh sách hoặc Trạng thái trống */}
                          {filteredAffiliateCoupons.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center text-center">
                              {/* Crossed-out ticket icon */}
                              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100 relative">
                                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-12 h-0.5 bg-gray-400 rotate-45 transform origin-center"></div>
                                </div>
                              </div>
                              <h4 className="text-lg font-bold text-gray-800">Không Có Phiếu Giảm Giá</h4>
                              <p className="text-sm text-gray-500 mt-1">Bạn chưa tạo phiếu giảm giá nào.</p>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {paginatedAffCoupons.map((coupon: any) => {
                                  const isPercent = coupon.discount_type === 'percent';
                                  return (
                                    <div key={coupon.id} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex h-36 bg-gray-50/10">
                                      {/* Left graphic badge */}
                                      <div className="w-24 bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex flex-col items-center justify-center relative p-3 border-r border-dashed border-gray-200">
                                        <span className="text-xl font-bold">🎟️</span>
                                        <span className="text-[10px] uppercase font-semibold tracking-wider mt-1">GIẢM</span>
                                        <span className="text-sm font-black">
                                          {isPercent ? `${coupon.discount}%` : `${coupon.discount / 1000}K`}
                                        </span>
                                        <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border border-gray-200" />
                                        <div className="absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border border-gray-200" />
                                      </div>
                                      {/* Right coupon details */}
                                      <div className="flex-1 p-4 flex flex-col justify-between min-w-0 bg-white">
                                        <div>
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full border border-purple-100">
                                              MÃ: {coupon.code}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-semibold">
                                              HSD: {new Date(coupon.expired_date).toLocaleDateString('vi-VN')}
                                            </span>
                                          </div>
                                          <h4 className="font-bold text-gray-900 text-sm mb-1 truncate">
                                            Voucher giảm {isPercent ? `${coupon.discount}%` : `${coupon.discount.toLocaleString()} đ`}
                                          </h4>
                                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed" title={coupon.description}>
                                            {coupon.description || 'Mã giảm giá đặc biệt dành riêng cho CTV giới thiệu.'}
                                          </p>
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-1">
                                          <span className="text-[10px] text-gray-400">
                                            Đã dùng: {coupon.used_count} lượt
                                          </span>
                                          <button 
                                            onClick={() => {
                                              navigator.clipboard.writeText(coupon.code);
                                              toast.success('Đã sao chép mã giảm giá thành công!');
                                            }}
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
                                          >
                                            Sao chép mã
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Pagination */}
                              {filteredAffiliateCoupons.length > affiliateCouponsLimit && (
                                <div className="pt-4 border-t border-gray-100 flex justify-center">
                                  <Pagination 
                                    page={affiliateCouponPage} 
                                    totalItems={filteredAffiliateCoupons.length} 
                                    onPageChange={setAffiliateCouponPage} 
                                    pageSize={affiliateCouponsLimit} 
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()
                  ) : showGuidesView ? (
                    /* Giao diện Tài liệu hướng dẫn tiếp thị liên kết */
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 animate-fade-in max-w-3xl mx-auto">
                      {/* Tiêu đề */}
                      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => setShowGuidesView(false)} 
                            className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-bold transition-all duration-200"
                          >
                            ← Quay lại
                          </button>
                          <h3 className="text-lg font-bold text-gray-900">Tài liệu hướng dẫn tiếp thị</h3>
                        </div>
                        <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-0.5 rounded">
                          {guides.length}
                        </span>
                      </div>

                      {/* Info banner */}
                      <div className="flex items-center gap-2.5 p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-600">
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>Xem tài liệu hướng dẫn đối tác để tối ưu hóa hiệu quả tiếp thị của bạn.</span>
                      </div>

                      {/* List or Empty State */}
                      {guidesLoading ? (
                        <div className="py-20 text-center text-gray-400">Đang tải tài liệu...</div>
                      ) : guides.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-bold text-gray-800">Không Có Tài Liệu</h4>
                          <p className="text-sm text-gray-500 mt-1">Chưa có tài liệu hướng dẫn nào được cập nhật.</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {guides.map((guide) => (
                            <div key={guide.id} className="border border-gray-200 rounded-2xl p-6 bg-gray-50/5 hover:border-gray-300 transition-all">
                              <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center justify-center gap-2 text-center">
                                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                  {guide.display_order}
                                </span>
                                {guide.title}
                              </h4>
                              <div 
                                className="text-sm text-gray-800 leading-relaxed text-justify bg-white p-5 rounded-xl border border-gray-100 shadow-sm ql-editor"
                                dangerouslySetInnerHTML={{ __html: guide.content }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Giao diện cũ - Đối tác đã duyệt */
                    <div className="space-y-6">
                    <div className="border border-green-200 bg-green-50/50 rounded-2xl p-6 lg:p-8 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white text-2xl flex-shrink-0">🎉</div>
                        <div>
                          <h3 className="text-xl font-bold text-green-800">Xét duyệt thành công</h3>
                          <p className="text-base text-green-700 font-medium">Chúc mừng bạn đã trở thành đối tác Affiliate chính thức của DRIVE MH!</p>
                        </div>
                      </div>
                    </div>

                    {/* 4 Box thống kê */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                      {/* Box 1: Hoa hồng tháng này */}
                      <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-5 text-white min-w-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-9 h-9 rounded-full bg-white/20 flex-shrink-0 flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className="text-2xl font-bold mb-1 truncate" title={thisMonthCommission.toLocaleString('vi-VN') + 'đ'}>{thisMonthCommission.toLocaleString('vi-VN')}đ</div>
                        <div className="text-sm text-white/90 font-medium">Hoa hồng tháng này</div>
                        <div className="text-xs text-white/70 mt-1">Tháng {now.getMonth() + 1}/{now.getFullYear()}</div>
                      </div>

                      {/* Box 2: Tổng doanh thu */}
                      <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl p-5 text-white min-w-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-9 h-9 rounded-full bg-white/20 flex-shrink-0 flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className="text-2xl font-bold mb-1 truncate" title={totalRevenue.toLocaleString('vi-VN') + 'đ'}>{totalRevenue.toLocaleString('vi-VN')}đ</div>
                        <div className="text-sm text-white/90 font-medium">Tổng doanh thu</div>
                      </div>

                      {/* Box 3: Số dư khả dụng */}
                      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-5 text-white min-w-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-9 h-9 rounded-full bg-white/20 flex-shrink-0 flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                            </svg>
                          </div>
                        </div>
                        <div className="text-2xl font-bold mb-1 truncate" title={balance.toLocaleString('vi-VN') + 'đ'}>{balance.toLocaleString('vi-VN')}đ</div>
                        <div className="text-sm text-white/90 font-medium">Số dư khả dụng</div>
                        <div className="text-xs text-white/70 mt-1">Bằng Tổng hoa hồng tích lũy trừ Tổng đã rút</div>
                      </div>

                      {/* Box 4: Tổng đã rút */}
                      <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-xl p-5 text-white min-w-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-9 h-9 rounded-full bg-white/20 flex-shrink-0 flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2v-2" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4a2 2 0 012-2h10a2 2 0 012 2v4z" />
                            </svg>
                          </div>
                        </div>
                        <div className="text-2xl font-bold mb-1 truncate" title={totalWithdrawn.toLocaleString('vi-VN') + 'đ'}>{totalWithdrawn.toLocaleString('vi-VN')}đ</div>
                        <div className="text-sm text-white/90 font-medium">Tổng đã rút</div>
                        <div className="text-xs text-white/70 mt-1">Đã thanh toán thành công</div>
                      </div>

                    </div>

                    {/* Box Rút tiền */}
                    {!showWithdrawForm ? (
                      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-base font-bold text-gray-900">Rút tiền</h4>
                              <p className="text-sm text-gray-500">Kiểm hoa hồng được phê duyệt để thực hiện lần rút tiền đầu tiên.</p>
                            </div>
                          </div>
                          <button onClick={() => setShowWithdrawForm(true)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                            Xem Rút Tiền
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-xl border border-gray-200">
                        {/* Form rút tiền */}
                        <div className="p-6 space-y-6">
                          <div className="flex items-center justify-between">
                            <h4 className="text-base font-bold text-gray-900">Yêu cầu rút tiền</h4>
                            <button onClick={() => setShowWithdrawForm(false)} className="text-gray-400 hover:text-gray-600">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          {/* Số dư khả dụng */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Số dư khả dụng</label>
                            <input readOnly value={`${balance.toLocaleString('vi-VN')}đ`} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-base text-gray-900" />
                          </div>

                          {/* Nhập số tiền */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Nhập số tiền</label>
                            <input 
                              type="text"
                              inputMode="numeric"
                              placeholder="50.000"
                              value={formatWithdrawalAmount(withdrawalForm.amount)}
                              onChange={(e) => setWithdrawalForm({...withdrawalForm, amount: e.target.value.replace(/\D/g, '')})}
                              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-primary-500" 
                            />
                            <p className="text-xs text-gray-500 mt-1">Số tiền rút tối thiểu là 50.000đ</p>
                          </div>

                          {/* Chọn phương thức thanh toán */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Chọn phương thức thanh toán</label>
                            <button type="button" onClick={selectBankTransfer} className={`w-full text-left border rounded-lg p-4 transition-colors ${withdrawalMethod === 'bank_transfer' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white hover:border-primary-300'}`}>
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 flex-shrink-0">
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <h5 className="text-base font-bold text-gray-900">Chuyển khoản ngân hàng</h5>
                                  <p className="text-sm text-gray-500 mt-0.5">Chuyển khoản trực tiếp vào tài khoản của bạn</p>
                                </div>
                              </div>
                            </button>
                          </div>

                          {/* Thông tin chuyển khoản hiển thị khi chọn chuyển khoản ngân hàng */}
                          {withdrawalMethod === 'bank_transfer' && (
                            <div className="space-y-6 pt-4 border-t border-gray-100 transition-all duration-300 ease-in-out">
                              {/* Tên ngân hàng */}
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tên ngân hàng</label>
                                <input 
                                  type="text" 
                                  placeholder="Vietcombank" 
                                  value={withdrawalForm.bank_name}
                                  onChange={(e) => setWithdrawalForm({...withdrawalForm, bank_name: e.target.value})}
                                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" 
                                />
                              </div>

                              {/* Số tài khoản */}
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Số tài khoản</label>
                                <input 
                                  type="text" 
                                  placeholder="Nhập số tài khoản" 
                                  value={withdrawalForm.bank_account}
                                  onChange={(e) => setWithdrawalForm({...withdrawalForm, bank_account: e.target.value})}
                                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" 
                                />
                              </div>

                              {/* Tên chủ tài khoản */}
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tên chủ tài khoản</label>
                                <input 
                                  type="text" 
                                  placeholder="Nguyễn Văn A" 
                                  value={withdrawalForm.account_holder}
                                  readOnly
                                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-base text-gray-700" 
                                />
                              </div>

                              {/* Số điện thoại */}
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                                <input 
                                  type="tel" 
                                  placeholder="0987654321" 
                                  value={withdrawalForm.phone}
                                  readOnly
                                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-base text-gray-700" 
                                />
                              </div>

                              {/* Email */}
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                <input 
                                  type="email" 
                                  placeholder="email@example.com" 
                                  value={withdrawalForm.email}
                                  readOnly
                                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-base text-gray-700" 
                                />
                              </div>
                            </div>
                          )}

                          {/* Nút gửi */}
                          <button onClick={handleWithdrawalSubmit} disabled={!withdrawalMethod} className="w-full py-3 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 text-base disabled:cursor-not-allowed disabled:opacity-50">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            Gửi yêu cầu rút tiền
                          </button>
                        </div>

                        {/* Lịch sử rút tiền */}
                        <div className="border-t border-gray-200">
                          <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <h4 className="text-base font-bold text-gray-900">Lịch sử rút tiền</h4>
                            </div>
                            <button 
                              onClick={() => setShowWithdrawalHistory(!showWithdrawalHistory)}
                              className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                              aria-label={showWithdrawalHistory ? "Ẩn lịch sử rút tiền" : "Hiển thị lịch sử rút tiền"}
                            >
                              {showWithdrawalHistory ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                          </div>
                          
                          {showWithdrawalHistory && (
                            <div className="p-5">
                            {withdrawals.length === 0 ? (
                              <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <h5 className="text-base font-bold text-gray-900 mb-2">Chưa Có Lần Rút Tiền Nào</h5>
                                <p className="text-sm text-gray-500">Không tìm thấy lệnh rút tiền nào.</p>
                              </div>
                            ) : (
                              <div className="space-y-6">
                                {/* Nhóm 1: Yêu cầu rút tiền chờ xử lý */}
                                {withdrawals.filter(w => w.status === 'pending').length > 0 && (
                                  <div className="space-y-3">
                                    <h5 className="text-sm font-bold text-yellow-600 uppercase tracking-wider">Yêu cầu rút tiền chờ xử lý</h5>
                                    <div className="space-y-3">
                                      {withdrawals.filter(w => w.status === 'pending').map((withdrawal) => {
                                        const ctvCode = withdrawal.ctv_code || affiliateInfo.ma_ctv || affiliateInfo.ctv_code || 'CTV001';
                                        return (
                                          <div key={withdrawal.id} className="border border-yellow-200 bg-yellow-50/20 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-dashed border-gray-100">
                                              <div>
                                                <div className="text-xl font-bold text-gray-900">{withdrawal.amount.toLocaleString('vi-VN')}đ</div>
                                                <div className="text-xs text-gray-400 mt-0.5">Mã yêu cầu: {withdrawal.id}</div>
                                              </div>
                                              <span className="px-3 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-700">
                                                Chờ xử lý
                                              </span>
                                            </div>
                                            <div className="text-sm text-gray-700 space-y-1.5 font-medium">
                                              <div><span className="text-gray-400 font-semibold">Mã CTV:</span> {ctvCode}</div>
                                              <div><span className="text-gray-400 font-semibold">Họ tên:</span> {withdrawal.account_holder}</div>
                                              <div><span className="text-gray-400 font-semibold">Số điện thoại:</span> {withdrawal.phone || affiliateInfo.phone}</div>
                                              <div><span className="text-gray-400 font-semibold">Email:</span> {withdrawal.email || affiliateInfo.email}</div>
                                              <div><span className="text-gray-400 font-semibold">Ngân hàng:</span> {withdrawal.bank_name}</div>
                                              <div><span className="text-gray-400 font-semibold">Số tài khoản:</span> {withdrawal.bank_account}</div>
                                              <div><span className="text-gray-400 font-semibold">Ngày tạo:</span> {new Date(withdrawal.created_at).toLocaleString('vi-VN')}</div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Nhóm 2: Yêu cầu đã hoàn thành */}
                                <div className="space-y-3">
                                  <h5 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Yêu cầu đã hoàn thành</h5>
                                  {withdrawals.filter(w => w.status !== 'pending').length === 0 ? (
                                    <p className="text-sm text-gray-400 italic">Chưa có yêu cầu rút tiền hoàn thành nào.</p>
                                  ) : (
                                    <div className="space-y-3">
                                      {withdrawals.filter(w => w.status !== 'pending').map((withdrawal) => {
                                        const ctvCode = withdrawal.ctv_code || affiliateInfo.ma_ctv || affiliateInfo.ctv_code || 'CTV001';
                                        return (
                                          <div key={withdrawal.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-dashed border-gray-100">
                                              <div>
                                                <div className="text-xl font-bold text-gray-900">{withdrawal.amount.toLocaleString('vi-VN')}đ</div>
                                                <div className="text-xs text-gray-400 mt-0.5">Mã yêu cầu: {withdrawal.id}</div>
                                              </div>
                                              <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                                withdrawal.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                              }`}>
                                                {withdrawal.status === 'completed' ? 'Đã thanh toán' : 'Bị từ chối'}
                                              </span>
                                            </div>
                                            <div className="text-sm text-gray-700 space-y-1.5 font-medium">
                                              <div><span className="text-gray-400 font-semibold">Mã CTV:</span> {ctvCode}</div>
                                              <div><span className="text-gray-400 font-semibold">Họ tên:</span> {withdrawal.account_holder}</div>
                                              <div><span className="text-gray-400 font-semibold">Số điện thoại:</span> {withdrawal.phone || affiliateInfo.phone}</div>
                                              <div><span className="text-gray-400 font-semibold">Email:</span> {withdrawal.email || affiliateInfo.email}</div>
                                              <div><span className="text-gray-400 font-semibold">Ngân hàng:</span> {withdrawal.bank_name}</div>
                                              <div><span className="text-gray-400 font-semibold">Số tài khoản:</span> {withdrawal.bank_account}</div>
                                              <div><span className="text-gray-400 font-semibold">Ngày thanh toán:</span> {new Date(withdrawal.updated_at || withdrawal.created_at).toLocaleString('vi-VN')}</div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          )}
                        </div>
                      </div>
                    )}

                        {/* Box Liên kết tiếp thị và Mã tiếp thị */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-base font-bold text-gray-900">Liên kết tiếp thị của bạn</h4>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setShowReportView(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-800 text-white text-xs font-bold rounded transition-colors shadow-sm"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <span>Báo cáo</span>
                              </button>
                              <button 
                                onClick={() => setShowGuidesView(true)} 
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded transition-colors shadow-sm"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <span>Tài liệu hướng dẫn</span>
                              </button>
                              <button 
                                onClick={() => setShowCouponsView(true)} 
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded transition-colors shadow-sm"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                </svg>
                                <span>Phiếu giảm giá</span>
                              </button>
                            </div>
                          </div>
                          
                          {
                            (() => {
                              const ctvCodeVal = affiliateInfo.ma_ctv || affiliateInfo.ctv_code || affiliateInfo.id || 'CTV001';
                              const affiliateLinkVal = `${CLIENT_BASE_URL}/?ref=${ctvCodeVal}`;

                              return (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {/* Cột trái: 2 input */}
                                  <div className="space-y-3">
                                    <div>
                                      <p className="text-sm text-gray-700 mb-1.5">Chia sẻ liên kết này để kiếm hoa hồng từ các đơn hàng được giới thiệu:</p>
                                      <div className="flex gap-2">
                                        <input readOnly value={affiliateLinkVal} className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none" />
                                        <button 
                                          onClick={() => {
                                            navigator.clipboard.writeText(affiliateLinkVal);
                                            toast.success('Đã sao chép liên kết tiếp thị thành công!');
                                          }} 
                                          className="px-4 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                          Sao chép
                                        </button>
                                      </div>
                                    </div>
                                    
                                    {/* Mã tiếp thị */}
                                    <div>
                                      <h4 className="text-base font-bold text-gray-900 mb-1.5">Mã tiếp thị của bạn</h4>
                                      <div className="flex gap-2">
                                        <input readOnly value={ctvCodeVal} className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none" />
                                        <button 
                                          onClick={() => {
                                            navigator.clipboard.writeText(ctvCodeVal);
                                            toast.success('Đã sao chép mã tiếp thị thành công!');
                                          }} 
                                          className="px-4 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                          Sao chép
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Cột phải: QR Code căn giữa */}
                                  <div className="flex flex-col items-center justify-center border-l border-gray-100 pl-6">
                                    <div className="p-3 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
                                      <QRCodeSVG value={affiliateLinkVal} size={88} level="H" includeMargin={false} />
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2 font-medium">Quét để chia sẻ liên kết</p>
                                  </div>
                                </div>
                              );
                            })()
                          }
                        </div>
                        {/* Box Thống kê chi tiết */}
                        <div className="bg-white rounded-xl p-5 border border-gray-200">
                          <h4 className="text-base font-bold text-gray-900 mb-4">Thống kê</h4>
                          <div className="space-y-3 text-base">
                            <div className="flex justify-between">
                              <span className="text-gray-600 font-medium">Tổng số nhấp chuột:</span>
                              <span className="font-bold text-gray-900">{totalClicks}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 font-medium">Tổng số đơn hàng:</span>
                              <span className="font-bold text-gray-900">{approvedRevenues.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 font-medium">Số nhấp chuột tháng này:</span>
                              <span className="font-bold text-gray-900">{thisMonthClicks}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 font-medium">Tổng đơn hàng tháng này:</span>
                              <span className="font-bold text-gray-900">{thisMonthConvs}</span>
                            </div>
                          </div>
                        </div>

                        {/* Box Hoa hồng gần đây */}
                        <div className="bg-white rounded-xl border border-gray-200">
                          <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <h4 className="text-base font-bold text-gray-900">Hoa hồng gần đây</h4>
                            </div>
                            <button 
                              onClick={() => {
                                setShowReportView(true);
                                setTimeout(() => {
                                  const el = document.getElementById('lich-su-hoa-hong');
                                  if (el) {
                                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  }
                                }, 100);
                              }} 
                              className="px-3.5 py-1.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Xem tất cả
                            </button>
                          </div>
                          
                          <div className="p-5 space-y-3">
                            {recentRevenues.length === 0 ? (
                              <div className="py-6 text-center text-gray-400 text-sm">Chưa có hoa hồng nào được ghi nhận.</div>
                            ) : (
                              recentRevenues.map((rev: any) => {
                                const ctvCode = affiliateInfo?.ma_ctv || affiliateInfo?.ctv_code || affiliateInfo?.id || 'CTV001';
                                const isSuccess = rev.status === 'approved' || rev.status === 'paid';
                                return (
                                  <div key={rev.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm space-y-2.5">
                                    <div className="flex items-start justify-between border-b border-gray-200 pb-2">
                                      <div>
                                        <span className="font-mono text-gray-500 font-medium">Đơn: #{rev.order_id}</span>
                                        <h5 className="font-semibold text-gray-900 mt-0.5">{rev.course_title || rev.course_id}</h5>
                                        <p className="text-xs text-primary-600 font-mono font-bold mt-0.5">CTV: {ctvCode}</p>
                                      </div>
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${
                                        isSuccess ? 'bg-green-100 text-green-700' :
                                        rev.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                      }`}>
                                        {isSuccess ? 'Đã xác thực' : rev.status === 'cancelled' ? 'Đã hủy' : 'Chờ xác duyệt'}
                                      </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
                                      <div className="flex justify-between sm:justify-start">
                                        <span className="text-gray-400">Tiền khóa học:</span>
                                        <span className="font-semibold text-gray-800 ml-1.5">{rev.order_total.toLocaleString('vi-VN')}đ</span>
                                      </div>
                                      <div className="flex justify-between sm:justify-end">
                                        <span className="text-gray-400">Hoa hồng ({rev.commission_rate}%):</span>
                                        <span className="font-bold text-amber-600 ml-1.5">+{rev.commission_amount.toLocaleString('vi-VN')}đ</span>
                                      </div>
                                    </div>

                                    <div className="text-sm text-gray-600 font-semibold text-right pt-2 border-t border-dashed border-gray-200">
                                      Đặt lúc: {new Date(rev.created_at).toLocaleString('vi-VN')}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                        {/* Box Rút tiền gần đây */}
                        <div className="bg-white rounded-xl border border-gray-200">
                          <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                              <h4 className="text-base font-bold text-gray-900">Rút tiền gần đây</h4>
                            </div>
                          </div>

                          {/* Bộ lọc */}
                          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">📅 Ngày bắt đầu</label>
                              <input 
                                type="date" 
                                value={wdFilterStartDate} 
                                onChange={(e) => setWdFilterStartDate(e.target.value)} 
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-950 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white" 
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">📅 Ngày kết thúc</label>
                              <input 
                                type="date" 
                                value={wdFilterEndDate} 
                                onChange={(e) => setWdFilterEndDate(e.target.value)} 
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-950 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white" 
                              />
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  setRecentWdPage(1);
                                  setAppliedWdFilter({ start: wdFilterStartDate, end: wdFilterEndDate });
                                }} 
                                className="flex-1 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm"
                              >
                                🔍 Lọc
                              </button>
                              <button 
                                onClick={() => {
                                  setWdFilterStartDate('');
                                  setWdFilterEndDate('');
                                  setRecentWdPage(1);
                                  setAppliedWdFilter({ start: '', end: '' });
                                }} 
                                className="px-3 py-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-sm rounded-lg transition-all"
                              >
                                🔄 Đặt lại
                              </button>
                            </div>
                          </div>
                          
                          <div className="p-5">
                            {(() => {
                              const filteredWds = withdrawals.filter(w => {
                                if (w.status !== 'completed') return false;
                                
                                const dateStr = (w.created_at || w.updated_at || '').split('T')[0];
                                if (!dateStr) return true;
                                
                                if (appliedWdFilter.start && dateStr < appliedWdFilter.start) return false;
                                if (appliedWdFilter.end && dateStr > appliedWdFilter.end) return false;
                                return true;
                              });

                              if (filteredWds.length === 0) {
                                return (
                                  <div className="py-8 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                      </svg>
                                    </div>
                                    <h5 className="text-base font-bold text-gray-900 mb-2">Không tìm thấy lệnh rút tiền nào.</h5>
                                    <p className="text-sm text-gray-500">Kiểm hoa hồng được phê duyệt để thực hiện lần rút tiền đầu tiên.</p>
                                  </div>
                                );
                              }

                              const paginatedWds = filteredWds.slice((recentWdPage - 1) * 10, recentWdPage * 10);

                              return (
                                <div className="space-y-4">
                                  <div className="space-y-3">
                                    {paginatedWds.map((withdrawal) => {
                                      const ctvCode = withdrawal.ctv_code || affiliateInfo.ma_ctv || affiliateInfo.ctv_code || 'CTV001';
                                      return (
                                        <div key={withdrawal.id} className="border border-gray-200 rounded-lg p-4">
                                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-dashed border-gray-100">
                                            <div>
                                              <div className="text-xl font-bold text-gray-900">{withdrawal.amount.toLocaleString('vi-VN')}đ</div>
                                              <div className="text-xs text-gray-400 mt-0.5">Mã yêu cầu: {withdrawal.id}</div>
                                            </div>
                                            <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700">
                                              Đã thanh toán
                                            </span>
                                          </div>
                                          <div className="text-sm text-gray-700 space-y-1.5 font-medium">
                                            <div><span className="text-gray-400 font-semibold">Mã CTV:</span> {ctvCode}</div>
                                            <div><span className="text-gray-400 font-semibold">Họ tên:</span> {withdrawal.account_holder}</div>
                                            <div><span className="text-gray-400 font-semibold">Số điện thoại:</span> {withdrawal.phone || affiliateInfo.phone}</div>
                                            <div><span className="text-gray-400 font-semibold">Email:</span> {withdrawal.email || affiliateInfo.email}</div>
                                            <div><span className="text-gray-400 font-semibold">Ngân hàng:</span> {withdrawal.bank_name}</div>
                                            <div><span className="text-gray-400 font-semibold">Số tài khoản:</span> {withdrawal.bank_account}</div>
                                            <div><span className="text-gray-400 font-semibold">Ngày thanh toán:</span> {new Date(withdrawal.updated_at || withdrawal.created_at).toLocaleString('vi-VN')}</div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <Pagination 
                                    page={recentWdPage} 
                                    totalItems={filteredWds.length} 
                                    onPageChange={setRecentWdPage} 
                                    pageSize={10} 
                                  />
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                )
                ) : affiliateInfo.status === 'terminated' ? (
                  /* Ngừng cộng tác */
                  <div className="border border-red-200 bg-red-50/50 rounded-2xl p-6 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xl mx-auto">🚫</div>
                    <h3 className="text-xl font-bold text-red-800">Ngừng cộng tác</h3>
                    <p className="text-base text-red-600">Tài khoản của bạn đã bị ngừng cộng tác do vi phạm chính sách.</p>
                    {showReRegisterAlert ? (
                      <div className="mt-4 p-4 border border-red-300 bg-red-50 rounded-xl text-red-700 text-base font-semibold max-w-md mx-auto">
                        ⚠️ Hãy nhắn tin với admin qua tin nhắn để đăng ký lại
                      </div>
                    ) : (
                      <button 
                        onClick={() => setShowReRegisterAlert(true)} 
                        className="px-5 py-2.5 bg-red-600 text-white font-bold text-base rounded-xl hover:bg-red-700 transition-all hover:scale-105 duration-200"
                      >
                        Đăng ký lại
                      </button>
                    )}
                  </div>
                ) : affiliateInfo.status === 'rejected' ? (
                  /* Trạng thái bị từ chối - Hiển thị form đăng ký lại */
                  showReRegisterForm ? (
                    /* Form đăng ký lại */
                    <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-6 border border-primary-100">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center text-white text-2xl flex-shrink-0">
                          💰
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">Đăng ký lại Affiliate</h3>
                          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                            Vui lòng điền thông tin đăng ký lại của bạn. Yêu cầu sẽ được admin xét duyệt lại.
                          </p>
                          <button 
                            onClick={() => {
                              const formContainer = document.createElement('div');
                              if (!formContainer) return;
                              formContainer.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
                              formContainer.innerHTML = `
                                <div class="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                                  <h3 class="text-lg font-bold text-gray-900 mb-4">Đăng ký Affiliate</h3>
                                  <form id="affiliateForm" class="space-y-4">
                                    <div>
                                      <label class="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                      <input type="text" name="full_name" value="${displayUser.full_name || ''}" class="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm" required />
                                    </div>
                                    <div>
                                      <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                      <input type="email" name="email" value="${displayUser.email || ''}" class="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm" required />
                                    </div>
                                    <div>
                                      <label class="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                      <input type="tel" name="phone" value="${displayUser.phone || ''}" placeholder="0987654321" class="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm" required />
                                    </div>
                                    <div>
                                      <label class="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                                      <input type="date" name="dob" class="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm" required />
                                    </div>
                                    <div>
                                      <label class="block text-sm font-medium text-gray-700 mb-1">Ngân hàng</label>
                                      <input type="text" name="bank_name" placeholder="Vietcombank" class="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm" required />
                                    </div>
                                    <div>
                                      <label class="block text-sm font-medium text-gray-700 mb-1">Số tài khoản</label>
                                      <input type="text" name="bank_account" class="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm" required />
                                    </div>
                                    <div>
                                      <label class="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                                      <input type="text" name="address" class="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm" required />
                                    </div>
                                    <div class="flex items-start gap-2 pt-1 text-xs">
                                      <input type="checkbox" id="agreeTermsCheckbox" class="mt-0.5 flex-shrink-0" required />
                                      <label for="agreeTermsCheckbox" class="text-gray-600 select-none leading-relaxed">
                                        Tôi đồng ý với các <button type="button" id="openTermsModalBtn" class="font-bold text-blue-600 hover:underline inline">điều khoản và dịch vụ</button> của chương trình affiliate
                                      </label>
                                    </div>
                                    <div class="flex gap-2 pt-2">
                                      <button type="submit" class="flex-1 px-4 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700">
                                        Đăng ký
                                      </button>
                                      <button type="button" id="closeModal" class="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                                        Hủy
                                      </button>
                                    </div>
                                  </form>
                                </div>
                              `;
                              document.body.appendChild(formContainer);
                              
                              const closeBtn = formContainer.querySelector('#closeModal');
                              if (closeBtn) {
                                closeBtn.addEventListener('click', () => {
                                  document.body.removeChild(formContainer);
                                });
                              }

                              const openTermsBtn = formContainer.querySelector('#openTermsModalBtn');
                              if (openTermsBtn) {
                                openTermsBtn.addEventListener('click', () => {
                                  const termsModal = document.createElement('div');
                                  termsModal.className = 'fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4';
                                  termsModal.innerHTML = `
                                    <div class="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl relative text-left">
                                      <div class="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                                        <h3 class="text-lg font-bold text-gray-900">Điều khoản & Dịch vụ</h3>
                                        <button type="button" id="closeTermsModal" class="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                                          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                        </button>
                                      </div>
                                      <div class="text-sm text-gray-700 leading-relaxed text-justify ql-editor prose max-w-none">
                                        ${termsContent || '<h3>Chính sách chương trình Tiếp thị liên kết</h3><p>Đang tải nội dung điều khoản...</p>'}
                                      </div>
                                      <div class="mt-6 text-right">
                                        <button type="button" id="agreeTermsModalBtn" class="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
                                          Đồng ý & Đóng
                                        </button>
                                      </div>
                                    </div>
                                  `;
                                  document.body.appendChild(termsModal);

                                  const closeTerms = () => {
                                    document.body.removeChild(termsModal);
                                  };

                                  termsModal.querySelector('#closeTermsModal')?.addEventListener('click', closeTerms);
                                  termsModal.querySelector('#agreeTermsModalBtn')?.addEventListener('click', () => {
                                    const check = formContainer.querySelector('#agreeTermsCheckbox') as HTMLInputElement;
                                    if (check) check.checked = true;
                                    closeTerms();
                                  });
                                });
                              }
                              
                              const formEl = formContainer.querySelector('#affiliateForm');
                              if (formEl) {
                                formEl.addEventListener('submit', async (e: Event) => {
                                  e.preventDefault();
                                  const formData = new FormData(formEl as HTMLFormElement);
                                  const data = {
                                    full_name: formData.get('full_name'),
                                    email: formData.get('email'),
                                    phone: formData.get('phone'),
                                    dob: formData.get('dob'),
                                    bank_name: formData.get('bank_name'),
                                    bank_account: formData.get('bank_account'),
                                    address: formData.get('address')
                                  };
                                  
                                  try {
                                    await api.registerAffiliate(data);
                                    toast.success('Đăng ký lại thành công!', {
                                      position: 'top-right',
                                      style: {
                                        border: '1px solid #10B981',
                                        padding: '16px',
                                        color: '#065F46',
                                        background: '#ECFDF5',
                                        fontWeight: 'bold'
                                      },
                                      iconTheme: {
                                        primary: '#10B981',
                                        secondary: '#FFFFFF'
                                      }
                                    });
                                    document.body.removeChild(formContainer);
                                    setShowReRegisterForm(false);
                                    fetchAffiliateStatus();
                                  } catch (error: any) {
                                    toast.error(error.message || 'Có lỗi xảy ra', {
                                      position: 'top-right'
                                    });
                                  }
                                });
                              }
                            }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-brand text-white font-bold text-sm rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                          >
                            Đăng ký lại ngay
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Hiển thị thông báo từ chối và nút đăng ký lại */
                    <div className="border border-red-200 bg-red-50/50 rounded-2xl p-6 lg:p-8 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xl flex-shrink-0">❌</div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-red-800 mb-2">Yêu cầu đăng ký bị từ chối</h3>
                          <p className="text-base text-red-600 leading-relaxed">
                            Rất tiếc, yêu cầu tham gia chương trình Affiliate của bạn chưa đáp ứng đủ điều kiện của hệ thống.
                          </p>
                        </div>
                      </div>
                      
                      {/* Nút đăng ký lại */}
                      <div className="pt-4 border-t border-red-200">
                        <button 
                          onClick={() => setShowReRegisterForm(true)}
                          className="px-6 py-3 bg-red-600 text-white font-bold text-base rounded-xl hover:bg-red-700 transition-all hover:scale-105 duration-200 shadow-sm hover:shadow-md"
                        >
                          🔄 Đăng ký lại
                        </button>
                        <p className="text-xs text-gray-500 mt-3">
                          Nhấn nút bên trên để đăng ký lại và chờ admin xét duyệt.
                        </p>
                      </div>
                    </div>
                  )
                ) : (
                  /* Trạng thái khác */
                  <div className="border border-red-200 bg-red-50/50 rounded-2xl p-6 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xl mx-auto">❌</div>
                    <h3 className="text-xl font-bold text-red-800">Yêu cầu bị từ chối</h3>
                    <p className="text-base text-red-600">Rất tiếc, yêu cầu tham gia Affiliate của bạn chưa đáp ứng đủ điều kiện của hệ thống.</p>
                    <button onClick={() => { setAffiliateInfo(null); fetchAffiliateStatus(); }} className="px-5 py-2.5 bg-red-600 text-white font-bold text-base rounded-xl hover:bg-red-700 transition-all">
                      Đăng ký lại
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="max-w-3xl space-y-4">
                <section className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
                  <header className="flex items-center gap-3 border-b border-gray-200 bg-gray-50 px-5 py-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <UserRound size={16} aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-sm font-bold text-gray-900">Thông tin hồ sơ</h2>
                      <p className="mt-0.5 text-xs text-gray-500">Cập nhật thông tin cá nhân và địa chỉ email.</p>
                    </div>
                  </header>
                  <form className="space-y-4 p-5" onSubmit={async (event) => {
                    event.preventDefault();
                    const fullNameInput = document.getElementById('full-name') as HTMLInputElement;
                    const phoneInput = document.getElementById('phone') as HTMLInputElement;
                    
                    if (!fullNameInput?.value.trim()) {
                      toast.error('Họ và tên không được để trống.', { position: 'top-right' });
                      return;
                    }

                    try {
                      const res = await api.updateProfile({
                        full_name: fullNameInput.value,
                        phone: phoneInput ? phoneInput.value : ''
                      });
                      updateUser(res.user);
                      toast.success('Cập nhật thông tin thành công!', {
                        position: 'top-right',
                        style: {
                          border: '1px solid #10B981',
                          padding: '16px',
                          color: '#065F46',
                          background: '#ECFDF5',
                          fontWeight: 'bold'
                        },
                        iconTheme: {
                          primary: '#10B981',
                          secondary: '#FFFFFF'
                        }
                      });
                    } catch (error: any) {
                      toast.error(error.message || 'Lỗi khi cập nhật thông tin', { position: 'top-right' });
                    }
                  }}>
                    <div>
                      <label htmlFor="full-name" className="mb-1.5 block text-xs font-medium text-gray-700">Họ và tên</label>
                      <input id="full-name" defaultValue={displayUser.full_name} className="w-full border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-gray-700">Email</label>
                      <input id="email" defaultValue={displayUser.email} readOnly className="w-full cursor-not-allowed border border-gray-300 bg-gray-100 px-3 py-2.5 text-sm text-gray-700" />
                    </div>
                    <div>
                      <label htmlFor="phone" className="mb-1.5 block text-xs font-medium text-gray-700">Điện thoại</label>
                      <input id="phone" type="tel" defaultValue={displayUser.phone || ''} className="w-full border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
                    </div>
                    <button type="submit" className="bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-700">
                      Cập nhật
                    </button>
                  </form>
                </section>

                <section className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
                  <header className="flex items-center gap-3 border-b border-gray-200 bg-gray-50 px-5 py-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                      <LockKeyhole size={16} aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-sm font-bold text-gray-900">Thay đổi mật khẩu</h2>
                      <p className="mt-0.5 text-xs text-gray-500">Đảm bảo tài khoản của bạn sử dụng mật khẩu dài, ngẫu nhiên để giữ an toàn.</p>
                    </div>
                  </header>
                  <form className="space-y-4 p-5" onSubmit={async (event) => {
                    event.preventDefault();
                    const newPasswordInput = document.getElementById('new-password') as HTMLInputElement;
                    const confirmPasswordInput = document.getElementById('confirm-password') as HTMLInputElement;

                    const newPassword = newPasswordInput?.value;
                    const confirmPassword = confirmPasswordInput?.value;

                    if (!newPassword || newPassword.length < 6) {
                      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự.', { position: 'top-right' });
                      return;
                    }

                    if (newPassword !== confirmPassword) {
                      toast.error('Mật khẩu xác nhận không khớp.', { position: 'top-right' });
                      return;
                    }

                    try {
                      await api.changePassword(newPassword);
                      toast.success('Thay đổi mật khẩu thành công!', {
                        position: 'top-right',
                        style: {
                          border: '1px solid #10B981',
                          padding: '16px',
                          color: '#065F46',
                          background: '#ECFDF5',
                          fontWeight: 'bold'
                        },
                        iconTheme: {
                          primary: '#10B981',
                          secondary: '#FFFFFF'
                        }
                      });
                      newPasswordInput.value = '';
                      confirmPasswordInput.value = '';
                      const currentPasswordInput = document.getElementById('current-password') as HTMLInputElement;
                      if (currentPasswordInput) currentPasswordInput.value = '';
                    } catch (error: any) {
                      toast.error(error.message || 'Lỗi khi đổi mật khẩu', { position: 'top-right' });
                    }
                  }}>
                    <PasswordField id="current-password" label="Mật khẩu hiện tại" placeholder="Mật khẩu hiện tại" visible={showCurrentPassword} onToggle={() => setShowCurrentPassword(visible => !visible)} />
                    <PasswordField id="new-password" label="Mật khẩu" placeholder="Mật khẩu mới" visible={showNewPassword} onToggle={() => setShowNewPassword(visible => !visible)} />
                    <PasswordField id="confirm-password" label="Xác nhận mật khẩu" placeholder="Confirm password" visible={showConfirmPassword} onToggle={() => setShowConfirmPassword(visible => !visible)} />
                    <button type="submit" className="bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-700">
                      Thay đổi mật khẩu
                    </button>
                  </form>
                </section>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-500 font-medium">
        Đang tải trang cá nhân...
      </div>
    }>
      <AccountPageContent />
    </Suspense>
  );
}