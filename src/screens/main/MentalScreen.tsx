import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  type LayoutChangeEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProfile } from '../../context/ProfileContext';
import { getMentalHealthResources } from '../../services/places';
import { getCoachFeedback } from '../../services/claude';
import { config } from '../../constants/config';
import type { PlaceResource } from '../../types';
import { FONT_HEADING, FONT_HEADING_SEMIBOLD, FONT_BODY, FONT_BODY_SEMIBOLD, FONT_BODY_BOLD } from '../../constants/fonts';

const ORANGE = '#E68D33';
const CREAM = '#FFE6B3';
const HEADER_HEIGHT = 220;

/** One saved check-in entry (message + coach feedback). */
const MENTAL_CHECK_IN_ENTRY = '@compass/mental_check_in_entries';

/** Crisis & support hotlines – tap to call. */
const HOTLINES = [
  { name: 'California Youth Crisis Line', phone: '8008435200', detail: '24/7' },
  { name: '988 Suicide & Crisis Lifeline', phone: '988', detail: '24/7' },
  { name: 'National Runaway Safeline', phone: '18007862929', detail: '24/7' },
  { name: 'Crisis Text Line', phone: '741741', detail: 'Text HOME' },
];

/** Mock nearby community events – in a real app these could come from an API. */
const MOCK_EVENTS = [
  { id: '1', title: 'Foster youth support group', date: 'Sat, Mar 1', time: '10:00 AM', location: 'San Jose', type: 'Support' },
  { id: '2', title: 'Coffee & connect meetup', date: 'Sun, Mar 2', time: '2:00 PM', location: 'San Jose', type: 'Meetup' },
  { id: '3', title: 'Wellness workshop: stress & sleep', date: 'Wed, Mar 5', time: '6:00 PM', location: 'Santa Clara', type: 'Workshop' },
  { id: '4', title: 'Peer chat – housing & rights', date: 'Fri, Mar 7', time: '4:00 PM', location: 'Online', type: 'Workshop' },
];

