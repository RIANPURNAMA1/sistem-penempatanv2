const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOtpEmail = async (email, otp) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'your_app_password') {
    console.log(`[OTP fallback] Kode verifikasi untuk ${email}: ${otp}`);
    return { fallback: true };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Kode Verifikasi Reset Password - Sistem Kandidat',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #333;">Kode Verifikasi Anda</h2>
          <p style="color: #666; font-size: 16px;">Gunakan kode berikut untuk mereset password:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px;">${otp}</span>
          </div>
          <p style="color: #999; font-size: 14px;">Kode ini berlaku selama 10 menit.</p>
          <p style="color: #999; font-size: 14px;">Jika Anda tidak meminta verifikasi ini, abaikan email ini.</p>
        </div>
      `
    });
    console.log(`[OTP] Email sent to ${email}`);
    return info;
  } catch (error) {
    console.log(`[OTP fallback] Kode verifikasi untuk ${email}: ${otp}`);
    return { fallback: true, error: error.message };
  }
};

module.exports = { sendOtpEmail };