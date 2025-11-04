import nodemailer from 'nodemailer';

export const sendResetLink = async (baseUrl: string, email: string, token: string) => {
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  const transporter = nodemailer.createTransport({
    host: 'smtp.yandex.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Instructions',
    html: `
        <p>You requested a password reset.</p>
        <p>Click this link to reset your password:</p>
        <p><a href="${resetUrl}">Link</a></p>
        <p>This link expires in 10 minutes.</p>
      `
  });
};
