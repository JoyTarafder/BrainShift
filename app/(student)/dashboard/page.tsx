import Image from 'next/image';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {
  BookOpen,
  Clock,
  PlayCircle,
  ShoppingBag,
  ArrowRight,
  Video,
  ExternalLink,
  Bell,
  Layers,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { connectToDatabase } from '@/lib/db';
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({ email: String, name: String });
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const CourseSchema = new mongoose.Schema({
  title: String,
  slug: String,
  subject: String,
  level: String,
  price: Number,
  duration: String,
  thumbnailUrl: String,
  shortDescription: String,
});
const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

const EnrollmentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  progressPercentage: Number,
  enrolledAt: Date,
});
const Enrollment = mongoose.models.Enrollment || mongoose.model('Enrollment', EnrollmentSchema);

const BatchSchema = new mongoose.Schema({
  name: String,
  courseId: mongoose.Schema.Types.ObjectId,
  classSchedule: String,
  meetUrl: String,
  whatsappUrl: String,
  notice: String,
});
const Batch = mongoose.models.Batch || mongoose.model('Batch', BatchSchema);

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;

  await connectToDatabase();

  let enrollments: any[] = [];
  let userDoc: any = null;

  if (userEmail) {
    userDoc = await User.findOne({ email: userEmail.toLowerCase().trim() }).lean();
    if (userDoc) {
      const docs = await Enrollment.find({ studentId: userDoc._id })
        .populate('courseId')
        .sort({ enrolledAt: -1 })
        .lean();

      for (const e of docs) {
        if (e.courseId) {
          const courseObj = JSON.parse(JSON.stringify(e.courseId));
          const batchDoc = await Batch.findOne({ courseId: e.courseId._id }).lean();

          enrollments.push({
            enrollmentId: e._id.toString(),
            enrolledAt: e.enrolledAt,
            progressPercentage: e.progressPercentage || 0,
            course: courseObj,
            batch: batchDoc ? JSON.parse(JSON.stringify(batchDoc)) : null,
          });
        }
      }
    }
  }

  // Check if any batch has active live links or announcements
  const activeBatchesWithLive = enrollments.filter((e) => e.batch?.meetUrl);
  const activeBatchesWithNotice = enrollments.filter((e) => e.batch?.notice);

  return (
    <div className="min-h-screen bg-slate-50 py-10 selection:bg-amber-500 selection:text-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-[#0b2545] via-[#13293d] to-[#1e3a8a] text-white rounded-3xl p-8 lg:p-10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                Verified Student Learning Hub
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome back, {session?.user?.name || 'Student'}! 👋
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Access your live tuition classes, video lectures, batch WhatsApp groups, PDF notes, and test marks.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 relative z-10">
            <Link
              href="/dashboard/marks"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 transition-colors"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Exam Results</span>
            </Link>

            <Link
              href="/dashboard/orders"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>Payment History</span>
            </Link>

            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore Catalog</span>
            </Link>
          </div>
        </div>

        {/* ADMIN CONTROLLED LIVE CLASS ANNOUNCEMENT BANNER */}
        {activeBatchesWithLive.length > 0 && (
          <div className="space-y-4">
            {activeBatchesWithLive.map(({ enrollmentId, course, batch }: any) => (
              <div
                key={`live-${enrollmentId}`}
                className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-2 border-emerald-500/70 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500 text-slate-950 rounded-2xl flex items-center justify-center font-black shrink-0 shadow-lg">
                    <Video className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-700">
                        Live Class Active • {batch.name || 'Batch'}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-white">
                      Google Meet / Zoom Live Class: {course.title}
                    </h3>
                  </div>
                </div>

                <a
                  href={batch.meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs shadow-lg transition-transform hover:scale-105 shrink-0"
                >
                  <span>🎥 Join Live Class Now</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        )}

        {/* ADMIN CONTROLLED TEACHER NOTICE BANNER */}
        {activeBatchesWithNotice.length > 0 && (
          <div className="space-y-3">
            {activeBatchesWithNotice.map(({ enrollmentId, batch }: any) => (
              <div
                key={`notice-${enrollmentId}`}
                className="bg-amber-50 rounded-2xl p-5 border border-amber-200 text-amber-900 text-xs space-y-2 shadow-xs"
              >
                <div className="flex items-center gap-2 text-amber-700 font-extrabold text-xs uppercase tracking-wider">
                  <Bell className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Teacher Announcement ({batch.name})</span>
                </div>
                <p className="leading-relaxed font-medium text-slate-800 whitespace-pre-wrap pl-6 border-l-2 border-amber-400">
                  {batch.notice}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Section Heading */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h2 className="text-xl font-extrabold text-[#0b2545] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <span>My Enrolled Tuition Courses ({enrollments.length})</span>
          </h2>
        </div>

        {/* Course Cards Grid */}
        {enrollments.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4 max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-[#0b2545]">No Enrolled Courses Yet</h3>
            <p className="text-slate-600 text-sm max-w-md mx-auto">
              You haven't enrolled in any tuition courses yet. Explore our catalog to get started with Joy Tarafder!
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-[#0b2545] hover:bg-amber-500 hover:text-slate-950 text-white text-sm transition-all shadow-lg shadow-[#0b2545]/10"
            >
              <span>Explore Course Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enrollments.map(({ enrollmentId, progressPercentage, course, batch }: any) => (
              <div
                key={enrollmentId}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative h-44 w-full bg-slate-800">
                    <Image
                      src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80'}
                      alt={course.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-[#0b2545]/90 text-white text-xs font-bold px-2.5 py-1 rounded shadow-xs">
                      {course.subject || 'CS'}
                    </div>

                    {batch?.name && (
                      <div className="absolute top-3 right-3 bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded shadow-xs flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        <span>{batch.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {course.title}
                      </h3>
                      {batch?.classSchedule && (
                        <p className="text-xs font-semibold text-indigo-700 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>Schedule: {batch.classSchedule}</span>
                        </p>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-600">
                        <span>Course Progress</span>
                        <span className="font-mono font-bold text-amber-600">{progressPercentage || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* ADMIN CONTROLLED LIVE CLASS & WHATSAPP QUICK BUTTONS */}
                    <div className="pt-2 flex flex-col gap-2">
                      {batch?.meetUrl && (
                        <a
                          href={batch.meetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-extrabold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Live Class (Meet/Zoom)</span>
                        </a>
                      )}

                      {batch?.whatsappUrl && (
                        <a
                          href={batch.whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors border border-slate-200"
                        >
                          <img src="/images/whatsapp-clean-icon.png" alt="WhatsApp" className="w-3.5 h-3.5 object-contain" />
                          <span>Batch WhatsApp Group</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 pt-0">
                  <Link
                    href={`/learn/${course._id}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-black text-xs bg-[#0b2545] hover:bg-amber-500 hover:text-slate-950 text-white transition-all shadow"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Enter Student Classroom</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
