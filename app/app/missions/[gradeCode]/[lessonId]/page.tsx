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
import MissionTransition from '@/components/missions/MissionTransition';
import MissionBriefing from '@/components/missions/MissionBriefing';
import RewardCelebration from '@/components/missions/RewardCelebration';
import { MISSION_THEME } from '@/lib/missionTheme';
import type { Mission, WordsExplorerContent, PhonicsContent, SpeakingChallengeContent } from '@/lib/types';
import type { MissionCompleteReward } from '@/lib/azure';

const MISSION_ORDER = { words_explorer: 1, phonics: 2, speaking_challenge: 3 } as const;

export default function LessonPage() {
  const params = useParams<{ gradeCode: string; lessonId: string }>();

  const [missions, setMissions] = useState<Mission[]>([]);
  const [lessonTitle, setLessonTitle] = useState('');
  const [step, setStep] = useState(0); // index into missions; missions.length = bonus/summary screen
  const [loading, setLoading] = useState(true);
  const [lastReward, setLastReward] = useState<MissionCompleteReward | null>(null);
  const [totalLeaves, setTotalLeaves] = useState(0);
  const [showBriefing, setShowBriefing] = useState(true);
  const [awaitingStart, setAwaitingStart] = useState(false);

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

  const currentTheme = !isDone ? MISSION_THEME[currentMission.type] : null;

  // Words Explorer luôn có sẵn `topic` — dùng chung làm chủ đề minh hoạ cho cả Phonics và
  // Speaking Challenge của cùng Lesson (chúng vốn được soạn từ đúng từ vựng của topic này).
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
            className="flex items-center gap-1.5 bg-white rounded-full pl-2.5 pr-3.5 py-1.5 text-sm font-bold text-[#3A7D44] shadow-sm hover:bg-emerald-50 hover:shadow transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> {lessonTitle}
          </Link>
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-1.5 shadow-sm">
            <span>🍃</span>
            <span className="font-bold text-[#2E4A34]">+{totalLeaves} Leaves</span>
          </div>
        </div>

        {!isDone && !showBriefing && !awaitingStart && currentTheme && (
          <div className={`flex items-center gap-1.5 mx-auto w-fit bg-gradient-to-r ${currentTheme.gradient} text-white text-xs font-extrabold px-4 py-1.5 rounded-full shadow-sm`}>
            <span>{currentTheme.emoji}</span> {currentTheme.label}
          </div>
        )}

        {!isDone && !showBriefing && (
          <div className="flex justify-center gap-2">
            {missions.map((m, i) => (
              <div
                key={m.id}
                className={`h-1.5 flex-1 rounded-full ${
                  i < step
                    ? 'bg-[#3A7D44]'
                    : i === step
                    ? `bg-gradient-to-r ${MISSION_THEME[m.type].gradient}`
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        )}

        {!isDone && showBriefing && (
          <MissionBriefing
            missions={missions}
            lessonTitle={lessonTitle}
            onStart={() => setShowBriefing(false)}
          />
        )}

        {!isDone && !showBriefing && awaitingStart && (
          <MissionTransition
            missions={missions}
            step={step}
            lastReward={lastReward}
            onStart={() => setAwaitingStart(false)}
          />
        )}

        {!isDone && !showBriefing && !awaitingStart && currentMission.type === 'words_explorer' && (
          <WordsExplorer
            missionId={currentMission.id}
            content={currentMission.content as WordsExplorerContent}
            gradeCode={params.gradeCode}
            onComplete={handleMissionComplete}
          />
        )}
        {!isDone && !showBriefing && !awaitingStart && currentMission.type === 'phonics' && (
          <PhonicsChant
            missionId={currentMission.id}
            content={currentMission.content as PhonicsContent}
            title={currentMission.title}
            gradeCode={params.gradeCode}
            topic={lessonTopic}
            onComplete={handleMissionComplete}
          />
        )}
        {!isDone && !showBriefing && !awaitingStart && currentMission.type === 'speaking_challenge' && (
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
