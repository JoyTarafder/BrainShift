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
  Award,
  Send,
  Check,
  Trophy,
  HelpCircle,
  CheckSquare,
  AlertTriangle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
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
    "modules" | "materials" | "syllabus" | "support" | "assignments" | "exams"
  >("modules");
  const [showNoWhatsappModal, setShowNoWhatsappModal] = useState(false);

  // Student Assignment States
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submittingAssignId, setSubmittingAssignId] = useState<string | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState<string>('');
  const [submissionNotes, setSubmissionNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Student Exam States
  const [exams, setExams] = useState<any[]>([]);
  const [activeExamModal, setActiveExamModal] = useState<any | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<number[]>([]);
  const [submittingExam, setSubmittingExam] = useState<boolean>(false);
  const [examScoreResult, setExamScoreResult] = useState<any | null>(null);

  // Written Exam Script Submission States
  const [submittingWrittenExamId, setSubmittingWrittenExamId] = useState<string | null>(null);
  const [examSubmissionUrl, setExamSubmissionUrl] = useState<string>('');
  const [examSubmissionNotes, setExamSubmissionNotes] = useState<string>('');
  const [submittingWrittenExam, setSubmittingWrittenExam] = useState<boolean>(false);

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
        setExamSubmissionUrl('');
        setExamSubmissionNotes('');
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
    if (!course?.modules?.length) return;
    setUpdatingProgress(true);

    const newProgress = Math.min(
      100,
      Math.round(progress + 100 / course.modules.length),
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
            <h2 className="text-2xl font-extrabold text-white">
              Tuition Classroom Locked
            </h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              You must be an enrolled student in this tuition course to access
              live classes, video lectures, PDF notes, and batch materials.
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

  const embedUrl = activeModule?.url
    ? getYouTubeEmbedUrl(activeModule.url)
    : null;
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
              <span className="font-mono font-black text-amber-400">
                {progress}%
              </span>
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
                  Select video lessons, download batch PDF notes, check
                  syllabus, or contact teacher.
                </p>
              </div>

              {/* LEFT SIDEBAR NAVIGATION TABS */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800/80">
                <button
                  onClick={() => setActiveTab("modules")}
                  className={`px-3 py-2 rounded-xl text-[11px] font-extrabold transition-all text-left flex items-center gap-1.5 ${
                    activeTab === "modules"
                      ? "bg-[#0b2545] text-white border border-amber-500/40 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <PlayCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">Lessons ({modules.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab("materials")}
                  className={`px-3 py-2 rounded-xl text-[11px] font-extrabold transition-all text-left flex items-center gap-1.5 ${
                    activeTab === "materials"
                      ? "bg-[#0b2545] text-white border border-amber-500/40 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">
                    PDF Notes ({batchMaterials.length})
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("syllabus")}
                  className={`px-3 py-2 rounded-xl text-[11px] font-extrabold transition-all text-left flex items-center gap-1.5 ${
                    activeTab === "syllabus"
                      ? "bg-[#0b2545] text-white border border-amber-500/40 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">Syllabus</span>
                </button>

                <button
                  onClick={() => setActiveTab("support")}
                  className={`px-3 py-2 rounded-xl text-[11px] font-extrabold transition-all text-left flex items-center gap-1.5 ${
                    activeTab === "support"
                      ? "bg-[#0b2545] text-white border border-amber-500/40 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">Support</span>
                </button>

                <button
                  onClick={() => setActiveTab("assignments")}
                  className={`px-3 py-2 rounded-xl text-[11px] font-extrabold transition-all text-left flex items-center gap-1.5 ${
                    activeTab === "assignments"
                      ? "bg-[#0b2545] text-white border border-amber-500/40 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="truncate">
                    Assignments ({assignments.length})
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("exams")}
                  className={`px-3 py-2 rounded-xl text-[11px] font-extrabold transition-all text-left flex items-center gap-1.5 ${
                    activeTab === "exams"
                      ? "bg-[#0b2545] text-white border border-amber-500/40 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">Exams ({exams.length})</span>
                </button>
              </div>

              {/* LEFT TAB CONTENT AREA */}
              <div className="pt-1">
                {/* TAB 1: VIDEO LESSONS MODULES PLAYLIST */}
                {activeTab === "modules" && (
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Video Lessons Playlist
                    </span>
                    {modules.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">
                        No video lessons added yet.
                      </p>
                    ) : (
                      <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                        {modules.map((mod: ICourseModule, idx: number) => {
                          const isActive =
                            activeModule?.url === mod.url &&
                            activeModule?.title === mod.title;
                          return (
                            <button
                              key={idx}
                              onClick={() => setActiveModule(mod)}
                              className={`w-full text-left flex items-center justify-between p-3 rounded-2xl border transition-all ${
                                isActive
                                  ? "bg-[#0b2545] border-amber-500/80 text-white shadow-lg shadow-amber-500/5"
                                  : "bg-slate-950 hover:bg-slate-800/80 border-slate-800 text-slate-300"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {mod.type === "video" ? (
                                  <PlayCircle
                                    className={`w-4 h-4 shrink-0 ${
                                      isActive
                                        ? "text-amber-400 animate-pulse"
                                        : "text-slate-500"
                                    }`}
                                  />
                                ) : (
                                  <FileText
                                    className={`w-4 h-4 shrink-0 ${isActive ? "text-amber-400" : "text-indigo-400"}`}
                                  />
                                )}
                                <div>
                                  <span className="font-bold block text-xs line-clamp-1">
                                    {mod.title}
                                  </span>
                                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                                    {mod.type} •{" "}
                                    {mod.durationMinutes
                                      ? `${mod.durationMinutes} mins`
                                      : "Resource"}
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
                {activeTab === "materials" && (
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
                {activeTab === "syllabus" && (
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Course Topics Checklist
                    </span>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                      {course.syllabus?.map((topic: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2.5 p-3 bg-slate-950 rounded-xl text-xs text-slate-300 border border-slate-800"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 4: TEACHER Q&A SUPPORT */}
                {activeTab === "support" && (
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white">
                        Direct Teacher Support
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Have questions about lecture problems? Ask Joy Tarafder
                        directly!
                      </p>
                    </div>

                    <div className="space-y-2">
                      <a
                        href="https://wa.me/8801714890199"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white text-xs shadow-md transition-colors"
                      >
                        <img
                          src="/images/whatsapp-clean-icon.png"
                          alt="WhatsApp"
                          className="w-4 h-4 object-contain"
                        />
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

                {/* TAB 5: STUDENT BATCH ASSIGNMENTS & SUBMISSION */}
                {activeTab === "assignments" && (
                  <div className="space-y-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Homework & Lab Assignments
                    </span>

                    {assignments.length === 0 ? (
                      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-2">
                        <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                        <p className="text-xs font-bold text-slate-300">
                          No active assignments published for your batch yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
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
                              className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <h4 className="font-bold text-white text-xs">
                                    {assign.title}
                                  </h4>
                                  <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                                    Marks: {assign.totalMarks}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-300 whitespace-pre-wrap">
                                  {assign.description}
                                </p>
                                <div className="flex items-center justify-between gap-2 text-[10px] font-extrabold pt-0.5">
                                  <span className="text-amber-400">
                                    Due Date: {new Date(assign.dueDate).toLocaleDateString()}
                                  </span>
                                  {isPastDueDate && (
                                    <span className="text-rose-400 font-bold uppercase tracking-wider bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                                      Deadline Passed
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Student Submission Status & Form */}
                              <div className="pt-2 border-t border-slate-900 space-y-2">
                                {mySub ? (
                                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Submitted Work</span>
                                      </div>
                                      {isGraded ? (
                                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                                          Score: {mySub.marksObtained}/{assign.totalMarks}
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                                          Under Review
                                        </span>
                                      )}
                                    </div>

                                    <div className="text-[11px] space-y-1">
                                      <a
                                        href={mySub.submissionUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-400 hover:underline inline-flex items-center gap-1 font-mono break-all"
                                      >
                                        <span>{mySub.submissionUrl}</span>
                                        <ExternalLink className="w-3 h-3 shrink-0" />
                                      </a>
                                      {mySub.feedback && (
                                        <p className="text-slate-300 bg-slate-950 p-2 rounded-lg text-[11px] border border-slate-800">
                                          <strong className="text-amber-400">Teacher Feedback:</strong> &quot;{mySub.feedback}&quot;
                                        </p>
                                      )}
                                    </div>

                                    {/* Hide Resubmit Button if Graded or Past Due Date */}
                                    {canResubmit && !isSubmittingThis && (
                                      <button
                                        onClick={() => {
                                          setSubmittingAssignId(assign._id);
                                          setSubmissionUrl(mySub.submissionUrl);
                                          setSubmissionNotes(mySub.notes || "");
                                        }}
                                        className="text-[10px] text-amber-400 font-bold hover:underline block pt-1"
                                      >
                                        Update / Resubmit Solution
                                      </button>
                                    )}
                                  </div>
                                ) : null}

                                {/* Message if not submitted and past due date */}
                                {!mySub && isPastDueDate && (
                                  <div className="bg-rose-950/40 border border-rose-800/50 p-3 rounded-xl text-center text-xs space-y-1">
                                    <p className="text-rose-300 font-extrabold text-[11px]">
                                      Submission Deadline Passed
                                    </p>
                                    <p className="text-slate-400 text-[10px]">
                                      The due date ({new Date(assign.dueDate).toLocaleDateString()}) has passed. Submissions are now closed.
                                    </p>
                                  </div>
                                )}

                                {/* Render Submission Form only if allowed */}
                                {((!mySub && !isPastDueDate) || (mySub && canResubmit && isSubmittingThis)) && (
                                  <form
                                    onSubmit={(e) => handleSubmitAssignment(e, assign._id)}
                                    className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2 text-xs"
                                  >
                                    <div className="space-y-1">
                                      <label className="block text-[11px] font-bold text-slate-300">
                                        Solution Link (Google Drive / PDF / GitHub) *
                                      </label>
                                      <input
                                        type="url"
                                        required
                                        value={submissionUrl}
                                        onChange={(e) => setSubmissionUrl(e.target.value)}
                                        placeholder="https://drive.google.com/file/d/..."
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:ring-1 focus:ring-amber-500"
                                      />
                                    </div>

                                    <div className="space-y-1">
                                      <label className="block text-[11px] font-bold text-slate-300">
                                        Notes / Comments for Teacher (Optional)
                                      </label>
                                      <input
                                        type="text"
                                        value={submissionNotes}
                                        onChange={(e) => setSubmissionNotes(e.target.value)}
                                        placeholder="e.g. Completed Q1 to Q5..."
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:ring-1 focus:ring-amber-500"
                                      />
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-1">
                                      {isSubmittingThis && mySub && (
                                        <button
                                          type="button"
                                          onClick={() => setSubmittingAssignId(null)}
                                          className="px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-bold text-slate-400 hover:text-white"
                                        >
                                          Cancel
                                        </button>
                                      )}
                                      <button
                                        type="submit"
                                        disabled={submitting}
                                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                                      >
                                        <Send className="w-3.5 h-3.5" />
                                        <span>
                                          {submitting
                                            ? "Submitting..."
                                            : mySub
                                            ? "Update Submission"
                                            : "Submit Solution"}
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

                {/* TAB 6: STUDENT EXAMS & MODEL TESTS */}
                {activeTab === "exams" && (
                  <div className="space-y-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Online Quizzes & Batch Model Tests
                    </span>

                    {exams.length === 0 ? (
                      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-2">
                        <Trophy className="w-8 h-8 text-slate-500 mx-auto" />
                        <p className="text-xs font-bold text-slate-300">
                          No active exams or model tests published yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
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
                              className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <h4 className="font-bold text-white text-xs">
                                    {exam.title}
                                  </h4>
                                  <span
                                    className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                                      exam.type === "online_mcq"
                                        ? "bg-purple-950 text-purple-300 border-purple-800"
                                        : "bg-indigo-950 text-indigo-300 border-indigo-800"
                                    }`}
                                  >
                                    {exam.type === "online_mcq"
                                      ? "Online MCQ Quiz"
                                      : "Written Exam"}
                                  </span>
                                </div>

                                {exam.description && (
                                  <p className="text-[11px] text-slate-300 whitespace-pre-wrap">
                                    {exam.description}
                                  </p>
                                )}

                                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-extrabold pt-1">
                                  <span className="text-amber-400">
                                    Total Marks: {exam.totalMarks}
                                  </span>
                                  <span>Pass: {exam.passMarks} Marks</span>
                                  <span>Time: {exam.durationMinutes} Mins</span>
                                </div>
                              </div>

                              {/* Student Attempt Status / Start Exam Button / Drive Submission */}
                              <div className="pt-2 border-t border-slate-900 space-y-2">
                                {myResult && (myResult.submissionUrl || exam.type === "online_mcq") ? (
                                  <div className="space-y-2">
                                    {exam.type === "written_exam" && myResult.submissionUrl && (
                                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                                        <div className="flex items-center justify-between gap-2">
                                          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>Submitted Written Script</span>
                                          </div>
                                          {myResult.score > 0 || myResult.passed ? (
                                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                                              Score: {myResult.score}/{exam.totalMarks} ({myResult.passed ? "PASSED" : "FAILED"})
                                            </span>
                                          ) : (
                                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                                              Under Review
                                            </span>
                                          )}
                                        </div>

                                        <div className="text-[11px] space-y-1">
                                          <a
                                            href={myResult.submissionUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-400 hover:underline inline-flex items-center gap-1 font-mono break-all"
                                          >
                                            <span>{myResult.submissionUrl}</span>
                                            <ExternalLink className="w-3 h-3 shrink-0" />
                                          </a>
                                        </div>
                                      </div>
                                    )}

                                    {exam.type === "online_mcq" && (
                                      <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-2">
                                          {myResult.passed ? (
                                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center gap-1">
                                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                              <span>PASSED</span>
                                            </span>
                                          ) : (
                                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                                              <AlertTriangle className="w-3 h-3 text-rose-400" />
                                              <span>FAILED</span>
                                            </span>
                                          )}
                                          <span className="text-xs font-black text-amber-400">
                                            Score: {myResult.score} / {exam.totalMarks}
                                          </span>
                                        </div>

                                        <button
                                          onClick={() => {
                                            setActiveExamModal(exam);
                                            setExamScoreResult(myResult);
                                          }}
                                          className="text-[10px] text-indigo-400 hover:underline font-bold"
                                        >
                                          Review Test Answers
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {exam.type === "online_mcq" ? (
                                      <div className="flex items-center justify-between w-full">
                                        <span className="text-[11px] text-slate-400 font-medium">
                                          Status: <strong className="text-amber-400">Not Attempted</strong>
                                        </span>

                                        <button
                                          onClick={() => {
                                            setActiveExamModal(exam);
                                            setStudentAnswers(
                                              new Array(exam.questions?.length || 0).fill(-1)
                                            );
                                            setExamScoreResult(null);
                                          }}
                                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-transform hover:-translate-y-0.5"
                                        >
                                          <PlayCircle className="w-3.5 h-3.5" />
                                          <span>Start MCQ Quiz Now</span>
                                        </button>
                                      </div>
                                    ) : (
                                      <form
                                        onSubmit={(e) => handleSubmitWrittenExam(e, exam._id)}
                                        className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2 text-xs"
                                      >
                                        <div className="space-y-1">
                                          <label className="block text-[11px] font-bold text-slate-300">
                                            Answer Script Link (Google Drive / PDF) *
                                          </label>
                                          <input
                                            type="url"
                                            required
                                            value={submittingWrittenExamId === exam._id ? examSubmissionUrl : ""}
                                            onChange={(e) => {
                                              setSubmittingWrittenExamId(exam._id);
                                              setExamSubmissionUrl(e.target.value);
                                            }}
                                            placeholder="https://drive.google.com/file/d/..."
                                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:ring-1 focus:ring-amber-500"
                                          />
                                        </div>

                                        <div className="flex items-center justify-end pt-1">
                                          <button
                                            type="submit"
                                            disabled={submittingWrittenExam}
                                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                                          >
                                            <Send className="w-3.5 h-3.5" />
                                            <span>
                                              {submittingWrittenExam ? "Submitting Script..." : "Submit Answer Script"}
                                            </span>
                                          </button>
                                        </div>
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
              </div>
            </div>
          </div>

          {/* ONLINE MCQ TEST PLAYER MODAL */}
          {activeExamModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
                {/* Header */}
                <div className="p-5 bg-slate-950 flex items-center justify-between border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded border border-amber-800">
                      Online MCQ Model Test
                    </span>
                    <h3 className="text-lg font-black text-white mt-1">
                      {activeExamModal.title}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Time: {activeExamModal.durationMinutes} Mins | Total Marks: {activeExamModal.totalMarks} | Pass Marks: {activeExamModal.passMarks}
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

                {/* Body Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                  {examScoreResult ? (
                    /* SCORE RESULT BREAKDOWN */
                    <div className="space-y-6">
                      <div className={`p-6 rounded-2xl border text-center space-y-2 ${
                        examScoreResult.passed
                          ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-200"
                          : "bg-rose-950/50 border-rose-500/50 text-rose-200"
                      }`}>
                        <Trophy className="w-12 h-12 mx-auto animate-bounce" />
                        <h4 className="text-2xl font-black">
                          {examScoreResult.passed ? "CONGRATULATIONS! YOU PASSED!" : "MODEL TEST COMPLETED"}
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
                        <h5 className="font-extrabold text-sm uppercase text-slate-300 tracking-wider">
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
                                    Correct (+{Math.round(activeExamModal.totalMarks / (activeExamModal.questions?.length || 1))})
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
                                    Incorrect (0)
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
                            <h4 className="font-bold text-sm text-white flex items-center gap-2">
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
                      Join live interactive tuition class directly with your
                      teacher & batchmates.
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
                  <h4 className="text-xs font-extrabold text-white">
                    Official Batch Student WhatsApp Group
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Get instant class links, discussion updates, and direct Q&A
                    support from Joy Tarafder.
                  </p>
                </div>
              </div>

              <a
                href={
                  batch?.whatsappUrl?.trim() ? batch.whatsappUrl.trim() : "#"
                }
                onClick={handleJoinWhatsappClick}
                target={batch?.whatsappUrl?.trim() ? "_blank" : "_self"}
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
              {activeModule?.url && (activeModule.type === "video" || embedUrl) ? (
                <PlyrVideoPlayer key={activeModule.url} url={activeModule.url} title={activeModule.title} />
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
                      This lecture module is a PDF document or resource link.
                      Click below to view in full screen.
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
                  <p className="text-slate-400 text-xs">
                    Select a video lesson from the left sidebar to start
                    watching.
                  </p>
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
                  <h2 className="text-lg font-bold text-white">
                    {activeModule.title}
                  </h2>
                </div>

                <button
                  onClick={handleMarkProgress}
                  disabled={updatingProgress}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-colors shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>
                    {updatingProgress ? "Updating..." : "Mark Lesson Completed"}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* WHATSAPP LINK NOT ADDED MODAL */}
      {showNoWhatsappModal &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
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
          document.body,
        )}
    </div>
  );
}
