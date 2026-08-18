'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface DeleteCourseButtonProps {
  courseId: string;
  token?: string;
}

export default function DeleteCourseButton({ courseId, token }: DeleteCourseButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this course listing?')) return;

    setLoading(true);

    try {
      await fetchApi(`/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      router.refresh();
    } catch (err) {
      console.error('Failed to delete course:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
      title="Delete Course"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
