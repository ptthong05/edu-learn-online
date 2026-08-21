'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/lib/hooks/useCart';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSiteSettings } from '@/lib/useSiteSettings';
import { categories } from '@/lib/data/mockData';
import { getAuthToken } from '@/lib/utils/auth';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { cartCount, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const { settings: siteSettings } = useSiteSettings();

  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);

  // Load read notification IDs from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user_read_notif_ids');
      if (stored) {
        try {
          setReadIds(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // Detect referral parameter and record affiliate click
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref');
      if (ref) {
        localStorage.setItem('affiliate_ref', ref);
        const now = Date.now();
        const lastClickStr = localStorage.getItem(`aff_click_time_${ref}`);
        const lastClick = lastClickStr ? parseInt(lastClickStr, 10) : 0;
        
        // Throttle clicks to once every 5 minutes per referral to prevent page-reload spamming
        if (now - lastClick > 5 * 60 * 1000) {
          localStorage.setItem(`aff_click_time_${ref}`, String(now));
          import('@/lib/utils/api').then(({ api }) => {
            api.recordAffiliateClick({ ref, url: window.location.href }).catch(err => {
              console.error('Failed to record affiliate click:', err);
            });
          });
        }
      }
    }
  }, [pathname]);

  const fetchNotifications = async () => {
    const token = getAuthToken();
    if (!token || !user) return;
    try {
      const res = await fetch('http://localhost:5000/api/my-notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data || []);
      }
    } catch (err) {
      console.error('Lỗi tải thông báo:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [user]);

  const handleBellClick = () => {
    setShowNotifDropdown(!showNotifDropdown);
    if (!showNotifDropdown && notifications.length > 0) {
      const newReadIds = Array.from(new Set([...readIds, ...notifications.map(n => n.id)]));
      setReadIds(newReadIds);
      localStorage.setItem('user_read_notif_ids', JSON.stringify(newReadIds));
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

  // Compute avatar initials for logged-in user
  const initials = user?.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).slice(-2).join('').toUpperCase()
    : 'U';

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white/80 backdrop-blur-sm'
    }`}>
      {/* Top Row: Logo, Search, Cart, Auth */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-3">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              {siteSettings?.logo_url ? (
                <>
                  <img 
                    src={siteSettings.logo_url} 
                    alt={siteSettings.site_name || 'Logo'} 
                    className="h-9 w-auto object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="hidden sm:flex flex-col leading-tight">
                    <span className="text-base sm:text-lg font-black text-blue-600 tracking-tight">
                      {siteSettings?.site_name || 'DRIVE ORD'}
                    </span>
                    <span className="text-xs text-gray-400 font-medium tracking-wide">
                      {siteSettings?.site_tagline || 'Nền tảng học trực tuyến hàng đầu'}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-white font-black text-sm tracking-tight">
                      {(() => {
                          const name = siteSettings?.site_name || 'DRIVE ORD';
                        const words = name.trim().split(/\s+/);
                        return words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
                      })()}
                    </span>
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-base sm:text-lg font-black text-blue-600 tracking-tight">
                      {siteSettings?.site_name || 'DRIVE ORD'}
                    </span>
                    <span className="text-xs text-gray-400 font-medium tracking-wide">
                      {siteSettings?.site_tagline || 'Nền tảng học trực tuyến hàng đầu'}
                    </span>
                  </div>
                </>
              )}
            </Link>

            {/* Search bar */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
              className="hidden lg:flex flex-1 max-w-lg relative items-center gap-2 mx-8"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Tìm kiếm khóa học, kỹ năng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-full border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                type="button"
                onClick={handleSearch}
                className="px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors flex-shrink-0"
              >
                Tìm kiếm
              </button>
            </form>

            {/* Actions: Cart & Account */}
            <div className="flex items-center gap-2 relative">
              {/* Notification Bell */}
              {user && (
                <div className="relative">
                  <button
                    onClick={handleBellClick}
                    className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-all"
                    title="Thông báo"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                    )}
                  </button>

                  {/* Dropdown menu */}
                  {showNotifDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowNotifDropdown(false)} />
                      <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 shadow-xl rounded-2xl z-50 text-left overflow-hidden max-h-[400px] flex flex-col animate-scale-in">
                        <div className="p-3.5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                          <span className="font-bold text-gray-800 text-sm">Thông báo của bạn</span>
                          {unreadCount > 0 && (
                            <span className="text-[10px] bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-full">
                              {unreadCount} chưa đọc
                            </span>
                          )}
                        </div>
                        <div className="overflow-y-auto flex-1 divide-y divide-gray-50 max-h-[300px]">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center text-xs text-gray-400">
                              Không có thông báo nào mới
                            </div>
                          ) : (
                            notifications.map((n) => {
                              const isUnread = !readIds.includes(n.id);
                              
                              let icon = '🔔';
                              let iconBg = 'bg-gray-50 text-gray-500';
                              if (n.type === 'order-status') {
                                icon = '📦';
                                iconBg = 'bg-blue-50 text-blue-600';
                              } else if (n.type === 'affiliate-status') {
                                icon = '🎉';
                                iconBg = 'bg-emerald-50 text-emerald-600';
                              } else if (n.type === 'referral-order') {
                                icon = '📦';
                                iconBg = 'bg-blue-50 text-blue-600';
                              } else if (n.type === 'referral-commission') {
                                icon = '💸';
                                iconBg = 'bg-emerald-50 text-emerald-600';
                              } else if (n.type === 'referral-click') {
                                icon = '🖱️';
                                iconBg = 'bg-blue-50 text-blue-600';
                              } else if (n.type === 'withdrawal-status') {
                                icon = '💰';
                                iconBg = 'bg-amber-50 text-amber-600';
                              }

                              return (
                                <div 
                                  key={n.id}
                                  onClick={() => {
                                    setShowNotifDropdown(false);
                                    router.push(n.link);
                                  }}
                                  className={`p-3 flex gap-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                                    isUnread ? 'bg-blue-50/15' : ''
                                  }`}
                                >
                                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-semibold ${iconBg}`}>
                                    {icon}
                                  </div>
                                  <div className="flex-1 min-w-0 space-y-0.5">
                                    <div className="flex items-center justify-between gap-2">
                                      <p className={`text-xs truncate ${isUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>{n.title}</p>
                                      <span className="text-[10px] text-gray-400 whitespace-nowrap">{formatRelativeTime(n.time)}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed break-words">{n.message}</p>
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
              )}

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-all"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              <div className="hidden lg:flex items-center gap-2 border-l border-gray-200 pl-4 ml-2">
                {user ? (
                  <Link
                    href="/tai-khoan"
                    className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-gray-100 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-black text-xs flex-shrink-0">
                      {initials}
                    </div>
                    <div className="hidden md:flex flex-col leading-tight text-left">
                      <span className="text-[10px] text-gray-400">Xin chào</span>
                      <span className="text-xs font-bold text-gray-800 group-hover:text-primary-600 transition-colors truncate max-w-[120px]">
                        {user.full_name}
                      </span>
                    </div>
                  </Link>
                ) : (
                  <>
                    <Link href="/login"
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 rounded-lg transition-all">
                      Đăng nhập
                    </Link>
                    <Link href="/register"
                      className="px-4 py-2 text-sm font-semibold bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all duration-300">
                      Đăng ký
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile menu toggle */}
              <button className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg ml-2"
                onClick={() => setMobileOpen(!mobileOpen)}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Navigation Menu */}
      <div className="hidden lg:block bg-gradient-to-r from-blue-600 to-indigo-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between w-full py-3">
            <Link href="/courses" className="text-base sm:text-lg font-bold text-white uppercase hover:text-blue-200 transition-colors tracking-wide">
              Khóa học
            </Link>
            
            <div
              className="relative group"
              onMouseEnter={() => setCatDropdownOpen(true)}
              onMouseLeave={() => setCatDropdownOpen(false)}
            >
              <button className="flex items-center gap-1 text-base sm:text-lg font-bold text-white uppercase group-hover:text-blue-200 transition-colors py-1 tracking-wide">
                Danh mục
                <svg className="w-5 h-5 ml-0.5 transform rotate-180 group-hover:rotate-0 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {catDropdownOpen && (
                <div className="absolute left-0 mt-0 w-56 rounded-xl bg-white shadow-lg border border-gray-100 py-2 z-50 animate-scale-in">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/courses?category=${cat.id}`}
                      onClick={() => setCatDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      <span>{cat.icon || '📁'}</span>
                      <span>{cat.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/combos" className="text-base sm:text-lg font-bold text-white uppercase hover:text-blue-200 transition-colors tracking-wide">Combo</Link>
            <Link href="/promotions" className="text-base sm:text-lg font-bold text-white uppercase hover:text-blue-200 transition-colors tracking-wide">Khuyến mãi</Link>
            <Link href="/blog" className="text-base sm:text-lg font-bold text-white uppercase hover:text-blue-200 transition-colors tracking-wide">Blog</Link>
            <Link href="/tai-khoan?tab=affiliate" className="text-base sm:text-lg font-bold text-white uppercase hover:text-blue-200 transition-colors tracking-wide">Affiliate</Link>
            <Link href="/huong-dan" className="text-base sm:text-lg font-bold text-white uppercase hover:text-blue-200 transition-colors tracking-wide">Hướng dẫn</Link>
            <Link href="/lien-he" className="text-base sm:text-lg font-bold text-white uppercase hover:text-blue-200 transition-colors tracking-wide">Liên hệ</Link>
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 animate-slide-down">
          <div className="flex flex-col gap-1 px-4 py-3 max-h-[70vh] overflow-y-auto">
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm khóa học..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </form>

            <Link href="/courses" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Khóa học</Link>
            <div className="px-3 py-2.5 text-sm font-medium text-gray-700">Danh mục</div>
            <div className="pl-6 flex flex-col gap-1 border-l-2 border-gray-100 ml-4 mb-2">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/courses?category=${cat.id}`} onClick={() => setMobileOpen(false)} className="py-1.5 text-sm text-gray-600">
                  {cat.name}
                </Link>
              ))}
            </div>
            <Link href="/combos" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Combo</Link>
            <Link href="/promotions" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Khuyến mãi</Link>
            <Link href="/blog" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Blog</Link>
            <Link href="/tai-khoan?tab=affiliate" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Affiliate</Link>
            <Link href="/huong-dan" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Hướng dẫn</Link>
            <Link href="/lien-he" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Liên hệ</Link>
            
            {user ? (
              <div className="flex flex-col gap-1 mt-4 pt-4 border-t border-gray-100">
                <Link href="/tai-khoan" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm font-bold text-primary-600 hover:bg-gray-50 rounded-lg flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-black text-[10px]">
                    {initials}
                  </div>
                  Tài khoản ({user.full_name})
                </Link>
              </div>
            ) : (
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-xl hover:border-primary-500">Đăng nhập</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-2.5 text-sm font-semibold bg-gray-900 text-white rounded-xl">Đăng ký</Link>
              </div>
            )}
          </div>
        </div>
      )}

    </header>
  );
}
