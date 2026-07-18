// Simple email test and configuration script
// Usage: node test-email.js

const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('=== EMAIL TEST & CONFIGURATION ===\n');
  
  // Check if .env file exists
  const fs = require('fs');
  const path = require('path');
  
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    console.log('✓ Found .env file');
    require('dotenv').config();
  } else {
    console.log('✗ No .env file found');
  }
  
  // Check for EMAIL_PASSWORD in environment
  const emailPassword = process.env.EMAIL_PASSWORD;
  
  console.log('\nCurrent Configuration:');
  console.log('Email:', 'ptthong.www@gmail.com');
  console.log('Password:', emailPassword ? '***SET***' : '❌ NOT SET');
  console.log('');
  
  if (!emailPassword) {
    console.log('⚠️  EMAIL PASSWORD NOT CONFIGURED!');
    console.log('\n📝 TO FIX THIS:');
    console.log('1. Create a .env file in the backend folder');
    console.log('2. Add this line:');
    console.log('   EMAIL_PASSWORD=your-16-char-app-password');
    console.log('3. Restart the backend server');
    console.log('\nOr run: node setup-email.js YOUR_APP_PASSWORD');
    console.log('');
    process.exit(1);
  }
  
  // Test email sending
  console.log('📧 Testing email sending...\n');
  
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ptthong.www@gmail.com',
        pass: emailPassword
      }
    });
    
    // Verify connection
    await transporter.verify();
    console.log('✓ Email connection verified!');
    
    // Send test email
    const info = await transporter.sendMail({
      from: '"DRIVE MH" <ptthong.www@gmail.com>',
      to: 'ptthong.www@gmail.com',
      subject: 'Test Email - DRIVE MH',
      text: 'This is a test email to verify email configuration.',
      html: '<h1>Test Email</h1><p>Email configuration is working!</p>'
    });
    
    console.log('✓ Test email sent successfully!');
    console.log('  Message ID:', info.messageId);
    console.log('\n✅ Email is configured correctly!');
    console.log('   Emails will be sent when users confirm payment.');
    
  } catch (error) {
    console.error('✗ Failed to send test email:');
    console.error('  Error:', error.message);
    console.log('\n❌ Email configuration is invalid.');
    console.log('   Please check:');
    console.log('   1. App Password is correct (16 characters)');
    console.log('   2. 2-Factor Authentication is enabled');
    console.log('   3. Gmail account is not blocked');
    process.exit(1);
  }
}

// Run with command line argument
if (process.argv[2]) {
  console.log('Setting EMAIL_PASSWORD from command line...\n');
  process.env.EMAIL_PASSWORD = process.argv[2];
}

testEmail();