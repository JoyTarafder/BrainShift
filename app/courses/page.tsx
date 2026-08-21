'use client';

import { useState, useEffect } from 'react';
import CourseCard from '@/components/CourseCard';
import { ICourse } from '@/models/Course';
import { Search, Filter, BookOpen, RefreshCw } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function CourseCatalogPage() {
  const [courses, setCourses] = useState<Partial<ICourse>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  const subjects = [
    'All',
    'Class 5–8 (All Subjects)',
    'Class 9–10 (Science Group)',
    'HSC / Inter ICT',
    'Computer Science & CSE',
    'Web Development',
    'Programming (C/C++/Java)',
  ];
  const levels = [
    'All',
    'Class 5 – 8',
    'Class 9 – 10 (SSC)',
    'HSC / Inter (11–12)',
    'University / CSE',
    'Beginner',
    'Intermediate',
    'Advanced',
  ];

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedSubject !== 'All') queryParams.append('subject', selectedSubject);
      if (selectedLevel !== 'All') queryParams.append('level', selectedLevel);
      if (search) queryParams.append('search', search);

      const data = await fetchApi(`/courses?${queryParams.toString()}`);
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (err) {
      console.error('Failed to load courses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [selectedSubject, selectedLevel]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#0b2545] to-[#1e3a8a] rounded-3xl p-8 lg:p-12 text-white shadow-xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>TutorNova Catalog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Explore Taught Courses & Tuition Modules
          </h1>
          <p className="text-slate-300 max-w-2xl text-sm sm:text-base">
            Browse our computer science, web engineering, and programming curricula designed by Joy Tarafder. Enroll to unlock live 1-on-1 tutoring sessions and course materials.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search courses, topics, or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2545]/20 focus:border-[#0b2545]"
              />
            </div>

            {/* Subject Dropdown */}
            <div className="md:col-span-3 flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2545]/20 focus:border-[#0b2545]"
              >
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>
                    Subject: {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Dropdown */}
            <div className="md:col-span-3">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2545]/20 focus:border-[#0b2545]"
              >
                {levels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    Level: {lvl}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Action Button */}
            <div className="md:col-span-1">
              <button
                type="submit"
                className="w-full h-full py-2.5 bg-[#0b2545] hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-96 border border-slate-200 p-6 animate-pulse space-y-4">
                <div className="bg-slate-200 h-48 rounded-xl w-full"></div>
                <div className="bg-slate-200 h-6 rounded w-3/4"></div>
                <div className="bg-slate-200 h-4 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-4">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-xl font-bold text-slate-800">No Courses Found</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              No matching courses found for your selected filters. Try clearing your search query or subject filters.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedSubject('All');
                setSelectedLevel('All');
              }}
              className="inline-flex items-center gap-2 text-sm font-semibold bg-[#0b2545] text-white px-4 py-2 rounded-xl hover:bg-amber-500 hover:text-slate-950 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
