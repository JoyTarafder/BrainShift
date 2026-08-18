'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  PlayCircle,
  FileText,
  ExternalLink,
  ArrowLeft,
  Lock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { ICourseModule } from '@/models/Course';
import { fetchApi } from '@/lib/api';

export default function CourseLearnPage() {
  const params = useParams();
  const { data: session } = useSession();
  const courseId = params?.courseId as string;

  const [course, setCourse] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [activeModule, setActiveModule] = useState<ICourseModule | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingProgress, setUpdatingProgress] = useState<boolean>(false);

  const token = (session?.user as any)?.apiToken;

  useEffect(() => {
    if (!courseId) return;

    fetchApi(`/student/learn/${courseId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((data) => {
        if (!data || !data.isEnrolled) {
          setIsEnrolled(false);
        } else {
          setCourse(data.course);
          setEnrollment(data.enrollment);
          setProgress(data.enrollment?.progressPercentage || 0);

          if (data.course?.modules && data.course.modules.length > 0) {
            setActiveModule(data.course.modules[0]);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load course content', err);
        setIsEnrolled(false);
      })
      .finally(() => setLoading(false));
  }, [courseId, token]);

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    try {
      let videoId = '';
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      } else if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get('v') || '';
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('youtube.com/embed/')[1]?.split('?')[0];
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
    } catch (e) {
      return null;
    }
  };

  const handleMarkProgress = async () => {
    if (!course?.modules?.length) return;
    setUpdatingProgress(true);

    const newProgress = Math.min(100, Math.round(progress + 100 / course.modules.length));

    try {
      const data = await fetchApi('/student/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId,
          progressPercentage: newProgress,
        }),
      });

      if (data?.success) {
        setProgress(data.progressPercentage);
      }
    } catch (err) {
      console.error('Failed to update progress', err);
    } finally {
      setUpdatingProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm">Loading course learning player...</p>
        </div>
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#0b2545]">Content Locked</h2>
          <p className="text-slate-600 text-sm">
            You must be enrolled in this course to access video lectures, PDF notes, and learning materials.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/courses"
              className="w-full py-3 bg-[#0b2545] hover:bg-amber-500 hover:text-slate-950 text-white font-bold rounded-xl transition-colors text-sm"
            >
              Browse Catalog & Enroll
            </Link>
            <Link
              href="/dashboard"
              className="w-full py-2.5 text-slate-600 hover:text-slate-900 font-semibold text-sm"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const embedUrl = activeModule?.url ? getYouTubeEmbedUrl(activeModule.url) : null;
  const modules = course?.modules || [];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-16">
      {/* Top Navigation Bar */}
      <div className="bg-slate-950 border-b border-slate-800 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300">
              <span>Progress:</span>
              <div className="w-24 bg-slate-800 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="font-bold text-amber-400">{progress}%</span>
            </div>

            <div className="flex items-center gap-2 text-xs bg-emerald-950/80 text-emerald-400 px-3 py-1 rounded-full border border-emerald-800/60">
              <ShieldCheck className="w-4 h-4" />
              <span>Enrolled Student Verified</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Title */}
        <div className="space-y-2">
          <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
            {course.subject} • {course.level}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{course.title}</h1>
        </div>

        {/* Player Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Player Area */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl aspect-video relative">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={activeModule?.title || 'Course Video'}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : activeModule?.url ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4 bg-slate-950">
                  {activeModule.type === 'pdf' ? (
                    <FileText className="w-16 h-16 text-indigo-400" />
                  ) : (
                    <ExternalLink className="w-16 h-16 text-amber-400" />
                  )}
                  <h3 className="text-xl font-bold text-white">{activeModule.title}</h3>
                  <p className="text-slate-400 text-xs max-w-md">
                    This module is a PDF document or learning resource link. Click below to view materials.
                  </p>
                  <a
                    href={activeModule.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm shadow-lg"
                  >
                    <span>Open Learning Resource</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <PlayCircle className="w-16 h-16 text-amber-400" />
                  <p className="text-slate-400 text-sm">Select a lecture module from the sidebar to start watching.</p>
                </div>
              )}
            </div>

            {/* Active Module Header */}
            {activeModule && (
              <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 space-y-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                    Currently Viewing
                  </span>
                  <h2 className="text-xl font-bold text-white">{activeModule.title}</h2>
                </div>

                <button
                  onClick={handleMarkProgress}
                  disabled={updatingProgress}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow transition-colors shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{updatingProgress ? 'Updating...' : 'Mark Completed'}</span>
                </button>
              </div>
            )}

            {/* Syllabus Outline */}
            <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/60 space-y-4">
              <h3 className="text-lg font-bold text-white">Course Curriculum Outline</h3>
              <div className="grid grid-cols-1 gap-2">
                {course.syllabus?.map((topic: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl text-sm border border-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{topic}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Modules */}
          <div className="lg:col-span-4 bg-slate-800/80 rounded-2xl p-6 border border-slate-700 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center justify-between">
              <span>Course Modules</span>
              <span className="text-xs bg-slate-900 text-amber-400 px-2.5 py-1 rounded-full font-mono">
                {modules.length} Lessons
              </span>
            </h3>

            {modules.length === 0 ? (
              <p className="text-xs text-slate-400">No video modules added yet.</p>
            ) : (
              <div className="space-y-3">
                {modules.map((mod: ICourseModule, idx: number) => {
                  const isActive = activeModule?.url === mod.url && activeModule?.title === mod.title;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveModule(mod)}
                      className={`w-full text-left flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-[#0b2545] border-amber-500/80 text-white shadow-lg'
                          : 'bg-slate-900 hover:bg-slate-950 border-slate-700/80 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {mod.type === 'video' ? (
                          <PlayCircle className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                        ) : (
                          <FileText className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-indigo-400'}`} />
                        )}
                        <div>
                          <span className="font-semibold block text-xs sm:text-sm line-clamp-1">
                            {mod.title}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                            {mod.type} • {mod.durationMinutes ? `${mod.durationMinutes} mins` : 'Resource'}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
