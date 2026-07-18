// Setup script to configure email settings
// Run this script to configure email for the application

const db = require('./db');

async function setupEmail() {
  try {
    console.log('🔧 Setting up email configuration...\n');
    
    // Get current config
    const config = await db.get("SELECT * FROM email_config WHERE id = 'main'");
    
    console.log('Current email configuration:');
    console.log('Email:', config?.email || 'ptthong.www@gmail.com');
    console.log('Service:', config?.service || 'gmail');
    console.log('Host:', config?.host || 'smtp.gmail.com');
    console.log('Port:', config?.port || 587);
    console.log('Password:', config?.password ? '***configured***' : '❌ NOT SET');
    console.log('');
    
    if (!config || !config.password || config.password.trim() === '') {
      console.log('⚠️  Email password is not configured!');
      console.log('📝 To configure email, you need to:');
      console.log('');
      console.log('1. Enable 2-Factor Authentication on ptthong.www@gmail.com');
      console.log('   - Go to: https://myaccount.google.com/security');
      console.log('   - Enable "2-Step Verification"');
      console.log('');
      console.log('2. Generate an App Password:');
      console.log('   - Go to: https://myaccount.google.com/security');
      console.log('   - Click "App passwords" (under 2-Step Verification)');
      console.log('   - Select "Mail" and "Other (custom name)"');
      console.log('   - Copy the 16-character password');
      console.log('');
      console.log('3. Update email configuration via API:');
      console.log('   curl -X PUT http://localhost:5000/api/admin/email-config \\');
      console.log('     -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \\');
      console.log('     -H "Content-Type: application/json" \\');
      console.log('     -d \'{"email":"ptthong.www@gmail.com","password":"YOUR_APP_PASSWORD"}\'');
      console.log('');
      console.log('Or use this script with environment variables:');
      console.log('   EMAIL_PASSWORD=your-app-password node setup-email.js');
      console.log('');
    } else {
      console.log('✅ Email is configured!');
      
      // Test email sending
      console.log('📧 Testing email sending...');
      const { sendOrderConfirmationEmail } = require('./emailService');
      
      const testResult = await sendOrderConfirmationEmail(
        'TEST-' + Date.now(),
        'ptthong.www@gmail.com',
        'Test User',
        {
          items: [{ product_name: 'Test Course', price: 100000 }],
          total: 100000,
          payment_method: 'bank_transfer'
        }
      );
      
      if (testResult.success) {
        console.log('✅ Test email sent successfully!');
        console.log('   Message ID:', testResult.messageId);
      } else {
        console.log('❌ Failed to send test email:', testResult.error);
        if (testResult.needsConfiguration) {
          console.log('   Please configure email password first.');
        }
      }
    }
    
    console.log('\n📊 Email status endpoint:');
    console.log('   GET http://localhost:5000/api/email/status');
    console.log('');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

// Check if EMAIL_PASSWORD is provided as environment variable
if (process.env.EMAIL_PASSWORD) {
  console.log('🔑 Found EMAIL_PASSWORD in environment, updating configuration...');
  
  db.run(
    `INSERT OR REPLACE INTO email_config (id, service, host, port, secure, email, password, from_name, updated_at)
     VALUES ('main', 'gmail', 'smtp.gmail.com', 587, 0, 'ptthong.www@gmail.com', ?, 'DRIVE MH - Học viện trực tuyến', ?)`,
    [process.env.EMAIL_PASSWORD, new Date().toISOString()]
  ).then(() => {
    console.log('✅ Email configuration updated!');
    console.log('   Email: ptthong.www@gmail.com');
    console.log('   Password: ***configured***');
    console.log('');
    return setupEmail();
  }).catch(err => {
    console.error('Error updating config:', err);
    process.exit(1);
  });
} else {
  setupEmail();
}