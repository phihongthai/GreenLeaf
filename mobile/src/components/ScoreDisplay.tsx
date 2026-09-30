import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Star, CheckCircle2, RotateCcw } from 'lucide-react-native';
import { THEME } from '../lib/theme';
import type { PronunciationResult } from '../lib/assess';

interface ScoreDisplayProps {
  result: PronunciationResult;
  praisePhrase?: string | null;
}

export default function ScoreDisplay({ result, praisePhrase }: ScoreDisplayProps) {
  const score = Math.round(result.overallScore);
  const passed = score >= 80;
  const stars = score >= 90 ? 3 : score >= 80 ? 2 : 1;

  const scoreColor = passed ? '#16A34A' : '#EA580C';
  const scoreBg = passed ? '#DCFCE7' : '#FFEDD5';

  return (
    <View style={styles.card}>
      {/* Praise / Feedback Title */}
      <View style={styles.header}>
        {passed ? (
          <CheckCircle2 size={24} color="#16A34A" />
        ) : (
          <RotateCcw size={24} color="#EA580C" />
        )}
        <Text style={[styles.praiseText, { color: scoreColor }]}>
          {praisePhrase || (passed ? 'Awesome Speaking!' : score === 0 ? 'Speak up clearly!' : 'Nice try! Try once more!')}
        </Text>
      </View>

      {/* Stars */}
      <View style={styles.starsRow}>
        {[1, 2, 3].map((s) => (
          <Star
            key={s}
            size={28}
            color={s <= stars ? '#F59E0B' : '#CBD5E1'}
            fill={s <= stars ? '#F59E0B' : 'transparent'}
          />
        ))}
      </View>

      {/* Main Score Pill */}
      <View style={[styles.scoreBadge, { backgroundColor: scoreBg }]}>
        <Text style={[styles.scoreNumber, { color: scoreColor }]}>{score}</Text>
        <Text style={[styles.scoreLabel, { color: scoreColor }]}>/ 100 Points</Text>
      </View>

      {/* Detailed breakdown */}
      <View style={styles.breakdownRow}>
        <View style={styles.subScore}>
          <Text style={styles.subScoreValue}>{Math.round(result.accuracyScore || score)}%</Text>
          <Text style={styles.subScoreLabel}>Accuracy</Text>
        </View>

        <View style={styles.subScoreDivider} />

        <View style={styles.subScore}>
          <Text style={styles.subScoreValue}>{Math.round(result.fluencyScore || Math.max(0, score - 3))}%</Text>
          <Text style={styles.subScoreLabel}>Fluency</Text>
        </View>
      </View>

      {/* Word-level AI feedback if words are present */}
      {result.words && result.words.length > 0 && (
        <View style={styles.wordsWrapper}>
          <Text style={styles.wordsTitle}>AI Word-by-Word Analysis</Text>
          <View style={styles.wordsContainer}>
            {result.words.map((w, idx) => {
              const wordScore = Math.round(w.accuracyScore);
              const isGood = wordScore >= 80;
              return (
                <View
                  key={idx}
                  style={[
                    styles.wordChip,
                    {
                      backgroundColor: isGood ? '#DCFCE7' : '#FEE2E2',
                      borderColor: isGood ? '#86EFAC' : '#FCA5A5',
                    },
                  ]}
                >
                  <Text style={[styles.wordText, { color: isGood ? '#166534' : '#991B1B' }]}>
                    {w.word}
                  </Text>
                  <Text style={[styles.wordScoreText, { color: isGood ? '#15803D' : '#DC2626' }]}>
                    {wordScore}%
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginVertical: 14,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  praiseText: {
    fontSize: 18,
    fontWeight: '900',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  scoreNumber: {
    fontSize: 28,
    fontWeight: '900',
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  subScore: {
    flex: 1,
    alignItems: 'center',
  },
  subScoreDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  subScoreValue: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  subScoreLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  wordsWrapper: {
    width: '100%',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    alignItems: 'center',
  },
  wordsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  wordChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  wordText: {
    fontSize: 13,
    fontWeight: '700',
  },
  wordScoreText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
