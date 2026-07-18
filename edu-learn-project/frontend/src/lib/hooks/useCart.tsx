'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Course, Combo, Coupon } from '@/types';
import toast from 'react-hot-toast';
import { useAuth } from './useAuth';

export interface CartItem {
  id: string;
  course?: Course;
  combo?: Combo;
  type: 'course' | 'combo';
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Course | Combo, type: 'course' | 'combo') => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  savedCoupons: Coupon[];
  saveCoupon: (coupon: Coupon) => void;
  removeCoupon: (couponId: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [savedCoupons, setSavedCoupons] = useState<Coupon[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load from localStorage whenever user changes (or on mount)
  useEffect(() => {
    try {
      const cartKey = user ? `cartItems_${user.id}` : 'cartItems';
      const couponKey = user ? `savedCoupons_${user.id}` : 'savedCoupons';
      
      const storedCart = localStorage.getItem(cartKey);
      const storedCoupons = localStorage.getItem(couponKey);
      
      setCartItems(storedCart ? JSON.parse(storedCart) : []);
      setSavedCoupons(storedCoupons ? JSON.parse(storedCoupons) : []);
    } catch (error) {
      console.error('Failed to load cart data from localStorage', error);
    }
  }, [user]);

  const addToCart = (item: Course | Combo, type: 'course' | 'combo') => {
    const existing = cartItems.find((i) => i.id === item.id);
    if (existing) {
      toast.error('Sản phẩm này đã có sẵn trong giỏ hàng!');
      return;
    }

    const newItem: CartItem = {
      id: item.id,
      type,
      course: type === 'course' ? (item as Course) : undefined,
      combo: type === 'combo' ? (item as Combo) : undefined,
    };

    const updated = [...cartItems, newItem];
    setCartItems(updated);
    
    const cartKey = user ? `cartItems_${user.id}` : 'cartItems';
    localStorage.setItem(cartKey, JSON.stringify(updated));
    toast.success('Đã thêm vào giỏ hàng thành công!');
  };

  const removeFromCart = (id: string) => {
    const updated = cartItems.filter((i) => i.id !== id);
    setCartItems(updated);
    
    const cartKey = user ? `cartItems_${user.id}` : 'cartItems';
    localStorage.setItem(cartKey, JSON.stringify(updated));
    toast.success('Đã xóa khỏi giỏ hàng.');
  };

  const clearCart = () => {
    setCartItems([]);
    const cartKey = user ? `cartItems_${user.id}` : 'cartItems';
    localStorage.removeItem(cartKey);
  };

  const saveCoupon = (coupon: Coupon) => {
    const existing = savedCoupons.find((c) => c.id === coupon.id);
    if (existing) {
      toast.error('Bạn đã lưu voucher này rồi!');
      return;
    }

    const updated = [...savedCoupons, coupon];
    setSavedCoupons(updated);
    
    const couponKey = user ? `savedCoupons_${user.id}` : 'savedCoupons';
    localStorage.setItem(couponKey, JSON.stringify(updated));
    toast.success('Đã lưu voucher thành công! Bạn có thể sử dụng khi thanh toán.');
  };

  const removeCoupon = (couponId: string) => {
    const updated = savedCoupons.filter((c) => c.id !== couponId);
    setSavedCoupons(updated);
    
    const couponKey = user ? `savedCoupons_${user.id}` : 'savedCoupons';
    localStorage.setItem(couponKey, JSON.stringify(updated));
    toast.success('Đã gỡ voucher.');
  };

  const cartCount = cartItems.length;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        savedCoupons,
        saveCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
