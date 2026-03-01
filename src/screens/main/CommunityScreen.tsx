import React, { useState, useLayoutEffect, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useProfile } from '../../context/ProfileContext';
import { useAuth, isFirebaseConfigured } from '../../context/AuthContext';
import { getPosts, addPost, deletePost, type PostDoc } from '../../services/firestore';
import type { CommunityPost } from '../../types';
import { FONT_HEADING, FONT_HEADING_SEMIBOLD, FONT_BODY, FONT_BODY_SEMIBOLD, FONT_BODY_BOLD } from '../../constants/fonts';

const ORANGE = '#E68D33';
const CREAM = '#FFE6B3';

type FeedTab = 'all' | 'wins' | 'help' | 'meetups';

const MOCK_POSTS: CommunityPost[] = [
  {
    id: 'mock-1',
    authorName: 'Skyler',
    avatarColor: '#22c55e',
    body: "Just landed a part-time job at a grocery store. First paycheck felt unreal. If you're job hunting, try applying in person — that's how I got the interview.",
    timestamp: '2h ago',
    location: 'San Jose',
    category: 'win',
    likes: 61,
    replies: 15,
  },
  {
    id: 'mock-2',
    authorName: 'Jamie',
    avatarColor: '#a855f7',
    body: 'Free yoga for youth at the rec center every Tuesday 5pm. No sign-up, just show up. Really helped my anxiety.',
    timestamp: '4h ago',
    location: 'Oakland',
    category: 'meetup',
    likes: 34,
    replies: 6,
  },
  {
    id: 'mock-3',
    authorName: 'River',
    avatarColor: '#0ea5e9',
    body: "Has anyone had luck getting CHAFEE funding for a laptop? My ILP worker said it's possible but the form is confusing.",
    timestamp: '6h ago',
    location: 'Santa Clara',
    category: 'help',
    likes: 29,
    replies: 12,
  },
  {
    id: 'mock-4',
    authorName: 'Phoenix',
    avatarColor: '#f59e0b',
    body: "Got my GED last month. Never thought I'd finish but the study group here kept me going. You can do it too.",
    timestamp: 'Yesterday',
    location: 'San Jose',
    category: 'win',
    likes: 94,
    replies: 21,
  },
  {
    id: 'mock-5',
    authorName: 'Avery',
    avatarColor: '#ec4899',
    body: "Reminder: you can get free bus passes through the county if you're in care or just aged out. Saved me so much money.",
    timestamp: 'Yesterday',
    location: 'Oakland',
    likes: 56,
    replies: 9,
  },
  {
    id: 'mock-6',
    authorName: 'Reese',
    avatarColor: '#22c55e',
    body: "Looking for a used bike in decent shape. Budget is tight. Willing to fix minor stuff. Hit me up if you're selling or know someone.",
    timestamp: '2d ago',
    location: 'San Jose',
    category: 'help',
    likes: 19,
    replies: 7,
  },
  {
    id: 'mock-7',
    authorName: 'Finley',
    avatarColor: '#0ea5e9',
    body: "Medi-Cal covered my therapy sessions. Took a few calls to find someone taking new patients but it's 100% free. Don't wait to ask.",
    timestamp: '2d ago',
    location: 'San Jose',
    category: 'win',
    likes: 72,
    replies: 18,
  },
  {
    id: 'mock-8',
    authorName: 'Sage',
    avatarColor: '#a855f7',
    body: 'Game night at my place this Friday — board games and pizza. Small group, low key. DM for the address if you want to come.',
    timestamp: '3d ago',
    location: 'Santa Clara',
    category: 'meetup',
    likes: 42,
    replies: 11,
  },
  {
    id: 'mock-9',
    authorName: 'Rowan',
    avatarColor: '#f59e0b',
    body: "How do you get your Social Security card replaced? Lost mine and I need it for a job. Heard it's free but the process is a mess.",
    timestamp: '4d ago',
    location: 'Oakland',
    category: 'help',
    likes: 38,
    replies: 14,
  },
  {
    id: 'mock-10',
    authorName: 'Emery',
    avatarColor: '#ec4899',
    body: "Signed my first lease. Independent living program helped with the deposit. Took a year of saving but it happened. Keep going.",
    timestamp: '5d ago',
    location: 'San Jose',
    category: 'win',
    likes: 88,
    replies: 24,
  },
  {
    id: 'mock-11',
    authorName: 'Morgan',
    avatarColor: '#0ea5e9',
    body: "Anyone know good spots for free WiFi to do job applications? Library is packed and my phone hotspot is slow.",
    timestamp: '6d ago',
    location: 'Oakland',
    category: 'help',
    likes: 31,
    replies: 18,
  },
  {
    id: 'mock-12',
    authorName: 'Jordan',
    avatarColor: '#22c55e',
    body: "First week at my new job and they're letting me adjust my schedule for school. So grateful for understanding bosses.",
    timestamp: '1w ago',
    location: 'Santa Clara',
    category: 'win',
    likes: 102,
    replies: 22,
  },
  {
    id: 'mock-13',
    authorName: 'Casey',
    avatarColor: '#a855f7',
    body: 'Study group for GED prep — Tuesdays 4pm at the community center. We share notes and quiz each other. Drop in if you want.',
    timestamp: '1w ago',
    location: 'San Jose',
    category: 'meetup',
    likes: 45,
    replies: 9,
  },
  {
    id: 'mock-14',
    authorName: 'Riley',
    avatarColor: '#f59e0b',
    body: "How do you get your birth certificate in CA? Need it for ID and the county website is confusing. Is there a faster way?",
    timestamp: '1w ago',
    location: 'Oakland',
    category: 'help',
    likes: 27,
    replies: 16,
  },
  {
    id: 'mock-15',
    authorName: 'Quinn',
    avatarColor: '#ec4899',
    body: "Just got approved for CalFresh. The interview was way less scary than I thought. If you're on the fence, just apply.",
    timestamp: '1w ago',
    location: 'San Jose',
    category: 'win',
    likes: 89,
    replies: 24,
  },
  {
    id: 'mock-16',
    authorName: 'Alex',
    avatarColor: '#0ea5e9',
    body: 'Running group for anyone who wants to get outside — Saturday mornings 9am at the park. No pace requirement, just show up.',
    timestamp: '2w ago',
    location: 'Santa Clara',
    category: 'meetup',
    likes: 38,
    replies: 7,
  },
  {
    id: 'mock-17',
    authorName: 'Sam',
    avatarColor: '#22c55e',
    body: "Finally got my driver's permit. Next step is saving for a beater car. Anyone have tips on cheap insurance for under 21?",
    timestamp: '2w ago',
    location: 'San Jose',
    category: 'help',
    likes: 41,
    replies: 19,
  },
  {
    id: 'mock-18',
    authorName: 'Taylor',
    avatarColor: '#a855f7',
    body: "Moved into my first place last month. Still figuring out bills and groceries but it feels good to have my own door.",
    timestamp: '2w ago',
    location: 'Oakland',
    category: 'win',
    likes: 76,
    replies: 20,
  },
  {
    id: 'mock-19',
    authorName: 'Drew',
    avatarColor: '#f59e0b',
    body: "Free resume workshop at the youth center next Thursday. They helped me get my current job. Sign up at the front desk.",
    timestamp: '3w ago',
    location: 'San Jose',
    category: 'meetup',
    likes: 52,
    replies: 11,
  },
  {
    id: 'mock-20',
    authorName: 'Jesse',
    avatarColor: '#ec4899',
    body: "Connected with a lawyer through the Law Foundation for my dependency case. Free and they actually call you back. Can't recommend enough.",
    timestamp: '3w ago',
    location: 'Santa Clara',
    category: 'win',
    likes: 94,
    replies: 15,
  },
];

