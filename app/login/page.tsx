'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

function StudentLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid email or password. Please check your credentials.');
        setLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      setError('An error occurred during sign in. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Email Address
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@gmail.com"
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0b2545]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Password
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0b2545]"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 rounded-xl font-bold bg-[#0b2545] hover:bg-amber-500 hover:text-slate-950 text-white text-xs shadow-lg transition-all flex items-center justify-center gap-2"
      >
        <LogIn className="w-4 h-4" />
        <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
      </button>
    </form>
  );
}

export default function StudentLoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
            Student Portal
          </span>
          <h1 className="text-3xl font-extrabold text-[#0b2545]">Student Login</h1>
          <p className="text-xs text-slate-500">
            Access your TutorNova courses, video lectures, PDF notes, and exam scores.
          </p>
        </div>

        <Suspense fallback={<div className="p-4 text-center text-xs text-slate-400">Loading form...</div>}>
          <StudentLoginForm />
        </Suspense>

        <div className="text-center pt-2 border-t border-slate-100 space-y-2">
          <p className="text-xs text-slate-600">
            Don't have a student account yet?{' '}
            <Link href="/register" className="font-bold text-amber-600 hover:underline">
              Create Account
            </Link>
          </p>

          <p className="text-[11px] text-slate-400 pt-2">
            Are you an administrator?{' '}
            <Link href="/adminpanel/login" className="text-indigo-600 hover:underline font-semibold">
              Admin Login Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
