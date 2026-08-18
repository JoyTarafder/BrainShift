import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/db';
import Course from '@/models/Course';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDatabase();
    const { slug } = await params;

    const isId = mongoose.Types.ObjectId.isValid(slug);
    const query = isId ? { $or: [{ _id: slug }, { slug }] } : { slug };

    const course = await Course.findOne(query).lean();

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      course: JSON.parse(JSON.stringify(course)),
    });
  } catch (error: any) {
    console.error('Error fetching course detail:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch course details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { slug } = await params;
    await connectToDatabase();
    const body = await request.json();

    const isId = mongoose.Types.ObjectId.isValid(slug);
    const query = isId ? { $or: [{ _id: slug }, { slug }] } : { slug };

    const updatedCourse = await Course.findOneAndUpdate(query, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedCourse) {
      return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Course updated successfully',
      course: JSON.parse(JSON.stringify(updatedCourse)),
    });
  } catch (error: any) {
    console.error('API Update course error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Failed to update course' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { slug } = await params;
    await connectToDatabase();

    const isId = mongoose.Types.ObjectId.isValid(slug);
    const query = isId ? { $or: [{ _id: slug }, { slug }] } : { slug };

    const course = await Course.findOne(query);
    if (!course) {
      return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 });
    }

    course.status = 'archived';
    await course.save();

    return NextResponse.json({ success: true, message: 'Course archived successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Failed to delete course' }, { status: 500 });
  }
}
