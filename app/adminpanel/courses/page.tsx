import Image from 'next/image';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PlusCircle, Edit3, Trash2, Eye, ShieldCheck, ArrowLeft, BookOpen, ToggleLeft, ToggleRight } from 'lucide-react';
import DeleteCourseButton from '@/components/DeleteCourseButton';
import QuickEnrollToggle from '@/components/QuickEnrollToggle';
import { connectToDatabase } from '@/lib/db';
import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  title: String,
  slug: String,
  price: Number,
  oldPrice: Number,
  subject: String,
  level: String,
  duration: String,
  thumbnailUrl: String,
  status: String,
  enrollmentOpen: { type: Boolean, default: true },
  createdAt: Date,
});
const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

export default async function AdminCoursesPage() {
  const session = await getServerSession(authOptions);
  const token = (session?.user as any)?.apiToken;

  await connectToDatabase();
  const docs = await Course.find().sort({ createdAt: -1 }).lean();
  const courses = JSON.parse(JSON.stringify(docs));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <h1 className="text-2xl font-extrabold text-[#0b2545]">Course Management</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Create, edit, publish, toggle enrollment status (OPEN/CLOSED), and manage TutorNova courses.
          </p>
        </div>

        <Link
          href="/adminpanel/courses/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Course</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-4 px-6">Course</th>
                <th className="py-4 px-6">Subject</th>
                <th className="py-4 px-6">Level</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Enrollment Status</th>
                <th className="py-4 px-6">Publish Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No courses available in the database.
                  </td>
                </tr>
              ) : (
                courses.map((course: any) => (
                  <tr key={course._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          <Image
                            src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80'}
                            alt={course.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block line-clamp-1">{course.title}</span>
                          <span className="text-xs text-slate-400 font-mono">/{course.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-700">{course.subject}</td>
                    <td className="py-4 px-6 text-xs font-semibold text-slate-600 capitalize">{course.level}</td>
                    <td className="py-4 px-6 font-bold text-[#0b2545]">
                      ৳ {course.price?.toLocaleString('en-BD')}
                    </td>
                    
                    {/* Quick Interactive Enrollment Toggle Button */}
                    <td className="py-4 px-6">
                      <QuickEnrollToggle
                        courseId={course._id}
                        initialOpen={course.enrollmentOpen !== false}
                        token={token}
                      />
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                          course.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-slate-200 text-slate-700 border-slate-300'
                        }`}
                      >
                        {course.status}
                      </span>
                    </td>
                    
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/courses/${course.slug}`}
                          target="_blank"
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View Public Page"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/adminpanel/courses/${course._id}/edit`}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit Course"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <DeleteCourseButton courseId={course._id} token={token} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
