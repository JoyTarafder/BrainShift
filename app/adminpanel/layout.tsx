'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  Users,
  Award,
  CreditCard,
  ShieldCheck,
  PlusCircle,
  ArrowLeft,
  ChevronRight,
  User,
} from 'lucide-react';

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide admin sidebar on /adminpanel/login
  if (pathname === '/adminpanel/login') {
    return <>{children}</>;
  }

  const navItems = [
    {
      name: 'Overview Dashboard',
      href: '/adminpanel',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: 'Course Management',
      href: '/adminpanel/courses',
      icon: BookOpen,
      exact: false,
    },
    {
      name: 'Batch Management',
      href: '/adminpanel/batches',
      icon: Layers,
      exact: false,
    },
    {
      name: 'Payment & Orders',
      href: '/adminpanel/payments',
      icon: CreditCard,
      exact: false,
    },
    {
      name: 'Student Directory',
      href: '/adminpanel/students',
      icon: Users,
      exact: false,
    },
    {
      name: 'Marks & Evaluation',
      href: '/adminpanel/marks',
      icon: Award,
      exact: false,
    },
    {
      name: 'Admin Profile',
      href: '/adminpanel/profile',
      icon: User,
      exact: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Left Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#0b2545] text-white border-r border-slate-800 shrink-0 md:min-h-[calc(100vh-5rem)] p-4 sm:p-6 space-y-8">
        {/* Sidebar Header */}
        <div className="space-y-1 pb-4 border-b border-slate-700/60">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
            <span>Admin Control Panel</span>
          </div>
          <p className="text-xs text-slate-400">BrainShift Management System</p>
        </div>

        {/* Navigation Section */}
        <div className="space-y-2">
          <span className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider block px-3">
            Main Menu
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
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Quick Action Button */}
        <div className="pt-4 border-t border-slate-700/60 space-y-3">
          <span className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider block px-3">
            Quick Actions
          </span>
          <Link
            href="/adminpanel/courses/new"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>New Course Listing</span>
          </Link>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors pt-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Main Site</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-grow p-4 sm:p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
