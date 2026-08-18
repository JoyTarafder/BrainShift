import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/db';
import mongoose from 'mongoose';
import Course from '@/models/Course';
import Mark from '@/models/Mark';
import { Award, PlusCircle, CheckCircle2, User as UserIcon, BookOpen } from 'lucide-react';
import MarkFormModal from './MarkFormModal';

const UserSchema = new mongoose.Schema({ name: String, email: String, role: String });
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default async function AdminMarksPage() {
  await getServerSession(authOptions);
  await connectToDatabase();

  const [studentDocs, courseDocs, markDocs] = await Promise.all([
    User.find({ role: 'student' }).select('_id name email').lean(),
    Course.find({ status: 'published' }).select('_id title subject').lean(),
    Mark.find().populate('studentId', 'name email').populate('courseId', 'title').sort({ createdAt: -1 }).lean(),
  ]);

  const students = JSON.parse(JSON.stringify(studentDocs));
  const courses = JSON.parse(JSON.stringify(courseDocs));
  const marks = JSON.parse(JSON.stringify(markDocs));

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0b2545] via-[#13293d] to-[#1e3a8a] text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Academic Performance Evaluation</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Student Exam Marks</h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Assign, publish, and manage exam marks and feedback for enrolled students.
          </p>
        </div>

        <MarkFormModal students={students} courses={courses} />
      </div>

      {/* Marks List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-[#0b2545] flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Published Exam Results ({marks.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-4 px-6">Student</th>
                <th className="py-4 px-6">Exam Title</th>
                <th className="py-4 px-6">Course</th>
                <th className="py-4 px-6">Marks Obtained</th>
                <th className="py-4 px-6">Grade / Status</th>
                <th className="py-4 px-6 text-right">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {marks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No exam marks recorded yet. Click "Assign New Exam Mark" to add student scores.
                  </td>
                </tr>
              ) : (
                marks.map((m: any) => (
                  <tr key={m._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {m.studentId?.name || 'Student'}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800">{m.examTitle}</td>
                    <td className="py-4 px-6 text-xs text-slate-600 font-medium">
                      {m.courseId?.title || 'TutorNova Course'}
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-[#0b2545]">
                      {m.marksObtained} / {m.totalMarks}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {m.grade || 'Pass'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500 text-right">{m.remarks || 'Good job'}</td>
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
