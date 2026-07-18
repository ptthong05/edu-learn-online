'use client';
import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/utils/api';
import toast from 'react-hot-toast';
import { cleanPassword } from '@/lib/utils/helpers';

interface SidebarLinkProps {
  href: string;
  icon: ReactNode;
  label: string;
  active: boolean;
}

  function SidebarLink({ href, icon, label, active }: SidebarLinkProps) {
    return (
      <Link href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-medium transition-all ${
        active
          ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg shadow-primary-500/20'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}>
        {icon}
        <span>{label}</span>
      </Link>
    );
  }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, loading, logout, updateUser } = useAuth();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Admin notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);

  useEffect(() => {
    // Load read notification IDs from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('admin_read_notif_ids');
      if (stored) {
        try {
          setReadIds(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // Fetch site settings
  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        // Only fetch if we have a valid token and auth is not loading
        if (loading || !token) return;

        const res = await fetch('http://localhost:5000/api/admin/site-settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setSiteSettings(data);
        } else if (res.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          logout();
          router.push('/login');
        }
      } catch (err) {
        console.error('Error fetching site settings:', err);
      }
    };

    fetchSiteSettings();
  }, [loading, token, router, logout]);

  const fetchNotifications = async () => {
    if (!token || !user || (user.role !== 'MANAGER' && user.role !== 'STAFF')) return;
    try {
      const res = await fetch('http://localhost:5000/api/admin/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data || []);
      }
    } catch (err) {
      console.error('Lỗi tải thông báo admin:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, [token, user]);

  const handleBellClick = () => {
    setShowNotifDropdown(!showNotifDropdown);
    if (!showNotifDropdown && notifications.length > 0) {
      const newReadIds = Array.from(new Set([...readIds, ...notifications.map(n => n.id)]));
      setReadIds(newReadIds);
      localStorage.setItem('admin_read_notif_ids', JSON.stringify(newReadIds));
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      if (isNaN(diffMs) || diffMs < 0) return 'Vừa xong';
      
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffSecs < 60) return 'Vừa xong';
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      return `${diffDays} ngày trước`;
    } catch (e) {
      return dateStr;
    }
  };

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  useEffect(() => {
    if (!loading && (!token || !user || (user.role !== 'MANAGER' && user.role !== 'STAFF'))) {
      router.push('/login');
    }
  }, [loading, token, user, router]);

  // Protect restricted routes for STAFF
  useEffect(() => {
    if (!loading && token && user && user.role === 'STAFF') {
      const isRestricted = 
        pathname === '/admin/users' || pathname.startsWith('/admin/users/') ||
        pathname === '/admin/accounts' || pathname.startsWith('/admin/accounts/');
      if (isRestricted) {
        toast.error('Bạn không có quyền truy cập trang này.');
        router.push('/admin');
      }
    }
  }, [loading, token, user, pathname, router]);

  // Check if user is blocked and redirect to login with message
  // Exception: Allow blocked admins to access accounts page for recovery
  useEffect(() => {
    if (!loading && token && user && (user.role === 'MANAGER' || user.role === 'STAFF')) {
      // Skip check if on accounts page (allow recovery)
      // Also skip if user object already has blocked status (let backend handle it)
      if (pathname === '/admin/accounts' || user.status === 'blocked') {
        return;
      }

      // Fetch user status from API
      const checkUserStatus = async () => {
        try {
          const res = await fetch('http://localhost:5000/api/users/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            // Check if user is blocked from the profile response
            const userData = data.user || data;
            if (userData.status === 'blocked') {
              // User is blocked, redirect to login
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              sessionStorage.removeItem('token');
              sessionStorage.removeItem('user');
              logout();
              router.push('/login?message=blocked');
            }
          } else if (res.status === 403) {
            // User is blocked, redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            logout();
            router.push('/login?message=blocked');
          }
        } catch (err) {
          console.error('Error checking user status:', err);
        }
      };
      
      checkUserStatus();
    }
  }, [loading, token, user, router, logout, pathname]);

  if (loading || !token || !user || (user.role !== 'MANAGER' && user.role !== 'STAFF')) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-gray-400 gap-3 font-sans">
        <svg className="animate-spin h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span>Đang xác thực thông tin...</span>
      </div>
    );
  }

  if (user.must_change_password) {
    const handleForceChangePassword = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newPassword || newPassword.length < 6) {
        toast.error('Mật khẩu mới phải có ít nhất 6 ký tự.');
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error('Mật khẩu xác nhận không khớp.');
        return;
      }
      setUpdatingPassword(true);
      try {
        await api.changePassword(newPassword);
        toast.success('Đổi mật khẩu thành công! Tài khoản của bạn đã được kích hoạt.');
        // Update user state so must_change_password becomes 0
        const updated = { ...user, must_change_password: 0 };
        updateUser(updated);
      } catch (err: any) {
        toast.error(err.message || 'Lỗi khi đổi mật khẩu.');
      } finally {
        setUpdatingPassword(false);
      }
    };

    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 font-sans text-gray-200">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-md w-full space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary-600/20 text-primary-400 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">🔒</div>
            <h3 className="text-xl font-bold text-white">Đổi mật khẩu bắt buộc</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Đây là lần đầu tiên bạn đăng nhập vào hệ thống. Vì lý do bảo mật, vui lòng đổi mật khẩu mới để kích hoạt tài khoản quản trị của bạn.
            </p>
          </div>
          <form onSubmit={handleForceChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Mật khẩu mới</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(cleanPassword(e.target.value))}
                placeholder="Nhập ít nhất 6 ký tự"
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(cleanPassword(e.target.value))}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={updatingPassword}
              className="w-full py-3.5 bg-gradient-brand text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary-500/20 transition disabled:opacity-55 text-sm"
            >
              {updatingPassword ? 'Đang kích hoạt...' : 'Kích hoạt tài khoản'}
            </button>
            <button
              type="button"
              onClick={logout}
              className="w-full text-center text-xs text-gray-500 hover:text-white transition font-medium"
            >
              Đăng xuất
            </button>
          </form>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      href: '/admin',
      label: 'Tổng quan',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      ),
    },
    {
      href: '/admin/courses',
      label: 'Khóa học',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      href: '/admin/combos',
      label: 'Combo',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      href: '/admin/categories',
      label: 'Danh mục',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
    },
    {
      href: '/admin/users',
      label: 'Người dùng',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      href: '/admin/orders',
      label: 'Đơn hàng',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      href: '/admin/coupons',
      label: 'Mã giảm giá',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      href: '/admin/payment-methods',
      label: 'Phương thức thanh toán',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      href: '/admin/home-banner',
      label: 'Banner Trang chủ',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    {
      href: '/admin/site-settings',
      label: 'Cài đặt Website',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      href: '/admin/affiliate-guides',
      label: 'Tài liệu hướng dẫn CTV',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      href: '/admin/website-content',
      label: 'Nội dung website',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h10" /></svg>
      ),
    },
    {
      href: '/admin/blogs',
      label: 'Bài viết & Blog',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-.586-1.414l-4.5-4.5A2 2 0 0011.5 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2z" />
        </svg>
      ),
    },
    {
      href: '/admin/affiliates',
      label: 'Affiliate',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
    },
    {
      href: '/admin/affiliate-revenues',
      label: 'Doanh thu Affiliate',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      href: '/admin/affiliate-stats',
      label: 'Thống kê doanh thu CTV',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      href: '/admin/withdrawals',
      label: 'Thanh toán rút tiền',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
      ),
    },
    {
      href: '/admin/accounts',
      label: 'Tài khoản Quản trị',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11.57V9c0-2.28-1.488-4.232-3.56-4.903m11.56 14.984A13.915 13.915 0 0115 11.57V9c0-2.28 1.48-4.232 3.56-4.903m-3.44 11.213A9.047 9.047 0 0112 12c-1.575 0-3.003-.404-4.243-1.11m0 0L3.58 11.57C3.73 14 4.74 16.02 6.4 17.581M20.42 11.57C20.27 14 19.26 16.02 17.6 17.581m-5.6-5.581V3" />
        </svg>
      ),
    },
    {
      href: '/admin/profile',
      label: 'Tài khoản của tôi',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col md:flex-row">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static top-0 left-0 h-full z-40 w-72 md:w-64 bg-gray-900 border-r border-gray-800 p-5 flex flex-col gap-8 flex-shrink-0 transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="flex items-center gap-3">
          {siteSettings?.logo_url ? (
            <img 
              src={siteSettings.logo_url} 
              alt="Logo" 
              className="w-9 h-9 object-contain rounded-xl"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <span className="text-white font-black text-sm tracking-tight">
                {(() => {
                  const name = siteSettings?.site_name || 'DRIVE MH';
                  const words = name.trim().split(/\s+/);
                  return words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
                })()}
              </span>
            </div>
          )}
          <div>
            <span className="text-xl font-bold text-blue-600 tracking-wide">{siteSettings?.site_name || 'EduLearn'}</span>
            <span className="text-[10px] block text-primary-400 font-bold tracking-wider uppercase">Portal Admin</span>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex flex-col gap-1.5 flex-1">
          {menuItems
            .filter(item => !(user?.role === 'STAFF' && (item.href === '/admin/users' || item.href === '/admin/accounts')))
            .map(item => (
              <SidebarLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))}
              />
            ))}
        </nav>

        {/* User Card */}
        <div className="border-t border-gray-800 pt-4 flex items-center gap-3">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=7c3aed&color=fff`}
            alt="Avatar"
            className="w-10 h-10 rounded-full animate-fade-in"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user.full_name}</p>
            <p className="text-xs text-primary-400 font-medium">
              {user.role === 'MANAGER' ? 'Quản lý (Manager)' : 'Nhân viên (Staff)'}
            </p>
          </div>
          <button
            onClick={logout}
            className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-all"
            title="Đăng xuất"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-0">
        {/* Header */}
        <header className="h-16 border-b border-gray-800 bg-gray-900 px-4 sm:px-8 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Mở menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {sidebarOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
            <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide">
              {menuItems.find(item => item.href === pathname || (item.href !== '/admin' && pathname.startsWith(item.href)))?.label || 'Quản lý'}
            </h2>
          </div>
          <div className="flex items-center gap-4 relative z-[10000]">
            <div className="relative">
              <button 
                onClick={handleBellClick}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 relative"
                title="Thông báo"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-gray-900">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifDropdown && (
                <>
                  <div className="fixed inset-0 z-[9998]" onClick={() => setShowNotifDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-[9999] text-left overflow-hidden animate-fade-in max-h-[450px] flex flex-col opacity-100">
                    <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-950/40">
                      <span className="font-bold text-white text-sm">Thông báo mới</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-primary-600/20 text-primary-400 font-bold px-2 py-0.5 rounded-full">
                          {unreadCount} chưa đọc
                        </span>
                      )}
                    </div>
                    <div className="overflow-y-auto flex-1 divide-y divide-gray-800 max-h-[350px]">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-xs text-gray-500">
                          Không có thông báo nào mới
                        </div>
                      ) : (
                        notifications.map((n) => {
                          const isUnread = !readIds.includes(n.id);
                          // Determine icon/color based on notification type
                          let icon = '🔔';
                          let iconBg = 'bg-gray-800 text-gray-400';
                          if (n.type === 'order') {
                            icon = '🛒';
                            iconBg = 'bg-blue-950/50 text-blue-400 border border-blue-900/30';
                          } else if (n.type === 'affiliate') {
                            icon = '👥';
                            iconBg = 'bg-amber-950/50 text-amber-400 border border-amber-900/30';
                          } else if (n.type === 'user') {
                            icon = '👤';
                            iconBg = 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/30';
                          } else if (n.type === 'withdrawal') {
                            icon = '💰';
                            iconBg = 'bg-purple-950/50 text-purple-400 border border-purple-900/30';
                          }

                          return (
                            <div 
                              key={n.id}
                              onClick={() => {
                                setShowNotifDropdown(false);
                                router.push(n.link);
                              }}
                              className={`p-3.5 flex gap-3 hover:bg-white/5 cursor-pointer transition-colors ${
                                isUnread ? 'bg-white/[0.02]' : ''
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm ${iconBg}`}>
                                {icon}
                              </div>
                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-xs font-bold text-white truncate">{n.title}</p>
                                  <span className="text-[10px] text-gray-500 whitespace-nowrap">{formatRelativeTime(n.time)}</span>
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed break-words">{n.message}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <Link href="/" target="_blank" className="text-xs font-semibold text-primary-400 hover:text-white border border-primary-500/30 px-3 py-1.5 rounded-lg bg-primary-950/20 hover:bg-primary-950/40 transition-all">
              Xem Client Site
            </Link>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
