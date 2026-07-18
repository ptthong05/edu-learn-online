'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/utils/api';

type Faq = { id: string; question: string; answer: string };

export default function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [settings, setSettings] = useState({ title: 'Câu hỏi thường gặp', description: 'Tìm nhanh câu trả lời cho các thắc mắc về khóa học và thanh toán.' });

  useEffect(() => { 
    api.getFaqs().then(setFaqs).catch(() => undefined); 
    api.getFaqSettings()
      .then(data => {
        if (data) {
          setSettings({
            title: data.title || 'Câu hỏi thường gặp',
            description: data.description || ''
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
          {settings.title}
        </h1>
        {settings.description && (
          <p className="text-slate-500 text-center text-sm mb-8 max-w-2xl mx-auto">
            {settings.description}
          </p>
        )}
        
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details key={faq.id} className="group bg-slate-50/50 border border-slate-200 rounded-2xl shadow-sm open:bg-white open:border-primary-300 transition-all duration-200">
              <summary className="cursor-pointer list-none p-5 flex items-center justify-between font-semibold text-slate-800">
                <span>{faq.question}</span>
                <span className="text-primary-600 text-xl group-open:rotate-45 transition-transform duration-200">+</span>
              </summary>
              <div className="px-5 pb-5 text-sm leading-7 text-slate-600 border-t border-slate-100 pt-4" dangerouslySetInnerHTML={{ __html: faq.answer }} />
            </details>
          ))}
        </div>
        {!faqs.length && <p className="text-center text-slate-500 py-8">Chưa có câu hỏi nào.</p>}
      </article>
    </main>
  );
}
