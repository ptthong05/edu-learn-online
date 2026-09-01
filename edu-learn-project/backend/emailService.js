'use strict';

const nodemailer = require('nodemailer');
const { getDatabase } = require('./db');

// Cache: { email, password, transporter }
let cachedTransporter = null;
let cachedEmail = null;

async function getTransporter() {
  const db = await getDatabase();
  // Always get fresh config from database to detect changes
  const config = await db.get("SELECT * FROM email_config WHERE id = 'main'");

  const currentEmail = config && config.email ? config.email : null;
  const currentPassword = config && config.password && config.password.trim() !== '' ? config.password : null;

  // If email changed, reset cache
  if (cachedEmail !== currentEmail) {
    cachedTransporter = null;
    cachedEmail = currentEmail;
  }

  if (cachedTransporter) return cachedTransporter;

  if (currentEmail && currentPassword) {
    console.log('Using email config from database:', currentEmail);
    cachedTransporter = nodemailer.createTransport({
      service: config.service || 'gmail',
      host: config.host || 'smtp.gmail.com',
      port: config.port || 587,
      secure: config.secure || false,
      auth: {
        user: currentEmail,
        pass: currentPassword
      }
    });
  } else {
    // Fallback to default Gmail config
    console.log('Using default Gmail config (no database config found)');
    cachedTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ptthong.www@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password-here'
      }
    });
  }

  return cachedTransporter;
}

function buildItemsHtml(items) {
  if (!items || items.length === 0) {
    return '<tr><td colspan="2" style="padding: 12px;">Không có chi tiết</td></tr>';
  }
  return items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <div style="font-weight: 600; color: #111827;">${item.product_name || item.title || 'Khóa học'}</div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #2563eb;">
        ${item.price ? Number(item.price).toLocaleString('vi-VN') + 'đ' : 'N/A'}
      </td>
    </tr>
  `).join('');
}

function buildOrderEmailHtml({ siteName, fromEmail, userName, userEmail, orderId, orderDetails }) {
  const itemsHtml = buildItemsHtml(orderDetails.items);
  const totalFormatted = orderDetails.total ? Number(orderDetails.total).toLocaleString('vi-VN') + 'đ' : 'N/A';
  const paymentMethod = orderDetails.payment_method || 'Chuyển khoản ngân hàng';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cảm ơn bạn đã đặt hàng</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">${siteName}</h1>
          <p style="color: #dbeafe; margin: 10px 0 0 0; font-size: 14px;">Nền tảng học trực tuyến hàng đầu</p>
        </div>
        <div style="padding: 40px 30px 30px 30px; text-align: center; background-color: #fef3c7;">
          <h2 style="color: #111827; margin: 0 0 10px 0; font-size: 24px;">Cảm ơn bạn đã đặt hàng!</h2>
          <p style="color: #6b7280; margin: 0; font-size: 16px;">Đơn hàng của bạn đã được tiếp nhận và đang chờ xử lý</p>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">📋 Thông tin người đặt</h3>
            <p style="margin: 8px 0; color: #4b5563;"><strong>Họ tên:</strong> ${userName || 'N/A'}</p>
            <p style="margin: 8px 0; color: #4b5563;"><strong>Email:</strong> ${userEmail}</p>
            <p style="margin: 8px 0; color: #4b5563;"><strong>Mã đơn hàng:</strong> <span style="font-family: monospace; background-color: #e5e7eb; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${orderId}</span></p>
          </div>
          <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">📦 Chi tiết đơn hàng</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Khóa học</th>
                <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Giá</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr style="background-color: #fef3c7;">
                <td style="padding: 15px 12px; font-weight: bold; color: #111827; border-top: 2px solid #e5e7eb;">Tổng tiền</td>
                <td style="padding: 15px 12px; text-align: right; font-weight: bold; color: #2563eb; font-size: 18px; border-top: 2px solid #e5e7eb;">${totalFormatted}</td>
              </tr>
            </tfoot>
          </table>
          <div style="background-color: #dbeafe; border-left: 4px solid #2563eb; padding: 15px; border-radius: 6px; margin-top: 20px;">
            <p style="margin: 0; color: #1e40af; font-weight: 600;">📌 Phương thức thanh toán: ${paymentMethod}</p>
          </div>
        </div>
        <div style="padding: 30px; background-color: #fef3c7; border-top: 1px solid #fbbf24;">
          <p style="color: #92400e; margin: 0; line-height: 1.6;">Vui lòng kiểm tra email sau ít phút nữa để nhận thông tin vào học. Hỗ trợ: <a href="mailto:${fromEmail}" style="color: #2563eb;">${fromEmail}</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function buildOrderEmailText({ siteName, fromEmail, userName, userEmail, orderId, orderDetails }) {
  const itemsText = orderDetails.items?.map(item => `- ${item.product_name || item.title}: ${item.price ? Number(item.price).toLocaleString('vi-VN') + 'đ' : 'N/A'}`).join('\n') || 'Không có chi tiết';
  const totalFormatted = orderDetails.total ? Number(orderDetails.total).toLocaleString('vi-VN') + 'đ' : 'N/A';
  const paymentMethod = orderDetails.payment_method || 'Chuyển khoản ngân hàng';

  return `Cảm ơn bạn đã đặt hàng tại ${siteName}!\n\nNgười đặt: ${userName || 'N/A'} (${userEmail})\nMã đơn hàng: ${orderId}\n\nChi tiết:\n${itemsText}\n\nTổng tiền: ${totalFormatted}\nPhương thức: ${paymentMethod}\n\nTrân trọng,\n${siteName}\nEmail: ${fromEmail}`;
}

async function sendOrderConfirmationEmail(orderId, userEmail, userName, orderDetails) {
  try {
    const db = await getDatabase();
    const config = await db.get("SELECT * FROM email_config WHERE id = 'main'");
    const siteSettings = await db.get("SELECT * FROM site_settings WHERE id = 'settings-main'");
    const siteName = siteSettings?.site_name || 'DRIVE MH';
    const fromEmail = (config && config.email) ? config.email : 'ptthong.www@gmail.com';
    const fromName = `${siteName} - Học viện trực tuyến`;

    cachedTransporter = null;
    cachedEmail = null;
    const transport = await getTransporter();

    try {
      await transport.verify();
    } catch (verifyError) {
      return { success: false, error: 'Email configuration invalid: ' + verifyError.message, needsConfiguration: true };
    }

    const payload = { siteName, fromEmail, userName, userEmail, orderId, orderDetails };
    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: userEmail,
      subject: `Cảm ơn bạn đã đặt hàng - ${siteName}`,
      html: buildOrderEmailHtml(payload),
      text: buildOrderEmailText(payload)
    };

    const result = await transport.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendOrderConfirmationEmail,
  getTransporter
};