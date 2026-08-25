import CourseForm from '@/components/CourseForm';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/db';
import Course from '@/models/Course';
import Batch from '@/models/Batch';
import { ArrowLeft, Edit3 } from 'lucide-react';

interface EditCoursePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { id } = await params;
  await connectToDatabase();

  const [courseDoc, batchDocs] = await Promise.all([
    Course.findById(id).lean(),
    Batch.find().sort({ createdAt: -1 }).lean(),
  ]);

  if (!courseDoc) {
    notFound();
  }

  const course = JSON.parse(JSON.stringify(courseDoc));
  const batches = JSON.parse(JSON.stringify(batchDocs));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/adminpanel/courses"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#0b2545] transition-colors py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Course Management</span>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Edit3 className="w-6 h-6 text-amber-500 shrink-0" />
        <div>
          <h1 className="text-2xl font-extrabold text-[#0b2545]">Edit Course: {course.title}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Update course title, price, syllabus, video lectures, and PDF resources.
          </p>
        </div>
      </div>

      <CourseForm initialData={course} isEdit batches={batches} />
    </div>
  );
}
