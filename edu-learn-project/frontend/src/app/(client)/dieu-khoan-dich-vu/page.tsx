'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/utils/api';

export default function TermsPage() { 
  const [page, setPage] = useState({ title: 'Điều khoản dịch vụ', description: '', content: '' }); 
  
  useEffect(() => { 
    api.getTermsOfService()
      .then(data => {
        if (data) {
          setPage({
            title: data.title || 'Điều khoản dịch vụ',
            description: data.description || '',
            content: data.content || ''
          });
        }
      })
      .catch(() => undefined); 
  }, []); 

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-50 py-14 px-4 animate-fade-in">
      <article className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-card p-6 sm:p-10">
        <p className="text-primary-600 font-bold text-sm text-center">HỖ TRỢ KHÁCH HÀNG</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 text-center mt-2 mb-4">
          {page.title}
        </h1>
        {page.description && (
          <p className="text-slate-500 text-center text-sm mb-8 max-w-2xl mx-auto">
            {page.description}
          </p>
        )}
        <div 
          className="prose prose-slate max-w-none text-slate-600 leading-8 text-sm pt-6 border-t border-slate-100" 
          dangerouslySetInnerHTML={{ __html: page.content }} 
        />
      </article>
    </main>
  );
}
