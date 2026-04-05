import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Record from '@/models/Record';
import { auth } from '@/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    const record = await Record.findOne({ _id: id, user_id: session.user.id });

    if (!record) {
      return NextResponse.json({ message: "Record not found" }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const updates = await req.json();

    await connectMongo();
    
    // the updates could contain items array, e.g. when expanding or toggling status
    const record = await Record.findOneAndUpdate(
      { _id: id, user_id: session.user.id },
      { $set: updates },
      { new: true } // return updated record
    );

    if (!record) {
      return NextResponse.json({ message: "Record not found or update failed" }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    const result = await Record.deleteOne({ _id: id, user_id: session.user.id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Record deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
