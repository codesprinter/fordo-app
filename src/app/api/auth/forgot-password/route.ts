import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectMongo from '@/lib/mongodb';
import User from '@/models/User';
import { sendEmail } from '@/lib/mail';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    await connectMongo();
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      // Return a successful message to prevent user enumeration attacks
      return NextResponse.json({
        message: "If an account exists with that email, a password reset link has been sent."
      });
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    user.reset_password_token = token;
    user.reset_password_expires = new Date(Date.now() + 3600000); // Expires in 1 hour
    await user.save();

    // Construct the reset URL dynamically using headers
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    // Send email using SMTP helper
    const targetEmail = email.toLowerCase().trim();
    const currentYear = new Date().getFullYear();
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 580px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    }
    .header {
      background-color: #020617;
      padding: 24px;
      text-align: center;
    }
    .header h1 {
      color: #10b981;
      margin: 0;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.025em;
    }
    .content {
      padding: 32px 24px;
      color: #334155;
      line-height: 1.6;
    }
    .content h2 {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 0;
    }
    .btn {
      display: inline-block;
      background-color: #059669;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 600;
      padding: 12px 24px;
      border-radius: 8px;
      margin: 24px 0;
      text-align: center;
    }
    .footer {
      background-color: #f1f5f9;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
    .footer a {
      color: #10b981;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛒 Fordo App</h1>
    </div>
    <div class="content">
      <h2>Reset your password</h2>
      <p>Hello,</p>
      <p>We received a request to reset the password for your Fordo App account. Click the button below to set a new password:</p>
      <div style="text-align: center;">
        <a href="${resetLink}" class="btn" style="color: white;">Reset Password</a>
      </div>
      <p>If you cannot click the button, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; font-size: 13px; color: #64748b;">${resetLink}</p>
      <p>This password reset link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      <p>&copy; ${currentYear} Fordo App. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    await sendEmail({
      to: targetEmail,
      subject: 'Reset your Fordo App Password',
      html: emailHtml,
    });

    // Return the resetLink ONLY in development mode for easier debugging
    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json({
      message: "If an account exists with that email, a password reset link has been sent.",
      ...(isDev ? { resetLink } : {})
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Something went wrong" }, { status: 500 });
  }
}
