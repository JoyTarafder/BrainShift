import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/db';
import Batch from '@/models/Batch';
import Enrollment from '@/models/Enrollment';
import Order from '@/models/Order';
import User from '@/models/User';
import Course from '@/models/Course';

async function verifyAdminAccess(request: NextRequest): Promise<boolean> {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (session?.user) {
    const role = (session.user as any)?.role;
    if (role === 'admin') return true;

    if (session.user.email) {
      const dbUser = await User.findOne({ email: session.user.email.toLowerCase().trim() }).lean();
      if (dbUser && dbUser.role === 'admin') return true;
    }
  }
  return false;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const isAuthorized = await verifyAdminAccess(request);
    if (!isAuthorized) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    await connectToDatabase();

    // Find Batch by ID or Course ID
    let batchDoc = await Batch.findById(id).populate('courseId', 'title slug subject price modules').lean();

    if (!batchDoc) {
      batchDoc = await Batch.findOne({ courseId: id }).populate('courseId', 'title slug subject price modules').lean();
    }

    if (!batchDoc) {
      return NextResponse.json({ success: false, message: 'Batch not found' }, { status: 404 });
    }

    const courseObj = batchDoc.courseId as any;
    const courseIdObj = courseObj?._id || batchDoc.courseId;
    const courseIdStr = courseIdObj ? courseIdObj.toString() : '';

    // Fetch Enrolled Students for this Batch's Course
    const enrollments = await Enrollment.find({
      $or: [{ courseId: courseIdObj }, { courseId: courseIdStr }],
    })
      .populate('studentId', 'name email phone createdAt')
      .sort({ createdAt: -1 })
      .lean();

    // Fetch corresponding Orders
    const orders = await Order.find({
      $or: [{ courseId: courseIdObj }, { courseId: courseIdStr }],
      status: 'paid',
    }).lean();

    const enrolledStudents = enrollments.map((enr: any) => {
      const studentObj = enr.studentId || {};
      const studentIdStr = studentObj._id ? studentObj._id.toString() : '';

      const matchedOrder = orders.find(
        (o: any) => (o.studentId ? o.studentId.toString() : '') === studentIdStr
      );

      return {
        _id: enr._id,
        studentId: studentIdStr,
        name: studentObj.name || 'Enrolled Student',
        email: studentObj.email || 'N/A',
        phone: studentObj.phone || matchedOrder?.senderNumber || 'N/A',
        transactionId: matchedOrder?.transactionId || 'PAID_VERIFIED',
        paymentMethod: matchedOrder?.paymentMethod || 'bKash',
        enrolledAt: enr.createdAt || matchedOrder?.createdAt,
      };
    });

    const realEnrolledCount = Math.max(batchDoc.enrolledCount || 0, enrolledStudents.length);
    const modules =
      (batchDoc as any).modules && (batchDoc as any).modules.length > 0
        ? (batchDoc as any).modules
        : courseObj?.modules && courseObj.modules.length > 0
        ? courseObj.modules
        : [];

    return NextResponse.json({
      success: true,
      batch: JSON.parse(JSON.stringify({ ...batchDoc, modules, enrolledCount: realEnrolledCount })),
      students: JSON.parse(JSON.stringify(enrolledStudents)),
    });
  } catch (error: any) {
    console.error('Error fetching admin batch detail:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const isAuthorized = await verifyAdminAccess(request);
    if (!isAuthorized) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    const updateFields: any = {};
    if (body.meetUrl !== undefined) updateFields.meetUrl = body.meetUrl.trim();
    if (body.whatsappUrl !== undefined) updateFields.whatsappUrl = body.whatsappUrl.trim();
    if (body.notice !== undefined) updateFields.notice = body.notice.trim();
    if (body.name !== undefined) updateFields.name = body.name.trim();
    if (body.classSchedule !== undefined) updateFields.classSchedule = body.classSchedule.trim();
    if (body.status !== undefined) updateFields.status = body.status;
    if (body.maxStudents !== undefined) updateFields.maxStudents = Number(body.maxStudents);
    if (body.materials !== undefined) updateFields.materials = body.materials;
    if (body.modules !== undefined) updateFields.modules = body.modules;

    const updatedBatch = await Batch.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, upsert: false }
    ).populate('courseId', 'title slug subject price modules');

    if (!updatedBatch) {
      return NextResponse.json({ success: false, message: 'Batch not found to update' }, { status: 404 });
    }

    // Sync Modules / Video Lessons to Course document as well
    if (body.modules !== undefined) {
      const courseIdObj = (updatedBatch.courseId as any)?._id || updatedBatch.courseId;
      if (courseIdObj) {
        await Course.findByIdAndUpdate(courseIdObj, { $set: { modules: body.modules } });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Batch management settings & Video Lessons updated successfully!',
      batch: JSON.parse(JSON.stringify(updatedBatch)),
    });
  } catch (error: any) {
    console.error('Error updating admin batch details:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Failed to update batch' }, { status: 500 });
  }
}
