export type UserOrderStatus = 'pending' | 'completed' | 'cancelled';

export interface UserOrderItem {
  id: string;
  title: string;
  image?: string;
  price: number;
  type: 'course' | 'combo';
}

export interface UserOrder {
  id: string;
  userId: string;
  createdAt: string;
  paymentMethod: string;
  total: number;
  status: UserOrderStatus;
  paymentProof?: string | null;
  items: UserOrderItem[];
}
