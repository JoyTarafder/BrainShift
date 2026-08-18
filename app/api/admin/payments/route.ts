import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import Enrollment from '@/models/Enrollment';
import User from '@/models/User';
import Course from '@/models/Course';

async function verifyAdminAccess(request: NextRequest): Promise<boolean> {
  await connectToDatabase();

  // 1. Check NextAuth Session
  const session = await getServerSession(authOptions);
  if (session?.user) {
    const role = (session.user as any)?.role;
    if (role === 'admin') return true;

    if (session.user.email) {
      const dbUser = await User.findOne({ email: session.user.email.toLowerCase().trim() }).lean();
      if (dbUser && dbUser.role === 'admin') return true;
    }
  }

  // 2. Fallback: Check if any admin user exists or if admin session is active
  return false;
}

export async function GET(request: NextRequest) {
  try {
    const isAdminAuthorized = await verifyAdminAccess(request);
    if (!isAdminAuthorized) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    await connectToDatabase();

    const orders = await Order.find()
      .populate('studentId', 'name email role')
      .populate('courseId', 'title price slug subject')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders: JSON.parse(JSON.stringify(orders)),
    });
  } catch (error: any) {
    console.error('Error fetching admin payments:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const isAdminAuthorized = await verifyAdminAccess(request);
    if (!isAdminAuthorized) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    await connectToDatabase();
    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json({ success: false, message: 'Please provide orderId and status' }, { status: 400 });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order transaction not found' }, { status: 404 });
    }

    order.status = status;
    await order.save();

    const studentIdStr = order.studentId ? order.studentId.toString() : '';
    const courseIdStr = order.courseId ? order.courseId.toString() : '';

    // Sync Enrollment status based on Order status
    if (status === 'paid' && studentIdStr && courseIdStr) {
      const existingEnrollment = await Enrollment.findOne({
        studentId: studentIdStr,
        courseId: courseIdStr,
      });

      if (!existingEnrollment) {
        await Enrollment.create({
          studentId: studentIdStr,
          courseId: courseIdStr,
          orderId: order._id.toString(),
          progressPercentage: 0,
        });
      }
    } else if ((status === 'pending' || status === 'failed') && studentIdStr && courseIdStr) {
      // Remove any active enrollment if payment status is pending or failed
      await Enrollment.deleteMany({
        studentId: studentIdStr,
        courseId: courseIdStr,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Payment order updated to ${status}`,
      order: JSON.parse(JSON.stringify(order)),
    });
  } catch (error: any) {
    console.error('Error updating admin payment:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Failed to update payment' }, { status: 500 });
  }
}
