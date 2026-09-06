'use strict';

// Interactive email configuration script
// Run: node configure-email.js

const readline = require('readline');
const db = require('./db');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function configureEmail() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   DRIVE MH - Email Configuration Setup                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('📧 Email Sender Configuration');
  console.log('─────────────────────────────────────────────────────────────\n');

  const currentConfig = await db.get("SELECT * FROM email_config WHERE id = 'main'");
  
  console.log('Current Configuration:');
  console.log(`  Email: ${currentConfig?.email || 'ptthong.www@gmail.com'}`);
  console.log(`  Password: ${currentConfig?.password ? '***configured***' : '❌ NOT SET'}`);
  console.log(`  Service: ${currentConfig?.service || 'gmail'}`);
  console.log('');

  console.log('⚠️  IMPORTANT: Before continuing, you need:');
  console.log('   1. Gmail 2-Factor Authentication enabled');
  console.log('   2. Gmail App Password (16 characters)');
  console.log('');
  console.log('   Get App Password at: https://myaccount.google.com/security');
  console.log('   → App passwords → Generate\n');

  const email = await question('Enter sender email (default: ptthong.www@gmail.com): ');
  const finalEmail = email.trim() || 'ptthong.www@gmail.com';

  const password = await question('Enter Gmail App Password (16 chars): ');
  
  if (!password || password.trim().length < 10) {
    console.log('\n❌ Invalid password. Please provide a valid App Password.');
    rl.close();
    process.exit(1);
  }

  const fromName = await question('Enter sender name (default: DRIVE MH - Học viện trực tuyến): ');
  const finalFromName = fromName.trim() || 'DRIVE MH - Học viện trực tuyến';

  console.log('\n💾 Saving configuration...');

  try {
    const now = new Date().toISOString();
    await db.run(
      `INSERT OR REPLACE INTO email_config (id, service, host, port, secure, email, password, from_name, updated_at)
       VALUES ('main', 'gmail', 'smtp.gmail.com', 587, 0, ?, ?, ?, ?)`,
      [finalEmail, password.trim(), finalFromName, now]
    );

    console.log('✅ Configuration saved successfully!\n');
    console.log('📊 Testing email connection...\n');

    // Test the configuration
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: finalEmail,
        pass: password.trim()
      }
    });

    try {
      await transporter.verify();
      console.log('✅ Email connection verified!\n');

      // Send test email
      console.log('📧 Sending test email...\n');
      const info = await transporter.sendMail({
        from: `"${finalFromName}" <${finalEmail}>`,
        to: finalEmail,
        subject: '✅ Email Configuration Successful - DRIVE MH',
        text: 'Congratulations! Your email configuration is working correctly. Emails will now be sent automatically when users confirm payment.',
        html: `
          <h1>✅ Email Configuration Successful!</h1>
          <p>Your email configuration is working correctly.</p>
          <p><strong>From:</strong> ${finalFromName} <${finalEmail}></p>
          <p>Emails will now be sent automatically when users confirm payment.</p>
          <hr>
          <p><small>DRIVE MH - Học viện trực tuyến</small></p>
        `
      });

      console.log('✅ Test email sent successfully!');
      console.log(`   Message ID: ${info.messageId}\n`);
      console.log('════════════════════════════════════════════════════════════');
      console.log('🎉 SETUP COMPLETE!');
      console.log('════════════════════════════════════════════════════════════\n');
      console.log('✅ Email is now configured and working!');
      console.log('✅ Test email sent to:', finalEmail);
      console.log('\n📝 Next steps:');
      console.log('   1. Check your inbox for the test email');
      console.log('   2. If not found, check Spam/Junk folder');
      console.log('   3. Create a test order to verify automatic emails work');
      console.log('\n🔍 Check status anytime:');
      console.log('   curl http://localhost:5000/api/email/status\n');

    } catch (testError) {
      console.error('❌ Email test failed:', testError.message);
      console.log('\n⚠️  Configuration saved but test failed.');
      console.log('   Please check:');
      console.log('   1. App Password is correct');
      console.log('   2. 2-Factor Authentication is enabled');
      console.log('   3. Gmail account is accessible\n');
    }

  } catch (error) {
    console.error('\n❌ Failed to save configuration:', error.message);
  }

  rl.close();
}

configureEmail().catch(err => {
  console.error('Error:', err);
  rl.close();
  process.exit(1);
});