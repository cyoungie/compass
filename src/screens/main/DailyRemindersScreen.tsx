import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { FONT_HEADING, FONT_HEADING_SEMIBOLD, FONT_BODY, FONT_BODY_SEMIBOLD } from '../../constants/fonts';

const ORANGE = '#E68D33';
const CREAM = '#FFE6B3';

export type DailyReminderCategory = 'affirmations' | 'movement' | 'mindfulness' | 'rest' | 'connection';

interface ReminderItem {
  id: string;
  label: string;
  shortTip?: string;
  icon: string;
  color: string;
}

const CATEGORIES: { id: DailyReminderCategory; title: string; subtitle: string; items: ReminderItem[] }[] = [
  {
    id: 'affirmations',
    title: 'Words of affirmation',
    subtitle: 'Say these out loud or in your head',
    items: [
      { id: 'a1', label: 'I am worthy of love and support.', icon: 'heart', color: '#ec4899' },
      { id: 'a2', label: 'Today I am enough, just as I am.', icon: 'sunny', color: '#f59e0b' },
      { id: 'a3', label: 'I am capable of taking one step at a time.', icon: 'footsteps', color: '#22c55e' },
      { id: 'a4', label: 'I deserve to feel safe and at peace.', icon: 'shield-checkmark', color: '#0ea5e9' },
      { id: 'a5', label: 'My story is still being written.', icon: 'book', color: '#8b5cf6' },
    ],
  },
  {
    id: 'movement',
    title: 'Movement & exercise',
    subtitle: 'Best practices for your body',
    items: [
      { id: 'm1', label: 'Take a 10-minute walk outside.', shortTip: 'Fresh air and light movement.', icon: 'walk', color: '#22c55e' },
      { id: 'm2', label: 'Stretch for 5 minutes.', shortTip: 'Neck, shoulders, legs.', icon: 'body', color: '#0ea5e9' },
      { id: 'm3', label: 'Dance to one song.', shortTip: 'No rules – just move.', icon: 'musical-notes', color: '#ec4899' },
      { id: 'm4', label: 'Take the stairs instead of elevator.', shortTip: 'When you can.', icon: 'arrow-up', color: '#f59e0b' },
    ],
  },
  {
    id: 'mindfulness',
    title: 'Mindfulness & calm',
    subtitle: 'Short practices',
    items: [
      { id: 'n1', label: '5-minute breathing exercise.', shortTip: 'In for 4, hold 4, out for 6.', icon: 'leaf', color: '#10b981' },
      { id: 'n2', label: 'Meditate for 3–5 minutes.', shortTip: 'Use an app or just sit quietly.', icon: 'flower', color: '#8b5cf6' },
      { id: 'n3', label: 'Notice 3 things you can see, hear, touch.', shortTip: 'Grounding practice.', icon: 'eye', color: '#0ea5e9' },
      { id: 'n4', label: 'Write down one thing you’re grateful for.', shortTip: 'Big or small.', icon: 'pencil', color: '#eab308' },
    ],
  },
  {
    id: 'rest',
    title: 'Rest & recharge',
    subtitle: 'You deserve breaks',
    items: [
      { id: 'r1', label: 'Step away from screens for 15 minutes.', icon: 'phone-portrait-outline', color: '#64748b' },
      { id: 'r2', label: 'Listen to music or a podcast you like.', icon: 'headset', color: '#a855f7' },
      { id: 'r3', label: 'Get enough sleep tonight.', shortTip: 'Aim for 7–8 hours.', icon: 'moon', color: '#6366f1' },
    ],
  },
  {
    id: 'connection',
    title: 'Connection',
    subtitle: 'Reach out when you’re ready',
    items: [
      { id: 'c1', label: 'Text or call one person you trust.', icon: 'chatbubble-ellipses', color: '#0ea5e9' },
      { id: 'c2', label: 'Share something in the Community tab.', icon: 'people', color: '#22c55e' },
      { id: 'c3', label: 'Ask for help if you need it.', shortTip: 'You don’t have to do it alone.', icon: 'hand-left', color: '#f59e0b' },
    ],
  },
];

export default function DailyRemindersScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <LinearGradient colors={[ORANGE, CREAM]} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily reminders</Text>
        <Text style={styles.headerSubtitle}>
          Affirmations, movement, and small practices to support your day.
        </Text>
      </LinearGradient>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {CATEGORIES.map((cat) => (
          <View key={cat.id} style={styles.category}>
            <Text style={styles.categoryTitle}>{cat.title}</Text>
            <Text style={styles.categorySubtitle}>{cat.subtitle}</Text>
            {cat.items.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={[styles.cardIconWrap, { backgroundColor: item.color + '22' }]}>
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardLabel}>{item.label}</Text>
                  {item.shortTip != null && (
                    <Text style={styles.cardTip}>{item.shortTip}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf8f5' },
  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    padding: 4,
  },
  headerTitle: {
    fontFamily: FONT_HEADING,
    fontSize: 26,
    color: '#1e293b',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontFamily: FONT_BODY,
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 120 },
  category: {
    marginBottom: 28,
  },
  categoryTitle: {
    fontFamily: FONT_HEADING_SEMIBOLD,
    fontSize: 18,
    color: '#0f172a',
    marginBottom: 4,
  },
  categorySubtitle: {
    fontFamily: FONT_BODY,
    fontSize: 13,
    color: '#64748b',
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardContent: { flex: 1 },
  cardLabel: {
    fontFamily: FONT_BODY_SEMIBOLD,
    fontSize: 15,
    color: '#1e293b',
    marginBottom: 2,
  },
  cardTip: {
    fontFamily: FONT_BODY,
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
});
