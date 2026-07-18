'use client';

import { useEffect } from 'react';
import { useSiteSettings } from '@/lib/useSiteSettings';
import { usePathname } from 'next/navigation';

// Default favicon SVG - matches the header logo style
const defaultFaviconSvg = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%232563eb;stop-opacity:1" /><stop offset="100%" style="stop-color:%234f46e5;stop-opacity:1" /></linearGradient></defs><rect width="100" height="100" rx="20" fill="url(%23grad)"/><text x="50" y="68" font-family="Arial, sans-serif" font-size="50" font-weight="900" fill="white" text-anchor="middle">DO</text></svg>`;

export function SiteTitleUpdater() {
  const { settings } = useSiteSettings();
  const pathname = usePathname();

  useEffect(() => {
    if (!settings) return;

    const siteName = settings.site_name || 'DRIVE ORD';
    const tagline = settings.site_tagline || 'Nền tảng học trực tuyến hàng đầu';

    // Update favicon - use logo_url if available, otherwise use default
    let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href = settings.logo_url || defaultFaviconSvg;

    // Handle Title Mapping for static routes
    const isDynamicPath = pathname.startsWith('/courses/') || pathname.startsWith('/blog/');
    if (isDynamicPath) {
      return; // Handled by dynamic page components
    }

    if (pathname === '/') {
      document.title = `${siteName} - ${tagline}`;
    } else if (pathname === '/courses') {
      document.title = `Danh sách khóa học | ${siteName}`;
    } else if (pathname === '/blog') {
      document.title = `Blog & Tin tức | ${siteName}`;
    } else if (pathname === '/gioi-thieu') {
      document.title = `Giới thiệu | ${siteName}`;
    } else if (pathname === '/lien-he') {
      document.title = `Liên hệ | ${siteName}`;
    } else if (pathname === '/dieu-khoan-dich-vu') {
      document.title = `Điều khoản dịch vụ | ${siteName}`;
    } else if (pathname === '/cart') {
      document.title = `Giỏ hàng của bạn | ${siteName}`;
    } else if (pathname === '/checkout') {
      document.title = `Thanh toán đơn hàng | ${siteName}`;
    } else if (pathname === '/combos') {
      document.title = `Combo tiết kiệm | ${siteName}`;
    } else if (pathname === '/my-courses') {
      document.title = `Khóa học của tôi | ${siteName}`;
    } else if (pathname === '/profile') {
      document.title = `Trang cá nhân | ${siteName}`;
    } else if (pathname === '/cau-hoi-thuong-gap') {
      document.title = `Câu hỏi thường gặp | ${siteName}`;
    } else if (pathname.startsWith('/admin')) {
      document.title = `Hệ thống quản trị | ${siteName}`;
    } else {
      document.title = `${siteName} - ${tagline}`;
    }
  }, [settings, pathname]);

  return null;
}
