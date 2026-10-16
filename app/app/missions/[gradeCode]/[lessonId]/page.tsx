'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import FloatingDecor from '@/components/decor/FloatingDecor';
import SceneBackground from '@/components/decor/SceneBackground';
import WordsExplorer from '@/components/missions/WordsExplorer';
import PhonicsChant from '@/components/missions/PhonicsChant';
import SpeakingChallenge from '@/components/missions/SpeakingChallenge';
import MissionCelebration from '@/components/missions/MissionCelebration';
import MissionIntro from '@/components/missions/MissionIntro';
import RewardCelebration from '@/components/missions/RewardCelebration';
import { playCelebration } from '@/lib/celebrationSound';
import { stopTTS } from '@/lib/tts';
import { MISSION_THEME } from '@/lib/missionTheme';
import type { Mission, WordsExplorerContent, PhonicsContent, SpeakingChallengeContent } from '@/lib/types';
import type { MissionCompleteReward } from '@/lib/azure';

const MISSION_ORDER = { words_explorer: 1, phonics: 2, speaking_challenge: 3 } as const;

// In-memory cache for instant lesson transitions
const lessonDetailCache = new Map<string, { lessonTitle: string; missions: Mission[] }>();

export default function LessonPage() {
  const params = useParams<{ gradeCode: string; lessonId: string }>();

  const cached = params.lessonId ? lessonDetailCache.get(params.lessonId) : undefined;
  const [missions, setMissions] = useState<Mission[]>(cached?.missions ?? []);
  const [lessonTitle, setLessonTitle] = useState(cached?.lessonTitle ?? '');
  const [isLocked, setIsLocked] = useState(false);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(!cached);
  const [lastReward, setLastReward] = useState<MissionCompleteReward | null>(null);
  const [totalLeaves, setTotalLeaves] = useState(0);
  const [awaitingStart, setAwaitingStart] = useState(true);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!params.lessonId) return;
      if (!lessonDetailCache.has(params.lessonId)) {
        setLoading(true);
      }
      const supabase = createClient();
      const { data: lesson, error: lessonError } = await supabase
        .from('greenleaf_lessons')
        .select('*')
        .eq('id', params.lessonId)
        .maybeSingle();

      if (!lesson || lessonError) {
        if (active) setLoading(false);
        return;
      }

      // Check if unlocked:
      // 1. First lesson is always unlocked
      // 2. Explicitly unlocked by teacher (if column exists)
      // 3. Or student completed the previous lesson (order_index - 1)
      let isUnlocked = (lesson as { is_unlocked?: boolean }).is_unlocked ?? (lesson.order_index === 1);

      if (!isUnlocked && lesson.order_index > 1) {
        // Find previous lesson in the same grade
        const { data: prevLesson } = await supabase
          .from('greenleaf_lessons')
          .select('id')
          .eq('grade_id', lesson.grade_id)
          .eq('order_index', lesson.order_index - 1)
          .maybeSingle();

        if (prevLesson) {
          // Check if all missions of previous lesson are completed
          const [{ count: totalPrevMissions }, { data: { user } }] = await Promise.all([
            supabase.from('greenleaf_missions').select('id', { count: 'exact', head: true }).eq('lesson_id', prevLesson.id),
            supabase.auth.getUser(),
          ]);

          if (user && (totalPrevMissions ?? 0) > 0) {
            const { count: completedPrevMissions } = await supabase
              .from('greenleaf_student_progress')
              .select('id, greenleaf_missions!inner(lesson_id)', { count: 'exact', head: true })
              .eq('student_id', user.id)
              .eq('status', 'completed')
              .eq('greenleaf_missions.lesson_id', prevLesson.id);

            if ((completedPrevMissions ?? 0) >= (totalPrevMissions ?? 0)) {
              isUnlocked = true;
            }
          }
        }
      }

      if (!isUnlocked && lesson.order_index > 1) {
        if (!active) return;
        setIsLocked(true);
        setLessonTitle(lesson.title);
        setLoading(false);
        return;
      }

      const { data: missionsData } = await supabase
        .from('greenleaf_missions')
        .select('*')
        .eq('lesson_id', lesson.id);

      const sorted = ((missionsData as Mission[]) ?? []).sort(
        (a, b) => MISSION_ORDER[a.type] - MISSION_ORDER[b.type]
      );

      if (!active) return;
      lessonDetailCache.set(params.lessonId, { lessonTitle: lesson.title, missions: sorted });
      setLessonTitle(lesson.title);
      setMissions(sorted);
      setLoading(false);
    };
    load();
    return () => {
      active = false;
      stopTTS();
    };
  }, [params.lessonId]);

  const handleMissionComplete = (reward: MissionCompleteReward) => {
    stopTTS();
    playCelebration();
    setLastReward(reward);
    setTotalLeaves((t) => t + reward.leavesEarned);
    setStep((s) => s + 1);
    setCelebrating(true);
    setAwaitingStart(true);
  };

  if (loading) {
    return (
      <div className="relative min-h-screen gl-playful-bg flex flex-col items-center justify-center gap-3">
        <SceneBackground />
        <div className="text-4xl animate-bounce">🍃</div>
        <p className="text-sm font-bold text-[#3A7D44]">Opening lesson...</p>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="relative min-h-screen gl-playful-bg flex flex-col items-center justify-center p-4 text-center">
        <SceneBackground />
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-4 border-2 border-emerald-100 z-10 gl-pop-in">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-gray-800">Lesson Locked!</h2>
          <p className="text-sm font-semibold text-gray-600 leading-relaxed">
            Your teacher will open <strong className="text-emerald-700">{lessonTitle}</strong> when your class is ready!
          </p>
          <div className="pt-2">
            <Link
              href={`/missions/${params.gradeCode}`}
              className="inline-block w-full bg-[#3A7D44] hover:bg-[#2D5A34] text-white font-extrabold py-3.5 rounded-2xl text-sm transition-all shadow-md"
            >
              Back to Journey Map 🗺️
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (missions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-400">
        <p>No content for this lesson yet.</p>
        <Link href={`/missions/${params.gradeCode}`} className="text-[#3A7D44] font-semibold hover:underline">← Back to lessons</Link>
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
            onClick={() => stopTTS()}
            className="flex items-center gap-1.5 bg-white rounded-full pl-3 pr-4 py-2 text-base font-extrabold text-[#3A7D44] shadow-sm hover:bg-emerald-50 hover:shadow transition-all"
          >
            <ArrowLeft className="w-5 h-5" /> {lessonTitle}
          </Link>
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md">
            <span className="text-lg">🍃</span>
            <span className="font-extrabold text-base text-[#3A7D44]">+{totalLeaves} Leaves</span>
          </div>
        </div>

        {!isDone && !awaitingStart && (
          /* Three mission steps shown as tabs instead of thin bars — young students
             need to see which part they're on and how many are left. */
          <ol className="flex gap-2" aria-label="Lesson parts">
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
                    <span className="text-[11px] font-extrabold leading-tight">{theme.label}</span>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {celebrating && lastReward && (
          <MissionCelebration
            key={`celeb-${step}`}
            missions={missions}
            completedStep={step - 1}
            reward={lastReward}
            gradeCode={params.gradeCode}
            onContinue={() => setCelebrating(false)}
          />
        )}

        {!celebrating && !isDone && awaitingStart && (
          <MissionIntro
            key={`intro-${step}`}
            missions={missions}
            step={step}
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

        {!celebrating && isDone && (
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
