import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/db';
import mongoose from 'mongoose';
import { Users, Mail, Phone, Calendar, BookOpen, ShieldCheck } from 'lucide-react';

const UserSchema = new mongoose.Schema({ name: String, email: String, phone: String, role: String, createdAt: Date });
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const EnrollmentSchema = new mongoose.Schema({ studentId: mongoose.Schema.Types.ObjectId, courseId: mongoose.Schema.Types.ObjectId });
const Enrollment = mongoose.models.Enrollment || mongoose.model('Enrollment', EnrollmentSchema);

export default async function AdminStudentsPage() {
  await getServerSession(authOptions);
  await connectToDatabase();

  const studentsDocs = await User.find({ role: 'student' }).sort({ createdAt: -1 }).lean();
  const students = JSON.parse(JSON.stringify(studentsDocs));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h1 className="text-2xl font-extrabold text-[#0b2545]">Student Directory</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Registered student accounts, emails, phone numbers, and tuition records.
          </p>
        </div>
        <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl border border-indigo-200">
          Total Registered: {students.length}
        </span>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-4 px-6">Student Name</th>
                <th className="py-4 px-6">Email Address</th>
                <th className="py-4 px-6">Mobile Number</th>
                <th className="py-4 px-6">Registration Date</th>
                <th className="py-4 px-6 text-right">Account Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No registered student accounts found.
                  </td>
                </tr>
              ) : (
                students.map((st: any) => (
                  <tr key={st._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0b2545] text-amber-400 font-bold flex items-center justify-center text-xs">
                          {st.name?.substring(0, 2).toUpperCase() || 'ST'}
                        </div>
                        <span>{st.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{st.email}</td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-700">{st.phone || 'N/A'}</td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {st.createdAt
                        ? new Date(st.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Active'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                        Student
                      </span>
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
