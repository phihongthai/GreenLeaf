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
import { supabase } from '../lib/supabase';
import { THEME } from '../lib/theme';
import { playTtsAudio, stopAudio } from '../lib/audio';
import { assessPronunciationNative, type PronunciationResult } from '../lib/assess';
import AudioRecorderButton from '../components/AudioRecorderButton';
import ScoreDisplay from '../components/ScoreDisplay';
import type { LessonWithProgress, Mission, WordsExplorerContent, PhonicsContent, SpeakingChallengeContent } from '../lib/types';
import { ArrowLeft, Volume2, CheckCircle2, Award, ChevronRight, RotateCcw } from 'lucide-react-native';

const PASS_THRESHOLD = 80;
const MAX_ATTEMPTS = 3;

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
  const [phonicsLineIndex, setPhonicsLineIndex] = useState(0);

  // Assessment & Recording state
  const [assessing, setAssessing] = useState(false);
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [attempts, setAttempts] = useState(0);

  // Saving state
  const [earnedLeaves, setEarnedLeaves] = useState(0);
  const [saving, setSaving] = useState(false);

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
        setMissions((data ?? []) as Mission[]);
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

  const currentMission = missions[stepIndex - 1];
  const passed = result ? result.overallScore >= PASS_THRESHOLD : false;
  const canSkip = !passed && attempts >= MAX_ATTEMPTS;

  // Auto-pronounce when opening or switching step, word, or line
  useEffect(() => {
    if (stepIndex <= 0 || !currentMission) return;

    setResult(null);
    setAttempts(0);

    const timer = setTimeout(() => {
      if (currentMission.type === 'words_explorer') {
        const words = (currentMission.content as WordsExplorerContent).words || [];
        const currentWord = words[wordIndex];
        if (currentWord?.word) {
          playTtsAudio(currentWord.word, gradeCode, 'words_explorer');
        }
      } else if (currentMission.type === 'phonics') {
        const lines = (currentMission.content as PhonicsContent).lines || [];
        const currentLine = lines[phonicsLineIndex];
        if (currentLine?.text) {
          playTtsAudio(currentLine.text, gradeCode, 'phonics');
        }
      } else if (currentMission.type === 'speaking_challenge') {
        const content = currentMission.content as SpeakingChallengeContent;
        if (content?.script) {
          playTtsAudio(content.script, gradeCode, 'speaking_challenge');
        }
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      stopAudio();
    };
  }, [stepIndex, wordIndex, phonicsLineIndex, currentMission]);

  const handleRecordingFinished = async (audioUri: string) => {
    stopAudio();
    setAssessing(true);

    let targetText = '';
    if (currentMission?.type === 'words_explorer') {
      const words = (currentMission.content as WordsExplorerContent).words || [];
      targetText = words[wordIndex]?.word || '';
    } else if (currentMission?.type === 'phonics') {
      const lines = (currentMission.content as PhonicsContent).lines || [];
      targetText = lines[phonicsLineIndex]?.text || '';
    } else if (currentMission?.type === 'speaking_challenge') {
      targetText = (currentMission.content as SpeakingChallengeContent).script || '';
    }

    try {
      const res = await assessPronunciationNative(audioUri, targetText);
      setResult(res);

      if (res.overallScore >= PASS_THRESHOLD) {
        // Praise
        playTtsAudio('Awesome job! That was fantastic!', gradeCode);
      } else {
        setAttempts((a) => a + 1);
      }
    } catch (err) {
      console.warn('Assessment error:', err);
    } finally {
      setAssessing(false);
    }
  };

  const handleFinishLesson = async () => {
    setSaving(true);
    stopAudio();
    try {
      const leavesToAdd = 5;
      setEarnedLeaves(leavesToAdd);

      if (missions.length > 0) {
        const progressRows = missions.map((m) => ({
          student_id: user.id,
          mission_id: m.id,
          status: 'completed',
          updated_at: new Date().toISOString(),
        }));

        await supabase.from('greenleaf_student_progress').upsert(progressRows, { onConflict: 'student_id,mission_id' });
      }

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
      setStepIndex(missions.length + 1);
    }
  };

  const handleNextStep = () => {
    stopAudio();
    setResult(null);
    setAttempts(0);

    if (stepIndex === 0) {
      setStepIndex(1);
      setWordIndex(0);
      setPhonicsLineIndex(0);
      return;
    }

    if (currentMission?.type === 'words_explorer') {
      const words = (currentMission.content as WordsExplorerContent).words || [];
      if (wordIndex < words.length - 1) {
        setWordIndex((w) => w + 1);
        return;
      }
    }

    if (currentMission?.type === 'phonics') {
      const lines = (currentMission.content as PhonicsContent).lines || [];
      if (phonicsLineIndex < lines.length - 1) {
        setPhonicsLineIndex((l) => l + 1);
        return;
      }
    }

    if (stepIndex < missions.length) {
      setStepIndex((s) => s + 1);
      setWordIndex(0);
      setPhonicsLineIndex(0);
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
          <Text style={styles.celebrationSub}>You completed {lesson.title}!</Text>

          <View style={styles.rewardCard}>
            <Award size={36} color={THEME.colors.streak} />
            <Text style={styles.rewardText}>+{earnedLeaves} Leaves Earned</Text>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={onBack} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Back to Learning Path</Text>
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
              {"Hi! Let's practice "}
              <Text style={{ fontWeight: '800', color: THEME.colors.primary }}>{lesson.title}</Text>
              {" together!"}
            </Text>
          </View>

          <View style={styles.actionCueBanner}>
            <View style={styles.actionCueItem}>
              <Text style={styles.actionCueEmoji}>🎧</Text>
              <Text style={styles.actionCueText}>Listen</Text>
            </View>
            <Text style={styles.actionCueArrow}>➔</Text>
            <View style={styles.actionCueItem}>
              <Text style={styles.actionCueEmoji}>🗣️</Text>
              <Text style={styles.actionCueText}>Say it!</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleNextStep} activeOpacity={0.85}>
            <View style={styles.btnRow}>
              <Text style={styles.primaryBtnText}>{"GO! 🚀"}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // MISSION SCREEN
  return (
    <SafeAreaView style={styles.container}>
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

      <ScrollView contentContainerStyle={styles.missionScroll} showsVerticalScrollIndicator={false}>
        {/* WORDS EXPLORER */}
        {currentMission?.type === 'words_explorer' && (() => {
          const content = currentMission.content as WordsExplorerContent;
          const currentWord = content.words[wordIndex];
          if (!currentWord) return null;

          return (
            <View style={styles.missionBody}>
              <Text style={styles.missionTitle}>Word Explorer</Text>
              <Text style={styles.missionSub}>Listen, then speak into the microphone!</Text>

              <View style={styles.wordCard}>
                <Text style={styles.wordTitle}>{currentWord.word}</Text>
                {currentWord.meaning ? <Text style={styles.wordMeaning}>{currentWord.meaning}</Text> : null}

                <TouchableOpacity
                  style={styles.speakerBtn}
                  onPress={() => playTtsAudio(currentWord.word, gradeCode)}
                  activeOpacity={0.8}
                >
                  <Volume2 size={32} color="#FFFFFF" />
                </TouchableOpacity>

                {/* Recorder */}
                <AudioRecorderButton onRecordingFinished={handleRecordingFinished} busy={assessing} />

                {/* Score */}
                {result && <ScoreDisplay result={result} />}

                <Text style={styles.wordCounter}>
                  Word {wordIndex + 1} of {content.words.length}
                </Text>
              </View>
            </View>
          );
        })()}

        {/* PHONICS CHANT */}
        {currentMission?.type === 'phonics' && (() => {
          const content = currentMission.content as PhonicsContent;
          const currentLine = content.lines[phonicsLineIndex];
          if (!currentLine) return null;

          return (
            <View style={styles.missionBody}>
              <Text style={styles.missionTitle}>Phonics Chant</Text>
              <Text style={styles.missionSub}>Listen and chant along!</Text>

              <View style={styles.wordCard}>
                <Text style={[styles.wordTitle, { fontSize: 26, textAlign: 'center' }]}>{currentLine.text}</Text>

                <TouchableOpacity
                  style={styles.speakerBtn}
                  onPress={() => playTtsAudio(currentLine.text, gradeCode)}
                  activeOpacity={0.8}
                >
                  <Volume2 size={32} color="#FFFFFF" />
                </TouchableOpacity>

                <AudioRecorderButton onRecordingFinished={handleRecordingFinished} busy={assessing} />

                {result && <ScoreDisplay result={result} />}

                <Text style={styles.wordCounter}>
                  Line {phonicsLineIndex + 1} of {content.lines.length}
                </Text>
              </View>
            </View>
          );
        })()}

        {/* SPEAKING CHALLENGE */}
        {currentMission?.type === 'speaking_challenge' && (() => {
          const content = currentMission.content as SpeakingChallengeContent;

          return (
            <View style={styles.missionBody}>
              <Text style={styles.missionTitle}>Speaking Challenge</Text>
              <Text style={styles.missionSub}>Pronounce the complete sentence clearly!</Text>

              <View style={styles.wordCard}>
                <Text style={[styles.wordTitle, { fontSize: 22, textAlign: 'center', lineHeight: 32 }]}>
                  {content.script}
                </Text>

                <TouchableOpacity
                  style={styles.speakerBtn}
                  onPress={() => playTtsAudio(content.script, gradeCode)}
                  activeOpacity={0.8}
                >
                  <Volume2 size={32} color="#FFFFFF" />
                </TouchableOpacity>

                <AudioRecorderButton onRecordingFinished={handleRecordingFinished} busy={assessing} />

                {result && <ScoreDisplay result={result} />}
              </View>
            </View>
          );
        })()}
      </ScrollView>

      {/* Bottom Continue / Retry / Skip Button */}
      <View style={styles.bottomBar}>
        {passed || canSkip ? (
          <TouchableOpacity style={styles.primaryBtn} onPress={handleNextStep} activeOpacity={0.85} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.btnRow}>
                <Text style={styles.primaryBtnText}>
                  {passed ? 'Great! Continue' : 'Skip & Continue'}
                </Text>
                <CheckCircle2 size={20} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.hintBox}>
            <Text style={styles.hintText}>
              {attempts > 0 ? `Score: ${result?.overallScore || 0}/100. Tap mic to retry!` : 'Tap the microphone to practice speaking'}
            </Text>
          </View>
        )}
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
  actionCueBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
    borderColor: '#A7F3D0',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  actionCueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionCueEmoji: {
    fontSize: 24,
  },
  actionCueText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#065F46',
  },
  actionCueArrow: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10B981',
  },
  missionScroll: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
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
    marginBottom: 20,
    textAlign: 'center',
  },
  wordCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
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
    marginBottom: 6,
  },
  wordMeaning: {
    fontSize: 16,
    color: THEME.colors.textMuted,
    fontWeight: '600',
    marginBottom: 14,
  },
  speakerBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
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
  hintBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hintText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textMuted,
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
