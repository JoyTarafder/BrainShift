'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import {
  Layers,
  ArrowLeft,
  Users,
  Video,
  MessageSquare,
  FileText,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Save,
  BookOpen,
  Copy,
  Check,
  RefreshCw,
  Search,
  Bell,
  PlayCircle,
  Edit2,
  Sparkles,
  X,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface StudentItem {
  _id: string;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  transactionId: string;
  paymentMethod: string;
  enrolledAt: string;
}

interface MaterialItem {
  _id?: string;
  title: string;
  url: string;
  type: 'pdf' | 'slide' | 'note' | 'video';
  addedAt?: string;
}

interface LessonItem {
  _id?: string;
  title: string;
  url: string;
  type?: string;
  durationMinutes?: number;
}

interface BatchData {
  _id: string;
  name: string;
  status: 'active' | 'upcoming' | 'completed';
  classSchedule: string;
  maxStudents: number;
  enrolledCount: number;
  startDate?: string;
  meetUrl?: string;
  whatsappUrl?: string;
  notice?: string;
  materials?: MaterialItem[];
  modules?: LessonItem[];
  courseId?: {
    _id: string;
    title: string;
    slug: string;
    subject: string;
    price: number;
    modules?: LessonItem[];
  };
}

const default24ClassesSeed: LessonItem[] = [
  { title: 'Class 01: Lesson 1 - Intro to ICT & Virtual Reality', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 45 },
  { title: 'Class 02: Lesson 2 - Artificial Intelligence & Robotics Applications', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 50 },
  { title: 'Class 03: Lesson 3 - Biometrics, Genetic Engineering & Cyber Ethics', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 45 },
  { title: 'Class 04: Lesson 4 - Data Communication Systems & Transmission Media', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 55 },
  { title: 'Class 05: Lesson 5 - Wireless Networks (Wi-Fi, Bluetooth, 4G/5G)', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 50 },
  { title: 'Class 06: Lesson 6 - Network Topologies & Cloud Computing Architecture', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 60 },
  { title: 'Class 07: Lesson 7 - Number Systems: Binary, Octal, Hex Conversions', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 50 },
  { title: 'Class 08: Lesson 8 - Binary Arithmetic & 2\'s Complement Subtraction', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 55 },
  { title: 'Class 09: Lesson 9 - BCD, ASCII, EBCDIC & Unicode Encodings', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 45 },
  { title: 'Class 10: Lesson 10 - Basic Logic Gates (AND, OR, NOT) & Truth Tables', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 50 },
  { title: 'Class 11: Lesson 11 - Universal Gates (NAND, NOR) & Special Gates (XOR)', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 55 },
  { title: 'Class 12: Lesson 12 - Boolean Algebra Theorems & De Morgan\'s Law', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 60 },
  { title: 'Class 13: Lesson 13 - Half Adder & Full Adder Circuit Design', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 60 },
  { title: 'Class 14: Lesson 14 - Encoders, Decoders & Multiplexers (MUX)', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 55 },
  { title: 'Class 15: Lesson 15 - Flip-Flops, Registers & Binary Counters', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 60 },
  { title: 'Class 16: Lesson 16 - Intro to Web Design, Domain & HTML Tags', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 45 },
  { title: 'Class 17: Lesson 17 - HTML Formatting, Headings & Lists', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 50 },
  { title: 'Class 18: Lesson 18 - Embedding Images, Hyperlinks & HTML Tables', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 55 },
  { title: 'Class 19: Lesson 19 - HTML Forms, Input Elements & Web Layout Design', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 60 },
  { title: 'Class 20: Lesson 20 - Programming Concepts: Algorithm, Flowchart & C Syntax', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 55 },
  { title: 'Class 21: Lesson 21 - C Variables, Data Types & Conditionals (if-else, switch)', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 60 },
  { title: 'Class 22: Lesson 22 - C Loops: For, While & Do-While Control Flow', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 60 },
  { title: 'Class 23: Lesson 23 - C Arrays & User-Defined Functions', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 55 },
  { title: 'Class 24: Lesson 24 - Relational Database Systems (RDBMS) & SQL Queries', type: 'video', url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', durationMinutes: 60 },
];

export default function AdminBatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const batchId = params?.id as string;

  const token = (session?.user as any)?.apiToken;

  const [batch, setBatch] = useState<BatchData | null>(null);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'lessons' | 'students' | 'links' | 'notice' | 'materials'>('lessons');

  // Form States for Links & Notice
  const [meetUrl, setMeetUrl] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [notice, setNotice] = useState('');

  // Add Lesson Form
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonUrl, setLessonUrl] = useState('');
  const [lessonDuration, setLessonDuration] = useState('45');
  const [addingLesson, setAddingLesson] = useState(false);

  // Edit Lesson State
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editDuration, setEditDuration] = useState('45');

  // New Material Form
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialUrl, setMaterialUrl] = useState('');
  const [materialType, setMaterialType] = useState<'pdf' | 'slide' | 'note' | 'video'>('pdf');
  const [addingMaterial, setAddingMaterial] = useState(false);

  // Search Filter for Enrolled Students
  const [studentSearch, setStudentSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  const loadBatchDetails = async () => {
    if (!batchId) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchApi(`/admin/batches/${batchId}`, {
        headers: getHeaders(),
      });

      if (data && data.success) {
        setBatch(data.batch);
        setStudents(data.students || []);
        const loadedLessons = data.batch?.modules || data.batch?.courseId?.modules || [];
        setLessons(loadedLessons.length > 0 ? loadedLessons : default24ClassesSeed);
        setMeetUrl(data.batch?.meetUrl || '');
        setWhatsappUrl(data.batch?.whatsappUrl || '');
        setNotice(data.batch?.notice || '');
      } else {
        throw new Error(data?.message || 'Failed to load batch details');
      }
    } catch (err: any) {
      setError(err?.message || 'Error loading batch management data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatchDetails();
  }, [batchId, session]);

  // Save Lessons to DB
  const saveLessonsToDb = async (updatedLessons: LessonItem[]) => {
    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const data = await fetchApi(`/admin/batches/${batchId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          modules: updatedLessons,
        }),
      });

      if (!data || !data.success) {
        throw new Error(data?.message || 'Failed to update video lessons');
      }

      setLessons(updatedLessons);
      setSuccessMsg(`Video lessons (${updatedLessons.length}) updated! Immediately reflected live on Student Dashboard.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setError(err?.message || 'Error saving lessons');
    } finally {
      setSaving(false);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim() || !lessonUrl.trim()) {
      setError('Please provide Class Title and YouTube Video Link');
      return;
    }

    setAddingLesson(true);
    const newLesson: LessonItem = {
      title: lessonTitle.trim(),
      url: lessonUrl.trim(),
      type: 'video',
      durationMinutes: Number(lessonDuration) || 45,
    };

    const updated = [...lessons, newLesson];
    await saveLessonsToDb(updated);
    setLessonTitle('');
    setLessonUrl('');
    setAddingLesson(false);
  };

  const handleStartEdit = (idx: number) => {
    const item = lessons[idx];
    setEditingIndex(idx);
    setEditTitle(item.title);
    setEditUrl(item.url);
    setEditDuration(String(item.durationMinutes || 45));
  };

  const handleSaveEdit = async (idx: number) => {
    if (!editTitle.trim() || !editUrl.trim()) {
      setError('Title and Video URL cannot be empty');
      return;
    }

    const updated = lessons.map((item, index) => {
      if (index === idx) {
        return {
          ...item,
          title: editTitle.trim(),
          url: editUrl.trim(),
          durationMinutes: Number(editDuration) || 45,
        };
      }
      return item;
    });

    await saveLessonsToDb(updated);
    setEditingIndex(null);
  };

  const handleDeleteLesson = async (idx: number) => {
    if (!confirm('Are you sure you want to delete this class lesson?')) return;
    const updated = lessons.filter((_, index) => index !== idx);
    await saveLessonsToDb(updated);
  };

  const handleSeed24Classes = async () => {
    if (!confirm('Populate full 24-Class structured HSC ICT curriculum with YouTube links?')) return;
    await saveLessonsToDb(default24ClassesSeed);
  };

  const handleSaveLinksAndNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const data = await fetchApi(`/admin/batches/${batchId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          meetUrl: meetUrl.trim(),
          whatsappUrl: whatsappUrl.trim(),
          notice: notice.trim(),
        }),
      });

      if (!data || !data.success) {
        throw new Error(data?.message || 'Failed to save batch updates');
      }

      setBatch(data.batch);
      setSuccessMsg('Batch links & announcements updated successfully! Reflected live on Student Dashboard.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setError(err?.message || 'Error updating batch settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialTitle.trim() || !materialUrl.trim()) {
      setError('Please provide material title and resource URL/link');
      return;
    }

    setAddingMaterial(true);
    setError('');
    setSuccessMsg('');

    const existingMaterials = batch?.materials || [];
    const newMaterialItem: MaterialItem = {
      title: materialTitle.trim(),
      url: materialUrl.trim(),
      type: materialType,
      addedAt: new Date().toISOString(),
    };

    const updatedMaterials = [newMaterialItem, ...existingMaterials];

    try {
      const data = await fetchApi(`/admin/batches/${batchId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          materials: updatedMaterials,
        }),
      });

      if (!data || !data.success) {
        throw new Error(data?.message || 'Failed to add course material');
      }

      setBatch(data.batch);
      setMaterialTitle('');
      setMaterialUrl('');
      setSuccessMsg('New course material added successfully! Available immediately on Student Learning Player.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setError(err?.message || 'Error adding material');
    } finally {
      setAddingMaterial(false);
    }
  };

  const handleDeleteMaterial = async (indexToDelete: number) => {
    if (!batch?.materials) return;
    if (!confirm('Are you sure you want to remove this course material?')) return;

    setError('');
    setSuccessMsg('');
    const updatedMaterials = batch.materials.filter((_, idx) => idx !== indexToDelete);

    try {
      const data = await fetchApi(`/admin/batches/${batchId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          materials: updatedMaterials,
        }),
      });

      if (data?.success) {
        setBatch(data.batch);
        setSuccessMsg('Material removed successfully.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to delete material');
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredStudents = students.filter((s) => {
    const term = studentSearch.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term) ||
      s.phone.includes(term) ||
      s.transactionId.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4 text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
        <p className="text-slate-600 text-sm font-medium">
          Loading Batch Sub-Page & Video Lessons...
        </p>
      </div>
    );
  }

  if (error && !batch) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#0b2545]">Batch Not Found</h2>
        <p className="text-slate-500 text-xs">{error}</p>
        <Link
          href="/adminpanel/batches"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0b2545] text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Batches</span>
        </Link>
      </div>
    );
  }

  const materials = batch?.materials || [];

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link
        href="/adminpanel/batches"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#0b2545] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Batch Catalog</span>
      </Link>

      {/* Top Batch Header Card */}
      <div className="bg-gradient-to-r from-[#0b2545] via-[#13293d] to-[#1e3a8a] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
              {batch?.courseId?.subject || 'CS'} Tuition Batch
            </span>
            <span
              className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${
                batch?.status === 'active'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              🟢 Status: {batch?.status}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black">{batch?.name}</h1>

          <p className="text-slate-300 text-xs sm:text-sm flex items-center gap-2 font-medium">
            <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Assigned Course: <strong>{batch?.courseId?.title || 'General Course'}</strong></span>
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1 font-mono">
            <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Schedule: {batch?.classSchedule}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Enrolled: <strong>{batch?.enrolledCount || 0}</strong> / {batch?.maxStudents || 30} Seats</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
              <PlayCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Classes: <strong>{lessons.length}</strong> Lessons</span>
            </div>
          </div>
        </div>

        {batch?.courseId?._id && (
          <a
            href={`/learn/${batch.courseId._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-lg transition-transform hover:-translate-y-0.5 shrink-0 self-start md:self-auto z-10"
          >
            <span>Preview Student Learning Classroom</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Feedback Messages */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-bold shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-bold shadow-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Management Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('lessons')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all whitespace-nowrap ${
            activeTab === 'lessons'
              ? 'bg-[#0b2545] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <PlayCircle className="w-4 h-4 text-amber-400" />
          <span>Video Lessons ({lessons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all whitespace-nowrap ${
            activeTab === 'students'
              ? 'bg-[#0b2545] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-400" />
          <span>Enrolled Students ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('links')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all whitespace-nowrap ${
            activeTab === 'links'
              ? 'bg-[#0b2545] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Video className="w-4 h-4 text-emerald-400" />
          <span>Meet & WhatsApp Links</span>
        </button>

        <button
          onClick={() => setActiveTab('notice')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all whitespace-nowrap ${
            activeTab === 'notice'
              ? 'bg-[#0b2545] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-4 h-4 text-amber-400" />
          <span>Batch Notice / Announcements</span>
        </button>

        <button
          onClick={() => setActiveTab('materials')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all whitespace-nowrap ${
            activeTab === 'materials'
              ? 'bg-[#0b2545] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4 text-indigo-400" />
          <span>Course Materials ({materials.length})</span>
        </button>
      </div>

      {/* TAB 1: VIDEO LESSONS (24 CLASSES) MANAGEMENT */}
      {activeTab === 'lessons' && (
        <div className="space-y-6">
          {/* Add / Seed Lesson Bar */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-[#0b2545] flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-amber-500" />
                  <span>Video Lessons & YouTube Links ({lessons.length})</span>
                </h2>
                <p className="text-slate-500 text-xs mt-1">
                  Add or edit class lesson titles, YouTube video URLs, and class durations. Reflected live for enrolled students.
                </p>
              </div>

              <button
                onClick={handleSeed24Classes}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition-all shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>Auto-Populate 24 Standard HSC Classes</span>
              </button>
            </div>

            {/* Add New Lesson Form */}
            <form onSubmit={handleAddLesson} className="grid grid-cols-1 sm:grid-cols-12 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div className="sm:col-span-6">
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Lesson / Class Title *
                </label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="e.g. Class 01: Lesson 1 - Intro to ICT & Virtual Reality"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  YouTube Video Link / URL *
                </label>
                <input
                  type="url"
                  required
                  value={lessonUrl}
                  onChange={(e) => setLessonUrl(e.target.value)}
                  placeholder="e.g. https://www.youtube.com/watch?v=RBSGKlAvoiM"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Duration (Mins)
                </label>
                <input
                  type="number"
                  value={lessonDuration}
                  onChange={(e) => setLessonDuration(e.target.value)}
                  placeholder="45"
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
                />
              </div>

              <div className="sm:col-span-12 pt-1 flex justify-end">
                <button
                  type="submit"
                  disabled={addingLesson || saving}
                  className="px-6 py-2.5 rounded-xl font-black bg-[#0b2545] hover:bg-amber-500 hover:text-slate-950 text-white text-xs shadow-md transition-all inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>{addingLesson || saving ? 'Saving Class...' : 'Add Class Lesson'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* List of 24 Lessons */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-[#0b2545]">
              Classes Playlist ({lessons.length} Lessons Added)
            </h3>

            {lessons.length === 0 ? (
              <p className="text-slate-500 text-xs py-8 text-center">
                No video lessons added yet. Click <strong>"Auto-Populate 24 Standard HSC Classes"</strong> above or add classes manually.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {lessons.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#0b2545] text-amber-400 flex items-center justify-center font-mono font-black text-xs shrink-0 shadow-xs">
                        {idx + 1}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">{item.title}</h4>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                          <span className="text-indigo-600 font-semibold truncate max-w-xs sm:max-w-md">
                            {item.url}
                          </span>
                          <span>• {item.durationMinutes || 45} Mins</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                        title="Preview YouTube Video"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => handleStartEdit(idx)}
                        className="p-2 text-slate-700 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors font-bold border border-slate-200 bg-white"
                        title="Edit Class Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteLesson(idx)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Delete Lesson"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT LESSON POPUP MODAL */}
      {editingIndex !== null && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative space-y-4 animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setEditingIndex(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Editing Class #{editingIndex + 1}
              </span>
              <h3 className="text-lg font-black text-[#0b2545]">
                Edit Lesson Details
              </h3>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Class Lesson Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  YouTube Video Link / URL *
                </label>
                <input
                  type="url"
                  required
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Class Duration (Minutes)
                </label>
                <input
                  type="number"
                  value={editDuration}
                  onChange={(e) => setEditDuration(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545] focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingIndex(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleSaveEdit(editingIndex)}
                disabled={saving}
                className="px-5 py-2 bg-[#0b2545] hover:bg-amber-500 hover:text-slate-950 text-white rounded-xl text-xs font-black shadow-md transition-all inline-flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5 text-amber-400" />
                <span>{saving ? 'Saving...' : 'Save Lesson Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ENROLLED STUDENTS LIST */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-[#0b2545]">Enrolled Student Directory</h2>
              <p className="text-slate-500 text-xs">
                List of students enrolled in {batch?.name} with mobile numbers and verified TrxIDs.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search name, email, mobile, TrxID..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
              />
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-[#0b2545]">No Enrolled Students Found</h3>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                Students will appear here automatically when their payment orders are approved in the Admin Payments Audit table.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-mono font-bold tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Mobile Number</th>
                    <th className="py-3.5 px-4">TrxID / Method</th>
                    <th className="py-3.5 px-4 text-right">Enrolled Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((st) => (
                    <tr key={st._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#0b2545] text-amber-400 font-extrabold flex items-center justify-center text-xs shrink-0 shadow-xs">
                            {st.name?.charAt(0).toUpperCase() || 'S'}
                          </div>
                          <span>{st.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600 font-medium">{st.email}</td>
                      <td className="py-4 px-4 font-mono font-bold text-indigo-900">
                        <span className="bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                          {st.phone}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold text-white ${
                              st.paymentMethod === 'bKash'
                                ? 'bg-[#e2136e]'
                                : st.paymentMethod === 'Nagad'
                                ? 'bg-[#f7931e]'
                                : 'bg-[#8c3494]'
                            }`}
                          >
                            {st.paymentMethod}
                          </span>
                          <span className="font-mono font-bold text-[#0b2545] text-xs">
                            {st.transactionId}
                          </span>
                          <button
                            onClick={() => copyText(st.transactionId, st._id)}
                            className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                            title="Copy TrxID"
                          >
                            {copiedId === st._id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right text-xs text-slate-500 whitespace-nowrap">
                        {st.enrolledAt
                          ? new Date(st.enrolledAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Active'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MEET / ZOOM & WHATSAPP LINKS FORM */}
      {activeTab === 'links' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-black text-[#0b2545] flex items-center gap-2">
              <Video className="w-5 h-5 text-emerald-600" />
              <span>Live Class & Student Group Links</span>
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Add or update Google Meet / Zoom live class link and the batch WhatsApp group link. These appear immediately on the Student Dashboard.
            </p>
          </div>

          <form onSubmit={handleSaveLinksAndNotice} className="space-y-6">
            {/* Google Meet / Zoom Link */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                  <Video className="w-4 h-4 text-emerald-600" />
                  <span>Google Meet / Zoom Live Class Link</span>
                </label>
                {meetUrl && (
                  <a
                    href={meetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300"
                  >
                    <span>Test Meet Link 🚀</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="url"
                value={meetUrl}
                onChange={(e) => setMeetUrl(e.target.value)}
                placeholder="e.g. https://meet.google.com/abc-defg-hij or Zoom URL"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
              />
              <p className="text-[11px] text-slate-500">
                When updated, enrolled students will see a prominent <strong>"🎥 Join Live Class"</strong> button on their learning player.
              </p>
            </div>

            {/* WhatsApp Group Link */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Batch Student WhatsApp Group Link</span>
                </label>
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300"
                  >
                    <span>Test WhatsApp Link 💬</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="url"
                value={whatsappUrl}
                onChange={(e) => setWhatsappUrl(e.target.value)}
                placeholder="e.g. https://chat.whatsapp.com/ExAmPlEgRoUpLiNk"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
              />
              <p className="text-[11px] text-slate-500">
                Students can click to join the official batch discussion group on WhatsApp.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl font-black bg-[#0b2545] hover:bg-amber-500 hover:text-slate-950 text-white text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>{saving ? 'Saving Updates...' : 'Save Live Class & Group Links'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: NOTICE & ANNOUNCEMENTS FORM */}
      {activeTab === 'notice' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-black text-[#0b2545] flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              <span>Batch Notice & Class Schedule Announcements</span>
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Post announcements, schedule updates, or homework instructions for this batch's enrolled students.
            </p>
          </div>

          <form onSubmit={handleSaveLinksAndNotice} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                Notice Banner Content
              </label>
              <textarea
                rows={5}
                value={notice}
                onChange={(e) => setNotice(e.target.value)}
                placeholder="Write class announcements or notices here... (e.g. Assalamu Alaikum! Today's live class starts at 9:00 PM on Google Meet. Please download the homework PDF below.)"
                className="w-full p-4 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-[#0b2545] focus:bg-white leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl font-black bg-[#0b2545] hover:bg-amber-500 hover:text-slate-950 text-white text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>{saving ? 'Publishing Notice...' : 'Publish Batch Announcement'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: COURSE MATERIALS & FILES MANAGEMENT */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          {/* Add Material Form */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-black text-[#0b2545] flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                <span>Upload & Add Batch Course Material</span>
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                Add PDF notes, slides, lecture materials, or extra video resources for this batch.
              </p>
            </div>

            <form onSubmit={handleAddMaterial} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-5">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Material Title *
                </label>
                <input
                  type="text"
                  required
                  value={materialTitle}
                  onChange={(e) => setMaterialTitle(e.target.value)}
                  placeholder="e.g. Chapter 1 Handwritten Lecture Notes PDF"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
                />
              </div>

              <div className="sm:col-span-5">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Material Resource URL / File Link *
                </label>
                <input
                  type="url"
                  required
                  value={materialUrl}
                  onChange={(e) => setMaterialUrl(e.target.value)}
                  placeholder="e.g. Google Drive PDF URL, W3 PDF, Dropbox link"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Type
                </label>
                <select
                  value={materialType}
                  onChange={(e) => setMaterialType(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
                >
                  <option value="pdf">PDF Note</option>
                  <option value="slide">Slides</option>
                  <option value="note">Notes</option>
                  <option value="video">Video</option>
                </select>
              </div>

              <div className="sm:col-span-12 pt-2">
                <button
                  type="submit"
                  disabled={addingMaterial}
                  className="px-6 py-2.5 rounded-xl font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white text-xs shadow-md transition-all inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{addingMaterial ? 'Adding Material...' : 'Add Material Resource'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* List of Uploaded Materials */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-[#0b2545]">
              Uploaded Materials for {batch?.name} ({materials.length})
            </h3>

            {materials.length === 0 ? (
              <p className="text-slate-500 text-xs py-4 text-center">
                No custom batch materials uploaded yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {materials.map((mat, idx) => (
                  <div
                    key={mat._id || idx}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{mat.title}</h4>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          {mat.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={mat.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={() => handleDeleteMaterial(idx)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Delete Material"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
