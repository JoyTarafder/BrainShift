import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/db';
import mongoose from 'mongoose';
import { SSLCOMMERZ_CONFIG } from '@/backend/config/sslcommerz';

const UserSchema = new mongoose.Schema({ name: String, email: String, role: String });
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const CourseSchema = new mongoose.Schema({ title: String, slug: String, price: Number, status: String });
const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

const OrderSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  amount: Number,
  status: String,
  paymentMethod: String,
  transactionId: String,
});
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

const EnrollmentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
});
const Enrollment = mongoose.models.Enrollment || mongoose.model('Enrollment', EnrollmentSchema);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json({ success: false, message: 'Please provide courseId' }, { status: 400 });
    }

    const student = await User.findOne({ email: session.user.email.toLowerCase().trim() });
    if (!student) {
      return NextResponse.json({ success: false, message: 'Student account not found' }, { status: 404 });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 });
    }

    // Check existing enrollment
    const existing = await Enrollment.findOne({ studentId: student._id, courseId });
    if (existing) {
      return NextResponse.json({
        success: true,
        alreadyEnrolled: true,
        message: 'You are already enrolled in this course',
      });
    }

    // Generate transaction ID
    const transactionId = `TN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create Order in Atlas
    await Order.create({
      studentId: student._id,
      courseId,
      amount: course.price,
      status: 'pending',
      paymentMethod: 'sslcommerz',
      transactionId,
    });

    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

    // Try real SSLCommerz API
    try {
      const sslData = {
        store_id: SSLCOMMERZ_CONFIG.store_id,
        store_passwd: SSLCOMMERZ_CONFIG.store_passwd,
        total_amount: course.price,
        currency: 'BDT',
        tran_id: transactionId,
        success_url: `${BACKEND_URL}/api/payment/success`,
        fail_url: `${BACKEND_URL}/api/payment/fail`,
        cancel_url: `${BACKEND_URL}/api/payment/cancel`,
        ipn_url: `${BACKEND_URL}/api/payment/ipn`,
        cus_name: student.name || 'Student',
        cus_email: student.email || 'student@tutornova.com',
        cus_add1: 'Dhaka',
        cus_city: 'Dhaka',
        cus_postcode: '1200',
        cus_country: 'Bangladesh',
        cus_phone: '01700000000',
        shipping_method: 'NO',
        product_name: course.title,
        product_category: 'Education',
        product_profile: 'non-physical-goods',
      };

      const response = await fetch(SSLCOMMERZ_CONFIG.init_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(sslData as any).toString(),
      });

      const data = await response.json();
      if (data.status === 'SUCCESS' && data.GatewayPageURL) {
        return NextResponse.json({
          success: true,
          gatewayUrl: data.GatewayPageURL,
          transactionId,
        });
      }
    } catch (sslErr) {
      console.warn('SSLCommerz Sandbox API unreachable, using local simulator fallback:', sslErr);
    }

    // Local Checkout Simulator URL Fallback
    const simulatorUrl = `${BACKEND_URL}/api/payment/simulate-checkout?tran_id=${transactionId}`;

    return NextResponse.json({
      success: true,
      gatewayUrl: simulatorUrl,
      transactionId,
    });
  } catch (error: any) {
    console.error('Payment init route error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error initiating payment' },
      { status: 500 }
    );
  }
}
