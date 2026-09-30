import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { supabase } from './src/lib/supabase';
import { THEME } from './src/lib/theme';
import type { LessonWithProgress } from './src/lib/types';
import LoginScreen from './src/screens/LoginScreen';
import StudentHomeScreen from './src/screens/StudentHomeScreen';
import JourneyScreen from './src/screens/JourneyScreen';
import HomeworkScreen from './src/screens/HomeworkScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LessonPlayerScreen from './src/screens/LessonPlayerScreen';
import BottomTabBar, { type TabType } from './src/components/BottomTabBar';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<TabType>('learn');
  const [activeLesson, setActiveLesson] = useState<{ lesson: LessonWithProgress; gradeCode: string } | null>(null);

  useEffect(() => {
    // 1. Check existing session on boot
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setActiveLesson(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setActiveLesson(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  // Not logged in -> Login Screen
  if (!user) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <LoginScreen onLoginSuccess={(u) => setUser(u)} />
      </View>
    );
  }

  // Inside a Lesson Mission -> Full screen Lesson Player (0ms state machine)
  if (activeLesson) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <LessonPlayerScreen
          lesson={activeLesson.lesson}
          gradeCode={activeLesson.gradeCode}
          user={user}
          onBack={() => setActiveLesson(null)}
        />
      </View>
    );
  }

  // Main Student Experience with Bottom Navigation Tabs
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {currentTab === 'learn' && (
        <StudentHomeScreen
          user={user}
          onLogout={handleLogout}
          onSelectLesson={(lesson, gradeCode) => setActiveLesson({ lesson, gradeCode })}
        />
      )}

      {currentTab === 'journey' && <JourneyScreen user={user} />}

      {currentTab === 'homework' && <HomeworkScreen user={user} />}

      {currentTab === 'profile' && <ProfileScreen user={user} onLogout={handleLogout} />}

      {/* Persistent Bottom Tab Bar */}
      <BottomTabBar currentTab={currentTab} onTabChange={(tab) => setCurrentTab(tab)} />
    </View>
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
  },
});
