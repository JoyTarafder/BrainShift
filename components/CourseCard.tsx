import Image from 'next/image';
import Link from 'next/link';
import { Clock, ArrowRight, Layers, Tag } from 'lucide-react';
import { ICourse } from '@/models/Course';

interface CourseCardProps {
  course: Partial<ICourse>;
}

export default function CourseCard({ course }: CourseCardProps) {
  const {
    title = 'Course Title',
    slug = '',
    shortDescription = '',
    subject = 'Computer Science',
    level = 'Beginner',
    price = 0,
    oldPrice = 0,
    enrollmentOpen = true,
    batchInfo = 'Batch 01 (Sat, Mon, Wed)',
    thumbnailUrl = 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80',
    duration = '8 Weeks',
  } = course;

  const hasDiscount = oldPrice > price;
  const discountPercent = hasDiscount ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
      {/* Thumbnail Header */}
      <div className="relative h-48 w-full bg-slate-800 overflow-hidden">
        <Image
          src={thumbnailUrl}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className="bg-[#0b2545]/90 text-white font-semibold text-xs px-2.5 py-1 rounded-md backdrop-blur-md">
            {subject}
          </span>
          <span
            className={`font-semibold text-xs px-2.5 py-1 rounded-md backdrop-blur-md ${
              level === 'Beginner'
                ? 'bg-emerald-500/90 text-white'
                : level === 'Intermediate'
                ? 'bg-amber-500/90 text-slate-950'
                : 'bg-indigo-600/90 text-white'
            }`}
          >
            {level}
          </span>
        </div>

        {/* Discount Tag */}
        {hasDiscount && (
          <div className="absolute top-3 right-3 bg-rose-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-md shadow-md animate-pulse">
            {discountPercent}% OFF
          </div>
        )}

        {/* Enrollment Closed Overlay */}
        {!enrollmentOpen && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-end justify-start p-3.5">
            <span className="bg-rose-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-lg border border-rose-400">
              Enrollment Closed
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-[#0b2545] transition-colors line-clamp-2">
            {title}
          </h3>
          <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">
            {shortDescription}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-1.5 shrink-0">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-700 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg">
              <Layers className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="text-xs">{batchInfo}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">Course Fee</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-[#0b2545]">
                  ৳ {price.toLocaleString('en-BD')}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-slate-400 line-through font-semibold">
                    ৳ {oldPrice.toLocaleString('en-BD')}
                  </span>
                )}
              </div>
            </div>

            <Link
              href={`/courses/${slug}`}
              className="inline-flex items-center gap-1.5 text-sm font-bold bg-[#0b2545] hover:bg-amber-500 hover:text-slate-950 text-white px-4 py-2.5 rounded-xl transition-all shadow-md"
            >
              <span>View Details</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
