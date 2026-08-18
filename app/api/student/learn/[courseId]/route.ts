import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/db';
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({ email: String, role: String });
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const CourseSchema = new mongoose.Schema({
  title: String,
  slug: String,
  description: String,
  subject: String,
  level: String,
  syllabus: [String],
  modules: [
    {
      title: String,
      type: { type: String },
      url: String,
      durationMinutes: Number,
    },
  ],
});
const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

const EnrollmentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  progressPercentage: { type: Number, default: 0 },
});
const Enrollment = mongoose.models.Enrollment || mongoose.model('Enrollment', EnrollmentSchema);

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

    const course = await Course.findById(courseId).lean();
    if (!course) {
      return NextResponse.json({ isEnrolled: false, message: 'Course not found' }, { status: 404 });
    }

    // Check if enrolled or if user is admin
    let enrollment = await Enrollment.findOne({
      studentId: student._id,
      courseId: (course as any)._id,
    }).lean();

    const isAdmin = student.role === 'admin' || (session.user as any)?.role === 'admin';

    if (!enrollment && !isAdmin) {
      // If student recently paid or is attempting to view, check orders as well
      const OrderSchema = new mongoose.Schema({
        studentId: mongoose.Schema.Types.ObjectId,
        courseId: mongoose.Schema.Types.ObjectId,
        status: String,
      });
      const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

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
      course,
      enrollment: enrollment || { progressPercentage: 100 },
    });
  } catch (error: any) {
    console.error('Learn page API error:', error);
    return NextResponse.json(
      { isEnrolled: false, message: error?.message || 'Error fetching course learning content' },
      { status: 500 }
    );
  }
}