export default function MentalScreen() {
  const { user } = useProfile();
  const zip = user?.form?.zipCode ?? user?.profile?.zip_code ?? '';
  const [coachMessage, setCoachMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [todayEntries, setTodayEntries] = useState<Array<{ message: string; feedback: string }>>([]);
  const [mentalPlaces, setMentalPlaces] = useState<PlaceResource[]>([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const entrySectionYRef = useRef(0);

  const todayKey = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(MENTAL_CHECK_IN_ENTRY);
        const data = raw ? JSON.parse(raw) : {};
        const val = data[todayKey];
        if (!cancelled && val) {
          const entries = Array.isArray(val) ? val : (val.message && val.feedback ? [val] : []);
          setTodayEntries(entries);
        }
      } catch {
        if (!cancelled) setTodayEntries([]);
      }
    })();
    return () => { cancelled = true; };
  }, [todayKey]);

  const sendToCoach = useCallback(async () => {
    const text = coachMessage.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const feedback = await getCoachFeedback(text);
      const entry = { message: text, feedback };
      setTodayEntries((prev) => [...prev, entry]);
      setCoachMessage('');
      const raw = await AsyncStorage.getItem(MENTAL_CHECK_IN_ENTRY);
      const data = raw ? JSON.parse(raw) : {};
      const existing = data[todayKey];
      const entries = Array.isArray(existing) ? existing : (existing?.message && existing?.feedback ? [existing] : []);
      data[todayKey] = [...entries, entry];
      await AsyncStorage.setItem(MENTAL_CHECK_IN_ENTRY, JSON.stringify(data));
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: entrySectionYRef.current,
          animated: true,
        });
      }, 300);
    } catch {
      const entry = {
        message: text,
        feedback: "We couldn't reach your coach right now. Your message was saved — try again later or tap the chat bubble to talk to support.",
      };
      setTodayEntries((prev) => [...prev, entry]);
      setCoachMessage('');
      const raw = await AsyncStorage.getItem(MENTAL_CHECK_IN_ENTRY);
      const data = raw ? JSON.parse(raw) : {};
      const existing = data[todayKey];
      const entries = Array.isArray(existing) ? existing : (existing?.message && existing?.feedback ? [existing] : []);
      data[todayKey] = [...entries, entry];
      await AsyncStorage.setItem(MENTAL_CHECK_IN_ENTRY, JSON.stringify(data));
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: entrySectionYRef.current,
          animated: true,
        });
      }, 300);
    } finally {
      setSending(false);
    }
  }, [coachMessage, sending, todayKey]);

  useEffect(() => {
    if (!zip || !config.googleMapsApiKey) return;
    let cancelled = false;
    setPlacesLoading(true);
    getMentalHealthResources(zip)
      .then((list) => {
        if (!cancelled) setMentalPlaces(list);
      })
      .finally(() => {
        if (!cancelled) setPlacesLoading(false);
      });
    return () => { cancelled = true; };
  }, [zip]);

  const openCall = useCallback((phone: string) => {
    Linking.openURL(`tel:${phone}`);
  }, []);

  const openAddress = useCallback((address: string) => {
    if (address) Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(address)}`);
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[ORANGE, CREAM]}
        style={[styles.headerGradient, { height: HEADER_HEIGHT }]}
      >
        <Text style={styles.title}>Mental check-in</Text>
        <Text style={styles.tagline}>
          Your wellbeing matters. Find support and events near you.
        </Text>
      </LinearGradient>

      <View style={styles.contentWrap}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Location */}
          {zip ? (
            <View style={styles.locationBar}>
              <Ionicons name="location-outline" size={18} color="#64748b" />
              <Text style={styles.locationText}>Near {zip}</Text>
            </View>
          ) : null}

          {/* Daily check-in: message to AI coach */}
          <View
            style={styles.section}
            onLayout={(e: LayoutChangeEvent) => {
              entrySectionYRef.current = e.nativeEvent.layout.y;
            }}
          >
            <Text style={styles.sectionTitle}>How are you feeling today?</Text>
            <Text style={styles.sectionSubtitle}>
              Send a message to your AI coach. You'll get supportive feedback and your entry is saved. You can write another anytime.
            </Text>
            {todayEntries.map((entry, idx) => (
              <View key={idx} style={styles.entryCard}>
                <View style={styles.entryRow}>
                  <View style={styles.coachBubble}>
                    <Text style={styles.coachLabel}>You</Text>
                    <Text style={styles.bubbleText}>{entry.message}</Text>
                  </View>
                </View>
                <View style={styles.entryRow}>
                  <View style={[styles.coachBubble, styles.coachReplyBubble]}>
                    <Text style={styles.coachLabel}>AI Coach</Text>
                    <Text style={styles.bubbleText}>{entry.feedback}</Text>
                  </View>
                </View>
                <View style={styles.savedRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
                  <Text style={styles.savedText}>Saved</Text>
                </View>
              </View>
            ))}
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.coachInputWrap}
            >
              <TextInput
                style={styles.coachInput}
                placeholder="e.g. Stressed about housing, but trying to stay hopeful..."
                placeholderTextColor="#94a3b8"
                value={coachMessage}
                onChangeText={setCoachMessage}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!sending}
              />
              <TouchableOpacity
                style={[styles.sendCoachBtn, (!coachMessage.trim() || sending) && styles.sendCoachBtnDisabled]}
                onPress={sendToCoach}
                disabled={!coachMessage.trim() || sending}
                activeOpacity={0.9}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.sendCoachText}>Send to coach</Text>
                )}
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </View>

          {/* Nearby community events */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nearby community events</Text>
            <Text style={styles.sectionSubtitle}>Support groups, meetups, and workshops</Text>
            {MOCK_EVENTS.map((ev) => (
              <TouchableOpacity key={ev.id} style={styles.eventCard} activeOpacity={0.9}>
                <View style={styles.eventBadge}>
                  <Text style={styles.eventBadgeText}>{ev.type}</Text>
                </View>
                <Text style={styles.eventTitle}>{ev.title}</Text>
                <View style={styles.eventMeta}>
                  <Ionicons name="calendar-outline" size={14} color="#64748b" />
                  <Text style={styles.eventMetaText}>{ev.date} · {ev.time}</Text>
                </View>
                <View style={styles.eventMeta}>
                  <Ionicons name="location-outline" size={14} color="#64748b" />
                  <Text style={styles.eventMetaText}>{ev.location}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Mental health resources */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mental health resources</Text>
            <Text style={styles.sectionSubtitle}>Crisis lines and nearby support</Text>

            <Text style={styles.subsectionLabel}>Crisis & support lines</Text>
            {HOTLINES.map((r, i) => (
              <TouchableOpacity
                key={i}
                style={styles.resourceCard}
                onPress={() => openCall(r.phone)}
                activeOpacity={0.9}
              >
                <View style={styles.resourceIconWrap}>
                  <Ionicons name="call" size={20} color={ORANGE} />
                </View>
                <View style={styles.resourceContent}>
                  <Text style={styles.resourceName}>{r.name}</Text>
                  <Text style={styles.resourceDetail}>{r.detail}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </TouchableOpacity>
            ))}

            <Text style={[styles.subsectionLabel, { marginTop: 20 }]}>Nearby support</Text>
            {placesLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={ORANGE} />
                <Text style={styles.loadingText}>Finding nearby mental health resources…</Text>
              </View>
            ) : mentalPlaces.length === 0 ? (
              <Text style={styles.emptyText}>
                Add your zip in profile to see nearby counselors and crisis centers.
              </Text>
            ) : (
              mentalPlaces.map((p, i) => (
                <TouchableOpacity
                  key={p.placeId ?? i}
                  style={styles.resourceCard}
                  onPress={() => p.address && openAddress(p.address)}
                  activeOpacity={0.9}
                >
                  <View style={[styles.resourceIconWrap, styles.resourceIconWrapGreen]}>
                    <Ionicons name="leaf" size={20} color="#22c55e" />
                  </View>
                  <View style={styles.resourceContent}>
                    <Text style={styles.resourceName}>{p.name}</Text>
                    <Text style={styles.resourceDetail}>{p.distance} · Tap for directions</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf8f5' },
  headerGradient: {
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontFamily: FONT_HEADING,
    fontSize: 28,
    color: '#ffffff',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tagline: {
    fontFamily: FONT_BODY,
    fontSize: 15,
    color: 'rgba(255,255,255,0.95)',
  },
  contentWrap: {
    flex: 1,
    backgroundColor: '#faf8f5',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    overflow: 'hidden',
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  locationText: {
    fontFamily: FONT_BODY_SEMIBOLD,
    fontSize: 15,
    color: '#64748b',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontFamily: FONT_HEADING_SEMIBOLD,
    fontSize: 18,
    color: '#0f172a',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontFamily: FONT_BODY,
    fontSize: 13,
    color: '#64748b',
    marginBottom: 12,
  },
  entryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  entryRow: { marginBottom: 12 },
  coachBubble: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    backgroundColor: '#fff7ed',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: ORANGE,
  },
  coachReplyBubble: {
    backgroundColor: '#f0fdf4',
    borderLeftColor: '#22c55e',
  },
  coachLabel: {
    fontFamily: FONT_BODY_SEMIBOLD,
    fontSize: 12,
    color: '#64748b',
    marginBottom: 6,
  },
  bubbleText: {
    fontFamily: FONT_BODY,
    fontSize: 15,
    color: '#1e293b',
    lineHeight: 22,
  },
  coachInputWrap: { marginBottom: 0 },
  coachInput: {
    fontFamily: FONT_BODY,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: '#1e293b',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  sendCoachBtn: {
    backgroundColor: ORANGE,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sendCoachBtnDisabled: { backgroundColor: '#cbd5e1', opacity: 0.8 },
  sendCoachText: {
    fontFamily: FONT_BODY_SEMIBOLD,
    fontSize: 16,
    color: '#fff',
  },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  savedText: { fontFamily: FONT_BODY, fontSize: 13, color: '#22c55e' },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  eventBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e9d5ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  eventBadgeText: {
    fontFamily: FONT_BODY_BOLD,
    fontSize: 11,
    color: '#6b21a8',
    letterSpacing: 0.3,
  },
  eventTitle: {
    fontFamily: FONT_BODY_SEMIBOLD,
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  eventMetaText: {
    fontFamily: FONT_BODY,
    fontSize: 13,
    color: '#64748b',
  },
  subsectionLabel: {
    fontFamily: FONT_BODY_SEMIBOLD,
    fontSize: 13,
    color: '#64748b',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  resourceIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  resourceIconWrapGreen: {
    backgroundColor: '#dcfce7',
  },
  resourceContent: { flex: 1 },
  resourceName: {
    fontFamily: FONT_BODY_SEMIBOLD,
    fontSize: 15,
    color: '#0f172a',
    marginBottom: 2,
  },
  resourceDetail: {
    fontFamily: FONT_BODY,
    fontSize: 13,
    color: '#64748b',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  loadingText: {
    fontFamily: FONT_BODY,
    fontSize: 14,
    color: '#64748b',
  },
  emptyText: {
    fontFamily: FONT_BODY,
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
    paddingVertical: 8,
  },
});
