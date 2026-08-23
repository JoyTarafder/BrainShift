import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import EnrollButton from "@/components/EnrollButton";
import { connectToDatabase } from "@/lib/db";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import Order from "@/models/Order";
import User from "@/models/User";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  FileText,
  Layers,
  Mail,
  PlayCircle,
  ShieldCheck,
} from "lucide-react";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface CourseDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const { slug } = await params;
  await connectToDatabase();

  const courseDoc = await Course.findOne({ slug, status: "published" }).lean();

  if (!courseDoc) {
    notFound();
  }

  // Convert MongoDB document to plain JSON object
  const course = JSON.parse(JSON.stringify(courseDoc));

  // Check payment and enrollment status for logged in student / admin
  const session = await getServerSession(authOptions);
  let paymentStatus: "none" | "pending" | "paid" = "none";

  if (session?.user?.email) {
    const student = await User.findOne({
      email: session.user.email.toLowerCase().trim(),
    }).lean();
    if (student) {
      const studentIdStr = student._id.toString();
      const courseIdStr = course._id.toString();

      // 1. First Priority: Check the latest Order status submitted by the student
      const orderDoc = await Order.findOne({
        $or: [
          { studentId: student._id, courseId: course._id },
          { studentId: studentIdStr, courseId: courseIdStr },
          { studentId: student._id, courseId: courseIdStr },
          { studentId: studentIdStr, courseId: course._id },
        ],
      })
        .sort({ createdAt: -1 })
        .lean();

      if (orderDoc) {
        if (orderDoc.status === "pending") {
          paymentStatus = "pending";
        } else if (orderDoc.status === "paid") {
          paymentStatus = "paid";
        } else if (orderDoc.status === "failed") {
          paymentStatus = "none";
        }
      }

      // 2. Second Priority: If no pending order exists, check active Enrollment
      if (paymentStatus === "none") {
        const enrollmentDoc = await Enrollment.findOne({
          $or: [
            { studentId: student._id, courseId: course._id },
            { studentId: studentIdStr, courseId: courseIdStr },
            { studentId: student._id, courseId: courseIdStr },
            { studentId: studentIdStr, courseId: course._id },
          ],
        }).lean();

        if (enrollmentDoc) {
          paymentStatus = "paid";
        }
      }
    }
  }

  const hasDiscount = (course.oldPrice || 0) > course.price;
  const discountPercent = hasDiscount
    ? Math.round(
        (((course.oldPrice || 0) - course.price) / (course.oldPrice || 1)) *
          100,
      )
    : 0;

  const whatsappMessage = encodeURIComponent(
    `Hello Joy! I am interested in enrolling in the course: "${course.title}". Please share the enrollment procedure.`,
  );
  const whatsappUrl = `https://wa.me/8801714890199?text=${whatsappMessage}`;
  const mailtoUrl = `mailto:joytarafder3@gmail.com?subject=Inquiry for ${encodeURIComponent(course.title)}&body=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link */}
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#0b2545] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Course Catalog</span>
        </Link>

        {/* Hero Header Card */}
        <div className="bg-gradient-to-r from-[#0b2545] via-[#13293d] to-[#1e3a8a] text-white rounded-3xl p-8 lg:p-12 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-amber-500 text-slate-950 font-bold text-xs px-3 py-1 rounded-md uppercase tracking-wider">
              {course.subject}
            </span>
            <span className="bg-white/20 text-white font-semibold text-xs px-3 py-1 rounded-md backdrop-blur-md">
              Level: {course.level}
            </span>
            {hasDiscount && (
              <span className="bg-rose-500 text-white font-extrabold text-xs px-3 py-1 rounded-md shadow-md animate-pulse">
                {discountPercent}% OFF
              </span>
            )}
            {course.enrollmentOpen === false && paymentStatus === "none" && (
              <span className="bg-rose-600 text-white font-extrabold text-xs px-3 py-1 rounded-md uppercase tracking-wider">
                Enrollment Closed
              </span>
            )}
            {paymentStatus === "pending" && (
              <span className="bg-amber-500 text-slate-950 font-extrabold text-xs px-3 py-1 rounded-md uppercase tracking-wider shadow-md animate-pulse">
                Payment Pending Verification
              </span>
            )}
            {paymentStatus === "paid" && (
              <span className="bg-emerald-500 text-white font-extrabold text-xs px-3 py-1 rounded-md uppercase tracking-wider shadow-md">
                ✓ Enrolled Student
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            {course.title}
          </h1>

          <p className="text-lg text-slate-300 max-w-3xl leading-relaxed">
            {course.shortDescription}
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-slate-300 border-t border-slate-700/60">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Duration: {course.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>
                Tuition Batch:{" "}
                <strong>
                  {course.batchInfo || "Batch 01 (Sat, Mon, Wed)"}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Guaranteed 1-on-1 Mentorship</span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Details */}
          <div className="lg:col-span-8 space-y-8">
            {/* Thumbnail */}
            <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden shadow-md border border-slate-200">
              <Image
                src={course.thumbnailUrl}
                alt={course.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
                className="object-cover"
                priority
              />
            </div>

            {/* Assigned Tuition Batch Option Box */}
            <div className="bg-indigo-50/80 rounded-2xl p-6 border border-indigo-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#0b2545] text-amber-400 font-bold flex items-center justify-center shrink-0">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-800 bg-indigo-100 px-2.5 py-0.5 rounded border border-indigo-200">
                    Assigned Tuition Schedule
                  </span>
                  <h3 className="text-lg font-extrabold text-[#0b2545] mt-0.5">
                    {course.batchInfo || "Batch 01 (Sat, Mon, Wed • 8:00 PM)"}
                  </h3>
                </div>
              </div>

              <span
                className={`text-xs font-extrabold px-3 py-1.5 rounded-xl border ${
                  paymentStatus === "paid"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : paymentStatus === "pending"
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : course.enrollmentOpen !== false
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : "bg-rose-100 text-rose-800 border-rose-300"
                }`}
              >
                {paymentStatus === "paid"
                  ? "Enrolled"
                  : paymentStatus === "pending"
                    ? "Pending Review"
                    : course.enrollmentOpen !== false
                      ? "Seats Available"
                      : "Seats Full"}
              </span>
            </div>

            {/* Overview */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-2xl font-bold text-[#0b2545]">
                Course Overview
              </h2>
              <div className="text-slate-700 leading-relaxed whitespace-pre-line space-y-2 text-sm sm:text-base">
                {course.description}
              </div>
            </div>

            {/* Syllabus */}
            {course.syllabus && course.syllabus.length > 0 && (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[#0b2545]">
                    Syllabus & Core Topics
                  </h2>
                  <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-3 py-1 rounded-full">
                    {course.syllabus.length} Modules
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {course.syllabus.map((topic: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/60"
                    >
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs text-slate-400 font-bold uppercase block">
                          Topic {idx + 1}
                        </span>
                        <span className="text-slate-800 font-semibold text-sm sm:text-base">
                          {topic}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Included Modules Breakdown */}
            {course.modules && course.modules.length > 0 && (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
                <h2 className="text-2xl font-bold text-[#0b2545]">
                  Learning Resources Included
                </h2>
                <div className="space-y-3">
                  {course.modules.map((mod: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        {mod.type === "video" ? (
                          <PlayCircle className="w-5 h-5 text-amber-500" />
                        ) : (
                          <FileText className="w-5 h-5 text-indigo-500" />
                        )}
                        <span className="font-medium text-slate-900">
                          {mod.title}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 capitalize bg-slate-200 px-2.5 py-1 rounded font-semibold">
                        {mod.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sticky Sidebar */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl space-y-6">
              <div>
                <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">
                  Tuition Fee
                </span>
                <div className="flex items-baseline gap-2.5 mt-1">
                  <span className="text-3xl font-black text-[#0b2545]">
                    ৳ {course.price.toLocaleString("en-BD")}
                  </span>
                  {hasDiscount && (
                    <span className="text-base text-slate-400 line-through font-bold">
                      ৳ {course.oldPrice.toLocaleString("en-BD")}
                    </span>
                  )}
                  <span className="text-xs text-slate-500 font-medium">
                    BDT
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Batch Schedule:</span>
                  <span className="font-bold text-indigo-700">
                    {course.batchInfo || "Batch 01"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Duration:</span>
                  <span className="font-semibold text-slate-900">
                    {course.duration}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Payment Methods:</span>
                  <span className="font-bold text-amber-600">
                    bKash, Nagad, Rocket
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Mentorship:</span>
                  <span className="font-semibold text-emerald-600">
                    1-on-1 Live Sessions
                  </span>
                </div>
              </div>

              {/* Instant Payment CTA / Pending Notice / Enrolled View Course CTA */}
              <div className="pt-4 border-t border-slate-100">
                <EnrollButton
                  courseId={course._id}
                  slug={course.slug}
                  price={course.price}
                  enrollmentOpen={course.enrollmentOpen !== false}
                  paymentStatus={paymentStatus}
                />
              </div>

              {/* Contact Inquiry Options */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100">
                <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider text-center">
                  Inquire & Contact Support
                </div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-between py-2.5 px-3.5 rounded-xl font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-all text-xs shadow-xs group"
                >
                  <div className="flex items-center gap-2">
                    <Image
                      src="/images/whatsapp-clean-icon.png"
                      alt="WhatsApp Logo"
                      width={24}
                      height={24}
                      className="w-6 h-6 object-contain group-hover:scale-110 transition-transform"
                      unoptimized
                    />
                    <span>WhatsApp: 01714890199</span>
                  </div>
                  <span className="text-[10px] font-extrabold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-md">
                    Message
                  </span>
                </a>

                <a
                  href={mailtoUrl}
                  className="w-full inline-flex items-center justify-between py-2.5 px-3.5 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all text-xs border border-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-600" />
                    <span>Email: joytarafder3@gmail.com</span>
                  </div>
                  <span className="text-[10px] font-extrabold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                    Send
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
