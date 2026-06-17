import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectMongo from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) {
      return NextResponse.json({ message: "Token and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters long" }, { status: 400 });
    }

    await connectMongo();

    // Find the user with token and ensure token is not expired
    const user = await User.findOne({
      reset_password_token: token,
      reset_password_expires: { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid or expired reset token" }, { status: 400 });
    }

    // Update password and clear reset fields
    const password_hash = await bcrypt.hash(password, 10);
    user.password_hash = password_hash;
    
    // Using $unset/undefined to clear fields in Mongoose
    user.reset_password_token = undefined;
    user.reset_password_expires = undefined;
    await user.save();

    return NextResponse.json({ message: "Password has been reset successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Something went wrong" }, { status: 500 });
  }
}
