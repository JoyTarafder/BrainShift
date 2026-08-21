"use client";

import { fetchApi } from "@/lib/api";
import { ICourseModule } from "@/models/Course";
import {
  ArrowLeft,
  Bell,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Layers,
  Lock,
  MessageSquare,
  PlayCircle,
  Radio,
  X,
  Upload,
  Send,
  Trophy,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
  Video,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  PanelRightClose,
  PanelRightOpen,
  Download,
  Check,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";

const PlyrVideoPlayer = dynamic(() => import("@/components/PlyrVideoPlayer"), {
  ssr: false,
});

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
  const [activeTab, setActiveTab] = useState<
    "lessons" | "materials" | "assignments" | "exams" | "support"
  >("lessons");
  const [showNoWhatsappModal, setShowNoWhatsappModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [moduleSearch, setModuleSearch] = useState("");

  // Student Assignment States
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submittingAssignId, setSubmittingAssignId] = useState<string | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState<string>("");
  const [submissionNotes, setSubmissionNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Student Exam States
  const [exams, setExams] = useState<any[]>([]);
  const [activeExamModal, setActiveExamModal] = useState<any | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<number[]>([]);
  const [submittingExam, setSubmittingExam] = useState<boolean>(false);
  const [examScoreResult, setExamScoreResult] = useState<any | null>(null);

  // Written Exam Script Submission States
  const [submittingWrittenExamId, setSubmittingWrittenExamId] = useState<string | null>(null);
  const [examSubmissionUrl, setExamSubmissionUrl] = useState<string>("");
  const [examSubmissionNotes, setExamSubmissionNotes] = useState<string>("");
  const [submittingWrittenExam, setSubmittingWrittenExam] = useState<boolean>(false);

  // Completed modules tracking for single-click disabling per lesson
  const [completedModules, setCompletedModules] = useState<string[]>([]);

  const token = (session?.user as any)?.apiToken;

  useEffect(() => {
    if (typeof window !== "undefined" && courseId) {
      try {
        const saved = localStorage.getItem(`completed_modules_${courseId}`);
        if (saved) {
          setCompletedModules(JSON.parse(saved));
        }
      } catch {}
    }
  }, [courseId]);

  const isCurrentLessonCompleted = useMemo(() => {
    if (!activeModule) return false;
    const key = activeModule.url || activeModule.title;
    return completedModules.includes(key);
  }, [activeModule, completedModules]);

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

          if (data.batch?._id) {
            fetch(`/api/student/assignments?batchId=${data.batch._id}`)
              .then((res) => res.json())
              .then((aData) => {
                if (aData.assignments) setAssignments(aData.assignments);
              })
              .catch(() => {});

            fetch(`/api/student/exams?batchId=${data.batch._id}`)
              .then((res) => res.json())
              .then((eData) => {
                if (eData.exams) setExams(eData.exams);
              })
              .catch(() => {});
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load course content", err);
        setIsEnrolled(false);
      })
      .finally(() => setLoading(false));
  }, [courseId, token]);

  const handleSubmitOnlineExam = async (examId: string) => {
    setSubmittingExam(true);
    try {
      const res = await fetch("/api/student/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId,
          studentId: (session?.user as any)?.id || session?.user?.email || "anonymous_student",
          studentName: session?.user?.name || "Student",
          studentEmail: session?.user?.email || "student@tuitionbd.com",
          answers: studentAnswers,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setExamScoreResult(data);
        if (batch?._id) {
          fetch(`/api/student/exams?batchId=${batch._id}`)
            .then((res) => res.json())
            .then((eData) => {
              if (eData.exams) setExams(eData.exams);
            });
        }
      }
    } catch (err) {
      console.error("Error submitting exam:", err);
    } finally {
      setSubmittingExam(false);
    }
  };

  const handleSubmitWrittenExam = async (e: React.FormEvent, examId: string) => {
    e.preventDefault();
    if (!examSubmissionUrl) return;
    setSubmittingWrittenExam(true);
    try {
      const res = await fetch("/api/student/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId,
          studentId: (session?.user as any)?.id || session?.user?.email || "anonymous_student",
          studentName: session?.user?.name || "Student",
          studentEmail: session?.user?.email || "student@tuitionbd.com",
          submissionUrl: examSubmissionUrl,
          notes: examSubmissionNotes,
        }),
      });

      if (res.ok) {
        setSubmittingWrittenExamId(null);
        setExamSubmissionUrl("");
        setExamSubmissionNotes("");
        if (batch?._id) {
          fetch(`/api/student/exams?batchId=${batch._id}`)
            .then((res) => res.json())
            .then((eData) => {
              if (eData.exams) setExams(eData.exams);
            });
        }
      }
    } catch (err) {
      console.error("Error submitting written exam:", err);
    } finally {
      setSubmittingWrittenExam(false);
    }
  };

  const handleSubmitAssignment = async (e: React.FormEvent, assignmentId: string) => {
    e.preventDefault();
    if (!submissionUrl) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/student/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId,
          studentId: (session?.user as any)?.id || session?.user?.email || "anonymous_student",
          studentName: session?.user?.name || "Student",
          studentEmail: session?.user?.email || "student@tuitionbd.com",
          submissionUrl,
          notes: submissionNotes,
        }),
      });
      if (res.ok) {
        setSubmissionUrl("");
        setSubmissionNotes("");
        setSubmittingAssignId(null);
        if (batch?._id) {
          const res2 = await fetch(`/api/student/assignments?batchId=${batch._id}`);
          const data2 = await res2.json();
          if (data2.assignments) setAssignments(data2.assignments);
        }
      }
    } catch (err) {
      console.error("Error submitting assignment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    try {
      let videoId = "";
      if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1]?.split("?")[0];
      } else if (url.includes("youtube.com/watch")) {
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get("v") || "";
      } else if (url.includes("youtube.com/embed/")) {
        videoId = url.split("youtube.com/embed/")[1]?.split("?")[0];
      }
      return videoId
        ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&showinfo=0`
        : null;
    } catch (e) {
      return null;
    }
  };

  const handleMarkProgress = async () => {
    if (!course?.modules?.length || !activeModule) return;
    const key = activeModule.url || activeModule.title;
    if (completedModules.includes(key)) return;

    setUpdatingProgress(true);
    const newCompleted = [...completedModules, key];
    setCompletedModules(newCompleted);

    try {
      localStorage.setItem(`completed_modules_${courseId}`, JSON.stringify(newCompleted));
    } catch {}

    const newProgress = Math.min(
      100,
      Math.round((newCompleted.length / course.modules.length) * 100)
    );

    try {
      const data = await fetchApi("/student/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      console.error("Failed to update progress", err);
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

  const modules: ICourseModule[] = course?.modules || [];
  const batchMaterials = batch?.materials || [];

  const filteredModules = useMemo(() => {
    if (!moduleSearch.trim()) return modules;
    return modules.filter((m) =>
      m.title.toLowerCase().includes(moduleSearch.toLowerCase())
    );
  }, [modules, moduleSearch]);

  const activeModuleIndex = useMemo(() => {
    if (!activeModule || !modules.length) return -1;
    return modules.findIndex(
      (m) => m.url === activeModule.url && m.title === activeModule.title
    );
  }, [activeModule, modules]);

  const handlePrevModule = () => {
    if (activeModuleIndex > 0) {
      setActiveModule(modules[activeModuleIndex - 1]);
    }
  };

  const handleNextModule = () => {
    if (activeModuleIndex >= 0 && activeModuleIndex < modules.length - 1) {
      setActiveModule(modules[activeModuleIndex + 1]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="text-center space-y-5">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 animate-ping"></div>
            <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin shadow-xl shadow-amber-500/30"></div>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white tracking-wide">
              Entering TuitionBD Classroom...
            </h3>
            <p className="text-slate-400 text-xs font-medium">
              Loading high-definition video lessons, assignments, & materials
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white">
        <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 max-w-md w-full border border-slate-800/80 shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="w-20 h-20 bg-gradient-to-br from-rose-500/20 to-rose-600/10 text-rose-400 rounded-3xl flex items-center justify-center mx-auto border border-rose-500/30 shadow-lg shadow-rose-500/10">
            <Lock className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
              Access Restricted
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Classroom Locked
            </h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              You must be an enrolled student in this tuition course to access
              live classes, HD video lectures, PDF notes, and batch materials.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <Link
              href="/courses"
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-2xl transition-all text-xs shadow-lg shadow-amber-500/20 transform hover:-translate-y-0.5"
            >
              Browse Tuition Courses & Enroll Now
            </Link>
            <Link
              href="/dashboard"
              className="w-full py-2.5 text-slate-400 hover:text-white font-bold text-xs transition-colors"
            >
              ← Back to Student Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const embedUrl = activeModule?.url
    ? getYouTubeEmbedUrl(activeModule.url)
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950 flex flex-col font-sans">
      {/* TOP GLASS NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-2xl border-b border-slate-800/80 px-4 sm:px-6 py-3 transition-all">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4">
          {/* Left: Back Button & Course Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors bg-slate-900/90 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-800 shrink-0 shadow-sm"
              title="Return to Student Dashboard"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            <div className="min-w-0 border-l border-slate-800/80 pl-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                  {course?.subject} • {course?.level}
                </span>
                {batch?.name && (
                  <span className="text-[10px] font-bold text-slate-300 bg-slate-900 px-2.5 py-0.5 rounded-md border border-slate-800 flex items-center gap-1 hidden md:flex">
                    <Layers className="w-3 h-3 text-indigo-400" />
                    <span>{batch.name}</span>
                  </span>
                )}
              </div>
              <h1 className="text-sm sm:text-base font-extrabold text-white truncate max-w-[280px] sm:max-w-md lg:max-w-lg mt-0.5">
                {course?.title}
              </h1>
            </div>
          </div>

          {/* Right: Actions, Live Pill, Progress & Playlist Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Live Class Indicator */}
            {batch?.meetUrl && (
              <a
                href={batch.meetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-2 text-xs font-black bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-3.5 py-1.5 rounded-xl border border-emerald-400/40 shadow-lg shadow-emerald-500/20 transition-transform transform hover:-translate-y-0.5"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span>Join Live Class</span>
              </a>
            )}

            {/* Overall Course Progress Bar (Expanded & Prominent) */}
            <div className="flex items-center gap-3 bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800 shadow-md">
              <div className="flex flex-col text-right shrink-0">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Progress</span>
                <span className="text-xs font-mono font-black text-amber-400">{progress}%</span>
              </div>
              <div className="w-32 sm:w-44 md:w-56 bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800/80 p-0.5">
                <div
                  className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Toggle Playlist Sidebar Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-xl border transition-all ${
                isSidebarOpen
                  ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                  : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
              }`}
              title={isSidebarOpen ? "Collapse Playlist Sidebar" : "Expand Playlist Sidebar"}
            >
              {isSidebarOpen ? (
                <PanelRightClose className="w-5 h-5" />
              ) : (
                <PanelRightOpen className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN WORKSPACE CANVAS */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* TOP NAVIGATION TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800/80">
          <button
            onClick={() => setActiveTab("lessons")}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "lessons"
                ? "bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-md shadow-amber-500/20"
                : "bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-white border border-slate-800/80"
            }`}
          >
            <PlayCircle className="w-4 h-4" />
            <span>Lessons ({modules.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("materials")}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "materials"
                ? "bg-gradient-to-r from-indigo-500 to-indigo-400 text-white shadow-md shadow-indigo-500/20"
                : "bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-white border border-slate-800/80"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>PDF Notes ({batchMaterials.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("assignments")}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "assignments"
                ? "bg-gradient-to-r from-purple-500 to-purple-400 text-white shadow-md shadow-purple-500/20"
                : "bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-white border border-slate-800/80"
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Assignments ({assignments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("exams")}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "exams"
                ? "bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20"
                : "bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-white border border-slate-800/80"
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Exams & Quizzes ({exams.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("support")}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "support"
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/20"
                : "bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-white border border-slate-800/80"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Live & Support</span>
          </button>
        </div>

        {/* TWO-COLUMN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* MAIN STAGE (LEFT / CENTER) */}
          <div
            className={`space-y-6 transition-all duration-300 ${
              isSidebarOpen ? "lg:col-span-8 xl:col-span-9" : "lg:col-span-12"
            }`}
          >
            {/* TAB 1: LESSONS & VIDEO PLAYER */}
            {activeTab === "lessons" && (
              <div className="space-y-6">
                {/* LIVE CLASS ACTIVE PROMOTIONAL BANNER */}
                {batch?.meetUrl && (
                  <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border border-emerald-500/60 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-emerald-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
                    <div className="flex items-center gap-4 z-10">
                      <div className="w-12 h-12 bg-emerald-500 text-slate-950 rounded-2xl flex items-center justify-center font-black shrink-0 shadow-lg shadow-emerald-500/30">
                        <Radio className="w-6 h-6 animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-700">
                            LIVE CLASS ACTIVE
                          </span>
                        </div>
                        <h3 className="text-base font-black text-white">
                          Google Meet / Zoom Tuition Class is Live Now!
                        </h3>
                        <p className="text-xs text-slate-300">
                          Click to join the live interactive tuition session with teacher & batchmates.
                        </p>
                      </div>
                    </div>

                    <a
                      href={batch.meetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs shadow-xl shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 shrink-0 z-10"
                    >
                      <span>🎥 Join Live Class</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {/* CINEMA VIDEO PLAYER FRAME */}
                <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl aspect-video relative group">
                  {activeModule?.url && (activeModule.type === "video" || embedUrl) ? (
                    <PlyrVideoPlayer
                      key={activeModule.url}
                      url={activeModule.url}
                      title={activeModule.title}
                      userEmail={session?.user?.email || "student@tutornova.com"}
                    />
                  ) : activeModule?.url ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4 bg-slate-950">
                      {activeModule.type === "pdf" ? (
                        <FileText className="w-16 h-16 text-indigo-400 animate-bounce" />
                      ) : (
                        <ExternalLink className="w-16 h-16 text-amber-400" />
                      )}
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-white">
                          {activeModule.title}
                        </h3>
                        <p className="text-slate-400 text-xs max-w-md mx-auto">
                          This module contains a PDF document or external reference material.
                        </p>
                      </div>
                      <a
                        href={activeModule.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs shadow-lg transition-transform hover:-translate-y-0.5"
                      >
                        <span>Open Document / Resource</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-3 bg-slate-950">
                      <PlayCircle className="w-16 h-16 text-slate-600" />
                      <p className="text-slate-400 text-xs font-semibold">
                        Select a lesson from the course playlist to start watching.
                      </p>
                    </div>
                  )}
                </div>

                {/* ACTIVE LESSON CONTROL BAR */}
                {activeModule && (
                  <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800/80 space-y-4 sm:space-y-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider block">
                          Lesson {activeModuleIndex >= 0 ? activeModuleIndex + 1 : 1} of {modules.length}
                        </span>
                        {activeModule.durationMinutes && (
                          <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            {activeModule.durationMinutes} mins
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-black text-white truncate">
                        {activeModule.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Prev / Next buttons */}
                      <button
                        onClick={handlePrevModule}
                        disabled={activeModuleIndex <= 0}
                        className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 disabled:opacity-40 disabled:hover:bg-slate-950 transition-colors"
                        title="Previous Lesson"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <button
                        onClick={handleNextModule}
                        disabled={activeModuleIndex >= modules.length - 1}
                        className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 disabled:opacity-40 disabled:hover:bg-slate-950 transition-colors"
                        title="Next Lesson"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      {/* Mark Completed Button */}
                      <button
                        onClick={handleMarkProgress}
                        disabled={updatingProgress || isCurrentLessonCompleted}
                        className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-md transition-all shrink-0 ${
                          isCurrentLessonCompleted
                            ? "bg-slate-800/90 text-emerald-400 border border-emerald-500/40 cursor-not-allowed opacity-90 shadow-none"
                            : "bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50"
                        }`}
                      >
                        <CheckCircle2
                          className={`w-4 h-4 ${
                            isCurrentLessonCompleted
                              ? "text-emerald-400"
                              : "text-emerald-300"
                          }`}
                        />
                        <span>
                          {updatingProgress
                            ? "Updating..."
                            : isCurrentLessonCompleted
                            ? "Completed ✓"
                            : "Mark Complete"}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* TEACHER ANNOUNCEMENT NOTICE */}
                {batch?.notice && (
                  <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-5 text-amber-200 text-xs space-y-2 shadow-xl">
                    <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
                      <Bell className="w-4 h-4 shrink-0" />
                      <span>Teacher Announcement & Class Notice</span>
                    </div>
                    <p className="leading-relaxed font-medium text-slate-100 whitespace-pre-wrap pl-6 border-l-2 border-amber-500/40">
                      {batch.notice}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PDF HANDOUTS & MATERIALS */}
            {activeTab === "materials" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-white">
                      Batch Handouts & PDF Notes
                    </h2>
                    <p className="text-xs text-slate-400">
                      Download lecture slides, practice worksheets, and reference notes uploaded by Joy Tarafder.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/60 px-3 py-1 rounded-xl border border-indigo-800">
                    {batchMaterials.length} Handouts
                  </span>
                </div>

                {batchMaterials.length === 0 ? (
                  <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-12 text-center space-y-3">
                    <FileText className="w-12 h-12 text-slate-600 mx-auto" />
                    <h3 className="text-sm font-bold text-slate-300">
                      No Batch Materials Uploaded Yet
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Class handouts and PDF notes will appear here as soon as they are uploaded for your batch.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {batchMaterials.map((mat: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 space-y-4 transition-all group shadow-lg"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-indigo-400 font-mono uppercase font-bold tracking-wider block">
                                {mat.type || "PDF"} Document
                              </span>
                              <h4 className="font-bold text-sm text-white line-clamp-1 group-hover:text-indigo-300 transition-colors">
                                {mat.title}
                              </h4>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end">
                          <a
                            href={mat.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-white bg-indigo-950/80 hover:bg-indigo-600 px-4 py-2 rounded-xl transition-all border border-indigo-800/80"
                          >
                            <span>Open & Download</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ASSIGNMENTS & HOMEWORK */}
            {activeTab === "assignments" && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-black text-white">
                    Homework & Lab Assignments
                  </h2>
                  <p className="text-xs text-slate-400">
                    Submit your assignment solution links (Google Drive / PDF / GitHub) for teacher review and grading.
                  </p>
                </div>

                {assignments.length === 0 ? (
                  <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-12 text-center space-y-3">
                    <Upload className="w-12 h-12 text-slate-600 mx-auto" />
                    <h3 className="text-sm font-bold text-slate-300">
                      No Active Assignments Published
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Assignments and homework tasks for your batch will be published here by your teacher.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignments.map((assign: any) => {
                      const studentIdStr =
                        (session?.user as any)?.id || session?.user?.email;
                      const mySub = assign.submissions?.find(
                        (s: any) =>
                          s.studentId?.toString() === studentIdStr?.toString() ||
                          s.studentEmail === session?.user?.email
                      );
                      const isSubmittingThis = submittingAssignId === assign._id;

                      const dueDateObj = new Date(assign.dueDate);
                      dueDateObj.setHours(23, 59, 59, 999);
                      const isPastDueDate = new Date() > dueDateObj;
                      const isGraded = mySub?.status === "graded";
                      const canResubmit = !isGraded && !isPastDueDate;

                      return (
                        <div
                          key={assign._id}
                          className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-extrabold text-white text-base">
                                  {assign.title}
                                </h3>
                              </div>
                              <span className="text-xs text-amber-400 font-bold block">
                                Due Date: {new Date(assign.dueDate).toLocaleDateString()}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-black uppercase px-3 py-1 rounded-xl bg-purple-950 text-purple-300 border border-purple-800">
                                Total Marks: {assign.totalMarks}
                              </span>
                              {isPastDueDate && (
                                <span className="text-[10px] font-black uppercase tracking-wider bg-rose-950 text-rose-300 px-3 py-1 rounded-xl border border-rose-800">
                                  Deadline Passed
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {assign.description}
                          </p>

                          {/* Student Submission Card */}
                          <div className="pt-2">
                            {mySub ? (
                              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Solution Submitted Successfully</span>
                                  </div>
                                  {isGraded ? (
                                    <span className="text-xs font-black uppercase px-3 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700">
                                      Score: {mySub.marksObtained} / {assign.totalMarks}
                                    </span>
                                  ) : (
                                    <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-800">
                                      Under Review
                                    </span>
                                  )}
                                </div>

                                <div className="text-xs space-y-1.5 pt-1">
                                  <span className="text-slate-400 block text-[11px]">Submitted URL:</span>
                                  <a
                                    href={mySub.submissionUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-400 hover:underline inline-flex items-center gap-1 font-mono break-all text-xs font-bold"
                                  >
                                    <span>{mySub.submissionUrl}</span>
                                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                                  </a>
                                  {mySub.feedback && (
                                    <div className="mt-2 bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
                                      <strong className="text-amber-400 block">Teacher Evaluation Feedback:</strong>
                                      <p className="text-slate-200 mt-1 italic">&quot;{mySub.feedback}&quot;</p>
                                    </div>
                                  )}
                                </div>

                                {canResubmit && !isSubmittingThis && (
                                  <button
                                    onClick={() => {
                                      setSubmittingAssignId(assign._id);
                                      setSubmissionUrl(mySub.submissionUrl);
                                      setSubmissionNotes(mySub.notes || "");
                                    }}
                                    className="text-xs text-amber-400 font-bold hover:underline block pt-2"
                                  >
                                    ✏️ Edit / Resubmit Homework Solution
                                  </button>
                                )}
                              </div>
                            ) : null}

                            {!mySub && isPastDueDate && (
                              <div className="bg-rose-950/40 border border-rose-800/50 p-4 rounded-xl text-center space-y-1">
                                <p className="text-rose-300 font-extrabold text-xs">
                                  Submission Deadline Closed
                                </p>
                                <p className="text-slate-400 text-xs">
                                  The due date ({new Date(assign.dueDate).toLocaleDateString()}) has passed. Submissions are no longer accepted for this assignment.
                                </p>
                              </div>
                            )}

                            {((!mySub && !isPastDueDate) || (mySub && canResubmit && isSubmittingThis)) && (
                              <form
                                onSubmit={(e) => handleSubmitAssignment(e, assign._id)}
                                className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4"
                              >
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider text-amber-400">
                                  {mySub ? "Update Solution Submission" : "Submit Assignment Solution"}
                                </h4>

                                <div className="space-y-1.5">
                                  <label className="block text-xs font-bold text-slate-300">
                                    Solution URL Link (Google Drive / PDF / GitHub) *
                                  </label>
                                  <input
                                    type="url"
                                    required
                                    value={submissionUrl}
                                    onChange={(e) => setSubmissionUrl(e.target.value)}
                                    placeholder="https://drive.google.com/file/d/..."
                                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <label className="block text-xs font-bold text-slate-300">
                                    Notes / Remarks for Teacher (Optional)
                                  </label>
                                  <input
                                    type="text"
                                    value={submissionNotes}
                                    onChange={(e) => setSubmissionNotes(e.target.value)}
                                    placeholder="e.g. Attached complete solution PDF with diagrams..."
                                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                                  />
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-2">
                                  {isSubmittingThis && mySub && (
                                    <button
                                      type="button"
                                      onClick={() => setSubmittingAssignId(null)}
                                      className="px-4 py-2 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white"
                                    >
                                      Cancel
                                    </button>
                                  )}
                                  <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                                  >
                                    <Send className="w-4 h-4" />
                                    <span>
                                      {submitting
                                        ? "Submitting..."
                                        : mySub
                                        ? "Update Submission"
                                        : "Submit Solution Now"}
                                    </span>
                                  </button>
                                </div>
                              </form>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: EXAMS & MODEL TESTS */}
            {activeTab === "exams" && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-black text-white">
                    Exams & Model Tests
                  </h2>
                  <p className="text-xs text-slate-400">
                    Participate in Online MCQ Quizzes with instant scoring or submit Written Model Test answer scripts.
                  </p>
                </div>

                {exams.length === 0 ? (
                  <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-12 text-center space-y-3">
                    <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
                    <h3 className="text-sm font-bold text-slate-300">
                      No Exams Published Yet
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Model tests, online quizzes, and practice exams will appear here once scheduled for your batch.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {exams.map((exam: any) => {
                      const studentIdStr =
                        (session?.user as any)?.id || session?.user?.email;
                      const myResult = exam.results?.find(
                        (r: any) =>
                          r.studentId?.toString() === studentIdStr?.toString() ||
                          r.studentEmail === session?.user?.email
                      );

                      return (
                        <div
                          key={exam._id}
                          className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-xl"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md border ${
                                  exam.type === "online_mcq"
                                    ? "bg-purple-950 text-purple-300 border-purple-800"
                                    : "bg-indigo-950 text-indigo-300 border-indigo-800"
                                }`}
                              >
                                {exam.type === "online_mcq"
                                  ? "Online MCQ Test"
                                  : "Written Exam"}
                              </span>
                              <span className="text-xs font-mono font-bold text-amber-400">
                                {exam.totalMarks} Marks
                              </span>
                            </div>

                            <h3 className="font-extrabold text-white text-base">
                              {exam.title}
                            </h3>

                            {exam.description && (
                              <p className="text-xs text-slate-400 line-clamp-2">
                                {exam.description}
                              </p>
                            )}

                            <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 font-mono">
                              <span>⏱️ {exam.durationMinutes} Mins</span>
                              <span>🎯 Pass: {exam.passMarks}</span>
                            </div>
                          </div>

                          {/* Attempt Status & Actions */}
                          <div className="pt-3 border-t border-slate-800 space-y-2">
                            {myResult && (myResult.submissionUrl || exam.type === "online_mcq") ? (
                              <div>
                                {exam.type === "written_exam" && myResult.submissionUrl && (
                                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                                    <div className="flex items-center justify-between">
                                      <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Script Submitted
                                      </span>
                                      {myResult.score > 0 || myResult.passed ? (
                                        <span className="text-[10px] font-black bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                                          Score: {myResult.score} / {exam.totalMarks}
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-bold bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
                                          Under Review
                                        </span>
                                      )}
                                    </div>
                                    <a
                                      href={myResult.submissionUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-indigo-400 hover:underline block truncate font-mono text-[11px]"
                                    >
                                      {myResult.submissionUrl}
                                    </a>
                                  </div>
                                )}

                                {exam.type === "online_mcq" && (
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      {myResult.passed ? (
                                        <span className="text-[10px] font-black bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-700">
                                          PASSED
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-black bg-rose-950 text-rose-300 px-2.5 py-0.5 rounded-full border border-rose-800">
                                          FAILED
                                        </span>
                                      )}
                                      <span className="text-xs font-black text-amber-400">
                                        Score: {myResult.score}/{exam.totalMarks}
                                      </span>
                                    </div>

                                    <button
                                      onClick={() => {
                                        setActiveExamModal(exam);
                                        setExamScoreResult(myResult);
                                      }}
                                      className="text-xs text-indigo-400 hover:underline font-bold"
                                    >
                                      Review Answers
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div>
                                {exam.type === "online_mcq" ? (
                                  <button
                                    onClick={() => {
                                      setActiveExamModal(exam);
                                      setStudentAnswers(
                                        new Array(exam.questions?.length || 0).fill(-1)
                                      );
                                      setExamScoreResult(null);
                                    }}
                                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                  >
                                    <PlayCircle className="w-4 h-4" />
                                    <span>Start Online MCQ Exam</span>
                                  </button>
                                ) : (
                                  <form
                                    onSubmit={(e) => handleSubmitWrittenExam(e, exam._id)}
                                    className="space-y-2"
                                  >
                                    <input
                                      type="url"
                                      required
                                      value={submittingWrittenExamId === exam._id ? examSubmissionUrl : ""}
                                      onChange={(e) => {
                                        setSubmittingWrittenExamId(exam._id);
                                        setExamSubmissionUrl(e.target.value);
                                      }}
                                      placeholder="Written script Drive link..."
                                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                                    />
                                    <button
                                      type="submit"
                                      disabled={submittingWrittenExam}
                                      className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all disabled:opacity-50"
                                    >
                                      {submittingWrittenExam ? "Submitting..." : "Submit Answer Script"}
                                    </button>
                                  </form>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: LIVE CLASS & SUPPORT */}
            {activeTab === "support" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-white">
                    Live Classroom & Teacher Support
                  </h2>
                  <p className="text-xs text-slate-400">
                    Connect directly with Joy Tarafder and join batch live class links.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Google Meet Live Card */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                      <Video className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-extrabold text-white">
                        Google Meet Live Classroom
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Access the live class link scheduled for your tuition batch.
                      </p>
                    </div>
                    {batch?.meetUrl ? (
                      <a
                        href={batch.meetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      >
                        <span>🎥 Enter Google Meet Class</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <div className="bg-slate-950 p-3 rounded-xl text-center border border-slate-800 text-xs text-slate-400">
                        No live link active right now.
                      </div>
                    )}
                  </div>

                  {/* Official WhatsApp Group Card */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                      <img
                        src="/images/whatsapp-clean-icon.png"
                        alt="WhatsApp"
                        className="w-6 h-6 object-contain"
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-extrabold text-white">
                        Official Batch WhatsApp Group
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Stay updated with instant notices and student Q&A discussions.
                      </p>
                    </div>
                    <a
                      href={batch?.whatsappUrl?.trim() ? batch.whatsappUrl.trim() : "#"}
                      onClick={handleJoinWhatsappClick}
                      target={batch?.whatsappUrl?.trim() ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <img
                        src="/images/whatsapp-clean-icon.png"
                        alt="WhatsApp"
                        className="w-4 h-4 object-contain"
                      />
                      <span>Join WhatsApp Group</span>
                    </a>
                  </div>
                </div>

                {/* Direct Contact Card */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider text-amber-400">
                    Direct Contact with Teacher Joy Tarafder
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                      href="https://wa.me/8801714890199"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500 rounded-2xl flex items-center gap-3 transition-colors group"
                    >
                      <img
                        src="/images/whatsapp-clean-icon.png"
                        alt="WhatsApp"
                        className="w-6 h-6 object-contain"
                      />
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">WhatsApp Contact</span>
                        <span className="text-xs font-bold text-white group-hover:text-emerald-400">01714890199</span>
                      </div>
                    </a>

                    <a
                      href="mailto:joytarafder3@gmail.com"
                      className="p-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500 rounded-2xl flex items-center gap-3 transition-colors group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                        @
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Email Support</span>
                        <span className="text-xs font-bold text-white group-hover:text-indigo-400">joytarafder3@gmail.com</span>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PLAYLIST SIDEBAR */}
          {isSidebarOpen && (
            <div className="lg:col-span-4 xl:col-span-3 space-y-4">
              <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 space-y-4 shadow-2xl sticky top-20">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-amber-400" />
                      <span>Course Playlist</span>
                    </h3>
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-800/80">
                      {modules.length} Lessons
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Click any module to load video lesson instantly.
                  </p>
                </div>

                {/* SEARCH FILTER INPUT */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={moduleSearch}
                    onChange={(e) => setModuleSearch(e.target.value)}
                    placeholder="Search video lessons..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  {moduleSearch && (
                    <button
                      onClick={() => setModuleSearch("")}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* MODULES LIST */}
                <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                  {filteredModules.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">
                      No video lessons match search.
                    </p>
                  ) : (
                    filteredModules.map((mod: ICourseModule, idx: number) => {
                      const isActive =
                        activeModule?.url === mod.url &&
                        activeModule?.title === mod.title;
                      const isModCompleted = completedModules.includes(mod.url || mod.title);

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setActiveModule(mod);
                            if (activeTab !== "lessons") setActiveTab("lessons");
                          }}
                          className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 group ${
                            isActive
                              ? "bg-gradient-to-r from-[#0b2545] to-slate-900 border-amber-500/80 text-white shadow-lg shadow-amber-500/5"
                              : isModCompleted
                              ? "bg-slate-950/80 hover:bg-slate-900 border-emerald-900/50 text-slate-300"
                              : "bg-slate-950 hover:bg-slate-800/80 border-slate-800/80 text-slate-300"
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                              isActive
                                ? "bg-amber-500 text-slate-950"
                                : isModCompleted
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                : "bg-slate-900 text-slate-400 border border-slate-800 group-hover:border-slate-700"
                            }`}
                          >
                            {isModCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : idx + 1}
                          </div>

                          <div className="min-w-0 flex-1 space-y-0.5">
                            <span className="font-bold block text-xs line-clamp-2 leading-snug group-hover:text-white flex items-center gap-1.5">
                              <span>{mod.title}</span>
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                              <span className="uppercase">{mod.type}</span>
                              {mod.durationMinutes && (
                                <>
                                  <span>•</span>
                                  <span>{mod.durationMinutes}m</span>
                                </>
                              )}
                              {isModCompleted && (
                                <>
                                  <span>•</span>
                                  <span className="text-emerald-400 font-bold">Done ✓</span>
                                </>
                              )}
                            </div>
                          </div>

                          {isActive && (
                            <span className="relative flex h-2 w-2 mt-1.5 shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ONLINE MCQ TEST PLAYER MODAL */}
      {activeExamModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="p-5 bg-slate-950 flex items-center justify-between border-b border-slate-800">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded border border-amber-800">
                  Online MCQ Model Test
                </span>
                <h3 className="text-base sm:text-lg font-black text-white mt-1">
                  {activeExamModal.title}
                </h3>
                <p className="text-xs text-slate-400">
                  Time: {activeExamModal.durationMinutes} Mins | Total: {activeExamModal.totalMarks} Marks | Pass: {activeExamModal.passMarks} Marks
                </p>
              </div>

              <button
                onClick={() => {
                  setActiveExamModal(null);
                  setExamScoreResult(null);
                }}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {examScoreResult ? (
                /* SCORE RESULT BREAKDOWN */
                <div className="space-y-6">
                  <div
                    className={`p-6 rounded-2xl border text-center space-y-2 ${
                      examScoreResult.passed
                        ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-200"
                        : "bg-rose-950/50 border-rose-500/50 text-rose-200"
                    }`}
                  >
                    <Trophy className="w-12 h-12 mx-auto animate-bounce" />
                    <h4 className="text-2xl font-black">
                      {examScoreResult.passed
                        ? "CONGRATULATIONS! YOU PASSED!"
                        : "MODEL TEST COMPLETED"}
                    </h4>
                    <div className="text-3xl font-black">
                      Score: {examScoreResult.score} / {examScoreResult.totalMarks}
                    </div>
                    <p className="text-xs opacity-90">
                      {examScoreResult.passed
                        ? "Excellent performance! You scored above the passing threshold."
                        : "Keep practicing and review the explanations below for questions you missed."}
                    </p>
                  </div>

                  {/* Question Review & Answers */}
                  <div className="space-y-4 pt-2">
                    <h5 className="font-extrabold text-xs uppercase text-slate-300 tracking-wider">
                      Question Answer Key & Review ({activeExamModal.questions?.length || 0})
                    </h5>

                    {activeExamModal.questions?.map((q: any, qIdx: number) => {
                      const studentChoice = examScoreResult.answers?.[qIdx];
                      const isCorrect = studentChoice === q.correctOption;

                      return (
                        <div
                          key={qIdx}
                          className={`p-4 rounded-2xl border space-y-3 ${
                            isCorrect
                              ? "bg-slate-950 border-emerald-500/40"
                              : "bg-slate-950 border-rose-500/40"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-xs text-white">
                              Q{qIdx + 1}. {q.question}
                            </span>
                            {isCorrect ? (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                                Correct
                              </span>
                            ) : (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
                                Incorrect
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {q.options?.map((opt: string, optIdx: number) => {
                              const isSelected = studentChoice === optIdx;
                              const isRightAnswer = q.correctOption === optIdx;

                              return (
                                <div
                                  key={optIdx}
                                  className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                                    isRightAnswer
                                      ? "bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold"
                                      : isSelected
                                      ? "bg-rose-950/80 border-rose-500 text-rose-200 line-through"
                                      : "bg-slate-900 border-slate-800 text-slate-400"
                                  }`}
                                >
                                  <span className="font-mono text-[10px] uppercase font-bold">
                                    {String.fromCharCode(65 + optIdx)}.
                                  </span>
                                  <span>{opt}</span>
                                  {isRightAnswer && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto shrink-0" />
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {q.explanation && (
                            <p className="text-[11px] text-amber-300 bg-amber-950/40 p-2.5 rounded-xl border border-amber-500/30">
                              <strong>Teacher Explanation:</strong> {q.explanation}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* ACTIVE MCQ TEST QUESTIONS FORM */
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmitOnlineExam(activeExamModal._id);
                  }}
                  className="space-y-6"
                >
                  <div className="space-y-6">
                    {activeExamModal.questions?.map((q: any, qIdx: number) => (
                      <div
                        key={qIdx}
                        className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3"
                      >
                        <h4 className="font-bold text-xs text-white flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xs shrink-0">
                            {qIdx + 1}
                          </span>
                          <span>{q.question}</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                          {q.options?.map((opt: string, optIdx: number) => {
                            const isSelected = studentAnswers[qIdx] === optIdx;

                            return (
                              <label
                                key={optIdx}
                                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                                  isSelected
                                    ? "bg-amber-500/10 border-amber-500 text-amber-300 shadow-md shadow-amber-500/5"
                                    : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`q-${qIdx}`}
                                  checked={isSelected}
                                  onChange={() => {
                                    const updated = [...studentAnswers];
                                    updated[qIdx] = optIdx;
                                    setStudentAnswers(updated);
                                  }}
                                  className="w-4 h-4 text-amber-500 focus:ring-amber-500"
                                />
                                <span className="font-bold text-xs">{opt}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <span className="text-xs text-slate-400 font-medium">
                      Answered:{" "}
                      <strong className="text-amber-400 font-bold">
                        {studentAnswers.filter((a) => a !== -1).length} / {activeExamModal.questions?.length || 0}
                      </strong>
                    </span>

                    <button
                      type="submit"
                      disabled={submittingExam || studentAnswers.filter((a) => a !== -1).length === 0}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{submittingExam ? "Submitting Answers..." : "Submit Online Exam"}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* WHATSAPP LINK MISSING MODAL */}
      {showNoWhatsappModal &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-800 shadow-2xl space-y-6 text-white text-center relative animate-in fade-in zoom-in-95">
              <button
                onClick={() => setShowNoWhatsappModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20 shadow-inner">
                <img
                  src="/images/whatsapp-clean-icon.png"
                  alt="WhatsApp"
                  className="w-9 h-9 object-contain"
                />
              </div>

              <div className="space-y-2">
                <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                  WhatsApp Group Link Status
                </span>
                <h3 className="text-xl font-extrabold text-white">
                  লিংক এখনো দেওয়া হয় নাই
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  এই ব্যাচের জন্য অফিসিয়াল হোয়াটসঅ্যাপ গ্রুপ লিংক এখনো এড করা হয়
                  নাই। অ্যাডমিন প্যানেল থেকে লিংক দেওয়ার পর আপনি জয়েন করতে
                  পারবেন।
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5 text-left">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                  সরাসরি টিচারের সাথে যোগাযোগ
                </span>
                <p className="text-xs text-slate-200 font-medium">
                  ক্লাস বা অ্যাডমিশন সংক্রান্ত যেকোনো বিষয় জানতে টিচার Joy
                  Tarafder-কে হোয়াটসঅ্যাপে মেসেজ দিন:
                </p>
              </div>

              <div className="pt-1 flex flex-col gap-2.5">
                <a
                  href="https://wa.me/8801714890199"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white text-xs shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <img
                    src="/images/whatsapp-clean-icon.png"
                    alt="WhatsApp"
                    className="w-4 h-4 object-contain"
                  />
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
