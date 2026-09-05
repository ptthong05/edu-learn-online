'use strict';

const jwt = require('jsonwebtoken');
const { getDatabase } = require('./db');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'Token không tồn tại.'
    });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || 'edulearn_super_secret_key_123!@#',
    (err, user) => {
      if (err) {
        return res.status(403).json({
          message: 'Token không hợp lệ hoặc đã hết hạn.'
        });
      }

      req.user = user;
      return next();
    }
  );
}

async function checkUserStatus(req, res, next) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      message: 'Không xác định được người dùng.'
    });
  }

  try {
    const db = await getDatabase();

    const currentUser = await db.get(
      'SELECT id, status FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!currentUser) {
      return res.status(403).json({
        message: 'Tài khoản không còn tồn tại.'
      });
    }

    if (currentUser.status === 'blocked') {
      return res.status(403).json({
        message:
          'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.'
      });
    }

    req.user.status = currentUser.status;

    return next();
  } catch (error) {
    console.error('checkUserStatus error:', error);

    return res.status(500).json({
      message: 'Lỗi server khi kiểm tra trạng thái tài khoản.'
    });
  }
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Bạn không có quyền thực hiện thao tác này.'
      });
    }

    return next();
  };
}

module.exports = {
  authenticateToken,
  checkUserStatus,
  requireRole
};