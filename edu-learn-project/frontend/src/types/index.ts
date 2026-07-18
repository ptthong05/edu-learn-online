// ============ USER & AUTH ============
export interface User {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  password?: string;
  avatar?: string;
  role: 'USER';
  status: 'active' | 'blocked';
  created_at: string;
}

export interface Admin {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  password?: string;
  role: 'MANAGER' | 'STAFF';
  status: 'active' | 'blocked';
  created_at: string;
}

// ============ CATEGORY ============
export interface Category {
  id: string;
  name: string;
  icon?: string;
  course_count?: number;
}

// ============ COURSE ============
export interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  video_intro?: string;
  price: number;
  sale_price?: number;
  category_id: string;
  category?: Category;
  instructor?: string;
  instructor_avatar?: string;
  rating?: number;
  reviews_count?: number;
  students_count?: number;
  duration?: string;
  lessons_count?: number;
  level?: 'Cơ bản' | 'Trung cấp' | 'Nâng cao';
  language?: string;
  status?: 'published' | 'draft' | 'hidden' | 'inactive';
  is_bestseller?: boolean;
  is_featured?: boolean;
  is_new?: boolean;
  is_on_sale?: boolean;
  created_at?: string;
  content_html?: string;
  highlights?: string[];
  content?: CourseContent[];
}

export interface CourseContent {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'document';
  is_preview?: boolean;
}

// ============ COMBO ============
export interface Combo {
  id: string;
  title: string;
  image: string;
  description: string;
  price: number;
  sale_price?: number;
  courses?: Course[];
  status?: 'active' | 'inactive' | 'published' | 'draft';
  created_at?: string;
}

// ============ CART ============
export interface CartItem {
  id: string;
  course_id: string;
  course: Course;
  type: 'course' | 'combo';
  combo_id?: string;
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
}

// ============ ORDER ============
export interface Order {
  id: string;
  user_id: string;
  user?: User;
  total: number;
  payment_method: 'qr_banking' | 'vnpay' | 'momo';
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  order_id: string;
  course_id: string;
  course?: Course;
  price: number;
}

// ============ REVIEW ============
export interface Review {
  id: string;
  user_id: string;
  user?: User;
  course_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

// ============ COUPON ============
export interface Coupon {
  id: string;
  code: string;
  discount: number;
  discount_type: 'percent' | 'fixed';
  quantity: number;
  used_count: number;
  expired_date: string;
  status: 'active' | 'inactive';
  usable_by?: 'user' | 'affiliate';
  description?: string;
  max_discount?: number;
  min_order_amount?: number;
}

// ============ BANNER ============
export interface Banner {
  id: string;
  title: string;
  image: string;
  link?: string;
  display_order: number;
  status: 'active' | 'inactive';
}

// ============ DASHBOARD ============
export interface DashboardStats {
  total_revenue: number;
  total_students: number;
  total_courses: number;
  total_orders: number;
  revenue_change: number;
  students_change: number;
  courses_change: number;
  orders_change: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
}

// ============ PAGINATION ============
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ============ AFFILIATE GUIDE ============
export interface AffiliateGuide {
  id: string;
  title: string;
  content: string;
  display_order: number;
  created_at: string;
  updated_at?: string;
}
