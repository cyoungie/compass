import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useProfile } from '../../context/ProfileContext';
import { getPriorityActions } from '../../utils/priorityActions';

export default function HomeScreen() {
  const { user } = useProfile();
  if (!user) return null;

  const actions = getPriorityActions(user.profile);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Hi, {user.form.name}</Text>
      <View style={styles.summaryCard}>
        <Text style={styles.summary}>{user.welcomeSummary}</Text>
      </View>
      <Text style={styles.sectionTitle}>Your priorities</Text>
      {actions.map((a) => (
        <View key={a.id} style={styles.actionCard}>
          <Text style={styles.actionTitle}>{a.title}</Text>
          <Text style={styles.actionSubtitle}>{a.subtitle}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 20, paddingBottom: 40 },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summary: {
    fontSize: 15,
    lineHeight: 22,
    color: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 12,
  },
  actionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
});
