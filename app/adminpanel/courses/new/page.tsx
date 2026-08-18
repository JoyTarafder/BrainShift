import CourseForm from '@/components/CourseForm';
import Link from 'next/link';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { connectToDatabase } from '@/lib/db';
import Batch from '@/models/Batch';

export default async function NewCoursePage() {
  await connectToDatabase();
  const batchDocs = await Batch.find().sort({ createdAt: -1 }).lean();
  const batches = JSON.parse(JSON.stringify(batchDocs));

  return (
    <div className="space-y-6">
      <Link
        href="/adminpanel/courses"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#0b2545] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Course Management</span>
      </Link>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <PlusCircle className="w-6 h-6 text-amber-500" />
        <div>
          <h1 className="text-2xl font-extrabold text-[#0b2545]">Create New Course Listing</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Fill out course details, syllabus modules, video lectures, and PDF resources.
          </p>
        </div>
      </div>

      <CourseForm batches={batches} />
    </div>
  );
}
