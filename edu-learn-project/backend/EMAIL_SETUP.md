# Email Notification System Setup Guide

## Overview
This system automatically sends a thank you email to customers when they confirm payment for an order. The email includes order details and important information about accessing their courses.

## Features Implemented

### 1. Email Service (`emailService.js`)
- **Purpose**: Handles sending order confirmation emails
- **Email Template**: Professional HTML email with:
  - DRIVE MH branding
  - Customer information (name, email, order ID)
  - Order details (courses, prices, total)
  - Payment method information
  - Important notice about checking email for course access
  - Contact information

### 2. Database Configuration (`email_config` table)
Stores email server settings:
- `service`: Email service (gmail, outlook, etc.)
- `host`: SMTP server host
- `port`: SMTP port (default: 587)
- `secure`: SSL/TLS enabled (default: false)
- `email`: Sender email address
- `password`: Email password or app password
- `from_name`: Sender display name
- `updated_at`: Last update timestamp

### 3. Automatic Email Trigger
When a user creates an order via `POST /api/orders`:
1. Order is saved to database
2. User information and order details are fetched
3. Email is sent asynchronously (doesn't block the response)
4. Order confirmation is returned to frontend

### 4. Admin API Endpoints

#### Get Email Configuration
```
GET /api/admin/email-config
Headers: Authorization: Bearer <token>
```
Returns current email configuration (password excluded for security)

#### Update Email Configuration
```
PUT /api/admin/email-config
Headers: Authorization: Bearer <token>
Body: {
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  email: "ptthong.www@gmail.com",
  password: "your-app-password",
  from_name: "DRIVE MH - Học viện trực tuyến"
}
```

## Setup Instructions

### Step 1: Gmail Configuration (Recommended)

1. **Enable 2-Factor Authentication** on ptthong.www@gmail.com
2. **Generate App Password**:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Copy the 16-character password

3. **Update Email Configuration**:
   ```bash
   curl -X PUT http://localhost:5000/api/admin/email-config \
     -H "Authorization: Bearer <admin_token>" \
     -H "Content-Type: application/json" \
     -d '{
       "service": "gmail",
       "host": "smtp.gmail.com",
       "port": 587,
       "secure": false,
       "email": "ptthong.www@gmail.com",
       "password": "your-16-char-app-password",
       "from_name": "DRIVE MH - Học viện trực tuyến"
     }'
   ```

### Step 2: Alternative Email Providers

#### Outlook/Hotmail
```json
{
  "service": "outlook",
  "host": "smtp.office365.com",
  "port": 587,
  "secure": false,
  "email": "your-email@outlook.com",
  "password": "your-password"
}
```

#### Custom SMTP
```json
{
  "service": "custom",
  "host": "smtp.your-domain.com",
  "port": 587,
  "secure": false,
  "email": "noreply@your-domain.com",
  "password": "your-smtp-password"
}
```

## Email Template Features

### HTML Design
- **Responsive**: Works on mobile and desktop
- **Professional**: Gradient header with DRIVE MH branding
- **Organized**: Clear sections for order info, details, and notices
- **Styled**: Modern design with colors matching the website

### Content Includes
1. **Header**: DRIVE MH logo and tagline
2. **Thank You Message**: Confirmation of order receipt
3. **Customer Information**:
   - Full name
   - Email address
   - Order ID (monospace font for easy copying)
4. **Order Details**:
   - Course names
   - Individual prices
   - Total amount
5. **Payment Method**: How the customer paid
6. **Important Notice**: 
   - "Vui lòng kiểm tra email sau ít phút nữa để nhận thông tin truy cập khóa học"
   - Instructions to check spam folder
   - Contact email: ptthong.www@gmail.com
7. **Footer**: Copyright and contact information

## Testing

### Test Email Sending
1. Create a test order through the frontend
2. Check the backend console for logs:
   ```
   Order confirmation email sent: <message-id>
   ```
3. Verify email received at customer's inbox
4. Check spam folder if not in inbox

### Common Issues

#### Issue: "Invalid login" error
**Solution**: Use App Password instead of regular password for Gmail

#### Issue: "Connection timeout"
**Solution**: 
- Check firewall settings
- Verify SMTP port is not blocked
- Try port 465 with secure: true

#### Issue: Email not sending
**Solution**:
- Check backend logs for errors
- Verify email configuration in database
- Test SMTP credentials manually

## Security Notes

1. **Password Storage**: Email passwords are stored in database (consider encryption for production)
2. **API Protection**: Email config endpoints require MANAGER role
3. **Password Exposure**: GET endpoint never returns the password
4. **Async Sending**: Email sending doesn't block order creation

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS email_config (
  id TEXT PRIMARY KEY,
  service TEXT DEFAULT 'gmail',
  host TEXT DEFAULT 'smtp.gmail.com',
  port INTEGER DEFAULT 587,
  secure INTEGER DEFAULT 0,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  from_name TEXT DEFAULT 'DRIVE MH - Học viện trực tuyến',
  updated_at TEXT NOT NULL
);
```

## Files Modified/Created

1. **Created**: `backend/emailService.js` - Email service with nodemailer
2. **Modified**: `backend/db.js` - Added email_config table
3. **Modified**: `backend/index.js` - Added email integration and admin APIs
4. **Created**: `backend/EMAIL_SETUP.md` - This documentation

## Next Steps

1. Configure email settings using the admin API
2. Test with a sample order
3. Monitor email delivery (consider using email tracking service)
4. Set up proper email templates for other notifications (optional)
5. Consider implementing email queue for high volume (optional)

## Support

For issues or questions:
- Check backend logs: `console.log('Failed to send order confirmation email:', err)`
- Verify email configuration: `GET /api/admin/email-config`
- Test SMTP connection manually using nodemailer documentation

---

**Note**: The default email configuration uses ptthong.www@gmail.com. You must update the password with a valid Gmail app password before emails can be sent.