const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token không tồn tại.' });

  jwt.verify(token, process.env.JWT_SECRET || 'edulearn_super_secret_key_123!@#', (err, user) => {
    if (err) return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    req.user = user;
    next();
  });
}

function checkUserStatus(req, res, next) {
  // Skip status check for public routes and auth routes
  const publicRoutes = ['/api/auth/login', '/api/auth/register', '/api/courses', '/api/categories', '/api/combos', '/api/coupons', '/api/blogs', '/api/faqs', '/api/contact-info', '/api/site-pages', '/api/terms-of-service', '/api/purchase-guide', '/api/introduction', '/api/contact-settings', '/api/faq-settings', '/api/blog-categories', '/api/affiliates/register', '/api/affiliates/status', '/api/affiliates/clicks', '/api/affiliates/guides', '/api/affiliates/settings/terms', '/api/affiliates/courses', '/api/affiliates/notifications', '/api/affiliates/notification-count', '/api/affiliates/report', '/api/affiliates/withdrawals', '/api/affiliates/validate', '/api/coupons/validate', '/api/orders/upload-proof', '/api/orders'];
  
  const isPublicRoute = publicRoutes.some(route => req.path === route || req.path.startsWith(route + '/'));
  
  if (isPublicRoute) {
    return next();
  }

  // Block access to all admin routes for blocked users
  if (req.user && req.user.status === 'blocked' && req.path.startsWith('/api/admin')) {
    return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.' });
  }

  next();
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này.' });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  checkUserStatus,
  requireRole
};
