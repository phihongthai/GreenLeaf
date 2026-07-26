'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { WordsExplorerContent, PhonicsContent, SpeakingChallengeContent } from '@/lib/types';

function ListField({
  values,
  onChange,
  placeholder,
  min = 1,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  min?: number;
}) {
  return (
    <div className="space-y-2">
      {values.map((v, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={v}
            onChange={(e) => onChange(values.map((x, j) => (j === i ? e.target.value : x)))}
            placeholder={`${placeholder} ${i + 1}`}
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
          />
          {values.length > min && (
            <button
              type="button"
              onClick={() => onChange(values.filter((_, j) => j !== i))}
              className="text-gray-300 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...values, ''])}
        className="flex items-center gap-1 text-xs font-bold text-[#3A7D44] hover:underline"
      >
        <Plus className="w-3.5 h-3.5" /> Thêm dòng
      </button>
    </div>
  );
}

export default function LessonForm({ gradeId, onCreated }: { gradeId: string; onCreated: () => void }) {
  const [lessonTitle, setLessonTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [words, setWords] = useState(['', '', '', '', '']);
  const [phonicsTitle, setPhonicsTitle] = useState('');
  const [highlight, setHighlight] = useState('');
  const [lines, setLines] = useState(['', '', '', '']);
  const [prompt, setPrompt] = useState('');
  const [script, setScript] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanWords = words.map((w) => w.trim()).filter(Boolean);
    const cleanLines = lines.map((l) => l.trim()).filter(Boolean);

    if (!lessonTitle.trim() || !topic.trim() || cleanWords.length === 0 || cleanLines.length === 0 || !script.trim()) {
      setError('Điền đầy đủ: tên bài học, chủ đề + ít nhất 1 từ, ít nhất 1 câu, và script Speaking Challenge.');
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { count } = await supabase
      .from('greenleaf_lessons')
      .select('id', { count: 'exact', head: true })
      .eq('grade_id', gradeId);

    const { data: lesson, error: lessonError } = await supabase
      .from('greenleaf_lessons')
      .insert({ grade_id: gradeId, title: lessonTitle.trim(), order_index: (count ?? 0) + 1, created_by: user?.id })
      .select('id')
      .single();

    if (lessonError || !lesson) {
      setError('Không tạo được bài học: ' + (lessonError?.message ?? 'lỗi không xác định'));
      setSaving(false);
      return;
    }

    const wordsContent: WordsExplorerContent = {
      topic: topic.trim(),
      words: cleanWords.map((w) => ({ word: w, imageUrl: '' })),
    };
    const phonicsContent: PhonicsContent = {
      highlight: highlight.trim() || undefined,
      lines: cleanLines,
    };
    const speakingContent: SpeakingChallengeContent = {
      script: script.trim(),
      prompt: prompt.trim() || undefined,
    };

    const { error: missionsError } = await supabase.from('greenleaf_missions').insert([
      {
        lesson_id: lesson.id,
        type: 'words_explorer',
        order_index: 1,
        title: `Words Explorer: ${topic.trim()}`,
        content: wordsContent,
      },
      {
        lesson_id: lesson.id,
        type: 'phonics',
        order_index: 2,
        title: phonicsTitle.trim() || 'Phonics / Sentence Builder',
        content: phonicsContent,
      },
      {
        lesson_id: lesson.id,
        type: 'speaking_challenge',
        order_index: 3,
        title: 'Speaking Challenge',
        content: speakingContent,
      },
    ]);

    if (missionsError) {
      setError('Tạo bài học nhưng lưu mission lỗi: ' + missionsError.message);
      setSaving(false);
      return;
    }

    setLessonTitle('');
    setTopic('');
    setWords(['', '', '', '', '']);
    setPhonicsTitle('');
    setHighlight('');
    setLines(['', '', '', '']);
    setPrompt('');
    setScript('');
    setSaving(false);
    onCreated();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">Tên bài học</label>
        <input
          value={lessonTitle}
          onChange={(e) => setLessonTitle(e.target.value)}
          placeholder="VD: Unit 4 — Weather"
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
        />
      </div>

      <div className="rounded-2xl p-1 bg-gradient-to-br from-sky-400 to-blue-500">
        <div className="bg-white/95 rounded-[1rem] p-4 space-y-3">
          <p className="font-extrabold text-sm text-[#2E4A34]">1️⃣ Words Explorer</p>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Chủ đề (VD: Weather)"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
          />
          <ListField values={words} onChange={setWords} placeholder="Từ vựng" />
        </div>
      </div>

      <div className="rounded-2xl p-1 bg-gradient-to-br from-violet-400 to-purple-500">
        <div className="bg-white/95 rounded-[1rem] p-4 space-y-3">
          <p className="font-extrabold text-sm text-[#2E4A34]">2️⃣ Phonics / Sentence Builder</p>
          <input
            value={phonicsTitle}
            onChange={(e) => setPhonicsTitle(e.target.value)}
            placeholder="Tiêu đề (VD: Phonics /w/)"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
          />
          <input
            value={highlight}
            onChange={(e) => setHighlight(e.target.value)}
            placeholder="Âm cần highlight (không bắt buộc, VD: w)"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
          />
          <ListField values={lines} onChange={setLines} placeholder="Câu" />
        </div>
      </div>

      <div className="rounded-2xl p-1 bg-gradient-to-br from-teal-500 to-cyan-600">
        <div className="bg-white/95 rounded-[1rem] p-4 space-y-3">
          <p className="font-extrabold text-sm text-[#2E4A34]">3️⃣ Speaking Challenge</p>
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Gợi ý đề bài (không bắt buộc)"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
          />
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            rows={3}
            placeholder="Toàn bộ script học sinh sẽ đọc"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-[#3A7D44] hover:bg-[#2E4A34] disabled:opacity-50 text-white font-extrabold py-3 rounded-xl transition-colors"
      >
        {saving ? 'Đang tạo...' : 'Tạo bài học'}
      </button>
    </form>
  );
}
