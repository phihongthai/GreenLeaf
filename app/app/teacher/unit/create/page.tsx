'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, HelpCircle, Link2, FolderTree, Shuffle, ArrowLeftRight, Map, BookOpen, FolderOpen, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import TeacherNav from '@/components/teacher/TeacherNav';
import AppFooter from '@/components/AppFooter';

type Template = 'quiz' | 'match_up' | 'group_sort' | 'anagram' | 'unjumble';

const TEMPLATES: { key: Template; title: string; blurb: string; icon: React.ReactNode; accent: string; solid: string; tint: string }[] = [
  { key: 'quiz', title: 'Quiz', blurb: 'A series of multiple choice questions. Tap the correct answer to proceed.', icon: <HelpCircle className="h-6 w-6" />, accent: 'from-violet-400 to-purple-500', solid: 'bg-violet-500', tint: 'bg-violet-50 border-violet-200' },
  { key: 'match_up', title: 'Match up', blurb: 'Drag and drop each keyword next to its definition.', icon: <Link2 className="h-6 w-6" />, accent: 'from-fuchsia-400 to-pink-500', solid: 'bg-fuchsia-500', tint: 'bg-fuchsia-50 border-fuchsia-200' },
  { key: 'group_sort', title: 'Group sort', blurb: 'Drag and drop each item into its correct group.', icon: <FolderTree className="h-6 w-6" />, accent: 'from-amber-400 to-orange-500', solid: 'bg-amber-500', tint: 'bg-amber-50 border-amber-200' },
  { key: 'anagram', title: 'Anagram', blurb: 'Drag the letters into their correct positions to unscramble the word.', icon: <Shuffle className="h-6 w-6" />, accent: 'from-sky-400 to-blue-500', solid: 'bg-sky-500', tint: 'bg-sky-50 border-sky-200' },
  { key: 'unjumble', title: 'Unjumble', blurb: 'Drag and drop words to rearrange each sentence into its correct order.', icon: <ArrowLeftRight className="h-6 w-6" />, accent: 'from-teal-400 to-cyan-500', solid: 'bg-teal-500', tint: 'bg-teal-50 border-teal-200' },
];

// Same candy-tile colours the student-facing games use, so teachers see roughly
// how their scrambled word/sentence will actually look to a kid.
const TILE_COLORS = [
  'border-orange-300 bg-orange-200 text-orange-900',
  'border-sky-300 bg-sky-200 text-sky-900',
  'border-pink-300 bg-pink-200 text-pink-900',
  'border-violet-300 bg-violet-200 text-violet-900',
  'border-amber-300 bg-amber-200 text-amber-900',
  'border-lime-300 bg-lime-200 text-lime-900',
];

const GROUP_DOTS = ['bg-rose-400', 'bg-sky-400', 'bg-amber-400', 'bg-emerald-400', 'bg-violet-400', 'bg-fuchsia-400'];

