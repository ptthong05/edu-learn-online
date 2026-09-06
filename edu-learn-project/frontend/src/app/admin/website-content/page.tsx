'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/utils/api';

type Article = { id?: string; title: string; description?: string; content: string };
type Faq = { id: string; question: string; answer: string; display_order?: number };
type Contact = { id?: string; title: string; description: string; address: string; phone: string; email: string; content: string };

function RichEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  // Sync content with value ONLY when it changes externally (prevents caret jumping when typing)
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, [value]);

  const command = (name: string) => {
    ref.current?.focus();
    document.execCommand(name);
    onChange(ref.current?.innerHTML || '');
  };
  
  return (
    <div className="rounded-xl overflow-hidden border border-gray-700 bg-gray-950">
      <div className="flex gap-1 p-2 border-b border-gray-700 bg-gray-900/50">
        <button type="button" onClick={() => command('bold')} className="px-3 py-1 rounded hover:bg-gray-800 font-bold text-gray-200">B</button>
        <button type="button" onClick={() => command('italic')} className="px-3 py-1 rounded hover:bg-gray-800 italic text-gray-200">I</button>
        <button type="button" onClick={() => command('underline')} className="px-3 py-1 rounded hover:bg-gray-800 underline text-gray-200">U</button>
        <button type="button" onClick={() => command('justifyCenter')} className="px-3 py-1 rounded hover:bg-gray-800 text-sm text-gray-200">Căn giữa</button>
        <button type="button" onClick={() => command('insertUnorderedList')} className="px-3 py-1 rounded hover:bg-gray-800 text-sm text-gray-200">• Danh sách</button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(ref.current?.innerHTML || '')}
        className="min-h-36 max-h-[30rem] overflow-y-auto p-3 outline-none text-sm leading-6 text-gray-100 bg-gray-950"
      />
    </div>
  );
}

