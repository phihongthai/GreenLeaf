'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { PronunciationResult, WordResult } from '@/lib/azure';
import { toIPA } from '@/lib/phoneme';

interface ScoreDisplayProps {
  result: PronunciationResult;
  onWordClick?: (word: WordResult) => void;
  praisePhrase?: string | null;
}

function scoreGradient(score: number) {
  if (score >= 80) return 'from-emerald-400 to-green-500';
  if (score >= 60) return 'from-amber-400 to-yellow-500';
  return 'from-red-400 to-rose-500';
}

function scoreBg(score: number) {
  if (score >= 80) return 'bg-emerald-50 border-emerald-200';
  if (score >= 60) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
}

function phonemeColor(score: number) {
  if (score >= 80) return 'bg-emerald-100 text-emerald-700 border-emerald-300';
  if (score >= 60) return 'bg-amber-100 text-amber-700 border-amber-300';
  return 'bg-red-100 text-red-600 border-red-300';
}

function ScoreCard({ label, score, icon }: { label: string; score: number; icon: string }) {
  return (
    <div className={`rounded-2xl border p-3 text-center ${scoreBg(score)}`}>
      <div className={`text-xl font-extrabold bg-gradient-to-br ${scoreGradient(score)} bg-clip-text text-transparent`}>
        {Math.round(score)}
      </div>
      <div className="text-lg">{icon}</div>
      <div className="text-xs text-gray-500 font-bold leading-tight mt-0.5">{label}</div>
    </div>
  );
}

function WordChip({ word, onClick }: { word: WordResult; onClick: () => void }) {
  const isOmitted = word.errorType === 'Omission';
  const hasPhonemes = word.phonemes.length > 0;
  const avgScore = hasPhonemes
    ? word.phonemes.reduce((s, p) => s + p.accuracyScore, 0) / word.phonemes.length
    : 100;

  return (
    <button
      onClick={onClick}
      title="Click to see details"
      className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-sm cursor-pointer ${
        isOmitted
          ? 'border-red-200 bg-red-50'
          : avgScore >= 80
          ? 'border-emerald-200 bg-emerald-50 hover:border-emerald-300'
          : avgScore >= 60
          ? 'border-amber-200 bg-amber-50 hover:border-amber-300'
          : 'border-red-200 bg-red-50 hover:border-red-300'
      }`}
    >
      <span className={`text-sm font-bold ${isOmitted ? 'line-through text-gray-400' : 'text-[#3A7D44]'}`}>
        {word.word}
      </span>
      {!isOmitted && hasPhonemes && (
        <div className="flex flex-wrap justify-center gap-0.5">
          {word.phonemes.map((p, i) => (
            <span key={i} className={`text-xs font-mono px-1 rounded border ${phonemeColor(p.accuracyScore)}`}>
              {toIPA(p.phoneme)}
            </span>
          ))}
        </div>
      )}
      {isOmitted && <span className="text-xs text-red-400 font-bold">skipped</span>}
    </button>
  );
}

export default function ScoreDisplay({ result, onWordClick, praisePhrase }: ScoreDisplayProps) {
  const [showDetail, setShowDetail] = useState(false);
  const overall = Math.round(
    (result.accuracyScore + result.fluencyScore + result.completenessScore + result.prosodyScore) / 4
  );
  const passed = overall >= 80;

  return (
    <div className="space-y-5">
      {/* Leafy stands next to the score: smiles when passing, thinks when not —
          young readers instantly understand the result from the expression. */}
      <div className="flex items-center justify-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={passed ? '/leafy/emo_happy2.webp' : '/leafy/emo_thinking2.webp'}
          alt=""
          aria-hidden
          className={`h-24 w-auto shrink-0 drop-shadow-md ${passed ? 'gl-bounce-jump' : 'gl-float'}`}
        />
        <div className="flex flex-col items-center gap-2">
          <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${scoreGradient(overall)} flex items-center justify-center shadow-lg`}>
            <span className="text-3xl font-extrabold text-white">{overall}</span>
          </div>
          <span className={`text-sm font-bold ${passed ? 'text-emerald-600' : 'text-amber-600'}`}>
            {passed ? `🎉 ${praisePhrase || 'Well done!'}` : '💪 Try again!'}
          </span>
        </div>
      </div>

      {passed && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 text-sm text-emerald-700 font-semibold text-center">
          Great reading! Keep it up! 🌟
        </div>
      )}

      <div className="grid grid-cols-4 gap-2">
        <ScoreCard label="Accuracy" score={result.accuracyScore} icon="🎯" />
        <ScoreCard label="Fluency" score={result.fluencyScore} icon="🌊" />
        <ScoreCard label="Completeness" score={result.completenessScore} icon="✅" />
        <ScoreCard label="Prosody" score={result.prosodyScore} icon="🎵" />
      </div>

      {result.words.length > 0 && (
        <div>
          <button
            onClick={() => setShowDetail((v) => !v)}
            className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-[#3A7D44] transition-colors"
          >
            View phoneme details (advanced) <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDetail ? 'rotate-180' : ''}`} />
          </button>
          {showDetail && (
            <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-2xl mt-2">
              {result.words.map((w, i) => (
                <WordChip key={i} word={w} onClick={() => onWordClick?.(w)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
