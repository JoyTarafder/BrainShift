'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface BatchFormModalProps {
  courses: Array<{ _id: string; title: string; subject: string }>;
}

export default function BatchFormModal({ courses }: BatchFormModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [courseId, setCourseId] = useState(courses[0]?._id || '');
  const [classSchedule, setClassSchedule] = useState('Sat, Mon, Wed • 8:00 PM');
  const [startDate, setStartDate] = useState('');
  const [maxStudents, setMaxStudents] = useState(30);
  const [status, setStatus] = useState<'active' | 'upcoming' | 'completed'>('active');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !courseId || !classSchedule.trim()) {
      setError('Please fill in batch name, select course, and class schedule');
      return;
    }

    setLoading(true);

    try {
      const data = await fetchApi('/admin/batches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          courseId,
          classSchedule: classSchedule.trim(),
          startDate: startDate || new Date().toISOString(),
          maxStudents: Number(maxStudents),
          status,
        }),
      });

      if (!data || !data.success) {
        throw new Error(data?.message || 'Failed to create batch');
      }

      setIsOpen(false);
      setName('');
      setStartDate('');
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Error creating batch');
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
        <span>Create New Batch</span>
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
                Tuition Schedule
              </span>
              <h3 className="text-2xl font-black text-[#0b2545]">Create Tuition Batch</h3>
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
                  Batch Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Batch 01 - Fall 2026"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#0b2545]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Target Course *
                </label>
                <select
                  required
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id} className="text-slate-900 font-semibold">
                      {c.title} ({c.subject})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Class Schedule *
                </label>
                <input
                  type="text"
                  required
                  value={classSchedule}
                  onChange={(e) => setClassSchedule(e.target.value)}
                  placeholder="e.g. Sat, Mon, Wed • 8:00 PM"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#0b2545]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Student Capacity Limit
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={maxStudents}
                    onChange={(e) => setMaxStudents(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Batch Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
                  >
                    <option value="active" className="text-slate-900 font-semibold">Active</option>
                    <option value="upcoming" className="text-slate-900 font-semibold">Upcoming</option>
                    <option value="completed" className="text-slate-900 font-semibold">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-bold bg-[#0b2545] hover:bg-amber-500 hover:text-slate-950 text-white text-xs shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'Creating Batch...' : 'Save & Publish Batch'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
