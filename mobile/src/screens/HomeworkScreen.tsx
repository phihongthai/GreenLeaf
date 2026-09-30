import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { THEME } from '../lib/theme';
import { PenLine, CheckCircle2, Clock } from 'lucide-react-native';

interface Assignment {
  id: string;
  due_date: string | null;
  topic: { title: string; prompt: string; grade_id: string } | null;
}

interface Submission {
  assignment_id: string;
  content_text: string;
  status: 'submitted' | 'graded';
}

export default function HomeworkScreen({ user }: { user: any }) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const loadHomework = async () => {
    try {
      const { data: profile } = await supabase.from('greenleaf_profiles').select('grade_id').eq('id', user.id).single();
      if (!profile?.grade_id) {
        setLoading(false);
        return;
      }

      const { data: assignmentsData } = await supabase
        .from('greenleaf_homework_assignments')
        .select('id, due_date, topic:greenleaf_writing_topics!inner(title, prompt, grade_id)')
        .eq('topic.grade_id', profile.grade_id)
        .order('due_date', { ascending: true });

      const { data: submissionsData } = await supabase
        .from('greenleaf_homework_submissions')
        .select('assignment_id, content_text, status')
        .eq('student_id', user.id);

      setAssignments((assignmentsData as unknown as Assignment[]) ?? []);
      const map: Record<string, Submission> = {};
      (submissionsData ?? []).forEach((s) => {
        map[s.assignment_id] = s as Submission;
      });
      setSubmissions(map);
    } catch (err) {
      console.warn('Error loading homework:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomework();
  }, [user.id]);

  const handleSubmit = async (assignmentId: string) => {
    const text = (drafts[assignmentId] || '').trim();
    if (!text) {
      Alert.alert('Notice', 'Please write your answer before submitting.');
      return;
    }

    setSubmittingId(assignmentId);
    try {
      await supabase.from('greenleaf_homework_submissions').upsert({
        student_id: user.id,
        assignment_id: assignmentId,
        content_text: text,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      });

      Alert.alert('Success 🎉', 'Your homework has been submitted to your teacher!');
      await loadHomework();
    } catch (err) {
      console.warn('Submit error:', err);
      Alert.alert('Error', 'Could not submit homework. Please try again.');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Homework</Text>
        <Text style={styles.headerSub}>Complete writing tasks assigned by your teacher</Text>

        {loading ? (
          <ActivityIndicator size="large" color={THEME.colors.primary} style={{ marginTop: 40 }} />
        ) : assignments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No homework assigned right now. Great job!</Text>
          </View>
        ) : (
          assignments.map((item) => {
            const sub = submissions[item.id];
            const isDone = !!sub;

            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.assignmentTitle}>{item.topic?.title}</Text>
                  {isDone ? (
                    <View style={styles.doneBadge}>
                      <CheckCircle2 size={16} color="#16A34A" />
                      <Text style={styles.doneBadgeText}>Submitted</Text>
                    </View>
                  ) : (
                    <View style={styles.pendingBadge}>
                      <Clock size={16} color="#EA580C" />
                      <Text style={styles.pendingBadgeText}>Pending</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.promptText}>{item.topic?.prompt}</Text>

                {isDone ? (
                  <View style={styles.submittedBox}>
                    <Text style={styles.submittedLabel}>Your Answer:</Text>
                    <Text style={styles.submittedContent}>{sub.content_text}</Text>
                  </View>
                ) : (
                  <View style={styles.formBox}>
                    <TextInput
                      style={styles.textArea}
                      placeholder="Write your answer here in English..."
                      placeholderTextColor="#94A3B8"
                      multiline
                      numberOfLines={4}
                      value={drafts[item.id] || ''}
                      onChangeText={(val) => setDrafts((d) => ({ ...d, [item.id]: val }))}
                    />

                    <TouchableOpacity
                      style={styles.submitBtn}
                      onPress={() => handleSubmit(item.id)}
                      disabled={submittingId === item.id}
                      activeOpacity={0.8}
                    >
                      {submittingId === item.id ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <PenLine size={16} color="#FFFFFF" />
                          <Text style={styles.submitBtnText}>Submit Homework</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
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
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textMuted,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  assignmentTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.text,
    flex: 1,
  },
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  doneBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16A34A',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  pendingBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EA580C',
  },
  promptText: {
    fontSize: 14,
    color: THEME.colors.textMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  submittedBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  submittedLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    marginBottom: 4,
  },
  submittedContent: {
    fontSize: 15,
    color: THEME.colors.text,
    lineHeight: 22,
    fontWeight: '600',
  },
  formBox: {
    gap: 12,
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    fontSize: 15,
    color: THEME.colors.text,
    textAlignVertical: 'top',
    minHeight: 90,
  },
  submitBtn: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
