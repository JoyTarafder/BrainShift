import Link from 'next/link';
import { CheckCircle2, ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';

interface SuccessPageProps {
  searchParams: Promise<{ tran_id?: string; courseId?: string }>;
}

export default async function PaymentSuccessPage({ searchParams }: SuccessPageProps) {
  const { tran_id, courseId } = await searchParams;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-16">
      <div className="bg-white rounded-3xl p-8 lg:p-12 max-w-lg w-full border border-slate-200 shadow-2xl text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SSLCommerz Transaction Verified</span>
          </span>
          <h1 className="text-3xl font-extrabold text-[#0b2545]">Payment Successful!</h1>
          <p className="text-slate-600 text-sm">
            Thank you for enrolling in TutorNova. Your course materials and 1-on-1 tuition access have been unlocked!
          </p>
        </div>

        {tran_id && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1 font-mono text-left">
            <div><strong>Transaction ID:</strong> {tran_id}</div>
            <div><strong>Status:</strong> PAID</div>
            <div><strong>Access Granted:</strong> Instant</div>
          </div>
        )}

        <div className="pt-2 space-y-3">
          {courseId && (
            <Link
              href={`/learn/${courseId}`}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm shadow-xl shadow-amber-500/20 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Start Course Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          <Link
            href="/dashboard"
            className="w-full inline-flex items-center justify-center py-3 px-6 rounded-xl font-bold bg-[#0b2545] hover:bg-slate-800 text-white text-sm transition-colors"
          >
            Go to Student Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
