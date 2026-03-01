import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useProfile } from '../../context/ProfileContext';
import { useAuth, isFirebaseConfigured } from '../../context/AuthContext';
import { clearAppIdentityStorage } from '../../services/storage';
import { getPriorityActions } from '../../utils/priorityActions';
import type { CommunityPost } from '../../types';

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

const COMMUNITY_PREVIEW_POSTS: CommunityPost[] = [
  {
    id: 'preview-1',
    authorName: 'Marcus, 19',
    avatarColor: '#22c55e',
    body: 'Just got approved for transitional housing!! If anyone needs the contact info for the program in Santa Clara county lmk 🙌',
    timestamp: '2 hours ago',
    location: 'San Jose',
    category: 'Housing',
    likes: 24,
    replies: 8,
  },
  {
    id: 'preview-2',
    authorName: 'Aaliyah, 20',
    avatarColor: '#a855f7',
    body: "Did NOT know I could stay in foster care until 21. The legal tab literally changed my life. Check it if you haven't.",
    timestamp: 'Yesterday',
    location: 'Oakland',
    category: 'Legal',
    likes: 51,
    replies: 14,
  },
];

const CATEGORY_TAG_COLORS: Record<string, string> = {
  Housing: '#86efac',
  Legal: '#c4b5fd',
  Resources: '#fde047',
  Mental: '#93c5fd',
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user, setUser } = useProfile();
  const { signOut } = useAuth();

  const handleStartFromBeginning = () => {
    Alert.alert(
      'Start from beginning',
      'This will sign you out and clear local data. You’ll see the onboarding and sign-in flow again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start over',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            await clearAppIdentityStorage();
            if (!isFirebaseConfigured) setUser(null);
          },
        },
      ]
    );
  };

  if (!user) return null;

  const actions = getPriorityActions(user.profile);
  const displayName = user.form.name.trim() || 'there';
  const firstName = displayName.split(/\s+/)[0] || displayName;
  const windowHeight = Dimensions.get('window').height;
  const gradientHeight = windowHeight * (1 / 3);

  return (
    <ScrollView
      style={styles.wrapper}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={['#E68D33', '#FFE6B3']}
        style={[styles.gradientSection, { height: gradientHeight }]}
      >
        <Text style={styles.heyName}>HEY {firstName.toUpperCase()}</Text>
        <View style={styles.avatarOnGradient}>
          <Text style={styles.avatarText}>
            {(firstName[0] || '?').toUpperCase()}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {}}
          style={styles.gradientLifeMapCta}
          activeOpacity={0.8}
        >
          <Text style={styles.gradientLifeMapCtaText}>View full life map</Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My daily actions. Today</Text>
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.dailyRow}>
        <TouchableOpacity
          style={styles.dailyCard}
          onPress={() => navigation.navigate('Mental' as never)}
          activeOpacity={0.9}
        >
          <Text style={styles.dailyCardIcon}>✓</Text>
          <Text style={styles.dailyCardLabel}>Log your check-in</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.dailyCard, styles.dailyCardLegal]}
          onPress={() => navigation.navigate('Resources' as never)}
          activeOpacity={0.9}
        >
          <View style={styles.legalTag}>
            <Text style={styles.legalTagText}>LEGAL</Text>
          </View>
          <Text style={styles.dailyCardLabel}>Know your rights in CA</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your priorities</Text>
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>
      {actions.length === 0 ? (
        <Text style={styles.emptyMap}>
          You're all set for now. Come back anytime.
        </Text>
      ) : (
        actions.map((a) => (
          <TouchableOpacity
            key={a.id}
            style={styles.priorityCard}
            activeOpacity={0.8}
          >
            {a.tag && (
              <View style={[styles.priorityTag, { backgroundColor: TAG_COLORS[a.tag] }]}>
                <Text style={styles.priorityTagText}>{TAG_LABELS[a.tag]}</Text>
              </View>
            )}
            <View style={styles.priorityContent}>
              <Text style={styles.priorityTitle}>{a.title}</Text>
              <Text style={styles.prioritySubtitle}>{a.subtitle}</Text>
            </View>
            <Text style={styles.priorityArrow}>→</Text>
          </TouchableOpacity>
        ))
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Community</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Community' as never)}>
          <Text style={styles.seeAllCommunity}>See all</Text>
        </TouchableOpacity>
      </View>
      {COMMUNITY_PREVIEW_POSTS.map((p) => (
        <TouchableOpacity
          key={p.id}
          style={styles.communityCard}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Community' as never)}
        >
          <View style={styles.communityCardTop}>
            <View style={styles.communityCardAuthor}>
              <View style={[styles.communityAvatar, { backgroundColor: p.avatarColor }]}>
                <Text style={styles.communityAvatarText}>{p.authorName[0]}</Text>
              </View>
              <View>
                <Text style={styles.communityName}>{p.authorName}</Text>
                <Text style={styles.communityMeta}>
                  {p.timestamp}{p.location ? ` · ${p.location}` : ''}
                </Text>
              </View>
            </View>
            {p.category && (
              <View style={[styles.communityTag, { backgroundColor: CATEGORY_TAG_COLORS[p.category] || '#94a3b8' }]}>
                <Text style={styles.communityTagText}>{p.category}</Text>
              </View>
            )}
          </View>
          <Text style={styles.communityBody} numberOfLines={3}>{p.body}</Text>
          <View style={styles.communityEngagement}>
            <Text style={styles.communityEngagementItem}>❤️ {p.likes ?? 0}</Text>
            <Text style={styles.communityEngagementItem}>💬 {p.replies ?? 0} replies</Text>
            <Text style={styles.communityEngagementItem}>Share</Text>
          </View>
        </TouchableOpacity>
      ))}

      {__DEV__ && (
        <TouchableOpacity
          style={styles.startOverButton}
          onPress={handleStartFromBeginning}
          activeOpacity={0.8}
        >
          <Text style={styles.startOverText}>Start from beginning (dev)</Text>
        </TouchableOpacity>
      )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#ffffff' },
  scrollContent: { paddingBottom: 100 },
  gradientSection: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
    overflow: 'hidden',
  },
  heyName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  avatarOnGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  gradientLifeMapCta: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  gradientLifeMapCtaText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.95)',
    textShadowColor: 'rgba(0,0,0,0.12)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  content: { padding: 20, paddingBottom: 100, backgroundColor: '#ffffff' },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#E68D33',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  seeAll: { fontSize: 14, color: '#0ea5e9', fontWeight: '500' },
  dailyRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  dailyCard: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    minHeight: 88,
    justifyContent: 'center',
  },
  dailyCardLegal: {
    backgroundColor: '#e9d5ff',
  },
  dailyCardIcon: {
    fontSize: 28,
    color: '#22c55e',
    marginBottom: 6,
  },
  legalTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(109,40,217,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  legalTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5b21b6',
    letterSpacing: 0.5,
  },
  dailyCardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  emptyMap: {
    fontSize: 15,
    color: '#64748b',
    fontStyle: 'italic',
  },
  priorityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
  },
  priorityTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  priorityTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  priorityContent: { flex: 1 },
  priorityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  prioritySubtitle: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  priorityArrow: {
    fontSize: 18,
    color: '#64748b',
    marginLeft: 8,
  },
  seeAllCommunity: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '600',
  },
  communityCard: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  communityCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  communityCardAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  communityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  communityAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  communityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  communityMeta: {
    fontSize: 12,
    color: '#64748b',
  },
  communityTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  communityTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  communityBody: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 12,
  },
  communityEngagement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  communityEngagementItem: {
    fontSize: 13,
    color: '#64748b',
  },
  startOverButton: {
    marginTop: 32,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  startOverText: {
    fontSize: 13,
    color: '#b91c1c',
    fontWeight: '500',
  },
});
