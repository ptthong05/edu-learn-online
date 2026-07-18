'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AffiliateGuide } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { api } from '@/lib/utils/api';
import toast from 'react-hot-toast';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const richTextModules = {
  toolbar: {
    container: [
      [{ header: [1, 2, 3, false] }],
      [{ font: [] }, { size: [] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ align: [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean'],
    ],
  },
};

const richTextFormats = [
  'header', 'font', 'size', 'bold', 'italic', 'underline', 'strike',
  'color', 'background', 'script', 'list', 'bullet', 'indent', 'align',
  'blockquote', 'code-block', 'link', 'image', 'video',
];

export default function AdminAffiliateGuides() {
  const [activeTab, setActiveTab] = useState<'guides' | 'terms'>('guides');
  const [guides, setGuides] = useState<AffiliateGuide[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editGuide, setEditGuide] = useState<AffiliateGuide | null>(null);

  // Form states (Guides)
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);

  // Terms States
  const [terms, setTerms] = useState('');
  const [termsLoading, setTermsLoading] = useState(false);
  const [savingTerms, setSavingTerms] = useState(false);

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminAffiliateGuides();
      setGuides(data || []);
    } catch (error: any) {
      console.error('Failed to load guides:', error);
      toast.error('Lỗi khi tải tài liệu hướng dẫn.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTerms = async () => {
    setTermsLoading(true);
    try {
      const res = await api.getAdminAffiliateTerms();
      setTerms(res?.terms || '');
    } catch (error: any) {
      console.error('Failed to load terms:', error);
      toast.error('Lỗi khi tải điều khoản.');
    } finally {
      setTermsLoading(false);
    }
  };

  useEffect(() => {
    void fetchGuides();
    void fetchTerms();
  }, []);

  const openAddModal = () => {
    setEditGuide(null);
    setTitle('');
    setContent('');
    setDisplayOrder(guides.length + 1);
    setIsOpen(true);
  };

  const openEditModal = (g: AffiliateGuide) => {
    setEditGuide(g);
    setTitle(g.title);
    setContent(g.content);
    setDisplayOrder(g.display_order);
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung.');
      return;
    }

    try {
      if (editGuide) {
        await api.updateAdminAffiliateGuide(editGuide.id, {
          title: title.trim(),
          content: content.trim(),
          display_order: displayOrder
        });
        toast.success('Cập nhật tài liệu thành công!');
      } else {
        await api.createAdminAffiliateGuide({
          title: title.trim(),
          content: content.trim(),
          display_order: displayOrder
        });
        toast.success('Thêm tài liệu hướng dẫn thành công!');
      }
      setIsOpen(false);
      void fetchGuides();
    } catch (error: any) {
      console.error('Failed to save guide:', error);
      toast.error(error.message || 'Lỗi lưu thông tin.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn chắc chắn muốn xóa tài liệu hướng dẫn này?')) {
      try {
        await api.deleteAdminAffiliateGuide(id);
        toast.success('Xóa tài liệu thành công!');
        void fetchGuides();
      } catch (error: any) {
        console.error('Failed to delete guide:', error);
        toast.error('Lỗi khi xóa tài liệu.');
      }
    }
  };

  const handleSaveTerms = async () => {
    setSavingTerms(true);
    try {
      await api.updateAdminAffiliateTerms(terms);
      toast.success('Cập nhật điều khoản thành công!');
    } catch (error: any) {
      console.error('Failed to save terms:', error);
      toast.error(error.message || 'Lỗi lưu điều khoản.');
    } finally {
      setSavingTerms(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Injecting custom CSS to style the rich text editor inside dark theme modals */}
      <style dangerouslySetInnerHTML={{ __html: `
        .dark-rich-editor .ql-toolbar {
          background-color: #111827 !important;
          border-color: #374151 !important;
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
        }
        .dark-rich-editor .ql-container {
          background-color: #030712 !important;
          border-color: #374151 !important;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          min-height: 350px;
        }
        .dark-rich-editor .ql-stroke {
          stroke: #9ca3af !important;
        }
        .dark-rich-editor .ql-fill {
          fill: #9ca3af !important;
        }
        .dark-rich-editor .ql-picker {
          color: #9ca3af !important;
        }
        .dark-rich-editor .ql-editor {
          min-height: 350px;
          max-height: 500px;
          overflow-y: auto;
          color: #f3f4f6 !important;
          font-size: 0.875rem;
        }
        .dark-rich-editor .ql-editor.ql-blank::before {
          color: #6b7280 !important;
          font-style: normal;
        }
      `}} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wider">Cấu Hình Tiếp Thị Liên Kết</h2>
          <p className="text-gray-400 text-sm">Cài đặt tài liệu hướng dẫn và điều khoản dịch vụ cho chương trình CTV.</p>
        </div>
      </div>

      {/* Tab navigation headers */}
      <div className="flex border-b border-gray-800 gap-6">
        <button
          onClick={() => setActiveTab('guides')}
          className={`pb-3 text-sm font-bold tracking-wider transition-all border-b-2 ${
            activeTab === 'guides' ? 'border-primary-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
        >
          TÀI LIỆU HƯỚNG DẪN
        </button>
        <button
          onClick={() => setActiveTab('terms')}
          className={`pb-3 text-sm font-bold tracking-wider transition-all border-b-2 ${
            activeTab === 'terms' ? 'border-primary-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
        >
          ĐIỀU KHOẢN ĐĂNG KÝ CTV
        </button>
      </div>

      {activeTab === 'guides' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Danh sách hướng dẫn</h3>
            <Button onClick={openAddModal}>+ Thêm Tài Liệu</Button>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-950 border-b border-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="p-4 w-16 text-center">Thứ tự</th>
                  <th className="p-4 w-1/3">Tiêu đề tài liệu</th>
                  <th className="p-4">Nội dung tóm tắt</th>
                  <th className="p-4 w-32">Ngày tạo</th>
                  <th className="p-4 w-32 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">Đang tải danh sách tài liệu...</td>
                  </tr>
                ) : guides.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">Chưa có tài liệu hướng dẫn nào.</td>
                  </tr>
                ) : (
                  guides.map(g => (
                    <tr key={g.id} className="hover:bg-gray-950/40 transition-all">
                      <td className="p-4 text-center font-bold text-primary-400">
                        <Badge variant="blue">{g.display_order}</Badge>
                      </td>
                      <td className="p-4 font-bold text-white tracking-wider">{g.title}</td>
                      <td className="p-4 text-gray-400 max-w-md truncate">
                        {g.content.replace(/<[^>]*>/g, '')}
                      </td>
                      <td className="p-4 text-gray-500">{new Date(g.created_at).toLocaleDateString('vi-VN')}</td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button onClick={() => openEditModal(g)} className="p-1.5 hover:bg-white/5 rounded-lg text-primary-400 transition-all">
                          Sửa
                        </button>
                        <button onClick={() => handleDelete(g.id)} className="p-1.5 hover:bg-white/5 rounded-lg text-red-500 transition-all">
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editGuide ? 'Sửa Tài Liệu Hướng Dẫn' : 'Thêm Tài Liệu Mới'} size="xl">
            <div className="space-y-4">
              <Input label="Tiêu đề tài liệu" placeholder="Ví dụ: Quy định hoa hồng..." value={title} onChange={e => setTitle(e.target.value)} />
              
              <div className="space-y-2 dark-rich-editor">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Nội dung hướng dẫn</label>
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={richTextModules}
                  formats={richTextFormats}
                  placeholder="Nhập nội dung hướng dẫn tiếp thị tại đây..."
                />
              </div>

              <Input label="Thứ tự hiển thị" type="number" value={displayOrder} onChange={e => setDisplayOrder(Number(e.target.value))} />

              <Button fullWidth onClick={handleSave}>Lưu thông tin</Button>
            </div>
          </Modal>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Cấu hình điều khoản dịch vụ đăng ký CTV</h3>
            <p className="text-gray-400 text-sm">Nội dung này hiển thị trực tiếp khi CTV bấm xem điều khoản đăng ký.</p>
          </div>

          {termsLoading ? (
            <div className="py-12 text-center text-gray-500">Đang tải nội dung điều khoản...</div>
          ) : (
            <div className="space-y-4">
              <div className="dark-rich-editor">
                <ReactQuill
                  theme="snow"
                  value={terms}
                  onChange={setTerms}
                  modules={richTextModules}
                  formats={richTextFormats}
                  placeholder="Nhập nội dung điều khoản đăng ký..."
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleSaveTerms} disabled={savingTerms}>
                  {savingTerms ? 'Đang lưu...' : 'Lưu điều khoản'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
