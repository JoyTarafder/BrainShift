import Link from 'next/link';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

interface FailPageProps {
  searchParams: Promise<{ tran_id?: string; reason?: string }>;
}

export default async function PaymentFailPage({ searchParams }: FailPageProps) {
  const { tran_id, reason } = await searchParams;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-16">
      <div className="bg-white rounded-3xl p-8 lg:p-12 max-w-lg w-full border border-slate-200 shadow-2xl text-center space-y-6">
        <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <AlertCircle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-[#0b2545]">
            {reason === 'cancelled' ? 'Payment Cancelled' : 'Payment Failed'}
          </h1>
          <p className="text-slate-600 text-sm">
            {reason === 'cancelled'
              ? 'You cancelled the transaction before completing payment.'
              : 'Your payment transaction could not be completed by SSLCommerz.'}
          </p>
        </div>

        {tran_id && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1 font-mono text-left">
            <div><strong>Transaction ID:</strong> {tran_id}</div>
            <div><strong>Status:</strong> FAILED / UNPAID</div>
          </div>
        )}

        <div className="pt-2 space-y-3">
          <Link
            href="/courses"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold bg-[#0b2545] hover:bg-amber-500 hover:text-slate-950 text-white text-sm shadow-xl transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Enrolling Again</span>
          </Link>

          <Link
            href="/dashboard"
            className="w-full inline-flex items-center justify-center py-2.5 px-6 rounded-xl font-semibold text-slate-600 hover:text-slate-900 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
