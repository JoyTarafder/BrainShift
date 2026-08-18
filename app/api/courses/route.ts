import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/db';
import Course from '@/models/Course';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const level = searchParams.get('level');
    const search = searchParams.get('search');

    const query: any = { status: 'published' };

    if (subject && subject !== 'All') {
      query.subject = subject;
    }

    if (level && level !== 'All') {
      query.level = level;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await Course.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: courses.length,
      courses: JSON.parse(JSON.stringify(courses)),
    });
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Failed to fetch courses',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    const course = await Course.create(body);

    return NextResponse.json({
      success: true,
      message: 'Course created successfully',
      course: JSON.parse(JSON.stringify(course)),
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating course:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Failed to create course' }, { status: 500 });
  }
}
