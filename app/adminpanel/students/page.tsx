import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { Users } from 'lucide-react';
import StudentTableClient from './StudentTableClient';

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
            <Users className="w-5 h-5 text-amber-500" />
            <h1 className="text-2xl font-extrabold text-[#0b2545]">Student Directory</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Registered student accounts, emails, phone numbers, and account management.
          </p>
        </div>
        <span className="text-xs font-bold bg-amber-50 text-amber-800 px-3 py-1.5 rounded-lg border border-amber-200">
          Total Registered: {students.length}
        </span>
      </div>

      {/* Interactive Student Table with Actions */}
      <StudentTableClient initialStudents={students} />
    </div>
  );
}
