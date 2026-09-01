'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { formatPrice } from '@/lib/utils/helpers';
import Badge from '@/components/ui/Badge';
import { api } from '@/lib/utils/api';
import Pagination from '@/components/ui/Pagination';

interface AdminOrder {
  id: string;
  full_name: string;
  email: string;
  total: number;
  payment_method: string;
  product_names: string | null;
  status: 'pending' | 'completed' | 'cancelled';
  payment_status?: string;
  created_at: string;
  payment_proof?: string | null;
  payment_qr_content?: string | null;
  phone?: string;
}

type TabType = 'orders' | 'payments';

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [orderTypeFilter, setOrderTypeFilter] = useState<'all' | 'ctv' | 'ord'>('all');
  const [orderIdFilter, setOrderIdFilter] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ORDERS_PER_PAGE = 10;

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const idUpper = order.id.toUpperCase();
      const matchesType = orderTypeFilter === 'ctv' ? idUpper.startsWith('CTV') : (orderTypeFilter === 'ord' ? idUpper.startsWith('ORD') : true);
      const q = orderIdFilter.toLowerCase().trim();
      if (!q) return matchesType;
      const matchesId = idUpper.includes(q.toUpperCase());
      const matchesName = (order.full_name || '').toLowerCase().includes(q);
      const matchesEmail = (order.email || '').toLowerCase().includes(q);
      const matchesProducts = (order.product_names || '').toLowerCase().includes(q);
      return matchesType && (matchesId || matchesName || matchesEmail || matchesProducts);
    });
  }, [orders, orderTypeFilter, orderIdFilter]);

  // Filter orders for payment verification tab
  const paymentVerificationOrders = useMemo(() => {
    return filteredOrders.filter(order => order.payment_proof && order.payment_status === 'chua_thanh_toan');
  }, [filteredOrders]);

  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const visibleOrders = filteredOrders.slice((currentPage - 1) * ORDERS_PER_PAGE, currentPage * ORDERS_PER_PAGE);
  
  const paymentTotalPages = Math.ceil(paymentVerificationOrders.length / ORDERS_PER_PAGE);
  const paymentVisibleOrders = paymentVerificationOrders.slice((currentPage - 1) * ORDERS_PER_PAGE, currentPage * ORDERS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredOrders.length, activeTab]);

  useEffect(() => {
    api.getAdminOrders()
      .then(setOrders)
      .catch(error => console.error('Không thể tải đơn hàng:', error));
  }, []);

  const updateStatus = async (id: string, status: 'completed' | 'cancelled') => {
    try {
      const res = await api.updateAdminOrderStatus(id, status);
      setOrders(prev => prev.map(order => order.id === id ? { 
        ...order, 
        status, 
        payment_status: res?.payment_status || (status === 'completed' ? 'da_thanh_toan' : 'chua_thanh_toan')
      } : order));
    } catch (error) {
      console.error('Không thể cập nhật đơn hàng:', error);
      alert('Không thể cập nhật trạng thái đơn hàng.');
    }
  };

  const quickApprovePayment = async (id: string) => {
    if (!confirm('Xác nhận duyệt nhanh thanh toán này? Đơn hàng sẽ được chuyển sang trạng thái "Đã thanh toán" và "Đã xong".')) {
      return;
    }
    try {
      // Single atomic API call to approve both payment and completion
      const res = await api.updateAdminOrderStatus(id, 'completed');
      setOrders(prev => prev.map(order => order.id === id ? { 
        ...order, 
        payment_status: res?.payment_status || 'da_thanh_toan', 
        status: 'completed' 
      } : order));
      alert('Đã duyệt thanh toán và cập nhật đơn hàng thành công!');
    } catch (error) {
      console.error('Không thể duyệt thanh toán:', error);
      alert('Không thể duyệt thanh toán.');
    }
  };

  const rejectPayment = async (id: string) => {
    if (!confirm('Xác nhận hủy đơn hàng này? Đơn hàng sẽ bị hủy.')) {
      return;
    }
    try {
      const res = await api.updateAdminOrderStatus(id, 'cancelled');
      setOrders(prev => prev.map(order => order.id === id ? { 
        ...order, 
        status: 'cancelled',
        payment_status: res?.payment_status || 'chua_thanh_toan'
      } : order));
      alert('Đã hủy đơn hàng thành công!');
    } catch (error) {
      console.error('Không thể hủy đơn hàng:', error);
      alert('Không thể hủy đơn hàng.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-gray-400 text-sm">Quản lý và duyệt trạng thái đơn hàng khóa học.</p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            placeholder="Nhập mã đơn hàng..."
            value={orderIdFilter}
            onChange={(e) => setOrderIdFilter(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-1.5 text-white text-xs focus:border-primary-500 focus:outline-none placeholder-gray-500 min-w-44"
          />
          <div className="flex items-center gap-2 bg-gray-900 px-3 py-1.5 rounded-xl border border-gray-800">
            <span className="text-xs font-semibold text-gray-400 uppercase">Mã đơn hàng:</span>
            <select
              value={orderTypeFilter}
              onChange={(e) => setOrderTypeFilter(e.target.value as any)}
              className="bg-transparent text-gray-200 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-gray-950 text-gray-300">Tất cả</option>
              <option value="ctv" className="bg-gray-950 text-gray-300">Đơn CTV (CTV...)</option>
              <option value="ord" className="bg-gray-950 text-gray-300">Đơn thường (ORD...)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white text-3xl font-bold hover:text-gray-300"
            >
              ✕
            </button>
            <img
              src={selectedImage}
              alt="Bằng chứng thanh toán"
              className="max-w-full max-h-[90vh] rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 px-6 py-3 text-sm font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-gray-200'
            }`}
          >
            📋 Quản lý đơn hàng
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex-1 px-6 py-3 text-sm font-bold transition-all relative ${
              activeTab === 'payments'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-gray-200'
            }`}
          >
            💰 Xác nhận thanh toán
            {paymentVerificationOrders.length > 0 && (
              <span className="absolute top-2 right-4 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {paymentVerificationOrders.length}
              </span>
            )}
          </button>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-950 border-b border-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="p-4">Mã đơn</th>
                  <th className="p-4">Khách hàng</th>
                  <th className="p-4">Sản phẩm</th>
                  <th className="p-4">Tổng tiền</th>
                  <th className="p-4">Thanh toán</th>
                  <th className="p-4">Ngày tạo</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Duyệt nhanh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-sm">
                {visibleOrders.map(o => {
                  return (
                    <tr key={o.id} className="hover:bg-gray-950/40 transition-all">
                      <td className="p-4 font-bold text-white">{o.id}</td>
                      <td className="p-4">
                        <p className="font-semibold text-gray-200">{o.full_name}</p>
                        <p className="text-xs text-gray-500">{o.email}</p>
                      </td>
                      <td className="p-4 text-gray-300 max-w-xs">{o.product_names || 'Sản phẩm không xác định'}</td>
                      <td className="p-4 font-bold text-primary-400">{formatPrice(o.total)}</td>
                       <td className="p-4 text-xs text-gray-400">
                        <span className="uppercase">{o.payment_method}</span>
                        {o.payment_qr_content ? (
                          <div className="mt-1.5 p-2 bg-gray-950 rounded-lg border border-gray-800">
                            <p className="text-[10px] text-gray-500 mb-1">Nội dung QR:</p>
                            <p className="text-[11px] text-primary-400 font-mono break-all">{o.payment_qr_content}</p>
                          </div>
                        ) : (
                          <span className="text-gray-600 block mt-1 text-[11px] normal-case">Không có</span>
                        )}
                        {o.payment_proof ? (
                          <button
                            onClick={() => setSelectedImage(o.payment_proof || null)}
                            className="text-primary-400 hover:underline block mt-1.5 font-semibold text-[11px] normal-case"
                          >
                            📄 Xem biên lai
                          </button>
                        ) : (
                          <span className="text-gray-600 block mt-1.5 text-[11px] normal-case">Chưa nộp biên lai</span>
                        )}
                      </td>
                       <td className="p-4 text-gray-500">{o.created_at}</td>
                       <td className="p-4">
                        {o.status === 'completed' && <Badge variant="green">Đã xong</Badge>}
                        {o.status === 'pending' && <Badge variant="yellow">Chờ duyệt</Badge>}
                        {o.status === 'cancelled' && <Badge variant="red">Đã hủy</Badge>}
                      </td>
                      <td className="p-4 text-right space-x-1.5">
                        {o.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(o.id, 'completed')}
                              className="px-2.5 py-1 text-xs font-bold bg-green-950 text-green-400 rounded-lg border border-green-500/20 hover:bg-green-900/40 transition-all"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={() => updateStatus(o.id, 'cancelled')}
                              className="px-2.5 py-1 text-xs font-bold bg-red-950 text-red-450 rounded-lg border border-red-500/20 hover:bg-red-900/40 transition-all"
                            >
                              Hủy
                            </button>
                          </>
                        )}
                        {o.status === 'completed' && (
                          <span className="text-xs text-gray-500 font-medium">Không thể sửa</span>
                        )}
                        {o.status === 'cancelled' && (
                          <span className="text-xs text-gray-500 font-medium">Đơn đã hủy</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Payment Verification Tab */}
        {activeTab === 'payments' && (
          <div className="overflow-x-auto">
            {paymentVerificationOrders.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-400 text-lg">Không có đơn hàng nào cần xác nhận thanh toán</p>
                <p className="text-gray-500 text-sm mt-2">Tất cả đơn hàng đã được duyệt thanh toán</p>
              </div>
            ) : (
              <>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-950 border-b border-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <th className="p-4">Mã đơn hàng</th>
                      <th className="p-4">Khách hàng</th>
                      <th className="p-4">Sản phẩm</th>
                      <th className="p-4">Tổng tiền</th>
                      <th className="p-4">Bằng chứng TT</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800 text-sm">
                    {paymentVisibleOrders.map(o => (
                      <tr key={o.id} className="hover:bg-gray-950/40 transition-all">
                        <td className="p-4 font-bold text-white">{o.id}</td>
                        <td className="p-4">
                          <p className="font-semibold text-gray-200">{o.full_name}</p>
                          <p className="text-xs text-gray-500">{o.email}</p>
                          {o.phone && <p className="text-xs text-gray-500">{o.phone}</p>}
                        </td>
                        <td className="p-4 text-gray-300 max-w-xs">{o.product_names || 'Sản phẩm không xác định'}</td>
                        <td className="p-4 font-bold text-primary-400">{formatPrice(o.total)}</td>
                        <td className="p-4">
                          {o.payment_proof ? (
                            <div className="space-y-2">
                              <img
                                src={o.payment_proof}
                                alt="Bằng chứng thanh toán"
                                className="max-w-xs max-h-40 rounded-lg border border-gray-700 cursor-pointer hover:border-primary-500 transition-all"
                                onClick={() => setSelectedImage(o.payment_proof || null)}
                              />
                              <button
                                onClick={() => setSelectedImage(o.payment_proof || null)}
                                className="text-xs text-primary-400 hover:text-primary-300 underline"
                              >
                                Xem đầy đủ
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-600 text-xs">Chưa có</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="text-xs bg-yellow-900/30 text-yellow-400 font-bold px-2.5 py-1 rounded-full border border-yellow-500/30">
                            Chờ xét duyệt
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => quickApprovePayment(o.id)}
                              className="px-4 py-2 text-xs font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                            >
                              ✅ Duyệt nhanh
                            </button>
                            <button
                              onClick={() => rejectPayment(o.id)}
                              className="px-4 py-2 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                            >
                              ❌ Hủy
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Pagination
                  currentPage={currentPage}
                  totalPages={paymentTotalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}