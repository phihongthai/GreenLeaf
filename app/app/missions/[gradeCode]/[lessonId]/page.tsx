'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import BraveMascot from '@/components/mascot/BraveMascot';
import WordsExplorer from '@/components/missions/WordsExplorer';
import PhonicsChant from '@/components/missions/PhonicsChant';
import SpeakingChallenge from '@/components/missions/SpeakingChallenge';
import type { Mission, WordsExplorerContent, PhonicsContent, SpeakingChallengeContent } from '@/lib/types';
import type { MissionCompleteReward } from '@/lib/azure';

const MISSION_ORDER = { words_explorer: 1, phonics: 2, speaking_challenge: 3 } as const;

export default function LessonPage() {
  const params = useParams<{ gradeCode: string; lessonId: string }>();
  const router = useRouter();

  const [missions, setMissions] = useState<Mission[]>([]);
  const [lessonTitle, setLessonTitle] = useState('');
  const [step, setStep] = useState(0); // index into missions; missions.length = bonus/summary screen
  const [loading, setLoading] = useState(true);
  const [lastReward, setLastReward] = useState<MissionCompleteReward | null>(null);
  const [totalLeaves, setTotalLeaves] = useState(0);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: lesson } = await supabase
        .from('greenleaf_lessons')
        .select('id, title')
        .eq('id', params.lessonId)
        .single();

      if (!lesson) {
        setLoading(false);
        return;
      }
      setLessonTitle(lesson.title);

      const { data: missionsData } = await supabase
        .from('greenleaf_missions')
        .select('*')
        .eq('lesson_id', lesson.id);

      const sorted = ((missionsData as Mission[]) ?? []).sort(
        (a, b) => MISSION_ORDER[a.type] - MISSION_ORDER[b.type]
      );
      setMissions(sorted);
      setLoading(false);
    };
    load();
  }, [params.lessonId]);

  const handleMissionComplete = (reward: MissionCompleteReward) => {
    setLastReward(reward);
    setTotalLeaves((t) => t + reward.leavesEarned);
    setStep((s) => s + 1);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Đang tải...</div>;
  }

  if (missions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-400">
        <p>Chưa có nội dung cho bài học này.</p>
        <Link href={`/missions/${params.gradeCode}`} className="text-[#3A7D44] font-semibold hover:underline">← Về danh sách bài học</Link>
      </div>
    );
  }

  const isDone = step >= missions.length;
  const currentMission = missions[step];

  return (
    <div className="min-h-screen gl-playful-bg px-4 py-8">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href={`/missions/${params.gradeCode}`}
            className="flex items-center gap-1.5 bg-white rounded-full pl-2.5 pr-3.5 py-1.5 text-sm font-bold text-[#3A7D44] shadow-sm hover:bg-emerald-50 hover:shadow transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> {lessonTitle}
          </Link>
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-1.5 shadow-sm">
            <span>🍃</span>
            <span className="font-bold text-[#2E4A34]">+{totalLeaves} Leaves</span>
          </div>
        </div>

        {!isDone && (
          <div className="flex justify-center gap-2">
            {missions.map((m, i) => (
              <div
                key={m.id}
                className={`h-1.5 flex-1 rounded-full ${i < step ? 'bg-[#3A7D44]' : i === step ? 'bg-[#C9A876]' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        )}

        {!isDone && currentMission.type === 'words_explorer' && (
          <WordsExplorer
            missionId={currentMission.id}
            content={currentMission.content as WordsExplorerContent}
            onComplete={handleMissionComplete}
          />
        )}
        {!isDone && currentMission.type === 'phonics' && (
          <PhonicsChant
            missionId={currentMission.id}
            content={currentMission.content as PhonicsContent}
            title={currentMission.title}
            onComplete={handleMissionComplete}
          />
        )}
        {!isDone && currentMission.type === 'speaking_challenge' && (
          <SpeakingChallenge
            missionId={currentMission.id}
            content={currentMission.content as SpeakingChallengeContent}
            onComplete={handleMissionComplete}
          />
        )}

        {isDone && (
          <div className="bg-white rounded-3xl shadow-sm p-8 text-center space-y-4">
            <BraveMascot size="lg" message={lastReward?.bonusAwarded ? 'Awesome! You completed all 3 missions!' : 'Well done!'} />
            <div className="space-y-1">
              <p className="text-2xl font-extrabold text-[#2E4A34]">+{totalLeaves} 🍃</p>
              {lastReward?.bonusAwarded && <p className="text-sm text-[#C9A876] font-bold">+3 Leaves Bonus!</p>}
              {lastReward && lastReward.streakDays > 1 && (
                <p className="text-xs text-gray-400">🔥 Streak: {lastReward.streakDays} ngày</p>
              )}
            </div>
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <button
                onClick={() => router.push(`/missions/${params.gradeCode}`)}
                className="bg-[#3A7D44] hover:bg-[#2E4A34] text-white font-bold py-2.5 px-6 rounded-xl transition-colors"
              >
                Bài học khác
              </button>
              <Link
                href="/journey"
                className="bg-white border border-[#3A7D44] text-[#3A7D44] font-bold py-2.5 px-6 rounded-xl transition-colors"
              >
                Xem cây 🌳
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
