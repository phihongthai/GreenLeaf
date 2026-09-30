import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { THEME } from '../lib/theme';
import { Gift, Lock, CheckCircle2 } from 'lucide-react-native';

const MYSTERY_BOX_COST = 100;

export default function MysteryBox({ userId, leafCount }: { userId: string | null; leafCount: number }) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadPending = async () => {
    if (!userId) return;
    try {
      const { data } = await supabase
        .from('greenleaf_mystery_box_requests')
        .select('id')
        .eq('student_id', userId)
        .eq('status', 'pending')
        .maybeSingle();

      setPendingId(data?.id ?? null);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadPending();
  }, [userId]);

  const handleRequest = async () => {
    if (!userId || leafCount < MYSTERY_BOX_COST) return;
    setBusy(true);
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://green-leaf-snowy.vercel.app';
      await fetch(`${apiUrl}/api/mystery-box/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      await loadPending();
    } catch (err) {
      console.warn('Mystery box request failed:', err);
    } finally {
      setBusy(false);
    }
  };

  const unlocked = leafCount >= MYSTERY_BOX_COST;
  const progress = Math.min(100, Math.round((leafCount / MYSTERY_BOX_COST) * 100));

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.giftBadge, unlocked && styles.giftBadgeUnlocked]}>
          <Gift size={28} color={unlocked ? '#EA580C' : '#94A3B8'} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Mystery Box Reward</Text>

          {pendingId ? (
            <View style={styles.statusRow}>
              <CheckCircle2 size={16} color="#16A34A" />
              <Text style={styles.pendingText}>Requested! Waiting for teacher</Text>
            </View>
          ) : unlocked ? (
            <Text style={styles.readyText}>Ready to redeem for a fun gift!</Text>
          ) : (
            <View style={styles.lockedRow}>
              <Lock size={14} color="#64748B" />
              <Text style={styles.lockedText}>
                {leafCount}/{MYSTERY_BOX_COST} Leaves to unlock
              </Text>
            </View>
          )}

          {!pendingId && (
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          )}
        </View>

        {unlocked && !pendingId && (
          <TouchableOpacity
            style={styles.claimBtn}
            onPress={handleRequest}
            disabled={busy}
            activeOpacity={0.8}
          >
            {busy ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.claimBtnText}>Redeem</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  giftBadge: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  giftBadgeUnlocked: {
    backgroundColor: '#FFEDD5',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pendingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
  },
  readyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lockedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  progressBg: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME.colors.streak,
    borderRadius: 3,
  },
  claimBtn: {
    backgroundColor: THEME.colors.streak,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  claimBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
