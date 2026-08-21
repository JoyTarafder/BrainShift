"use client";

import CourseCard from "@/components/CourseCard";
import Testimonials from "@/components/Testimonials";
import { fetchApi } from "@/lib/api";
import { ICourse } from "@/models/Course";
import {
  ArrowRight,
  Atom,
  BookOpen,
  CheckCircle2,
  Code,
  GraduationCap,
  Laptop,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [courses, setCourses] = useState<Partial<ICourse>[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    // Fetch featured courses from backend
    fetchApi("/courses")
      .then((data) => {
        if (data.success) {
          setCourses(data.courses);
        }
      })
      .catch((err) => console.error("Failed to load homepage courses", err))
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
                <span>Private Tuition & Academic Mentorship</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Class 5–10, Inter ICT & CS Tuition with{" "}
                <span className="text-amber-400">TutorNova</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl">
                Expert 1-on-1 and group tuition by <strong>Joy Tarafder</strong> (CSE @ IUB). Specializing in 
                <span className="text-amber-300 font-semibold"> Class 5–8 (All Subjects)</span>, 
                <span className="text-amber-300 font-semibold"> Class 9–10 (Science Only)</span>, 
                <span className="text-amber-300 font-semibold"> Inter ICT</span>, and University Computer Science & Coding.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 transition-all duration-200"
                >
                  <span>Tuition Details & About</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-200"
                >
                  Explore Courses
                </Link>
              </div>

              {/* Credentials Trust Badges */}
              <div className="pt-8 border-t border-slate-700/60 grid grid-cols-3 gap-2 sm:gap-4 text-center lg:text-left">
                <div>
                  <p className="text-base sm:text-2xl font-bold text-amber-400">Class 5–10</p>
                  <p className="text-[10px] sm:text-xs text-slate-400">All Subjects & Science</p>
                </div>
                <div>
                  <p className="text-base sm:text-2xl font-bold text-white">Inter ICT</p>
                  <p className="text-[10px] sm:text-xs text-slate-400">Class 11–12 HSC</p>
                </div>
                <div>
                  <p className="text-base sm:text-2xl font-bold text-amber-400">CSE @ IUB</p>
                  <p className="text-[10px] sm:text-xs text-slate-400">CloudCoder Intern</p>
                </div>
              </div>
            </div>

            {/* Right Card / Tuition Highlight Showcase */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-slate-900/90 border border-slate-700/70 rounded-2xl p-6 shadow-2xl backdrop-blur-xl space-y-6">
                <div className="bg-white rounded-xl p-4 flex justify-center shadow-inner">
                  <Image
                    src="/images/logo.png"
                    alt="TutorNova Brand Logo"
                    width={260}
                    height={80}
                    style={{ height: "72px", width: "auto" }}
                    className="object-contain"
                  />
                </div>

                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                    <span><strong>Class 5 to 8:</strong> All Subjects (সকল বিষয়)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                    <span><strong>Class 9 to 10:</strong> Science Group (শুধুমাত্র বিজ্ঞান)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                    <span><strong>HSC / Inter:</strong> ICT (তথ্য ও যোগাযোগ প্রযুক্তি)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                    <span><strong>CSE & Coding:</strong> Software Engineering & Industry Internship Guidance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tuition Offerings / Levels Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Targeted Academic Programs</span>
          </div>
          <h2 className="text-3xl font-extrabold text-[#0b2545]">
            Tuition Categories & Offerings
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Structured, high-quality tuition tailored to student grade levels and exam standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Class 5-8 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="inline-block px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-xs">
                Class 5 – 8
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                All Subjects (সকল বিষয়)
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Comprehensive coaching in General Math, Science, English, Bangla, BGS & ICT.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-500 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Strong foundation in Math & Science</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Regular homework & school exam prep</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 2: Class 9-10 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Atom className="w-6 h-6" />
              </div>
              <span className="inline-block px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-xs">
                Class 9 – 10 (SSC)
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                Science Group Only (শুধুমাত্র বিজ্ঞান)
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Specialized Science coaching for Physics, Chemistry, Higher Math, Biology, General Math & ICT.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-500 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Physics, Chemistry & Higher Math focus</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Creative Question (CQ) & MCQ solving</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 3: Inter ICT */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Laptop className="w-6 h-6" />
              </div>
              <span className="inline-block px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-xs">
                HSC / Inter (11–12)
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                ICT (তথ্য ও যোগাযোগ প্রযুক্তি)
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Complete HSC ICT syllabus: Chapter 1-6 including C Programming, HTML, Database & Logic Gates.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-500 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Hands-on C Programming & HTML</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Board exam questions & test paper solving</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 4: CSE & Programming */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Code className="w-6 h-6" />
              </div>
              <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs">
                University CSE
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                CSE & Software Dev
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Data Structures, C/C++, Java, Full-stack Web Development with Next.js & React.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-500 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>1-on-1 coding mentorship & project building</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Industry internship guidance</span>
                </li>
              </ul>
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
            <h2 className="text-3xl font-extrabold text-[#0b2545]">
              Featured Courses & Materials
            </h2>
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
              <div
                key={n}
                className="bg-white rounded-2xl h-96 border border-slate-200 p-6 animate-pulse space-y-4"
              >
                <div className="bg-slate-200 h-48 rounded-xl w-full"></div>
                <div className="bg-slate-200 h-6 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <p className="text-slate-500 text-sm">
              No courses currently listed.
            </p>
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
              <h2 className="text-3xl font-extrabold text-amber-400">
                About Joy Tarafder
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Joy is a Computer Science student at Independent University, Bangladesh (IUB) 
                with practical software engineering experience from his internship at CloudCoder. 
                Through <strong className="text-white">TutorNova</strong>, Joy offers dedicated tuition 
                for <strong>Class 5–8 (All Subjects)</strong>, <strong>Class 9–10 (Science Only)</strong>, 
                <strong>Inter ICT</strong>, and University CSE courses.
              </p>
            </div>
            <div className="lg:col-span-4 flex justify-center">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center space-y-3">
                <p className="text-lg font-bold text-white">
                  Interested in Private Tuition?
                </p>
                <p className="text-xs text-slate-300">
                  Contact Joy directly for schedule, location, and subject details.
                </p>
                <Link
                  href="/about"
                  className="inline-block mt-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-lg shadow transition-colors"
                >
                  Read Full Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

