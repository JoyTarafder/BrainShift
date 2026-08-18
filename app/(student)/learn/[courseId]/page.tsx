'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  PlayCircle,
  FileText,
  ExternalLink,
  ArrowLeft,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Video,
  MessageSquare,
  Bell,
  Download,
  BookOpen,
  HelpCircle,
  Clock,
  Radio,
  Layers,
  X,
  AlertCircle,
} from 'lucide-react';
import { ICourseModule } from '@/models/Course';
import { fetchApi } from '@/lib/api';

export default function CourseLearnPage() {
  const params = useParams();
  const { data: session } = useSession();
  const courseId = params?.courseId as string;

  const [course, setCourse] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [batch, setBatch] = useState<any>(null);
  const [activeModule, setActiveModule] = useState<ICourseModule | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingProgress, setUpdatingProgress] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'modules' | 'materials' | 'syllabus' | 'support'>('modules');
  const [showNoWhatsappModal, setShowNoWhatsappModal] = useState(false);

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
          setBatch(data.batch || null);
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
      return videoId
        ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&showinfo=0`
        : null;
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

  const handleJoinWhatsappClick = (e: React.MouseEvent) => {
    if (!batch?.whatsappUrl || !batch.whatsappUrl.trim()) {
      e.preventDefault();
      setShowNoWhatsappModal(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto shadow-lg shadow-amber-500/20"></div>
          <p className="text-slate-400 text-sm font-semibold tracking-wide">
            Loading Interactive Student Learning Classroom...
          </p>
        </div>
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 max-w-md w-full border border-slate-800 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Tuition Classroom Locked</h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              You must be an enrolled student in this tuition course to access live classes, video lectures, PDF notes, and batch materials.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <Link
              href="/courses"
              className="w-full py-3 bg-[#0b2545] hover:bg-amber-500 hover:text-slate-950 text-white font-bold rounded-xl transition-all text-xs shadow-lg"
            >
              Browse Tuition Courses & Enroll Now
            </Link>
            <Link
              href="/dashboard"
              className="w-full py-2.5 text-slate-400 hover:text-white font-semibold text-xs transition-colors"
            >
              ← Back to Student Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const embedUrl = activeModule?.url ? getYouTubeEmbedUrl(activeModule.url) : null;
  const modules = course?.modules || [];
  const batchMaterials = batch?.materials || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-amber-500 selection:text-slate-950">
      {/* Top Glassmorphic Navigation Bar */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-slate-900/80 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-800"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Student Dashboard</span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Completion Progress Indicator */}
            <div className="hidden sm:flex items-center gap-3 text-xs bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-bold">Course Progress:</span>
              <div className="w-28 bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="font-mono font-black text-amber-400">{progress}%</span>
            </div>

            {/* Verified Enrolled Badge */}
            <div className="flex items-center gap-2 text-[11px] font-extrabold bg-emerald-950/90 text-emerald-300 px-3.5 py-1.5 rounded-xl border border-emerald-800/80 shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Enrolled Student Verified</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Course Header Info */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              {course.subject} • {course.level}
            </span>
            {batch?.name && (
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-950 bg-amber-400 px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                <Layers className="w-3 h-3" />
                <span>{batch.name}</span>
              </span>
            )}
            {batch?.classSchedule && (
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800 flex items-center gap-1">
                <Clock className="w-3 h-3 text-indigo-400" />
                <span>{batch.classSchedule}</span>
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            {course.title}
          </h1>
        </div>

        {/* WORKSPACE LAYOUT: LEFT SIDEBAR (Tabs & Navigation) + RIGHT CONTENT (Live Banners & Video Player) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR (lg:col-span-4): Module Navigation, PDF Notes, Syllabus, Q&A Support Tabs */}
          <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
            <div className="bg-slate-900/90 rounded-3xl p-5 sm:p-6 border border-slate-800 space-y-5 shadow-2xl">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Course Navigation & Resources</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Select video lessons, download batch PDF notes, check syllabus, or contact teacher.
                </p>
              </div>

              {/* LEFT SIDEBAR NAVIGATION TABS */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800/80">
                <button
                  onClick={() => setActiveTab('modules')}
                  className={`px-3 py-2 rounded-xl text-[11px] font-extrabold transition-all text-left flex items-center gap-1.5 ${
                    activeTab === 'modules'
                      ? 'bg-[#0b2545] text-white border border-amber-500/40 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <PlayCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">Lessons ({modules.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('materials')}
                  className={`px-3 py-2 rounded-xl text-[11px] font-extrabold transition-all text-left flex items-center gap-1.5 ${
                    activeTab === 'materials'
                      ? 'bg-[#0b2545] text-white border border-amber-500/40 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">PDF Notes ({batchMaterials.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('syllabus')}
                  className={`px-3 py-2 rounded-xl text-[11px] font-extrabold transition-all text-left flex items-center gap-1.5 ${
                    activeTab === 'syllabus'
                      ? 'bg-[#0b2545] text-white border border-amber-500/40 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">Syllabus</span>
                </button>

                <button
                  onClick={() => setActiveTab('support')}
                  className={`px-3 py-2 rounded-xl text-[11px] font-extrabold transition-all text-left flex items-center gap-1.5 ${
                    activeTab === 'support'
                      ? 'bg-[#0b2545] text-white border border-amber-500/40 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">Support</span>
                </button>
              </div>

              {/* LEFT TAB CONTENT AREA */}
              <div className="pt-1">
                {/* TAB 1: VIDEO LESSONS MODULES PLAYLIST */}
                {activeTab === 'modules' && (
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Video Lessons Playlist
                    </span>
                    {modules.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">No video lessons added yet.</p>
                    ) : (
                      <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                        {modules.map((mod: ICourseModule, idx: number) => {
                          const isActive = activeModule?.url === mod.url && activeModule?.title === mod.title;
                          return (
                            <button
                              key={idx}
                              onClick={() => setActiveModule(mod)}
                              className={`w-full text-left flex items-center justify-between p-3 rounded-2xl border transition-all ${
                                isActive
                                  ? 'bg-[#0b2545] border-amber-500/80 text-white shadow-lg shadow-amber-500/5'
                                  : 'bg-slate-950 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {mod.type === 'video' ? (
                                  <PlayCircle
                                    className={`w-4 h-4 shrink-0 ${
                                      isActive ? 'text-amber-400 animate-pulse' : 'text-slate-500'
                                    }`}
                                  />
                                ) : (
                                  <FileText className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-indigo-400'}`} />
                                )}
                                <div>
                                  <span className="font-bold block text-xs line-clamp-1">{mod.title}</span>
                                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
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
                )}

                {/* TAB 2: BATCH PDF NOTES & HANDOUTS */}
                {activeTab === 'materials' && (
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Uploaded Batch Handouts ({batchMaterials.length})
                    </span>
                    {batchMaterials.length === 0 ? (
                      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-2">
                        <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                        <p className="text-xs text-slate-400">
                          No custom PDF notes uploaded for this batch yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                        {batchMaterials.map((mat: any, idx: number) => (
                          <a
                            key={idx}
                            href={mat.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3.5 bg-slate-950 hover:bg-slate-800 rounded-2xl border border-slate-800 hover:border-indigo-500 transition-all text-slate-200 group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-bold block text-xs line-clamp-1 group-hover:text-amber-400 transition-colors">
                                  {mat.title}
                                </span>
                                <span className="text-[10px] text-indigo-400 font-mono uppercase">
                                  {mat.type} Handout
                                </span>
                              </div>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition-colors shrink-0" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: SYLLABUS TOPICS OUTLINE */}
                {activeTab === 'syllabus' && (
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Course Topics Checklist
                    </span>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                      {course.syllabus?.map((topic: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2.5 p-3 bg-slate-950 rounded-xl text-xs text-slate-300 border border-slate-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 4: TEACHER Q&A SUPPORT */}
                {activeTab === 'support' && (
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white">Direct Teacher Support</h4>
                      <p className="text-[11px] text-slate-400">
                        Have questions about lecture problems? Ask Joy Tarafder directly!
                      </p>
                    </div>

                    <div className="space-y-2">
                      <a
                        href="https://wa.me/8801714890199"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white text-xs shadow-md transition-colors"
                      >
                        <img src="/images/whatsapp-clean-icon.png" alt="WhatsApp" className="w-4 h-4 object-contain" />
                        <span>WhatsApp: 01714890199</span>
                      </a>

                      <a
                        href="mailto:joytarafder3@gmail.com"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs border border-slate-800 transition-colors"
                      >
                        <span>Email: joytarafder3@gmail.com</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT AREA (lg:col-span-8): Banners & Main Cinema Video Player */}
          <div className="lg:col-span-8 space-y-6 order-1 lg:order-2">
            
            {/* LIVE CLASS ROOM BANNER (Meet / Zoom) */}
            {batch?.meetUrl && (
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-2 border-emerald-500/80 rounded-3xl p-6 shadow-2xl shadow-emerald-950/50 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="flex items-center gap-4 z-10">
                  <div className="w-14 h-14 bg-emerald-500 text-slate-950 rounded-2xl flex items-center justify-center font-black shrink-0 shadow-lg shadow-emerald-500/30">
                    <Radio className="w-7 h-7 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-700">
                        LIVE Class Active Now
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-white">
                      Google Meet / Zoom Live Tuition Classroom
                    </h3>
                    <p className="text-xs text-slate-300">
                      Join live interactive tuition class directly with your teacher & batchmates.
                    </p>
                  </div>
                </div>

                <a
                  href={batch.meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs shadow-xl shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 shrink-0 z-10"
                >
                  <span>🎥 Join Live Class Now</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* OFFICIAL WHATSAPP GROUP BANNER (ALWAYS VISIBLE) */}
            <div className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl transition-colors">
              <div className="flex items-center gap-3.5">
                <img
                  src="/images/whatsapp-clean-icon.png"
                  alt="WhatsApp"
                  className="w-8 h-8 object-contain shrink-0"
                />
                <div>
                  <h4 className="text-xs font-extrabold text-white">Official Batch Student WhatsApp Group</h4>
                  <p className="text-[11px] text-slate-400">
                    Get instant class links, discussion updates, and direct Q&A support from Joy Tarafder.
                  </p>
                </div>
              </div>

              <a
                href={batch?.whatsappUrl?.trim() ? batch.whatsappUrl.trim() : '#'}
                onClick={handleJoinWhatsappClick}
                target={batch?.whatsappUrl?.trim() ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-transform hover:-translate-y-0.5 shrink-0"
              >
                <span>Join WhatsApp Group</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* TEACHER ANNOUNCEMENT NOTICE */}
            {batch?.notice && (
              <div className="bg-amber-950/60 border border-amber-500/50 rounded-2xl p-5 text-amber-200 text-xs space-y-2 shadow-xl">
                <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
                  <Bell className="w-4 h-4 shrink-0" />
                  <span>Teacher Announcement & Class Notice</span>
                </div>
                <p className="leading-relaxed font-medium text-slate-100 whitespace-pre-wrap pl-6 border-l-2 border-amber-500/40">
                  {batch.notice}
                </p>
              </div>
            )}

            {/* CINEMA VIDEO PLAYER */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl shadow-indigo-500/5 aspect-video relative group">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={activeModule?.title || 'Course Video Lecture'}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : activeModule?.url ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4 bg-slate-950">
                  {activeModule.type === 'pdf' ? (
                    <FileText className="w-16 h-16 text-indigo-400 animate-bounce" />
                  ) : (
                    <ExternalLink className="w-16 h-16 text-amber-400" />
                  )}
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white">{activeModule.title}</h3>
                    <p className="text-slate-400 text-xs max-w-md mx-auto">
                      This lecture module is a PDF document or resource link. Click below to view in full screen.
                    </p>
                  </div>
                  <a
                    href={activeModule.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs shadow-lg transition-transform hover:-translate-y-0.5"
                  >
                    <span>Open Resource Material</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <PlayCircle className="w-16 h-16 text-amber-400/80" />
                  <p className="text-slate-400 text-xs">Select a video lesson from the left sidebar to start watching.</p>
                </div>
              )}
            </div>

            {/* ACTIVE LESSON HEADER & COMPLETION BUTTON */}
            {activeModule && (
              <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-4 sm:space-y-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
                <div className="space-y-1">
                  <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider block">
                    Now Playing Lesson
                  </span>
                  <h2 className="text-lg font-bold text-white">{activeModule.title}</h2>
                </div>

                <button
                  onClick={handleMarkProgress}
                  disabled={updatingProgress}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-colors shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>{updatingProgress ? 'Updating...' : 'Mark Lesson Completed'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* WHATSAPP LINK NOT ADDED MODAL */}
      {showNoWhatsappModal && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-800 shadow-2xl space-y-6 text-white text-center relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowNoWhatsappModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20 shadow-inner">
              <img src="/images/whatsapp-clean-icon.png" alt="WhatsApp" className="w-9 h-9 object-contain" />
            </div>

            <div className="space-y-2">
              <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                WhatsApp Group Link Status
              </span>
              <h3 className="text-xl font-extrabold text-white">
                লিংক এখনো দেওয়া হয় নাই
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                এই ব্যাচের জন্য অফিসিয়াল হোয়াটসঅ্যাপ গ্রুপ লিংক এখনো এড করা হয় নাই। অ্যাডমিন প্যানেল থেকে লিংক দেওয়ার পর আপনি জয়েন করতে পারবেন।
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5 text-left">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">সরাসরি টিচারের সাথে যোগাযোগ</span>
              <p className="text-xs text-slate-200 font-medium">
                ক্লাস বা অ্যাডমিশন সংক্রান্ত যেকোনো বিষয় জানতে টিচার Joy Tarafder-কে হোয়াটসঅ্যাপে মেসেজ দিন:
              </p>
            </div>

            <div className="pt-1 flex flex-col gap-2.5">
              <a
                href="https://wa.me/8801714890199"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white text-xs shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <img src="/images/whatsapp-clean-icon.png" alt="WhatsApp" className="w-4 h-4 object-contain" />
                <span>Contact Teacher (01714890199)</span>
              </a>

              <button
                onClick={() => setShowNoWhatsappModal(false)}
                className="w-full py-2.5 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
              >
                বন্ধ করুন (Close)
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
