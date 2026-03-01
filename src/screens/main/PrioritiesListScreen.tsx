import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useProfile } from '../../context/ProfileContext';
import { getFullPriorityActions } from '../../utils/priorityActions';
import { Ionicons } from '@expo/vector-icons';
import type { HomeStackParamList } from '../../types/navigation';
import { FONT_HEADING, FONT_HEADING_SEMIBOLD, FONT_BODY, FONT_BODY_SEMIBOLD, FONT_BODY_BOLD } from '../../constants/fonts';

const TAG_LABELS: Record<string, string> = {
  urgent: 'URGENT',
  this_week: 'THIS WEEK',
  opportunity: 'OPPORTUNITY',
};
const TAG_COLORS: Record<string, string> = {
  urgent: '#ef4444',
  this_week: '#eab308',
  opportunity: '#22c55e',
};
const ORANGE = '#E68D33';
const CREAM = '#FFE6B3';

export default function PrioritiesListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList, 'PrioritiesList'>>();
  const insets = useSafeAreaInsets();
  const { user } = useProfile();
  const actions = user ? getFullPriorityActions(user.profile) : [];

  if (!user) return null;

  const headerTop = Math.max(56, insets.top + 12);

  return (
    <View style={styles.container}>
      <LinearGradient colors={[ORANGE, CREAM]} style={[styles.header, { paddingTop: headerTop }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { top: headerTop }]}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Your priorities</Text>
          <Text style={styles.headerSubtitle}>
            Tap any card to open your personalized roadmap.
          </Text>
        </View>
      </LinearGradient>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {actions.length === 0 ? (
          <Text style={styles.empty}>You’re all set for now. Come back anytime.</Text>
        ) : (
          actions.map((a) => (
            <TouchableOpacity
              key={a.id}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('Roadmap', {
                  actionId: a.id,
                  title: a.title,
                  subtitle: a.subtitle,
                  tag: a.tag,
                })
              }
            >
              {a.tag && (
                <View style={[styles.tag, { backgroundColor: TAG_COLORS[a.tag] }]}>
                  <Text style={styles.tagText}>{TAG_LABELS[a.tag]}</Text>
                </View>
              )}
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{a.title}</Text>
                <Text style={styles.cardSubtitle}>{a.subtitle}</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          ))
        )}
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
  headerTitle: {
    fontFamily: FONT_HEADING,
    fontSize: 24,
    color: '#1e293b',
    marginBottom: 8,
  },
  headerTextWrap: {
    marginLeft: 44,
    marginTop: 4,
  },
  headerSubtitle: {
    fontFamily: FONT_BODY,
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    padding: 4,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 120 },
  empty: {
    fontFamily: FONT_BODY,
    fontSize: 15,
    color: '#64748b',
    fontStyle: 'italic',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: ORANGE,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  tagText: {
    fontFamily: FONT_BODY_BOLD,
    fontSize: 10,
    color: '#fff',
    letterSpacing: 0.5,
  },
  cardContent: { flex: 1 },
  cardTitle: {
    fontFamily: FONT_BODY_SEMIBOLD,
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontFamily: FONT_BODY,
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  arrow: {
    fontSize: 18,
    color: '#64748b',
    marginLeft: 8,
  },
});
