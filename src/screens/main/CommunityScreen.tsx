import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import type { CommunityPost } from '../../types';

const MOCK_POSTS: CommunityPost[] = [
  {
    id: '1',
    authorName: 'Jordan',
    avatarColor: '#0ea5e9',
    body: 'Just got my first apartment through extended care. Don’t give up — the process takes time but it’s worth it.',
    timestamp: '2h ago',
  },
  {
    id: '2',
    authorName: 'Alex',
    avatarColor: '#22c55e',
    body: 'Reminder: you can stay on Medicaid until 26. If your card expired, call the county to renew.',
    timestamp: '5h ago',
  },
  {
    id: '3',
    authorName: 'Sam',
    avatarColor: '#a855f7',
    body: 'Anyone else use the ETV for community college? It covered my books and some living expenses.',
    timestamp: '1d ago',
  },
  {
    id: '4',
    authorName: 'Riley',
    avatarColor: '#f59e0b',
    body: 'Found a food pantry near me that doesn’t ask for ID. Check the Resources tab — added a few there.',
    timestamp: '1d ago',
  },
  {
    id: '5',
    authorName: 'Casey',
    avatarColor: '#ec4899',
    body: 'Your rights don’t end when you turn 18. Extended foster care is there for a reason. Use it.',
    timestamp: '2d ago',
  },
];

export default function CommunityScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Community</Text>
      <Text style={styles.subtitle}>Posts from other foster youth</Text>
      {MOCK_POSTS.map((p) => (
        <View key={p.id} style={styles.card}>
          <View style={styles.header}>
            <View style={[styles.avatar, { backgroundColor: p.avatarColor }]}>
              <Text style={styles.avatarText}>{p.authorName[0]}</Text>
            </View>
            <View>
              <Text style={styles.authorName}>{p.authorName}</Text>
              <Text style={styles.timestamp}>{p.timestamp}</Text>
            </View>
          </View>
          <Text style={styles.body}>{p.body}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', color: '#f1f5f9', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 20 },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: '600', color: '#fff' },
  authorName: { fontSize: 16, fontWeight: '600', color: '#f1f5f9' },
  timestamp: { fontSize: 12, color: '#64748b' },
  body: { fontSize: 14, color: '#cbd5e1', lineHeight: 20 },
});
