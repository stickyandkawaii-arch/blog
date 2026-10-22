import React, { useState, useEffect, useMemo } from 'react';
import { TopBanner } from './components/TopBanner';
import { Header } from './components/Header';
import { SidebarDrawer } from './components/SidebarDrawer';
import { CategoryNav } from './components/CategoryNav';
import { FeaturedArticleHero } from './components/FeaturedArticleHero';
import { ArticleCard } from './components/ArticleCard';
import { ArticleView } from './components/ArticleView';
import { AdminModal } from './components/AdminModal';
import { NewsletterSection } from './components/NewsletterSection';

import { Article, Comment, Category, ReactionType, UserReactions, NewsletterSubscriber, CategoryItem, Poll, UserPollVotes } from './types';
import { 
  INITIAL_ARTICLES, 
  INITIAL_COMMENTS, 
  INITIAL_SUBSCRIBERS, 
  INITIAL_CATEGORIES, 
  INITIAL_POLLS,
  isObsoleteDemoArticle,
  isObsoleteDemoComment,
} from './data/initialArticles';
import { Sparkles, Compass, AlertCircle, BookOpen, Heart } from 'lucide-react';
import { testFirestoreConnection, db } from './lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { BlogBackupData, getLatestCloudBackup, createManualCloudBackup } from './lib/cloudBackupService';

const STORAGE_KEYS = {
  ARTICLES: 'sticky_kawaii_blog_articles_v2',
  COMMENTS: 'sticky_kawaii_blog_comments_v2',
  USER_REACTIONS: 'sticky_kawaii_blog_user_reactions_v2',
  ADMIN_AUTH: 'sticky_kawaii_blog_admin_auth_v2',
  SUBSCRIBERS: 'sticky_kawaii_blog_subscribers_v2',
  CATEGORIES: 'sticky_kawaii_blog_categories_v2',
  POLLS: 'sticky_kawaii_blog_polls_v2',
  USER_POLL_VOTES: 'sticky_kawaii_blog_user_poll_votes_v2',
  LAST_SYNC_TIMESTAMP: 'sticky_kawaii_blog_last_sync_timestamp_v2',
};

