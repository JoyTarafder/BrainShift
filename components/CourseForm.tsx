'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Plus, Trash2, Save, ArrowLeft, Image as ImageIcon, Layers, Tag } from 'lucide-react';
import { ICourse, ICourseModule } from '@/models/Course';
import { fetchApi } from '@/lib/api';

interface CourseFormProps {
  initialData?: Partial<ICourse>;
  isEdit?: boolean;
  token?: string;
  batches?: Array<{ _id: string; name: string; classSchedule: string }>;
}

export default function CourseForm({ initialData, isEdit = false, token, batches = [] }: CourseFormProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [subject, setSubject] = useState(initialData?.subject || 'Computer Science');
  const [level, setLevel] = useState<string>(initialData?.level || 'Beginner');

  // Pricing & Discounts
  const [oldPrice, setOldPrice] = useState(initialData?.oldPrice ? String(initialData.oldPrice) : '4000');
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : '2500');

  // Enrollment Control & Batch Options
  const [enrollmentOpen, setEnrollmentOpen] = useState<boolean>(initialData?.enrollmentOpen ?? true);
  const [batchInfo, setBatchInfo] = useState(
    initialData?.batchInfo || (batches[0] ? `${batches[0].name} (${batches[0].classSchedule})` : 'Batch 01 (Sat, Mon, Wed • 8:00 PM)')
  );

  const [duration, setDuration] = useState(initialData?.duration || '8 Weeks');
  const [thumbnailUrl, setThumbnailUrl] = useState(
    initialData?.thumbnailUrl || 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80'
  );
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState<'published' | 'draft' | 'archived'>(initialData?.status || 'published');
  const [syllabus, setSyllabus] = useState<string[]>(initialData?.syllabus || ['']);
  
  const [modules, setModules] = useState<ICourseModule[]>(
    initialData?.modules || [
      { title: 'Introductory Lecture & Setup', type: 'video', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', durationMinutes: 45 }
    ]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!isEdit) {
      setSlug(generateSlug(newTitle));
    }
  };

  // Syllabus Topic Handlers
  const handleAddSyllabusTopic = () => setSyllabus([...syllabus, '']);
  const handleRemoveSyllabusTopic = (index: number) => setSyllabus(syllabus.filter((_, i) => i !== index));
  const handleSyllabusChange = (index: number, value: string) => {
    const updated = [...syllabus];
    updated[index] = value;
    setSyllabus(updated);
  };

  // Module Handlers
  const handleAddModule = () => {
    setModules([
      ...modules,
      { title: '', type: 'video', url: '', durationMinutes: 30 }
    ]);
  };
  const handleRemoveModule = (index: number) => {
    setModules(modules.filter((_, i) => i !== index));
  };
  const handleModuleChange = (index: number, field: keyof ICourseModule, value: any) => {
    const updated = [...modules];
    updated[index] = { ...updated[index], [field]: value };
    setModules(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const apiToken = token || (session?.user as any)?.apiToken;

    const endpoint = isEdit ? `/courses/${initialData?._id}` : `/courses`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const payload = {
        title,
        slug: slug.toLowerCase().trim(),
        subject,
        level,
        price: Number(price),
        oldPrice: Number(oldPrice) || 0,
        enrollmentOpen,
        batchInfo,
        duration,
        thumbnailUrl,
        shortDescription,
        description,
        status,
        syllabus: syllabus.filter((t) => t.trim().length > 0),
        modules: modules.filter((m) => m.title.trim().length > 0 && m.url.trim().length > 0),
      };

      const data = await fetchApi(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!data || !data.success) {
        throw new Error(data?.message || 'Failed to save course');
      }

      router.push('/adminpanel/courses');
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Error submitting form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-sm font-bold text-[#0b2545] uppercase tracking-wider">
            {isEdit ? 'Course Specifications & Modules' : 'Course Information & Metadata'}
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            {isEdit ? 'Update course syllabus, modules, pricing discounts, enrollment status, and batches.' : 'Fill in the course details to publish to TutorNova.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0b2545] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Main Grid Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-900">
        {/* Title */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">Course Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={handleTitleChange}
            placeholder="e.g. HSC ICT Complete Masterclass"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">URL Slug *</label>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="hsc-ict-complete-masterclass"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
          />
        </div>

        {/* Subject */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">Subject Category *</label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. ICT (Information & Communication Technology)"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
          />
        </div>

        {/* Enrollment Status Select */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
            Enrollment Status *
          </label>
          <select
            value={enrollmentOpen ? 'open' : 'closed'}
            onChange={(e) => setEnrollmentOpen(e.target.value === 'open')}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
          >
            <option value="open" className="text-slate-900 font-semibold">Open (Accepting Enrollments)</option>
            <option value="closed" className="text-slate-900 font-semibold">Closed (Seats Full)</option>
          </select>
        </div>

        {/* Batch Selection Option Box */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
            Assigned Batch Schedule Option *
          </label>
          {batches.length > 0 ? (
            <select
              value={batchInfo}
              onChange={(e) => setBatchInfo(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
            >
              {batches.map((b) => {
                const optionVal = `${b.name} (${b.classSchedule})`;
                return (
                  <option key={b._id} value={optionVal} className="text-slate-900 font-semibold">
                    {b.name} — {b.classSchedule}
                  </option>
                );
              })}
              <option value="General Batch (Flexible Schedule)" className="text-slate-900 font-semibold">
                General Batch (Flexible Schedule)
              </option>
            </select>
          ) : (
            <input
              type="text"
              required
              value={batchInfo}
              onChange={(e) => setBatchInfo(e.target.value)}
              placeholder="e.g. Batch 01 (Sat, Mon, Wed • 8:00 PM)"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
            />
          )}
        </div>

        {/* Pricing Fields */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
            Original / Old Price (BDT ৳)
          </label>
          <div className="relative">
            <Tag className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="number"
              min="0"
              value={oldPrice}
              onChange={(e) => setOldPrice(e.target.value)}
              placeholder="4000 (Strikethrough Price)"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
            New / Selling Price (BDT ৳) *
          </label>
          <div className="relative">
            <Tag className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="number"
              required
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="2500 (Discounted Price)"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
            />
          </div>
        </div>

        {/* Level */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">Skill Level *</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
          >
            <option value="Beginner" className="text-slate-900 font-semibold">Beginner</option>
            <option value="Intermediate" className="text-slate-900 font-semibold">Intermediate</option>
            <option value="Advanced" className="text-slate-900 font-semibold">Advanced</option>
            <option value="HSC XI - XII / Admission" className="text-slate-900 font-semibold">HSC XI - XII / Admission</option>
            <option value="University Academic" className="text-slate-900 font-semibold">University Academic</option>
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">Duration *</label>
          <input
            type="text"
            required
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g. 8 Weeks (24 Live Classes)"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">Publish Status *</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
          >
            <option value="published" className="text-slate-900 font-semibold">Published (Visible on site)</option>
            <option value="draft" className="text-slate-900 font-semibold">Draft (Hidden)</option>
            <option value="archived" className="text-slate-900 font-semibold">Archived</option>
          </select>
        </div>

        {/* Thumbnail URL */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">Thumbnail Image URL *</label>
          <div className="relative">
            <ImageIcon className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
            <input
              type="url"
              required
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
            />
          </div>
        </div>

        {/* Short Description */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">Short Description *</label>
          <input
            type="text"
            required
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="1-2 sentences summarizing the course for catalog cards"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
          />
        </div>

        {/* Detailed Description */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">Full Course Overview *</label>
          <textarea
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Comprehensive description of what students will learn..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
          ></textarea>
        </div>
      </div>

      {/* Course Video / PDF Modules Section */}
      <div className="space-y-4 pt-6 border-t border-slate-100 text-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-bold text-slate-800">Learning Modules & Video Links</label>
            <p className="text-xs text-slate-500">Add YouTube video links, PDF lecture notes, or Google Drive resources unlocked for enrolled students.</p>
          </div>
          <button
            type="button"
            onClick={handleAddModule}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0b2545] bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Module</span>
          </button>
        </div>

        <div className="space-y-4">
          {modules.map((mod, index) => (
            <div key={index} className="p-4.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                    Module {index + 1}
                  </span>
                  {mod.title && (
                    <span className="text-xs font-semibold text-slate-600 truncate max-w-xs sm:max-w-md">
                      — {mod.title}
                    </span>
                  )}
                </div>
                {modules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveModule(index)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                    title="Remove Module"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Module</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6">
                  <input
                    type="text"
                    required
                    value={mod.title}
                    onChange={(e) => handleModuleChange(index, 'title', e.target.value)}
                    placeholder="Module Title (e.g. Chapter 3: Logic Gates)"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
                  />
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={mod.type}
                    onChange={(e) => handleModuleChange(index, 'type', e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
                  >
                    <option value="video" className="text-slate-900 font-semibold">Video (YouTube)</option>
                    <option value="pdf" className="text-slate-900 font-semibold">PDF / Document</option>
                    <option value="link" className="text-slate-900 font-semibold">Resource Link</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <input
                    type="number"
                    value={mod.durationMinutes || ''}
                    onChange={(e) => handleModuleChange(index, 'durationMinutes', Number(e.target.value))}
                    placeholder="Duration (mins)"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
                  />
                </div>

                <div className="sm:col-span-12">
                  <input
                    type="url"
                    required
                    value={mod.url}
                    onChange={(e) => handleModuleChange(index, 'url', e.target.value)}
                    placeholder="Resource URL (e.g. https://www.youtube.com/watch?v=...)"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Syllabus Array Inputs */}
      <div className="space-y-4 pt-6 border-t border-slate-100 text-slate-900">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-bold text-slate-800">Syllabus Outline Topics</label>
          <button
            type="button"
            onClick={handleAddSyllabusTopic}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0b2545] bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Topic</span>
          </button>
        </div>

        <div className="space-y-3">
          {syllabus.map((topic, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-slate-400 w-6 text-right">
                {index + 1}.
              </span>
              <input
                type="text"
                value={topic}
                onChange={(e) => handleSyllabusChange(index, e.target.value)}
                placeholder={`Topic ${index + 1} title`}
                className="flex-grow px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
              />
              {syllabus.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveSyllabusTopic(index)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                  title="Remove Topic"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Publish Course'}</span>
        </button>
      </div>
    </form>
  );
}
