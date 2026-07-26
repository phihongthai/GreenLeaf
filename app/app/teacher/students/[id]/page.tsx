'use client';

import { useParams } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import StudentHistory from '@/components/StudentHistory';

export default function TeacherStudentDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <div className="min-h-screen gl-playful-bg px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <AppHeader backHref="/teacher/students" backLabel="Danh sách học sinh" />
        <StudentHistory studentId={params.id} />
      </div>
    </div>
  );
}
