'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, ShieldCheck, Save, CheckCircle2, AlertCircle, Briefcase, FileText } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function AdminProfilePage() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [bio, setBio] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApi('/user/profile')
      .then((data) => {
        if (data.success && data.user) {
          const rawName = data.user.name || '';
          setName(rawName.replace(/\s*\(Admin\)/gi, '').trim());
          setEmail(data.user.email || '');
          setPhone(data.user.phone || '');
          setDesignation(data.user.designation || 'Software Engineer & Founder');
          setBio(data.user.bio || 'Computer Science CSE student at Independent University, Bangladesh (IUB) & TutorNova Founder.');
        }
      })
      .catch((err) => {
        console.error('Failed to load admin profile:', err);
        setError('Failed to load profile details.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const cleanName = name.replace(/\s*\(Admin\)/gi, '').trim();

    try {
      const data = await fetchApi('/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          phone: phone.trim(),
          designation: designation.trim(),
          bio: bio.trim(),
        }),
      });

      if (!data || !data.success) {
        throw new Error(data?.message || 'Failed to update profile');
      }

      setSuccess('Admin profile updated successfully across the site!');

      // Instantly update NextAuth session in real-time
      if (updateSession) {
        await updateSession({ name: cleanName });
      }

      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 text-xs font-semibold">Loading Admin Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0b2545] via-[#13293d] to-[#1e3a8a] text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-xl bg-amber-500 text-slate-950 font-black text-2xl flex items-center justify-center shadow-md shrink-0">
          {name?.substring(0, 2).toUpperCase() || 'AD'}
        </div>

        <div className="space-y-1.5 text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-lg border border-amber-500/30">
            <ShieldCheck className="w-4 h-4" />
            <span>Administrator Profile</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{name || 'Admin'}</h1>
          <p className="text-slate-300 text-xs font-medium">{email}</p>
        </div>
      </div>

      {/* Profile Edit Form Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-[#0b2545] flex items-center gap-2">
            <User className="w-5 h-5 text-amber-500" />
            <span>Edit Admin Profile Details</span>
          </h2>
        </div>

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-bold shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-bold shadow-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#0b2545] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address (Read-only)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs font-mono text-slate-500 cursor-not-allowed select-none opacity-80"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mobile Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-[#0b2545] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Designation / Title
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="Software Engineer & TutorNova Founder"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#0b2545] outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Bio & Teaching Philosophy
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your teaching experience, computer science background, and mentorship goals..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-[#0b2545] outline-none"
              ></textarea>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-[#0b2545] hover:bg-amber-500 hover:text-slate-950 text-white text-xs shadow-md transition-all cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
