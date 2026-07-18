'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/hooks/useCart';
import { formatPrice, getBankId } from '@/lib/utils/helpers';
import { api } from '@/lib/utils/api';
import { useSearchParams } from 'next/navigation';
import { getAuthToken } from '@/lib/utils/auth';

function CheckoutForm() {
  const { cartItems, savedCoupons, clearCart, removeFromCart } = useCart();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams?.get('buynow') === 'true';
  const [checkoutItems, setCheckoutItems] = useState<any[]>([]);

  useEffect(() => {
    if (isBuyNow) {
      const stored = sessionStorage.getItem('buyNowItem');
      if (stored) {
        setCheckoutItems([JSON.parse(stored)]);
      } else {
        setCheckoutItems([]);
      }
    } else {
      setCheckoutItems(cartItems);
    }
  }, [isBuyNow, cartItems]);
  const [method, setMethod] = useState('bank_transfer');
  const [paymentMethods, setPaymentMethods] = useState<Array<{
    id: string;
    method_key: string;
    method_name: string;
    icon: string | null;
    description: string | null;
    account_number: string | null;
    account_holder: string | null;
    bank_name: string | null;
    qr_code_image: string | null;
    phone_number: string | null;
  }>>([]);
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/payment-methods');
      if (response.ok) {
        const data = await response.json();
        console.log('All payment methods:', data);
        // Show all active payment methods from the API
        setPaymentMethods(data);
        // Set default selected method to the first one
        if (data.length > 0 && method === 'bank_transfer') {
          setMethod(data[0].method_key);
        }
      }
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
    }
  };
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);
  const [manualCoupon, setManualCoupon] = useState('');
  const [manualMsg, setManualMsg] = useState('');
  const [manualDiscount, setManualDiscount] = useState(0);
  const [showVoucherPanel, setShowVoucherPanel] = useState(false);
  const [validatedCoupon, setValidatedCoupon] = useState<any>(null);
  const [savedCouponDiscount, setSavedCouponDiscount] = useState(0);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const previousSelectedCouponRef = useRef<string | null>(null);
  const subtotalRef = useRef(0);
  const previousSubtotalRef = useRef(0);
  const [referralMsg, setReferralMsg] = useState('');
  const [referralName, setReferralName] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showPaymentProof, setShowPaymentProof] = useState(false);
  const [proofImage, setProofImage] = useState('');
  const [proofMsg, setProofMsg] = useState('');
  const [purchasedInfo, setPurchasedInfo] = useState<{
    items: any[];
    subtotal: number;
    totalDiscount: number;
    total: number;
  } | null>(null);
  
  // Pre-fill referral code from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRef = localStorage.getItem('affiliate_ref');
      if (storedRef) {
        setReferralCode(storedRef);
      }
    }
  }, []);


  // Calculate subtotal from cart
  const subtotal = checkoutItems.reduce((sum, item) => {
    const price = item.type === 'course'
      ? (item.course?.sale_price || item.course?.price)
      : (item.combo?.sale_price || item.combo?.price);
    return sum + (price || 0);
  }, 0);
  
  // Update subtotal ref whenever subtotal changes
  useEffect(() => {
    subtotalRef.current = subtotal;
  }, [subtotal]);

  // Get the active saved coupon
  const activeSavedCoupon = selectedCoupon
    ? savedCoupons.find(c => c.id === selectedCoupon)
    : null;

  // Validate saved coupon with backend when coupon selection or subtotal changes
  useEffect(() => {
    const validateSavedCoupon = async () => {
      // Only validate if there's a selected coupon and subtotal
      if (selectedCoupon && subtotal > 0) {
        setIsValidatingCoupon(true);
        try {
          const data = await api.validateCoupon(
            savedCoupons.find(c => c.id === selectedCoupon)?.code || '',
            subtotal
          );
          
          if (data.valid && data.calculated_discount !== undefined) {
            // Update the discount with backend-calculated value
            setSavedCouponDiscount(data.calculated_discount);
          } else {
            // If validation fails, set discount to 0
            setSavedCouponDiscount(0);
          }
        } catch (err) {
          // If validation fails, set discount to 0
          console.error('Coupon validation error:', err);
          setSavedCouponDiscount(0);
        } finally {
          setIsValidatingCoupon(false);
        }
      } else if (!selectedCoupon) {
        setSavedCouponDiscount(0);
      }
      
      // Update previous subtotal ref
      previousSubtotalRef.current = subtotal;
    };
    
    // Validate when selectedCoupon or subtotal changes
    validateSavedCoupon();
  }, [selectedCoupon, subtotal, savedCoupons]);

  // Reset discount when coupon is deselected
  useEffect(() => {
    if (!selectedCoupon) {
      setSavedCouponDiscount(0);
    }
  }, [selectedCoupon]);

  // Calculate saved coupon discount directly from coupon data (no async dependency)
  const computedSavedCouponDiscount = (() => {
    if (!activeSavedCoupon) return 0;
    let raw = 0;
    if (activeSavedCoupon.discount_type === 'percent') {
      raw = Math.round(subtotal * activeSavedCoupon.discount / 100);
    } else {
      raw = Math.min(subtotal, activeSavedCoupon.discount);
    }
    const maxDisc = activeSavedCoupon.max_discount || 0;
    return maxDisc > 0 ? Math.min(raw, maxDisc) : raw;
  })();

  const totalDiscount = activeSavedCoupon ? computedSavedCouponDiscount : manualDiscount;
  const total = Math.max(0, subtotal - totalDiscount);

  const applyManualCoupon = async () => {
    const upper = manualCoupon.toUpperCase();
    if (!upper.trim()) {
      setManualDiscount(0);
      setManualMsg('');
      setValidatedCoupon(null);
      return;
    }
    try {
      const data = await api.validateCoupon(upper, subtotal);
      if (data.valid && data.coupon) {
        const coupon = data.coupon;
        
        // Use the calculated discount from backend
        const calculatedDiscount = data.calculated_discount || 0;
        
        setManualDiscount(calculatedDiscount);
        setValidatedCoupon(coupon);
        setManualMsg(`🎉 ${data.message || 'Áp dụng mã giảm giá thành công!'}`);
      } else {
        setManualDiscount(0);
        setValidatedCoupon(null);
        setManualMsg(`❌ ${data.message || 'Mã giảm giá không hợp lệ'}`);
      }
    } catch (err: any) {
      setManualDiscount(0);
      setValidatedCoupon(null);
      setManualMsg(`❌ ${err.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn'}`);
    }
  };

  const applyReferralCode = async () => {
    const code = referralCode.trim();
    if (code === '') {
      setReferralMsg('');
      setReferralName('');
      return;
    }
    try {
      const data = await api.validateReferralCode(code);
      if (data.valid) {
        setReferralMsg(`✅ ${data.message}`);
        setReferralName(data.name || '');
      } else {
        setReferralMsg(`❌ ${data.message || 'Mã giới thiệu không hợp lệ'}`);
        setReferralName('');
      }
    } catch (err: any) {
      setReferralMsg(`❌ ${err.message || 'Mã giới thiệu không hợp lệ'}`);
      setReferralName('');
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const ref = referralCode.trim() || localStorage.getItem('affiliate_ref') || undefined;
      
      if (!token) throw new Error('Vui lòng đăng nhập trước khi thanh toán.');
      if (checkoutItems.length === 0) throw new Error('Không có khóa học nào cần thanh toán.');

      // Store checkout info but don't create order yet
      setPurchasedInfo({
        items: [...checkoutItems],
        subtotal,
        totalDiscount,
        total
      });
      
      // Navigate to order confirmation page with checkout data
      const checkoutData = {
        items: checkoutItems.map(item => ({
          course_id: item.course?.id || item.combo?.id,
          product_name: item.type === 'course' ? item.course?.title : item.combo?.title,
          price: item.type === 'course'
            ? (item.course?.sale_price || item.course?.price)
            : (item.combo?.sale_price || item.combo?.price)
        })),
        total,
        ref,
        coupon_code: selectedCoupon ? savedCoupons.find(c => c.id === selectedCoupon)?.code : (manualDiscount > 0 ? manualCoupon : undefined),
        payment_method: method,
        temp_order_code: 'DH' + Date.now(),
        isBuyNow: isBuyNow
      };
      
      // Store in sessionStorage and navigate
      sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
      window.location.href = '/order-confirmation?checkout=true';
    } catch (err) {
      console.error('Checkout error:', err);
      alert(err instanceof Error ? err.message : 'Không thể hiển thị thông tin thanh toán. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const ref = referralCode.trim() || localStorage.getItem('affiliate_ref') || undefined;
      const items = checkoutItems.map(item => ({
        course_id: item.course?.id || item.combo?.id,
        product_name: item.type === 'course' ? item.course?.title : item.combo?.title,
        price: item.type === 'course'
          ? (item.course?.sale_price || item.course?.price)
          : (item.combo?.sale_price || item.combo?.price)
      }));

      const activeSavedCoupon = selectedCoupon
        ? savedCoupons.find(c => c.id === selectedCoupon)
        : null;
      const usedCouponCode = activeSavedCoupon 
        ? activeSavedCoupon.code 
        : (manualDiscount > 0 ? manualCoupon : undefined);

      const data = await api.createOrder({ items, payment_method: method, total, ref, coupon_code: usedCouponCode });
      setOrderId(data.orderId);
      // Clear affiliate ref after successful purchase
      if (ref) localStorage.removeItem('affiliate_ref');
      
      // Clear cart or remove single item depending on buy now flow
      if (isBuyNow) {
        const stored = sessionStorage.getItem('buyNowItem');
        if (stored) {
          const buyNowItem = JSON.parse(stored);
          removeFromCart(buyNowItem.id);
          sessionStorage.removeItem('buyNowItem');
        }
      } else {
        clearCart();
      }
      setSuccess(true);
      setShowQRCode(false);
    } catch (err) {
      console.error('Order error:', err);
      alert(err instanceof Error ? err.message : 'Không thể tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const uploadPaymentProof = async (file?: File) => {
    if (!file || !orderId) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Vui lòng chọn tệp không quá 5MB.');
      return;
    }
    
    setLoading(true);
    try {
      const token = getAuthToken();
      const base64Proof = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Không thể đọc tệp.'));
        reader.readAsDataURL(file);
      });
      
      const response = await fetch('http://localhost:5000/api/orders/upload-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ order_id: orderId, proof_image: base64Proof })
      });
      
      if (!response.ok) {
        throw new Error('Lỗi tải lên.');
      }

      setProofMsg('✅ Tải lên bằng chứng thanh toán thành công!');
      setProofImage(base64Proof);
    } catch (err) {
      setProofMsg('❌ Lỗi khi tải lên bằng chứng thanh toán');
    } finally {
      setLoading(false);
    }
  };
  
  

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Order Card */}
          {orderId && purchasedInfo && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
              {/* Order Header */}
              <div className="bg-gray-900 text-white p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Mã đơn hàng</p>
                    <p className="text-xl font-bold font-mono text-primary-400">{orderId}</p>
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
                    
                    {(() => {
                      const selectedPm = paymentMethods.find(pm => pm.method_key === method);
                      if (!selectedPm) return null;

                      let generatedQrUrl = '';
                      if (method === 'momo') {
                        const phoneNum = (selectedPm.phone_number || '').trim();
                        const momoData = `https://nhantien.momo.vn/${phoneNum}/${purchasedInfo.total}?message=${encodeURIComponent(orderId)}`;
                        generatedQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(momoData)}`;
                      } else {
                        const bankId = getBankId(selectedPm.bank_name || '');
                        const accountNumber = (selectedPm.account_number || '').trim();
                        const accountHolder = (selectedPm.account_holder || '').trim();
                        generatedQrUrl = `https://img.vietqr.io/image/${bankId}-${accountNumber}-compact.png?amount=${purchasedInfo.total}&addInfo=${encodeURIComponent(orderId)}&accountName=${encodeURIComponent(accountHolder)}`;
                      }

                      return (
                        <>
                          {/* QR Code */}
                          <div className={`inline-block p-4 border-2 border-dashed rounded-2xl ${
                            method === 'momo' ? 'border-pink-200 bg-pink-50' : 'border-blue-200 bg-blue-50'
                          }`}>
                            <img 
                              src={generatedQrUrl} 
                              alt="QR Code thanh toán" 
                              className="w-56 h-56 object-contain"
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
                                <span className="text-gray-500">Số điện thoại MoMo:</span>
                                <span className="font-bold text-gray-900">{selectedPm.phone_number}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-500">Chủ tài khoản:</span>
                              <span className="font-bold text-gray-900">{selectedPm.account_holder}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 pt-2">
                              <span className="text-gray-500">Số tiền:</span>
                              <span className="font-extrabold text-primary-600">{formatPrice(purchasedInfo.total)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">Nội dung CK:</span>
                              <span className="font-bold text-red-600 font-mono text-sm bg-red-50 px-2 py-0.5 rounded">{orderId}</span>
                            </div>
                          </div>

                          <p className="text-xs text-gray-400">
                            Vui lòng quét mã QR hoặc chuyển khoản đúng thông tin & nội dung trên.
                          </p>
                        </>
                      );
                    })()}
                  </div>

                  {/* Right - Order Details */}
                  <div>
                    <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3 mb-4">
                      Chi tiết đơn hàng
                    </h3>
                    <div className="space-y-3">
                      {purchasedInfo.items.map(item => {
                        const title = item.type === 'course' ? item.course?.title : item.combo?.title;
                        const image = item.type === 'course' ? item.course?.image : item.combo?.image;
                        const price = item.type === 'course'
                          ? (item.course?.sale_price || item.course?.price)
                          : (item.combo?.sale_price || item.combo?.price);
                        return (
                          <div key={item.id} className="flex gap-4 pb-3 border-b border-gray-100 last:border-0">
                            <div className="relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                              {image && <Image src={image} alt={title || ''} fill className="object-cover" />}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{title}</p>
                              <p className="text-sm text-gray-500 mt-1">Số lượng: 1</p>
                              <p className="text-base font-bold text-primary-600 mt-1">{formatPrice(price || 0)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                      <div className="flex justify-between text-gray-600">
                        <span>Tạm tính</span>
                        <span>{formatPrice(purchasedInfo.subtotal)}</span>
                      </div>
                      {purchasedInfo.totalDiscount > 0 && (
                        <div className="flex justify-between text-green-600 font-semibold">
                          <span>Giảm giá</span>
                          <span>-{formatPrice(purchasedInfo.totalDiscount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-gray-900 text-lg pt-2 border-t border-gray-200">
                        <span>Tổng tiền</span>
                        <span className="text-primary-600 text-xl">{formatPrice(purchasedInfo.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* Payment Proof Upload */}
          <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Nộp bằng chứng thanh toán</h3>
            <p className="text-sm text-gray-600 mb-4">Nộp bằng chứng thanh toán để được xét duyệt nhanh hơn. Vui lòng chọn ảnh screenshot biên lai hoặc ảnh chuyển khoản.</p>
            <div className="space-y-3">
              {proofImage ? (
                <div className="flex flex-wrap items-center gap-3">
                  {proofImage.startsWith('data:image') && (
                    <img src={proofImage} alt={`Bằng chứng thanh toán`} className="w-24 h-16 object-cover rounded-lg border border-gray-200" />
                  )}
                  <a href={proofImage} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary-600 hover:underline">Xem bằng chứng đã tải lên</a>
                  <label className="text-sm text-gray-500 cursor-pointer hover:text-primary-600">
                    Thay tệp
                    <input type="file" accept="image/*,.pdf" className="hidden" onChange={event => void uploadPaymentProof(event.target.files?.[0])} />
                  </label>
                </div>
              ) : (
                <label className="inline-flex w-full justify-center items-center gap-2 px-4 py-3 border border-dashed border-primary-300 rounded-xl text-sm font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 cursor-pointer transition-colors">
                  {loading ? 'Đang tải lên...' : 'Chọn ảnh hoặc PDF biên lai'}
                  <input type="file" accept="image/*,.pdf" disabled={loading} className="hidden" onChange={event => void uploadPaymentProof(event.target.files?.[0])} />
                </label>
              )}
              {proofMsg && (
                <p className={`text-sm mt-2 ${proofMsg.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>
                  {proofMsg}
                </p>
              )}
            </div>
          </div>

          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white font-bold rounded-xl hover:bg-gray-700 transition-colors shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Quay lại
              </button>
              <Link 
                href={`/order-confirmation?orderId=${orderId}`}
                className="inline-block px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg"
              >
                Xác nhận thanh toán
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/tai-khoan?tab=orders" className="px-5 py-2.5 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 transition-colors">
                Xem đơn hàng của tôi
              </Link>
              <Link href="/courses" className="text-sm text-primary-600 hover:underline">
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-hero text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-blue-200 mb-3">
            <Link href="/" className="hover:text-white">Trang chủ</Link>
            <span className="mx-2">/</span>
            <Link href="/cart" className="hover:text-white">Giỏ hàng</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Thanh toán</span>
          </nav>
          <h1 className="text-2xl font-bold">Thanh toán</h1>
          <p className="text-blue-200 mt-1">Hoàn tất đơn hàng của bạn</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Selection - All methods */}
            {!showQRCode && paymentMethods.length > 0 && (
                <div className="bg-white rounded-2xl shadow-card p-6">
                  <h2 className="font-bold text-gray-900 text-lg mb-4">Phương thức thanh toán</h2>
                  <div className="space-y-3">
                    {paymentMethods.map((pm) => (
                      <div 
                        key={pm.id}
                        onClick={() => setMethod(pm.method_key)}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          method === pm.method_key 
                            ? 'border-primary-500 bg-primary-50' 
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="text-3xl">{pm.icon || '🏦'}</div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 text-base">{pm.method_name}</p>
                          {pm.description && <p className="text-sm text-gray-500 mt-0.5">{pm.description}</p>}
                        </div>
                        {method === pm.method_key && (
                          <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
            )}

            {/* QR Code Display - Centered */}
            {showQRCode && purchasedInfo && (() => {
              const selectedPm = paymentMethods.find((pm: any) => pm.method_key === method) || paymentMethods[0];
              if (!selectedPm) return (
                <div className="bg-white rounded-2xl shadow-card p-8 text-center">
                  <p className="text-gray-500">Đang tải thông tin thanh toán...</p>
                </div>
              );

              const bankId = getBankId(selectedPm.bank_name || '');
              const accountNumber = (selectedPm.account_number || '').trim();
              const accountHolder = (selectedPm.account_holder || '').trim();
              const generatedQrUrl = `https://img.vietqr.io/image/${bankId}-${accountNumber}-compact.png?amount=${purchasedInfo.total}&addInfo=DH${Date.now()}&accountName=${encodeURIComponent(accountHolder)}`;

              return (
                <div className="bg-white rounded-2xl shadow-card p-8">
                  <h2 className="font-bold text-gray-900 text-lg mb-6 text-center">Quét mã QR để thanh toán</h2>
                  <div className="flex flex-col items-center justify-center space-y-6">
                    {/* QR Code - Centered */}
                    <div className="p-6 border-2 border-dashed border-blue-200 bg-blue-50 rounded-2xl">
                      <img 
                        src={generatedQrUrl} 
                        alt="QR Code thanh toán" 
                        className="w-64 h-64 object-contain"
                      />
                    </div>

                    {/* Account Details */}
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-sm space-y-3 w-full max-w-md">
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
                      <div className="flex justify-between">
                        <span className="text-gray-500">Chủ tài khoản:</span>
                        <span className="font-bold text-gray-900">{selectedPm.account_holder}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 pt-3">
                        <span className="text-gray-500">Số tiền:</span>
                        <span className="font-extrabold text-primary-600 text-lg">{formatPrice(purchasedInfo.total)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Nội dung CK:</span>
                        <span className="font-bold text-red-600 font-mono text-sm bg-red-50 px-2 py-0.5 rounded">DH{Date.now()}</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 text-center">
                      Vui lòng quét mã QR hoặc chuyển khoản đúng thông tin & nội dung trên.
                    </p>

                    {/* Confirm Payment Button with margin bottom */}
                    <button 
                      onClick={handleConfirmPayment} 
                      disabled={loading}
                      className="w-full max-w-md px-8 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg mb-4"
                    >
                      {loading ? (
                        <><svg className="animate-spin w-5 h-5 inline-block mr-2" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Đang xử lý...</>
                      ) : 'Xác nhận thanh toán'}
                    </button>
                  </div>
                </div>
              );
            })()}
            
                  
          </div>
          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-card p-5 sticky top-20 space-y-5">
              <h2 className="font-bold text-gray-900">Đơn hàng của bạn</h2>

              {/* Items */}
              {checkoutItems.length > 0 ? (
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {checkoutItems.map(item => {
                    const title = item.type === 'course' ? item.course?.title : item.combo?.title;
                    const image = item.type === 'course' ? item.course?.image : item.combo?.image;
                    const price = item.type === 'course'
                      ? (item.course?.sale_price || item.course?.price)
                      : (item.combo?.sale_price || item.combo?.price);
                    return (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          {image && <Image src={image} alt={title || ''} fill className="object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 line-clamp-2">{title}</p>
                          <p className="text-sm font-bold text-primary-600 mt-0.5">{formatPrice(price || 0)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">Chưa có sản phẩm nào</p>
              )}

              <div className="border-t border-gray-100 pt-4 space-y-4">
                {/* Voucher Section */}
                <div>
                  <button
                    onClick={() => setShowVoucherPanel(!showVoucherPanel)}
                    className="w-full flex items-center justify-between text-sm font-semibold text-primary-600 hover:text-primary-700 py-2 px-3 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      🎟️ Chọn voucher giảm giá
                      {activeSavedCoupon && (
                        <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">
                          {activeSavedCoupon.code}
                        </span>
                      )}
                    </span>
                    <svg className={`w-4 h-4 transition-transform ${showVoucherPanel ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showVoucherPanel && (
                    <div className="mt-3 space-y-4 animate-slide-down">
                      {/* Saved Vouchers - Only show vouchers that meet minimum order requirement */}
                      {savedCoupons.length > 0 && (() => {
                        const eligibleCoupons = savedCoupons.filter(coupon => {
                          const minOrderAmt = coupon.min_order_amount || 0;
                          return !minOrderAmt || subtotal >= minOrderAmt;
                        });
                        const ineligibleCoupons = savedCoupons.filter(coupon => {
                          const minOrderAmt = coupon.min_order_amount || 0;
                          return minOrderAmt > 0 && subtotal < minOrderAmt;
                        });
                        return (
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Voucher đã lưu</p>
                            {eligibleCoupons.length === 0 ? (
                              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-700">
                                <p className="font-semibold mb-1">⚠️ Không có voucher nào đủ điều kiện</p>
                                {ineligibleCoupons.map(coupon => (
                                  <p key={coupon.id} className="text-orange-600">
                                    <span className="font-bold">{coupon.code}</span>: cần đơn tối thiểu {formatPrice(coupon.min_order_amount || 0)}
                                  </p>
                                ))}
                              </div>
                            ) : (
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {eligibleCoupons.map(coupon => {
                                  const isSelected = selectedCoupon === coupon.id;
                                  const discAmt = coupon.discount_type === 'percent'
                                    ? `${coupon.discount}%`
                                    : formatPrice(coupon.discount);
                                  // Calculate preview discount amount for this coupon
                                  let previewDiscount = 0;
                                  if (coupon.discount_type === 'percent') {
                                    previewDiscount = Math.round(subtotal * coupon.discount / 100);
                                  } else {
                                    previewDiscount = Math.min(subtotal, coupon.discount);
                                  }
                                  const maxDisc = coupon.max_discount || 0;
                                  const isCapped = maxDisc > 0 && previewDiscount > maxDisc;
                                  const actualDiscount = isCapped ? maxDisc : previewDiscount;

                                  return (
                                    <label
                                      key={coupon.id}
                                      className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                        isSelected
                                          ? 'border-green-400 bg-green-50'
                                          : 'border-gray-200 hover:border-gray-300'
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name="voucher"
                                        checked={isSelected}
                                        onChange={() => {
                                          setSelectedCoupon(isSelected ? null : coupon.id);
                                          setManualDiscount(0);
                                          setManualCoupon('');
                                          setManualMsg('');
                                        }}
                                        className="sr-only"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <p className="text-xs font-bold text-gray-900">{coupon.code}</p>
                                          <span className="text-xs font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
                                            -{formatPrice(actualDiscount)}
                                          </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">Giảm {discAmt}</p>
                                        {isCapped && (
                                          <p className="text-xs text-orange-600 mt-0.5">
                                            Tối đa {formatPrice(maxDisc)} (tiết kiệm tối đa)
                                          </p>
                                        )}
                                        {coupon.min_order_amount && coupon.min_order_amount > 0 && (
                                          <p className="text-xs text-gray-400 mt-0.5">
                                            Đơn tối thiểu: {formatPrice(coupon.min_order_amount)}
                                          </p>
                                        )}
                                      </div>
                                      {isSelected && (
                                        <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                            {/* Show ineligible coupons as greyed out hint */}
                            {ineligibleCoupons.length > 0 && eligibleCoupons.length > 0 && (
                              <p className="text-xs text-gray-400 mt-2">
                                {ineligibleCoupons.length} voucher khác chưa đủ điều kiện đơn tối thiểu.
                              </p>
                            )}
                          </div>
                        );
                      })()}


                      {/* Manual Code Input */}
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nhập mã thủ công</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Nhập mã giảm giá..."
                            value={manualCoupon}
                            onChange={e => setManualCoupon(e.target.value)}
                            className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                          <button
                            onClick={applyManualCoupon}
                            className="px-3 py-2 bg-primary-600 text-white text-xs font-bold rounded-xl hover:bg-primary-700 transition-colors"
                          >
                            Áp dụng
                          </button>
                        </div>
                        {manualMsg && (
                          <p className={`mt-1.5 text-xs ${manualMsg.startsWith('🎉') ? 'text-green-600' : 'text-red-500'}`}>
                            {manualMsg}
                          </p>
                        )}
                        
                        {/* Voucher Details Display */}
                        {validatedCoupon && manualDiscount > 0 && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl animate-fade-in">
                            <div className="flex items-start gap-2">
                              <span className="text-2xl flex-shrink-0">🎟️</span>
                              <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-bold text-green-900">
                                    {validatedCoupon.code}
                                  </p>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-green-700">Mô tả:</span>
                                  <span className="text-xs text-green-800 font-medium text-right max-w-[60%]">
                                    {validatedCoupon.description || 'Mã giảm giá đặc biệt'}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold text-green-800">Giảm giá:</span>
                                  <span className="text-sm font-bold text-green-600">
                                    {validatedCoupon.discount_type === 'percent' 
                                      ? `${validatedCoupon.discount}%` 
                                      : formatPrice(validatedCoupon.discount)}
                                  </span>
                                </div>
                                {validatedCoupon.max_discount && validatedCoupon.max_discount > 0 && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-green-800">Giảm tối đa:</span>
                                    <span className="text-sm font-bold text-green-600">
                                      {formatPrice(validatedCoupon.max_discount)}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold text-green-800">Số tiền giảm:</span>
                                  <span className="text-sm font-bold text-green-600">
                                    -{formatPrice(manualDiscount)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Referral Code Section */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Mã giới thiệu (nếu có)</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nhập mã người giới thiệu..."
                      value={referralCode}
                      onChange={e => {
                        setReferralCode(e.target.value);
                        if (referralMsg) setReferralMsg('');
                      }}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      onClick={applyReferralCode}
                      className="px-3 py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition-colors"
                    >
                      Áp dụng
                    </button>
                  </div>
                  {referralMsg && (
                    <p className={`mt-1.5 text-xs ${referralMsg.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>
                      {referralMsg}
                    </p>
                  )}
                  {referralName && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in">
                      <p className="text-xs text-blue-800">
                        <span className="font-semibold">Người giới thiệu:</span> {referralName}
                      </p>
                    </div>
                  )}
                </div>

                {/* Price Summary */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {selectedCoupon && activeSavedCoupon && (
                    <div className="flex justify-between font-semibold text-green-600">
                      <span>
                        Giảm giá voucher
                        {activeSavedCoupon.discount_type === 'percent' && (
                          <span className="text-xs font-normal text-gray-400 ml-1">
                            ({activeSavedCoupon.discount}%)
                          </span>
                        )}
                      </span>
                      <span>-{formatPrice(totalDiscount)}</span>
                    </div>
                  )}
                  {manualDiscount > 0 && validatedCoupon && (
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span>
                        Giảm giá voucher
                        {validatedCoupon.discount_type === 'percent' && (
                          <span className="text-xs font-normal text-gray-400 ml-1">
                            ({validatedCoupon.discount}%)
                          </span>
                        )}
                      </span>
                      <span>-{formatPrice(manualDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                    <span>Tổng tiền</span>
                    <span className="text-primary-600 text-xl">{formatPrice(total)}</span>
                  </div>
                </div>

                <button onClick={handleCheckout} disabled={loading}
                  className="w-full py-4 bg-gradient-brand text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {loading ? (
                    <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Đang xử lý...</>
                  ) : 'Thanh toán ngay'}
                </button>

                <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
                  <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  Bảo mật SSL 256-bit
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <CheckoutForm />
    </Suspense>
  );
}