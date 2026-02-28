import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants';

const EMOJIS = ['😔', '😕', '😐', '🙂', '😊'];
const LABELS = ['Rough', 'Okay', 'Neutral', 'Good', 'Great'];

const MENTAL_RESOURCES = [
  { name: 'California Youth Crisis Line', detail: '24/7 • 800-843-5200' },
  { name: 'National Runaway Safeline', detail: '24/7 • 1-800-RUNAWAY' },
  { name: 'Foster Care Mental Health', detail: 'County-specific • Ask your worker' },
];

export default function MentalScreen() {
  const [todayScore, setTodayScore] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  const handleEmojiPress = useCallback(async (index: number) => {
    const score = index + 1;
    setTodayScore(score);
    try {
      const key = STORAGE_KEYS.MENTAL_CHECK_INS;
      const raw = await AsyncStorage.getItem(key);
      const data = raw ? JSON.parse(raw) : {};
      const today = new Date().toISOString().slice(0, 10);
      data[today] = score;
      await AsyncStorage.setItem(key, JSON.stringify(data));
      setSaved(true);
    } catch (_) {
      setSaved(false);
    }
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Daily check-in</Text>
      <Text style={styles.subtitle}>How are you feeling today?</Text>
      <View style={styles.emojiRow}>
        {EMOJIS.map((emoji, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.emojiBtn, todayScore === i + 1 && styles.emojiBtnSelected]}
            onPress={() => handleEmojiPress(i)}
          >
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={styles.emojiLabel}>{LABELS[i]}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {saved && todayScore !== null && (
        <Text style={styles.saved}>Saved for today</Text>
      )}

      <Text style={styles.sectionTitle}>Mental health resources</Text>
      {MENTAL_RESOURCES.map((r, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.cardName}>{r.name}</Text>
          <Text style={styles.cardDetail}>{r.detail}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  content: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 20 },
  emojiRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  emojiBtn: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    minWidth: 56,
  },
  emojiBtnSelected: { backgroundColor: '#0ea5e9' },
  emoji: { fontSize: 28, marginBottom: 4 },
  emojiLabel: { fontSize: 11, color: '#64748b' },
  saved: { fontSize: 13, color: '#22c55e', marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#0f172a', marginBottom: 12 },
  card: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardName: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 4 },
  cardDetail: { fontSize: 14, color: '#64748b' },
});
