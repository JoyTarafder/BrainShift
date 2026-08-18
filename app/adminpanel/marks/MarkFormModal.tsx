'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Award, CheckCircle2, AlertCircle } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface MarkFormModalProps {
  students: Array<{ _id: string; name: string; email: string }>;
  courses: Array<{ _id: string; title: string; subject: string }>;
}

export default function MarkFormModal({ students, courses }: MarkFormModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [studentId, setStudentId] = useState(students[0]?._id || '');
  const [courseId, setCourseId] = useState(courses[0]?._id || '');
  const [examTitle, setExamTitle] = useState('');
  const [marksObtained, setMarksObtained] = useState('');
  const [totalMarks, setTotalMarks] = useState('100');
  const [grade, setGrade] = useState('A+');
  const [remarks, setRemarks] = useState('Excellent performance');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!studentId || !examTitle.trim() || !marksObtained) {
      setError('Please select student, enter exam title, and marks obtained');
      return;
    }

    setLoading(true);

    try {
      const data = await fetchApi('/admin/marks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          courseId: courseId || undefined,
          examTitle: examTitle.trim(),
          marksObtained: Number(marksObtained),
          totalMarks: Number(totalMarks),
          grade: grade.trim(),
          remarks: remarks.trim(),
        }),
      });

      if (!data || !data.success) {
        throw new Error(data?.message || 'Failed to save exam mark');
      }

      setIsOpen(false);
      setExamTitle('');
      setMarksObtained('');
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Error saving exam mark');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>Assign Exam Mark</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative space-y-6 my-auto max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 text-center pt-2">
              <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                Evaluation Portal
              </span>
              <h3 className="text-2xl font-black text-[#0b2545]">Assign Student Exam Mark</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-slate-900">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Select Student *
                </label>
                <select
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
                >
                  {students.map((s) => (
                    <option key={s._id} value={s._id} className="text-slate-900 font-semibold">
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Associated Course
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
                >
                  <option value="" className="text-slate-900 font-semibold">-- General Evaluation --</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id} className="text-slate-900 font-semibold">
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Exam / Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="e.g. Midterm Algorithm Evaluation"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#0b2545]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Marks Obtained *
                  </label>
                  <input
                    type="number"
                    required
                    value={marksObtained}
                    onChange={(e) => setMarksObtained(e.target.value)}
                    placeholder="85"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#0b2545]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                    placeholder="100"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#0b2545]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Grade
                  </label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="A+"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#0b2545]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Remarks
                  </label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Great work!"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#0b2545]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-bold bg-[#0b2545] hover:bg-amber-500 hover:text-slate-950 text-white text-xs shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'Saving Mark...' : 'Publish Student Score'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
