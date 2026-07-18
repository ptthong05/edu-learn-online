'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/utils/api';

export default function GuidePage() {
  const [guide, setGuide] = useState({ title: 'Hướng dẫn mua hàng', description: 'Làm theo các bước đơn giản dưới đây để sở hữu khóa học của bạn', steps: [] as any[] });
  const [note, setNote] = useState({
    title: 'Lưu ý quan trọng',
    message: 'Nếu có bất kỳ thắc mắc hay gặp lỗi nào về việc mua hàng, vui lòng liên hệ Khóa Học Drive MH qua Zalo:',
    zalo: '0328 028 026',
    zalo_link: 'https://zalo.me/0328028026'
  });
  
  useEffect(() => { 
    api.getPurchaseGuide()
      .then(data => {
        if (data) {
          let stepsList = [];
          let pNote = {
            title: 'Lưu ý quan trọng',
            message: 'Nếu có bất kỳ thắc mắc hay gặp lỗi nào về việc mua hàng, vui lòng liên hệ Khóa Học Drive MH qua Zalo:',
            zalo: '0328 028 026',
            zalo_link: 'https://zalo.me/0328028026'
          };
          try {
            const parsed = JSON.parse(data.content);
            if (Array.isArray(parsed)) {
              stepsList = parsed;
            } else if (parsed && typeof parsed === 'object') {
              stepsList = parsed.steps || [];
              if (parsed.note) {
                pNote = {
                  title: parsed.note.title || pNote.title,
                  message: parsed.note.message || pNote.message,
                  zalo: parsed.note.zalo || pNote.zalo,
                  zalo_link: parsed.note.zalo_link || pNote.zalo_link
                };
              }
            }
          } catch (e) {
            stepsList = [];
          }
          setGuide({
            title: data.title || 'Hướng dẫn mua hàng',
            description: data.description || 'Làm theo các bước đơn giản dưới đây để sở hữu khóa học của bạn',
            steps: Array.isArray(stepsList) ? stepsList : []
          });
          setNote(pNote);
        }
      })
      .catch(() => undefined); 
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 py-14 px-4 sm:px-6 lg:px-8 animate-fade-in font-sans">
      <article className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-card p-6 sm:p-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <p className="text-primary-600 font-extrabold text-xs uppercase tracking-wider">HỖ TRỢ KHÁCH HÀNG</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {guide.title}
          </h1>
          {guide.description && (
            <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">
              {guide.description}
            </p>
          )}
        </div>

        <div className="border-t border-slate-100 pt-8 space-y-8">
          {/* Steps List */}
          <div className="relative pl-6 border-l-2 border-primary-100 space-y-12 ml-4 py-2">
            {guide.steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Bullet/Badge */}
                <div className="absolute -left-11 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 text-white text-xs font-bold shadow-md shadow-primary-200 ring-4 ring-white">
                  {index + 1}
                </div>

                {/* Card */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border-l-4 border-l-primary-500">
                  <h3 className="font-bold text-slate-800 text-base mb-2">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Warning Alert Box */}
          <div className="bg-amber-50/80 border-l-4 border-amber-500 rounded-2xl p-5 shadow-sm space-y-2 border border-amber-100/50">
            <h4 className="font-bold text-amber-800 text-sm flex items-center gap-1.5">
              ⚠️ {note.title}
            </h4>
            <p className="text-amber-800 text-xs sm:text-sm leading-relaxed">
              {note.message}{" "}
              {note.zalo && (
                <a href={note.zalo_link || `https://zalo.me/${note.zalo.replace(/\s+/g, '')}`} target="_blank" rel="noreferrer" className="font-extrabold underline text-amber-900 hover:text-amber-950">
                  {note.zalo}
                </a>
              )}
            </p>
          </div>
        </div>
      </article>
    </main>
  );
}
