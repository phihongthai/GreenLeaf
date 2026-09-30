import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, TreePine, PenLine, User } from 'lucide-react-native';
import { THEME } from '../lib/theme';

export type TabType = 'learn' | 'journey' | 'homework' | 'profile';

interface BottomTabBarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TABS: { id: TabType; label: string; Icon: any }[] = [
  { id: 'learn', label: 'Learn', Icon: Home },
  { id: 'journey', label: 'Journey', Icon: TreePine },
  { id: 'homework', label: 'Homework', Icon: PenLine },
  { id: 'profile', label: 'Profile', Icon: User },
];

export default function BottomTabBar({ currentTab, onTabChange }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {TABS.map(({ id, label, Icon }) => {
          const active = currentTab === id;
          return (
            <TouchableOpacity
              key={id}
              style={[styles.tab, active && styles.activeTab]}
              onPress={() => onTabChange(id)}
              activeOpacity={0.7}
            >
              <Icon size={22} color={active ? THEME.colors.primaryDark : THEME.colors.textMuted} />
              <Text style={[styles.tabText, active && styles.activeTabText]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: 'transparent',
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 20,
    gap: 2,
  },
  activeTab: {
    backgroundColor: THEME.colors.primaryLight,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textMuted,
  },
  activeTabText: {
    color: THEME.colors.primaryDark,
    fontWeight: '900',
  },
});