function NumberBadge({ n, className = '' }: { n: number; className?: string }) {
  return <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white ${className}`}>{n}</span>;
}

interface UnitRow { id: string; title: string; program: string }
interface MissionRow { id: string; unit_id: string; order_index: number; title: string }
interface ActRow { id: string; mission_id: string; order_index: number; title: string }

function shuffleDifferent<T>(arr: T[]): T[] {
  if (arr.length < 2) return [...arr];
  const out = [...arr];
  for (let tries = 0; tries < 10; tries++) {
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    if (out.some((v, i) => v !== arr[i])) break;
  }
  return out;
}

interface QuizItem { question: string; choices: string[]; correctIndex: number }
interface MatchItem { left: string; right: string }
interface SortGroup { name: string }
interface SortItem { text: string; groupIndex: number }
interface WordItem { word: string; hintVi: string; hintEn: string }
interface SentenceItem { sentence: string; hintVi: string; hintEn: string }

const emptyQuiz = (): QuizItem => ({ question: '', choices: ['', ''], correctIndex: 0 });
const emptyMatch = (): MatchItem => ({ left: '', right: '' });
const emptySortItem = (): SortItem => ({ text: '', groupIndex: 0 });
const emptyWord = (): WordItem => ({ word: '', hintVi: '', hintEn: '' });
const emptySentence = (): SentenceItem => ({ sentence: '', hintVi: '', hintEn: '' });

export default function CreateActivityPage() {
  const [units, setUnits] = useState<UnitRow[]>([]);
  const [missions, setMissions] = useState<MissionRow[]>([]);
  const [acts, setActs] = useState<ActRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [template, setTemplate] = useState<Template | null>(null);
  const [title, setTitle] = useState('');
  const [instruction, setInstruction] = useState('');

  const [unitId, setUnitId] = useState('');
  const [missionId, setMissionId] = useState('');
  const [actId, setActId] = useState('');
  const [newActTitle, setNewActTitle] = useState('');

  const [quizItems, setQuizItems] = useState<QuizItem[]>([emptyQuiz()]);
  const [matchItems, setMatchItems] = useState<MatchItem[]>([emptyMatch(), emptyMatch()]);
  const [sortGroups, setSortGroups] = useState<SortGroup[]>([{ name: '' }, { name: '' }]);
  const [sortItems, setSortItems] = useState<SortItem[]>([emptySortItem()]);
  const [words, setWords] = useState<WordItem[]>([emptyWord()]);
  const [sentences, setSentences] = useState<SentenceItem[]>([emptySentence()]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedTitle, setSavedTitle] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const [{ data: u }, { data: m }, { data: a }] = await Promise.all([
        supabase.from('greenleaf_units').select('id, title, program').order('order_index'),
        supabase.from('greenleaf_unit_missions').select('id, unit_id, order_index, title').order('order_index'),
        supabase.from('greenleaf_acts').select('id, mission_id, order_index, title').order('order_index'),
      ]);
      setUnits((u ?? []) as UnitRow[]);
      setMissions((m ?? []) as MissionRow[]);
      setActs((a ?? []) as ActRow[]);
      setLoading(false);
    })();
  }, []);

  useEffect(() => { if (!unitId && units.length > 0) setUnitId(units[0].id); }, [units, unitId]);
  const missionsForUnit = useMemo(() => missions.filter((m) => m.unit_id === unitId), [missions, unitId]);
  useEffect(() => { if (missionsForUnit.length > 0 && !missionsForUnit.some((m) => m.id === missionId)) setMissionId(missionsForUnit[0].id); }, [missionsForUnit, missionId]);
  const actsForMission = useMemo(() => acts.filter((a) => a.mission_id === missionId), [acts, missionId]);
  useEffect(() => { setActId(actsForMission.length > 0 ? actsForMission[0].id : '__new__'); }, [missionId, actsForMission]);

  const reset = () => {
    setTemplate(null);
    setTitle('');
    setInstruction('');
    setNewActTitle('');
    setQuizItems([emptyQuiz()]);
    setMatchItems([emptyMatch(), emptyMatch()]);
    setSortGroups([{ name: '' }, { name: '' }]);
    setSortItems([emptySortItem()]);
    setWords([emptyWord()]);
    setSentences([emptySentence()]);
    setError(null);
  };

  const save = async () => {
    setError(null);
    if (!title.trim()) { setError('Give this activity a title.'); return; }
    if (!missionId) { setError('Choose a mission.'); return; }
    if (actId === '__new__' && !newActTitle.trim()) { setError('Name the new act.'); return; }

    let taskType = '';
    let content: Record<string, unknown> = {};
    let answers: { item_key: string; answer: string }[] = [];

    if (template === 'quiz') {
      const clean = quizItems.filter((q) => q.question.trim() && q.choices.filter((c) => c.trim()).length >= 2);
      if (clean.length === 0) { setError('Add at least one question with 2+ choices.'); return; }
      taskType = 'quiz';
      content = { items: clean.map((q, i) => ({ key: `q${i + 1}`, question: q.question.trim(), choices: q.choices.map((c) => c.trim()).filter(Boolean) })) };
      answers = clean.map((q, i) => ({ item_key: `q${i + 1}`, answer: q.choices[q.correctIndex]?.trim() ?? q.choices[0].trim() }));
    } else if (template === 'match_up') {
      const clean = matchItems.filter((m) => m.left.trim() && m.right.trim());
      if (clean.length < 2) { setError('Add at least 2 keyword/definition pairs.'); return; }
      taskType = 'match_up';
      content = { items: clean.map((m, i) => ({ key: `m${i + 1}`, left: m.left.trim(), right: m.right.trim() })) };
      answers = clean.map((m, i) => ({ item_key: `m${i + 1}`, answer: m.right.trim() }));
    } else if (template === 'group_sort') {
      const cleanGroups = sortGroups.filter((g) => g.name.trim());
      const clean = sortItems.filter((it) => it.text.trim());
      if (cleanGroups.length < 2) { setError('Add at least 2 groups.'); return; }
      if (clean.length === 0) { setError('Add at least one item to sort.'); return; }
      taskType = 'group_sort';
      const groupIds = cleanGroups.map((_, i) => `g${i + 1}`);
      content = {
        groups: cleanGroups.map((g, i) => ({ id: groupIds[i], name: g.name.trim() })),
        items: clean.map((it, i) => ({ key: `i${i + 1}`, text: it.text.trim(), groupId: groupIds[Math.min(it.groupIndex, cleanGroups.length - 1)] })),
      };
      answers = clean.map((it, i) => ({ item_key: `i${i + 1}`, answer: groupIds[Math.min(it.groupIndex, cleanGroups.length - 1)] }));
    } else if (template === 'anagram') {
      const clean = words.filter((w) => w.word.trim());
      if (clean.length === 0) { setError('Add at least one word.'); return; }
      taskType = 'unscramble';
      content = {
        items: clean.map((w, i) => {
          const plain = w.word.trim().replace(/\s+/g, '');
          return {
            key: `a${i + 1}`,
            letters: shuffleDifferent(plain.split('')),
            hint: (w.hintVi.trim() || w.hintEn.trim()) ? { vi: w.hintVi.trim() || undefined, en: w.hintEn.trim() || undefined } : undefined,
          };
        }),
      };
      answers = clean.map((w, i) => ({ item_key: `a${i + 1}`, answer: w.word.trim().replace(/\s+/g, '') }));
    } else if (template === 'unjumble') {
      const clean = sentences.filter((s) => s.sentence.trim().split(/\s+/).filter(Boolean).length >= 2);
      if (clean.length === 0) { setError('Add at least one sentence of 2+ words.'); return; }
      taskType = 'unjumble';
      content = {
        items: clean.map((s, i) => {
          const tokens = s.sentence.trim().split(/\s+/);
          return {
            key: `u${i + 1}`,
            words: shuffleDifferent(tokens),
            hint: (s.hintVi.trim() || s.hintEn.trim()) ? { vi: s.hintVi.trim() || undefined, en: s.hintEn.trim() || undefined } : undefined,
          };
        }),
      };
      answers = clean.map((s, i) => ({ item_key: `u${i + 1}`, answer: s.sentence.trim().split(/\s+/).join(' ') }));
    } else {
      setError('Pick a template first.');
      return;
    }

    setSaving(true);
    const supabase = createClient();

    let targetActId = actId;
    if (actId === '__new__') {
      const nextOrder = (actsForMission.reduce((max, a) => Math.max(max, a.order_index), 0) || 0) + 1;
      const { data: act, error: actErr } = await supabase
        .from('greenleaf_acts')
        .insert({ mission_id: missionId, order_index: nextOrder, title: newActTitle.trim() })
        .select('id')
        .single();
      if (actErr || !act) { setSaving(false); setError(actErr?.message ?? 'Could not create the act.'); return; }
      targetActId = act.id;
    }

    const { data: existingTasks } = await supabase.from('greenleaf_tasks').select('order_index').eq('act_id', targetActId);
    const nextTaskOrder = ((existingTasks ?? []).reduce((max, t) => Math.max(max, t.order_index as number), 0) || 0) + 1;

    const { data: task, error: taskErr } = await supabase
      .from('greenleaf_tasks')
      .insert({ act_id: targetActId, order_index: nextTaskOrder, task_type: taskType, title: title.trim(), instruction: instruction.trim() || null, content })
      .select('id')
      .single();
    if (taskErr || !task) { setSaving(false); setError(taskErr?.message ?? 'Could not create the activity.'); return; }

    const { error: ansErr } = await supabase
      .from('greenleaf_task_answers')
      .insert(answers.map((a) => ({ task_id: task.id, item_key: a.item_key, answer: a.answer })));
    if (ansErr) { setSaving(false); setError(ansErr.message); return; }

    setSaving(false);
    setSavedTitle(title.trim());
    reset();
    // Refresh acts so the new one (if any) shows up in the destination picker next time.
    const { data: a } = await supabase.from('greenleaf_acts').select('id, mission_id, order_index, title').order('order_index');
    setActs((a ?? []) as ActRow[]);
  };

  return (
    <div className="min-h-screen gl-playful-bg px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <TeacherNav active="unit" />
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-[#3A7D44]">Create Activity</h1>
          <Link href="/teacher/unit" className="text-sm font-bold text-gray-400 hover:text-[#3A7D44]">← Back to Unit</Link>
        </div>

        {savedTitle && (
          <p role="status" className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
            “{savedTitle}” was added. Create another, or go back to Unit.
          </p>
        )}
        {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

        {!template ? (
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-gray-500">Standard templates</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTemplate(t.key)}
                  className={`rounded-3xl p-1 bg-gradient-to-br ${t.accent} text-left shadow-md transition-transform hover:-translate-y-0.5`}
                >
                  <div className="flex h-full items-start gap-3 rounded-[1.35rem] bg-white/95 p-4">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${t.accent} text-white`}>
                      {t.icon}
                    </div>
                    <div>
                      <p className="font-extrabold text-gray-800">{t.title}</p>
                      <p className="text-xs text-gray-500">{t.blurb}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ) : (
          <section className="space-y-5 rounded-3xl bg-white p-5 shadow-sm">
            {(() => {
              const t = TEMPLATES.find((x) => x.key === template)!;
              return (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${t.accent} text-white shadow-sm`}>{t.icon}</div>
                    <div>
                      <h2 className="font-extrabold text-gray-800">{t.title}</h2>
                      <p className="text-xs text-gray-500">{t.blurb}</p>
                    </div>
                  </div>
                  <button type="button" onClick={reset} className="shrink-0 text-xs font-bold text-gray-400 hover:text-gray-600">Change template</button>
                </div>
              );
            })()}

            <div className="space-y-2">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Activity title" aria-label="Activity title" className="w-full rounded-xl border px-3 py-2 text-sm font-bold" />
              <input value={instruction} onChange={(e) => setInstruction(e.target.value)} placeholder="Instruction shown to students (optional)" aria-label="Instruction" className="w-full rounded-xl border px-3 py-2 text-sm" />
            </div>

            {loading ? (
              <p className="text-sm text-gray-400">Loading units…</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-3">
                <label className="block text-xs font-bold text-gray-500">
                  <span className="mb-1 flex items-center gap-1.5"><Map className="h-3.5 w-3.5 text-emerald-500" /> Unit</span>
                  <select value={unitId} onChange={(e) => setUnitId(e.target.value)} className="w-full rounded-xl border bg-emerald-50/60 px-3 py-2 text-sm">
                    {units.map((u) => <option key={u.id} value={u.id}>{u.title}</option>)}
                  </select>
                </label>
                <label className="block text-xs font-bold text-gray-500">
                  <span className="mb-1 flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-sky-500" /> Mission</span>
                  <select value={missionId} onChange={(e) => setMissionId(e.target.value)} className="w-full rounded-xl border bg-sky-50/60 px-3 py-2 text-sm">
                    {missionsForUnit.map((m) => <option key={m.id} value={m.id}>Mission {m.order_index}: {m.title}</option>)}
                  </select>
                </label>
                <label className="block text-xs font-bold text-gray-500">
                  <span className="mb-1 flex items-center gap-1.5"><FolderOpen className="h-3.5 w-3.5 text-amber-500" /> Act</span>
                  <select value={actId} onChange={(e) => setActId(e.target.value)} className="w-full rounded-xl border bg-amber-50/60 px-3 py-2 text-sm">
                    {actsForMission.map((a) => <option key={a.id} value={a.id}>Act {a.order_index}: {a.title}</option>)}
                    <option value="__new__">+ New act…</option>
                  </select>
                </label>
              </div>
            )}
            {actId === '__new__' && (
              <input value={newActTitle} onChange={(e) => setNewActTitle(e.target.value)} placeholder="New act title (e.g. Vocabulary Games)" aria-label="New act title" className="w-full rounded-xl border px-3 py-2 text-sm" />
            )}

            <div className="border-t pt-4">
              {template === 'quiz' && (
                <div className="space-y-4">
                  {quizItems.map((q, qi) => (
                    <div key={qi} className="space-y-2.5 rounded-2xl border-2 border-violet-200 bg-violet-50/60 p-3">
                      <div className="flex items-center gap-2">
                        <NumberBadge n={qi + 1} className="bg-violet-500" />
                        <input value={q.question} onChange={(e) => setQuizItems((arr) => arr.map((x, i) => i === qi ? { ...x, question: e.target.value } : x))} placeholder={`Question ${qi + 1}`} aria-label={`Question ${qi + 1}`} className="flex-1 rounded-xl border bg-white px-3 py-2 text-sm font-bold" />
                        <button type="button" onClick={() => setQuizItems((arr) => arr.filter((_, i) => i !== qi))} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                      </div>
                      {q.choices.map((c, ci) => {
                        const isCorrect = q.correctIndex === ci;
                        return (
                          <div key={ci} className={`flex items-center gap-2 rounded-xl border-2 p-1.5 pl-3 ${isCorrect ? 'border-emerald-400 bg-emerald-50' : 'border-transparent'}`}>
                            <button type="button" onClick={() => setQuizItems((arr) => arr.map((x, i) => i === qi ? { ...x, correctIndex: ci } : x))}
                              aria-label={`Choice ${ci + 1} is correct`} aria-pressed={isCorrect}
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-black ${isCorrect ? 'border-emerald-500 bg-emerald-400 text-white' : 'border-gray-300 bg-white text-gray-300 hover:border-emerald-300'}`}
                            >✓</button>
                            <input value={c} onChange={(e) => setQuizItems((arr) => arr.map((x, i) => i === qi ? { ...x, choices: x.choices.map((cc, j) => j === ci ? e.target.value : cc) } : x))} placeholder={`Choice ${ci + 1}`} aria-label={`Choice ${ci + 1}`} className="flex-1 rounded-xl border bg-white px-3 py-1.5 text-sm" />
                            {q.choices.length > 2 && (
                              <button type="button" onClick={() => setQuizItems((arr) => arr.map((x, i) => i === qi ? { ...x, choices: x.choices.filter((_, j) => j !== ci), correctIndex: x.correctIndex >= ci ? Math.max(0, x.correctIndex - 1) : x.correctIndex } : x))} className="text-gray-300 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                            )}
                          </div>
                        );
                      })}
                      <button type="button" onClick={() => setQuizItems((arr) => arr.map((x, i) => i === qi ? { ...x, choices: [...x.choices, ''] } : x))} className="ml-9 flex items-center gap-1 text-xs font-bold text-violet-600"><Plus className="h-3.5 w-3.5" /> Add choice</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setQuizItems((arr) => [...arr, emptyQuiz()])} className="flex items-center gap-1 text-sm font-bold text-[#3A7D44]"><Plus className="h-4 w-4" /> Add question</button>
                </div>
              )}

              {template === 'match_up' && (
                <div className="space-y-2.5">
                  {matchItems.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-2xl border-2 border-fuchsia-200 bg-fuchsia-50/50 p-2">
                      <NumberBadge n={i + 1} className="bg-fuchsia-500" />
                      <input value={m.left} onChange={(e) => setMatchItems((arr) => arr.map((x, j) => j === i ? { ...x, left: e.target.value } : x))} placeholder="Keyword" aria-label={`Keyword ${i + 1}`} className="flex-1 rounded-xl border-2 border-sky-200 bg-white px-3 py-2 text-sm font-bold" />
                      <Link2 className="h-4 w-4 shrink-0 text-fuchsia-400" aria-hidden />
                      <input value={m.right} onChange={(e) => setMatchItems((arr) => arr.map((x, j) => j === i ? { ...x, right: e.target.value } : x))} placeholder="Definition" aria-label={`Definition ${i + 1}`} className="flex-1 rounded-xl border-2 border-violet-200 bg-white px-3 py-2 text-sm" />
                      {matchItems.length > 2 && (
                        <button type="button" onClick={() => setMatchItems((arr) => arr.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => setMatchItems((arr) => [...arr, emptyMatch()])} className="flex items-center gap-1 text-sm font-bold text-[#3A7D44]"><Plus className="h-4 w-4" /> Add pair</button>
                </div>
              )}

              {template === 'group_sort' && (
                <div className="space-y-4">
                  <div className="space-y-2 rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-3">
                    <p className="text-xs font-bold text-gray-500">Groups</p>
                    {sortGroups.map((g, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className={`h-3.5 w-3.5 shrink-0 rounded-full ${GROUP_DOTS[i % GROUP_DOTS.length]}`} aria-hidden />
                        <input value={g.name} onChange={(e) => setSortGroups((arr) => arr.map((x, j) => j === i ? { name: e.target.value } : x))} placeholder={`Group ${i + 1} name`} aria-label={`Group ${i + 1} name`} className="flex-1 rounded-xl border bg-white px-3 py-2 text-sm font-bold" />
                        {sortGroups.length > 2 && (
                          <button type="button" onClick={() => setSortGroups((arr) => arr.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => setSortGroups((arr) => [...arr, { name: '' }])} className="ml-5 flex items-center gap-1 text-xs font-bold text-amber-700"><Plus className="h-3.5 w-3.5" /> Add group</button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-500">Items to sort</p>
                    {sortItems.map((it, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-2xl border-2 border-gray-200 p-2">
                        <span className={`h-3.5 w-3.5 shrink-0 rounded-full ${GROUP_DOTS[it.groupIndex % GROUP_DOTS.length]}`} aria-hidden />
                        <input value={it.text} onChange={(e) => setSortItems((arr) => arr.map((x, j) => j === i ? { ...x, text: e.target.value } : x))} placeholder={`Item ${i + 1}`} aria-label={`Item ${i + 1}`} className="flex-1 rounded-xl border px-3 py-2 text-sm" />
                        <select value={it.groupIndex} onChange={(e) => setSortItems((arr) => arr.map((x, j) => j === i ? { ...x, groupIndex: Number(e.target.value) } : x))} aria-label={`Group for item ${i + 1}`} className="rounded-xl border px-2 py-2 text-sm">
                          {sortGroups.map((g, gi) => <option key={gi} value={gi}>{g.name || `Group ${gi + 1}`}</option>)}
                        </select>
                        {sortItems.length > 1 && (
                          <button type="button" onClick={() => setSortItems((arr) => arr.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => setSortItems((arr) => [...arr, emptySortItem()])} className="flex items-center gap-1 text-xs font-bold text-[#3A7D44]"><Plus className="h-3.5 w-3.5" /> Add item</button>
                  </div>
                </div>
              )}

              {template === 'anagram' && (
                <div className="space-y-2.5">
                  {words.map((w, i) => {
                    const plain = w.word.trim().replace(/\s+/g, '');
                    return (
                      <div key={i} className="space-y-2 rounded-2xl border-2 border-sky-200 bg-sky-50/50 p-3">
                        <div className="flex items-center gap-2">
                          <NumberBadge n={i + 1} className="bg-sky-500" />
                          <input value={w.word} onChange={(e) => setWords((arr) => arr.map((x, j) => j === i ? { ...x, word: e.target.value } : x))} placeholder="Word (no spaces)" aria-label={`Word ${i + 1}`} className="w-40 rounded-xl border bg-white px-3 py-2 text-sm font-bold uppercase" />
                          <input value={w.hintVi} onChange={(e) => setWords((arr) => arr.map((x, j) => j === i ? { ...x, hintVi: e.target.value } : x))} placeholder="Vietnamese hint (optional)" aria-label={`Vietnamese hint ${i + 1}`} className="flex-1 rounded-xl border bg-white px-3 py-2 text-sm" />
                          <input value={w.hintEn} onChange={(e) => setWords((arr) => arr.map((x, j) => j === i ? { ...x, hintEn: e.target.value } : x))} placeholder="English hint (optional)" aria-label={`English hint ${i + 1}`} className="flex-1 rounded-xl border bg-white px-3 py-2 text-sm" />
                          {words.length > 1 && (
                            <button type="button" onClick={() => setWords((arr) => arr.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                          )}
                        </div>
                        {plain.length > 1 && (
                          <div className="ml-9 flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-sky-400" aria-hidden />
                            <p className="text-xs font-bold text-gray-400">Students will see:</p>
                            <div className="flex flex-wrap gap-1">
                              {shuffleDifferent(plain.split('')).map((l, li) => (
                                <span key={li} className={`flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-black uppercase ${TILE_COLORS[li % TILE_COLORS.length]}`}>{l}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <button type="button" onClick={() => setWords((arr) => [...arr, emptyWord()])} className="flex items-center gap-1 text-sm font-bold text-[#3A7D44]"><Plus className="h-4 w-4" /> Add word</button>
                </div>
              )}

              {template === 'unjumble' && (
                <div className="space-y-2.5">
                  {sentences.map((s, i) => {
                    const tokens = s.sentence.trim().split(/\s+/).filter(Boolean);
                    return (
                      <div key={i} className="space-y-2 rounded-2xl border-2 border-teal-200 bg-teal-50/50 p-3">
                        <div className="flex items-center gap-2">
                          <NumberBadge n={i + 1} className="bg-teal-500" />
                          <input value={s.sentence} onChange={(e) => setSentences((arr) => arr.map((x, j) => j === i ? { ...x, sentence: e.target.value } : x))} placeholder="Sentence in correct order" aria-label={`Sentence ${i + 1}`} className="flex-1 rounded-xl border bg-white px-3 py-2 text-sm font-bold" />
                          <input value={s.hintVi} onChange={(e) => setSentences((arr) => arr.map((x, j) => j === i ? { ...x, hintVi: e.target.value } : x))} placeholder="Hint (optional)" aria-label={`Hint ${i + 1}`} className="w-40 rounded-xl border bg-white px-3 py-2 text-sm" />
                          {sentences.length > 1 && (
                            <button type="button" onClick={() => setSentences((arr) => arr.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                          )}
                        </div>
                        {tokens.length > 1 && (
                          <div className="ml-9 flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-teal-400" aria-hidden />
                            <p className="text-xs font-bold text-gray-400">Students will see:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {shuffleDifferent(tokens).map((w2, wi) => (
                                <span key={wi} className={`rounded-lg border px-2 py-1 text-xs font-black ${TILE_COLORS[wi % TILE_COLORS.length]}`}>{w2}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <button type="button" onClick={() => setSentences((arr) => [...arr, emptySentence()])} className="flex items-center gap-1 text-sm font-bold text-[#3A7D44]"><Plus className="h-4 w-4" /> Add sentence</button>
                </div>
              )}
            </div>

            <button type="button" onClick={save} disabled={saving} className="w-full rounded-xl bg-[#3A7D44] py-2.5 text-sm font-bold text-white disabled:opacity-50">
              {saving ? 'Saving…' : 'Add to Unit'}
            </button>
          </section>
        )}
      </div>
      <AppFooter />
    </div>
  );
}
