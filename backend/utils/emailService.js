const nodemailer = require('nodemailer');

// Configure transporter (using Gmail as example, but use your email service)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: `"MDS Pro" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
};

// Send verification email
const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to MDS Pro!</h2>
      <p>Hi ${user.name},</p>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>Or copy this link: ${verificationUrl}</p>
      <p>This link expires in 24 hours.</p>
      <p>Thanks,<br/>MDS Pro Team</p>
    </div>
  `;
  await sendEmail(user.email, 'Verify Your Email', html);
};

// Send password reset email
const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset Your Password</h2>
      <p>Hi ${user.name},</p>
      <p>You requested to reset your password. Click the link below to set a new password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>Or copy this link: ${resetUrl}</p>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Thanks,<br/>MDS Pro Team</p>
    </div>
  `;
  await sendEmail(user.email, 'Reset Your Password', html);
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };