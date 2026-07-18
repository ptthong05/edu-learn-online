'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/utils/api';

interface ContactSettings {
  title: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  content: string;
}

export default function ContactPage() {
  const [contact, setContact] = useState<ContactSettings>({
    title: 'Liên hệ',
    description: '',
    address: '',
    phone: '',
    email: '',
    content: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.getContactSettings();
        if (data) {
          setContact({
            title: data.title || 'Liên hệ',
            description: data.description || '',
            address: data.address || '',
            phone: data.phone || '',
            email: data.email || '',
            content: data.content || ''
          });
        }
      } catch (err) {
        console.error('Failed to fetch contact settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-50 py-14 px-4 animate-fade-in">
      <article className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-card p-6 sm:p-10">
        <p className="text-primary-600 font-bold text-sm text-center">HỖ TRỢ KHÁCH HÀNG</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 text-center mt-2 mb-4">
          {contact.title || 'Liên hệ'}
        </h1>
        {contact.description && (
          <p className="text-slate-500 text-center text-sm mb-8 max-w-2xl mx-auto">
            {contact.description}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-slate-600 font-medium">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Main content from rich text editor */}
            {contact.content && (
              <div 
                className="prose prose-slate max-w-none text-slate-600 leading-8 text-sm pb-6 border-b border-slate-100"
                dangerouslySetInnerHTML={{ __html: contact.content }}
              />
            )}

            {/* Centered Contact Table - 3 Rows */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl max-w-xl mx-auto shadow-sm">
              <table className="w-full text-sm border-collapse">
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-800 text-center w-1/3 bg-slate-50/50">📍 Địa chỉ</td>
                    <td className="py-4 px-6 text-center">{contact.address}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-800 text-center w-1/3 bg-slate-50/50">📞 Số điện thoại</td>
                    <td className="py-4 px-6 text-center">
                      <a href={`tel:${contact.phone}`} className="text-primary-600 hover:text-primary-500 hover:underline font-semibold">
                        {contact.phone}
                      </a>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-800 text-center w-1/3 bg-slate-50/50">✉️ Email</td>
                    <td className="py-4 px-6 text-center">
                      <a href={`mailto:${contact.email}`} className="text-primary-600 hover:text-primary-500 hover:underline font-semibold break-all">
                        {contact.email}
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </article>
    </main>
  );
}
