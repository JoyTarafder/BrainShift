import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import Course from '@/models/Course';

export async function POST(request: NextRequest) {
  try {
    // 1. Try getServerSession first
    const session = await getServerSession(authOptions);
    let userEmail = session?.user?.email;

    // 2. Fallback to JWT token if session cookies are missing/different origin
    if (!userEmail) {
      const jwtToken = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET || 'tutornova_super_secret_jwt_key_2026',
      });
      if (jwtToken?.email) {
        userEmail = jwtToken.email as string;
      }
    }

    await connectToDatabase();
    const body = await request.json();
    const { courseId, paymentMethod, senderNumber, transactionId, email: bodyEmail } = body;

    if (!userEmail && bodyEmail) {
      userEmail = bodyEmail;
    }

    if (!userEmail) {
      return NextResponse.json({ success: false, message: 'Please sign in to complete payment' }, { status: 401 });
    }

    if (!courseId || !senderNumber || !transactionId) {
      return NextResponse.json(
        { success: false, message: 'Please provide courseId, sender mobile number, and transaction ID (TrxID)' },
        { status: 400 }
      );
    }

    const student = await User.findOne({ email: userEmail.toLowerCase().trim() });
    if (!student) {
      return NextResponse.json({ success: false, message: 'Student account not found. Please log in again.' }, { status: 404 });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 });
    }

    const cleanTrxId = transactionId.trim().toUpperCase();
    const cleanSenderNumber = senderNumber.trim();
    const studentIdStr = student._id.toString();
    const courseIdStr = course._id.toString();

    // 3. Directly update or insert using MongoDB $set to guarantee senderNumber and transactionId BSON field persistence
    const order = await Order.findOneAndUpdate(
      {
        $or: [
          { studentId: student._id, courseId: course._id },
          { studentId: studentIdStr, courseId: courseIdStr },
          { studentId: student._id, courseId: courseIdStr },
          { studentId: studentIdStr, courseId: course._id },
        ],
      },
      {
        $set: {
          studentId: student._id,
          courseId: course._id,
          amount: course.price,
          status: 'pending',
          paymentMethod: paymentMethod || 'bKash',
          senderNumber: cleanSenderNumber,
          transactionId: cleanTrxId,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`✅ Direct MongoDB $set Order Saved: ID=${order._id}, TrxID=${cleanTrxId}, Sender=${cleanSenderNumber}, Student=${student.email}`);

    return NextResponse.json({
      success: true,
      status: 'pending',
      message: 'TrxID submitted! Pending admin verification within 24 hours.',
      order: JSON.parse(JSON.stringify(order)),
    });
  } catch (error: any) {
    console.error('Payment verify route error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Error processing payment submission' },
      { status: 500 }
    );
  }
}
