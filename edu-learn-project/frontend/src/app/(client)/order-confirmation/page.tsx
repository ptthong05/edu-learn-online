'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getBankId } from '@/lib/utils/helpers';
import { useCart } from '@/lib/hooks/useCart';
import { getAuthToken } from '@/lib/utils/auth';

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const isCheckout = searchParams.get('checkout') === 'true';
  const { clearCart, removeFromCart } = useCart();
  
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedMethodKey, setSelectedMethodKey] = useState<string>('');
  const [tempOrderCode, setTempOrderCode] = useState<string>('');

  useEffect(() => {
    if (isCheckout) {
      // Load checkout data from sessionStorage
      const stored = sessionStorage.getItem('checkoutData');
      if (stored) {
        const parsed = JSON.parse(stored);
        setCheckoutData(parsed);
        if (parsed.temp_order_code) {
          setTempOrderCode(parsed.temp_order_code);
        } else {
          const newCode = 'DH' + Date.now();
          setTempOrderCode(newCode);
          parsed.temp_order_code = newCode;
          sessionStorage.setItem('checkoutData', JSON.stringify(parsed));
        }
      }
      // Fetch all active payment methods
      fetch('http://localhost:5000/api/payment-methods')
        .then(res => res.json())
        .then((data: any[]) => {
          setPaymentMethods(data);
          // Use the payment method already selected on checkout page
          const storedData = sessionStorage.getItem('checkoutData');
          if (storedData) {
            const parsed = JSON.parse(storedData);
            if (parsed.payment_method) {
              setSelectedMethodKey(parsed.payment_method);
            } else if (data.length > 0) {
              setSelectedMethodKey(data[0].method_key);
            }
          } else if (data.length > 0) {
            setSelectedMethodKey(data[0].method_key);
          }
        })
        .catch(err => console.error('Failed to fetch payment methods:', err))
        .finally(() => {
          setLoading(false);
        });
    } else if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, isCheckout]);

  const fetchOrderDetails = async () => {
    try {
      // Get auth token from cookies
      const token = getAuthToken();
      
      // Fetch order details
      const orderResponse = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (orderResponse.ok) {
        const data = await orderResponse.json();
        console.log('Order details:', data);
        
        // Always fetch user profile to ensure we have the latest data
        if (token) {
          try {
            const userResponse = await fetch('http://localhost:5000/api/users/profile', {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (userResponse.ok) {
              const userData = await userResponse.json();
              console.log('User profile:', userData);
              // Merge user data into order details
              if (userData.user) {
                data.user_name = userData.user.full_name;
                data.user_email = userData.user.email;
                data.user_phone = userData.user.phone || 'N/A';
              }
            }
          } catch (userError) {
            console.error('Failed to fetch user profile:', userError);
          }
        }
        
        setOrderDetails(data);
      } else {
        console.error('Failed to fetch order:', orderResponse.status);
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!orderDetails && !isCheckout) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy thông tin đơn hàng</p>
          <Link href="/" className="mt-4 inline-block text-primary-600 hover:underline">
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  // Checkout flow - Show QR code for payment
  if (isCheckout && checkoutData) {
    const selectedPm = paymentMethods.find((pm: any) => pm.method_key === selectedMethodKey) || paymentMethods[0];

    let generatedQrUrl = '';
    if (selectedPm) {
      if (selectedPm.method_key === 'momo') {
        const phoneNum = (selectedPm.phone_number || '').trim();
        const momoData = `https://nhantien.momo.vn/${phoneNum}/${checkoutData.total}?message=${encodeURIComponent(tempOrderCode)}`;
        generatedQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(momoData)}`;
      } else {
        const bankId = getBankId(selectedPm.bank_name || '');
        const accountNumber = (selectedPm.account_number || '').trim();
        const accountHolder = (selectedPm.account_holder || '').trim();
        generatedQrUrl = `https://img.vietqr.io/image/${bankId}-${accountNumber}-compact.png?amount=${checkoutData.total}&addInfo=${encodeURIComponent(tempOrderCode)}&accountName=${encodeURIComponent(accountHolder)}`;
      }
    }

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Order Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
            {/* Order Header */}
            <div className="bg-gray-900 text-white p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Mã đơn hàng</p>
                  <p className="text-xl font-bold font-mono text-primary-400">{tempOrderCode}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs text-gray-400 mb-1">Trạng thái thanh toán</p>
                  <span className="inline-block text-xs bg-yellow-900/30 text-yellow-400 font-bold px-3 py-1.5 rounded-full border border-yellow-500/30">
                    Chưa thanh toán
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Left - Payment Info */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">
                    Thông tin chuyển tiền
                  </h3>
                  
                  {selectedPm && (
                    <>
                      {/* QR Code */}
                      <div className={`p-6 border-2 border-dashed rounded-2xl ${
                        selectedPm.method_key === 'momo' ? 'border-pink-200 bg-pink-50' : 'border-blue-200 bg-blue-50'
                      }`}>
                        <img 
                          src={generatedQrUrl} 
                          alt="QR Code thanh toán" 
                          className="w-64 h-64 object-contain mx-auto"
                        />
                      </div>

                      {/* Account Details */}
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm space-y-2">
                        {selectedPm.bank_name && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Ngân hàng:</span>
                            <span className="font-bold text-gray-900">{selectedPm.bank_name}</span>
                          </div>
                        )}
                        {selectedPm.account_number && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Số tài khoản:</span>
                            <span className="font-bold text-gray-900">{selectedPm.account_number}</span>
                          </div>
                        )}
                        {selectedPm.phone_number && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Số điện thoại:</span>
                            <span className="font-bold text-gray-900">{selectedPm.phone_number}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-500">Chủ tài khoản:</span>
                          <span className="font-bold text-gray-900">{selectedPm.account_holder}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 pt-2">
                          <span className="text-gray-500">Số tiền:</span>
                          <span className="font-extrabold text-primary-600">{checkoutData.total?.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Nội dung CK:</span>
                          <span className="font-bold text-red-600 font-mono text-sm bg-red-50 px-2 py-0.5 rounded">{tempOrderCode}</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-400">
                        Vui lòng quét mã QR hoặc chuyển khoản đúng thông tin & nội dung trên.
                      </p>
                    </>
                  )}
                </div>

                {/* Right - Order Details */}
                <div>
                  <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3 mb-4">
                    Chi tiết đơn hàng
                  </h3>
                  <div className="space-y-3">
                    {checkoutData.items?.map((item: any, index: number) => (
                      <div key={index} className="flex gap-4 pb-3 border-b border-gray-100 last:border-0">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{item.product_name}</p>
                          <p className="text-sm text-gray-500 mt-1">Số lượng: 1</p>
                          <p className="text-base font-bold text-primary-600 mt-1">{item.price?.toLocaleString('vi-VN')}đ</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                    <div className="flex justify-between font-bold text-gray-900 text-lg pt-2 border-t border-gray-200">
                      <span>Tổng tiền</span>
                      <span className="text-primary-600 text-xl">{checkoutData.total?.toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Confirm Payment Button */}
          <div className="text-center">
            <div className="inline-flex flex-col sm:flex-row gap-3">
              <button 
                onClick={async () => {
                  // Create order directly from here
                  setLoading(true);
                  try {
                    const token = getAuthToken();
                    const stored = sessionStorage.getItem('checkoutData');
                    if (!stored) {
                      alert('Không tìm thấy thông tin thanh toán');
                      return;
                    }
                    const checkoutData = JSON.parse(stored);
                    
                    const response = await fetch('http://localhost:5000/api/orders', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        items: checkoutData.items,
                        payment_method: selectedMethodKey || paymentMethods[0]?.method_key || 'bank_transfer',
                        total: checkoutData.total,
                        ref: checkoutData.ref,
                        coupon_code: checkoutData.coupon_code,
                        payment_qr_content: tempOrderCode
                      })
                    });
                    
                    if (!response.ok) {
                      throw new Error('Không thể tạo đơn hàng');
                    }
                    
                    const data = await response.json();
                    
                    // Clear cart or remove single item depending on buy now flow
                    if (checkoutData.isBuyNow) {
                      const purchasedItemId = checkoutData.items[0]?.course_id;
                      if (purchasedItemId) {
                        removeFromCart(purchasedItemId);
                      }
                    } else {
                      clearCart();
                    }

                    sessionStorage.removeItem('checkoutData');
                    window.location.href = `/order-confirmation?orderId=${data.orderId}`;
                  } catch (err) {
                    alert(err instanceof Error ? err.message : 'Có lỗi xảy ra');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="inline-block px-8 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
              </button>
              
              {/* Continue Shopping Button */}
              <Link 
                href="/courses"
                className="inline-block px-6 py-3 bg-white text-primary-600 font-bold rounded-xl border-2 border-primary-600 hover:bg-green-600 hover:text-white transition-colors"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Thank You Message */}
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Cảm ơn bạn đã đặt hàng!</h2>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-left">
            <p className="text-blue-900 font-semibold mb-2">📋 Đơn hàng đang được xét duyệt</p>
            <p className="text-blue-700 text-sm">Đơn hàng sẽ được xử lý trong vòng 1 giờ. Vui lòng kiểm tra email sau 1 giờ để bắt đầu học.</p>
          </div>
        </div>

        {/* Order Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          {/* Order Header */}
          <div className="bg-gray-900 text-white p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Mã đơn hàng</p>
                <p className="text-xl font-bold font-mono text-primary-400">{orderDetails.order_code || orderId}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-gray-400 mb-1">Trạng thái thanh toán</p>
                <span className="inline-block text-xs bg-green-900/30 text-green-400 font-bold px-3 py-1.5 rounded-full border border-green-500/30">
                  Đã thanh toán
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left - User Info */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">
                  Thông tin người đặt
                </h3>
                
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm space-y-2">
                  <div>
                    <span className="text-gray-500">Họ tên:</span>
                    <span className="font-bold text-gray-900 ml-2">{orderDetails.user_name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <span className="font-bold text-gray-900 ml-2">{orderDetails.user_email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Số điện thoại:</span>
                    <span className="font-bold text-gray-900 ml-2">{orderDetails.user_phone || 'N/A'}</span>
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3 pt-4">
                  Thông tin đơn hàng
                </h3>
                
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm space-y-2">
                  <div>
                    <span className="text-gray-500">Ngày đặt:</span>
                    <span className="font-bold text-gray-900 ml-2">
                      {orderDetails.created_at ? new Date(orderDetails.created_at).toLocaleString('vi-VN') : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Phương thức thanh toán:</span>
                    <span className="font-bold text-gray-900 ml-2">{orderDetails.payment_method || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Tổng tiền:</span>
                    <span className="font-extrabold text-primary-600 ml-2 text-base">
                      {orderDetails.total ? Number(orderDetails.total).toLocaleString('vi-VN') + 'đ' : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right - Order Details */}
              <div>
                <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3 mb-4">
                  Chi tiết đơn hàng
                </h3>
                <div className="space-y-3">
                  {orderDetails.items?.map((item: any, index: number) => (
                    <div key={index} className="flex gap-4 pb-3 border-b border-gray-100 last:border-0">
                      <div className="relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        {item.image && (
                          <Image 
                            src={item.image} 
                            alt={item.product_name || ''} 
                            fill 
                            className="object-cover" 
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.product_name}</p>
                        <p className="text-sm text-gray-500 mt-1">Số lượng: {item.quantity || 1}</p>
                        <p className="text-base font-bold text-primary-600 mt-1">
                          {item.price ? Number(item.price).toLocaleString('vi-VN') + 'đ' : 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/tai-khoan?tab=orders" 
              className="px-5 py-2.5 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 transition-colors"
            >
              Xem đơn hàng của tôi
            </Link>
            <Link 
              href="/tai-khoan?tab=courses" 
              className="px-5 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors"
            >
              Bắt đầu học ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}