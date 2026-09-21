import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Lock, 
  Unlock, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  FileText, 
  Check, 
  Sparkles, 
  Image as ImageIcon,
  Save,
  Clock,
  Calendar,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  MessageCircle,
  Search
} from 'lucide-react';
import { Article, Category, Comment } from '../types';
import { 
  featuredImg, 
  tutorialImg, 
  boutiqueImg, 
  gazetteImg, 
  defaultAuthor 
} from '../data/initialArticles';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  comments: Comment[];
  onSaveArticle: (article: Article) => void;
  onDeleteArticle: (articleId: string) => void;
  onDeleteComment: (commentId: string) => void;
  onResetDefaults: () => void;
  isAdminLoggedIn: boolean;
  onLogin: (password: string) => boolean;
  onLogout: () => void;
  onPreviewArticle: (article: Article) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  articles,
  comments,
  onSaveArticle,
  onDeleteArticle,
  onDeleteComment,
  onResetDefaults,
  isAdminLoggedIn,
  onLogin,
  onLogout,
  onPreviewArticle,
}) => {
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [currentTab, setCurrentTab] = useState<'list' | 'editor' | 'comments'>('list');
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);

  // Comments moderation state
  const [commentFilterArticle, setCommentFilterArticle] = useState<string>('all');
  const [commentSearchQuery, setCommentSearchQuery] = useState('');
  const [confirmDeleteCommentId, setConfirmDeleteCommentId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Category>('Coulisses & Créations');
  const [coverImage, setCoverImage] = useState(featuredImg);
  const [readingTime, setReadingTime] = useState('4 min');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [tagsInput, setTagsInput] = useState('Stickers, Kawaii, Création');
  const [isFeatured, setIsFeatured] = useState(false);
  const [previewTab, setPreviewTab] = useState<'edit' | 'preview'>('edit');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Preset covers
  const presetCovers = [
    { label: 'Atelier & Holographique', url: featuredImg },
    { label: 'Tuto Journaling & Craft', url: tutorialImg },
    { label: 'Packaging Boutique & Colis', url: boutiqueImg },
    { label: 'Gazette Cosy & Thé', url: gazetteImg },
  ];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(password);
    if (!success) {
      setLoginError('Mot de passe incorrect (essayez : kawaii2026)');
    } else {
      setLoginError('');
      setPassword('');
    }
  };

  const handleQuickTestLogin = () => {
    onLogin('kawaii2026');
    setLoginError('');
  };

  const handleNewArticle = () => {
    setEditorMode('create');
    setActiveArticleId(null);
    setTitle('');
    setSummary('');
    setContent(`### Bienvenue dans cet article !\n\nVoici le premier paragraphe de votre article doux et réconfortant. Racontez une anecdote sur la création de vos stickers ou vos astuces créatives.\n\n> *« Une petite phrase inspirante pour éclairer la journée de vos lecteurs. »*\n\n### 💡 L'astuce kawaii de Sticky\nPartagez un conseil pratique ici !`);
    setCategory('Coulisses & Créations');
    setCoverImage(featuredImg);
    setReadingTime('4 min');
    setStatus('published');
    setTagsInput('Stickers, Papeterie, DIY');
    setIsFeatured(false);
    setCurrentTab('editor');
    setPreviewTab('edit');
  };

  const handleEditArticle = (art: Article) => {
    setEditorMode('edit');
    setActiveArticleId(art.id);
    setTitle(art.title);
    setSummary(art.summary);
    setContent(art.content);
    setCategory(art.category);
    setCoverImage(art.coverImage);
    setReadingTime(art.readingTime);
    setStatus(art.status);
    setTagsInput(art.tags.join(', '));
    setIsFeatured(!!art.featured);
    setCurrentTab('editor');
    setPreviewTab('edit');
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim() || !content.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const now = new Date();
    const formattedDate = `${now.getDate()} ${now.toLocaleString('fr-FR', { month: 'long' })} ${now.getFullYear()}`;

    const existingArticle = articles.find((a) => a.id === activeArticleId);

    const articleData: Article = {
      id: activeArticleId || `art-${Date.now()}`,
      slug: title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      category,
      coverImage,
      readingTime: readingTime.trim() || '3 min',
      publishedAt: existingArticle?.publishedAt || formattedDate,
      featured: isFeatured,
      status,
      author: existingArticle?.author || defaultAuthor,
      reactions: existingArticle?.reactions || { stars: 0, hearts: 0, butterflies: 0 },
      tags: tags.length > 0 ? tags : ['Sticky', 'Kawaii'],
    };

    onSaveArticle(articleData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setCurrentTab('list');
    }, 1000);
  };

  // Helper toolbar for content insertion
  const insertText = (prefix: string, suffix: string = '') => {
    setContent((prev) => `${prev}\n\n${prefix}Texte ici${suffix}`);
  };

  // Filtered comments for moderation
  const filteredComments = useMemo(() => {
    return comments.filter((c) => {
      if (commentFilterArticle !== 'all' && c.articleId !== commentFilterArticle) {
        return false;
      }
      if (commentSearchQuery.trim()) {
        const q = commentSearchQuery.toLowerCase().trim();
        const matchAuthor = c.author.toLowerCase().includes(q);
        const matchContent = c.content.toLowerCase().includes(q);
        return matchAuthor || matchContent;
      }
      return true;
    });
  }, [comments, commentFilterArticle, commentSearchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl border border-[#e5dbf7] shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#f4f0fa] border-b border-[#e5dbf7] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#7c3aed] text-white">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-['Comfortaa',cursive] text-base sm:text-lg font-bold text-[#4c1d95]">
                Espace Administration • Sticky and Kawaii
              </h2>
              <p className="text-xs text-slate-500">
                Gestion des publications & rédaction d'articles (blog.stickyandkawaii.eu)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminLoggedIn && (
              <button
                onClick={onLogout}
                className="text-xs font-semibold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors border border-rose-200"
              >
                Déconnexion
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-purple-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          
          {/* LOGIN VIEW */}
          {!isAdminLoggedIn ? (
            <div className="max-w-md mx-auto py-8 text-center">
              <div className="w-16 h-16 rounded-3xl bg-purple-100 text-[#7c3aed] flex items-center justify-center mx-auto mb-4 border border-purple-200">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="font-['Comfortaa',cursive] text-xl font-bold text-slate-900 mb-2">
                Accès Auteur Sécurisé
              </h3>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Connectez-vous pour rédiger de nouveaux articles, gérer vos brouillons et modérer les publications.
              </p>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mot de passe admin (ex: kawaii2026)"
                    className="w-full px-4 py-3 rounded-2xl bg-[#f4f0fa] border border-[#e5dbf7] text-sm text-center font-mono focus:outline-hidden focus:ring-2 focus:ring-[#7c3aed]"
                    autoFocus
                  />
                </div>

                {loginError && (
                  <p className="text-xs font-bold text-rose-600 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {loginError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  Se connecter
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-[#f4f0fa]">
                <button
                  type="button"
                  onClick={handleQuickTestLogin}
                  className="text-xs font-semibold text-[#7c3aed] hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Accès rapide démo (kawaii2026)
                </button>
              </div>
            </div>
          ) : (
            /* ADMIN DASHBOARD VIEW */
            <div>
              {/* Top Action Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#f4f0fa]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentTab('list')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      currentTab === 'list'
                        ? 'bg-[#7c3aed] text-white shadow-xs'
                        : 'bg-[#f4f0fa] text-slate-700 hover:bg-[#ebdffc]'
                    }`}
                  >
                    Articles ({articles.length})
                  </button>

                  <button
                    onClick={handleNewArticle}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      currentTab === 'editor' && editorMode === 'create'
                        ? 'bg-[#7c3aed] text-white shadow-xs'
                        : 'bg-[#f4f0fa] text-[#7c3aed] hover:bg-[#ebdffc]'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    Nouvel article
                  </button>

                  <button
                    onClick={() => setCurrentTab('comments')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      currentTab === 'comments'
                        ? 'bg-[#7c3aed] text-white shadow-xs'
                        : 'bg-[#f4f0fa] text-slate-700 hover:bg-[#ebdffc]'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Modération Commentaires</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white/20 border border-current/20">
                      {comments.length}
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (confirm('Voulez-vous réinitialiser les articles avec les données par défaut de Sticky and Kawaii ?')) {
                        onResetDefaults();
                      }
                    }}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#7c3aed] px-3 py-1.5 rounded-lg border border-[#e5dbf7] hover:bg-[#f4f0fa] transition-colors"
                    title="Réinitialiser les articles de base"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Réinitialiser</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: ARTICLES LIST */}
              {currentTab === 'list' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    {articles.map((art) => (
                      <div
                        key={art.id}
                        className="p-4 rounded-2xl bg-[#fcfaff] border border-[#e5dbf7] hover:border-[#cbb3f5] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <img
                            src={art.coverImage}
                            alt={art.title}
                            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#e5dbf7]"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-[#6d28d9]">
                                {art.category}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  art.status === 'published'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {art.status === 'published' ? 'Publié' : 'Brouillon'}
                              </span>
                              {art.featured && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#faeedd] text-[#5c3818] border border-[#ebd9c1]">
                                  ✨ À la une
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-sm text-slate-900 truncate mt-1">
                              {art.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-3">
                              <span>{art.publishedAt}</span>
                              <span>• {art.readingTime}</span>
                              <span>• {art.reactions.stars + art.reactions.hearts + art.reactions.butterflies} réactions</span>
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          <button
                            onClick={() => {
                              onPreviewArticle(art);
                              onClose();
                            }}
                            className="p-2 rounded-xl text-slate-600 hover:text-[#7c3aed] hover:bg-purple-100 transition-colors"
                            title="Voir l'article en tant que lecteur"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditArticle(art)}
                            className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Modifier cet article"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Supprimer l'article "${art.title}" ?`)) {
                                onDeleteArticle(art.id);
                              }
                            }}
                            className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
                            title="Supprimer l'article"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: ARTICLE EDITOR */}
              {currentTab === 'editor' && (
                <form onSubmit={handleSaveSubmit} className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#f4f0fa]">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-[#7c3aed]" />
                      {editorMode === 'create' ? 'Rédiger un nouvel article' : 'Modifier l’article'}
                    </h3>

                    {/* Sub-tabs for editor: Edit vs Live Preview */}
                    <div className="flex items-center gap-1 bg-[#f4f0fa] p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setPreviewTab('edit')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                          previewTab === 'edit'
                            ? 'bg-white text-[#7c3aed] shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Éditeur
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewTab('preview')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                          previewTab === 'preview'
                            ? 'bg-white text-[#7c3aed] shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Aperçu direct
                      </button>
                    </div>
                  </div>

                  {previewTab === 'edit' ? (
                    <div className="space-y-4">
                      {/* Title */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Titre de l'article *
                        </label>
                        <input
                          type="text"
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Ex : Nos secrets pour organiser votre carnet kawaii..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#fcfaff] border border-[#e5dbf7] text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#7c3aed]"
                        />
                      </div>

                      {/* Category & Status & Reading Time */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Catégorie *
                          </label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as Category)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#fcfaff] border border-[#e5dbf7] text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#7c3aed]"
                          >
                            <option value="Coulisses & Créations">Coulisses & Créations</option>
                            <option value="Actus Boutique">Actus Boutique</option>
                            <option value="Tutoriels">Tutoriels</option>
                            <option value="Gazettes">Gazettes</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Statut de publication *
                          </label>
                          <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#fcfaff] border border-[#e5dbf7] text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#7c3aed]"
                          >
                            <option value="published">Publier immédiatement</option>
                            <option value="draft">Enregistrer en brouillon</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Temps de lecture estimé
                          </label>
                          <input
                            type="text"
                            value={readingTime}
                            onChange={(e) => setReadingTime(e.target.value)}
                            placeholder="Ex : 5 min"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#fcfaff] border border-[#e5dbf7] text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#7c3aed]"
                          />
                        </div>
                      </div>

                      {/* Summary */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Résumé d'accroche (court paragraphe pour les cartes) *
                        </label>
                        <textarea
                          required
                          rows={2}
                          value={summary}
                          onChange={(e) => setSummary(e.target.value)}
                          placeholder="Un texte captivant en 2 ou 3 phrases qui donne envie de cliquer..."
                          className="w-full px-3.5 py-2 rounded-xl bg-[#fcfaff] border border-[#e5dbf7] text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#7c3aed]"
                        />
                      </div>

                      {/* Cover Image Selector */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Image de couverture *
                        </label>
                        
                        {/* Preset illustration thumbnails */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                          {presetCovers.map((preset, idx) => (
                            <button
                              type="button"
                              key={idx}
                              onClick={() => setCoverImage(preset.url)}
                              className={`relative rounded-xl overflow-hidden border-2 text-left p-1 transition-all ${
                                coverImage === preset.url
                                  ? 'border-[#7c3aed] ring-2 ring-[#7c3aed]/20'
                                  : 'border-transparent hover:border-[#e5dbf7]'
                              }`}
                            >
                              <img
                                src={preset.url}
                                alt={preset.label}
                                className="w-full h-16 object-cover rounded-lg"
                                referrerPolicy="no-referrer"
                              />
                              <span className="block text-[10px] font-semibold text-slate-700 mt-1 truncate">
                                {preset.label}
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* Custom Image URL input */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={coverImage}
                            onChange={(e) => setCoverImage(e.target.value)}
                            placeholder="Ou collez une URL d'image personnalisée"
                            className="flex-1 px-3.5 py-2 rounded-xl bg-[#fcfaff] border border-[#e5dbf7] text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#7c3aed]"
                          />
                        </div>
                      </div>

                      {/* Content editor toolbar */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                          <label className="text-xs font-bold text-slate-700">
                            Contenu riche de l'article *
                          </label>
                          <div className="flex items-center gap-1 text-[11px] text-[#7c3aed]">
                            <button
                              type="button"
                              onClick={() => insertText('### ')}
                              className="px-2 py-0.5 rounded bg-purple-100 hover:bg-purple-200 font-bold"
                            >
                              + Titre
                            </button>
                            <button
                              type="button"
                              onClick={() => insertText('> ')}
                              className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 hover:bg-amber-200 font-bold"
                            >
                              + Citation
                            </button>
                            <button
                              type="button"
                              onClick={() => insertText('- Point 1\n- Point 2\n- Point 3')}
                              className="px-2 py-0.5 rounded bg-pink-100 text-pink-900 hover:bg-pink-200 font-bold"
                            >
                              + Liste
                            </button>
                            <button
                              type="button"
                              onClick={() => insertText('### 💡 L\'astuce kawaii de Sticky\nVotre super conseil ici !')}
                              className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 hover:bg-indigo-200 font-bold"
                            >
                              + Astuce
                            </button>
                          </div>
                        </div>

                        <textarea
                          required
                          rows={10}
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          placeholder="Rédigez votre article complet avec des paragraphes, sous-titres ###, citations > ..."
                          className="w-full font-mono text-xs sm:text-sm p-3.5 rounded-xl bg-[#fcfaff] border border-[#e5dbf7] text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#7c3aed] leading-relaxed"
                        />
                      </div>

                      {/* Tags & Featured Checkbox */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Mots-clés (séparés par des virgules)
                          </label>
                          <input
                            type="text"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            placeholder="Stickers, Papeterie, Procreate..."
                            className="w-full px-3.5 py-2 rounded-xl bg-[#fcfaff] border border-[#e5dbf7] text-xs sm:text-sm"
                          />
                        </div>

                        <div className="flex items-center sm:justify-center">
                          <label className="flex items-center gap-2 cursor-pointer pt-3">
                            <input
                              type="checkbox"
                              checked={isFeatured}
                              onChange={(e) => setIsFeatured(e.target.checked)}
                              className="w-4 h-4 rounded text-[#7c3aed] focus:ring-[#7c3aed] border-purple-300"
                            />
                            <span className="text-xs font-bold text-slate-800">
                              Mettre en avant comme "Article à la une"
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* LIVE PREVIEW */
                    <div className="bg-[#f4f0fa] p-4 sm:p-6 rounded-2xl border border-[#e5dbf7]">
                      <div className="bg-white p-6 rounded-2xl border border-[#e5dbf7] shadow-xs">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-[#6d28d9]">
                          {category}
                        </span>
                        <h2 className="font-['Comfortaa',cursive] text-2xl font-bold text-slate-900 mt-3 mb-2">
                          {title || 'Titre de l’article'}
                        </h2>
                        <p className="text-sm text-slate-600 mb-4 italic">
                          {summary || 'Résumé de l’article...'}
                        </p>
                        <div className="aspect-16/9 rounded-xl overflow-hidden mb-4 border">
                          <img
                            src={coverImage}
                            alt="Aperçu"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed font-sans">
                          {content}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Bar */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#f4f0fa]">
                    <button
                      type="button"
                      onClick={() => setCurrentTab('list')}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-[#f4f0fa] transition-colors"
                    >
                      Annuler
                    </button>

                    <div className="flex items-center gap-3">
                      {saveSuccess && (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <Check className="w-4 h-4" /> Enregistré avec succès !
                        </span>
                      )}

                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>
                          {status === 'published' ? 'Publier l’article' : 'Enregistrer le brouillon'}
                        </span>
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* TAB 3: COMMENTS MODERATION */}
              {currentTab === 'comments' && (
                <div className="space-y-4">
                  {/* Filter & Search Bar */}
                  <div className="p-4 rounded-2xl bg-[#f4f0fa] border border-[#e5dbf7] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Article Filter */}
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-slate-600 shrink-0">
                        Filtrer par article :
                      </label>
                      <select
                        value={commentFilterArticle}
                        onChange={(e) => setCommentFilterArticle(e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-[#e5dbf7] text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#7c3aed]/30"
                      >
                        <option value="all">Tous les articles ({comments.length})</option>
                        {articles.map((art) => {
                          const artCommentsCount = comments.filter((c) => c.articleId === art.id).length;
                          return (
                            <option key={art.id} value={art.id}>
                              {art.title.slice(0, 35)}... ({artCommentsCount})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Comment Keyword Search */}
                    <div className="relative sm:w-64">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={commentSearchQuery}
                        onChange={(e) => setCommentSearchQuery(e.target.value)}
                        placeholder="Rechercher pseudo ou texte..."
                        className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-white border border-[#e5dbf7] text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#7c3aed]/30"
                      />
                      {commentSearchQuery && (
                        <button
                          onClick={() => setCommentSearchQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Comments Count Notification */}
                  <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                    <span>
                      {filteredComments.length} commentaire{filteredComments.length > 1 ? 's' : ''} trouvé{filteredComments.length > 1 ? 's' : ''}
                    </span>
                    <span className="text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100">
                      Modération active : les suppressions sont immédiates
                    </span>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-3">
                    {filteredComments.length === 0 ? (
                      <div className="text-center py-12 bg-[#fcfaff] rounded-2xl border border-dashed border-[#e5dbf7]">
                        <MessageCircle className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                        <p className="text-sm font-bold text-slate-700">
                          Aucun commentaire à afficher
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {commentSearchQuery || commentFilterArticle !== 'all'
                            ? 'Essayez de réinitialiser vos filtres de recherche.'
                            : 'Les commentaires laissés par vos lecteurs apparaîtront ici pour modération.'}
                        </p>
                      </div>
                    ) : (
                      filteredComments.map((comm) => {
                        const targetArticle = articles.find((a) => a.id === comm.articleId);

                        return (
                          <div
                            key={comm.id}
                            className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e5dbf7] hover:shadow-xs transition-all flex flex-col sm:flex-row items-start justify-between gap-4"
                          >
                            <div className="flex-1">
                              {/* Meta: Author, Date, Article */}
                              <div className="flex items-center gap-2.5 flex-wrap mb-2">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-2xs ${comm.avatarColor}`}>
                                  {comm.avatarIcon || comm.author.slice(0, 2).toUpperCase()}
                                </div>
                                <span className="font-bold text-xs sm:text-sm text-slate-900">
                                  {comm.author}
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="text-[11px] text-slate-500">
                                  {comm.createdAt}
                                </span>
                                <span className="text-slate-300">•</span>
                                {targetArticle && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-[#7c3aed] text-[11px] font-semibold border border-purple-100">
                                    <FileText className="w-3 h-3" />
                                    {targetArticle.title.slice(0, 28)}...
                                  </span>
                                )}
                              </div>

                              {/* Comment Content */}
                              <p className="text-xs sm:text-sm text-slate-700 bg-[#fcfaff] p-3 rounded-xl border border-[#f0e8fc] leading-relaxed">
                                {comm.content}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="shrink-0 self-end sm:self-center">
                              {confirmDeleteCommentId === comm.id ? (
                                <div className="flex items-center gap-1 bg-rose-50 p-1.5 rounded-xl border border-rose-200">
                                  <span className="text-[11px] font-bold text-rose-700 px-1">
                                    Supprimer ?
                                  </span>
                                  <button
                                    onClick={() => {
                                      onDeleteComment(comm.id);
                                      setConfirmDeleteCommentId(null);
                                    }}
                                    className="px-2 py-1 text-[11px] font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer"
                                  >
                                    Oui
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteCommentId(null)}
                                    className="px-2 py-1 text-[11px] font-semibold rounded-lg text-slate-500 hover:bg-white transition-colors cursor-pointer"
                                  >
                                    Non
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDeleteCommentId(comm.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 transition-all cursor-pointer"
                                  title="Supprimer ce commentaire"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Supprimer</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
