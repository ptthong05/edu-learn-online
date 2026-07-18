import { getAuthToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper to handle API requests
async function apiRequest(path: string, options: RequestInit = {}) {
  const token = getAuthToken();
  
  const headers = {
    ...(!(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('API returned non-JSON response:', text);
      throw new Error('Server error. Please try again later.');
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Đã có lỗi xảy ra');
    }
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

export const api = {
  // Auth APIs
  login: (credentials: any) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (data: any) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  updateProfile: (data: any) => apiRequest('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Course APIs
  getCourses: (filters?: { search?: string; category?: string; price_range?: string; sort_by?: string }) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.price_range) params.append('price_range', filters.price_range);
    if (filters?.sort_by) params.append('sort_by', filters.sort_by);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/courses${query}`);
  },
  getCourseDetail: (id: string) => apiRequest(`/courses/${id}`),
  getMyCourses: () => apiRequest('/my-courses'),
  getAdminCourses: () => apiRequest('/admin/courses'),
  createCourse: (data: any) => apiRequest('/admin/courses', { method: 'POST', body: JSON.stringify(data) }),
  updateCourse: (id: string, data: any) => apiRequest(`/admin/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCourse: (id: string) => apiRequest(`/admin/courses/${id}`, { method: 'DELETE' }),

  // Category APIs
  getCategories: () => apiRequest('/categories'),
  createCategory: (name: string) => apiRequest('/admin/categories', { method: 'POST', body: JSON.stringify({ name }) }),
  updateCategory: (id: string, name: string) => apiRequest(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),
  deleteCategory: (id: string) => apiRequest(`/admin/categories/${id}`, { method: 'DELETE' }),

  // Combo APIs
  getCombos: () => apiRequest('/combos'),
  getComboDetail: (id: string) => apiRequest(`/combos/${id}`),
  createCombo: (data: any) => apiRequest('/admin/combos', { method: 'POST', body: JSON.stringify(data) }),
  updateCombo: (id: string, data: any) => apiRequest(`/admin/combos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCombo: (id: string) => apiRequest(`/admin/combos/${id}`, { method: 'DELETE' }),

  // Cart & Order APIs
  createOrder: (data: any) => apiRequest('/orders', { method: 'POST', body: JSON.stringify(data) }),
  getMyOrders: () => apiRequest('/orders'),
  getAdminOrders: () => apiRequest('/admin/orders'),
  updateOrderStatus: (id: string, status: string, points_action?: string) => apiRequest(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, points_action }) }),
  updateAdminOrderStatus: (id: string, status: string, points_action?: string) => apiRequest(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, points_action }) }),
  updatePaymentStatus: (id: string, payment_status: string) => apiRequest(`/admin/orders/${id}/payment-status`, { method: 'PATCH', body: JSON.stringify({ payment_status }) }),
  getAdminStats: () => apiRequest('/admin/stats'),
  getAdminMonthlyStats: (month?: string) => {
    const url = month ? `/admin/stats/monthly?month=${encodeURIComponent(month)}` : '/admin/stats/monthly';
    return apiRequest(url);
  },
  getAdminMonthlyCumulativeStats: (month?: string) => {
    const url = month ? `/admin/stats/monthly-cumulative?month=${encodeURIComponent(month)}` : '/admin/stats/monthly-cumulative';
    return apiRequest(url);
  },
  getAdminAccounts: () => apiRequest('/admin/accounts'),
  createAdminAccount: (data: any) => apiRequest('/admin/accounts', { method: 'POST', body: JSON.stringify(data) }),
  getAdminUsers: () => apiRequest('/admin/users'),
  updateAdminUserStatus: (id: string, status: string) => apiRequest(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  updateAdminAccountStatus: (id: string, status: string) => apiRequest(`/admin/accounts/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  updateAdminAccount: (id: string, data: any) => apiRequest(`/admin/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getAdminUserOrders: (id: string) => apiRequest(`/admin/users/${id}/orders`),
  uploadPaymentProof: (orderId: string, paymentProof: string) => apiRequest('/orders/upload-proof', { method: 'POST', body: JSON.stringify({ order_id: orderId, proof_image: paymentProof }) }),

  // Contact Info & Blogs APIs
  getContactInfo: () => apiRequest('/contact-info'),
  getFaqs: () => apiRequest('/faqs'),
  getFaqSettings: () => apiRequest('/faq-settings'),
  getSitePage: (slug: string) => apiRequest(`/site-pages/${slug}`),
  getTermsOfService: () => apiRequest('/terms-of-service'),
  getPurchaseGuide: () => apiRequest('/purchase-guide'),
  getIntroduction: () => apiRequest('/introduction'),
  getContactSettings: () => apiRequest('/contact-settings'),
  getAdminWebsiteContent: () => apiRequest('/admin/website-content'),
  updateAdminWebsiteContent: (section: string, data: any) => apiRequest(`/admin/website-content/${section}`, { method: 'PUT', body: JSON.stringify({ data }) }),
  
  // Blog APIs
  getBlogs: (category_id?: string) => {
    const params = new URLSearchParams();
    if (category_id) params.append('category_id', category_id);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/blogs${query}`);
  },
  getBlogDetail: (id: string) => apiRequest(`/blogs/${id}`),
  getBlogCategories: () => apiRequest('/blog-categories'),

  // Admin Blog & Category APIs
  createAdminBlogCategory: (data: { name: string }) => apiRequest('/admin/blog-categories', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminBlogCategory: (id: string, data: { name: string }) => apiRequest(`/admin/blog-categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminBlogCategory: (id: string) => apiRequest(`/admin/blog-categories/${id}`, { method: 'DELETE' }),

  createAdminBlog: (data: any) => apiRequest('/admin/blogs', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminBlog: (id: string, data: any) => apiRequest(`/admin/blogs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminBlog: (id: string) => apiRequest(`/admin/blogs/${id}`, { method: 'DELETE' }),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiRequest('/admin/upload-image', { method: 'POST', body: formData });
  },

  // Affiliate APIs
  registerAffiliate: (data: any) => apiRequest('/affiliates/register', { method: 'POST', body: JSON.stringify(data) }),
  getAffiliateStatus: () => apiRequest('/affiliates/status'),
  getAdminAffiliates: () => apiRequest('/admin/affiliates'),
  updateAffiliateStatus: (id: string, status: string) => apiRequest(`/admin/affiliates/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getAdminAffiliateRevenues: () => apiRequest('/admin/affiliate-revenues'),
  updateAdminAffiliateRevenueStatus: (id: string, status: string) => apiRequest(`/admin/affiliate-revenues/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  recordAffiliateClick: (data: { ref: string; url: string }) => apiRequest('/affiliate/clicks', { method: 'POST', body: JSON.stringify(data) }),
  validateReferralCode: (ref: string) => apiRequest(`/affiliate/validate?ref=${encodeURIComponent(ref)}`),
  getAffiliateReport: (startDate?: string, endDate?: string) => {

    let url = '/affiliate/report';
    if (startDate && endDate) {
      url += `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
    }
    return apiRequest(url);
  },

  // Affiliate Portal APIs
  getAffiliateCourses: () => apiRequest('/affiliate/courses'),
  getAffiliateNotifications: () => apiRequest('/affiliate/notifications'),
  getAffiliateNotificationCount: () => apiRequest('/affiliate/notification-count'),
  getAdminAffiliateNotifications: () => apiRequest('/admin/affiliate-notifications'),
  getAdminAffiliateCommissionStats: (month: string) => apiRequest(`/admin/affiliate-commission-stats?month=${encodeURIComponent(month)}`),
  changePassword: (new_password: string) => apiRequest('/auth/change-password', { method: 'PUT', body: JSON.stringify({ new_password }) }),
  
  // Withdrawal APIs
  createWithdrawal: (data: any) => apiRequest('/affiliate/withdrawals', { method: 'POST', body: JSON.stringify(data) }),
  getWithdrawals: () => apiRequest('/affiliate/withdrawals'),
  getAdminWithdrawals: () => apiRequest('/admin/withdrawals'),
  updateWithdrawalStatus: (id: string, status: string, admin_note?: string) => apiRequest(`/admin/withdrawals/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, admin_note }) }),

  // Affiliate Guides APIs
  getAffiliateGuides: () => apiRequest('/affiliate/guides'),
  getAdminAffiliateGuides: () => apiRequest('/admin/affiliate-guides'),
  createAdminAffiliateGuide: (data: any) => apiRequest('/admin/affiliate-guides', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminAffiliateGuide: (id: string, data: any) => apiRequest(`/admin/affiliate-guides/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminAffiliateGuide: (id: string) => apiRequest(`/admin/affiliate-guides/${id}`, { method: 'DELETE' }),

  // Affiliate Terms & Conditions APIs
  getAffiliateTerms: () => apiRequest('/affiliate/settings/terms'),
  getAdminAffiliateTerms: () => apiRequest('/admin/affiliate/settings/terms'),
  updateAdminAffiliateTerms: (terms: string) => apiRequest('/admin/affiliate/settings/terms', { method: 'PUT', body: JSON.stringify({ terms }) }),

  // Coupon & Promotion APIs
  getCoupons: () => apiRequest('/coupons'),
  validateCoupon: (code: string, orderAmount?: number) => apiRequest('/coupons/validate', { 
    method: 'POST', 
    body: JSON.stringify({ 
      code,
      order_amount: orderAmount 
    }) 
  }),
  getAdminCoupons: () => apiRequest('/admin/coupons'),
  createAdminCoupon: (data: any) => apiRequest('/admin/coupons', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminCoupon: (id: string, data: any) => apiRequest(`/admin/coupons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminCoupon: (id: string) => apiRequest(`/admin/coupons/${id}`, { method: 'DELETE' }),
};
