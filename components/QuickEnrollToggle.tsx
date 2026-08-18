'use client';

import { useState } from 'react';
import { fetchApi } from '@/lib/api';
import { RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

interface QuickEnrollToggleProps {
  courseId: string;
  initialOpen: boolean;
  token?: string;
}

export default function QuickEnrollToggle({
  courseId,
  initialOpen,
  token,
}: QuickEnrollToggleProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    const newStatus = !isOpen;

    try {
      const data = await fetchApi(`/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          enrollmentOpen: newStatus,
        }),
      });

      if (data && data.success) {
        setIsOpen(newStatus);
      } else {
        alert(data?.message || 'Failed to update enrollment status');
      }
    } catch (err: any) {
      alert(err?.message || 'Error updating enrollment status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-extrabold transition-all shadow-xs ${
        isOpen
          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
          : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
      }`}
      title="Click to toggle Enrollment OPEN / CLOSED status"
    >
      {loading ? (
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
      ) : isOpen ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
      ) : (
        <XCircle className="w-3.5 h-3.5 text-rose-600" />
      )}
      <span>{isOpen ? '🟢 OPEN (Accepting)' : '🔴 CLOSED (Full)'}</span>
    </button>
  );
}
