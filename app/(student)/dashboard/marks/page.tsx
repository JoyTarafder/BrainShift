import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Award, ArrowLeft, CheckCircle2, Star } from 'lucide-react';
import { connectToDatabase } from '@/lib/db';
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({ email: String, name: String });
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const CourseSchema = new mongoose.Schema({ title: String, slug: String, subject: String });
const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

const MarkSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  examTitle: String,
  marksObtained: Number,
  totalMarks: Number,
  remarks: String,
  createdAt: Date,
});
const Mark = mongoose.models.Mark || mongoose.model('Mark', MarkSchema);

export default async function StudentMarksPage() {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;
  const token = (session?.user as any)?.apiToken;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  let marks: any[] = [];

  if (userEmail) {
    try {
      await connectToDatabase();
      const user = await User.findOne({ email: userEmail.toLowerCase().trim() });
      if (user) {
        const docs = await Mark.find({ studentId: user._id })
          .populate('courseId', 'title slug subject')
          .sort({ createdAt: -1 })
          .lean();

        marks = JSON.parse(JSON.stringify(docs));
      }
    } catch (err) {
      console.error('Student marks query error:', err);
    }
  }

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

        {/* Header Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-500" />
              <h1 className="text-2xl font-extrabold text-[#0b2545]">My Exam Results & Academic Marks</h1>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              View your quiz scores, midterm performance, and teacher feedback from Joy Tarafder.
            </p>
          </div>
        </div>

        {/* Marks List */}
        {marks.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4 max-w-xl mx-auto">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-[#0b2545]">No Exam Marks Published Yet</h3>
            <p className="text-slate-600 text-sm">
              Your exam scores and quiz evaluations will appear here once published by Joy.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {marks.map((m: any) => {
              const percentage = Math.round((m.marksObtained / m.totalMarks) * 100);
              return (
                <div
                  key={m._id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded">
                        {m.courseId?.title || 'TutorNova Course'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#0b2545]">{m.examTitle}</h3>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-600">Marks Score:</span>
                      <div className="text-right">
                        <span className="text-2xl font-black text-[#0b2545]">
                          {m.marksObtained} / {m.totalMarks}
                        </span>
                        <span className="text-xs text-emerald-600 font-bold block">
                          Grade: {percentage}%
                        </span>
                      </div>
                    </div>

                    {m.remarks && (
                      <div className="pt-2 text-xs text-slate-600 italic bg-amber-500/5 p-3 rounded-lg border border-amber-500/20">
                        <strong>Feedback:</strong> "{m.remarks}"
                      </div>
                    )}
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
