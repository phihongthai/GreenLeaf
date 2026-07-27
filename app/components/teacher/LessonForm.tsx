'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { WordsExplorerContent, PhonicsContent, SpeakingChallengeContent } from '@/lib/types';

export interface WordMeaningPair {
  word: string;
  meaning: string;
}

export interface PhonicsLineDraft {
  text: string;
  imageDescription: string;
  imageUrl: string;
}

function PhonicsLinesField({
  values,
  onChange,
  min = 1,
}: {
  values: PhonicsLineDraft[];
  onChange: (v: PhonicsLineDraft[]) => void;
  min?: number;
}) {
  return (
    <div className="space-y-3">
      {values.map((v, i) => (
        <div key={i} className="rounded-xl border border-gray-200 p-3 space-y-2">
          <div className="flex gap-2">
            <input
              value={v.text}
              onChange={(e) => onChange(values.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))}
              placeholder={`Câu ${i + 1}`}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
            />
            {values.length > min && (
              <button
                type="button"
                onClick={() => onChange(values.filter((_, j) => j !== i))}
                className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <input
            value={v.imageDescription}
            onChange={(e) => onChange(values.map((x, j) => (j === i ? { ...x, imageDescription: e.target.value } : x)))}
            placeholder="Mô tả hình ảnh minh hoạ cho câu này (không bắt buộc)"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
          />
          <input
            value={v.imageUrl}
            onChange={(e) => onChange(values.map((x, j) => (j === i ? { ...x, imageUrl: e.target.value } : x)))}
            placeholder="Link ảnh minh hoạ cho câu này (không bắt buộc)"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...values, { text: '', imageDescription: '', imageUrl: '' }])}
        className="flex items-center gap-1 text-xs font-bold text-[#3A7D44] hover:underline"
      >
        <Plus className="w-3.5 h-3.5" /> Thêm câu
      </button>
    </div>
  );
}

function WordMeaningField({
  values,
  onChange,
  min = 1,
}: {
  values: WordMeaningPair[];
  onChange: (v: WordMeaningPair[]) => void;
  min?: number;
}) {
  return (
    <div className="space-y-2">
      {values.map((v, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={v.word}
            onChange={(e) => onChange(values.map((x, j) => (j === i ? { ...x, word: e.target.value } : x)))}
            placeholder={`Từ vựng ${i + 1} (VD: apple)`}
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
          />
          <input
            value={v.meaning}
            onChange={(e) => onChange(values.map((x, j) => (j === i ? { ...x, meaning: e.target.value } : x)))}
            placeholder="Nghĩa tiếng Việt"
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
          />
          {values.length > min && (
            <button
              type="button"
              onClick={() => onChange(values.filter((_, j) => j !== i))}
              className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...values, { word: '', meaning: '' }])}
        className="flex items-center gap-1 text-xs font-bold text-[#3A7D44] hover:underline"
      >
        <Plus className="w-3.5 h-3.5" /> Thêm từ
      </button>
    </div>
  );
}

export interface LessonInitialData {
  lessonTitle: string;
  topic: string;
  words: WordMeaningPair[];
  phonicsTitle: string;
  highlight: string;
  lines: PhonicsLineDraft[];
  prompt: string;
  script: string;
  speakingImageDescription: string;
  speakingImageUrl: string;
}

export default function LessonForm({
  gradeId,
  onCreated,
  lessonId,
  initial,
  onCancel,
}: {
  gradeId: string;
  onCreated: () => void;
  lessonId?: string;
  initial?: LessonInitialData;
  onCancel?: () => void;
}) {
  const isEdit = Boolean(lessonId);
  const [lessonTitle, setLessonTitle] = useState(initial?.lessonTitle ?? '');
  const [topic, setTopic] = useState(initial?.topic ?? '');
  const [words, setWords] = useState<WordMeaningPair[]>(
    initial?.words ?? [{ word: '', meaning: '' }, { word: '', meaning: '' }, { word: '', meaning: '' }, { word: '', meaning: '' }, { word: '', meaning: '' }]
  );
  const [phonicsTitle, setPhonicsTitle] = useState(initial?.phonicsTitle ?? '');
  const [highlight, setHighlight] = useState(initial?.highlight ?? '');
  const [lines, setLines] = useState<PhonicsLineDraft[]>(
    initial?.lines ?? [
      { text: '', imageDescription: '', imageUrl: '' },
      { text: '', imageDescription: '', imageUrl: '' },
      { text: '', imageDescription: '', imageUrl: '' },
      { text: '', imageDescription: '', imageUrl: '' },
    ]
  );
  const [prompt, setPrompt] = useState(initial?.prompt ?? '');
  const [script, setScript] = useState(initial?.script ?? '');
  const [speakingImageDescription, setSpeakingImageDescription] = useState(initial?.speakingImageDescription ?? '');
  const [speakingImageUrl, setSpeakingImageUrl] = useState(initial?.speakingImageUrl ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanWords = words.map((w) => ({ word: w.word.trim(), meaning: w.meaning.trim() })).filter((w) => w.word);
    const cleanLines = lines
      .map((l) => ({ text: l.text.trim(), imageDescription: l.imageDescription.trim(), imageUrl: l.imageUrl.trim() }))
      .filter((l) => l.text);

    if (!lessonTitle.trim() || !topic.trim() || cleanWords.length === 0 || cleanLines.length === 0 || !script.trim()) {
      setError('Điền đầy đủ: tên bài học, chủ đề + ít nhất 1 từ, ít nhất 1 câu, và script Speaking Challenge.');
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const wordsContent: WordsExplorerContent = {
      topic: topic.trim(),
      words: cleanWords.map((w) => ({ word: w.word, imageUrl: '', meaning: w.meaning || undefined })),
    };
    const phonicsContent: PhonicsContent = {
      highlight: highlight.trim() || undefined,
      lines: cleanLines.map((l) => ({
        text: l.text,
        imageDescription: l.imageDescription || undefined,
        imageUrl: l.imageUrl || undefined,
      })),
    };
    const speakingContent: SpeakingChallengeContent = {
      script: script.trim(),
      prompt: prompt.trim() || undefined,
      imageDescription: speakingImageDescription.trim() || undefined,
      imageUrl: speakingImageUrl.trim() || undefined,
    };

    let targetLessonId = lessonId;

    if (isEdit && targetLessonId) {
      const { error: lessonError } = await supabase
        .from('greenleaf_lessons')
        .update({ title: lessonTitle.trim() })
        .eq('id', targetLessonId);

      if (lessonError) {
        setError('Không lưu được bài học: ' + lessonError.message);
        setSaving(false);
        return;
      }
    } else {
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
      targetLessonId = lesson.id;
    }

    const { error: missionsError } = await supabase.from('greenleaf_missions').upsert(
      [
        {
          lesson_id: targetLessonId,
          type: 'words_explorer',
          order_index: 1,
          title: `Words Explorer: ${topic.trim()}`,
          content: wordsContent,
        },
        {
          lesson_id: targetLessonId,
          type: 'phonics',
          order_index: 2,
          title: phonicsTitle.trim() || 'Phonics / Sentence Builder',
          content: phonicsContent,
        },
        {
          lesson_id: targetLessonId,
          type: 'speaking_challenge',
          order_index: 3,
          title: 'Speaking Challenge',
          content: speakingContent,
        },
      ],
      { onConflict: 'lesson_id,type' }
    );

    if (missionsError) {
      setError((isEdit ? 'Lưu bài học nhưng cập nhật mission lỗi: ' : 'Tạo bài học nhưng lưu mission lỗi: ') + missionsError.message);
      setSaving(false);
      return;
    }

    if (!isEdit) {
      setLessonTitle('');
      setTopic('');
      setWords([{ word: '', meaning: '' }, { word: '', meaning: '' }, { word: '', meaning: '' }, { word: '', meaning: '' }, { word: '', meaning: '' }]);
      setPhonicsTitle('');
      setHighlight('');
      setLines([
        { text: '', imageDescription: '', imageUrl: '' },
        { text: '', imageDescription: '', imageUrl: '' },
        { text: '', imageDescription: '', imageUrl: '' },
        { text: '', imageDescription: '', imageUrl: '' },
      ]);
      setPrompt('');
      setScript('');
      setSpeakingImageDescription('');
      setSpeakingImageUrl('');
    }
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
          <WordMeaningField values={words} onChange={setWords} />
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
          <PhonicsLinesField values={lines} onChange={setLines} />
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
          <input
            value={speakingImageDescription}
            onChange={(e) => setSpeakingImageDescription(e.target.value)}
            placeholder="Mô tả hình ảnh minh hoạ (không bắt buộc)"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
          />
          <input
            value={speakingImageUrl}
            onChange={(e) => setSpeakingImageUrl(e.target.value)}
            placeholder="Link ảnh minh hoạ (không bắt buộc)"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-[#3A7D44] hover:bg-[#2E4A34] disabled:opacity-50 text-white font-extrabold py-3 rounded-xl transition-colors"
        >
          {saving ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo bài học'}
        </button>
        {isEdit && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-500 font-extrabold py-3 rounded-xl transition-colors"
          >
            Huỷ
          </button>
        )}
      </div>
    </form>
  );
}
