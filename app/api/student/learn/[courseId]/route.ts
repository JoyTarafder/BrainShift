import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import Order from '@/models/Order';
import Batch from '@/models/Batch';

const default24Classes = [
  // Chapter 1: World & Bangladesh Context
  { title: 'Class 01: Lesson 1 - Intro to ICT & Virtual Reality', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 45 },
  { title: 'Class 02: Lesson 2 - Artificial Intelligence & Robotics Applications', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 50 },
  { title: 'Class 03: Lesson 3 - Biometrics, Genetic Engineering & Cyber Ethics', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 45 },

  // Chapter 2: Communication Systems & Networks
  { title: 'Class 04: Lesson 4 - Data Communication Systems & Transmission Media', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 55 },
  { title: 'Class 05: Lesson 5 - Wireless Networks (Wi-Fi, Bluetooth, 4G/5G)', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 50 },
  { title: 'Class 06: Lesson 6 - Network Topologies & Cloud Computing Architecture', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 60 },

  // Chapter 3: Number Systems & Logic Gates
  { title: 'Class 07: Lesson 7 - Number Systems: Binary, Octal, Hex Conversions', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 50 },
  { title: 'Class 08: Lesson 8 - Binary Arithmetic & 2\'s Complement Subtraction', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 55 },
  { title: 'Class 09: Lesson 9 - BCD, ASCII, EBCDIC & Unicode Encodings', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 45 },
  { title: 'Class 10: Lesson 10 - Basic Logic Gates (AND, OR, NOT) & Truth Tables', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 50 },
  { title: 'Class 11: Lesson 11 - Universal Gates (NAND, NOR) & Special Gates (XOR)', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 55 },
  { title: 'Class 12: Lesson 12 - Boolean Algebra Theorems & De Morgan\'s Law', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 60 },
  { title: 'Class 13: Lesson 13 - Half Adder & Full Adder Circuit Design', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 60 },
  { title: 'Class 14: Lesson 14 - Encoders, Decoders & Multiplexers (MUX)', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 55 },
  { title: 'Class 15: Lesson 15 - Flip-Flops, Registers & Binary Counters', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 60 },

  // Chapter 4: Web Page Design & HTML
  { title: 'Class 16: Lesson 16 - Intro to Web Design, Domain & HTML Tags', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 45 },
  { title: 'Class 17: Lesson 17 - HTML Formatting, Headings & Lists', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 50 },
  { title: 'Class 18: Lesson 18 - Embedding Images, Hyperlinks & HTML Tables', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 55 },
  { title: 'Class 19: Lesson 19 - HTML Forms, Input Elements & Web Layout Design', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 60 },

  // Chapter 5: C Programming
  { title: 'Class 20: Lesson 20 - Programming Concepts: Algorithm, Flowchart & C Syntax', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 55 },
  { title: 'Class 21: Lesson 21 - C Variables, Data Types & Conditionals (if-else, switch)', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 60 },
  { title: 'Class 22: Lesson 22 - C Loops: For, While & Do-While Control Flow', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 60 },
  { title: 'Class 23: Lesson 23 - C Arrays & User-Defined Functions', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 55 },

  // Chapter 6: DBMS
  { title: 'Class 24: Lesson 24 - Relational Database Systems (RDBMS) & SQL Queries', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 60 },
];

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

    // Fetch corresponding Batch details (Live Meet Link, WhatsApp Group Link, Notice, Materials, Video Lessons)
    let batch: any = null;

    // 1. Prioritize assigned batch from student enrollment first
    if (enrollment?.batchId) {
      batch = await Batch.findById(enrollment.batchId).lean();
    }

    // 2. Fallback to active batch under this course that has meetUrl set
    if (!batch || !batch.meetUrl) {
      const meetBatch = await Batch.findOne({
        $or: [{ courseId: (course as any)._id }, { courseId: realCourseId }],
        meetUrl: { $exists: true, $ne: '' },
      })
        .sort({ createdAt: -1 })
        .lean();

      if (meetBatch) {
        if (!batch) {
          batch = meetBatch;
        } else {
          batch = {
            ...batch,
            meetUrl: meetBatch.meetUrl || batch.meetUrl,
            whatsappUrl: meetBatch.whatsappUrl || batch.whatsappUrl,
            notice: meetBatch.notice || batch.notice,
          };
        }
      }
    }

    // 3. Fallback to latest batch created for this course
    if (!batch) {
      batch = await Batch.findOne({
        $or: [{ courseId: (course as any)._id }, { courseId: realCourseId }],
      })
        .sort({ createdAt: -1 })
        .lean();
    }

    // Prioritize Admin-updated modules from Batch first, then Course, then default fallback
    let modules =
      (batch as any)?.modules && (batch as any).modules.length > 0
        ? (batch as any).modules
        : (course as any)?.modules && (course as any).modules.length > 0
        ? (course as any).modules
        : default24Classes;

    (course as any).modules = modules;

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
