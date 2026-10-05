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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { THEME, getLessonEmoji } from '../lib/theme';
import type { Grade, Lesson, LessonWithProgress, WordsExplorerContent } from '../lib/types';
import { CheckCircle2, Flame, LogOut, Lock, Sparkles, Gift } from 'lucide-react-native';
import MysteryBox from '../components/MysteryBox';

interface StudentHomeScreenProps {
  user: any;
  onLogout: () => void;
  onSelectLesson: (lesson: LessonWithProgress, gradeCode: string) => void;
}

const NODE_ALIGNMENTS: ('center' | 'flex-start' | 'flex-end')[] = [
  'center',
  'flex-start',
  'center',
  'flex-end',
];

export default function StudentHomeScreen({ user, onLogout, onSelectLesson }: StudentHomeScreenProps) {
  const [grade, setGrade] = useState<Grade | null>(null);
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [leafCount, setLeafCount] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      // 1. Fetch user profile
      const { data: profile } = await supabase
        .from('greenleaf_profiles')
        .select('grade_id')
        .eq('id', user.id)
        .single();

      let targetGradeId = profile?.grade_id;

      // Fallback grade if none assigned
      if (!targetGradeId) {
        const { data: firstGrade } = await supabase
          .from('greenleaf_grades')
          .select('id')
          .order('order_index')
          .limit(1)
          .single();
        targetGradeId = firstGrade?.id;
      }

      if (!targetGradeId) {
        setLoading(false);
        return;
      }

      // 2. Fetch Grade and Rewards in parallel
      const [{ data: userGrade }, { data: rewardData }] = await Promise.all([
        supabase.from('greenleaf_grades').select('*').eq('id', targetGradeId).single(),
        supabase.from('greenleaf_rewards').select('leaf_count, streak_days').eq('student_id', user.id).maybeSingle(),
      ]);

      if (userGrade) setGrade(userGrade);
      if (rewardData) {
        setLeafCount(rewardData.leaf_count || 0);
        setStreakDays(rewardData.streak_days || 0);
      }

      // 3. Fetch lessons for this grade
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

  // Determine lesson states: completed, current, locked
  let currentFound = false;
  const lessonStates = lessons.map((l) => {
    const isDone = l.totalMissions > 0 && l.completedMissions >= l.totalMissions;
    const isUnlocked = l.is_unlocked ?? (l.order_index === 1);

    if (isDone) return 'completed';
    if (isUnlocked && !currentFound) {
      currentFound = true;
      return 'current';
    }
    if (!isUnlocked) return 'locked';
    return 'available';
  });

  const handlePressLesson = (lesson: LessonWithProgress, state: string) => {
    if (state === 'locked') {
      Alert.alert(
        '🔒 Lesson Locked',
        `Your teacher will unlock "${lesson.title}" when your class is ready! Keep practicing your open lessons! 🍃`,
        [{ text: 'Got it!' }]
      );
      return;
    }
    onSelectLesson(lesson, grade?.code || 'kids1');
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
              <Text style={styles.gradeSub}>Explore the learning adventure trail!</Text>
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
          <Text style={styles.sectionTitle}>Adventure Journey Map</Text>
          <Text style={styles.sectionSub}>Follow the mushroom trail with Leafy!</Text>
        </View>

        {/* Loading Spinner */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={THEME.colors.primary} />
            <Text style={styles.loadingText}>Loading journey map...</Text>
          </View>
        ) : null}

        {/* Empty state */}
        {!loading && lessons.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No lessons available for your level yet.</Text>
          </View>
        ) : null}

        {/* Journey Map Trail */}
        {!loading && lessons.length > 0 && (
          <View style={styles.trailContainer}>
            {lessons.map((lesson, index) => {
              const state = lessonStates[index];
              const isDone = state === 'completed';
              const isCurrent = state === 'current';
              const isLocked = state === 'locked';
              const alignment = NODE_ALIGNMENTS[index % NODE_ALIGNMENTS.length];

              return (
                <View key={lesson.id} style={styles.nodeWrapper}>
                  {/* Trail Dashed Connector */}
                  {index < lessons.length - 1 && (
                    <View style={styles.trailConnector} />
                  )}

                  {/* Milestone after every 3 lessons */}
                  {index > 0 && index % 3 === 0 && (
                    <View style={styles.milestoneRow}>
                      <LinearGradient
                        colors={['#F59E0B', '#EA580C']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.milestoneBadge}
                      >
                        <Gift size={18} color="#FFFFFF" />
                        <Text style={styles.milestoneText}>Mystery Chest Milestone!</Text>
                        <Sparkles size={16} color="#FEF08A" />
                      </LinearGradient>
                    </View>
                  )}

                  {/* Mushroom Node Item */}
                  <View style={[styles.nodeRow, { alignItems: alignment }]}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => handlePressLesson(lesson, state)}
                      style={[styles.mushroomContainer, isCurrent && styles.mushroomCurrentGlow]}
                    >
                      {/* Leafy Start Here Pill */}
                      {isCurrent && (
                        <View style={styles.startBadge}>
                          <Text style={styles.startBadgeEmoji}>🍃</Text>
                          <Text style={styles.startBadgeText}>Start Here!</Text>
                        </View>
                      )}

                      {/* Mushroom Cap */}
                      <LinearGradient
                        colors={
                          isDone
                            ? ['#34D399', '#059669']
                            : isCurrent
                            ? ['#FBBF24', '#10B981']
                            : ['#CBD5E1', '#94A3B8']
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.mushroomCap, isLocked && styles.mushroomCapLocked]}
                      >
                        <Text style={[styles.mushroomEmoji, isLocked && styles.mushroomEmojiLocked]}>
                          {getLessonEmoji(lesson.topic)}
                        </Text>

                        {/* Status Overlay Badges */}
                        {isDone && (
                          <View style={styles.completedBadge}>
                            <CheckCircle2 size={20} color="#059669" />
                          </View>
                        )}
                        {isLocked && (
                          <View style={styles.lockOverlay}>
                            <View style={styles.lockBadge}>
                              <Lock size={18} color="#F59E0B" />
                            </View>
                          </View>
                        )}
                        {isCurrent && (
                          <View style={styles.sparkleBadge}>
                            <Sparkles size={16} color="#FFFFFF" />
                          </View>
                        )}
                      </LinearGradient>

                      {/* Mushroom Stem / Label Pill */}
                      <View
                        style={[
                          styles.stemPill,
                          isDone
                            ? styles.stemPillDone
                            : isCurrent
                            ? styles.stemPillCurrent
                            : styles.stemPillLocked,
                        ]}
                      >
                        <Text
                          style={[
                            styles.stemTitle,
                            isDone
                              ? styles.stemTitleDone
                              : isCurrent
                              ? styles.stemTitleCurrent
                              : styles.stemTitleLocked,
                          ]}
                          numberOfLines={1}
                        >
                          Lesson {index + 1}: {lesson.title}
                        </Text>
                        {isDone ? (
                          <Text style={styles.stemSubDone}>✓ Completed • Replay</Text>
                        ) : isLocked ? (
                          <Text style={styles.stemSubLocked}>🔒 Locked by Teacher</Text>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
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
    marginBottom: 20,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  bannerTextCol: {
    flex: 1,
    gap: 4,
  },
  gradeName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  gradeSub: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D1FAE5',
  },
  bannerMascot: {
    width: 72,
    height: 72,
  },
  sectionHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
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
  trailContainer: {
    position: 'relative',
    paddingVertical: 10,
  },
  nodeWrapper: {
    position: 'relative',
    marginBottom: 32,
  },
  trailConnector: {
    position: 'absolute',
    top: 70,
    left: '50%',
    width: 2,
    height: 48,
    borderLeftWidth: 3,
    borderLeftColor: '#A7F3D0',
    borderStyle: 'dashed',
    zIndex: 0,
  },
  milestoneRow: {
    alignItems: 'center',
    marginBottom: 24,
    zIndex: 2,
  },
  milestoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  milestoneText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  nodeRow: {
    width: '100%',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  mushroomContainer: {
    alignItems: 'center',
  },
  mushroomCurrentGlow: {
    transform: [{ scale: 1.05 }],
  },
  startBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.primaryDark,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  startBadgeEmoji: {
    fontSize: 12,
  },
  startBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  mushroomCap: {
    width: 86,
    height: 86,
    borderRadius: 43,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    position: 'relative',
  },
  mushroomCapLocked: {
    opacity: 0.85,
  },
  mushroomEmoji: {
    fontSize: 38,
  },
  mushroomEmojiLocked: {
    opacity: 0.4,
  },
  completedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    borderRadius: 43,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkleBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  stemPill: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    alignItems: 'center',
    maxWidth: 220,
  },
  stemPillDone: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  stemPillCurrent: {
    backgroundColor: '#047857',
    borderWidth: 1,
    borderColor: '#34D399',
  },
  stemPillLocked: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stemTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  stemTitleDone: {
    color: '#065F46',
  },
  stemTitleCurrent: {
    color: '#FFFFFF',
  },
  stemTitleLocked: {
    color: '#94A3B8',
  },
  stemSubDone: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
    marginTop: 1,
  },
  stemSubLocked: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 1,
  },
});
