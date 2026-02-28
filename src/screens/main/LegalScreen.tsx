import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const RIGHTS = [
  {
    title: 'Extended foster care until 21',
    body: 'In California you can remain in foster care until age 21 with AB 12.',
  },
  {
    title: 'Medicaid until 26',
    body: 'You can stay on Medicaid until you turn 26, regardless of income.',
  },
  {
    title: 'ETV education voucher',
    body: 'Education and Training Voucher (ETV) can provide up to $5,000 per year for school.',
  },
  {
    title: 'Right to records',
    body: 'You have the right to access your foster care and dependency records.',
  },
];

export default function LegalScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Your rights</Text>
      <Text style={styles.subtitle}>California foster youth</Text>
      {RIGHTS.map((r, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.cardTitle}>{r.title}</Text>
          <Text style={styles.cardBody}>{r.body}</Text>
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
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#7dd3fc', marginBottom: 6 },
  cardBody: { fontSize: 14, color: '#cbd5e1', lineHeight: 20 },
});