function SavedArticleTable({ item }: { item: Article }) {
  return (
    <div className="overflow-x-auto border border-gray-800 rounded-xl bg-gray-950">
      <table className="w-full text-sm text-left">
        <thead className="text-gray-400 border-b border-gray-800 bg-gray-900/30">
          <tr>
            <th className="py-3 px-4 w-1/4">Tiêu đề đã lưu</th>
            <th className="py-3 px-4 w-1/4">Mô tả dưới tiêu đề</th>
            <th className="py-3 px-4">Nội dung</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-800 last:border-none">
            <td className="py-3 px-4 font-semibold text-white vertical-align-top">{item.title}</td>
            <td className="py-3 px-4 text-gray-300 vertical-align-top">{item.description || ''}</td>
            <td className="py-3 px-4 text-gray-400">
              <div className="line-clamp-3 text-xs leading-5" dangerouslySetInnerHTML={{ __html: item.content }} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function SavedGuideTable({ steps }: { steps: { title: string; description: string }[] }) {
  return (
    <div className="overflow-x-auto border border-gray-800 rounded-xl bg-gray-950">
      <table className="w-full text-sm text-left">
        <thead className="text-gray-400 border-b border-gray-800 bg-gray-900/30">
          <tr>
            <th className="py-3 px-4 w-1/12 text-center">Bước</th>
            <th className="py-3 px-4 w-1/3">Tiêu đề bước</th>
            <th className="py-3 px-4">Mô tả</th>
          </tr>
        </thead>
        <tbody>
          {steps.map((step, idx) => (
            <tr key={idx} className="border-b border-gray-800 last:border-none">
              <td className="py-3 px-4 text-center text-gray-500 font-bold">#{idx + 1}</td>
              <td className="py-3 px-4 font-semibold text-white">{step.title}</td>
              <td className="py-3 px-4 text-gray-300">{step.description}</td>
            </tr>
          ))}
          {steps.length === 0 && (
            <tr>
              <td colSpan={3} className="py-4 text-center text-gray-500 text-xs">Chưa có bước hướng dẫn nào được lưu.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function SavedContactTable({ item }: { item: Contact }) {
  return (
    <div className="overflow-x-auto border border-gray-800 rounded-xl bg-gray-950">
      <table className="w-full text-sm text-center">
        <thead className="text-gray-400 border-b border-gray-800 bg-gray-900/30">
          <tr>
            <th className="py-3 px-4 text-center">Tiêu đề trang</th>
            <th className="py-3 px-4 text-center">Mô tả dưới tiêu đề</th>
            <th className="py-3 px-4 text-center">Địa chỉ</th>
            <th className="py-3 px-4 text-center">Số điện thoại</th>
            <th className="py-3 px-4 text-center">Email</th>
            <th className="py-3 px-4 text-center">Nội dung chi tiết</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-800 last:border-none">
            <td className="py-3 px-4 font-semibold text-white text-center">{item.title}</td>
            <td className="py-3 px-4 text-gray-300 text-center">{item.description}</td>
            <td className="py-3 px-4 text-gray-300 text-center">{item.address}</td>
            <td className="py-3 px-4 text-gray-300 text-center">{item.phone}</td>
            <td className="py-3 px-4 text-gray-300 text-center">{item.email}</td>
            <td className="py-3 px-4 text-gray-400 text-center">
              <div className="line-clamp-3 text-xs leading-5 mx-auto" dangerouslySetInnerHTML={{ __html: item.content }} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function WebsiteContentAdmin() {
  const [activeTab, setActiveTab] = useState<'faqs' | 'terms' | 'guides' | 'introductions' | 'contacts'>('faqs');
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [faqSettings, setFaqSettings] = useState({ title: 'Câu hỏi thường gặp', description: '' });
  const [terms, setTerms] = useState<Article>({ title: 'Điều khoản dịch vụ', description: '', content: '' });
  const [guide, setGuide] = useState<Article>({ title: 'Hướng dẫn mua hàng', description: '', content: '' });
  const [guideSteps, setGuideSteps] = useState<{ title: string; description: string }[]>([]);
  const [noteTitle, setNoteTitle] = useState('Lưu ý quan trọng');
  const [noteMessage, setNoteMessage] = useState('Nếu có bất kỳ thắc mắc hay gặp lỗi nào về việc mua hàng, vui lòng liên hệ Khóa Học Drive MH qua Zalo:');
  const [noteZalo, setNoteZalo] = useState('0328 028 026');
  const [noteZaloLink, setNoteZaloLink] = useState('https://zalo.me/0328028026');

  const handleSaveGuide = async () => {
    const updatedGuide = {
      ...guide,
      content: JSON.stringify({
        steps: guideSteps,
        note: {
          title: noteTitle.trim(),
          message: noteMessage.trim(),
          zalo: noteZalo.trim(),
          zalo_link: noteZaloLink.trim()
        }
      })
    };
    await save('guides', updatedGuide);
  };

  const getSavedGuideSteps = () => {
    try {
      if (saved.guides?.content) {
        const parsed = JSON.parse(saved.guides.content);
        if (Array.isArray(parsed)) return parsed;
        if (parsed && typeof parsed === 'object') return parsed.steps || [];
      }
    } catch (_) {}
    return guideSteps;
  };
  const [intro, setIntro] = useState<Article>({ title: 'Giới thiệu', description: '', content: '' });
  const [contact, setContact] = useState<Contact>({ title: 'Liên hệ', description: '', address: '', phone: '', email: '', content: '' });
  const [saved, setSaved] = useState<any>({});
  const [savedSection, setSavedSection] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.getAdminWebsiteContent()
      .then(data => {
        const loaded = {
          faqs: data.faqs || [],
          faqSettings: data.faqSettings || { title: 'Câu hỏi thường gặp', description: '' },
          terms: data.terms?.[0] || { title: 'Điều khoản dịch vụ', description: '', content: '' },
          guides: data.guides?.[0] || { title: 'Hướng dẫn mua hàng', description: '', content: '' },
          introductions: data.introductions?.[0] || { title: 'Giới thiệu', description: '', content: '' },
          contacts: data.contacts?.[0] || { title: 'Liên hệ', description: '', address: '', phone: '', email: '', content: '' }
        };
        setSaved(loaded);
        setFaqs(loaded.faqs);
        setFaqSettings(loaded.faqSettings);
        setTerms(loaded.terms);
        const loadedGuide = loaded.guides;
        setGuide(loadedGuide);
        
        let parsedSteps = [];
        let pTitle = 'Lưu ý quan trọng';
        let pMessage = 'Nếu có bất kỳ thắc mắc hay gặp lỗi nào về việc mua hàng, vui lòng liên hệ Khóa Học Drive MH qua Zalo:';
        let pZalo = '0328 028 026';
        let pZaloLink = 'https://zalo.me/0328028026';

        if (loadedGuide && loadedGuide.content) {
          try {
            const parsedData = JSON.parse(loadedGuide.content);
            if (Array.isArray(parsedData)) {
              parsedSteps = parsedData;
            } else if (parsedData && typeof parsedData === 'object') {
              parsedSteps = parsedData.steps || [];
              if (parsedData.note) {
                pTitle = parsedData.note.title || pTitle;
                pMessage = parsedData.note.message || pMessage;
                pZalo = parsedData.note.zalo || pZalo;
                pZaloLink = parsedData.note.zalo_link || pZaloLink;
              }
            }
          } catch (e) {
            parsedSteps = [];
          }
        }
        if (!Array.isArray(parsedSteps) || parsedSteps.length === 0) {
          parsedSteps = [
            { title: "Chọn khóa học", description: "Duyệt qua danh sách các khóa học cá nhân và chọn khóa học mà bạn quan tâm." },
            { title: "Thêm vào giỏ hàng", description: "Nhấp vào nút \"Thêm vào giỏ hàng\" hoặc \"Thanh toán ngay\" nếu bạn muốn mua ngay khóa học đó." },
            { title: "Xem giỏ hàng", description: "Nhấp vào biểu tượng giỏ hàng ở góc trên bên phải màn hình để xem sản phẩm khóa học đã chọn." },
            { title: "Thanh toán", description: "Nhấp vào nút \"Thanh toán ngay\" để tiến hành thanh toán." },
            { title: "Điền thông tin và chọn hình thức thanh toán", description: "Điền đầy đủ thông tin như họ tên, email sử dụng để nhận khóa học (Phải đúng vì nếu sai sẽ không nhận được khóa học), số điện thoại hỗ trợ. Sau đó chọn phương thức thanh toán và làm theo hướng dẫn." },
            { title: "Xác nhận mua hàng", description: "Sau khi thanh toán thành công, bạn sẽ được thêm vào khóa học trong vòng 5 - 10 phút và nhận được email xác nhận (Nếu chưa thấy kiểm tra trong thư rác hoặc spam, nếu chưa thấy hãy liên hệ admin)." },
            { title: "Truy cập khóa học", description: "Bạn có thể truy cập khóa học qua mục thông báo gmail nếu không có thì có thể check thư rác hoặc spam của gmail." }
          ];
        }
        setGuideSteps(parsedSteps);
        setNoteTitle(pTitle);
        setNoteMessage(pMessage);
        setNoteZalo(pZalo);
        setNoteZaloLink(pZaloLink);
        setIntro(loaded.introductions);
        
        setContact({
          title: loaded.contacts.title || 'Liên hệ',
          description: loaded.contacts.description || '',
          address: loaded.contacts.address || '',
          phone: loaded.contacts.phone || '',
          email: loaded.contacts.email || '',
          content: loaded.contacts.content || ''
        });
      })
      .catch(err => setMessage(err.message));
  }, []);

  const save = async (section: string, data: any) => {
    try {
      await api.updateAdminWebsiteContent(section, data);
      setSaved((old: any) => ({ ...old, [section]: data }));
      setSavedSection(section);
      setMessage('');
      // Clear saved banner after 3 seconds
      setTimeout(() => setSavedSection(''), 3000);
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const tabs = [
    { id: 'faqs', label: '❓ Câu hỏi thường gặp' },
    { id: 'terms', label: '📝 Điều khoản dịch vụ' },
    { id: 'guides', label: '🛒 Hướng dẫn mua hàng' },
    { id: 'introductions', label: 'ℹ️ Giới thiệu' },
    { id: 'contacts', label: '📞 Liên hệ' }
  ] as const;

  const articleSection = (heading: string, section: string, value: Article, setValue: (value: Article) => void) => (
    <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-white text-lg">{heading}</h3>
        <button
          onClick={() => save(section, value)}
          className="bg-primary-600 hover:bg-primary-500 transition-colors px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md"
        >
          Lưu thay đổi
        </button>
      </div>
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Tiêu đề trang</label>
            <input
              value={value.title}
              onChange={e => setValue({ ...value, title: e.target.value })}
              placeholder="Tiêu đề trang"
              className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Mô tả dưới tiêu đề</label>
            <textarea
              value={value.description || ''}
              onChange={e => setValue({ ...value, description: e.target.value })}
              placeholder="Mô tả ngắn gọn"
              rows={2}
              className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none transition-colors text-sm resize-y min-h-[50px] max-h-[150px] overflow-y-auto"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Nội dung trang (Định dạng Word)</label>
          <RichEditor value={value.content} onChange={content => setValue({ ...value, content })} />
        </div>
      </div>
      
      <div className="pt-4 border-t border-gray-800/60">
        <h4 className="font-semibold text-white text-sm mb-3">Dữ liệu hiện đang hiển thị ở Client:</h4>
        <SavedArticleTable item={saved[section] || value} />
      </div>
    </section>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Quản lý nội dung Website</h2>
          <p className="text-gray-400 text-sm mt-1">
            Chọn tab tương ứng để chỉnh sửa các phần nội dung của website.
          </p>
        </div>
        {savedSection && (
          <span className="shrink-0 bg-emerald-600/90 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg animate-bounce flex items-center gap-1.5">
            <span>✓</span> Đã lưu thành công
          </span>
        )}
      </div>

      {message && (
        <p className="rounded-xl bg-red-950/80 border border-red-800/80 px-4 py-3 text-red-200 text-sm shadow-md animate-fade-in">
          {message}
        </p>
      )}

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setMessage('');
            }}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'faqs' && (
          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-lg">Bảng câu hỏi thường gặp</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setFaqs(all => [...all, { id: `faq-${Date.now()}`, question: '', answer: '<p></p>', display_order: all.length }])}
                  className="bg-gray-800 hover:bg-gray-700 text-primary-400 hover:text-primary-300 border border-gray-700 transition-colors px-4 py-2.5 rounded-xl text-sm font-bold"
                >
                  + Thêm câu hỏi
                </button>
                <button
                  onClick={() => save('faqs', { list: faqs, settings: faqSettings })}
                  className="bg-primary-600 hover:bg-primary-500 transition-colors px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4 bg-gray-950 p-4 rounded-xl border border-gray-800">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Tiêu đề trang</label>
                  <input
                    value={faqSettings.title}
                    onChange={e => setFaqSettings({ ...faqSettings, title: e.target.value })}
                    placeholder="Tiêu đề trang câu hỏi thường gặp"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:outline-none transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Mô tả dưới tiêu đề</label>
                  <textarea
                    value={faqSettings.description}
                    onChange={e => setFaqSettings({ ...faqSettings, description: e.target.value })}
                    placeholder="Mô tả dưới tiêu đề"
                    rows={2}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:border-primary-500 focus:outline-none transition-colors text-sm resize-y min-h-[50px] max-h-[150px] overflow-y-auto"
                  />
                </div>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {faqs.map((faq, index) => (
                  <div key={faq.id} className="rounded-2xl bg-gray-950 border border-gray-800 p-4 space-y-3 relative group">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 font-bold text-sm">#{index + 1}</span>
                      <textarea
                        value={faq.question}
                        onChange={e => setFaqs(all => all.map((x, i) => i === index ? { ...x, question: e.target.value } : x))}
                        placeholder="Câu hỏi thường gặp"
                        rows={1}
                        className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-primary-500 focus:outline-none text-sm transition-colors resize-y min-h-[40px] max-h-[100px] overflow-y-auto leading-normal"
                      />
                      <button
                        onClick={() => setFaqs(all => all.filter((_, i) => i !== index))}
                        className="text-red-400 hover:text-red-300 text-xs font-bold px-2 py-1 rounded hover:bg-red-950/30 transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                    <RichEditor
                      value={faq.answer}
                      onChange={answer => setFaqs(all => all.map((x, i) => i === index ? { ...x, answer } : x))}
                    />
                  </div>
                ))}
                {faqs.length === 0 && (
                  <p className="text-center text-gray-500 py-8 text-sm bg-gray-950 rounded-xl border border-gray-800">
                    Chưa có câu hỏi thường gặp nào được thêm. Bấm nút Thêm câu hỏi ở trên.
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800/60">
              <h4 className="font-semibold text-white text-sm mb-3">Dữ liệu hiện đang hiển thị ở Client:</h4>
              <div className="mb-4 p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cấu hình trang:</p>
                <p className="text-sm font-semibold text-white">Tiêu đề: {saved.faqSettings?.title || faqSettings.title}</p>
                <p className="text-xs text-gray-400">Mô tả: {saved.faqSettings?.description || faqSettings.description}</p>
              </div>
              <div className="overflow-x-auto border border-gray-800 rounded-xl bg-gray-950">
                <table className="w-full text-sm text-left">
                  <thead className="text-gray-400 border-b border-gray-800 bg-gray-900/30">
                    <tr>
                      <th className="py-3 px-4 w-1/3">Câu hỏi đã lưu</th>
                      <th className="py-3 px-4">Giải thích</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(saved.faqs || []).map((f: Faq) => (
                      <tr key={f.id} className="border-b border-gray-800 last:border-none">
                        <td className="py-3 px-4 text-white font-medium vertical-align-top">{f.question}</td>
                        <td className="py-3 px-4 text-gray-400">
                          <div className="line-clamp-2 text-xs leading-5" dangerouslySetInnerHTML={{ __html: f.answer }} />
                        </td>
                      </tr>
                    ))}
                    {(!saved.faqs || saved.faqs.length === 0) && (
                      <tr>
                        <td colSpan={2} className="py-4 text-center text-gray-500 text-xs">Chưa có câu hỏi nào được lưu.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'terms' && articleSection('Bảng điều khoản dịch vụ', 'terms', terms, setTerms)}
        
        {activeTab === 'guides' && (
          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-lg">Thiết lập các bước hướng dẫn mua hàng</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setGuideSteps(all => [...all, { title: '', description: '' }])}
                  className="bg-gray-800 hover:bg-gray-700 text-primary-400 hover:text-primary-300 border border-gray-700 transition-colors px-4 py-2.5 rounded-xl text-sm font-bold"
                >
                  + Thêm bước
                </button>
                <button
                  onClick={handleSaveGuide}
                  className="bg-primary-600 hover:bg-primary-500 transition-colors px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4 bg-gray-950 p-4 rounded-xl border border-gray-800">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Tiêu đề trang</label>
                  <input
                    value={guide.title}
                    onChange={e => setGuide({ ...guide, title: e.target.value })}
                    placeholder="Tiêu đề trang hướng dẫn"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:outline-none transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Mô tả dưới tiêu đề</label>
                  <textarea
                    value={guide.description || ''}
                    onChange={e => setGuide({ ...guide, description: e.target.value })}
                    placeholder="Mô tả dưới tiêu đề"
                    rows={2}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:border-primary-500 focus:outline-none transition-colors text-sm resize-y min-h-[50px] max-h-[150px] overflow-y-auto"
                  />
                </div>
              </div>

              {/* Important Note Editor */}
              <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-4">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">⚠️ Thiết lập Lưu ý quan trọng (Thông tin hỗ trợ Zalo)</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Tiêu đề Lưu ý</label>
                    <input
                      value={noteTitle}
                      onChange={e => setNoteTitle(e.target.value)}
                      placeholder="Ví dụ: Lưu ý quan trọng"
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none text-sm transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Nội dung text</label>
                    <textarea
                      value={noteMessage}
                      onChange={e => setNoteMessage(e.target.value)}
                      placeholder="Ví dụ: Nếu có bất kỳ thắc mắc..."
                      rows={2}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:border-primary-500 focus:outline-none text-sm transition-colors resize-y min-h-[50px] max-h-[150px] overflow-y-auto"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Số điện thoại / Chữ hiển thị Link Zalo</label>
                    <input
                      value={noteZalo}
                      onChange={e => setNoteZalo(e.target.value)}
                      placeholder="Ví dụ: 0328 028 026"
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none text-sm transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Đường dẫn Link Zalo (zalo.me/xxx)</label>
                    <input
                      value={noteZaloLink}
                      onChange={e => setNoteZaloLink(e.target.value)}
                      placeholder="Ví dụ: https://zalo.me/0328028026"
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none text-sm transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mt-2">📋 Các bước hướng dẫn chi tiết</h4>
                {guideSteps.map((step, index) => (
                  <div key={index} className="rounded-2xl bg-gray-950 border border-gray-800 p-4 space-y-3 relative group">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 font-bold text-sm">Bước #{index + 1}</span>
                      <input
                        value={step.title}
                        onChange={e => setGuideSteps(all => all.map((x, i) => i === index ? { ...x, title: e.target.value } : x))}
                        placeholder="Tiêu đề bước (Ví dụ: Chọn khóa học)"
                        className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-primary-500 focus:outline-none text-sm transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setGuideSteps(all => all.filter((_, i) => i !== index))}
                        className="text-red-400 hover:text-red-300 text-xs font-bold px-2 py-1 rounded bg-red-950/20 transition"
                      >
                        Xóa
                      </button>
                    </div>
                    <textarea
                      value={step.description}
                      onChange={e => setGuideSteps(all => all.map((x, i) => i === index ? { ...x, description: e.target.value } : x))}
                      placeholder="Mô tả hướng dẫn chi tiết cho bước này..."
                      rows={2}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-primary-500 focus:outline-none text-sm transition-colors resize-y max-h-[150px] overflow-y-auto leading-relaxed"
                    />
                  </div>
                ))}
                {guideSteps.length === 0 && (
                  <p className="text-center py-6 text-gray-500 text-xs">Chưa thiết lập bước hướng dẫn nào. Hãy nhấn &quot;+ Thêm bước&quot; để bắt đầu.</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800/60">
              <h4 className="font-semibold text-white text-sm mb-3">Dữ liệu hiện đang hiển thị ở Client:</h4>
              <SavedGuideTable steps={getSavedGuideSteps()} />
            </div>
          </section>
        )}

        {activeTab === 'introductions' && articleSection('Bảng giới thiệu', 'introductions', intro, setIntro)}

        {activeTab === 'contacts' && (
          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-lg">Bảng thông tin liên hệ</h3>
              <button
                onClick={() => save('contacts', contact)}
                className="bg-primary-600 hover:bg-primary-500 transition-colors px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md"
              >
                Lưu thay đổi
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Tiêu đề trang</label>
                  <input
                    value={contact.title}
                    onChange={e => setContact({ ...contact, title: e.target.value })}
                    placeholder="Tiêu đề trang liên hệ"
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Mô tả dưới tiêu đề</label>
                  <textarea
                    value={contact.description || ''}
                    onChange={e => setContact({ ...contact, description: e.target.value })}
                    placeholder="Mô tả dưới tiêu đề"
                    rows={2}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none transition-colors text-sm resize-y min-h-[50px] max-h-[150px] overflow-y-auto"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Địa chỉ (Hiện ở footer)</label>
                  <textarea
                    value={contact.address}
                    onChange={e => setContact({ ...contact, address: e.target.value })}
                    placeholder="Địa chỉ liên hệ"
                    rows={2}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2 text-white focus:border-primary-500 focus:outline-none transition-colors text-sm resize-y min-h-[50px] max-h-[150px] overflow-y-auto"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Số điện thoại (Hiện ở footer)</label>
                  <input
                    value={contact.phone}
                    onChange={e => setContact({ ...contact, phone: e.target.value })}
                    placeholder="Số điện thoại"
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Email (Hiện ở footer)</label>
                  <input
                    value={contact.email}
                    onChange={e => setContact({ ...contact, email: e.target.value })}
                    placeholder="Email liên hệ"
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Nội dung trang Liên hệ (Định dạng Word)</label>
                <RichEditor
                  value={contact.content}
                  onChange={content => setContact({ ...contact, content })}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800/60">
              <h4 className="font-semibold text-white text-sm mb-3">Dữ liệu hiện đang hiển thị ở Client:</h4>
              <SavedContactTable item={saved.contacts || contact} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
