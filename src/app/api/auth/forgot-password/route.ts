import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectMongo from '@/lib/mongodb';
import User from '@/models/User';

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

    // Log the link in server console
    console.log('\n==================================================');
    console.log(`[PASSWORD RESET] Email: ${email}`);
    console.log(`[PASSWORD RESET] Reset URL: ${resetLink}`);
    console.log('==================================================\n');

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
