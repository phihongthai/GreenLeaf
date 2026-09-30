import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Image,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { THEME } from '../lib/theme';
import { playTtsAudio, stopAudio } from '../lib/audio';
import type { LessonWithProgress, Mission, WordsExplorerContent, PhonicsContent, SpeakingChallengeContent } from '../lib/types';
import { ArrowLeft, Volume2, CheckCircle2, Award, ChevronRight } from 'lucide-react-native';

interface LessonPlayerScreenProps {
  lesson: LessonWithProgress;
  gradeCode: string;
  user: any;
  onBack: () => void;
}

export default function LessonPlayerScreen({ lesson, gradeCode, user, onBack }: LessonPlayerScreenProps) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [stepIndex, setStepIndex] = useState(0); // 0 = Intro, 1..N = Missions, N+1 = Celebration
  const [wordIndex, setWordIndex] = useState(0); // inside WordsExplorer
  const [earnedLeaves, setEarnedLeaves] = useState(0);
  const [saving, setSaving] = useState(false);

  // Load all missions for this lesson in 1 single query
  useEffect(() => {
    let active = true;
    const fetchMissions = async () => {
      try {
        const { data } = await supabase
          .from('greenleaf_missions')
          .select('*')
          .eq('lesson_id', lesson.id)
          .order('order_index');

        if (!active) return;
        const list = (data ?? []) as Mission[];
        setMissions(list);
      } catch (err) {
        console.warn('Error fetching missions:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchMissions();
    return () => {
      active = false;
      stopAudio();
    };
  }, [lesson.id]);

  const currentMission = missions[stepIndex - 1]; // stepIndex = 1 is first mission

  const handleFinishLesson = async () => {
    setSaving(true);
    stopAudio();
    try {
      const leavesToAdd = 5;
      setEarnedLeaves(leavesToAdd);

      // Record completion in Supabase
      if (missions.length > 0) {
        const progressRows = missions.map((m) => ({
          student_id: user.id,
          mission_id: m.id,
          status: 'completed',
          updated_at: new Date().toISOString(),
        }));

        await supabase.from('greenleaf_student_progress').upsert(progressRows, { onConflict: 'student_id,mission_id' });
      }

      // Update rewards
      const { data: currentReward } = await supabase
        .from('greenleaf_rewards')
        .select('leaf_count, streak_days')
        .eq('student_id', user.id)
        .maybeSingle();

      const newLeaves = (currentReward?.leaf_count ?? 0) + leavesToAdd;
      const newStreak = Math.max(1, currentReward?.streak_days ?? 1);

      await supabase.from('greenleaf_rewards').upsert({
        student_id: user.id,
        leaf_count: newLeaves,
        streak_days: newStreak,
        last_active_date: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Error saving progress:', err);
    } finally {
      setSaving(false);
      setStepIndex(missions.length + 1); // Celebration screen
    }
  };

  const handleNextStep = () => {
    stopAudio();
    if (stepIndex === 0) {
      // From Intro to first mission
      setStepIndex(1);
      setWordIndex(0);
      return;
    }

    if (currentMission?.type === 'words_explorer') {
      const words = (currentMission.content as WordsExplorerContent).words || [];
      if (wordIndex < words.length - 1) {
        setWordIndex((w) => w + 1);
        return;
      }
    }

    // Move to next mission or finish
    if (stepIndex < missions.length) {
      setStepIndex((s) => s + 1);
      setWordIndex(0);
    } else {
      handleFinishLesson();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Opening {lesson.title}...</Text>
      </SafeAreaView>
    );
  }

  // CELEBRATION SCREEN
  if (stepIndex > missions.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.celebrationBox}>
          <Image
            source={require('../../assets/leafy/act_winner2.webp')}
            style={styles.celebrationMascot}
            resizeMode="contain"
          />
          <Text style={styles.celebrationTitle}>Awesome Job!</Text>
          <Text style={styles.celebrationSub}>You finished {lesson.title}!</Text>

          <View style={styles.rewardCard}>
            <Award size={36} color={THEME.colors.streak} />
            <Text style={styles.rewardText}>+{earnedLeaves} Leaves Earned</Text>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={onBack} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Back to Journey</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // INTRO SCREEN
  if (stepIndex === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <ArrowLeft size={20} color={THEME.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>{lesson.title}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.introContent}>
          <Image
            source={require('../../assets/leafy/outfit_presenting.webp')}
            style={styles.introMascot}
            resizeMode="contain"
          />
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>
              {"Hi! Ready to practice "}
              <Text style={{ fontWeight: '800', color: THEME.colors.primary }}>{lesson.title}</Text>
              {" with Leafy?"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.listenIntroBtn}
            onPress={() => playTtsAudio(`Hi! Ready to practice ${lesson.title} with Leafy?`, gradeCode, 'words_explorer')}
          >
            <Volume2 size={20} color={THEME.colors.primary} />
            <Text style={styles.listenIntroText}>Listen to Leafy</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleNextStep} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>{"Let's Start!"}</Text>
            <ChevronRight size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // MISSION RENDERER
  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={20} color={THEME.colors.primary} />
        </TouchableOpacity>
        <View style={styles.stepperPill}>
          <Text style={styles.stepperText}>
            Step {stepIndex} of {missions.length}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.missionScroll}>
        {/* WORDS EXPLORER */}
        {currentMission?.type === 'words_explorer' && (
          <View style={styles.missionBody}>
            <Text style={styles.missionTitle}>Word Explorer</Text>
            <Text style={styles.missionSub}>Tap the speaker to hear how it sounds!</Text>

            {(() => {
              const content = currentMission.content as WordsExplorerContent;
              const currentWord = content?.words?.[wordIndex];
              if (!currentWord) return null;

              return (
                <View style={styles.wordCard}>
                  <Text style={styles.wordTitle}>{currentWord.word}</Text>
                  {currentWord.meaning ? <Text style={styles.wordMeaning}>{currentWord.meaning}</Text> : null}

                  <TouchableOpacity
                    style={styles.speakerBtn}
                    onPress={() => playTtsAudio(currentWord.word, gradeCode, 'words_explorer')}
                    activeOpacity={0.8}
                  >
                    <Volume2 size={32} color="#FFFFFF" />
                  </TouchableOpacity>

                  <Text style={styles.wordCounter}>
                    Word {wordIndex + 1} of {content.words.length}
                  </Text>
                </View>
              );
            })()}
          </View>
        )}

        {/* PHONICS CHANT */}
        {currentMission?.type === 'phonics' && (
          <View style={styles.missionBody}>
            <Text style={styles.missionTitle}>Phonics Chant</Text>
            <Text style={styles.missionSub}>Chant aloud with rhythm!</Text>

            {(() => {
              const content = currentMission.content as PhonicsContent;
              return (
                <View style={styles.phonicsBox}>
                  {content.lines.map((line, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.phonicsLine}
                      onPress={() => playTtsAudio(line.text, gradeCode, 'phonics')}
                      activeOpacity={0.7}
                    >
                      <Volume2 size={20} color={THEME.colors.primary} />
                      <Text style={styles.phonicsLineText}>{line.text}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              );
            })()}
          </View>
        )}

        {/* SPEAKING CHALLENGE */}
        {currentMission?.type === 'speaking_challenge' && (
          <View style={styles.missionBody}>
            <Text style={styles.missionTitle}>Speaking Challenge</Text>
            <Text style={styles.missionSub}>Listen and repeat the full sentence!</Text>

            {(() => {
              const content = currentMission.content as SpeakingChallengeContent;
              return (
                <View style={styles.challengeBox}>
                  <Text style={styles.challengeScript}>{content.script}</Text>

                  <TouchableOpacity
                    style={styles.speakerBtn}
                    onPress={() => playTtsAudio(content.script, gradeCode, 'speaking_challenge')}
                    activeOpacity={0.8}
                  >
                    <Volume2 size={32} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              );
            })()}
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleNextStep} activeOpacity={0.85} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View style={styles.btnRow}>
              <Text style={styles.primaryBtnText}>
                {stepIndex === missions.length &&
                (currentMission?.type !== 'words_explorer' ||
                  wordIndex === ((currentMission.content as WordsExplorerContent).words || []).length - 1)
                  ? 'Complete Lesson'
                  : 'Continue'}
              </Text>
              <CheckCircle2 size={20} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  topTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  stepperPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  stepperText: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  introContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  introMascot: {
    width: 160,
    height: 160,
    marginBottom: 20,
  },
  speechBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    maxWidth: 320,
    marginBottom: 20,
  },
  speechText: {
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    color: THEME.colors.text,
    fontWeight: '600',
  },
  listenIntroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: THEME.colors.primaryLight,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 28,
  },
  listenIntroText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.primaryDark,
  },
  missionScroll: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  missionBody: {
    alignItems: 'center',
  },
  missionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: THEME.colors.primary,
  },
  missionSub: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textMuted,
    marginTop: 4,
    marginBottom: 24,
  },
  wordCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  wordTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: THEME.colors.primary,
    marginBottom: 8,
  },
  wordMeaning: {
    fontSize: 16,
    color: THEME.colors.textMuted,
    fontWeight: '600',
    marginBottom: 20,
  },
  speakerBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  wordCounter: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    marginTop: 12,
  },
  phonicsBox: {
    width: '100%',
    gap: 12,
  },
  phonicsLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  phonicsLineText: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  challengeBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  challengeScript: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.text,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 16,
  },
  bottomBar: {
    padding: 20,
    backgroundColor: THEME.colors.background,
  },
  primaryBtn: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  celebrationBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  celebrationMascot: {
    width: 180,
    height: 180,
    marginBottom: 20,
  },
  celebrationTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: THEME.colors.primary,
    marginBottom: 8,
  },
  celebrationSub: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.textMuted,
    marginBottom: 24,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 24,
    marginBottom: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  rewardText: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.colors.streak,
  },
});
