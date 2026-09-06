'use client';
import React, { useState, useEffect } from 'react';
import { Coupon } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { api } from '@/lib/utils/api';
import toast from 'react-hot-toast';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [couponCodeFilter, setCouponCodeFilter] = useState('');

  // Form states
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [expiredDate, setExpiredDate] = useState('2026-12-31');
  const [usableBy, setUsableBy] = useState<'user' | 'affiliate'>('user');
  const [description, setDescription] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('0');
  const [minOrderAmount, setMinOrderAmount] = useState('0');

  const fetchCoupons = () => {
    api.getAdminCoupons()
      .then(setCoupons)
      .catch(err => {
        console.error(err);
        toast.error('Lỗi khi tải danh sách mã giảm giá.');
      });
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openAddModal = () => {
    setEditCoupon(null);
    setCode('');
    setDiscount(10);
    setQuantity(100);
    setExpiredDate('2026-12-31');
    setUsableBy('user');
    setDescription('');
    setMaxDiscount('');
    setMinOrderAmount('');
    setIsOpen(true);
  };

  const openEditModal = (c: Coupon) => {
    setEditCoupon(c);
    setCode(c.code);
    setDiscount(c.discount);
    setQuantity(c.quantity);
    setExpiredDate(c.expired_date);
    setUsableBy(c.usable_by || 'user');
    setDescription(c.description || '');
    setMaxDiscount(c.max_discount ? c.max_discount.toString() : '0');
    setMinOrderAmount(c.min_order_amount ? c.min_order_amount.toString() : '0');
    setIsOpen(true);
  };

  const handleSave = async () => {
    try {
      // Parse maxDiscount from formatted string (remove dots) to number
      const maxDiscountValue = maxDiscount.replace(/\./g, '');
      const minOrderAmountValue = minOrderAmount.replace(/\./g, '');
      
      if (editCoupon) {
        const res = await api.updateAdminCoupon(editCoupon.id, {
          code: code.toUpperCase(),
          discount,
          quantity,
          expired_date: expiredDate,
          usable_by: usableBy,
          description,
          max_discount: Number(maxDiscountValue) || 0,
          min_order_amount: Number(minOrderAmountValue) || 0
        });
        toast.success(res.message || 'Cập nhật mã giảm giá thành công.');
      } else {
        const res = await api.createAdminCoupon({
          code: code.toUpperCase(),
          discount,
          quantity,
          expired_date: expiredDate,
          usable_by: usableBy,
          description,
          discount_type: 'percent',
          status: 'active',
          max_discount: Number(maxDiscountValue) || 0,
          min_order_amount: Number(minOrderAmountValue) || 0
        });
        toast.success(res.message || 'Tạo mã giảm giá thành công.');
      }
      fetchCoupons();
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Đã xảy ra lỗi.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn chắc chắn muốn xóa coupon này?')) {
      try {
        const res = await api.deleteAdminCoupon(id);
        toast.success(res.message || 'Xóa mã giảm giá thành công.');
        fetchCoupons();
      } catch (err: any) {
        toast.error(err.message || 'Không thể xóa mã giảm giá.');
      }
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const c = coupons.find(item => item.id === id);
      if (!c) return;
      const newStatus = c.status === 'active' ? 'inactive' : 'active';
      const res = await api.updateAdminCoupon(id, { status: newStatus });
      toast.success(res.message || 'Cập nhật trạng thái thành công.');
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || 'Không thể thay đổi trạng thái.');
    }
  };

  const filteredCoupons = coupons.filter(c => {
    const q = couponCodeFilter.toLowerCase().trim();
    return c.code.toLowerCase().includes(q) || 
           (c.description || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wider">Mã Giảm Giá</h2>
          <p className="text-gray-400 text-sm">Quản lý mã giảm giá Coupon của hệ thống.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            placeholder="Lọc theo mã giảm giá..."
            value={couponCodeFilter}
            onChange={(e) => setCouponCodeFilter(e.target.value)}
            className="bg-gray-950 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm focus:border-primary-500 focus:outline-none placeholder-gray-500 min-w-56"
          />
          <Button onClick={openAddModal}>+ Thêm Coupon</Button>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-950 border-b border-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <th className="p-4">Mã Coupon / Mô tả</th>
              <th className="p-4">Đối tượng</th>
              <th className="p-4">Mức giảm (%)</th>
              <th className="p-4">Giảm tối đa</th>
              <th className="p-4">Đơn hàng tối thiểu</th>
              <th className="p-4">Đã dùng / Số lượng</th>
              <th className="p-4">Ngày hết hạn</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 text-sm">
            {filteredCoupons.length === 0 ? (
              <tr><td colSpan={9} className="p-8 text-center text-gray-500">{couponCodeFilter.trim() ? 'Không tìm thấy mã giảm giá nào khớp bộ lọc.' : 'Chưa có mã giảm giá nào.'}</td></tr>
            ) : (
              filteredCoupons.map(c => (
              <tr key={c.id} className="hover:bg-gray-950/40 transition-all">
                <td className="p-4 font-bold text-white tracking-wider">
                  <div>{c.code}</div>
                  <div className="text-xs text-gray-400 font-normal mt-0.5">{c.description || 'Chưa có mô tả'}</div>
                </td>
                <td className="p-4">
                  {c.usable_by === 'affiliate' ? (
                    <Badge variant="purple">Đối tác CTV</Badge>
                  ) : (
                    <Badge variant="blue">Khách hàng</Badge>
                  )}
                </td>
                <td className="p-4 text-primary-400 font-bold">-{c.discount}%</td>
                <td className="p-4 text-gray-300">
                  {c.max_discount && c.max_discount > 0 ? c.max_discount.toLocaleString('vi-VN') + 'đ' : 'Không giới hạn'}
                </td>
                <td className="p-4 text-gray-300">
                  {c.min_order_amount && c.min_order_amount > 0 ? c.min_order_amount.toLocaleString('vi-VN') + 'đ' : 'Không yêu cầu'}
                </td>
                <td className="p-4 text-gray-300">
                  {c.used_count} / {c.quantity} lượt
                </td>
                <td className="p-4 text-gray-500">{c.expired_date}</td>
                <td className="p-4">
                  <button onClick={() => toggleStatus(c.id)}>
                    {c.status === 'active' ? (
                      <Badge variant="green">Đang mở</Badge>
                    ) : (
                      <Badge variant="gray">Đã tắt</Badge>
                    )}
                  </button>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => openEditModal(c)} className="p-1.5 hover:bg-white/5 rounded-lg text-primary-400 transition-all">
                    Sửa
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-white/5 rounded-lg text-red-500 transition-all">
                    Xóa
                  </button>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editCoupon ? 'Sửa Coupon' : 'Thêm Coupon mới'}>
        <div className="space-y-4">
          <Input label="Mã ưu đãi (viết liền, hoa)" placeholder="Ví dụ: SALE50" value={code} onChange={e => setCode(e.target.value)} />
          
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Đối tượng sử dụng</label>
            <select 
              value={usableBy} 
              onChange={e => setUsableBy(e.target.value as 'user' | 'affiliate')}
              className="w-full px-3 py-2 bg-gray-950 border border-gray-800 text-sm text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="user">Khách hàng (User)</option>
              <option value="affiliate">Đối tác CTV (Affiliate)</option>
            </select>
          </div>

          <Input label="Mô tả mã giảm giá" placeholder="Ví dụ: Giảm giá 30% cho khách hàng mới..." value={description} onChange={e => setDescription(e.target.value)} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Tỷ lệ giảm (%)" type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} />
            <Input label="Tổng số lượt dùng" type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
          </div>
          
          <Input 
            label="Giảm tối đa (VNĐ)" 
            type="text"
            placeholder="Ví dụ: 100.000 (để 0 nếu không giới hạn)"
            value={maxDiscount} 
            onChange={e => {
              // Remove all non-numeric characters
              const value = e.target.value.replace(/[^0-9]/g, '');
              // If empty or 0, set to empty string (don't show 0)
              if (!value || value === '0') {
                setMaxDiscount('');
                return;
              }
              // Format with dots as thousand separators
              const formatted = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
              setMaxDiscount(formatted);
            }} 
          />

          <Input 
            label="Đơn hàng tối thiểu (VNĐ)" 
            type="text"
            placeholder="Ví dụ: 500.000 (để 0 nếu không yêu cầu)"
            value={minOrderAmount} 
            onChange={e => {
              // Remove all non-numeric characters
              const value = e.target.value.replace(/[^0-9]/g, '');
              // If empty or 0, set to empty string (don't show 0)
              if (!value || value === '0') {
                setMinOrderAmount('');
                return;
              }
              // Format with dots as thousand separators
              const formatted = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
              setMinOrderAmount(formatted);
            }} 
          />

          <Input label="Ngày hết hạn" type="date" value={expiredDate} onChange={e => setExpiredDate(e.target.value)} />
          
          <Button fullWidth onClick={handleSave}>Lưu thông tin</Button>
        </div>
      </Modal>
    </div>
  );
}
