'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

// Shown on the student home when the teacher has set up a Unit for the student's level.
export default function UnitEntryLink({ gradeId }: { gradeId: string | undefined }) {
  const [title, setTitle] = useState<string | null>(null);

  useEffect(() => {
    if (!gradeId) return;
    createClient()
      .from('greenleaf_units')
      .select('title')
      .eq('grade_id', gradeId)
      .order('order_index')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setTitle(data?.title ?? null));
  }, [gradeId]);

  if (!title) return null;
  return (
    <Link href="/unit" className="flex items-center justify-between rounded-2xl bg-white/95 px-4 py-3 text-gl-green-dark font-extrabold shadow-sm border border-emerald-100/70">
      <span>🗺️ {title}</span>
      <span aria-hidden>→</span>
    </Link>
  );
}
