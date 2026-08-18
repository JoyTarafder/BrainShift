'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ShieldCheck, LogOut, User, BookOpen } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'admin';
  const isStudent = session && !isAdmin;

  // Clean duplicate (Admin) tags from display name
  const rawName = session?.user?.name || '';
  const cleanName = rawName.replace(/\s*\(Admin\)/gi, '').trim();

  return (
    <header className="sticky top-0 z-50 bg-[#0b2545]/95 backdrop-blur-md border-b border-slate-700/50 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-white/95 p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-200">
            <Image
              src="/images/logo.png"
              alt="TutorNova Logo"
              width={160}
              height={48}
              className="h-10 w-auto object-contain"
              priority
            />
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 font-medium text-slate-200 text-sm">
          <Link href="/" className="hover:text-amber-400 transition-colors">
            Home
          </Link>
          <Link href="/courses" className="hover:text-amber-400 transition-colors">
            Courses
          </Link>
          <Link href="/about" className="hover:text-amber-400 transition-colors">
            About Joy
          </Link>

          {isAdmin && (
            <Link
              href="/adminpanel"
              className="inline-flex items-center gap-1.5 text-amber-400 font-bold hover:text-amber-300 transition-colors bg-amber-500/10 px-3.5 py-1.5 rounded-xl border border-amber-500/30"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Portal</span>
            </Link>
          )}

          {isStudent && (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-amber-400 font-bold hover:text-amber-300 transition-colors bg-amber-500/10 px-3.5 py-1.5 rounded-xl border border-amber-500/30"
            >
              <BookOpen className="w-4 h-4" />
              <span>My Dashboard</span>
            </Link>
          )}
        </nav>

        {/* Auth Action Buttons */}
        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs font-semibold text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
                {cleanName} {isAdmin ? '(Admin)' : ''}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-rose-600 text-white transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
