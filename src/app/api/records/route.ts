import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Record from '@/models/Record';
import { auth } from '@/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    
    // Fetch all records for the logged in user, sort descending by date
    const records = await Record.find({ user_id: session.user.id }).sort({ date: -1 });

    return NextResponse.json(records);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, description, items } = await req.json();
    
    if (!title || !items || !Array.isArray(items)) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    await connectMongo();
    
    const newRecord = await Record.create({
      user_id: session.user.id,
      title,
      description: description || "",
      date: new Date(),
      items: items.map((item, index) => ({
        serial_number: index + 1,
        item_name: item.item_name,
        quantity: item.quantity,
        status: 'pending' // Default new items to pending
      }))
    });

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
