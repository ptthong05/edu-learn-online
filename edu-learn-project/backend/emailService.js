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

async function sendOrderConfirmationEmail(orderId, userEmail, userName, orderDetails) {
  try {
    const db = await getDatabase();
    // Always fetch fresh config each time email is sent
    const config = await db.get("SELECT * FROM email_config WHERE id = 'main'");
    
    // Fetch site name dynamically from site_settings table
    const siteSettings = await db.get("SELECT * FROM site_settings WHERE id = 'settings-main'");
    const siteName = siteSettings?.site_name || 'DRIVE MH';

    // Reset transporter cache so we pick up new email if admin changed it
    cachedTransporter = null;
    cachedEmail = null;

    const transport = await getTransporter();

    // Verify transporter
    try {
      await transport.verify();
      console.log('Email transporter verified successfully');
    } catch (verifyError) {
      console.error('Email transporter verification failed:', verifyError.message);
      return { success: false, error: 'Email configuration invalid: ' + verifyError.message, needsConfiguration: true };
    }

    // Get sender info from DB config (or fallback)
    // Always build fromName from dynamic siteName so it stays in sync with site settings
    const fromEmail = (config && config.email) ? config.email : 'ptthong.www@gmail.com';
    const fromName = `${siteName} - Học viện trực tuyến`;

    // Format order items
    const itemsHtml = orderDetails.items?.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <div style="font-weight: 600; color: #111827;">${item.product_name || item.title || 'Khóa học'}</div>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #2563eb;">
          ${item.price ? Number(item.price).toLocaleString('vi-VN') + 'đ' : 'N/A'}
        </td>
      </tr>
    `).join('') || '<tr><td colspan="2" style="padding: 12px;">Không có chi tiết</td></tr>';

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: userEmail,
      subject: `Cảm ơn bạn đã đặt hàng - ${siteName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Cảm ơn bạn đã đặt hàng</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">${siteName}</h1>
              <p style="color: #dbeafe; margin: 10px 0 0 0; font-size: 14px;">Nền tảng học trực tuyến hàng đầu</p>
            </div>

            <!-- Thank You Message -->
            <div style="padding: 40px 30px 30px 30px; text-align: center; background-color: #fef3c7;">
              <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 20px auto;">
                <tr>
                  <td align="center" valign="middle" style="width: 80px; height: 80px; background-color: #10b981; border-radius: 50%; text-align: center; vertical-align: middle;">
                    <span style="font-size: 36px; line-height: 80px; display: block; text-align: center; color: #ffffff; font-weight: bold;">✓</span>
                  </td>
                </tr>
              </table>
              <h2 style="color: #111827; margin: 0 0 10px 0; font-size: 24px;">Cảm ơn bạn đã đặt hàng!</h2>
              <p style="color: #6b7280; margin: 0; font-size: 16px;">Đơn hàng của bạn đã được tiếp nhận và đang chờ xử lý</p>
            </div>

            <!-- Order Info -->
            <div style="padding: 30px; background-color: #ffffff;">
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">📋 Thông tin người đặt</h3>
                <div>
                  <p style="margin: 8px 0; color: #4b5563;"><strong>Họ tên:</strong> ${userName || 'N/A'}</p>
                  <p style="margin: 8px 0; color: #4b5563;"><strong>Email:</strong> ${userEmail}</p>
                  <p style="margin: 8px 0; color: #4b5563;"><strong>Mã đơn hàng:</strong> <span style="font-family: monospace; background-color: #e5e7eb; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${orderId}</span></p>
                </div>
              </div>

              <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">📦 Chi tiết đơn hàng</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                  <tr style="background-color: #f3f4f6;">
                    <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Khóa học</th>
                    <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Giá</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr style="background-color: #fef3c7;">
                    <td style="padding: 15px 12px; font-weight: bold; color: #111827; border-top: 2px solid #e5e7eb;">Tổng tiền</td>
                    <td style="padding: 15px 12px; text-align: right; font-weight: bold; color: #2563eb; font-size: 18px; border-top: 2px solid #e5e7eb;">
                      ${orderDetails.total ? Number(orderDetails.total).toLocaleString('vi-VN') + 'đ' : 'N/A'}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div style="background-color: #dbeafe; border-left: 4px solid #2563eb; padding: 15px; border-radius: 6px; margin-top: 20px;">
                <p style="margin: 0; color: #1e40af; font-weight: 600;">📌 Phương thức thanh toán:</p>
                <p style="margin: 5px 0 0 0; color: #1e40af;">${orderDetails.payment_method || 'Chuyển khoản ngân hàng'}</p>
              </div>
            </div>

            <!-- Important Notice -->
            <div style="padding: 30px; background-color: #fef3c7; border-top: 1px solid #fbbf24;">
              <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; border: 2px dashed #f59e0b;">
                <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">⚠️ Lưu ý quan trọng</h3>
                <p style="color: #92400e; margin: 0; line-height: 1.6;">
                  Vui lòng <strong>kiểm tra email sau ít phút nữa</strong> để nhận thông tin đăng nhập và vào học.<br>
                  Nếu không nhận được email, vui lòng kiểm tra thư mục <strong>Spam/Junk</strong> hoặc liên hệ với chúng tôi qua email: <a href="mailto:${fromEmail}" style="color: #2563eb;">${fromEmail}</a>
                </p>
              </div>
            </div>

            <!-- Social Media Section -->
            <div style="padding: 30px; text-align: center; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <div style="margin-bottom: 20px; text-align: center;">
                <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px; font-weight: 600; text-align: center;">Kết nối với chúng tôi</p>
                <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto; border-collapse: collapse;">
                  <tr>
                    <!-- Facebook -->
                    <td style="padding: 0 10px; text-align: center; width: 48px;">
                      <a href="https://www.facebook.com/share/1B5GE4UyVp/" target="_blank" rel="noreferrer" style="display: block; width: 48px; height: 48px; line-height: 48px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; border-radius: 50%; text-decoration: none; font-weight: bold; font-size: 22px; text-align: center; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                        <span style="display: inline-block; vertical-align: middle; line-height: 48px; color: #ffffff;">f</span>
                      </a>
                    </td>
                    <!-- Telegram -->
                    <td style="padding: 0 10px; text-align: center; width: 48px;">
                      <a href="https://t.me/0932525650" target="_blank" rel="noreferrer" style="display: block; width: 48px; height: 48px; line-height: 48px; background: linear-gradient(135deg, #0088cc 0%, #005f8f 100%); color: #ffffff; border-radius: 50%; text-decoration: none; font-weight: bold; font-size: 13px; text-align: center; box-shadow: 0 4px 12px rgba(0, 136, 204, 0.3);">
                        <span style="display: inline-block; vertical-align: middle; line-height: 48px; color: #ffffff;">Tele</span>
                      </a>
                    </td>
                    <!-- Zalo -->
                    <td style="padding: 0 10px; text-align: center; width: 48px;">
                      <a href="https://zalo.me/0932525650" target="_blank" rel="noreferrer" style="display: block; width: 48px; height: 48px; line-height: 48px; background: linear-gradient(135deg, #0072ee 0%, #0052c2 100%); color: #ffffff; border-radius: 50%; text-decoration: none; font-weight: bold; font-size: 13px; text-align: center; box-shadow: 0 4px 12px rgba(0, 114, 238, 0.3);">
                        <span style="display: inline-block; vertical-align: middle; line-height: 48px; color: #ffffff;">Zalo</span>
                      </a>
                    </td>
                  </tr>
                </table>
              </div>
              
              <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">
                Cảm ơn bạn đã tin tưởng và lựa chọn <strong>${siteName}</strong>!
              </p>
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                © 2026 ${siteName}. All rights reserved.<br>
                Email: ${fromEmail} | Hotline: 0932525650
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
      text: `
Cảm ơn bạn đã đặt hàng!

Thông tin người đặt:
- Họ tên: ${userName || 'N/A'}
- Email: ${userEmail}
- Mã đơn hàng: ${orderId}

Chi tiết đơn hàng:
${orderDetails.items?.map(item => `- ${item.product_name || item.title}: ${item.price ? Number(item.price).toLocaleString('vi-VN') + 'đ' : 'N/A'}`).join('\n') || 'Không có chi tiết'}

Tổng tiền: ${orderDetails.total ? Number(orderDetails.total).toLocaleString('vi-VN') + 'đ' : 'N/A'}
Phương thức thanh toán: ${orderDetails.payment_method || 'Chuyển khoản ngân hàng'}

⚠️ Lưu ý: Vui lòng kiểm tra email sau ít phút nữa để nhận thông tin đăng nhập và vào học.

Trân trọng,
${siteName} - Học viện trực tuyến
Email: ${fromEmail}
      `
    };

    const result = await transport.sendMail(mailOptions);
    console.log('Order confirmation email sent:', result.messageId);
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