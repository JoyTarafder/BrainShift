'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ShieldCheck, LogOut, User, BookOpen, Menu, X, Home, GraduationCap } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = (session?.user as any)?.role === 'admin';
  const isStudent = session && !isAdmin;

  // Clean duplicate (Admin) tags from display name
  const rawName = session?.user?.name || '';
  const cleanName = rawName.replace(/\s*\(Admin\)/gi, '').trim();

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-[#0b2545]/95 backdrop-blur-md border-b border-slate-700/50 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" onClick={closeMobileMenu} className="flex items-center gap-3 group">
          <div className="bg-white/95 p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-200">
            <Image
              src="/images/logo.png"
              alt="TutorNova Logo"
              width={180}
              height={54}
              style={{ height: '38px', width: 'auto' }}
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Desktop Navigation Links */}
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

        {/* Desktop Auth Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
                {cleanName} {isAdmin ? '(Admin)' : ''}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-rose-600 text-white transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
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

        {/* Mobile Hamburger Toggle Button */}
        <div className="flex items-center gap-2 md:hidden">
          {session && (
            <span className="text-[11px] font-bold text-amber-400 bg-slate-800/90 px-2 py-1 rounded border border-slate-700 truncate max-w-[110px]">
              {cleanName}
            </span>
          )}
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-amber-400 focus:outline-none border border-slate-700"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-amber-400 transition-colors"
          >
            <Home className="w-4 h-4 text-amber-400" />
            <span>Home</span>
          </Link>

          <Link
            href="/courses"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-amber-400 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Courses & Materials</span>
          </Link>

          <Link
            href="/about"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-amber-400 transition-colors"
          >
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span>About Joy Tarafder</span>
          </Link>

          {isAdmin && (
            <Link
              href="/adminpanel"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Executive Portal</span>
            </Link>
          )}

          {isStudent && (
            <Link
              href="/dashboard"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30"
            >
              <BookOpen className="w-4 h-4" />
              <span>Student Dashboard</span>
            </Link>
          )}

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {session ? (
              <button
                onClick={() => {
                  closeMobileMenu();
                  signOut({ callbackUrl: '/' });
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({cleanName})</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="w-full text-center py-2.5 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={closeMobileMenu}
                  className="w-full text-center py-2.5 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

