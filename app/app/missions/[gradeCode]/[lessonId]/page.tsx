'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { fetchLessonAccess } from '@/lib/lessonAccess';
import FloatingDecor from '@/components/decor/FloatingDecor';
import SceneBackground from '@/components/decor/SceneBackground';
import WordsExplorer from '@/components/missions/WordsExplorer';
import PhonicsChant from '@/components/missions/PhonicsChant';
import SpeakingChallenge from '@/components/missions/SpeakingChallenge';
import MissionCelebration from '@/components/missions/MissionCelebration';
import FitToScreen from '@/components/missions/FitToScreen';
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
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const accessOverride = currentUser ? (await fetchLessonAccess(supabase, currentUser.id)).get(lesson.id) : undefined;
      let isUnlocked = accessOverride ?? (lesson as { is_unlocked?: boolean }).is_unlocked ?? (lesson.order_index === 1);

      if (accessOverride === undefined && !isUnlocked && lesson.order_index > 1) {
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

      if (!isUnlocked && (lesson.order_index > 1 || accessOverride === false)) {
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
    <div
      className="relative h-[100dvh] overflow-hidden gl-playful-bg px-4 py-3"
      style={{ height: 'calc(100dvh - env(safe-area-inset-top))' }}
    >
      <SceneBackground />
      <FloatingDecor />
      <div className="relative max-w-xl mx-auto h-full flex flex-col gap-3">
        <div className="shrink-0 space-y-3">
        {/* Top Header: Back Button & Total Leaves with 3D game badges */}
        <div className="flex items-center justify-between">
          <Link
            href="/grades"
            onClick={() => stopTTS()}
            className="group flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-full pl-3.5 pr-5 py-2.5 text-sm md:text-base font-black text-emerald-900 shadow-[0_6px_16px_rgba(46,74,52,0.1),0_2px_0_#A7F3D0] hover:bg-emerald-50 hover:-translate-y-0.5 active:translate-y-0.5 transition-all border-2 border-emerald-100"
          >
            <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:-translate-x-0.5 transition-transform">
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
            </span>
            <span>{lessonTitle || 'Lesson'}</span>
          </Link>

          <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-white rounded-full pl-3.5 pr-4 py-2 shadow-[0_6px_16px_rgba(16,185,129,0.25),0_2px_0_#065F46] border border-emerald-300">
            <span className="text-xl animate-bounce">🍃</span>
            <span className="font-black text-sm md:text-base tracking-wide">+{totalLeaves} Leaves</span>
          </div>
        </div>

        {!isDone && !awaitingStart && (
          /* Three mission steps shown as rich 3D game tabs with progress indicators */
          <ol className="flex gap-2.5 p-1.5 bg-white/70 backdrop-blur-md rounded-2xl border-2 border-emerald-100 shadow-sm" aria-label="Lesson parts">
            {missions.map((m, i) => {
              const theme = MISSION_THEME[m.type];
              const done = i < step;
              const active = i === step;
              return (
                <li key={m.id} className="flex-1">
                  <div
                    aria-current={active ? 'step' : undefined}
                    className={`relative flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-center transition-all ${
                      active
                        ? `bg-gradient-to-b ${theme.gradient} text-white shadow-md shadow-emerald-700/20 scale-102 ring-2 ring-white`
                        : done
                        ? 'bg-emerald-100/80 text-emerald-800'
                        : 'bg-white/50 text-gray-400 opacity-60'
                    }`}
                  >
                    <span className="text-xl leading-none drop-shadow-xs" aria-hidden>
                      {done ? '✅' : theme.emoji}
                    </span>
                    <span className="text-[11px] font-black leading-tight tracking-tight">
                      {theme.label}
                    </span>
                    {active && (
                      <span className="absolute -bottom-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white animate-ping" />
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        </div>

        <FitToScreen>
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
        </FitToScreen>
      </div>
    </div>
  );
}
