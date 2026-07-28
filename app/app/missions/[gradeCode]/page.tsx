'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import FloatingDecor from '@/components/decor/FloatingDecor';
import SceneBackground from '@/components/decor/SceneBackground';
import LessonPathList from '@/components/missions/LessonPathList';

export default function LessonListPage() {
  const params = useParams<{ gradeCode: string }>();
  const [gradeId, setGradeId] = useState('');
  const [gradeName, setGradeName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: grade } = await supabase
        .from('greenleaf_grades')
        .select('id, name')
        .eq('code', params.gradeCode)
        .single();

      if (grade) {
        setGradeId(grade.id);
        setGradeName(grade.name);
      }
      setLoading(false);
    };
    load();
  }, [params.gradeCode]);

  return (
    <div className="relative min-h-screen gl-playful-bg px-4 py-8">
      <SceneBackground />
      <FloatingDecor />
      <div className="relative max-w-xl mx-auto space-y-6">
        <Link
          href="/grades"
          className="inline-flex items-center gap-1.5 bg-white rounded-full pl-2.5 pr-3.5 py-1.5 text-sm font-bold text-[#3A7D44] shadow-sm hover:bg-emerald-50 hover:shadow transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Trang chính
        </Link>

        <h1 className="text-xl font-extrabold text-[#3A7D44] text-center">{gradeName}</h1>

        {loading ? <p className="text-center text-gray-400 text-sm py-10">Đang tải...</p> : <LessonPathList gradeId={gradeId} gradeCode={params.gradeCode} />}
      </div>
    </div>
  );
}
