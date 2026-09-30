import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { THEME, LESSON_GRADIENTS, getLessonEmoji } from '../lib/theme';
import type { Grade, Lesson, LessonWithProgress, WordsExplorerContent } from '../lib/types';
import { CheckCircle2, Flame, LogOut } from 'lucide-react-native';
import MysteryBox from '../components/MysteryBox';

interface StudentHomeScreenProps {
  user: any;
  onLogout: () => void;
  onSelectLesson: (lesson: LessonWithProgress, gradeCode: string) => void;
}

export default function StudentHomeScreen({ user, onLogout, onSelectLesson }: StudentHomeScreenProps) {
  const [grade, setGrade] = useState<Grade | null>(null);
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [leafCount, setLeafCount] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      // 1. Fetch student profile and grade
      const { data: profile } = await supabase
        .from('greenleaf_profiles')
        .select('grade:greenleaf_grades(*)')
        .eq('id', user.id)
        .single();

      const userGrade = (profile as any)?.grade as Grade | null;
      setGrade(userGrade);

      // 2. Fetch rewards
      const { data: rewardData } = await supabase
        .from('greenleaf_rewards')
        .select('leaf_count, streak_days')
        .eq('student_id', user.id)
        .maybeSingle();

      setLeafCount(rewardData?.leaf_count ?? 0);
      setStreakDays(rewardData?.streak_days ?? 0);

      if (!userGrade) {
        setLessons([]);
        setLoading(false);
        return;
      }

      // 3. Batch fetch lessons
      const { data: lessonsData } = await supabase
        .from('greenleaf_lessons')
        .select('*')
        .eq('grade_id', userGrade.id)
        .order('order_index');

      const lessonsList = (lessonsData as Lesson[]) ?? [];
      const lessonIds = lessonsList.map((l) => l.id);

      if (lessonIds.length === 0) {
        setLessons([]);
        setLoading(false);
        return;
      }

      // 4. Batch fetch missions
      const { data: missionsData } = await supabase
        .from('greenleaf_missions')
        .select('id, lesson_id, type, content')
        .in('lesson_id', lessonIds);

      const allMissions = (missionsData ?? []) as any[];
      const allMissionIds = allMissions.map((m) => m.id);

      // 5. Batch fetch completed missions for user
      let completedSet = new Set<string>();
      if (allMissionIds.length > 0) {
        const { data: progressData } = await supabase
          .from('greenleaf_student_progress')
          .select('mission_id')
          .eq('student_id', user.id)
          .eq('status', 'completed')
          .in('mission_id', allMissionIds);

        completedSet = new Set((progressData ?? []).map((p) => p.mission_id));
      }

      // Group by lesson
      const missionsByLesson = new Map<string, any[]>();
      for (const m of allMissions) {
        const arr = missionsByLesson.get(m.lesson_id) ?? [];
        arr.push(m);
        missionsByLesson.set(m.lesson_id, arr);
      }

      const listWithProgress: LessonWithProgress[] = lessonsList.map((l) => {
        const ms = missionsByLesson.get(l.id) ?? [];
        const wordsMission = ms.find((m) => m.type === 'words_explorer');
        const topic = (wordsMission?.content as WordsExplorerContent | undefined)?.topic ?? l.title;
        const completed = ms.filter((m) => completedSet.has(m.id)).length;
        return {
          ...l,
          totalMissions: ms.length,
          completedMissions: completed,
          topic,
        };
      });

      setLessons(listWithProgress);
    } catch (err) {
      console.warn('Error loading home data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerPills}>
          {streakDays > 0 ? (
            <View style={styles.streakPill}>
              <Flame size={18} color={THEME.colors.streak} />
              <Text style={styles.streakText}>{streakDays}</Text>
            </View>
          ) : null}

          <View style={styles.leavesPill}>
            <Text style={styles.leafIcon}>🍃</Text>
            <Text style={styles.leavesText}>{leafCount} Leaves</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.7}>
          <LogOut size={18} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME.colors.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Grade Banner */}
        {grade ? (
          <LinearGradient
            colors={[THEME.colors.primary, THEME.colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradeBanner}
          >
            <View style={styles.bannerTextCol}>
              <Text style={styles.gradeName}>{grade.name}</Text>
              <Text style={styles.gradeSub}>Pick a lesson below to practice!</Text>
            </View>
            <Image
              source={require('../../assets/leafy/hero_wave.webp')}
              style={styles.bannerMascot}
              resizeMode="contain"
            />
          </LinearGradient>
        ) : null}

        {/* Mystery Box Reward */}
        <MysteryBox userId={user.id} leafCount={leafCount} />

        {/* Lesson Path Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Learning Journey</Text>
          <Text style={styles.sectionSub}>Duolingo-style lesson path</Text>
        </View>

        {/* Loading Spinner */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={THEME.colors.primary} />
            <Text style={styles.loadingText}>Loading your lessons...</Text>
          </View>
        ) : null}

        {/* Lessons List */}
        {!loading && lessons.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No lessons available for your level yet.</Text>
          </View>
        ) : null}

        {!loading &&
          lessons.map((lesson, index) => {
            const isDone = lesson.totalMissions > 0 && lesson.completedMissions >= lesson.totalMissions;
            const gradient = LESSON_GRADIENTS[index % LESSON_GRADIENTS.length];
            const ratio = lesson.totalMissions > 0 ? (lesson.completedMissions / lesson.totalMissions) * 100 : 0;

            return (
              <TouchableOpacity
                key={lesson.id}
                style={[styles.lessonCard, isDone && styles.lessonCardDone]}
                activeOpacity={0.85}
                onPress={() => onSelectLesson(lesson, grade?.code || 'kids1')}
              >
                {/* Lesson Icon */}
                <LinearGradient
                  colors={isDone ? ['#34D399', '#059669'] : gradient}
                  style={styles.lessonIconBadge}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.lessonEmoji}>{getLessonEmoji(lesson.topic)}</Text>
                  {isDone ? (
                    <View style={styles.checkBadge}>
                      <CheckCircle2 size={18} color="#059669" />
                    </View>
                  ) : null}
                </LinearGradient>

                {/* Lesson Content */}
                <View style={styles.lessonDetails}>
                  <Text style={styles.lessonTitle}>
                    Lesson {index + 1}: {lesson.title}
                  </Text>

                  {/* Progress Bar */}
                  <View style={styles.progressBarBg}>
                    <LinearGradient
                      colors={isDone ? ['#34D399', '#059669'] : gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressBarFill, { width: `${Math.max(8, ratio)}%` }]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {lesson.completedMissions}/{lesson.totalMissions} missions completed
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  streakText: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.streak,
  },
  leavesPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  leafIcon: {
    fontSize: 16,
  },
  leavesText: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  logoutBtn: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 110,
  },
  gradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 28,
    padding: 20,
    marginBottom: 24,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  bannerTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  gradeName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  gradeSub: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
  },
  bannerMascot: {
    width: 70,
    height: 70,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  sectionSub: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textMuted,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textMuted,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  lessonCardDone: {
    borderLeftColor: THEME.colors.primary,
  },
  lessonIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  lessonEmoji: {
    fontSize: 32,
  },
  checkBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 2,
  },
  lessonDetails: {
    flex: 1,
    gap: 6,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textMuted,
  },
});
