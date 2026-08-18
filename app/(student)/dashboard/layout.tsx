'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Award,
  ShoppingBag,
  GraduationCap,
  ChevronRight,
  ArrowLeft,
  User,
} from 'lucide-react';

export default function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Enrolled Courses',
      href: '/dashboard',
      icon: BookOpen,
      exact: true,
    },
    {
      name: 'My Exam Marks',
      href: '/dashboard/marks',
      icon: Award,
      exact: false,
    },
    {
      name: 'Order & Receipt History',
      href: '/dashboard/orders',
      icon: ShoppingBag,
      exact: false,
    },
    {
      name: 'My Profile',
      href: '/dashboard/profile',
      icon: User,
      exact: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Left Sidebar Navigation for Students */}
      <aside className="w-full md:w-64 bg-[#0b2545] text-white border-r border-slate-800 shrink-0 md:min-h-[calc(100vh-5rem)] p-4 sm:p-6 space-y-8">
        {/* Sidebar Header */}
        <div className="space-y-1 pb-4 border-b border-slate-700/60">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <GraduationCap className="w-5 h-5" />
            <span>Student Portal</span>
          </div>
          <p className="text-[11px] text-slate-400">TutorNova Student Learning Hub</p>
        </div>

        {/* Navigation Menu */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider block px-3">
            Student Menu
          </span>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 shrink-0" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Explore Catalog Shortcut */}
        <div className="pt-4 border-t border-slate-700/60 space-y-3">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider block px-3">
            Explore
          </span>
          <Link
            href="/courses"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Browse All Courses</span>
          </Link>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors pt-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-grow p-4 sm:p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
