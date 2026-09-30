import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { THEME } from '../lib/theme';
import { Award, CheckCircle, BookOpen } from 'lucide-react-native';

export default function JourneyScreen({ user }: { user: any }) {
  const [growthScore, setGrowthScore] = useState(0);
  const [leafCount, setLeafCount] = useState(0);
  const [missionsCount, setMissionsCount] = useState(0);
  const [homeworkCount, setHomeworkCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ count: mCount }, { count: hCount }, { data: reward }] = await Promise.all([
          supabase.from('greenleaf_student_progress').select('id', { count: 'exact', head: true }).eq('student_id', user.id).eq('status', 'completed'),
          supabase.from('greenleaf_homework_submissions').select('id', { count: 'exact', head: true }).eq('student_id', user.id),
          supabase.from('greenleaf_rewards').select('leaf_count').eq('student_id', user.id).maybeSingle(),
        ]);

        const missions = mCount ?? 0;
        const homework = hCount ?? 0;
        setMissionsCount(missions);
        setHomeworkCount(homework);
        setGrowthScore(missions + homework);
        setLeafCount(reward?.leaf_count ?? 0);
      } catch (err) {
        console.warn('Error loading journey:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user.id]);

  // Determine tree emoji and stage
  const treeStage = growthScore < 3 ? '🌱 Seedling' : growthScore < 10 ? '🌿 Young Tree' : growthScore < 25 ? '🌳 Great Oak' : '👑 Ancient Forest';
  const treeEmoji = growthScore < 3 ? '🌱' : growthScore < 10 ? '🌿' : growthScore < 25 ? '🌳' : '🌲';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Learning Journey</Text>
        <Text style={styles.headerSub}>Watch your English tree grow with every lesson!</Text>

        {loading ? (
          <ActivityIndicator size="large" color={THEME.colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Tree Stage Card */}
            <View style={styles.treeCard}>
              <Text style={styles.treeIcon}>{treeEmoji}</Text>
              <Text style={styles.stageTitle}>{treeStage}</Text>
              <Text style={styles.stageScore}>Growth Score: {growthScore} XP</Text>

              <View style={styles.leavesBadge}>
                <Text style={{ fontSize: 18 }}>🍃</Text>
                <Text style={styles.leavesText}>{leafCount} Total Leaves</Text>
              </View>
            </View>

            {/* Stats Breakdown */}
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <CheckCircle size={28} color={THEME.colors.primary} />
                <Text style={styles.statValue}>{missionsCount}</Text>
                <Text style={styles.statLabel}>Missions Done</Text>
              </View>

              <View style={styles.statBox}>
                <BookOpen size={28} color={THEME.colors.accentBlue} />
                <Text style={styles.statValue}>{homeworkCount}</Text>
                <Text style={styles.statLabel}>Homework Done</Text>
              </View>

              <View style={styles.statBox}>
                <Award size={28} color={THEME.colors.streak} />
                <Text style={styles.statValue}>{growthScore}</Text>
                <Text style={styles.statLabel}>Total Stars</Text>
              </View>
            </View>
          </>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 110,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: THEME.colors.primary,
  },
  headerSub: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textMuted,
    marginTop: 4,
    marginBottom: 20,
  },
  treeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 20,
  },
  treeIcon: {
    fontSize: 88,
    marginBottom: 12,
  },
  stageTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: THEME.colors.primary,
  },
  stageScore: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    marginTop: 4,
    marginBottom: 16,
  },
  leavesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: THEME.colors.primaryLight,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  leavesText: {
    fontSize: 15,
    fontWeight: '900',
    color: THEME.colors.primaryDark,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: THEME.colors.text,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    textAlign: 'center',
  },
});
