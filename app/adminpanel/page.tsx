import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {
  BookOpen,
  Users,
  Award,
  ShoppingBag,
  TrendingUp,
  PlusCircle,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Server,
} from 'lucide-react';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import Course from '@/models/Course';
import Order from '@/models/Order';
import Mark from '@/models/Mark';

export default async function AdminPanelOverviewPage() {
  const session = await getServerSession(authOptions);

  let totalCourses = 0;
  let totalStudents = 0;
  let totalOrders = 0;
  let totalRevenue = 0;
  let totalMarks = 0;
  let recentOrders: any[] = [];
  let recentStudents: any[] = [];

  try {
    await connectToDatabase();

    const [courseCount, studentCount, paidOrderDocs, markCount, studentDocs] = await Promise.all([
      Course.countDocuments(),
      User.countDocuments({ role: 'student' }),
      Order.find({ status: 'paid' })
        .populate('studentId', 'name email')
        .populate('courseId', 'title')
        .sort({ createdAt: -1 })
        .lean(),
      Mark.countDocuments(),
      User.find({ role: 'student' }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    totalCourses = courseCount;
    totalStudents = studentCount;
    totalOrders = paidOrderDocs.length;
    totalMarks = markCount;

    totalRevenue = paidOrderDocs.reduce((sum: number, o: any) => sum + (o.amount || 0), 0);

    recentOrders = JSON.parse(JSON.stringify(paidOrderDocs.slice(0, 5)));
    recentStudents = JSON.parse(JSON.stringify(studentDocs));
  } catch (err) {
    console.error('Admin Overview DB fetch error:', err);
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0b2545] via-[#13293d] to-[#1e3a8a] text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Executive Dashboard</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome, {session?.user?.name || 'Joy Tarafder'}! 👋
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Overall overview of TutorNova course listings, student enrollments, exam scores, and verified earnings.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Backend API & DB Health Status Link */}
          <Link
            href="/api/health"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-slate-900/90 text-xs px-4 py-3 rounded-xl border border-slate-700/80 shadow hover:border-amber-500/50 hover:bg-slate-800 transition-all group"
            title="Check Live DB & API Health Status (/api/health)"
          >
            <Server className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="font-mono text-slate-300">DB Health Status:</span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-800/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Live Status ↗
            </span>
          </Link>

          <Link
            href="/adminpanel/courses/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Course</span>
          </Link>
        </div>
      </div>

      {/* Analytics Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Courses */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Courses</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#0b2545]">{totalCourses}</span>
            <span className="text-xs text-slate-500 font-medium">Courses Published</span>
          </div>
          <Link href="/adminpanel/courses" className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1 pt-1">
            <span>Manage Courses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 2: Registered Students */}
        <div className="bg-[#0b2545] text-white rounded-2xl p-6 border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Total Students</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400">{totalStudents}</span>
            <span className="text-xs text-slate-300 font-medium">Registered Accounts</span>
          </div>
          <Link href="/adminpanel/students" className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1 pt-1">
            <span>View Student List</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 3: Total Revenue */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Earnings</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#0b2545]">৳ {totalRevenue.toLocaleString('en-BD')}</span>
            <span className="text-xs text-slate-500 font-medium">BDT</span>
          </div>
          <span className="text-xs text-emerald-600 font-semibold block pt-1">
            {totalOrders} Paid Enrollments
          </span>
        </div>

        {/* Card 4: Marks Published */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Exam Evaluations</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#0b2545]">{totalMarks}</span>
            <span className="text-xs text-slate-500 font-medium">Scores Published</span>
          </div>
          <Link href="/adminpanel/marks" className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1 pt-1">
            <span>Assign Exam Marks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Grid: Recent Orders & Recent Students */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0b2545] flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              <span>Purchased Courses & Verified Enrollments</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      No verified purchases recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((o: any) => (
                    <tr key={o._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {o.studentId?.name || 'Student'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {o.courseId?.title || 'TutorNova Course'}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#0b2545]">
                        ৳ {o.amount?.toLocaleString('en-BD')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full uppercase text-[10px] bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>PAID</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Students Panel */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-[#0b2545] flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Newly Registered Students</span>
            </h2>
            <Link href="/adminpanel/students" className="text-xs font-bold text-indigo-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {recentStudents.length === 0 ? (
              <p className="text-xs text-slate-400">No students registered yet.</p>
            ) : (
              recentStudents.map((st: any) => (
                <div key={st._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0b2545] text-amber-400 font-bold flex items-center justify-center text-[10px]">
                      {st.name?.substring(0, 2).toUpperCase() || 'ST'}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">{st.name}</span>
                      <span className="text-[10px] text-slate-400">{st.email}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
