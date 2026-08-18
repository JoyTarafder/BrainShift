'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, GraduationCap, ArrowRight } from 'lucide-react';
import CourseCard from '@/components/CourseCard';
import Testimonials from '@/components/Testimonials';
import { ICourse } from '@/models/Course';
import { fetchApi } from '@/lib/api';

export default function Home() {
  const [courses, setCourses] = useState<Partial<ICourse>[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    // Fetch featured courses from backend
    fetchApi('/courses')
      .then((data) => {
        if (data.success) {
          setCourses(data.courses);
        }
      })
      .catch((err) => console.error('Failed to load homepage courses', err))
      .finally(() => setLoadingCourses(false));
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0b2545] via-[#13293d] to-[#1e3a8a] text-white py-20 lg:py-28">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-semibold">
                <GraduationCap className="w-4 h-4" />
                <span>Personal Tuition & Mentorship Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Learn Computer Science & Coding with <span className="text-amber-400">TutorNova</span>
              </h1>

              <p className="text-lg text-slate-300 max-w-2xl">
                Master software engineering fundamentals, web development, algorithms, and cloud technologies with Joy Tarafder — customized 1-on-1 private tuition and structured online courses.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 transition-all duration-200"
                >
                  <span>Explore Courses</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-200"
                >
                  About Joy
                </Link>
              </div>

              {/* Credentials Trust Badges */}
              <div className="pt-8 border-t border-slate-700/60 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <p className="text-2xl font-bold text-amber-400">CSE @ IUB</p>
                  <p className="text-xs text-slate-400">Academic Excellence</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">CloudCoder</p>
                  <p className="text-xs text-slate-400">Industry Internship</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-400">1-on-1</p>
                  <p className="text-xs text-slate-400">Personalized Mentoring</p>
                </div>
              </div>
            </div>

            {/* Right Card / Logo Showcase */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-slate-900/90 border border-slate-700/70 rounded-2xl p-6 shadow-2xl backdrop-blur-xl space-y-6">
                <div className="bg-white rounded-xl p-4 flex justify-center shadow-inner">
                  <Image
                    src="/images/logo.png"
                    alt="TutorNova Brand Logo"
                    width={260}
                    height={80}
                    className="h-20 w-auto object-contain"
                  />
                </div>

                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>Direct live tuition & code reviews</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>Structured course modules & materials</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>Bangladesh Local Payments (bKash/Nagad)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-amber-600 font-bold text-xs uppercase tracking-wider block">
              Featured Curricula
            </span>
            <h2 className="text-3xl font-extrabold text-[#0b2545]">Featured TutorNova Courses</h2>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0b2545] hover:text-amber-600 transition-colors"
          >
            <span>View All Courses</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingCourses ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-96 border border-slate-200 p-6 animate-pulse space-y-4">
                <div className="bg-slate-200 h-48 rounded-xl w-full"></div>
                <div className="bg-slate-200 h-6 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <p className="text-slate-500 text-sm">No courses currently listed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courses.slice(0, 3).map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* About Teaser Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-[#0b2545] rounded-3xl p-8 lg:p-12 text-white shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-3xl font-extrabold text-amber-400">About Joy Tarafder</h2>
              <p className="text-slate-300 leading-relaxed">
                Joy is a passionate Computer Science student at Independent University, Bangladesh (IUB) with practical software engineering experience from his internship at CloudCoder. Through <strong className="text-white">TutorNova</strong>, Joy combines academic rigour with hands-on software development training.
              </p>
            </div>
            <div className="lg:col-span-4 flex justify-center">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center space-y-3">
                <p className="text-lg font-bold text-white">Want 1-on-1 Tuition?</p>
                <p className="text-xs text-slate-300">Read Joy's full background, teaching philosophy & skills.</p>
                <Link
                  href="/about"
                  className="inline-block mt-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-lg shadow transition-colors"
                >
                  Read Full Bio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
