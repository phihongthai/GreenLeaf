'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import TeacherNav from '@/components/teacher/TeacherNav';
import AppFooter from '@/components/AppFooter';

interface ClassRow { id: string; name: string; code: string; grade_id: string | null }
interface StudentRow { id: string; name: string; class_id: string | null }
interface MissionRow { id: string; order_index: number; title: string; is_unlocked: boolean }
interface TaskRow { id: string; title: string; task_type: string }
interface ResultRow { student_id: string; task_id: string; item_key: string; is_correct: boolean | null; score: number | null; attempt_no: number }

type Access = 'default' | 'open' | 'locked';

export default function TeacherUnitPage() {
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [missions, setMissions] = useState<MissionRow[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [access, setAccess] = useState<Map<string, boolean>>(new Map()); // `${classId}:${missionId}`
  const [classId, setClassId] = useState<string>('');
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const supabase = createClient();
    const [{ data: cls }, { data: stu }, { data: mis }, { data: tsk }, { data: acc }, { data: res }] = await Promise.all([
      supabase.from('greenleaf_classes').select('id, name, code, grade_id').order('name'),
      supabase.from('greenleaf_profiles').select('id, name, class_id').eq('role', 'student').order('name'),
      supabase.from('greenleaf_unit_missions').select('id, order_index, title, is_unlocked').order('order_index'),
      supabase.from('greenleaf_tasks').select('id, title, task_type').order('order_index'),
      supabase.from('greenleaf_class_mission_access').select('class_id, mission_id, unlocked'),
      supabase.from('greenleaf_task_results').select('student_id, task_id, item_key, is_correct, score, attempt_no'),
    ]);
    setClasses((cls ?? []) as ClassRow[]);
    setStudents((stu ?? []) as StudentRow[]);
    setMissions((mis ?? []) as MissionRow[]);
    setTasks((tsk ?? []) as TaskRow[]);
    setResults((res ?? []) as ResultRow[]);
    setAccess(new Map(((acc ?? []) as { class_id: string; mission_id: string; unlocked: boolean }[]).map((a) => [`${a.class_id}:${a.mission_id}`, a.unlocked])));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (!classId && classes.length > 0) setClassId(classes[0].id); }, [classes, classId]);

  const createClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const code = newCode.trim().toUpperCase();
    if (!newName.trim() || !/^[A-Z0-9-]{2,12}$/.test(code)) {
      setError('Enter a class name and a code of 2–12 letters, digits or dashes.');
      return;
    }
    const { error: err } = await createClient().from('greenleaf_classes').insert({ name: newName.trim(), code });
    if (err) { setError(err.code === '23505' ? 'That class code is already used.' : err.message); return; }
    setNewName(''); setNewCode('');
    load();
  };

  const assign = async (studentId: string, value: string) => {
    setError(null);
    const { error: err } = await createClient().from('greenleaf_profiles').update({ class_id: value || null }).eq('id', studentId);
    if (err) { setError(err.message); return; }
    setStudents((s) => s.map((x) => (x.id === studentId ? { ...x, class_id: value || null } : x)));
  };

  const setMissionAccess = async (missionId: string, value: Access) => {
    setError(null);
    const supabase = createClient();
    const { error: err } = value === 'default'
      ? await supabase.from('greenleaf_class_mission_access').delete().eq('class_id', classId).eq('mission_id', missionId)
      : await supabase.from('greenleaf_class_mission_access').upsert({ class_id: classId, mission_id: missionId, unlocked: value === 'open', updated_at: new Date().toISOString() });
    if (err) { setError(err.message); return; }
    setAccess((m) => {
      const next = new Map(m);
      if (value === 'default') next.delete(`${classId}:${missionId}`);
      else next.set(`${classId}:${missionId}`, value === 'open');
      return next;
    });
  };

  const classStudents = useMemo(() => new Set(students.filter((s) => s.class_id === classId).map((s) => s.id)), [students, classId]);

  // Per task, per item: how many class students answered, % correct (or average pronunciation), weakest first.
  const taskSummaries = useMemo(() => {
    return tasks.map((t) => {
      const rows = results.filter((r) => r.task_id === t.id && classStudents.has(r.student_id));
      const byItem = new Map<string, ResultRow[]>();
      for (const r of rows) (byItem.get(r.item_key) ?? byItem.set(r.item_key, []).get(r.item_key)!).push(r);
      const items = Array.from(byItem.entries()).map(([key, list]) => {
        if (t.task_type === 'pronunciation') {
          const best = new Map<string, number>();
          for (const r of list) best.set(r.student_id, Math.max(best.get(r.student_id) ?? 0, r.score ?? 0));
          const vals = Array.from(best.values());
          return { key, n: vals.length, value: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length), unit: '% avg pronunciation' };
        }
        const correct = list.filter((r) => r.is_correct).length;
        return { key, n: list.length, value: Math.round((correct / list.length) * 100), unit: '% correct' };
      }).sort((a, b) => a.value - b.value);
      return { task: t, items };
    }).filter((s) => s.items.length > 0);
  }, [tasks, results, classStudents]);

  return (
    <div className="min-h-screen gl-playful-bg px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <TeacherNav active="unit" />
        <div className="flex justify-end">
          <Link href="/teacher/unit/create" className="flex items-center gap-1.5 rounded-xl bg-[#3A7D44] px-4 py-2 text-sm font-bold text-white">
            <Plus className="h-4 w-4" /> Create Activity
          </Link>
        </div>
        {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

        <section className="rounded-3xl bg-white p-5 shadow-sm space-y-3">
          <h2 className="font-extrabold text-[#3A7D44]">Classes</h2>
          <form onSubmit={createClass} className="flex flex-wrap gap-2">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Class name (e.g. Kids 1 – Monday)" aria-label="Class name" className="flex-1 min-w-[10rem] rounded-xl border px-3 py-2 text-sm" />
            <input value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="Code (e.g. K1-A)" aria-label="Class code" className="w-32 rounded-xl border px-3 py-2 text-sm uppercase" />
            <button type="submit" className="rounded-xl bg-[#3A7D44] px-4 py-2 text-sm font-bold text-white">Create class</button>
          </form>

          {loading ? <p className="text-sm text-gray-400">Loading…</p> : classes.length === 0 ? (
            <p className="text-sm text-gray-400">No classes yet.</p>
          ) : (
            <>
              <label className="block text-sm font-bold text-gray-600">
                Class{' '}
                <select value={classId} onChange={(e) => setClassId(e.target.value)} className="ml-2 rounded-xl border px-3 py-1.5 text-sm">
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                </select>
              </label>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <caption className="mb-1 text-left text-xs font-bold text-gray-500">Students</caption>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.id} className="border-t">
                        <td className="py-1.5 pr-3">{s.name}</td>
                        <td className="py-1.5 text-right">
                          <select aria-label={`Class for ${s.name}`} value={s.class_id ?? ''} onChange={(e) => assign(s.id, e.target.value)} className="rounded-lg border px-2 py-1 text-xs">
                            <option value="">— no class —</option>
                            {classes.map((c) => <option key={c.id} value={c.id}>{c.code}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        {classId && (
          <section className="rounded-3xl bg-white p-5 shadow-sm space-y-3">
            <h2 className="font-extrabold text-[#3A7D44]">Open Missions for this class</h2>
            <p className="text-xs text-gray-500">Missions open by your teaching pace, not by scores. &quot;Default&quot; follows the Unit setting (Mission 1 open, the rest locked).</p>
            <ul className="space-y-2">
              {missions.map((m) => {
                const o = access.get(`${classId}:${m.id}`);
                const value: Access = o === undefined ? 'default' : o ? 'open' : 'locked';
                const effective = o === undefined ? m.is_unlocked : o;
                return (
                  <li key={m.id} className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2">
                    <span className="flex-1 min-w-0 truncate text-sm font-semibold">Mission {m.order_index}: {m.title}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${effective ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>{effective ? 'Open' : 'Locked'}</span>
                    <select aria-label={`Access for mission ${m.order_index}`} value={value} onChange={(e) => setMissionAccess(m.id, e.target.value as Access)} className="rounded-lg border px-2 py-1 text-xs">
                      <option value="default">Default</option>
                      <option value="open">Open</option>
                      <option value="locked">Locked</option>
                    </select>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {classId && (
          <section className="rounded-3xl bg-white p-5 shadow-sm space-y-4">
            <h2 className="font-extrabold text-[#3A7D44]">Where this class needs help</h2>
            {taskSummaries.length === 0 ? (
              <p className="text-sm text-gray-400">No results from this class yet.</p>
            ) : taskSummaries.map(({ task, items }) => (
              <div key={task.id}>
                <h3 className="text-sm font-bold text-gray-700">{task.title} <span className="font-normal text-gray-400">· {task.task_type}</span></h3>
                <p className="mb-1 text-xs text-gray-400">Weakest first.</p>
                <ul className="space-y-1">
                  {items.map((it) => (
                    <li key={it.key} className="flex items-center gap-2 text-sm">
                      <span className="flex-1 truncate">{it.key}</span>
                      <span className="text-xs text-gray-400">{it.n} student{it.n === 1 ? '' : 's'}</span>
                      <span className={`w-28 text-right text-xs font-bold ${it.value >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>{it.value}{it.unit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}
      </div>
      <AppFooter />
    </div>
  );
}
