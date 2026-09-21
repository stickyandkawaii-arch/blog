import React, { useState, useEffect, useMemo } from 'react';
import { TopBanner } from './components/TopBanner';
import { Header } from './components/Header';
import { SidebarDrawer } from './components/SidebarDrawer';
import { CategoryNav } from './components/CategoryNav';
import { FeaturedArticleHero } from './components/FeaturedArticleHero';
import { ArticleCard } from './components/ArticleCard';
import { ArticleView } from './components/ArticleView';
import { AdminModal } from './components/AdminModal';

import { Article, Comment, Category, ReactionType, UserReactions } from './types';
import { INITIAL_ARTICLES, INITIAL_COMMENTS } from './data/initialArticles';
import { Sparkles, Compass, AlertCircle, BookOpen, Heart } from 'lucide-react';

const STORAGE_KEYS = {
  ARTICLES: 'sticky_kawaii_blog_articles_v1',
  COMMENTS: 'sticky_kawaii_blog_comments_v1',
  USER_REACTIONS: 'sticky_kawaii_blog_user_reactions_v1',
  ADMIN_AUTH: 'sticky_kawaii_blog_admin_auth_v1',
};

export default function App() {
  // Articles state
  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ARTICLES);
      if (saved) {
        return JSON.parse(saved);
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

  // Admin session state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
  });

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
      localStorage.setItem(STORAGE_KEYS.USER_REACTIONS, JSON.stringify(userReactions));
    } catch (e) {
      console.error('Failed to save reactions', e);
    }
  }, [userReactions]);

  // Support hash navigation if present
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('article-')) {
        const id = hash.replace('article-', '');
        const target = articles.find((a) => a.id === id || a.slug === id);
        if (target) {
          setActiveArticleId(target.id);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [articles]);

  // Read single article
  const currentArticle = useMemo(() => {
    if (!activeArticleId) return null;
    return articles.find((a) => a.id === activeArticleId) || null;
  }, [activeArticleId, articles]);

  // Featured article: first with featured:true and published, or first published article
  const featuredArticle = useMemo(() => {
    return (
      articles.find((a) => a.featured && a.status === 'published') ||
      articles.find((a) => a.status === 'published') ||
      articles[0]
    );
  }, [articles]);

  // Filtered articles list
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      // In reader mode, don't show drafts unless admin
      if (art.status === 'draft' && !isAdminLoggedIn) return false;

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
    const counts: Record<Category | 'all', number> = {
      all: 0,
      'Coulisses & Créations': 0,
      'Actus Boutique': 0,
      Tutoriels: 0,
      Gazettes: 0,
    };

    articles.forEach((art) => {
      if (art.status === 'draft' && !isAdminLoggedIn) return;
      counts.all += 1;
      if (counts[art.category] !== undefined) {
        counts[art.category] += 1;
      }
    });

    return counts;
  }, [articles, isAdminLoggedIn]);

  // Current article comments
  const currentComments = useMemo(() => {
    if (!currentArticle) return [];
    return comments.filter((c) => c.articleId === currentArticle.id);
  }, [comments, currentArticle]);

  // Related articles
  const relatedArticles = useMemo(() => {
    if (!currentArticle) return [];
    return articles.filter(
      (a) => a.id !== currentArticle.id && a.status === 'published'
    );
  }, [articles, currentArticle]);

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

  const handleAdminLogin = (password: string): boolean => {
    // Master password as defined in project documentation
    if (password === 'kawaii2026') {
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

  const handleResetDefaults = () => {
    setArticles(INITIAL_ARTICLES);
    setComments(INITIAL_COMMENTS);
    setUserReactions({});
    localStorage.removeItem(STORAGE_KEYS.ARTICLES);
    localStorage.removeItem(STORAGE_KEYS.COMMENTS);
    localStorage.removeItem(STORAGE_KEYS.USER_REACTIONS);
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

          </div>
        )}
      </main>

      {/* Admin Modal & Article Editor */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        articles={articles}
        comments={comments}
        onSaveArticle={handleSaveArticle}
        onDeleteArticle={handleDeleteArticle}
        onDeleteComment={handleDeleteComment}
        onResetDefaults={handleResetDefaults}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogin={handleAdminLogin}
        onLogout={handleAdminLogout}
        onPreviewArticle={handleOpenArticle}
      />
    </div>
  );
}
