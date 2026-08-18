import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ShoppingBag, ArrowLeft, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { connectToDatabase } from '@/lib/db';
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({ email: String, name: String });
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const CourseSchema = new mongoose.Schema({ title: String, slug: String, price: Number, thumbnailUrl: String });
const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

const OrderSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  transactionId: String,
  amount: Number,
  paymentMethod: String,
  status: String,
  createdAt: Date,
});
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

export default async function StudentOrdersPage() {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;
  const token = (session?.user as any)?.apiToken;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  let orders: any[] = [];
  let errorMsg = '';

  // 1. Try Express backend API first
  try {
    const res = await fetch(`${API_URL}/student/orders`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.orders) {
        orders = data.orders;
      }
    }
  } catch (err) {
    // Silently fallback to DB query
  }

  // 2. Direct MongoDB Atlas Fallback
  if (orders.length === 0 && userEmail) {
    try {
      await connectToDatabase();
      const user = await User.findOne({ email: userEmail.toLowerCase().trim() });
      if (user) {
        const docs = await Order.find({ studentId: user._id })
          .populate('courseId', 'title slug price thumbnailUrl')
          .sort({ createdAt: -1 })
          .lean();

        orders = JSON.parse(JSON.stringify(docs));
      }
    } catch (dbErr: any) {
      console.error('Order History DB query error:', dbErr);
    }
  }

  // ONLY display verified paid courses ("je course buy korbe seitai shushu show korbe")
  const paidOrders = orders.filter((o: any) => o.status === 'paid');

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#0b2545] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              <h1 className="text-2xl font-extrabold text-[#0b2545]">My Purchased Courses & Orders</h1>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              Receipts and verified transaction details for your active course enrollments.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-4 px-6">Transaction ID</th>
                  <th className="py-4 px-6">Course</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Payment Method</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paidOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No purchased course transactions found yet.
                    </td>
                  </tr>
                ) : (
                  paidOrders.map((order: any) => {
                    const formattedDate = order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Verified';

                    return (
                      <tr key={order._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6 font-mono text-xs font-bold text-slate-700">
                          {order.transactionId || 'TN-SUCCESS'}
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-900">
                          {order.courseId?.title || 'TutorNova Course'}
                        </td>
                        <td className="py-4 px-6 font-bold text-[#0b2545]">
                          ৳ {order.amount?.toLocaleString('en-BD')} BDT
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-medium uppercase text-xs">
                          {order.paymentMethod || 'bKash/Nagad'}
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-500">{formattedDate}</td>
                        <td className="py-4 px-6 text-right">
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>PAID</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
