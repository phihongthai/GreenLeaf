'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import AppHeader from '@/components/AppHeader';
import type { Grade } from '@/lib/types';

const ROLE_HOME: Record<string, string> = {
  student: '/grades',
  teacher: '/teacher/homework',
  parent: '/parent/dashboard',
};

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [gradeId, setGradeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingGrade, setSavingGrade] = useState(false);
  const [gradeSaved, setGradeSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const [{ data: profile }, { data: gradesData }] = await Promise.all([
        supabase.from('greenleaf_profiles').select('name, username, role, grade_id').eq('id', user.id).single(),
        supabase.from('greenleaf_grades').select('*').order('order_index'),
      ]);

      setName(profile?.name ?? '');
      setUsername(profile?.username ?? null);
      setRole(profile?.role ?? null);
      setGradeId(profile?.grade_id ?? '');
      setGrades(gradesData ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const handleChangeGrade = async (newGradeId: string) => {
    if (!userId) return;
    setSavingGrade(true);
    setGradeSaved(false);
    const supabase = createClient();
    const { error } = await supabase.from('greenleaf_profiles').update({ grade_id: newGradeId }).eq('id', userId);
    if (!error) {
      setGradeId(newGradeId);
      setGradeSaved(true);
    }
    setSavingGrade(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setSaved(false);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('greenleaf_profiles').update({ name: name.trim() }).eq('id', user.id);
    setSaving(false);
    setSaved(true);
  };

  return (
    <div className="min-h-screen gl-playful-bg px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
        <AppHeader backHref={role ? ROLE_HOME[role] : undefined} icon="👤" title="Hồ sơ của tôi" />

        {loading ? (
          <p className="text-center text-gray-400 text-sm py-10">Đang tải...</p>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Tên hiển thị</label>
                <input
                  required
                  value={name}
                  onChange={(e) => { setName(e.target.value); setSaved(false); }}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
                />
              </div>

              {username && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Tên đăng nhập</label>
                  <p className="text-sm text-gray-400 bg-gray-50 rounded-xl px-4 py-2.5">{username}</p>
                </div>
              )}

              {saved && <p className="text-sm text-emerald-600 font-semibold">Đã lưu!</p>}

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#3A7D44] hover:bg-[#2E4A34] disabled:opacity-60 text-white font-bold py-2.5 rounded-xl transition-colors"
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </form>
          </div>
        )}

        {!loading && role === 'student' && (
          <div className="bg-white rounded-3xl shadow-sm p-6 space-y-3">
            <label className="block text-xs font-bold text-gray-500 mb-1">Cấp độ học</label>
            <select
              value={gradeId}
              disabled={savingGrade}
              onChange={(e) => handleChangeGrade(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3A7D44] disabled:opacity-50"
            >
              {grades.map((g) => (
                <option key={g.id} value={g.id}>{g.name} ({g.age_range})</option>
              ))}
            </select>
            {savingGrade && <p className="text-xs text-gray-400">Đang lưu...</p>}
            {gradeSaved && !savingGrade && <p className="text-sm text-emerald-600 font-semibold">Đã đổi cấp độ!</p>}
          </div>
        )}
      </div>
    </div>
  );
}
