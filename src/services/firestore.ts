/**
 * Firestore: user profiles and community posts.
 */
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  increment,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { StoredUser } from '../types';

const USERS_COLLECTION = 'users';
const POSTS_COLLECTION = 'posts';

export async function getUserProfile(uid: string): Promise<StoredUser | null> {
  const ref = doc(db, USERS_COLLECTION, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as StoredUser;
}

export async function setUserProfile(uid: string, data: StoredUser): Promise<void> {
  const ref = doc(db, USERS_COLLECTION, uid);
  await setDoc(ref, data);
}

export interface PostDoc {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  timestamp: string;
  location?: string;
  category?: string;
  likesCount: number;
  replyCount: number;
  avatarColor?: string;
}

const POSTS_LIMIT = 50;

export async function getPosts(): Promise<PostDoc[]> {
  const ref = collection(db, POSTS_COLLECTION);
  const q = query(ref, orderBy('createdAt', 'desc'), limit(POSTS_LIMIT));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      authorId: data.authorId ?? '',
      authorName: data.authorName ?? 'Anonymous',
      body: data.body ?? '',
      timestamp: formatPostTime(data.createdAt),
      location: data.location,
      category: data.category,
      likesCount: data.likesCount ?? 0,
      replyCount: data.replyCount ?? 0,
      avatarColor: data.avatarColor,
    };
  });
}

function formatPostTime(createdAt: Timestamp | null | undefined): string {
  if (!createdAt) return 'Just now';
  const date = typeof (createdAt as { toDate?: () => Date }).toDate === 'function'
    ? (createdAt as { toDate: () => Date }).toDate()
    : new Date(createdAt as unknown as string);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export async function addPost(params: {
  authorId: string;
  authorName: string;
  body: string;
  location?: string;
  category?: string;
  avatarColor?: string;
}): Promise<PostDoc> {
  const ref = collection(db, POSTS_COLLECTION);
  const docRef = await addDoc(ref, {
    authorId: params.authorId,
    authorName: params.authorName,
    body: params.body,
    location: params.location ?? null,
    category: params.category ?? null,
    avatarColor: params.avatarColor ?? null,
    likesCount: 0,
    replyCount: 0,
    createdAt: serverTimestamp(),
  });
  return {
    id: docRef.id,
    authorId: params.authorId,
    authorName: params.authorName,
    body: params.body,
    timestamp: 'Just now',
    location: params.location,
    category: params.category,
    likesCount: 0,
    replyCount: 0,
    avatarColor: params.avatarColor,
  };
}

export async function likePost(postId: string): Promise<void> {
  const ref = doc(db, POSTS_COLLECTION, postId);
  await updateDoc(ref, { likesCount: increment(1) });
}
