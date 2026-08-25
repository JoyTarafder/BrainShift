'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Mail, Phone, Calendar, Edit, Trash2, Key, Eye, 
  X, Check, AlertCircle, Search, ShieldCheck, UserCheck, 
  Ban, ShieldAlert, CheckCircle2, UserX 
} from 'lucide-react';

interface Student {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status?: 'active' | 'blocked';
  createdAt?: string;
}

export default function StudentTableClient({ initialStudents }: { initialStudents: Student[] }) {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'password' | 'delete' | 'block' | null>(null);

  // Form states
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('student');
  const [editStatus, setEditStatus] = useState<'active' | 'blocked'>('active');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filter students based on search query
  const filteredStudents = students.filter((st) => {
    const q = searchQuery.toLowerCase();
    return (
      st.name?.toLowerCase().includes(q) ||
      st.email?.toLowerCase().includes(q) ||
      (st.phone && st.phone.toLowerCase().includes(q))
    );
  });

  const openViewModal = (st: Student) => {
    setSelectedStudent(st);
    setFeedback(null);
    setModalType('view');
  };

  const openEditModal = (st: Student) => {
    setSelectedStudent(st);
    setEditName(st.name || '');
    setEditEmail(st.email || '');
    setEditPhone(st.phone || '');
    setEditRole(st.role || 'student');
    setEditStatus(st.status === 'blocked' ? 'blocked' : 'active');
    setFeedback(null);
    setModalType('edit');
  };

  const openPasswordModal = (st: Student) => {
    setSelectedStudent(st);
    setNewPassword('');
    setFeedback(null);
    setModalType('password');
  };

  const openDeleteModal = (st: Student) => {
    setSelectedStudent(st);
    setFeedback(null);
    setModalType('delete');
  };

  const openBlockModal = (st: Student) => {
    setSelectedStudent(st);
    setFeedback(null);
    setModalType('block');
  };

  const closeModal = () => {
    setSelectedStudent(null);
    setModalType(null);
    setFeedback(null);
    setLoading(false);
  };

  // 1. Handle Update Profile
  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/students/${selectedStudent._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          phone: editPhone,
          role: editRole,
          status: editStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update student.');
      }

      setStudents((prev) =>
        prev.map((s) => (s._id === selectedStudent._id ? { ...s, name: editName, email: editEmail, phone: editPhone, role: editRole, status: editStatus } : s))
      );
      setFeedback({ type: 'success', message: 'Student details updated successfully!' });
      setTimeout(() => closeModal(), 1200);
      router.refresh();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error updating student.' });
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    if (newPassword.length < 6) {
      setFeedback({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/students/${selectedStudent._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to reset password.');
      }

      setFeedback({ type: 'success', message: `Password reset successfully for ${selectedStudent.name}!` });
      setTimeout(() => closeModal(), 1200);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error updating password.' });
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Block / Unblock Student
  const handleToggleBlockStudent = async () => {
    if (!selectedStudent) return;

    setLoading(true);
    setFeedback(null);

    const isCurrentlyBlocked = selectedStudent.status === 'blocked';
    const nextStatus = isCurrentlyBlocked ? 'active' : 'blocked';

    try {
      const res = await fetch(`/api/admin/students/${selectedStudent._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to change student status.');
      }

      setStudents((prev) =>
        prev.map((s) => (s._id === selectedStudent._id ? { ...s, status: nextStatus } : s))
      );
      setFeedback({
        type: 'success',
        message: nextStatus === 'blocked' ? 'Student account has been blocked!' : 'Student account unblocked successfully!',
      });
      setTimeout(() => closeModal(), 1000);
      router.refresh();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error updating status.' });
    } finally {
      setLoading(false);
    }
  };

  // 4. Handle Delete Student
  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;

    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/students/${selectedStudent._id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete student.');
      }

      setStudents((prev) => prev.filter((s) => s._id !== selectedStudent._id));
      closeModal();
      router.refresh();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error deleting student.' });
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-[#0b2545] outline-none"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Showing <span className="text-[#0b2545] font-bold">{filteredStudents.length}</span> of {students.length} students
        </div>
      </div>

      {/* Student List Table with Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-200">
                <th className="py-4 px-6">Student Name</th>
                <th className="py-4 px-6">Email Address</th>
                <th className="py-4 px-6">Mobile Number</th>
                <th className="py-4 px-6">Registration Date</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No student accounts found matching your search.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const isBlocked = st.status === 'blocked';
                  return (
                    <tr 
                      key={st._id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isBlocked ? 'bg-rose-50/40 text-slate-500' : ''
                      }`}
                    >
                      {/* Student Name */}
                      <td className="py-4 px-6 font-bold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs shrink-0 shadow-xs ${
                            isBlocked 
                              ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                              : 'bg-[#0b2545] text-amber-400'
                          }`}>
                            {st.name?.substring(0, 2).toUpperCase() || 'ST'}
                          </div>
                          <div>
                            <span className="truncate max-w-[180px] block">{st.name}</span>
                            {isBlocked && (
                              <span className="text-xs text-rose-600 font-semibold">Blocked Account</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-6 text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{st.email}</span>
                        </div>
                      </td>

                      {/* Mobile Number */}
                      <td className="py-4 px-6 font-mono text-xs text-slate-700">
                        {st.phone || 'N/A'}
                      </td>

                      {/* Registration Date */}
                      <td className="py-4 px-6 text-xs text-slate-500">
                        {st.createdAt
                          ? new Date(st.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Active'}
                      </td>

                      {/* Status / Role Badge */}
                      <td className="py-4 px-6 text-center">
                        {isBlocked ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold capitalize px-2.5 py-0.5 rounded-lg bg-rose-100 text-rose-700 border border-rose-200">
                            <Ban className="w-3 h-3" /> Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold capitalize px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        )}
                      </td>

                      {/* ACTION BUTTONS */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Details Button */}
                          <button
                            onClick={() => openViewModal(st)}
                            title="View Profile Details"
                            aria-label="View Profile Details"
                            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-[#0b2545] border border-slate-200 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Student Button */}
                          <button
                            onClick={() => openEditModal(st)}
                            title="Edit Account Information"
                            aria-label="Edit Account Information"
                            className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Reset Password Button */}
                          <button
                            onClick={() => openPasswordModal(st)}
                            title="Reset Account Password"
                            aria-label="Reset Account Password"
                            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-[#0b2545] border border-slate-200 transition-colors cursor-pointer"
                          >
                            <Key className="w-4 h-4" />
                          </button>

                          {/* BLOCK / UNBLOCK BUTTON */}
                          <button
                            onClick={() => openBlockModal(st)}
                            title={isBlocked ? 'Unblock Student' : 'Block Student'}
                            aria-label={isBlocked ? 'Unblock Student' : 'Block Student'}
                            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                              isBlocked
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-700 border-slate-200 hover:border-orange-200'
                            }`}
                          >
                            {isBlocked ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                          </button>

                          {/* Delete Student Button */}
                          <button
                            onClick={() => openDeleteModal(st)}
                            title="Delete Student Account"
                            aria-label="Delete Student Account"
                            className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== MODALS ===================== */}

      {/* 1. VIEW STUDENT MODAL */}
      {modalType === 'view' && selectedStudent && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl font-bold flex items-center justify-center text-base shadow-xs ${
                  selectedStudent.status === 'blocked' ? 'bg-rose-100 text-rose-700' : 'bg-[#0b2545] text-amber-400'
                }`}>
                  {selectedStudent.name?.substring(0, 2).toUpperCase() || 'ST'}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#0b2545]">{selectedStudent.name}</h2>
                  <p className="text-xs text-slate-400">ID: {selectedStudent._id}</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                <span className="text-slate-500 font-medium">Account Status:</span>
                <span className={`font-bold capitalize px-2.5 py-0.5 rounded-lg text-xs ${
                  selectedStudent.status === 'blocked'
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {selectedStudent.status || 'active'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                <span className="text-slate-500 font-medium">Email Address:</span>
                <span className="font-bold text-slate-800">{selectedStudent.email}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                <span className="text-slate-500 font-medium">Mobile Number:</span>
                <span className="font-bold text-slate-800">{selectedStudent.phone || 'Not Provided'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                <span className="text-slate-500 font-medium">Account Role:</span>
                <span className="font-bold text-[#0b2545] capitalize">{selectedStudent.role || 'Student'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                <span className="text-slate-500 font-medium">Registration Date:</span>
                <span className="font-bold text-slate-800">
                  {selectedStudent.createdAt ? new Date(selectedStudent.createdAt).toLocaleString() : 'Active'}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => openEditModal(selectedStudent)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" /> Edit Profile
              </button>
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. EDIT STUDENT MODAL */}
      {modalType === 'edit' && selectedStudent && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#0b2545]">Edit Student Information</h2>
                <p className="text-xs text-slate-500">Update account credentials & contact details</p>
              </div>
              <button onClick={closeModal} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedback && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 font-medium ${
                feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {feedback.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleUpdateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0b2545] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0b2545] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0b2545] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0b2545] outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as 'active' | 'blocked')}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0b2545] outline-none font-semibold"
                  >
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-[#0b2545] hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{loading ? 'Saving Changes...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. RESET PASSWORD MODAL */}
      {modalType === 'password' && selectedStudent && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#0b2545]">Set New Password</h2>
                <p className="text-xs text-slate-500">For {selectedStudent.name} ({selectedStudent.email})</p>
              </div>
              <button onClick={closeModal} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedback && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 font-medium ${
                feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {feedback.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter at least 6 characters"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0b2545] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{loading ? 'Updating Password...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. BLOCK / UNBLOCK CONFIRMATION MODAL */}
      {modalType === 'block' && selectedStudent && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-150">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto border shadow-inner ${
              selectedStudent.status === 'blocked'
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                : 'bg-orange-100 text-orange-700 border-orange-200'
            }`}>
              {selectedStudent.status === 'blocked' ? <UserCheck className="w-6 h-6" /> : <Ban className="w-6 h-6" />}
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-slate-900">
                {selectedStudent.status === 'blocked' ? 'Unblock Student Account?' : 'Block Student Account?'}
              </h2>
              <p className="text-xs text-slate-500">
                {selectedStudent.status === 'blocked'
                  ? `Are you sure you want to restore access for ${selectedStudent.name}? They will be able to log in and access courses again.`
                  : `Are you sure you want to block ${selectedStudent.name} (${selectedStudent.email})? They will be immediately prevented from logging into BrainShift.`}
              </p>
            </div>

            {feedback && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 font-medium ${
                feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {feedback.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{feedback.message}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleBlockStudent}
                disabled={loading}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 text-white cursor-pointer ${
                  selectedStudent.status === 'blocked'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {selectedStudent.status === 'blocked' ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{loading ? 'Unblocking...' : 'Confirm Unblock'}</span>
                  </>
                ) : (
                  <>
                    <Ban className="w-3.5 h-3.5" />
                    <span>{loading ? 'Blocking...' : 'Confirm Block'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. DELETE STUDENT CONFIRMATION MODAL */}
      {modalType === 'delete' && selectedStudent && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mx-auto border border-rose-200 shadow-inner">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-slate-900">Delete Student Account?</h2>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently remove <strong className="text-slate-800">{selectedStudent.name}</strong> ({selectedStudent.email})? This action cannot be undone.
              </p>
            </div>

            {feedback && feedback.type === 'error' && (
              <div className="p-3 rounded-xl text-xs flex items-center gap-2 font-medium bg-rose-50 text-rose-700 border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{feedback.message}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteStudent}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{loading ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
