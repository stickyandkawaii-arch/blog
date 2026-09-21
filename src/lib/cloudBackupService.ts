import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  serverTimestamp,
  orderBy,
  query,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Article, CategoryItem, Comment, NewsletterSubscriber, Poll, UserPollVotes, UserReactions } from '../types';

export interface BlogBackupData {
  articles: Article[];
  categories: CategoryItem[];
  comments: Comment[];
  subscribers: NewsletterSubscriber[];
  polls?: Poll[];
  userPollVotes?: UserPollVotes;
  userReactions?: UserReactions;
}

/**
 * Strips undefined fields or converts undefined to fallback/null
 * because Firestore setDoc() explicitly throws on undefined.
 */
function sanitizeBackupData(data: BlogBackupData): BlogBackupData {
  const sanitized: BlogBackupData = {
    articles: Array.isArray(data.articles) ? data.articles : [],
    categories: Array.isArray(data.categories) ? data.categories : [],
    comments: Array.isArray(data.comments) ? data.comments : [],
    subscribers: Array.isArray(data.subscribers) ? data.subscribers : [],
    polls: Array.isArray(data.polls) ? data.polls : [],
    userPollVotes: data.userPollVotes && typeof data.userPollVotes === 'object' ? data.userPollVotes : {},
    userReactions: data.userReactions && typeof data.userReactions === 'object' ? data.userReactions : {},
  };
  // Also recursively remove any undefined fields within nested objects/arrays using JSON roundtrip
  return JSON.parse(JSON.stringify(sanitized));
}

export interface CloudBackupRecord {
  id: string;
  createdAt: string;
  timestamp: string;
  articlesCount: number;
  categoriesCount: number;
  commentsCount: number;
  subscribersCount: number;
  note?: string;
  data: BlogBackupData;
}

/**
 * Saves a full snapshot manually to Firestore:
 * 1. Writes to `blog_sync/latest` (the active sync snapshot)
 * 2. Also writes a versioned document into `blog_backups/{backupId}` so the admin can restore any historical manual backup
 */
export async function createManualCloudBackup(
  data: BlogBackupData,
  note: string = 'Sauvegarde manuelle administrateur'
): Promise<{ success: boolean; backupId: string; timestamp: string }> {
  const now = new Date();
  const timestamp = now.toISOString();
  const backupId = `backup_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(
    2,
    '0'
  )}${String(now.getSeconds()).padStart(2, '0')}`;

  const cleanData = sanitizeBackupData(data);

  const payload: CloudBackupRecord = {
    id: backupId,
    createdAt: timestamp,
    timestamp,
    articlesCount: cleanData.articles.length,
    categoriesCount: cleanData.categories.length,
    commentsCount: cleanData.comments.length,
    subscribersCount: cleanData.subscribers.length,
    note: note.trim() || 'Sauvegarde manuelle administrateur',
    data: cleanData,
  };

  // 1. Update the latest active snapshot
  try {
    await setDoc(doc(db, 'blog_sync', 'latest'), {
      ...payload,
      serverUpdatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'blog_sync/latest');
  }

  // 2. Add to history collection
  try {
    await setDoc(doc(db, 'blog_backups', backupId), {
      ...payload,
      serverUpdatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `blog_backups/${backupId}`);
  }

  return { success: true, backupId, timestamp };
}

/**
 * Retrieves the latest manual snapshot from Firestore
 */
export async function getLatestCloudBackup(): Promise<CloudBackupRecord | null> {
  try {
    const snapshotDoc = await getDoc(doc(db, 'blog_sync', 'latest'));
    if (snapshotDoc.exists()) {
      return snapshotDoc.data() as CloudBackupRecord;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'blog_sync/latest');
  }
}

/**
 * Lists all historical manual backups from Firestore
 */
export async function listCloudBackups(maxResults: number = 20): Promise<CloudBackupRecord[]> {
  const path = 'blog_backups';
  try {
    const q = query(collection(db, path), limit(maxResults));
    const snapshot = await getDocs(q);
    const list: CloudBackupRecord[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as CloudBackupRecord);
    });
    // Sort client-side by date descending
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

/**
 * Deletes a historical cloud backup document
 */
export async function deleteCloudBackup(backupId: string): Promise<boolean> {
  const path = `blog_backups/${backupId}`;
  try {
    await deleteDoc(doc(db, 'blog_backups', backupId));
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}
