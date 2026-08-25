import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/db';
import Batch from '@/models/Batch';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import Order from '@/models/Order';
import { Layers, Calendar, Clock, BookOpen, ExternalLink, ArrowRight } from 'lucide-react';
import BatchFormModal from './BatchFormModal';

export default async function AdminPanelBatchesPage() {
  await getServerSession(authOptions);
  await connectToDatabase();

  const [batchDocs, courseDocs, enrollmentDocs, paidOrderDocs] = await Promise.all([
    Batch.find().populate('courseId', 'title slug subject price').sort({ createdAt: -1 }).lean(),
    Course.find({ status: 'published' }).select('_id title subject').sort({ title: 1 }).lean(),
    Enrollment.find().select('courseId batchId').lean(),
    Order.find({ status: 'paid' }).select('courseId batchId').lean(),
  ]);

  const rawBatches = JSON.parse(JSON.stringify(batchDocs));
  const courses = JSON.parse(JSON.stringify(courseDocs));
  const enrollments = JSON.parse(JSON.stringify(enrollmentDocs));
  const paidOrders = JSON.parse(JSON.stringify(paidOrderDocs));

  // Compute dynamic enrolled counts per batch
  const batches = rawBatches.map((b: any) => {
    const batchIdStr = b._id?.toString() || '';
    
    // Count enrollments specifically for this batch
    const enrollmentCount = enrollments.filter((e: any) => {
      const eBatchId = e.batchId?._id?.toString() || e.batchId?.toString();
      return eBatchId ? eBatchId === batchIdStr : false;
    }).length;

    // Count paid orders specifically for this batch
    const paidOrderCount = paidOrders.filter((o: any) => {
      const oBatchId = o.batchId?._id?.toString() || o.batchId?.toString();
      return oBatchId ? oBatchId === batchIdStr : false;
    }).length;

    const dynamicEnrolled = Math.max(b.enrolledCount || 0, enrollmentCount, paidOrderCount);

    return {
      ...b,
      enrolledCount: dynamicEnrolled,
    };
  });

  const totalBatches = batches.length;
  const activeBatches = batches.filter((b: any) => b.status === 'active').length;
  const totalEnrolled = batches.reduce((sum: number, b: any) => sum + (b.enrolledCount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0b2545] via-[#13293d] to-[#1e3a8a] text-white rounded-2xl p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-amber-400 font-semibold text-xs">
            <Layers className="w-4 h-4" />
            <span>Tuition Batch Management</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Tuition Batches & Schedules</h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Organize tuition classes into structured batches, set live class schedules, and manage student seat limits.
          </p>
        </div>

        <BatchFormModal courses={courses} />
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Batches</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#0b2545]">{totalBatches}</span>
            <span className="text-xs text-slate-500 font-semibold">Batches Created</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Batches</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#0b2545]">{activeBatches}</span>
            <span className="text-xs text-slate-500 font-semibold">Ongoing Classes</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Enrolled Seats</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">{totalEnrolled}</span>
            <span className="text-xs text-slate-500 font-semibold">Students Enrolled</span>
          </div>
        </div>
      </div>

      {/* Batches Table & Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-[#0b2545] flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-500" />
            <span>All Tuition Batches ({batches.length})</span>
          </h2>
        </div>

        {batches.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Layers className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-[#0b2545]">No Batches Created Yet</h3>
            <p className="text-slate-500 text-xs max-w-sm mx-auto">
              Create your first tuition batch to organize live class schedules and seat limits for students.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batches.map((b: any) => {
              const targetUrl = `/adminpanel/batches/${b._id}`;
              const capacityPercent = Math.round(((b.enrolledCount || 0) / (b.maxStudents || 30)) * 100);

              return (
                <div
                  key={b._id}
                  className="bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 hover:border-slate-300 p-6 space-y-4 shadow-sm hover:shadow-md transition-all duration-200 group relative flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span
                        className={`text-xs font-bold capitalize px-2.5 py-1 rounded-lg border ${
                          b.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : b.status === 'upcoming'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-slate-200 text-slate-700 border-slate-300'
                        }`}
                      >
                        {b.status}
                      </span>

                      <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        Cap: <strong className="text-emerald-700 font-extrabold">{b.enrolledCount || 0}</strong> / {b.maxStudents || 30}
                      </span>
                    </div>

                    <Link href={targetUrl} className="block space-y-1 pt-1 group-hover:text-amber-600">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-[#0b2545] group-hover:text-amber-600 transition-colors">
                          {b.name}
                        </h3>
                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors shrink-0" />
                      </div>
                      <p className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                        <span>{b.courseId?.title || 'General Course'}</span>
                      </p>
                    </Link>

                    <div className="space-y-2 pt-2 border-t border-slate-200 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>Schedule: <strong>{b.classSchedule}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>
                          Start Date:{' '}
                          <strong>
                            {b.startDate
                              ? new Date(b.startDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : 'TBA'}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* Capacity Progress Bar with Explicit Label */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Seat Capacity</span>
                        <span className="font-bold text-slate-700">
                          {b.enrolledCount || 0} / {b.maxStudents || 30} seats ({capacityPercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#0b2545] group-hover:bg-amber-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, Math.max(0, capacityPercent))}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Unified Action Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                    <BatchFormModal courses={courses} initialBatch={b} />

                    <Link
                      href={targetUrl}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
