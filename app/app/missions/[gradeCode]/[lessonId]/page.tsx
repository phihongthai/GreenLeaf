'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import FloatingDecor from '@/components/decor/FloatingDecor';
import SceneBackground from '@/components/decor/SceneBackground';
import WordsExplorer from '@/components/missions/WordsExplorer';
import PhonicsChant from '@/components/missions/PhonicsChant';
import SpeakingChallenge from '@/components/missions/SpeakingChallenge';
import MissionIntro from '@/components/missions/MissionIntro';
import RewardCelebration from '@/components/missions/RewardCelebration';
import { playCelebration } from '@/lib/celebrationSound';
import { MISSION_THEME } from '@/lib/missionTheme';
import type { Mission, WordsExplorerContent, PhonicsContent, SpeakingChallengeContent } from '@/lib/types';
import type { MissionCompleteReward } from '@/lib/azure';

const MISSION_ORDER = { words_explorer: 1, phonics: 2, speaking_challenge: 3 } as const;

export default function LessonPage() {
  const params = useParams<{ gradeCode: string; lessonId: string }>();

  const [missions, setMissions] = useState<Mission[]>([]);
  const [lessonTitle, setLessonTitle] = useState('');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastReward, setLastReward] = useState<MissionCompleteReward | null>(null);
  const [totalLeaves, setTotalLeaves] = useState(0);
  const [awaitingStart, setAwaitingStart] = useState(true);

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
    playCelebration();
    setLastReward(reward);
    setTotalLeaves((t) => t + reward.leavesEarned);
    setStep((s) => s + 1);
    setAwaitingStart(true);
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

  const wordsExplorerMission = missions.find((m) => m.type === 'words_explorer');
  const lessonTopic = wordsExplorerMission ? (wordsExplorerMission.content as WordsExplorerContent).topic : undefined;

  return (
    <div className="relative min-h-screen gl-playful-bg px-4 py-8">
      <SceneBackground />
      <FloatingDecor />
      <div className="relative max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/grades"
            className="flex items-center gap-1.5 bg-white rounded-full pl-3 pr-4 py-2 text-base font-extrabold text-[#3A7D44] shadow-sm hover:bg-emerald-50 hover:shadow transition-all"
          >
            <ArrowLeft className="w-5 h-5" /> {lessonTitle}
          </Link>
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md">
            <span className="text-lg">🍃</span>
            <span className="font-extrabold text-base text-[#3A7D44]">+{totalLeaves} Lá</span>
          </div>
        </div>

        {!isDone && !awaitingStart && (
          /* Ba chặng của bài học hiện rõ thành tab thay vì 3 vạch mảnh — học sinh
             nhỏ cần thấy mình đang ở phần nào và còn mấy phần nữa. */
          <ol className="flex gap-2" aria-label="Các phần của bài học">
            {missions.map((m, i) => {
              const theme = MISSION_THEME[m.type];
              const done = i < step;
              const active = i === step;
              return (
                <li key={m.id} className="flex-1">
                  <div
                    aria-current={active ? 'step' : undefined}
                    className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2.5 text-center transition-all ${
                      active
                        ? `bg-gradient-to-br ${theme.gradient} text-white shadow-md`
                        : done
                        ? 'bg-gl-green-light text-gl-green-dark'
                        : 'bg-white/70 text-gl-muted'
                    }`}
                  >
                    <span className="text-lg leading-none" aria-hidden>
                      {done ? '✅' : theme.emoji}
                    </span>
                    <span className="text-[11px] font-extrabold leading-tight">{theme.labelVi}</span>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {!isDone && awaitingStart && (
          <MissionIntro
            key={`intro-${step}`}
            missions={missions}
            step={step}
            lastReward={lastReward}
            gradeCode={params.gradeCode}
            onStart={() => setAwaitingStart(false)}
          />
        )}

        {!isDone && !awaitingStart && currentMission.type === 'words_explorer' && (
          <WordsExplorer
            missionId={currentMission.id}
            content={currentMission.content as WordsExplorerContent}
            gradeCode={params.gradeCode}
            onComplete={handleMissionComplete}
          />
        )}
        {!isDone && !awaitingStart && currentMission.type === 'phonics' && (
          <PhonicsChant
            missionId={currentMission.id}
            content={currentMission.content as PhonicsContent}
            title={currentMission.title}
            gradeCode={params.gradeCode}
            topic={lessonTopic}
            onComplete={handleMissionComplete}
          />
        )}
        {!isDone && !awaitingStart && currentMission.type === 'speaking_challenge' && (
          <SpeakingChallenge
            missionId={currentMission.id}
            content={currentMission.content as SpeakingChallengeContent}
            gradeCode={params.gradeCode}
            topic={lessonTopic}
            onComplete={handleMissionComplete}
          />
        )}

        {isDone && (
          <RewardCelebration
            totalLeaves={totalLeaves}
            lastReward={lastReward}
            gradeCode={params.gradeCode}
          />
        )}
      </div>
    </div>
  );
}