export default function App() {
  const [isLoadingCloud, setIsLoadingCloud] = useState<boolean>(true);

  // Categories state
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load categories from storage', e);
    }
    return INITIAL_CATEGORIES;
  });

  // Articles state - Starts empty or with local storage, permanently purging deleted demo articles
  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      // Check current storage key and legacy keys
      const keys = [
        STORAGE_KEYS.ARTICLES,
        'sticky_kawaii_blog_articles_v2',
        'sticky_kawaii_blog_articles',
        'sticky_blog_articles',
      ];
      for (const k of keys) {
        const raw = localStorage.getItem(k);
        if (raw) {
          try {
            const loaded: Article[] = JSON.parse(raw);
            if (Array.isArray(loaded)) {
              const cleaned = loaded
                .filter((art) => !isObsoleteDemoArticle(art))
                .map((art) => ({
                  ...art,
                  author: {
                    ...art.author,
                    name: art.author?.name === 'Sticky' ? 'Karine' : (art.author?.name || 'Karine'),
                  },
                }));
              // Write cleaned back to current storage key
              localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(cleaned));
              if (cleaned.length > 0) {
                return cleaned;
              }
            }
          } catch {}
        }
      }
    } catch (e) {
      console.error('Failed to load articles from storage', e);
    }
    return [];
  });

  // Comments state - Permanently clean mock comments
  const [comments, setComments] = useState<Comment[]>(() => {
    try {
      const keys = [STORAGE_KEYS.COMMENTS, 'sticky_kawaii_blog_comments_v2', 'sticky_blog_comments'];
      for (const k of keys) {
        const raw = localStorage.getItem(k);
        if (raw) {
          try {
            const loaded: Comment[] = JSON.parse(raw);
            if (Array.isArray(loaded)) {
              const cleaned = loaded.filter(
                (c) => !isObsoleteDemoComment(c)
              );
              localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(cleaned));
              if (cleaned.length > 0) return cleaned;
            }
          } catch {}
        }
      }
    } catch (e) {
      console.error('Failed to load comments from storage', e);
    }
    return [];
  });

  // Newsletter Subscribers state
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBSCRIBERS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load subscribers from storage', e);
    }
    return INITIAL_SUBSCRIBERS;
  });

  // User Reactions state
  const [userReactions, setUserReactions] = useState<UserReactions>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER_REACTIONS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load user reactions', e);
    }
    return {};
  });

  // Polls state
  const [polls, setPolls] = useState<Poll[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.POLLS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load polls', e);
    }
    return INITIAL_POLLS;
  });

  const [userPollVotes, setUserPollVotes] = useState<UserPollVotes>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER_POLL_VOTES);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load user poll votes', e);
    }
    return {};
  });

  // Admin session state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
  });

  // Verify Firestore connection on startup & auto-sync from Cloud in real-time
  useEffect(() => {
    testFirestoreConnection().catch((err) => {
      console.warn('Initial Firestore connectivity probe warning:', err);
    });

    const syncDocRef = doc(db, 'blog_sync', 'latest');
    const unsubscribe = onSnapshot(
      syncDocRef,
      (snapshot) => {
        setIsLoadingCloud(false);
        if (snapshot.exists()) {
          const cloudData = snapshot.data();
          const backupData = cloudData?.data;
          if (backupData) {
            const cloudArticles = (backupData.articles || []).filter(
              (art: Article) => !isObsoleteDemoArticle(art)
            );

            // Read local storage to preserve unsaved drafts only if admin has them
            const localSaved = localStorage.getItem(STORAGE_KEYS.ARTICLES);
            let localArticles: Article[] = [];
            try {
              if (localSaved) {
                const parsed = JSON.parse(localSaved);
                if (Array.isArray(parsed)) {
                  localArticles = parsed.filter((a) => !isObsoleteDemoArticle(a));
                }
              }
            } catch {}

            // If cloud has articles, cloud is the public source of truth
            if (cloudArticles.length > 0) {
              setArticles(cloudArticles);
              localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(cloudArticles));
            } else if (localArticles.length > 0 && isAdminLoggedIn) {
              // Admin has local articles that haven't been pushed to cloud yet
              setArticles(localArticles);
            } else {
              // Cloud has 0 articles and visitor has no articles: clean empty state
              setArticles([]);
              localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify([]));
            }

            if (Array.isArray(backupData.categories) && backupData.categories.length > 0) {
              setCategories(backupData.categories);
              localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(backupData.categories));
            }
            if (Array.isArray(backupData.comments)) {
              const cleanComments = backupData.comments.filter((c) => !isObsoleteDemoComment(c));
              setComments(cleanComments);
              localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(cleanComments));
            }
            if (Array.isArray(backupData.subscribers)) {
              setSubscribers(backupData.subscribers);
              localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(backupData.subscribers));
            }
            if (Array.isArray(backupData.polls)) {
              setPolls(backupData.polls);
              localStorage.setItem(STORAGE_KEYS.POLLS, JSON.stringify(backupData.polls));
            }
            if (backupData.userPollVotes) {
              setUserPollVotes(backupData.userPollVotes);
              localStorage.setItem(STORAGE_KEYS.USER_POLL_VOTES, JSON.stringify(backupData.userPollVotes));
            }
            if (backupData.userReactions) {
              setUserReactions(backupData.userReactions);
              localStorage.setItem(STORAGE_KEYS.USER_REACTIONS, JSON.stringify(backupData.userReactions));
            }
            if (cloudData.timestamp) {
              localStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIMESTAMP, cloudData.timestamp);
            }
            console.log('App updated in real-time from cloud sync:', cloudData.id, `${cloudArticles.length} article(s)`);
          }
        } else {
          if (!isAdminLoggedIn) {
            setArticles([]);
          }
        }
      },
      (error) => {
        console.warn('Real-time Firestore sync notice:', error);
        setIsLoadingCloud(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isAdminLoggedIn]);

  // Navigation & View state
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
    } catch (e) {
      console.error('Failed to save articles to storage', e);
    }
  }, [articles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
    } catch (e) {
      console.error('Failed to save comments to storage', e);
    }
  }, [comments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(subscribers));
    } catch (e) {
      console.error('Failed to save subscribers to storage', e);
    }
  }, [subscribers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_REACTIONS, JSON.stringify(userReactions));
    } catch (e) {
      console.error('Failed to save reactions', e);
    }
  }, [userReactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories to storage', e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.POLLS, JSON.stringify(polls));
    } catch (e) {
      console.error('Failed to save polls', e);
    }
  }, [polls]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_POLL_VOTES, JSON.stringify(userPollVotes));
    } catch (e) {
      console.error('Failed to save user poll votes', e);
    }
  }, [userPollVotes]);

  // Support clean query parameter navigation & legacy hash
  useEffect(() => {
    const handleUrlState = () => {
      const params = new URLSearchParams(window.location.search);
      const articleParam = params.get('article');
      const hash = window.location.hash.replace('#', '');

      // Check admin trigger via URL
      if (hash === 'admin' || params.get('admin') === 'true') {
        setIsAdminModalOpen(true);
      }

      const targetId = articleParam || (hash.startsWith('article-') ? hash.replace('article-', '') : null);
      if (targetId) {
        const target = articles.find((a) => a.id === targetId || a.slug === targetId);
        if (target) {
          setActiveArticleId(target.id);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (!articleParam && !hash.startsWith('article-')) {
        setActiveArticleId(null);
      }
    };

    handleUrlState();
    window.addEventListener('popstate', handleUrlState);
    window.addEventListener('hashchange', handleUrlState);
    return () => {
      window.removeEventListener('popstate', handleUrlState);
      window.removeEventListener('hashchange', handleUrlState);
    };
  }, [articles]);

  // Helper to determine if an article is publicly visible (published or scheduled date reached)
  const isArticlePublic = (art: Article): boolean => {
    if (art.status === 'draft') return false;
    if (art.status === 'scheduled') {
      if (!art.scheduledAt) return false;
      const schedDate = new Date(art.scheduledAt).getTime();
      return !isNaN(schedDate) && schedDate <= Date.now();
    }
    return art.status === 'published';
  };

  // Read single article
  const currentArticle = useMemo(() => {
    if (!activeArticleId) return null;
    const found = articles.find((a) => a.id === activeArticleId) || null;
    if (!found) return null;
    if (!isArticlePublic(found) && !isAdminLoggedIn) {
      return null;
    }
    return found;
  }, [activeArticleId, articles, isAdminLoggedIn]);

  // Featured article: first with featured:true and publicly available, or first public article
  const featuredArticle = useMemo(() => {
    return (
      articles.find((a) => a.featured && isArticlePublic(a)) ||
      articles.find((a) => isArticlePublic(a)) ||
      (isAdminLoggedIn ? articles[0] : undefined)
    );
  }, [articles, isAdminLoggedIn]);

  // Filtered articles list
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      // In reader mode, don't show drafts or unreached scheduled articles unless admin
      if (!isArticlePublic(art) && !isAdminLoggedIn) return false;

      // Category filter
      if (selectedCategory !== 'all' && art.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inTitle = art.title.toLowerCase().includes(query);
        const inSummary = art.summary.toLowerCase().includes(query);
        const inContent = art.content.toLowerCase().includes(query);
        const inTags = art.tags.some((t) => t.toLowerCase().includes(query));
        if (!inTitle && !inSummary && !inContent && !inTags) {
          return false;
        }
      }

      return true;
    });
  }, [articles, selectedCategory, searchQuery, isAdminLoggedIn]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: 0,
    };

    categories.forEach((c) => {
      counts[c.name] = 0;
    });

    articles.forEach((art) => {
      if (!isArticlePublic(art) && !isAdminLoggedIn) return;
      counts.all += 1;
      if (counts[art.category] !== undefined) {
        counts[art.category] += 1;
      } else {
        counts[art.category] = 1;
      }
    });

    return counts;
  }, [articles, categories, isAdminLoggedIn]);

  // Current article comments
  const currentComments = useMemo(() => {
    if (!currentArticle) return [];
    return comments.filter((c) => c.articleId === currentArticle.id);
  }, [comments, currentArticle]);

  // Related articles
  const relatedArticles = useMemo(() => {
    if (!currentArticle) return [];
    return articles.filter(
      (a) => a.id !== currentArticle.id && (isArticlePublic(a) || isAdminLoggedIn)
    );
  }, [articles, currentArticle, isAdminLoggedIn]);

  // Handlers
  const handleOpenArticle = (article: Article) => {
    setActiveArticleId(article.id);
    const url = new URL(window.location.href);
    url.searchParams.set('article', article.id);
    url.hash = '';
    window.history.pushState({}, '', url.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setActiveArticleId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('article');
    url.hash = '';
    window.history.pushState({}, '', url.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReact = (articleId: string, reactionType: ReactionType) => {
    const articleReactions = userReactions[articleId] || {};
    const hasReacted = !!articleReactions[reactionType];

    // Toggle reaction
    const delta = hasReacted ? -1 : 1;

    setArticles((prev) =>
      prev.map((art) => {
        if (art.id !== articleId) return art;
        return {
          ...art,
          reactions: {
            ...art.reactions,
            [reactionType]: Math.max(0, (art.reactions[reactionType] || 0) + delta),
          },
        };
      })
    );

    setUserReactions((prev) => ({
      ...prev,
      [articleId]: {
        ...prev[articleId],
        [reactionType]: !hasReacted,
      },
    }));
  };

  const handleAddComment = (articleId: string, author: string, content: string, avatarIcon?: string) => {
    const colors = [
      'bg-pink-100 text-pink-700',
      'bg-purple-100 text-purple-700',
      'bg-indigo-100 text-indigo-700',
      'bg-amber-100 text-amber-700',
      'bg-emerald-100 text-emerald-700',
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      articleId,
      author,
      avatarColor: randomColor,
      avatarIcon: avatarIcon || '🌸',
      content,
      createdAt: "À l'instant",
    };

    setComments((prev) => [newComment, ...prev]);
  };

  const handleDeleteComment = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const handleAdminLogin = (email: string, password: string): boolean => {
    const validEmails = [
      'stickyandkawaii@gmail.com', 
      'admin@stickyandkawaii.eu', 
      'contact@stickyandkawaii.eu'
    ];
    const cleanEmail = email.trim().toLowerCase();
    
    // Strict authentication: Email + Secure Master Password
    if (validEmails.includes(cleanEmail) && password === '21Zero5zero2,.') {
      setIsAdminLoggedIn(true);
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
  };

  const handleSaveArticle = async (savedArticle: Article) => {
    const currentArticles = articles.length > 0 
      ? articles 
      : (() => {
          try {
            const s = localStorage.getItem(STORAGE_KEYS.ARTICLES);
            return s ? JSON.parse(s) : [];
          } catch { return []; }
        })();

    const cleanCurrent = currentArticles.filter((a: Article) => !isObsoleteDemoArticle(a));
    const exists = cleanCurrent.some((a: Article) => a.id === savedArticle.id);
    const updatedArticles = exists
      ? cleanCurrent.map((a: Article) => (a.id === savedArticle.id ? savedArticle : a))
      : [savedArticle, ...cleanCurrent];

    setArticles(updatedArticles);
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(updatedArticles));

    // Auto-sync in background to Firestore Cloud with actual articles array!
    try {
      const payload: BlogBackupData = {
        articles: updatedArticles,
        categories,
        comments,
        subscribers,
        polls,
        userPollVotes,
        userReactions,
      };
      const res = await createManualCloudBackup(payload, `Publication article : ${savedArticle.title}`);
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIMESTAMP, res.timestamp);
      console.log('Article auto-synced to cloud:', res.backupId, `${updatedArticles.length} article(s)`);
    } catch (e) {
      console.warn('Background cloud sync warning:', e);
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    const currentArticles = articles.length > 0 
      ? articles 
      : (() => {
          try {
            const s = localStorage.getItem(STORAGE_KEYS.ARTICLES);
            return s ? JSON.parse(s) : [];
          } catch { return []; }
        })();

    const updatedArticles = currentArticles
      .filter((a: Article) => !isObsoleteDemoArticle(a))
      .filter((a: Article) => a.id !== articleId);

    setArticles(updatedArticles);
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(updatedArticles));

    if (activeArticleId === articleId) {
      handleBackToHome();
    }

    try {
      const payload: BlogBackupData = {
        articles: updatedArticles,
        categories,
        comments,
        subscribers,
        polls,
        userPollVotes,
        userReactions,
      };
      const res = await createManualCloudBackup(payload, `Suppression article ${articleId}`);
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIMESTAMP, res.timestamp);
      console.log('Deletion auto-synced to cloud:', res.backupId);
    } catch (e) {
      console.warn('Background cloud sync warning:', e);
    }
  };

  const handleSaveCategory = (savedCategory: CategoryItem, oldName?: string) => {
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === savedCategory.id);
      if (exists) {
        return prev.map((c) => (c.id === savedCategory.id ? savedCategory : c));
      } else {
        return [...prev, savedCategory];
      }
    });

    // If category name was renamed, update existing articles with this category
    if (oldName && oldName !== savedCategory.name) {
      setArticles((prev) =>
        prev.map((art) => (art.category === oldName ? { ...art, category: savedCategory.name } : art))
      );
      if (selectedCategory === oldName) {
        setSelectedCategory(savedCategory.name);
      }
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    const categoryToDelete = categories.find((c) => c.id === categoryId);
    if (!categoryToDelete) return;

    const remaining = categories.filter((c) => c.id !== categoryId);
    const fallbackCategoryName = remaining.length > 0 ? remaining[0].name : 'Général';

    setCategories(remaining);

    // Reassign any articles using this category to fallback
    setArticles((prev) =>
      prev.map((art) =>
        art.category === categoryToDelete.name ? { ...art, category: fallbackCategoryName } : art
      )
    );

    if (selectedCategory === categoryToDelete.name) {
      setSelectedCategory('all');
    }
  };

  const handleResetDefaults = () => {
    setArticles(INITIAL_ARTICLES);
    setComments(INITIAL_COMMENTS);
    setSubscribers(INITIAL_SUBSCRIBERS);
    setCategories(INITIAL_CATEGORIES);
    setPolls(INITIAL_POLLS);
    setUserReactions({});
    setUserPollVotes({});
    localStorage.removeItem(STORAGE_KEYS.ARTICLES);
    localStorage.removeItem(STORAGE_KEYS.COMMENTS);
    localStorage.removeItem(STORAGE_KEYS.SUBSCRIBERS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.POLLS);
    localStorage.removeItem(STORAGE_KEYS.USER_REACTIONS);
    localStorage.removeItem(STORAGE_KEYS.USER_POLL_VOTES);
  };

  const handleVote = (pollId: string, optionId: string) => {
    // Check if user already voted in this poll
    if (userPollVotes[pollId]) return;

    setUserPollVotes((prev) => ({ ...prev, [pollId]: optionId }));

    setPolls((prev) =>
      prev.map((poll) => {
        if (poll.id !== pollId) return poll;
        const updatedOptions = poll.options.map((opt) =>
          opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
        );
        return {
          ...poll,
          options: updatedOptions,
          totalVotes: poll.totalVotes + 1,
        };
      })
    );
  };

  const handleSubscribe = (newEmail: string): boolean => {
    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail) return false;

    setSubscribers((prev) => {
      const alreadyExists = prev.some((s) => s.email.toLowerCase() === cleanEmail);
      if (alreadyExists) return prev;

      const newSub: NewsletterSubscriber = {
        id: `sub-${Date.now()}`,
        email: cleanEmail,
        subscribedAt: new Date().toISOString(),
        source: 'Formulaire bas de page',
      };
      return [newSub, ...prev];
    });
    return true;
  };

  const handleAddSubscriber = (newEmail: string): boolean => {
    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail) return false;

    let added = false;
    setSubscribers((prev) => {
      const alreadyExists = prev.some((s) => s.email.toLowerCase() === cleanEmail);
      if (alreadyExists) {
        added = false;
        return prev;
      }
      added = true;
      const newSub: NewsletterSubscriber = {
        id: `sub-${Date.now()}`,
        email: cleanEmail,
        subscribedAt: new Date().toISOString(),
        source: 'Ajout manuel (Studio)',
      };
      return [newSub, ...prev];
    });
    return added;
  };

  const handleDeleteSubscriber = (subscriberId: string) => {
    setSubscribers((prev) => prev.filter((s) => s.id !== subscriberId));
  };

  const handleRestoreData = async (restored: BlogBackupData) => {
    if (!restored) return;

    // Filter out obsolete mock articles
    const cleanArticles = Array.isArray(restored.articles)
      ? restored.articles.filter((a) => !isObsoleteDemoArticle(a))
      : [];
    setArticles(cleanArticles);
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(cleanArticles));
    restored.articles = cleanArticles;

    if (restored.categories && Array.isArray(restored.categories)) {
      setCategories(restored.categories);
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(restored.categories));
    }
    if (restored.comments && Array.isArray(restored.comments)) {
      const cleanComments = restored.comments.filter(
        (c) => !isObsoleteDemoComment(c)
      );
      setComments(cleanComments);
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(cleanComments));
      restored.comments = cleanComments;
    }
    if (restored.subscribers && Array.isArray(restored.subscribers)) {
      setSubscribers(restored.subscribers);
      localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(restored.subscribers));
    }
    if (restored.polls && Array.isArray(restored.polls)) {
      setPolls(restored.polls);
      localStorage.setItem(STORAGE_KEYS.POLLS, JSON.stringify(restored.polls));
    }
    if (restored.userPollVotes && typeof restored.userPollVotes === 'object') {
      setUserPollVotes(restored.userPollVotes);
      localStorage.setItem(STORAGE_KEYS.USER_POLL_VOTES, JSON.stringify(restored.userPollVotes));
    }
    if (restored.userReactions && typeof restored.userReactions === 'object') {
      setUserReactions(restored.userReactions);
      localStorage.setItem(STORAGE_KEYS.USER_REACTIONS, JSON.stringify(restored.userReactions));
    }

    // Auto-sync the restored data directly to Firestore Cloud!
    try {
      const res = await createManualCloudBackup(restored, `Restauration sauvegarde et synchronisation (${cleanArticles.length} article(s))`);
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIMESTAMP, res.timestamp);
      console.log('Restored data successfully auto-synced to Firestore:', res.backupId);
    } catch (e) {
      console.error('Failed to auto-sync restored data to cloud', e);
    }
  };

  const handleSyncToCloud = async (note = 'Synchronisation manuelle') => {
    const currentArticles = articles.length > 0 
      ? articles 
      : (() => {
          try {
            const s = localStorage.getItem(STORAGE_KEYS.ARTICLES);
            return s ? JSON.parse(s) : [];
          } catch { return []; }
        })();

    const cleanArticles = currentArticles.filter((a: Article) => !isObsoleteDemoArticle(a));

    const payload: BlogBackupData = {
      articles: cleanArticles,
      categories,
      comments: comments.filter((c) => !isObsoleteDemoComment(c)),
      subscribers,
      polls,
      userPollVotes,
      userReactions,
    };
    const res = await createManualCloudBackup(payload, note);
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIMESTAMP, res.timestamp);
    console.log('Synchronized to Cloud:', res.backupId, `${cleanArticles.length} article(s)`);
    return res;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f0fa] text-slate-800 font-['Nunito',sans-serif]">
      {/* Top Beige/Peach Announcement Banner */}
      <TopBanner />

      {/* Main Header with Mascot */}
      <Header
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onOpenSearch={() => {
          if (activeArticleId) {
            handleBackToHome();
          }
          // focus search input
          const el = document.querySelector('input[type="text"]') as HTMLInputElement;
          if (el) el.focus();
        }}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onGoHome={handleBackToHome}
        isAdminLoggedIn={isAdminLoggedIn}
        searchQuery={searchQuery}
      />

      {/* Sidebar Drawer */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          if (activeArticleId) {
            handleBackToHome();
          }
        }}
        selectedCategory={selectedCategory}
        categories={categories}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentArticle ? (
          /* SINGLE ARTICLE READING VIEW */
          <ArticleView
            article={currentArticle}
            comments={currentComments}
            userReactions={userReactions}
            polls={polls}
            userPollVotes={userPollVotes}
            onVote={handleVote}
            onBack={handleBackToHome}
            onReact={handleReact}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
            isAdminLoggedIn={isAdminLoggedIn}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              handleBackToHome();
            }}
            relatedArticles={relatedArticles}
            onSelectArticle={handleOpenArticle}
          />
        ) : (
          /* READERS LIST VIEW */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            
            {/* Featured Article Section (Show only when no filter or search is active) */}
            {selectedCategory === 'all' && !searchQuery && featuredArticle && (
              <FeaturedArticleHero
                article={featuredArticle}
                onReadArticle={handleOpenArticle}
              />
            )}

            {/* Category Filter Bar & Live Search */}
            <CategoryNav
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              counts={categoryCounts}
              categories={categories}
            />

            {/* Section Heading */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h3 className="font-['Comfortaa',cursive] text-lg sm:text-2xl font-bold text-slate-900">
                  {searchQuery ? (
                    <span>Résultats pour « {searchQuery} »</span>
                  ) : selectedCategory === 'all' ? (
                    <span>Derniers Articles & Actualités</span>
                  ) : (
                    <span>{selectedCategory}</span>
                  )}
                </h3>
                <Sparkles className="w-4 h-4 text-[#7c3aed]" />
              </div>

              <span className="text-xs font-semibold text-slate-500">
                {filteredArticles.length} article{filteredArticles.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Articles Grid */}
            {isLoadingCloud && articles.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#e5dbf7] p-12 text-center max-w-lg mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-3xl bg-purple-100 text-[#7c3aed] flex items-center justify-center mx-auto mb-4 border border-purple-200">
                  <Sparkles className="w-8 h-8 animate-spin" />
                </div>
                <h4 className="font-['Comfortaa',cursive] text-lg font-bold text-slate-900 mb-2">
                  Synchronisation avec le Cloud... ✨
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Chargement des derniers articles publiés en direct...
                </p>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#e5dbf7] p-12 text-center max-w-lg mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-3xl bg-purple-100 text-[#7c3aed] flex items-center justify-center mx-auto mb-4 border border-purple-200">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h4 className="font-['Comfortaa',cursive] text-lg font-bold text-slate-900 mb-2">
                  {articles.length === 0 ? 'Aucun article publié pour le moment' : 'Aucun article trouvé'}
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                  {articles.length === 0
                    ? "Aucun article n'est actuellement en ligne sur le blog. Revenez très vite pour découvrir mon actualité !"
                    : "Aucun article ne correspond à votre recherche ou catégorie actuelle. Essayez d'autres mots-clés ou réinitialisez les filtres."}
                </p>
                {articles.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    Voir tous les articles
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onReadArticle={handleOpenArticle}
                  />
                ))}
              </div>
            )}

            {/* Newsletter Subscription Block */}
            <div className="mt-12 sm:mt-16">
              <NewsletterSection onSubscribe={handleSubscribe} />
            </div>

          </div>
        )}
      </main>

      {/* Global Kawaii Footer */}
      <footer className="bg-white border-t border-[#e5dbf7] py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-['Comfortaa',cursive] font-bold text-[#3D2E39]">Sticky & Kawaii</span>
            <span>•</span>
            <span>Le Blog Officiel & Coulisses d'Atelier</span>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href="https://stickyandkawaii.eu" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-[#4C2882] font-semibold transition-colors"
            >
              Boutique Officielle
            </a>
            <span>•</span>
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="hover:text-[#4C2882] transition-colors cursor-pointer"
            >
              {isAdminLoggedIn ? 'Studio Auteur' : 'Connexion Auteur'}
            </button>
          </div>
        </div>
      </footer>

      {/* Admin Modal & Article Editor */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        articles={articles}
        comments={comments}
        subscribers={subscribers}
        categories={categories}
        onSaveArticle={handleSaveArticle}
        onDeleteArticle={handleDeleteArticle}
        onDeleteComment={handleDeleteComment}
        onDeleteSubscriber={handleDeleteSubscriber}
        onAddSubscriber={handleAddSubscriber}
        onSaveCategory={handleSaveCategory}
        onDeleteCategory={handleDeleteCategory}
        onResetDefaults={handleResetDefaults}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogin={handleAdminLogin}
        onLogout={handleAdminLogout}
        onPreviewArticle={handleOpenArticle}
        onRestoreData={handleRestoreData}
        onSyncToCloud={handleSyncToCloud}
        polls={polls}
        userPollVotes={userPollVotes}
        userReactions={userReactions}
      />
    </div>
  );
}
