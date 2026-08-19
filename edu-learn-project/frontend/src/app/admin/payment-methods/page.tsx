'use client';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Badge from '@/components/ui/Badge';
import { getAuthToken } from '@/lib/utils/auth';

interface PaymentMethod {
  id: string;
  method_key: string;
  method_name: string;
  icon: string | null;
  description: string | null;
  account_number: string | null;
  account_holder: string | null;
  bank_name: string | null;
  bank_code?: string | null;
  qr_code_image: string | null;
  phone_number: string | null;
  is_active: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState({
    method_key: '',
    method_name: '',
    icon: '🏦',
    description: '',
    account_number: '',
    account_holder: '',
    bank_name: '',
    bank_code: '',
    qr_code_image: '',
    phone_number: '',
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('http://localhost:5000/api/admin/payment-methods', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setMethods(data);
    } catch (error) {
      toast.error('Không thể tải danh sách phương thức thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      const url = editingMethod
        ? `http://localhost:5000/api/admin/payment-methods/${editingMethod.id}`
        : 'http://localhost:5000/api/admin/payment-methods';
      
      const method = editingMethod ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to save');

      toast.success(editingMethod ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
      setShowModal(false);
      setEditingMethod(null);
      setFormData({
        method_key: '',
        method_name: '',
        icon: '',
        description: '',
        account_number: '',
        account_holder: '',
        bank_name: '',
        bank_code: '',
        qr_code_image: '',
        phone_number: '',
        is_active: true,
        display_order: 0,
      });
      fetchMethods();
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      method_key: method.method_key,
      method_name: method.method_name,
      icon: method.icon || '',
      description: method.description || '',
      account_number: method.account_number || method.phone_number || '0377987457',
      account_holder: method.account_holder || 'Phạm Tấn Thông',
      bank_name: method.bank_name || '',
      bank_code: method.bank_code || '',
      qr_code_image: method.qr_code_image || '',
      phone_number: method.phone_number || '',
      is_active: Boolean(method.is_active),
      display_order: method.display_order,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa phương thức thanh toán này?')) return;
    
    try {
      const token = getAuthToken();
      const response = await fetch(`http://localhost:5000/api/admin/payment-methods/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete');
      toast.success('Xóa thành công!');
      fetchMethods();
    } catch (error) {
      toast.error('Không thể xóa phương thức thanh toán');
    }
  };

  const openCreateModal = () => {
    setEditingMethod(null);
    setFormData({
      method_key: '',
      method_name: '',
      icon: '',
      description: '',
      account_number: '',
      account_holder: '',
      bank_name: '',
      bank_code: '',
      qr_code_image: '',
      phone_number: '',
      is_active: true,
      display_order: methods.length,
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-gray-400 text-sm">Quản lý thông tin tài khoản ngân hàng và phương thức nhận thanh toán của khách hàng. Hệ thống sẽ tự động tạo mã QR tương ứng.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-primary-600 hover:bg-primary-500 transition-colors px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md"
        >
          + Thêm phương thức
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-950 border-b border-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="p-4">Thứ tự</th>
                  <th className="p-4">Icon</th>
                  <th className="p-4">Tên</th>
                  <th className="p-4">Mã</th>
                  <th className="p-4">Ngân hàng / Loại ví</th>
                  <th className="p-4">Số TK / ĐT</th>
                  <th className="p-4">Chủ tài khoản</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-sm">
                {methods.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-500">
                      Chưa có phương thức thanh toán nào.
                    </td>
                  </tr>
                ) : (
                  methods.map((method) => (
                    <tr key={method.id} className="hover:bg-gray-950/40 transition-all">
                      <td className="p-4 font-bold text-white">
                        {method.display_order}
                      </td>
                      <td className="p-4 text-2xl">
                        {method.icon || '💰'}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-gray-200">{method.method_name}</div>
                        <div className="text-xs text-gray-500">{method.description}</div>
                      </td>
                      <td className="p-4 text-gray-300 font-mono">
                        {method.method_key}
                      </td>
                      <td className="p-4 text-gray-300">
                        {method.bank_name || (method.method_key === 'momo' ? 'Ví MoMo' : '-')}
                      </td>
                      <td className="p-4 text-gray-350">
                        {method.account_number || method.phone_number || '-'}
                      </td>
                      <td className="p-4 text-gray-300">
                        {method.account_holder || '-'}
                      </td>
                      <td className="p-4">
                        {method.is_active ? (
                          <Badge variant="green">Hoạt động</Badge>
                        ) : (
                          <Badge variant="red">Ẩn</Badge>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(method)}
                          className="px-2.5 py-1 text-xs font-bold bg-primary-950 text-primary-400 rounded-lg border border-primary-500/20 hover:bg-primary-900/40 transition-all"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(method.id)}
                          className="px-2.5 py-1 text-xs font-bold bg-red-950 text-red-400 rounded-lg border border-red-500/20 hover:bg-red-900/40 transition-all"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-gray-800 pb-4">
                {editingMethod ? '✏️ Chỉnh sửa phương thức' : '➕ Thêm phương thức thanh toán'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                      Mã phương thức *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.method_key}
                      onChange={(e) => setFormData({ ...formData, method_key: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none transition-colors text-sm"
                      placeholder="momo, banking, qr_banking..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                      Tên hiển thị *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.method_name}
                      onChange={(e) => setFormData({ ...formData, method_name: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none transition-colors text-sm"
                      placeholder="Ví MoMo, Thẻ ATM..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                    Chọn Icon
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {['🏦', '💳', '💰', '📱', '🏧', '💵', '🎯', '✅'].map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`text-2xl p-3 rounded-xl border-2 transition-all ${
                          formData.icon === icon
                            ? 'border-primary-500 bg-primary-950/50 scale-110'
                            : 'border-gray-700 hover:border-gray-600 bg-gray-950'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                    Mô tả
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none transition-colors text-sm"
                    placeholder="Thanh toán nhanh qua MoMo"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                    Số tài khoản
                  </label>
                  <input
                    type="text"
                    value={formData.account_number}
                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none transition-colors text-sm"
                    placeholder="0377987457"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                    Chủ tài khoản *
                  </label>
                  <input
                    type="text"
                    value={formData.account_holder}
                    onChange={(e) => setFormData({ ...formData, account_holder: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none transition-colors text-sm"
                    placeholder="Phạm Tấn Thông"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                    Tên ngân hàng (hoặc mã ngân hàng cho VietQR, ví dụ: MB, VCB, TCB)
                  </label>
                  <input
                    type="text"
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none transition-colors text-sm"
                    placeholder="MB Bank"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                      Thứ tự hiển thị
                    </label>
                    <input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                      Trạng thái
                    </label>
                    <select
                      value={formData.is_active ? '1' : '0'}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.value === '1' })}
                      className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none transition-colors text-sm cursor-pointer"
                    >
                      <option value="1" className="bg-gray-950 text-gray-300">Hoạt động</option>
                      <option value="0" className="bg-gray-950 text-gray-300">Ẩn</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-800 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingMethod(null);
                    }}
                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="bg-primary-600 hover:bg-primary-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-md"
                  >
                    {editingMethod ? 'Lưu cập nhật' : 'Tạo mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}