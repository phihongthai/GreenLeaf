import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { THEME } from '../lib/theme';
import type { Grade } from '../lib/types';
import { LogOut, Check } from 'lucide-react-native';

export default function ProfileScreen({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [grades, setGrades] = useState<Grade[]>([]);
  const [gradeId, setGradeId] = useState('');
  const [leafCount, setLeafCount] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingGrade, setSavingGrade] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: profile }, { data: gradesData }, { data: reward }] = await Promise.all([
          supabase.from('greenleaf_profiles').select('name, username, grade_id').eq('id', user.id).single(),
          supabase.from('greenleaf_grades').select('*').order('order_index'),
          supabase.from('greenleaf_rewards').select('leaf_count, streak_days').eq('student_id', user.id).maybeSingle(),
        ]);

        setName(profile?.name || 'Student');
        setUsername(profile?.username || user.email?.split('@')[0] || '');
        setGradeId(profile?.grade_id || '');
        setGrades(gradesData || []);
        setLeafCount(reward?.leaf_count || 0);
        setStreakDays(reward?.streak_days || 0);
      } catch (err) {
        console.warn('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user.id]);

  const handleChangeGrade = async (newId: string) => {
    if (newId === gradeId) return;
    setSavingGrade(true);
    try {
      await supabase.from('greenleaf_profiles').update({ grade_id: newId }).eq('id', user.id);
      setGradeId(newId);
      Alert.alert('Updated', 'Learning level changed successfully!');
    } catch {
      Alert.alert('Error', 'Could not update level. Please try again.');
    } finally {
      setSavingGrade(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Student Profile</Text>

        {loading ? (
          <ActivityIndicator size="large" color={THEME.colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Avatar & Info */}
            <View style={styles.profileCard}>
              <Image
                source={require('../../assets/leafy/emo_happy2.webp')}
                style={styles.avatar}
                resizeMode="contain"
              />
              <Text style={styles.studentName}>{name}</Text>
              <Text style={styles.studentUser}>@{username}</Text>

              <View style={styles.pillsRow}>
                <View style={styles.statPill}>
                  <Text style={{ fontSize: 16 }}>🍃</Text>
                  <Text style={styles.statPillText}>{leafCount} Leaves</Text>
                </View>

                <View style={styles.statPill}>
                  <Text style={{ fontSize: 16 }}>🔥</Text>
                  <Text style={styles.statPillText}>{streakDays} Days Streak</Text>
                </View>
              </View>
            </View>

            {/* Level / Grade Selection */}
            <Text style={styles.sectionTitle}>Learning Level</Text>
            <View style={styles.gradeList}>
              {grades.map((g) => {
                const isSelected = g.id === gradeId;
                return (
                  <TouchableOpacity
                    key={g.id}
                    style={[styles.gradeItem, isSelected && styles.gradeItemSelected]}
                    onPress={() => handleChangeGrade(g.id)}
                    disabled={savingGrade}
                    activeOpacity={0.8}
                  >
                    <View style={styles.gradeInfo}>
                      <Text style={[styles.gradeName, isSelected && styles.gradeNameSelected]}>{g.name}</Text>
                      <Text style={styles.gradeAge}>{g.age_range}</Text>
                    </View>
                    {isSelected && (
                      <View style={styles.checkIcon}>
                        <Check size={18} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.85}>
              <LogOut size={20} color="#DC2626" />
              <Text style={styles.logoutBtnText}>Log Out Account</Text>
            </TouchableOpacity>
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
    marginBottom: 20,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    marginBottom: 12,
  },
  studentName: {
    fontSize: 22,
    fontWeight: '900',
    color: THEME.colors.text,
  },
  studentUser: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textMuted,
    marginTop: 2,
    marginBottom: 16,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statPillText: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.text,
    marginBottom: 12,
  },
  gradeList: {
    gap: 10,
    marginBottom: 28,
  },
  gradeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  gradeItemSelected: {
    borderColor: THEME.colors.primary,
    backgroundColor: '#F0FDF4',
  },
  gradeInfo: {
    gap: 2,
  },
  gradeName: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  gradeNameSelected: {
    color: THEME.colors.primary,
  },
  gradeAge: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textMuted,
  },
  checkIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 20,
    paddingVertical: 16,
  },
  logoutBtnText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '800',
  },
});
