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
import { INITIAL_ARTICLES, INITIAL_COMMENTS, INITIAL_SUBSCRIBERS, INITIAL_CATEGORIES, INITIAL_POLLS } from './data/initialArticles';
import { Sparkles, Compass, AlertCircle, BookOpen, Heart } from 'lucide-react';
import { testFirestoreConnection } from './lib/firebase';
import { BlogBackupData } from './lib/cloudBackupService';

const STORAGE_KEYS = {
  ARTICLES: 'sticky_kawaii_blog_articles_v2',
  COMMENTS: 'sticky_kawaii_blog_comments_v2',
  USER_REACTIONS: 'sticky_kawaii_blog_user_reactions_v2',
  ADMIN_AUTH: 'sticky_kawaii_blog_admin_auth_v2',
  SUBSCRIBERS: 'sticky_kawaii_blog_subscribers_v2',
  CATEGORIES: 'sticky_kawaii_blog_categories_v2',
  POLLS: 'sticky_kawaii_blog_polls_v2',
  USER_POLL_VOTES: 'sticky_kawaii_blog_user_poll_votes_v2',
};

export default function App() {
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

  // Articles state
  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ARTICLES);
      if (saved) {
        const loaded: Article[] = JSON.parse(saved);
        return loaded.map((art) => ({
          ...art,
          author: {
            ...art.author,
            name: art.author?.name === 'Sticky' ? 'Karine' : (art.author?.name || 'Karine'),
          },
        }));
      }
    } catch (e) {
      console.error('Failed to load articles from storage', e);
    }
    return INITIAL_ARTICLES;
  });

  // Comments state
  const [comments, setComments] = useState<Comment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMMENTS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load comments from storage', e);
    }
    return INITIAL_COMMENTS;
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

  // Verify Firestore connection on startup (non-blocking)
  useEffect(() => {
    testFirestoreConnection().catch((err) => {
      console.warn('Initial Firestore connectivity probe warning:', err);
    });
  }, []);

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

  // Support hash & query navigation if present
  useEffect(() => {
    const handleUrlState = () => {
      const hash = window.location.hash.replace('#', '');
      const params = new URLSearchParams(window.location.search);

      // Check admin trigger via URL
      if (hash === 'admin' || params.get('admin') === 'true') {
        setIsAdminModalOpen(true);
      }

      if (hash.startsWith('article-')) {
        const id = hash.replace('article-', '');
        const target = articles.find((a) => a.id === id || a.slug === id);
        if (target) {
          setActiveArticleId(target.id);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };

    handleUrlState();
    window.addEventListener('hashchange', handleUrlState);
    return () => window.removeEventListener('hashchange', handleUrlState);
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
    window.location.hash = `article-${article.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setActiveArticleId(null);
    window.location.hash = '';
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

  const handleSaveArticle = (savedArticle: Article) => {
    setArticles((prev) => {
      const exists = prev.some((a) => a.id === savedArticle.id);
      if (exists) {
        return prev.map((a) => (a.id === savedArticle.id ? savedArticle : a));
      } else {
        return [savedArticle, ...prev];
      }
    });
  };

  const handleDeleteArticle = (articleId: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== articleId));
    if (activeArticleId === articleId) {
      handleBackToHome();
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

  const handleRestoreData = (restored: BlogBackupData) => {
    if (restored.articles && Array.isArray(restored.articles)) {
      setArticles(restored.articles);
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(restored.articles));
    }
    if (restored.categories && Array.isArray(restored.categories)) {
      setCategories(restored.categories);
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(restored.categories));
    }
    if (restored.comments && Array.isArray(restored.comments)) {
      setComments(restored.comments);
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(restored.comments));
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
            {filteredArticles.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#e5dbf7] p-12 text-center max-w-lg mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-3xl bg-purple-100 text-[#7c3aed] flex items-center justify-center mx-auto mb-4 border border-purple-200">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h4 className="font-['Comfortaa',cursive] text-lg font-bold text-slate-900 mb-2">
                  Aucun article trouvé
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                  Aucun article ne correspond à votre recherche ou catégorie actuelle. Essayez d'autres mots-clés ou réinitialisez les filtres.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  Voir tous les articles
                </button>
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
      />
    </div>
  );
}
