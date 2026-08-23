"use client";

import { fetchApi } from "@/lib/api";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface EnrollButtonProps {
  courseId: string;
  slug: string;
  price: number;
  enrollmentOpen?: boolean;
  paymentStatus?: "none" | "pending" | "paid";
}

const PAYMENT_LOGOS = {
  bKash: {
    src: "/images/bkash.png",
    name: "bKash",
    activeClass:
      "border-[#e2136e] bg-rose-50/80 ring-2 ring-[#e2136e]/20 text-[#e2136e]",
  },
  Nagad: {
    src: "/images/nagad.png",
    name: "Nagad",
    activeClass:
      "border-[#f7931e] bg-amber-50/80 ring-2 ring-[#f7931e]/20 text-[#f7931e]",
  },
  Rocket: {
    src: "/images/rocket.png",
    name: "Rocket",
    activeClass:
      "border-[#8c3494] bg-purple-50/80 ring-2 ring-[#8c3494]/20 text-[#8c3494]",
  },
};

export default function EnrollButton({
  courseId,
  slug,
  price,
  enrollmentOpen = true,
  paymentStatus = "none",
}: EnrollButtonProps) {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<
    "bKash" | "Nagad" | "Rocket"
  >("bKash");

  const [senderNumber, setSenderNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const MERCHANT_NUMBER = "01841890199";

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenModal = () => {
    if (!enrollmentOpen) return;
    if (status === "unauthenticated" || !session) {
      window.location.href = `/login?callbackUrl=/courses/${slug}`;
      return;
    }
    setError("");
    setIsModalOpen(true);
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(MERCHANT_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!senderNumber.trim() || senderNumber.trim().length < 11) {
      setError("Please enter a valid 11-digit mobile number");
      return;
    }

    if (!transactionId.trim()) {
      setError("Please enter your Transaction ID (TrxID)");
      return;
    }

    setLoading(true);
    const token = (session?.user as any)?.apiToken;

    try {
      const data = await fetchApi("/payment/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          courseId,
          paymentMethod: selectedMethod,
          senderNumber: senderNumber.trim(),
          transactionId: transactionId.trim().toUpperCase(),
          email: session?.user?.email,
        }),
      });

      if (!data || !data.success) {
        throw new Error(data?.message || "Payment submission failed");
      }

      setIsModalOpen(false);
      setIsPendingModalOpen(true);
      window.location.reload();
    } catch (err: any) {
      setError(err?.message || "Error verifying payment transaction");
      setLoading(false);
    }
  };

  // 1. Payment Status === 'paid': Full Access to Course Dashboard
  if (paymentStatus === "paid") {
    return (
      <div className="space-y-2">
        <Link
          href={`/learn/${courseId}`}
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/20 transition-all text-sm transform hover:-translate-y-0.5"
        >
          <BookOpen className="w-4 h-4 text-white" />
          <span>View Course (Go to Dashboard)</span>
          <ArrowRight className="w-4 h-4 ml-1 text-white" />
        </Link>
      </div>
    );
  }

  // 2. Payment Status === 'pending': Display Pending Button & 24hr Notification Modal
  if (paymentStatus === "pending") {
    return (
      <>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setIsPendingModalOpen(true)}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xl shadow-amber-500/20 transition-all text-sm transform hover:-translate-y-0.5"
          >
            <Clock className="w-4 h-4 text-slate-950 animate-spin" />
            <span>Pending Verification</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        {/* 24-Hour Wait Pending Popup Modal rendered via Portal covering Navbar in blurred state */}
        {mounted &&
          isPendingModalOpen &&
          createPortal(
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto pt-20 sm:pt-24 pb-8">
              <div className="bg-white rounded-3xl max-w-[340px] w-full p-5 shadow-2xl border border-slate-200 relative text-center space-y-4 my-auto animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={() => setIsPendingModalOpen(false)}
                  className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors z-10"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200 shadow-inner">
                  <Clock className="w-7 h-7" />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Payment Verification Underway
                  </span>
                  <h3 className="text-lg font-black text-[#0b2545]">
                    Payment Pending
                  </h3>
                  <p className="text-xs font-bold text-amber-900 bg-amber-50/80 p-3 rounded-xl border border-amber-200 leading-relaxed">
                    "২৪ ঘণ্টার মধ্যে আপনার কোর্সটি একটিভ করা হবে। দয়া করে
                    অপেক্ষা করুন।"
                  </p>
                </div>

                <button
                  onClick={() => setIsPendingModalOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl font-bold bg-[#0b2545] hover:bg-amber-500 hover:text-slate-950 text-white text-xs shadow-md transition-all"
                >
                  ঠিক আছে
                </button>
              </div>
            </div>,
            document.body,
          )}
      </>
    );
  }

  // 3. Enrollment Closed
  if (!enrollmentOpen) {
    return (
      <button
        disabled
        className="w-full py-3.5 px-4 rounded-xl font-bold bg-slate-200 text-red-500 cursor-not-allowed text-xs border border-slate-300 flex items-center justify-center gap-2"
      >
        <span>Enrollment Closed</span>
      </button>
    );
  }

  // 4. Regular Payment Button
  return (
    <>
      <div className="space-y-2">
        <button
          onClick={handleOpenModal}
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xl shadow-amber-500/20 transition-all text-sm transform hover:-translate-y-0.5"
        >
          <CreditCard className="w-4 h-4" />
          <span>Pay ৳{price.toLocaleString("en-BD")}</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      {/* Compact & Sleek Complete Payment Modal rendered via React Portal */}
      {mounted &&
        isModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto pt-20 sm:pt-24 pb-8">
            <div className="p-[1px] rounded-3xl bg-gradient-to-b from-[#0b2545]/20 via-indigo-500/20 to-amber-500/30 max-w-[340px] w-full my-auto shadow-2xl">
              <div className="bg-white rounded-[23px] p-4.5 sm:p-5 relative space-y-3.5 max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                {/* Close Modal Button */}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors z-10"
                  title="Close Modal"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Compact Header */}
                <div className="space-y-1 text-center pt-0.5">
                  <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    ✦ SECURE CHECKOUT
                  </span>
                  <h3 className="text-lg font-black text-[#0b2545] pt-0.5">
                    Complete Payment
                  </h3>
                  <div className="flex items-center justify-center gap-1.5 text-xs pt-0.5">
                    <span className="text-slate-500 text-[11px]">Amount:</span>
                    <span className="bg-amber-100 text-slate-950 font-black px-2 py-0.5 rounded-lg border border-amber-300 text-xs">
                      ৳ {price.toLocaleString("en-BD")} BDT
                    </span>
                    <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>SSL Secure</span>
                    </span>
                  </div>
                </div>

                {/* Compact Branded Payment Method Selector Tabs */}
                <div className="grid grid-cols-3 gap-1.5 bg-slate-100/90 p-1 rounded-2xl border border-slate-200">
                  {(["bKash", "Nagad", "Rocket"] as const).map((method) => {
                    const logo = PAYMENT_LOGOS[method];
                    const isSelected = selectedMethod === method;
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setSelectedMethod(method)}
                        className={`flex flex-col items-center justify-center gap-0.5 p-1.5 rounded-xl border-2 transition-all relative overflow-hidden ${
                          isSelected
                            ? logo.activeClass + " shadow-sm scale-102 bg-white"
                            : "bg-white/70 border-transparent hover:bg-white hover:border-slate-300 opacity-75 hover:opacity-100"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px]">
                            <Check className="w-2 h-2 stroke-[3]" />
                          </div>
                        )}
                        <div className="relative w-full h-6 flex items-center justify-center">
                          <Image
                            src={logo.src}
                            alt={logo.name}
                            width={56}
                            height={28}
                            className="object-contain max-h-6 w-auto"
                            priority
                          />
                        </div>
                        <span className="text-[9.5px] font-black tracking-wide">
                          {logo.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Send Money Instructions Box */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-2 text-[10.5px]">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Image
                        src={PAYMENT_LOGOS[selectedMethod].src}
                        alt={selectedMethod}
                        width={18}
                        height={18}
                        className="object-contain h-3.5 w-auto"
                      />
                      <span>{selectedMethod} Number:</span>
                    </div>
                    <button
                      onClick={handleCopyNumber}
                      className="inline-flex items-center gap-1 text-indigo-700 hover:text-indigo-900 font-bold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 transition-colors text-[9.5px]"
                    >
                      {copied ? (
                        <>
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-2.5 h-2.5 text-indigo-600" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-base font-black text-[#0b2545] font-mono tracking-wider text-center bg-white py-1.5 px-2 rounded-xl border border-slate-200 shadow-inner">
                    {MERCHANT_NUMBER}
                  </div>

                  <ol className="list-decimal list-inside text-slate-600 space-y-0.5 text-[10px] leading-tight pt-0.5">
                    <li>
                      Open <strong>{selectedMethod}</strong> app
                    </li>
                    <li>
                      Select <strong>Send Money</strong>
                    </li>
                    <li>
                      Number: <strong>{MERCHANT_NUMBER}</strong>
                    </li>
                    <li>
                      Amount: <strong>৳ {price.toLocaleString("en-BD")}</strong>{" "}
                      (Ref: TutorNova)
                    </li>
                  </ol>
                </div>

                {/* Verification Form */}
                <form onSubmit={handleSubmitPayment} className="space-y-2.5">
                  {error && (
                    <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-1.5 font-semibold">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10.5px] font-extrabold text-slate-800 mb-0.5">
                      Your {selectedMethod} Sender Number *
                    </label>
                    <div className="relative">
                      <Smartphone className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={senderNumber}
                        onChange={(e) => setSenderNumber(e.target.value)}
                        placeholder="01841890199"
                        className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-black text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#0b2545] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-extrabold text-slate-800 mb-0.5">
                      Transaction ID (TrxID) *
                    </label>
                    <input
                      type="text"
                      required
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="e.g. 9K28X1L9"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-black uppercase text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#0b2545] focus:bg-white tracking-wider"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl font-extrabold bg-[#0b2545] hover:bg-amber-500 hover:text-slate-950 text-white text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>
                      {loading ? "Verifying TrxID..." : "Submit Payment"}
                    </span>
                  </button>
                </form>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
