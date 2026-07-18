'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/utils/api';
import { useSiteSettings } from '@/lib/useSiteSettings';

type Contact = { address: string; phone: string; email: string };

const Icon = ({ children }: { children: React.ReactNode }) => (
  <span className="w-12 h-12 rounded-lg bg-slate-800 hover:bg-primary-600 grid place-items-center text-white transition-colors shadow-sm">{children}</span>
);

export default function Footer() {
  const [contact, setContact] = useState<Contact>({ address: 'Hồ Chí Minh, Việt Nam', phone: '0932525650', email: 'ptthong.www@gmail.com' });
  const { settings: siteSettings } = useSiteSettings();

  useEffect(() => { api.getContactSettings().then(setContact).catch(() => undefined); }, []);

  return (
    <footer className="mt-16 bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
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
                   <span className="leading-tight flex flex-col">
                     <b className="text-blue-600 text-base sm:text-lg font-black tracking-tight">{siteSettings?.site_name || 'DRIVE MH'}</b>
                     <small className="text-slate-400 text-[10px] sm:text-xs font-medium tracking-wide">{siteSettings?.site_tagline || 'Học Trực Tuyến'}</small>
                   </span>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                    <span className="text-white font-black text-sm tracking-tight">
                      {(() => {
                        const name = siteSettings?.site_name || 'DRIVE MH';
                        const words = name.trim().split(/\s+/);
                        return words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
                      })()}
                    </span>
                  </div>
                   <span className="leading-tight flex flex-col">
                     <b className="text-blue-600 text-base sm:text-lg font-black tracking-tight">{siteSettings?.site_name || 'DRIVE MH'}</b>
                     <small className="text-slate-400 text-[10px] sm:text-xs font-medium tracking-wide">{siteSettings?.site_tagline || 'Học Trực Tuyến'}</small>
                   </span>
                </>
              )}
            </Link>
            <p className="text-xs sm:text-sm leading-6 text-slate-400">Website bán khóa học giá rẻ nhất thị trường với đội ngũ giảng viên vô cùng chất lượng. Làm việc với tiêu chí uy tín, hiệu quả và nhanh chóng.</p>
            <div className="flex gap-3 mt-5">
              <a href="https://www.facebook.com/share/1B5GE4UyVp/" target="_blank" rel="noreferrer" aria-label="Facebook"><Icon><b className="text-xl leading-none">f</b></Icon></a>
              <a href="https://t.me/0932525650" target="_blank" rel="noreferrer" aria-label="Telegram"><Icon><svg className="w-6 h-6 -rotate-12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.7 3.1 2.9 10.4c-1.3.5-1.3 1.2-.2 1.6l4.8 1.5 1.9 5.8c.2.6.1.9.8.9.5 0 .7-.2 1-.5l2.3-2.2 4.9 3.6c.9.5 1.5.3 1.7-.8l3.2-15.1c.3-1.3-.5-1.9-1.6-1.4Zm-13.4 9.8 10.8-6.8c.5-.3 1-.1.6.3l-8.8 8-.3 3.2-1.5-4.7-4.1-1.3c-.9-.3-.9-.9.2-1.3l14.8-5.7" /></svg></Icon></a>
              <a href="https://zalo.me/0932525650" target="_blank" rel="noreferrer" aria-label="Zalo"><Icon><b className="text-sm">Zalo</b></Icon></a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-sm sm:text-base text-white mb-3 sm:mb-4">Danh mục khóa học</h3>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li><Link href="/combos" className="hover:text-primary-400">Combo khóa học tiết kiệm</Link></li>
              <li><Link href="/courses?category=cat-1" className="hover:text-primary-400">Khóa học lập trình web</Link></li>
              <li><Link href="/courses?category=cat-5" className="hover:text-primary-400">Khóa học Python</Link></li>
              <li><Link href="/courses" className="hover:text-primary-400">Khóa học khác</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sm sm:text-base text-white mb-3 sm:mb-4">Hỗ trợ khách hàng</h3>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li><Link href="/cau-hoi-thuong-gap" className="hover:text-primary-400">Câu hỏi thường gặp</Link></li>
              <li><Link href="/dieu-khoan-dich-vu" className="hover:text-primary-400">Điều khoản dịch vụ</Link></li>
              <li><Link href="/huong-dan" className="hover:text-primary-400">Hướng dẫn mua hàng</Link></li>
              <li><Link href="/gioi-thieu" className="hover:text-primary-400">Giới thiệu</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sm sm:text-base text-white mb-3 sm:mb-4">Thông tin liên hệ</h3>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-slate-400">
              <li>📍 {contact.address}</li>
              <li>📞 <a className="hover:text-primary-400" href={`tel:${contact.phone}`}>{contact.phone}</a></li>
              <li>✉️ <a className="hover:text-primary-400" href={`mailto:${contact.email}`}>{contact.email}</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row gap-2 sm:justify-between text-xs sm:text-sm text-slate-500">
          <p>© 2026 Bản quyền thuộc khoahocgiaredrive</p>
          <p>Design by Ptthong</p>
        </div>
      </div>
    </footer>
  );
}
