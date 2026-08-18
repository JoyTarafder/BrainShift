import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/db';
import Batch from '@/models/Batch';
import Course from '@/models/Course';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    }

    await connectToDatabase();

    const batches = await Batch.find()
      .populate('courseId', 'title slug subject price')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      batches: JSON.parse(JSON.stringify(batches)),
    });
  } catch (error: any) {
    console.error('Fetch batches API error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Failed to fetch batches' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { name, courseId, classSchedule, startDate, maxStudents, status } = body;

    if (!name || !courseId || !classSchedule) {
      return NextResponse.json(
        { success: false, message: 'Please provide batch name, course, and class schedule' },
        { status: 400 }
      );
    }

    const newBatch = await Batch.create({
      name: name.trim(),
      courseId,
      classSchedule: classSchedule.trim(),
      startDate: startDate ? new Date(startDate) : new Date(),
      maxStudents: maxStudents ? Number(maxStudents) : 30,
      status: status || 'active',
    });

    const populatedBatch = await Batch.findById(newBatch._id).populate('courseId', 'title slug subject price').lean();

    return NextResponse.json({
      success: true,
      message: 'Batch created successfully',
      batch: JSON.parse(JSON.stringify(populatedBatch)),
    });
  } catch (error: any) {
    console.error('Create batch API error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Failed to create batch' }, { status: 500 });
  }
}
