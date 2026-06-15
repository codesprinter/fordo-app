import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import User from '@/models/User';
import Family from '@/models/Family';
import Invitation from '@/models/Invitation';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    await connectMongo();
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    const invitation = await Invitation.findOne({ email, status: 'pending' });
    let family_id;

    if (invitation) {
      family_id = invitation.family_id;
      invitation.status = 'accepted';
      await invitation.save();
    } else {
      const newFamily = await Family.create({ name: `${name}'s Family` });
      family_id = newFamily._id;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password_hash,
      family_id
    });

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
