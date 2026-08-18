import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import Order from '@/models/Order';
import Batch from '@/models/Batch';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ isEnrolled: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const student = await User.findOne({ email: session.user.email.toLowerCase().trim() });
    if (!student) {
      return NextResponse.json({ isEnrolled: false, message: 'Student not found' }, { status: 404 });
    }

    let course = await Course.findById(courseId).lean();
    if (!course) {
      // Fallback: try finding by slug
      course = await Course.findOne({ slug: courseId }).lean();
    }

    if (!course) {
      return NextResponse.json({ isEnrolled: false, message: 'Course not found' }, { status: 404 });
    }

    const realCourseId = (course as any)._id.toString();

    // Check if enrolled or if user is admin
    let enrollment = await Enrollment.findOne({
      studentId: student._id,
      courseId: (course as any)._id,
    }).lean();

    const isAdmin = student.role === 'admin' || (session.user as any)?.role === 'admin';

    if (!enrollment && !isAdmin) {
      // Check paid order
      const order = await Order.findOne({
        studentId: student._id,
        courseId: (course as any)._id,
        status: 'paid',
      });

      if (order) {
        // Auto-create enrollment if paid order exists
        enrollment = await Enrollment.create({
          studentId: student._id,
          courseId: (course as any)._id,
          progressPercentage: 0,
        });
      } else {
        return NextResponse.json({ isEnrolled: false, message: 'Student is not enrolled' });
      }
    }

    // Fetch corresponding Batch details (Live Meet Link, WhatsApp Group Link, Notice, Materials)
    const batch = await Batch.findOne({
      $or: [{ courseId: (course as any)._id }, { courseId: realCourseId }],
    })
      .sort({ createdAt: -1 })
      .lean();

    // Provide default interactive learning modules if course.modules is empty
    let modules = (course as any).modules || [];
    if (!modules || modules.length === 0) {
      modules = [
        {
          title: 'Module 1: Complete Video Lecture & Concept Introduction',
          type: 'video',
          url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM',
          durationMinutes: 45,
        },
        {
          title: 'Module 2: Practice PDF Notes & Problem Solutions',
          type: 'pdf',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          durationMinutes: 20,
        },
        {
          title: 'Module 3: Code Repository & Project Source Materials',
          type: 'pdf',
          url: 'https://github.com/topics/computer-science',
          durationMinutes: 30,
        },
      ];
      (course as any).modules = modules;
    }

    return NextResponse.json({
      isEnrolled: true,
      course: JSON.parse(JSON.stringify(course)),
      enrollment: enrollment ? JSON.parse(JSON.stringify(enrollment)) : { progressPercentage: 100 },
      batch: batch ? JSON.parse(JSON.stringify(batch)) : null,
    });
  } catch (error: any) {
    console.error('Learn page API error:', error);
    return NextResponse.json(
      { isEnrolled: false, message: error?.message || 'Error fetching course learning content' },
      { status: 500 }
    );
  }
}
