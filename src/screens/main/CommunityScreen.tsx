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
import { getPosts, addPost, type PostDoc } from '../../services/firestore';
import type { CommunityPost } from '../../types';

const ORANGE = '#E68D33';
const CREAM = '#FFE6B3';

type FeedTab = 'all' | 'wins' | 'help' | 'meetups';

const MOCK_POSTS: CommunityPost[] = [
  {
    id: '1',
    authorName: 'Marcus T.',
    avatarColor: '#22c55e',
    body: "Just got approved for transitional housing at Bill Wilson Center!! After 3 months of searching this is literally everything. **If anyone needs the contact info for the Santa Clara county program lmk** 🙌",
    timestamp: '2 hours ago',
    location: 'San Jose',
    category: 'win',
    likes: 48,
    replies: 12,
  },
  {
    id: '2',
    authorName: 'Compass Team',
    avatarColor: '#a855f7',
    body: 'Foster youth coffee meetup in San Jose — this Saturday 10am. DM for details.',
    timestamp: 'Yesterday',
    location: 'Official',
    category: 'meetup',
    likes: 24,
    replies: 5,
  },
  {
    id: '3',
    authorName: 'Jordan',
    avatarColor: '#0ea5e9',
    body: "Just got my first apartment through extended care. Don't give up — the process takes time but it's worth it.",
    timestamp: '2h ago',
    location: 'San Jose',
    likes: 32,
    replies: 8,
  },
  {
    id: '4',
    authorName: 'Alex',
    avatarColor: '#22c55e',
    body: 'Reminder: you can stay on Medicaid until 26. If your card expired, call the county to renew.',
    timestamp: '5h ago',
    location: 'Oakland',
    likes: 19,
    replies: 3,
  },
  {
    id: '5',
    authorName: 'Sam',
    avatarColor: '#a855f7',
    body: 'Anyone else use the ETV for community college? It covered my books and some living expenses.',
    timestamp: '1d ago',
    location: 'San Jose',
    likes: 41,
    replies: 11,
  },
];

const AVATAR_COLORS = ['#0ea5e9', '#22c55e', '#a855f7', '#f59e0b', '#ec4899'];
const HEADER_HEIGHT = 220;

function postDocToCommunityPost(p: PostDoc): CommunityPost {
  return {
    id: p.id,
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
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tagline: {
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
    fontSize: 14,
    fontWeight: '600',
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
  loadingText: { marginTop: 12, fontSize: 15, color: '#64748b' },
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
  avatarText: { fontSize: 18, fontWeight: '600', color: '#fff' },
  cardHeaderText: { flex: 1 },
  authorName: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 2 },
  meta: { fontSize: 12, color: '#64748b' },
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
  badgeText: { fontSize: 11, fontWeight: '700' },
  badgeTextWin: { color: '#166534' },
  badgeTextMeetup: { color: '#991b1b' },
  body: {
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
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  modalCancel: { fontSize: 16, color: '#64748b' },
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
  submitButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
