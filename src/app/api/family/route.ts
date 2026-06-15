import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import User from '@/models/User';
import Family from '@/models/Family';
import Invitation from '@/models/Invitation';
import { auth } from '@/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    // @ts-ignore
    const family_id = session?.user?.family_id;
    if (!session?.user?.id || !family_id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    
    const family = await Family.findById(family_id);
    const members = await User.find({ family_id }).select('-password_hash');
    const invitations = await Invitation.find({ family_id, status: 'pending' });

    return NextResponse.json({ family, members, invitations });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    // @ts-ignore
    const family_id = session?.user?.family_id;
    if (!session?.user?.id || !family_id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    await connectMongo();

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.family_id?.toString() === family_id) {
        return NextResponse.json({ message: "User is already in your family" }, { status: 400 });
      }
      
      // User exists, add them to this family
      existingUser.family_id = family_id;
      await existingUser.save();
      return NextResponse.json({ message: "User added to family" });
    } else {
      // Check if invitation already exists
      const existingInvitation = await Invitation.findOne({ email, status: 'pending' });
      if (existingInvitation) {
         if (existingInvitation.family_id.toString() === family_id) {
           return NextResponse.json({ message: "Invitation already sent to this email" }, { status: 400 });
         } else {
           // Overwrite pending invitation with new family if invited by someone else
           existingInvitation.family_id = family_id;
           await existingInvitation.save();
           return NextResponse.json({ message: "Invitation updated" }, { status: 201 });
         }
      }

      await Invitation.create({ email, family_id, status: 'pending' });
      return NextResponse.json({ message: "Invitation sent" }, { status: 201 });
    }
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