const AVATAR_COLORS = ['#0ea5e9', '#22c55e', '#a855f7', '#f59e0b', '#ec4899'];
const HEADER_HEIGHT = 220;

function postDocToCommunityPost(p: PostDoc): CommunityPost {
  return {
    id: p.id,
    authorId: p.authorId,
    authorName: p.authorName,
    avatarColor: p.avatarColor ?? AVATAR_COLORS[0],
    body: p.body,
    timestamp: p.timestamp,
    location: p.location,
    category: p.category,
    likes: p.likesCount,
    replies: p.replyCount,
  };
}

export default function CommunityScreen() {
  const navigation = useNavigation();
  const { user } = useProfile();
  const { authUser } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>(MOCK_POSTS);
  const [postsLoading, setPostsLoading] = useState(isFirebaseConfigured);
  const [activeTab, setActiveTab] = useState<FeedTab>('all');
  const [composeVisible, setComposeVisible] = useState(false);
  const [newPostBody, setNewPostBody] = useState('');
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeletePost = async (postId: string) => {
    setDeletingId(postId);
    try {
      if (isFirebaseConfigured) await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } finally {
      setDeletingId(null);
    }
  };

  const canDeletePost = (p: CommunityPost) =>
    !!p.authorId && p.authorId === (authUser?.uid ?? 'local');

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    let cancelled = false;
    getPosts()
      .then((list) => {
        if (!cancelled) setPosts(list.map(postDocToCommunityPost));
      })
      .catch(() => {
        if (!cancelled) setPosts([]);
      })
      .finally(() => {
        if (!cancelled) setPostsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handlePost = async () => {
    const body = newPostBody.trim();
    if (!body) return;
    const name = user?.form?.name?.trim() || 'Anonymous';
    const firstLetter = name[0] || '?';
    const colorIndex = firstLetter.charCodeAt(0) % AVATAR_COLORS.length;
    const avatarColor = AVATAR_COLORS[colorIndex];
    if (isFirebaseConfigured) {
      setPosting(true);
      try {
        const created = await addPost({
          authorId: authUser?.uid ?? '',
          authorName: name,
          body,
          location: user?.profile?.state ?? user?.form?.zipCode,
          avatarColor,
        });
        setPosts((prev) => [postDocToCommunityPost(created), ...prev]);
        setNewPostBody('');
        setComposeVisible(false);
      } catch {
        // keep modal open on error
      } finally {
        setPosting(false);
      }
      return;
    }
    const newPost: CommunityPost = {
      id: Date.now().toString(),
      authorId: authUser?.uid ?? 'local',
      authorName: name,
      avatarColor,
      body,
      timestamp: 'Just now',
      likes: 0,
      replies: 0,
    };
    setPosts((prev) => [newPost, ...prev]);
    setNewPostBody('');
    setComposeVisible(false);
  };

  const filteredPosts =
    activeTab === 'all'
      ? posts
      : activeTab === 'wins'
        ? posts.filter((p) => p.category === 'win')
        : activeTab === 'meetups'
          ? posts.filter((p) => p.category === 'meetup')
          : activeTab === 'help'
            ? posts.filter((p) => p.category === 'help')
            : posts;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[ORANGE, CREAM]}
        style={[styles.headerGradient, { height: HEADER_HEIGHT }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => setComposeVisible(true)}
            style={styles.postButton}
            activeOpacity={0.9}
          >
            <Ionicons name="pencil" size={16} color="#1e293b" />
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>Community</Text>
        <Text style={styles.tagline}>You're not alone in this. Find your people.</Text>
      </LinearGradient>

      <View style={styles.contentWrap}>
        <View style={styles.tabsRow}>
          <TouchableOpacity
            onPress={() => setActiveTab('all')}
            style={styles.tab}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabLabel, activeTab === 'all' && styles.tabLabelActive]}>All</Text>
            {activeTab === 'all' && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('wins')} style={styles.tab} activeOpacity={0.8}>
            <View style={styles.tabIconWrap}>
              <Ionicons name="trophy" size={18} color={activeTab === 'wins' ? ORANGE : '#94a3b8'} />
            </View>
            <Text style={[styles.tabLabel, activeTab === 'wins' && styles.tabLabelActive]}>Wins</Text>
            {activeTab === 'wins' && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('help')} style={styles.tab} activeOpacity={0.8}>
            <View style={styles.tabIconWrap}>
              <Ionicons name="help-circle" size={18} color={activeTab === 'help' ? ORANGE : '#94a3b8'} />
            </View>
            <Text style={[styles.tabLabel, activeTab === 'help' && styles.tabLabelActive]}>Help</Text>
            {activeTab === 'help' && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('meetups')} style={styles.tab} activeOpacity={0.8}>
            <View style={styles.tabIconWrap}>
              <Ionicons name="location" size={18} color={activeTab === 'meetups' ? ORANGE : '#94a3b8'} />
            </View>
            <Text style={[styles.tabLabel, activeTab === 'meetups' && styles.tabLabelActive]}>Meetups</Text>
            {activeTab === 'meetups' && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.feedScroll}
          contentContainerStyle={styles.feedContent}
          showsVerticalScrollIndicator={false}
        >
          {postsLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={ORANGE} />
              <Text style={styles.loadingText}>Loading feed...</Text>
            </View>
          ) : (
          filteredPosts.map((p) => (
            <View key={p.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.avatar, { backgroundColor: p.avatarColor }]}>
                  <Text style={styles.avatarText}>{p.authorName[0]}</Text>
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.authorName}>{p.authorName}</Text>
                  <Text style={styles.meta}>
                    {p.location ?? 'Community'} · {p.timestamp}
                  </Text>
                </View>
                {(p.category === 'win' || p.category === 'meetup') && (
                  <View style={[styles.badge, p.category === 'win' ? styles.badgeWin : styles.badgeMeetup]}>
                    <Ionicons
                      name={p.category === 'win' ? 'trophy' : 'location'}
                      size={12}
                      color={p.category === 'win' ? '#166534' : '#991b1b'}
                    />
                    <Text style={[styles.badgeText, p.category === 'win' ? styles.badgeTextWin : styles.badgeTextMeetup]}>
                      {p.category === 'win' ? 'WIN' : 'MEETUP'}
                    </Text>
                  </View>
                )}
                {canDeletePost(p) && (
                  <TouchableOpacity
                    onPress={() => handleDeletePost(p.id)}
                    disabled={deletingId === p.id}
                    style={styles.deleteButton}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    {deletingId === p.id ? (
                      <ActivityIndicator size="small" color="#ef4444" />
                    ) : (
                      <>
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        <Text style={styles.deleteLabel}>Delete</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.body}>{p.body.replace(/\*\*(.*?)\*\*/g, '$1')}</Text>
              <View style={styles.engagementRow}>
                <View style={styles.engagementItem}>
                  <Ionicons name="heart" size={18} color="#64748b" />
                  <Text style={styles.engagementCount}>{p.likes ?? 0}</Text>
                </View>
                <View style={styles.engagementItem}>
                  <Ionicons name="chatbubble-outline" size={16} color="#64748b" />
                  <Text style={styles.engagementCount}>{p.replies ?? 0}</Text>
                </View>
                <Text style={styles.shareText}>Share</Text>
              </View>
            </View>
          ))
          )}
        </ScrollView>
      </View>

      <Modal
        visible={composeVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setComposeVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New post</Text>
              <TouchableOpacity onPress={() => setComposeVisible(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.deleteHint}>Your posts show a trash icon — tap it to delete.</Text>
            <TextInput
              style={styles.input}
              placeholder="What's on your mind?"
              placeholderTextColor="#64748b"
              value={newPostBody}
              onChangeText={setNewPostBody}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.submitButton, (!newPostBody.trim() || posting) && styles.submitButtonDisabled]}
              onPress={handlePost}
              disabled={!newPostBody.trim() || posting}
              activeOpacity={0.8}
            >
              {posting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf8f5' },
  headerGradient: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 16,
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  postButtonText: {
    fontFamily: FONT_BODY_SEMIBOLD,
    fontSize: 15,
    color: '#1e293b',
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
    marginBottom: 16,
  },
  contentWrap: {
    flex: 1,
    backgroundColor: '#faf8f5',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    overflow: 'hidden',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrap: {
    marginBottom: 4,
  },
  tabLabel: {
    fontFamily: FONT_BODY_SEMIBOLD,
    fontSize: 14,
    color: '#94a3b8',
  },
  tabLabelActive: {
    color: ORANGE,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 12,
    right: 12,
    height: 3,
    borderRadius: 2,
    backgroundColor: ORANGE,
  },
  feedScroll: { flex: 1 },
  feedContent: { padding: 16, paddingBottom: 100 },
  loadingWrap: { padding: 40, alignItems: 'center' },
  loadingText: { fontFamily: FONT_BODY, marginTop: 12, fontSize: 15, color: '#64748b' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontFamily: FONT_BODY_SEMIBOLD, fontSize: 18, color: '#fff' },
  cardHeaderText: { flex: 1 },
  authorName: { fontFamily: FONT_BODY_BOLD, fontSize: 16, color: '#0f172a', marginBottom: 2 },
  meta: { fontFamily: FONT_BODY, fontSize: 12, color: '#64748b' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  badgeWin: { backgroundColor: '#dcfce7' },
  badgeMeetup: { backgroundColor: '#fee2e2' },
  badgeText: { fontFamily: FONT_BODY_BOLD, fontSize: 11 },
  badgeTextWin: { color: '#166534' },
  badgeTextMeetup: { color: '#991b1b' },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    marginLeft: 4,
  },
  deleteLabel: {
    fontFamily: FONT_BODY_SEMIBOLD,
    fontSize: 13,
    color: '#ef4444',
    marginLeft: 4,
  },
  body: {
    fontFamily: FONT_BODY,
    fontSize: 14,
    color: '#334155',
    lineHeight: 21,
    marginBottom: 12,
  },
  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  engagementCount: { fontSize: 13, color: '#64748b' },
  shareText: { fontSize: 13, color: '#64748b' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontFamily: FONT_HEADING_SEMIBOLD, fontSize: 18, color: '#0f172a' },
  modalCancel: { fontSize: 16, color: '#64748b' },
  deleteHint: { fontFamily: FONT_BODY, fontSize: 13, color: '#64748b', marginBottom: 12 },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#0f172a',
    minHeight: 120,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: ORANGE,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: { backgroundColor: '#e2e8f0', opacity: 0.7 },
  submitButtonText: { fontFamily: FONT_BODY_SEMIBOLD, fontSize: 16, color: '#fff' },
});
