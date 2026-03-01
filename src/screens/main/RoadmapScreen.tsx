import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { HomeStackParamList } from '../../types/navigation';
import { FONT_HEADING, FONT_HEADING_SEMIBOLD, FONT_BODY, FONT_BODY_SEMIBOLD } from '../../constants/fonts';

const ORANGE = '#E68D33';
const CREAM = '#FFE6B3';

/** Step or tip for the roadmap. */
const ROADMAP_CONTENT: Record<string, { steps: string[]; tip?: string }> = {
  id: {
    steps: [
      'Gather documents: birth certificate or passport, proof of residency (lease, utility bill, or letter).',
      'Book an appointment at the DMV (or walk in; some locations offer free ID for foster youth).',
      'Bring your foster youth verification letter if you have one – it can waive the fee.',
      'Pick up your ID when ready. You’ll need it for jobs, housing, and benefits.',
    ],
    tip: 'Many DMVs have a "foster youth" process – ask when you arrive.',
  },
  healthcare: {
    steps: [
      'You qualify for Medicaid until age 26 – no cost.',
      'Apply at CoveredCA.com or your county social services office.',
      'Have your ID and Social Security number ready; the form takes about 10 minutes.',
      'Choose a health plan and a primary care doctor once approved.',
    ],
    tip: 'If you’re in school or working, you still qualify. Don’t wait.',
  },
  food: {
    steps: [
      'Open the Resources tab and use your zip code to find nearby food banks and pantries.',
      'Call or visit during open hours – many don’t require proof of need.',
      'Some offer fresh produce, canned goods, and sometimes hot meals.',
    ],
    tip: 'Sacred Heart, Second Harvest, and local pantries are there for you.',
  },
  mental: {
    steps: [
      'Tap the Mental check-in tab to log how you’re doing – no judgment, just for you.',
      'Consider a short daily practice: a walk, 5 minutes of quiet, or one thing you’re grateful for.',
      'If you want to talk to someone, reach out to a school counselor, foster care worker, or a hotline (e.g. 988).',
    ],
    tip: 'Your mental health matters. Small steps count.',
  },
  legal: {
    steps: [
      'Open the Resources tab and check the Legal section for your rights in CA.',
      'Extended foster care, education rights, and housing support are available until 21 (and sometimes 22).',
      'Free legal aid organizations (e.g. Law Foundation of SV) can help with specific issues.',
    ],
    tip: 'You don’t have to figure it out alone. Legal aid is free and confidential.',
  },
  housing: {
    steps: [
      'Extended foster care can include housing support – ask your worker or ILP about options.',
      'Use the Resources tab to find shelters and transitional housing near you.',
      'Reach out to Next Door Solutions, Covenant House, or local youth shelters for immediate help.',
    ],
    tip: 'Stable housing is a right. Start with one call or one visit.',
  },
};

type RouteType = RouteProp<HomeStackParamList, 'Roadmap'>;

export default function RoadmapScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteType>();
  const { actionId, title, subtitle, tag } = route.params;

  const content = ROADMAP_CONTENT[actionId] ?? {
    steps: [
      'Review the details in the Resources tab.',
      'Reach out to a trusted adult or support worker if you need help with next steps.',
      'Come back here anytime – your roadmap is yours to update.',
    ],
    tip: 'You’ve got this. One step at a time.',
  };

  const tagLabel =
    tag === 'urgent' ? 'URGENT' : tag === 'this_week' ? 'THIS WEEK' : tag === 'opportunity' ? 'OPPORTUNITY' : null;
  const tagColor =
    tag === 'urgent' ? '#ef4444' : tag === 'this_week' ? '#eab308' : tag === 'opportunity' ? '#22c55e' : undefined;

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
        {tagLabel && tagColor && (
          <View style={[styles.tag, { backgroundColor: tagColor }]}>
            <Text style={styles.tagText}>{tagLabel}</Text>
          </View>
        )}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </LinearGradient>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Your roadmap</Text>
        {content.steps.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{i + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
        {content.tip && (
          <View style={styles.tipBox}>
            <Ionicons name="bulb-outline" size={20} color={ORANGE} />
            <Text style={styles.tipText}>{content.tip}</Text>
          </View>
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
  backButton: {
    position: 'absolute',
    top: 56,
    left: 20,
    zIndex: 1,
    padding: 4,
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  tagText: {
    fontFamily: FONT_BODY_SEMIBOLD,
    fontSize: 11,
    color: '#fff',
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: FONT_HEADING,
    fontSize: 24,
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FONT_BODY,
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  sectionTitle: {
    fontFamily: FONT_HEADING_SEMIBOLD,
    fontSize: 18,
    color: '#0f172a',
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontFamily: FONT_BODY_SEMIBOLD,
    fontSize: 14,
    color: '#fff',
  },
  stepText: {
    flex: 1,
    fontFamily: FONT_BODY,
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  tipText: {
    flex: 1,
    fontFamily: FONT_BODY,
    fontSize: 14,
    color: '#9a3412',
    lineHeight: 20,
  },
});
