import Image from 'next/image';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { BookOpen, Clock, PlayCircle, ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';
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

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;
  const token = (session?.user as any)?.apiToken;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  let enrollments: any[] = [];
  let errorMsg = '';

  // 1. Try fetching from Express Backend first
  try {
    const res = await fetch(`${API_URL}/student/courses`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.courses) {
        enrollments = data.courses;
      }
    }
  } catch (err) {
    // Silently proceed to DB fallback
  }

  // 2. Direct MongoDB Atlas Fallback
  if (enrollments.length === 0 && userEmail) {
    try {
      await connectToDatabase();
      const user = await User.findOne({ email: userEmail.toLowerCase().trim() });
      if (user) {
        const docs = await Enrollment.find({ studentId: user._id })
          .populate('courseId')
          .sort({ enrolledAt: -1 })
          .lean();

        enrollments = docs
          .filter((e: any) => e.courseId)
          .map((e: any) => ({
            enrollmentId: e._id.toString(),
            enrolledAt: e.enrolledAt,
            progressPercentage: e.progressPercentage || 0,
            course: JSON.parse(JSON.stringify(e.courseId)),
          }));
      }
    } catch (dbErr: any) {
      console.error('Dashboard DB fetch error:', dbErr);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-[#0b2545] via-[#13293d] to-[#1e3a8a] text-white rounded-3xl p-8 lg:p-10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider block">
              Student Learning Hub
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome back, {session?.user?.name || 'Student'}! 👋
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Access your enrolled TutorNova courses, video lectures, PDF notes, and order history.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/orders"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>Order History</span>
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse Catalog</span>
            </Link>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {/* Section Heading */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h2 className="text-xl font-extrabold text-[#0b2545] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <span>My Enrolled Courses ({enrollments.length})</span>
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
              You haven't enrolled in any computer science courses yet. Explore our catalog to get started with Joy Tarafder!
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
            {enrollments.map(({ enrollmentId, progressPercentage, course }: any) => (
              <div
                key={enrollmentId}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative h-44 w-full bg-slate-800">
                    <Image
                      src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80'}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-[#0b2545]/90 text-white text-xs font-bold px-2.5 py-1 rounded">
                      {course.subject || 'CS'}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-3">
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-2">{course.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{course.shortDescription}</p>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-600">
                        <span>Course Progress</span>
                        <span>{progressPercentage || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 pt-0">
                  <Link
                    href={`/learn/${course._id}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm bg-[#0b2545] hover:bg-amber-500 hover:text-slate-950 text-white transition-colors shadow"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Access Course Content</span>
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
