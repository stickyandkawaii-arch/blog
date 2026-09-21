import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Image as ImageIconLucide,
  Save,
  Clock,
  Calendar,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  MessageCircle,
  Search,
  Globe,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Share2,
  ArrowLeft,
  Layers,
  BarChart3,
  Heading2,
  Heading3,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Smile,
  Copy,
  Sliders,
  ExternalLink,
  ShieldCheck,
  Send,
  Heart,
  Link,
  Code,
  Eye as EyeIcon,
  Star,
  Mail,
  Download,
  UserCheck,
  Users,
  CheckCheck,
  FolderHeart,
  Palette,
  ShoppingBag,
  Coffee,
  Bookmark,
  Tag,
  Gift,
  Lightbulb,
  Scissors,
  PenTool,
  Gamepad2,
  Compass,
  Upload,
  UploadCloud,
  FileImage,
  ChevronDown,
  ChevronUp,
  CalendarClock,
  Timer
} from 'lucide-react';
import { Article, Category, Comment, ArticleSEO, NewsletterSubscriber, CategoryItem } from '../types';
import { 
  AVAILABLE_CATEGORY_ICONS, 
  CATEGORY_COLORS, 
  renderCategoryIcon, 
  getCategoryBadgeClasses, 
  getCategoryColorConfig 
} from '../utils/categoryHelpers';
import { 
  featuredImg, 
  tutorialImg, 
  boutiqueImg, 
  gazetteImg, 
  defaultAuthor 
} from '../data/initialArticles';
import { ShopifyHtmlEditor } from './ShopifyHtmlEditor';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  categories: CategoryItem[];
  comments: Comment[];
  subscribers: NewsletterSubscriber[];
  onSaveArticle: (article: Article) => void;
  onDeleteArticle: (articleId: string) => void;
  onSaveCategory: (category: CategoryItem, oldName?: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onDeleteComment: (commentId: string) => void;
  onDeleteSubscriber: (subscriberId: string) => void;
  onAddSubscriber: (email: string) => boolean;
  onResetDefaults: () => void;
  isAdminLoggedIn: boolean;
  onLogin: (email: string, password: string) => boolean;
  onLogout: () => void;
  onPreviewArticle: (article: Article) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  articles,
  categories,
  comments,
  subscribers,
  onSaveArticle,
  onDeleteArticle,
  onSaveCategory,
  onDeleteCategory,
  onDeleteComment,
  onDeleteSubscriber,
  onAddSubscriber,
  onResetDefaults,
  isAdminLoggedIn,
  onLogin,
  onLogout,
  onPreviewArticle,
}) => {
  // Auth state
  const [email, setEmail] = useState('stickyandkawaii@gmail.com');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Navigation tabs in studio
  const [currentTab, setCurrentTab] = useState<'articles' | 'editor' | 'categories' | 'comments' | 'subscribers' | 'stats'>('articles');
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);

  // Article filters in list
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'scheduled'>('all');

  // Category management state
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [categoryNameInput, setCategoryNameInput] = useState('');
  const [categoryDescInput, setCategoryDescInput] = useState('');
  const [categoryIconInput, setCategoryIconInput] = useState('Sparkles');
  const [categoryColorInput, setCategoryColorInput] = useState('purple');
  const [categoryFormError, setCategoryFormError] = useState('');
  const [categorySaveSuccess, setCategorySaveSuccess] = useState(false);
  const [confirmDeleteCategoryId, setConfirmDeleteCategoryId] = useState<string | null>(null);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  // Comments moderation
  const [commentSearchQuery, setCommentSearchQuery] = useState('');
  const [commentFilterArticle, setCommentFilterArticle] = useState<string>('all');
  const [confirmDeleteCommentId, setConfirmDeleteCommentId] = useState<string | null>(null);

  // Article deletion confirmation
  const [confirmDeleteArticleId, setConfirmDeleteArticleId] = useState<string | null>(null);

  // Reset defaults confirmation
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  // Subscribers state
  const [subscriberSearchQuery, setSubscriberSearchQuery] = useState('');
  const [subscriberSortOrder, setSubscriberSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [manualEmailInput, setManualEmailInput] = useState('');
  const [manualEmailError, setManualEmailError] = useState('');
  const [manualEmailSuccess, setManualEmailSuccess] = useState('');
  const [copiedEmailsToast, setCopiedEmailsToast] = useState(false);
  const [copiedSingleEmailId, setCopiedSingleEmailId] = useState<string | null>(null);
  const [confirmDeleteSubscriberId, setConfirmDeleteSubscriberId] = useState<string | null>(null);

  // Editor Form State
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Category>('Coulisses & Créations');
  const [coverImage, setCoverImage] = useState(featuredImg);
  const [readingTime, setReadingTime] = useState('4 min');
  const [status, setStatus] = useState<'published' | 'draft' | 'scheduled'>('published');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('09:00');
  const [tagsInput, setTagsInput] = useState('Stickers, Kawaii, Création');
  const [isFeatured, setIsFeatured] = useState(false);
  
  // Right sidebar collapsible panels
  const [isSeoPanelOpen, setIsSeoPanelOpen] = useState(false);
  const [isReadabilityPanelOpen, setIsReadabilityPanelOpen] = useState(false);
  
  // Editor view subtabs
  const [editorSubTab, setEditorSubTab] = useState<any>('write');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // SEO fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [customSlug, setCustomSlug] = useState('');

  // File Upload State for Cover Image
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState('');
  const [coverFileName, setCoverFileName] = useState('');
  const [showCoverUrlInput, setShowCoverUrlInput] = useState(false);

  // Insert Link Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('https://');
  const [linkNewTab, setLinkNewTab] = useState(true);
  const [linkTargetArticleId, setLinkTargetArticleId] = useState('');

  // File upload processing with canvas-based optimization for crisp storage
  const handleCoverFileUpload = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setCoverUploadError('Veuillez sélectionner un fichier image valide (PNG, JPG, WEBP, GIF, SVG).');
      return;
    }
    
    // 15 MB max file limit
    if (file.size > 15 * 1024 * 1024) {
      setCoverUploadError('L’image dépasse la limite de 15 Mo. Veuillez choisir une image plus légère.');
      return;
    }

    setCoverUploadError('');
    setIsUploadingCover(true);
    setCoverFileName(file.name);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (!dataUrl) {
          setCoverUploadError('Impossible de lire le fichier sélectionné.');
          setIsUploadingCover(false);
          return;
        }

        // Optimize high-resolution photos using canvas to fit smoothly in memory
        const img = new window.Image();
        img.onload = () => {
          const maxWidth = 1600;
          const maxHeight = 1200;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const optimized = canvas.toDataURL('image/jpeg', 0.88);
              setCoverImage(optimized);
              setIsUploadingCover(false);
              return;
            }
          }

          setCoverImage(dataUrl);
          setIsUploadingCover(false);
        };

        img.onerror = () => {
          setCoverImage(dataUrl);
          setIsUploadingCover(false);
        };

        img.src = dataUrl;
      };

      reader.onerror = () => {
        setCoverUploadError('Erreur lors de la lecture du fichier depuis votre ordinateur.');
        setIsUploadingCover(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setCoverUploadError('Une erreur inattendue est survenue lors de l’importation.');
      setIsUploadingCover(false);
    }
  };

  // Auto-calculate reading time when content changes
  useEffect(() => {
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 180));
    setReadingTime(`${minutes} min`);
  }, [content]);

  // Sync meta title & description defaults
  useEffect(() => {
    if (!metaTitle && title) {
      setMetaTitle(title);
    }
  }, [title, metaTitle]);

  useEffect(() => {
    if (!metaDescription && summary) {
      setMetaDescription(summary);
    }
  }, [summary, metaDescription]);

  // Auth Handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setLoginError('Veuillez renseigner votre email et mot de passe');
      return;
    }
    const success = onLogin(email, password);
    if (!success) {
      setLoginError('Identifiants incorrects. Vérifiez l’adresse email et le mot de passe.');
    } else {
      setLoginError('');
      setPassword('');
      setCurrentTab('articles');
    }
  };

  // Create new article
  const handleNewArticle = () => {
    setEditorMode('create');
    setActiveArticleId(null);
    setTitle('');
    setSummary('');
    setContent(`## Bienvenue dans cet article !

Voici le premier paragraphe de votre article doux et réconfortant. Racontez une anecdote sur la création de vos stickers ou vos astuces créatives.

> *« Une petite phrase inspirante pour égayer la journée de vos lecteurs. »*

## 💡 L'astuce kawaii de Karine
Partagez un conseil pratique ici avec des étapes claires et simples.`);
    setCategory('Coulisses & Créations');
    setCoverImage(featuredImg);
    setCoverFileName('');
    setCoverUploadError('');
    setShowCoverUrlInput(false);
    setReadingTime('4 min');
    setStatus('published');
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
    setScheduledDate(tomorrow.toISOString().split('T')[0]);
    setScheduledTime('09:00');
    setTagsInput('Stickers, Papeterie, DIY');
    setIsFeatured(false);
    setMetaTitle('');
    setMetaDescription('');
    setFocusKeyword('stickers kawaii');
    setCustomSlug('');
    setCurrentTab('editor');
    setEditorSubTab('write');
  };

  // Edit existing article
  const handleEditArticle = (art: Article) => {
    setEditorMode('edit');
    setActiveArticleId(art.id);
    setTitle(art.title);
    setSummary(art.summary);
    setContent(art.content);
    setCategory(art.category);
    setCoverImage(art.coverImage);
    setCoverFileName('');
    setCoverUploadError('');
    setShowCoverUrlInput(false);
    setReadingTime(art.readingTime);
    setStatus(art.status);
    if (art.scheduledAt) {
      const [d, t] = art.scheduledAt.split('T');
      setScheduledDate(d || '');
      setScheduledTime(t ? t.substring(0, 5) : '09:00');
    } else {
      const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
      setScheduledDate(tomorrow.toISOString().split('T')[0]);
      setScheduledTime('09:00');
    }
    setTagsInput(art.tags.join(', '));
    setIsFeatured(!!art.featured);
    setMetaTitle(art.seo?.metaTitle || art.title);
    setMetaDescription(art.seo?.metaDescription || art.summary);
    setFocusKeyword(art.seo?.focusKeyword || '');
    setCustomSlug(art.slug || '');
    setCurrentTab('editor');
    setEditorSubTab('write');
  };

  // Duplicate article
  const handleDuplicateArticle = (art: Article) => {
    const duplicate: Article = {
      ...art,
      id: `art-${Date.now()}`,
      title: `${art.title} (Copie)`,
      slug: `${art.slug}-copie-${Date.now()}`,
      status: 'draft',
      scheduledAt: undefined,
      publishedAt: 'Brouillon',
      reactions: { stars: 0, hearts: 0, butterflies: 0 }
    };
    onSaveArticle(duplicate);
    handleEditArticle(duplicate);
  };

  // Save submit
  const handleSaveSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || !summary.trim() || !content.trim()) {
      alert('Veuillez remplir au moins le titre, le résumé et le contenu.');
      return;
    }

    if (status === 'scheduled' && !scheduledDate) {
      alert('Veuillez choisir une date pour programmer la publication de l\'article.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const now = new Date();
    const formattedDate = `${now.getDate()} ${now.toLocaleString('fr-FR', { month: 'long' })} ${now.getFullYear()}`;
    const existingArticle = articles.find((a) => a.id === activeArticleId);

    const generatedSlug = (customSlug || title)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const effectiveScheduledAt = status === 'scheduled' ? `${scheduledDate}T${scheduledTime || '09:00'}` : undefined;

    let displayPublishedAt = existingArticle ? existingArticle.publishedAt : formattedDate;
    if (status === 'scheduled' && effectiveScheduledAt) {
      const scheduleDateObj = new Date(effectiveScheduledAt);
      const formattedScheduleDate = isNaN(scheduleDateObj.getTime())
        ? scheduledDate
        : `${scheduleDateObj.getDate()} ${scheduleDateObj.toLocaleString('fr-FR', { month: 'long' })} ${scheduleDateObj.getFullYear()} à ${scheduledTime || '09:00'}`;
      displayPublishedAt = `Programmé : ${formattedScheduleDate}`;
    } else if (status === 'draft') {
      displayPublishedAt = 'Brouillon';
    } else if (!existingArticle || existingArticle.status === 'draft' || existingArticle.status === 'scheduled') {
      displayPublishedAt = formattedDate;
    }

    const articleData: Article = {
      id: activeArticleId || `art-${Date.now()}`,
      slug: generatedSlug,
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      category,
      coverImage,
      readingTime,
      publishedAt: displayPublishedAt,
      featured: isFeatured,
      status,
      scheduledAt: effectiveScheduledAt,
      author: defaultAuthor,
      reactions: existingArticle ? existingArticle.reactions : { stars: 0, hearts: 0, butterflies: 0 },
      tags,
      seo: {
        metaTitle: metaTitle.trim() || title.trim(),
        metaDescription: metaDescription.trim() || summary.trim(),
        focusKeyword: focusKeyword.trim(),
        canonicalUrl: `https://blog.stickyandkawaii.eu/#article-${generatedSlug}`,
      }
    };

    onSaveArticle(articleData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Category management handlers
  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setCategoryNameInput('');
    setCategoryDescInput('');
    setCategoryIconInput('Sparkles');
    setCategoryColorInput('purple');
    setCategoryFormError('');
    setIsCategoryFormOpen(true);
  };

  const handleOpenEditCategory = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setCategoryNameInput(cat.name);
    setCategoryDescInput(cat.description || '');
    setCategoryIconInput(cat.icon || 'Sparkles');
    setCategoryColorInput(cat.color || 'purple');
    setCategoryFormError('');
    setIsCategoryFormOpen(true);
  };

  const handleSaveCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = categoryNameInput.trim();
    if (!trimmedName) {
      setCategoryFormError('Veuillez renseigner un nom pour la catégorie.');
      return;
    }

    const existing = categories.find(
      (c) => c.name.toLowerCase() === trimmedName.toLowerCase() && c.id !== editingCategory?.id
    );
    if (existing) {
      setCategoryFormError('Une catégorie avec ce nom existe déjà.');
      return;
    }

    const slug = trimmedName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const catData: CategoryItem = {
      id: editingCategory ? editingCategory.id : `cat-${Date.now()}`,
      name: trimmedName,
      slug: slug || `cat-${Date.now()}`,
      description: categoryDescInput.trim(),
      icon: categoryIconInput,
      color: categoryColorInput,
    };

    onSaveCategory(catData, editingCategory ? editingCategory.name : undefined);
    setCategorySaveSuccess(true);
    setTimeout(() => setCategorySaveSuccess(false), 2500);
    setIsCategoryFormOpen(false);
    setEditingCategory(null);
  };

  const handleDeleteCategoryConfirm = (categoryId: string) => {
    onDeleteCategory(categoryId);
    setConfirmDeleteCategoryId(null);
  };

  // Insert markdown helper in editor
  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('article-content-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = prefix + (selectedText || 'texte') + suffix;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText.length || 5));
    }, 50);
  };

  // ==========================================
  // READABILITY ANALYZER (Lisibilité & Phrases)
  // ==========================================
  const readabilityAnalysis = useMemo(() => {
    if (!content.trim()) {
      return {
        wordCount: 0,
        sentenceCount: 0,
        avgWordsPerSentence: 0,
        longSentences: [],
        longParagraphs: [],
        fleschScore: 100,
        fleschLabel: 'Très facile',
        headingsCount: 0,
        score: 100,
        issues: []
      };
    }

    // Split into sentences (by . ! ? followed by space or newline)
    const sentences = content
      .split(/(?<=[.!?])\s+|\n+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 5 && !s.startsWith('#') && !s.startsWith('!'));

    const words = content.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const sentenceCount = Math.max(1, sentences.length);
    const avgWordsPerSentence = Math.round((wordCount / sentenceCount) * 10) / 10;

    // Flag long sentences (> 20 words as requested by user)
    const longSentences = sentences
      .map((sentence) => {
        const count = sentence.split(/\s+/).filter(Boolean).length;
        return { sentence, count };
      })
      .filter((item) => item.count > 20);

    // Flag long paragraphs (> 120 words)
    const paragraphs = content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    const longParagraphs = paragraphs
      .map((para) => {
        const count = para.split(/\s+/).filter(Boolean).length;
        return { paragraph: para.substring(0, 80) + '...', count };
      })
      .filter((item) => item.count > 120);

    // Count Headings H2/H3
    const headingsCount = (content.match(/^#{2,3}\s+.+$/gm) || []).length;

    // Estimate syllables for French Flesch Score
    // Flesch adapté au français (Kandel & Moles) : 207 - (1.015 * ASL) - (73.6 * (Syllables/Words))
    let totalSyllables = 0;
    words.forEach((w) => {
      const clean = w.toLowerCase().replace(/[^a-zàâéèêëîïôùûü]/g, '');
      const vowels = clean.match(/[aeiouyàâéèêëîïôùûü]+/g);
      totalSyllables += vowels ? Math.max(1, vowels.length) : 1;
    });
    const avgSyllablesPerWord = totalSyllables / Math.max(1, wordCount);
    const rawFlesch = 207 - (1.015 * avgWordsPerSentence) - (73.6 * avgSyllablesPerWord);
    const fleschScore = Math.min(100, Math.max(0, Math.round(rawFlesch)));

    let fleschLabel = 'Moyen';
    if (fleschScore >= 75) fleschLabel = 'Très facile à lire';
    else if (fleschScore >= 60) fleschLabel = 'Facile et agréable';
    else if (fleschScore >= 45) fleschLabel = 'Standard';
    else fleschLabel = 'Complexe / Phrases denses';

    // Compile checklist issues
    const issues: { type: 'success' | 'warning' | 'error'; message: string }[] = [];

    // Rule 1: Long sentences ratio (< 25% of sentences should be > 20 words)
    const longSentenceRatio = (longSentences.length / sentenceCount) * 100;
    if (longSentences.length === 0) {
      issues.push({ type: 'success', message: 'Toutes les phrases sont courtes et faciles à lire (< 20 mots).' });
    } else if (longSentenceRatio <= 20) {
      issues.push({ type: 'warning', message: `${longSentences.length} phrase(s) dépassent 20 mots. Pensez à les scinder.` });
    } else {
      issues.push({ type: 'error', message: `Attention : ${Math.round(longSentenceRatio)}% des phrases sont trop longues (> 20 mots).` });
    }

    // Rule 2: Subheadings distribution
    if (wordCount > 250 && headingsCount < 2) {
      issues.push({ type: 'warning', message: 'Ajoutez des sous-titres (H2 ou H3) pour aérer la lecture de votre article.' });
    } else if (headingsCount >= 2) {
      issues.push({ type: 'success', message: `Structure aérée avec ${headingsCount} sous-titres bien répartis.` });
    }

    // Rule 3: Paragraph length
    if (longParagraphs.length > 0) {
      issues.push({ type: 'warning', message: `${longParagraphs.length} paragraphe(s) sont trop denses (> 120 mots). Créez des sauts de ligne.` });
    } else {
      issues.push({ type: 'success', message: 'Paragraphes courts et bien équilibrés.' });
    }

    // Overall readability score (0 - 100)
    let score = 100;
    score -= Math.min(40, Math.round(longSentenceRatio * 1.5));
    score -= Math.min(20, longParagraphs.length * 10);
    if (wordCount > 300 && headingsCount < 2) score -= 15;
    score = Math.max(20, Math.min(100, score));

    return {
      wordCount,
      sentenceCount,
      avgWordsPerSentence,
      longSentences,
      longParagraphs,
      fleschScore,
      fleschLabel,
      headingsCount,
      score,
      issues
    };
  }, [content]);

  // ==========================================
  // SEO ANALYZER (Référencement & Google SERP)
  // ==========================================
  const seoAnalysis = useMemo(() => {
    const kw = focusKeyword.trim().toLowerCase();
    const effectiveMetaTitle = (metaTitle || title).trim();
    const effectiveMetaDesc = (metaDescription || summary).trim();
    const currentSlug = (customSlug || title)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const checks: { label: string; passed: boolean; tip: string }[] = [];

    // Check 1: Meta Title length (40 to 65 chars)
    const titleLength = effectiveMetaTitle.length;
    const isTitleGoodLength = titleLength >= 35 && titleLength <= 65;
    checks.push({
      label: 'Longueur du titre SEO (Meta Title)',
      passed: isTitleGoodLength,
      tip: `${titleLength}/65 caractères (idéal : 45-60 car.)`
    });

    // Check 2: Meta Description length (110 to 160 chars)
    const descLength = effectiveMetaDesc.length;
    const isDescGoodLength = descLength >= 90 && descLength <= 165;
    checks.push({
      label: 'Longueur de la Meta Description',
      passed: isDescGoodLength,
      tip: `${descLength}/160 caractères (idéal : 120-155 car.)`
    });

    // Check 3: Focus keyword in Title
    if (kw) {
      const kwInTitle = effectiveMetaTitle.toLowerCase().includes(kw);
      checks.push({
        label: `Mot-clé « ${kw} » dans le titre SEO`,
        passed: kwInTitle,
        tip: kwInTitle ? 'Présent dans le titre' : 'Insérez votre mot-clé au début du titre.'
      });

      // Check 4: Focus keyword in Meta Description
      const kwInDesc = effectiveMetaDesc.toLowerCase().includes(kw);
      checks.push({
        label: `Mot-clé dans la Meta Description`,
        passed: kwInDesc,
        tip: kwInDesc ? 'Présent dans la description' : 'Ajoutez le mot-clé naturellement dans la description.'
      });

      // Check 5: Focus keyword in first paragraph
      const firstPara = content.split('\n')[0] || '';
      const kwInIntro = firstPara.toLowerCase().includes(kw);
      checks.push({
        label: 'Mot-clé dans l’introduction (premier paragraphe)',
        passed: kwInIntro,
        tip: kwInIntro ? 'Présent dès l’introduction' : 'Mentionnez le mot-clé dans les premières lignes.'
      });

      // Check 6: Keyword in URL slug
      const kwInSlug = currentSlug.includes(kw.replace(/\s+/g, '-'));
      checks.push({
        label: 'Mot-clé dans l’URL personnalisée',
        passed: kwInSlug,
        tip: `blog.stickyandkawaii.eu/#article-${currentSlug}`
      });
    }

    // Check 7: Image Alt / Cover Image presence
    checks.push({
      label: 'Image de couverture optimisée',
      passed: !!coverImage,
      tip: coverImage ? 'Image de couverture assignée' : 'Sélectionnez une image de couverture.'
    });

    // Check 8: External link in article content (http:// or https://)
    const hasExternalLink = /https?:\/\/[^\s)]+/.test(content);
    checks.push({
      label: 'Présence d’un lien externe',
      passed: hasExternalLink,
      tip: hasExternalLink ? 'Lien externe détecté dans le texte' : 'Conseil SEO : Ajoutez au moins un lien externe vers une source pertinente.'
    });

    const passedCount = checks.filter((c) => c.passed).length;
    const totalCount = checks.length;
    const score = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 50;

    return {
      score,
      checks,
      effectiveMetaTitle,
      effectiveMetaDesc,
      currentSlug,
      titleLength,
      descLength
    };
  }, [metaTitle, title, metaDescription, summary, focusKeyword, customSlug, content, coverImage]);

  // Filtered articles in list
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      if (categoryFilter !== 'all' && art.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && art.status !== statusFilter) return false;
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase().trim();
        const inTitle = art.title.toLowerCase().includes(q);
        const inSummary = art.summary.toLowerCase().includes(q);
        const inTags = art.tags.some((t) => t.toLowerCase().includes(q));
        if (!inTitle && !inSummary && !inTags) return false;
      }
      return true;
    });
  }, [articles, categoryFilter, statusFilter, searchFilter]);

  // Filtered comments in moderation
  const filteredComments = useMemo(() => {
    return comments.filter((com) => {
      if (commentFilterArticle !== 'all' && com.articleId !== commentFilterArticle) return false;
      if (commentSearchQuery.trim()) {
        const q = commentSearchQuery.toLowerCase().trim();
        const inAuthor = com.author.toLowerCase().includes(q);
        const inContent = com.content.toLowerCase().includes(q);
        if (!inAuthor && !inContent) return false;
      }
      return true;
    });
  }, [comments, commentFilterArticle, commentSearchQuery]);

  // Filtered and sorted subscribers
  const filteredSubscribers = useMemo(() => {
    let list = subscribers.filter((sub) => {
      if (!subscriberSearchQuery.trim()) return true;
      const q = subscriberSearchQuery.toLowerCase().trim();
      return sub.email.toLowerCase().includes(q) || (sub.source && sub.source.toLowerCase().includes(q));
    });

    list = [...list].sort((a, b) => {
      const timeA = new Date(a.subscribedAt).getTime() || 0;
      const timeB = new Date(b.subscribedAt).getTime() || 0;
      return subscriberSortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return list;
  }, [subscribers, subscriberSearchQuery, subscriberSortOrder]);

  // Format date helper for subscribers
  const formatSubscriberDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;

      const datePart = d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      const timePart = d.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `${datePart} à ${timePart}`;
    } catch {
      return dateString;
    }
  };

  // CSV Export handler
  const handleExportCSV = () => {
    if (subscribers.length === 0) return;
    const headers = ['ID', 'Email', "Date d'inscription", 'Heure', 'Source'];
    const rows = subscribers.map((s) => {
      const d = new Date(s.subscribedAt);
      const dateStr = !isNaN(d.getTime()) ? d.toLocaleDateString('fr-FR') : s.subscribedAt;
      const timeStr = !isNaN(d.getTime()) ? d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
      return [
        `"${s.id}"`,
        `"${s.email}"`,
        `"${dateStr}"`,
        `"${timeStr}"`,
        `"${s.source || 'Blog'}"`,
      ].join(';');
    });
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sticky-and-kawaii-abonnes-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy all emails
  const handleCopyAllEmails = () => {
    if (subscribers.length === 0) return;
    const emailList = subscribers.map((s) => s.email).join(', ');
    navigator.clipboard.writeText(emailList);
    setCopiedEmailsToast(true);
    setTimeout(() => setCopiedEmailsToast(false), 3000);
  };

  // Copy single email
  const handleCopySingleEmail = (subId: string, emailStr: string) => {
    navigator.clipboard.writeText(emailStr);
    setCopiedSingleEmailId(subId);
    setTimeout(() => setCopiedSingleEmailId(null), 2000);
  };

  // Manual Add Subscriber
  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setManualEmailError('');
    setManualEmailSuccess('');

    const clean = manualEmailInput.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!clean || !emailRegex.test(clean)) {
      setManualEmailError('Veuillez entrer une adresse email valide.');
      return;
    }

    const success = onAddSubscriber(clean);
    if (success) {
      setManualEmailSuccess(`L'adresse ${clean} a été ajoutée avec succès !`);
      setManualEmailInput('');
      setTimeout(() => setManualEmailSuccess(''), 4000);
    } else {
      setManualEmailError(`Cette adresse est déjà présente dans la liste des abonnés.`);
    }
  };

  // Overall Stats
  const stats = useMemo(() => {
    const published = articles.filter((a) => a.status === 'published').length;
    const drafts = articles.filter((a) => a.status === 'draft').length;
    const scheduled = articles.filter((a) => a.status === 'scheduled').length;
    const totalReactions = articles.reduce((acc, a) => acc + (a.reactions.stars + a.reactions.hearts + a.reactions.butterflies), 0);
    const totalComments = comments.length;
    const totalSubscribers = subscribers.length;
    return {
      published,
      drafts,
      scheduled,
      totalReactions,
      totalComments,
      totalSubscribers,
      totalArticles: articles.length
    };
  }, [articles, comments, subscribers]);

  if (!isOpen) return null;

  return (
    <div 
      id="admin-studio-fullscreen"
      className="fixed inset-0 z-50 bg-[#f4f0fa] flex flex-col font-sans overflow-hidden animate-in fade-in duration-200"
    >
      {/* ======================================================== */}
      {/* 1. NOT LOGGED IN: LUXURIOUS FULL-SCREEN LOGIN GATEWAY */}
      {/* ======================================================== */}
      {!isAdminLoggedIn ? (
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#f8efe8] via-[#f4f0fa] to-[#ede7f6]">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#e5dbf7] p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-[#f4f0fa] transition-colors"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-3xl bg-[#4C2882] text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-950/10">
                <Lock className="w-7 h-7 stroke-[2]" />
              </div>
              <h2 className="text-2xl font-bold text-[#3D2E39] font-heading">
                Espace Auteur & Studio
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Portail d'administration réservé à l'équipe Sticky and Kawaii.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3D2E39] mb-1.5 uppercase tracking-wider">
                  Adresse Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="stickyandkawaii@gmail.com"
                  className="w-full px-4 py-3 rounded-xl bg-[#faf8fc] border border-[#e5dbf7] text-sm text-[#3D2E39] focus:outline-hidden focus:ring-2 focus:ring-[#4C2882]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3D2E39] mb-1.5 uppercase tracking-wider">
                  Mot de passe sécurisé
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-[#faf8fc] border border-[#e5dbf7] text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-[#4C2882]"
                  autoFocus
                />
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#4C2882] hover:bg-[#3D206A] text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Accéder au Studio</span>
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-[#f4f0fa] text-center">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-slate-500 hover:text-[#4C2882] transition-colors"
              >
                ← Revenir au blog public
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* 2. LOGGED IN: FULL CREATOR DASHBOARD & SEO/READABILITY STUDIO */
        /* ======================================================== */
        <div className="flex-1 flex flex-col h-full">
          
          {/* Top Master Bar */}
          <header className="bg-white border-b border-[#e5dbf7] px-4 sm:px-6 py-3 flex items-center justify-between z-20 shrink-0">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f4f0fa] hover:bg-[#F7ECE3] text-[#3D2E39] hover:text-[#4C2882] text-xs font-bold transition-colors cursor-pointer"
                title="Quitter le studio et voir le blog"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Retour au Blog</span>
              </button>

              <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#4C2882] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  SK
                </div>
                <div>
                  <h1 className="text-sm font-bold text-[#3D2E39] leading-none flex items-center gap-1.5">
                    Studio Créateur Sticky
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      PRO
                    </span>
                  </h1>
                  <p className="text-[11px] text-slate-500 mt-0.5 hidden sm:block">
                    blog.stickyandkawaii.eu
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 bg-[#f4f0fa] p-1 rounded-2xl">
              <button
                onClick={() => setCurrentTab('articles')}
                className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentTab === 'articles'
                    ? 'bg-white text-[#4C2882] shadow-xs'
                    : 'text-[#3D2E39] hover:text-[#4C2882]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Articles ({articles.length})</span>
              </button>

              <button
                onClick={handleNewArticle}
                className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentTab === 'editor'
                    ? 'bg-white text-[#4C2882] shadow-xs'
                    : 'text-[#3D2E39] hover:text-[#4C2882]'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Éditeur & SEO</span>
              </button>

              <button
                onClick={() => setCurrentTab('categories')}
                className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentTab === 'categories'
                    ? 'bg-white text-[#4C2882] shadow-xs'
                    : 'text-[#3D2E39] hover:text-[#4C2882]'
                }`}
              >
                <FolderHeart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Catégories</span>
                <span className="sm:hidden">Cat.</span>
                <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded-full text-[10px] font-bold">
                  {categories.length}
                </span>
              </button>

              <button
                onClick={() => setCurrentTab('comments')}
                className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentTab === 'comments'
                    ? 'bg-white text-[#4C2882] shadow-xs'
                    : 'text-[#3D2E39] hover:text-[#4C2882]'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Commentaires</span>
                <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded-full text-[10px]">
                  {comments.length}
                </span>
              </button>

              <button
                onClick={() => setCurrentTab('subscribers')}
                className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentTab === 'subscribers'
                    ? 'bg-white text-[#4C2882] shadow-xs'
                    : 'text-[#3D2E39] hover:text-[#4C2882]'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Abonnés Newsletter</span>
                <span className="sm:hidden">Abonnés</span>
                <span className="px-1.5 py-0.2 bg-pink-100 text-pink-800 rounded-full text-[10px] font-bold">
                  {subscribers.length}
                </span>
              </button>

              <button
                onClick={() => setCurrentTab('stats')}
                className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer hidden md:flex items-center gap-1.5 ${
                  currentTab === 'stats'
                    ? 'bg-white text-[#4C2882] shadow-xs'
                    : 'text-[#3D2E39] hover:text-[#4C2882]'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Statistiques</span>
              </button>
            </div>

            {/* User & Logout */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-right hidden lg:block">
                <p className="text-xs font-bold text-[#3D2E39]">stickyandkawaii</p>
                <p className="text-[10px] text-slate-400">Auteur Principal</p>
              </div>

              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Déconnexion"
              >
                <Unlock className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Main Studio Viewport */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f4f0fa]">
            
            {/* ======================================================== */}
            {/* TAB 1: ARTICLES MANAGER */}
            {/* ======================================================== */}
            {currentTab === 'articles' && (
              <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header Action Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-[#e5dbf7] shadow-xs">
                  <div>
                    <h2 className="text-xl font-bold text-[#3D2E39] font-heading">
                      Gestionnaire des Articles
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Rédigez, modifiez, optimisez le référencement et gérez les publications.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={handleNewArticle}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#4C2882] hover:bg-[#3D206A] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Nouvel Article</span>
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-2xl border border-[#e5dbf7]">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder="Rechercher par titre, tag ou contenu..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#faf8fc] border border-[#e5dbf7] text-xs text-[#3D2E39] focus:outline-hidden focus:ring-2 focus:ring-[#4C2882]"
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl bg-[#faf8fc] border border-[#e5dbf7] text-xs font-semibold text-[#3D2E39] focus:outline-hidden"
                  >
                    <option value="all">Toutes les catégories ({articles.length})</option>
                    {categories.map((cat) => {
                      const count = articles.filter(a => a.category === cat.name).length;
                      return (
                        <option key={cat.id} value={cat.name}>
                          {cat.name} ({count})
                        </option>
                      );
                    })}
                  </select>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl bg-[#faf8fc] border border-[#e5dbf7] text-xs font-semibold text-[#3D2E39] focus:outline-hidden"
                  >
                    <option value="all">Tous les états ({articles.length})</option>
                    <option value="published">Publiés ({stats.published})</option>
                    <option value="draft">Brouillons ({stats.drafts})</option>
                    <option value="scheduled">Programmés ({stats.scheduled})</option>
                  </select>
                </div>

                {/* Articles Table / Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredArticles.map((art) => {
                    const isDraft = art.status === 'draft';
                    const isScheduled = art.status === 'scheduled';
                    return (
                      <div
                        key={art.id}
                        className="bg-white rounded-3xl border border-[#e5dbf7] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          {/* Image & Badges */}
                          <div className="relative aspect-video bg-slate-100 overflow-hidden">
                            <img
                              src={art.coverImage}
                              alt={art.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            
                            <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                              {isDraft && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-900 shadow-xs">
                                  Brouillon
                                </span>
                              )}
                              {isScheduled && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-[#4C2882] text-white shadow-xs flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>Programmé</span>
                                </span>
                              )}
                              {!isDraft && !isScheduled && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-white shadow-xs">
                                  En ligne
                                </span>
                              )}
                              {art.featured && (
                                <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold">
                                  ⭐ À la une
                                </span>
                              )}
                            </div>

                            <span className="absolute bottom-3 left-3 text-white text-xs font-bold drop-shadow-sm">
                              {art.category}
                            </span>
                          </div>

                          {/* Content summary */}
                          <div className="p-4 sm:p-5">
                            <h3 className="font-bold text-[#3D2E39] text-base line-clamp-2 mb-1.5 font-heading">
                              {art.title}
                            </h3>
                            <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                              {art.summary}
                            </p>

                            {/* Scheduling info banner if scheduled */}
                            {isScheduled && art.scheduledAt && (
                              <div className="mb-3 p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-[11px] text-[#4C2882] flex items-center justify-between">
                                <div className="flex items-center gap-1.5 font-semibold">
                                  <CalendarClock className="w-3.5 h-3.5 text-[#4C2882]" />
                                  <span>Parution : {new Date(art.scheduledAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} à {art.scheduledAt.split('T')[1] || '09:00'}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const now = new Date();
                                    const formattedDate = `${now.getDate()} ${now.toLocaleString('fr-FR', { month: 'long' })} ${now.getFullYear()}`;
                                    onSaveArticle({
                                      ...art,
                                      status: 'published',
                                      scheduledAt: undefined,
                                      publishedAt: formattedDate
                                    });
                                  }}
                                  className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors cursor-pointer"
                                  title="Publier immédiatement sans attendre la date"
                                >
                                  Publier
                                </button>
                              </div>
                            )}

                            {/* Tags & stats */}
                            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-100">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {art.readingTime}
                              </span>
                              <span className="flex items-center gap-1 text-pink-600 font-semibold">
                                <Heart className="w-3 h-3" />
                                {art.reactions.hearts + art.reactions.stars + art.reactions.butterflies} réactions
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons footer */}
                        <div className="p-3 bg-[#faf8fc] border-t border-[#e5dbf7] flex items-center justify-between gap-2">
                          <button
                            onClick={() => {
                              onPreviewArticle(art);
                              onClose();
                            }}
                            className="p-2 rounded-xl text-slate-500 hover:text-[#4C2882] hover:bg-white transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
                            title="Voir l'article en direct"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Voir</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleDuplicateArticle(art)}
                              className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-white transition-colors cursor-pointer"
                              title="Dupliquer cet article"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleEditArticle(art)}
                              className="px-3 py-1.5 rounded-xl bg-[#4C2882] hover:bg-[#3D206A] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Modifier</span>
                            </button>

                            {confirmDeleteArticleId === art.id ? (
                              <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 px-2 py-1 rounded-xl animate-in fade-in">
                                <span className="text-[10px] font-bold text-rose-700">Supprimer ?</span>
                                <button
                                  onClick={() => {
                                    onDeleteArticle(art.id);
                                    setConfirmDeleteArticleId(null);
                                  }}
                                  className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                                >
                                  Oui
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteArticleId(null)}
                                  className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                                >
                                  Non
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteArticleId(art.id)}
                                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Supprimer cet article"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 2: RICH ARTICLE EDITOR + SEO + READABILITY SUITE */}
            {/* ======================================================== */}
            {currentTab === 'editor' && (
              <div className="max-w-7xl mx-auto space-y-5">
                
                {/* Editor Header Bar */}
                <div className="bg-white p-4 rounded-3xl border border-[#e5dbf7] flex flex-wrap items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCurrentTab('articles')}
                      className="p-2 rounded-xl text-slate-400 hover:text-[#4C2882] hover:bg-[#f4f0fa] transition-colors cursor-pointer"
                      title="Retour à la liste"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h2 className="text-lg font-bold text-[#3D2E39] font-heading leading-tight">
                        {editorMode === 'create' ? 'Nouvel Article' : 'Modification de l’Article'}
                      </h2>
                      <p className="text-[11px] text-slate-500">
                        {status === 'published' && '🟢 Statut : En ligne (Public)'}
                        {status === 'draft' && '📝 Statut : Brouillon privé (Non visible)'}
                        {status === 'scheduled' && `⏰ Statut : Programmé pour le ${scheduledDate ? new Date(scheduledDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : '...'} à ${scheduledTime || '09:00'} (Brouillon en attente)`}
                      </p>
                    </div>
                  </div>

                  {/* Subtabs navigation (Write / SEO / Readability / Preview) */}
                  <div className="flex items-center gap-1 bg-[#f4f0fa] p-1 rounded-2xl">
                    <button
                      onClick={() => setEditorSubTab('write')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        editorSubTab === 'write' ? 'bg-white text-[#4C2882] shadow-xs' : 'text-[#3D2E39] hover:text-[#4C2882]'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Rédaction</span>
                    </button>

                    <button
                      onClick={() => setEditorSubTab('seo')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        editorSubTab === 'seo' ? 'bg-white text-[#4C2882] shadow-xs' : 'text-[#3D2E39] hover:text-[#4C2882]'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Encart SEO</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        seoAnalysis.score >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {seoAnalysis.score}%
                      </span>
                    </button>

                    <button
                      onClick={() => setEditorSubTab('readability')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        editorSubTab === 'readability' ? 'bg-white text-[#4C2882] shadow-xs' : 'text-[#3D2E39] hover:text-[#4C2882]'
                      }`}
                    >
                      <Gauge className="w-3.5 h-3.5" />
                      <span>Lisibilité</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        readabilityAnalysis.longSentences.length === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {readabilityAnalysis.longSentences.length === 0 ? 'Parfait' : `${readabilityAnalysis.longSentences.length} alertes`}
                      </span>
                    </button>

                    <button
                      onClick={() => setEditorSubTab('preview')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        editorSubTab === 'preview' ? 'bg-white text-[#4C2882] shadow-xs' : 'text-[#3D2E39] hover:text-[#4C2882]'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Aperçu</span>
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {saveSuccess && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4" /> Enregistré !
                      </span>
                    )}

                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="px-3 py-2 rounded-xl bg-[#faf8fc] border border-[#e5dbf7] text-xs font-bold text-[#3D2E39] focus:outline-hidden"
                    >
                      <option value="published">🟢 Publié en direct</option>
                      <option value="draft">📝 Brouillon privé</option>
                      <option value="scheduled">⏰ Programmer la date...</option>
                    </select>

                    <button
                      onClick={() => handleSaveSubmit()}
                      className="px-4 py-2 rounded-xl bg-[#4C2882] hover:bg-[#3D206A] text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>Enregistrer</span>
                    </button>
                  </div>
                </div>

                {/* SubTab Content 1: WRITING WORKSPACE */}
                {editorSubTab === 'write' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left 2 Cols: Main Inputs & Markdown Body */}
                    <div className="lg:col-span-2 space-y-4">
                      
                      {/* Title */}
                      <div className="bg-white p-5 rounded-3xl border border-[#e5dbf7] space-y-3">
                        <label className="block text-xs font-bold text-[#3D2E39] uppercase tracking-wider">
                          Titre de l'article *
                        </label>
                        <input
                          type="text"
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Ex: Dans les coulisses de la création des stickers holographiques..."
                          className="w-full px-4 py-3 rounded-2xl bg-[#faf8fc] border border-[#e5dbf7] text-base font-bold text-[#3D2E39] focus:outline-hidden focus:ring-2 focus:ring-[#4C2882]"
                        />

                        {/* Summary */}
                        <div className="pt-2">
                          <label className="block text-xs font-bold text-[#3D2E39] uppercase tracking-wider mb-1">
                            Résumé d'accroche (Chapeau) *
                          </label>
                          <textarea
                            rows={2}
                            required
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            placeholder="Courte description attractive affichée sur la page d'accueil et les cartes d'articles..."
                            className="w-full px-4 py-2.5 rounded-2xl bg-[#faf8fc] border border-[#e5dbf7] text-xs sm:text-sm text-[#3D2E39] focus:outline-hidden focus:ring-2 focus:ring-[#4C2882]"
                          />
                        </div>
                      </div>

                      {/* Shopify Style HTML Editor */}
                      <div className="bg-white p-5 rounded-3xl border border-[#e5dbf7] space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-[#e5dbf7]">
                          <span className="text-xs font-bold text-[#3D2E39] uppercase tracking-wider">
                            Contenu de l'article (Éditeur HTML Shopify)
                          </span>
                        </div>

                        <ShopifyHtmlEditor
                          value={content}
                          onChange={setContent}
                          placeholder="Rédigez ou collez votre code HTML ici..."
                        />

                        {/* Quick metrics footer under editor */}
                        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 px-1">
                          <div className="flex items-center gap-4">
                            <span>📝 <strong>{readabilityAnalysis.wordCount}</strong> mots</span>
                            <span>⏱️ Lecture : <strong>{readingTime}</strong></span>
                            <span>📜 <strong>{readabilityAnalysis.sentenceCount}</strong> phrases</span>
                          </div>

                          {readabilityAnalysis.longSentences.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setEditorSubTab('readability')}
                              className="text-amber-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                              <span>{readabilityAnalysis.longSentences.length} phrase(s) trop longue(s)</span>
                            </button>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Right 1 Col: Metadata, Cover Image, Category, Tags */}
                    <div className="space-y-4">
                      
                      {/* Publication Meta Panel */}
                      <div className="bg-white p-5 rounded-3xl border border-[#e5dbf7] space-y-4">
                        <h3 className="text-xs font-bold text-[#3D2E39] uppercase tracking-wider">
                          Paramètres de publication
                        </h3>

                        {/* Status selector */}
                        <div>
                          <label className="block text-xs font-semibold text-[#3D2E39] mb-1">
                            Statut de l'article
                          </label>
                          <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as any)}
                            className="w-full px-3 py-2 rounded-xl bg-[#faf8fc] border border-[#e5dbf7] text-xs font-bold text-[#3D2E39] focus:outline-hidden"
                          >
                            <option value="published">🟢 Publié en direct</option>
                            <option value="draft">📝 Brouillon privé</option>
                            <option value="scheduled">⏰ Programmé (Date & Heure)</option>
                          </select>
                        </div>

                        {/* Scheduled Date & Time Pickers if status === 'scheduled' */}
                        {status === 'scheduled' && (
                          <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 space-y-3 animate-in fade-in">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-[#4C2882]">
                              <Clock className="w-4 h-4" />
                              <span>Planification de parution</span>
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-[#3D2E39] mb-1">
                                Date de publication
                              </label>
                              <input
                                type="date"
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-purple-200 text-xs text-[#3D2E39] focus:outline-hidden font-medium"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-[#3D2E39] mb-1">
                                Heure de publication
                              </label>
                              <input
                                type="time"
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-purple-200 text-xs text-[#3D2E39] focus:outline-hidden font-medium"
                              />
                            </div>

                            <p className="text-[10px] text-[#4C2882]/80 leading-relaxed bg-white/60 p-2 rounded-xl">
                              📅 En attendant cette date et heure, l'article reste en brouillon et n'est pas visible par le public.
                            </p>
                          </div>
                        )}

                        {/* Category */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-semibold text-[#3D2E39]">
                              Catégorie
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                handleOpenCreateCategory();
                                setCurrentTab('categories');
                              }}
                              className="text-[11px] font-bold text-[#4C2882] hover:text-[#7c3aed] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Gérer / Créer</span>
                            </button>
                          </div>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as any)}
                            className="w-full px-3 py-2 rounded-xl bg-[#faf8fc] border border-[#e5dbf7] text-xs font-bold text-[#3D2E39] focus:outline-hidden"
                          >
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.name}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Tags */}
                        <div>
                          <label className="block text-xs font-semibold text-[#3D2E39] mb-1">
                            Étiquettes / Tags (séparés par virgule)
                          </label>
                          <input
                            type="text"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            placeholder="Stickers, Tuto, Holographique"
                            className="w-full px-3 py-2 rounded-xl bg-[#faf8fc] border border-[#e5dbf7] text-xs text-[#3D2E39] focus:outline-hidden"
                          />
                        </div>

                        {/* Featured Checkbox */}
                        <div className="pt-2 border-t border-[#f4f0fa]">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isFeatured}
                              onChange={(e) => setIsFeatured(e.target.checked)}
                              className="w-4 h-4 rounded-md text-[#4C2882] focus:ring-[#4C2882]"
                            />
                            <span className="text-xs font-bold text-[#3D2E39]">
                              Mettre en vedette (Grand bandeau à la Une)
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Cover Image Upload (From Local Computer) */}
                      <div className="bg-white p-5 rounded-3xl border border-[#e5dbf7] space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4 text-[#4C2882]" />
                            <h3 className="text-xs font-bold text-[#3D2E39] uppercase tracking-wider">
                              Image de couverture
                            </h3>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-[#4C2882]">
                            Fichier local
                          </span>
                        </div>

                        {/* Hidden Native File Input */}
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/svg+xml"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleCoverFileUpload(e.target.files[0]);
                              e.target.value = ''; // Reset input to allow re-uploading same filename
                            }
                          }}
                          className="hidden"
                          id="cover-file-upload-input"
                        />

                        {/* Error Message */}
                        {coverUploadError && (
                          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-semibold">{coverUploadError}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setCoverUploadError('')}
                              className="text-red-400 hover:text-red-600 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {coverImage ? (
                          /* 1. Image Loaded Preview */
                          <div className="space-y-3">
                            <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-[#e5dbf7] relative group shadow-xs">
                              <img
                                src={coverImage}
                                alt="Aperçu couverture"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />

                              {/* Action Badges on Top */}
                              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="px-2.5 py-1.5 rounded-xl bg-white/90 backdrop-blur-xs text-[#4C2882] hover:bg-white text-[11px] font-bold shadow-sm border border-purple-200 hover:border-purple-400 transition-all flex items-center gap-1 cursor-pointer"
                                  title="Remplacer par une autre image de l'ordinateur"
                                >
                                  <Upload className="w-3 h-3 text-[#4C2882]" />
                                  <span>Changer</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCoverImage('');
                                    setCoverFileName('');
                                    setCoverUploadError('');
                                  }}
                                  className="p-1.5 rounded-xl bg-white/90 backdrop-blur-xs text-red-600 hover:bg-red-50 hover:text-red-700 text-[11px] font-bold shadow-sm border border-red-200 transition-all cursor-pointer"
                                  title="Supprimer cette image"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Optional File Name Pill */}
                              {coverFileName && (
                                <div className="absolute bottom-2.5 left-2.5 max-w-[80%] px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium truncate flex items-center gap-1">
                                  <FileImage className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{coverFileName}</span>
                                </div>
                              )}
                            </div>

                            {/* Main Button to replace from computer */}
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploadingCover}
                              className="w-full py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-[#4C2882] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              {isUploadingCover ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#4C2882]" />
                                  <span>Optimisation en cours...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-3.5 h-3.5 text-[#4C2882]" />
                                  <span>Importer une nouvelle image depuis l'ordinateur</span>
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          /* 2. Drag & Drop Upload Zone */
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              setIsDraggingCover(true);
                            }}
                            onDragLeave={(e) => {
                              e.preventDefault();
                              setIsDraggingCover(false);
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              setIsDraggingCover(false);
                              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                handleCoverFileUpload(e.dataTransfer.files[0]);
                              }
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
                              isDraggingCover
                                ? 'border-[#7c3aed] bg-purple-100/70 ring-4 ring-purple-200 scale-[1.01]'
                                : 'border-[#d8b4fe] hover:border-[#7c3aed] bg-[#faf8fc] hover:bg-purple-50/50'
                            }`}
                          >
                            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#4C2882] flex items-center justify-center shadow-2xs">
                              {isUploadingCover ? (
                                <RefreshCw className="w-6 h-6 animate-spin text-[#7c3aed]" />
                              ) : (
                                <UploadCloud className="w-6 h-6 text-[#7c3aed]" />
                              )}
                            </div>

                            <div>
                              <p className="text-xs font-bold text-[#3D2E39]">
                                {isUploadingCover ? 'Importation en cours...' : 'Glissez votre image de couverture ici'}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                ou <span className="text-[#4C2882] font-semibold underline">cliquez pour parcourir vos fichiers</span>
                              </p>
                            </div>

                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-[10px] font-medium text-slate-500">
                              <span>PNG, JPG, WEBP, GIF jusqu'à 15 Mo</span>
                            </div>
                          </div>
                        )}

                        {/* Optional Web URL Accordion / Toggle */}
                        <div className="pt-2 border-t border-[#f4f0fa]">
                          <button
                            type="button"
                            onClick={() => setShowCoverUrlInput(!showCoverUrlInput)}
                            className="text-[11px] font-semibold text-slate-500 hover:text-[#4C2882] transition-colors flex items-center justify-between w-full cursor-pointer"
                          >
                            <span>Ou saisir directement une URL web</span>
                            <span>{showCoverUrlInput ? '−' : '+'}</span>
                          </button>

                          {showCoverUrlInput && (
                            <div className="mt-2 space-y-1.5">
                              <input
                                type="url"
                                value={coverImage}
                                onChange={(e) => setCoverImage(e.target.value)}
                                placeholder="https://..."
                                className="w-full px-3 py-2 rounded-xl bg-[#faf8fc] border border-[#e5dbf7] text-xs text-[#3D2E39] focus:outline-hidden"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Collapsible SEO & Readability Panels in right column */}
                      <div className="bg-gradient-to-br from-[#faf7ff] to-[#f4edfc] p-5 rounded-3xl border border-[#e5dbf7] space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#4C2882] uppercase tracking-wider">
                            Améliorations SEO & Lisibilité
                          </span>
                        </div>

                        <div className="space-y-3">
                          {/* SEO Accordion */}
                          <div className="bg-white rounded-2xl border border-[#e5dbf7] overflow-hidden transition-all">
                            <button
                              type="button"
                              onClick={() => setIsSeoPanelOpen(!isSeoPanelOpen)}
                              className="w-full flex items-center justify-between p-3 hover:bg-purple-50/50 transition-colors cursor-pointer text-left"
                            >
                              <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-[#4C2882]" />
                                <div>
                                  <p className="text-xs font-bold text-[#3D2E39]">Score SEO ({seoAnalysis.score}/100)</p>
                                  <p className="text-[10px] text-slate-400">Cliquez pour déplier</p>
                                </div>
                              </div>
                              {isSeoPanelOpen ? <ChevronUp className="w-4 h-4 text-[#4C2882]" /> : <ChevronDown className="w-4 h-4 text-[#4C2882]" />}
                            </button>

                            {isSeoPanelOpen && (
                              <div className="p-3 border-t border-[#e5dbf7] bg-[#faf8fc] space-y-2.5 text-xs animate-in fade-in">
                                <div className="space-y-1.5">
                                  {seoAnalysis.checks.map((check, idx) => (
                                    <div key={idx} className={`p-2 rounded-xl border text-[11px] flex items-start gap-2 ${check.passed ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                                      {check.passed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />}
                                      <div>
                                        <p className="font-bold">{check.label}</p>
                                        <p className="text-[10px] opacity-80">{check.tip}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setEditorSubTab('seo')}
                                  className="w-full py-1.5 px-3 rounded-xl bg-[#4C2882] text-white text-[11px] font-bold hover:bg-[#3D206A] transition-colors text-center cursor-pointer"
                                >
                                  Ouvrir l'encart SEO complet
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Readability Accordion */}
                          <div className="bg-white rounded-2xl border border-[#e5dbf7] overflow-hidden transition-all">
                            <button
                              type="button"
                              onClick={() => setIsReadabilityPanelOpen(!isReadabilityPanelOpen)}
                              className="w-full flex items-center justify-between p-3 hover:bg-purple-50/50 transition-colors cursor-pointer text-left"
                            >
                              <div className="flex items-center gap-2">
                                <Gauge className="w-4 h-4 text-[#4C2882]" />
                                <div>
                                  <p className="text-xs font-bold text-[#3D2E39]">Lisibilité ({readabilityAnalysis.score}/100)</p>
                                  <p className="text-[10px] text-slate-400">Cliquez pour déplier</p>
                                </div>
                              </div>
                              {isReadabilityPanelOpen ? <ChevronUp className="w-4 h-4 text-[#4C2882]" /> : <ChevronDown className="w-4 h-4 text-[#4C2882]" />}
                            </button>

                            {isReadabilityPanelOpen && (
                              <div className="p-3 border-t border-[#e5dbf7] bg-[#faf8fc] space-y-2.5 text-xs animate-in fade-in">
                                <div className="space-y-1 text-[11px] text-slate-600">
                                  <p><strong>Mots :</strong> {readabilityAnalysis.wordCount}</p>
                                  <p><strong>Phrases :</strong> {readabilityAnalysis.sentenceCount} ({readabilityAnalysis.avgWordsPerSentence} mots/phrase)</p>
                                  <p className="text-emerald-700 font-semibold">{readabilityAnalysis.fleschLabel}</p>
                                </div>
                                {readabilityAnalysis.longSentences.length > 0 && (
                                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[10px]">
                                    ⚠️ {readabilityAnalysis.longSentences.length} phrase(s) dépassent 25 mots. Pensez à les raccourcir.
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setEditorSubTab('readability')}
                                  className="w-full py-1.5 px-3 rounded-xl bg-[#4C2882] text-white text-[11px] font-bold hover:bg-[#3D206A] transition-colors text-center cursor-pointer"
                                >
                                  Ouvrir l'analyse de lisibilité complète
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                )}

                {/* ======================================================== */}
                {/* SubTab Content 2: ENTIRE DEDICATED SEO SECTION (Encart SEO) */}
                {/* ======================================================== */}
                {editorSubTab === 'seo' && (
                  <div className="space-y-6">
                    
                    {/* Google SERP Snippet Preview */}
                    <div className="bg-white p-6 rounded-3xl border border-[#e5dbf7] space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-[#f4f0fa]">
                        <div className="flex items-center gap-2">
                          <Globe className="w-5 h-5 text-[#4C2882]" />
                          <h3 className="text-base font-bold text-[#3D2E39] font-heading">
                            Aperçu Google Search (SERP Snippet)
                          </h3>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-purple-50 text-[#4C2882] font-bold">
                          Simulation Référencement
                        </span>
                      </div>

                      {/* Google Result Card Visual */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-[#faf8fc] border border-[#e5dbf7] max-w-2xl font-sans">
                        <div className="flex items-center gap-2 text-xs text-[#202124] mb-1">
                          <div className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center text-[9px] text-white font-bold">
                            SK
                          </div>
                          <span className="text-slate-700 font-semibold">Sticky and kawaii</span>
                          <span className="text-slate-400">› article › {seoAnalysis.currentSlug}</span>
                        </div>

                        <h4 className="text-lg text-[#1a0dab] hover:underline font-medium cursor-pointer line-clamp-1">
                          {seoAnalysis.effectiveMetaTitle || 'Titre de l’article - Blog Sticky and Kawaii'}
                        </h4>

                        <p className="text-xs sm:text-sm text-[#4d5156] mt-1 line-clamp-2 leading-relaxed">
                          {seoAnalysis.effectiveMetaDesc || 'Résumé de votre article optimisé pour attirer des clics sur Google...'}
                        </p>
                      </div>
                    </div>

                    {/* SEO Fields & Controls */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Left: Input Fields */}
                      <div className="bg-white p-6 rounded-3xl border border-[#e5dbf7] space-y-4">
                        <h3 className="text-xs font-bold text-[#3D2E39] uppercase tracking-wider">
                          Paramètres des Balises SEO
                        </h3>

                        {/* Mot-clé principal */}
                        <div>
                          <label className="block text-xs font-bold text-[#3D2E39] mb-1">
                            Mot-clé principal (Focus Keyword)
                          </label>
                          <input
                            type="text"
                            value={focusKeyword}
                            onChange={(e) => setFocusKeyword(e.target.value)}
                            placeholder="Ex: stickers kawaii, bullet journal..."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf8fc] border border-[#e5dbf7] text-xs sm:text-sm text-[#3D2E39] focus:outline-hidden focus:ring-2 focus:ring-[#4C2882]"
                          />
                          <p className="text-[11px] text-slate-400 mt-1">
                            Le mot-clé sur lequel vous souhaitez positionner cet article dans les moteurs de recherche.
                          </p>
                        </div>

                        {/* Meta Title */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold text-[#3D2E39]">
                              Titre SEO (Meta Title)
                            </label>
                            <span className={`text-[11px] font-bold ${
                              seoAnalysis.titleLength >= 40 && seoAnalysis.titleLength <= 65 ? 'text-emerald-600' : 'text-amber-600'
                            }`}>
                              {seoAnalysis.titleLength}/65 caractères
                            </span>
                          </div>
                          <input
                            type="text"
                            value={metaTitle}
                            onChange={(e) => setMetaTitle(e.target.value)}
                            placeholder={title || 'Titre personnalisé pour Google'}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf8fc] border border-[#e5dbf7] text-xs sm:text-sm text-[#3D2E39] focus:outline-hidden focus:ring-2 focus:ring-[#4C2882]"
                          />
                          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                            <div 
                              className={`h-full transition-all ${
                                seoAnalysis.titleLength >= 40 && seoAnalysis.titleLength <= 65 ? 'bg-emerald-500' : 'bg-amber-400'
                              }`} 
                              style={{ width: `${Math.min(100, (seoAnalysis.titleLength / 65) * 100)}%` }} 
                            />
                          </div>
                        </div>

                        {/* Meta Description */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold text-[#3D2E39]">
                              Meta Description
                            </label>
                            <span className={`text-[11px] font-bold ${
                              seoAnalysis.descLength >= 110 && seoAnalysis.descLength <= 165 ? 'text-emerald-600' : 'text-amber-600'
                            }`}>
                              {seoAnalysis.descLength}/160 caractères
                            </span>
                          </div>
                          <textarea
                            rows={3}
                            value={metaDescription}
                            onChange={(e) => setMetaDescription(e.target.value)}
                            placeholder={summary || 'Description attractive pour les résultats de recherche...'}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf8fc] border border-[#e5dbf7] text-xs sm:text-sm text-[#3D2E39] focus:outline-hidden focus:ring-2 focus:ring-[#4C2882]"
                          />
                          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                            <div 
                              className={`h-full transition-all ${
                                seoAnalysis.descLength >= 110 && seoAnalysis.descLength <= 165 ? 'bg-emerald-500' : 'bg-amber-400'
                              }`} 
                              style={{ width: `${Math.min(100, (seoAnalysis.descLength / 160) * 100)}%` }} 
                            />
                          </div>
                        </div>

                        {/* Custom Slug */}
                        <div>
                          <label className="block text-xs font-bold text-[#3D2E39] mb-1">
                            URL personnalisée (Slug)
                          </label>
                          <div className="flex items-center rounded-xl bg-[#faf8fc] border border-[#e5dbf7] overflow-hidden px-3 py-2 text-xs">
                            <span className="text-slate-400 shrink-0">#article-</span>
                            <input
                              type="text"
                              value={customSlug}
                              onChange={(e) => setCustomSlug(e.target.value)}
                              placeholder={title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'mon-article'}
                              className="w-full bg-transparent border-none text-[#3D2E39] font-mono focus:outline-hidden ml-1"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right: SEO Checklist & Score Breakdown */}
                      <div className="bg-white p-6 rounded-3xl border border-[#e5dbf7] space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold text-[#3D2E39] uppercase tracking-wider">
                            Checklist & Score SEO
                          </h3>
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[#4C2882] font-bold text-xs">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Score : {seoAnalysis.score} / 100</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {seoAnalysis.checks.map((check, idx) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-2xl border flex items-start gap-3 ${
                                check.passed
                                  ? 'bg-emerald-50/50 border-emerald-100 text-emerald-900'
                                  : 'bg-amber-50/50 border-amber-100 text-amber-900'
                              }`}
                            >
                              {check.passed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              )}
                              <div className="text-xs">
                                <p className="font-bold">{check.label}</p>
                                <p className="text-[11px] opacity-80 mt-0.5">{check.tip}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Social Share Preview */}
                        <div className="pt-4 border-t border-[#f4f0fa]">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                            Aperçu Réseaux Sociaux (OpenGraph)
                          </span>
                          <div className="rounded-2xl border border-[#e5dbf7] overflow-hidden bg-[#faf8fc] p-3 flex items-center gap-3">
                            <img
                              src={coverImage}
                              alt="Social preview"
                              className="w-16 h-16 rounded-xl object-cover shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="text-xs">
                              <p className="font-bold text-[#3D2E39] line-clamp-1">{seoAnalysis.effectiveMetaTitle}</p>
                              <p className="text-[11px] text-slate-500 line-clamp-1">{seoAnalysis.effectiveMetaDesc}</p>
                              <p className="text-[10px] text-purple-700 font-semibold mt-0.5">blog.stickyandkawaii.eu</p>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                )}

                {/* ======================================================== */}
                {/* SubTab Content 3: ENTIRE DEDICATED READABILITY SUITE */}
                {/* ======================================================== */}
                {editorSubTab === 'readability' && (
                  <div className="space-y-6">
                    
                    {/* Top Readability Metric Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      
                      {/* Metric 1: Overall Score */}
                      <div className="bg-white p-5 rounded-3xl border border-[#e5dbf7] shadow-xs">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Score de Lisibilité
                        </span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-3xl font-bold text-[#4C2882]">
                            {readabilityAnalysis.score}
                          </span>
                          <span className="text-xs text-slate-400">/ 100</span>
                        </div>
                        <p className="text-xs text-emerald-600 font-semibold mt-1">
                          {readabilityAnalysis.fleschLabel}
                        </p>
                      </div>

                      {/* Metric 2: Average words per sentence */}
                      <div className="bg-white p-5 rounded-3xl border border-[#e5dbf7] shadow-xs">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Mots / Phrase
                        </span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-3xl font-bold text-[#3D2E39]">
                            {readabilityAnalysis.avgWordsPerSentence}
                          </span>
                          <span className="text-xs text-slate-400">mots en moy.</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Recommandé : moins de 20 mots
                        </p>
                      </div>

                      {/* Metric 3: Long sentence count */}
                      <div className="bg-white p-5 rounded-3xl border border-[#e5dbf7] shadow-xs">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Phrases trop longues (&gt; 20 mots)
                        </span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className={`text-3xl font-bold ${
                            readabilityAnalysis.longSentences.length === 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {readabilityAnalysis.longSentences.length}
                          </span>
                          <span className="text-xs text-slate-400">/ {readabilityAnalysis.sentenceCount}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {readabilityAnalysis.longSentences.length === 0 ? 'Excellente clarté' : 'À scinder en 2 phrases'}
                        </p>
                      </div>

                      {/* Metric 4: Headings */}
                      <div className="bg-white p-5 rounded-3xl border border-[#e5dbf7] shadow-xs">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Sous-titres (H2/H3)
                        </span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-3xl font-bold text-[#3D2E39]">
                            {readabilityAnalysis.headingsCount}
                          </span>
                          <span className="text-xs text-slate-400">sections</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Rythme visuel fluide
                        </p>
                      </div>

                    </div>

                    {/* Detailed Analysis & Sentence-by-sentence inspector */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Left: Actionable Checklist */}
                      <div className="bg-white p-6 rounded-3xl border border-[#e5dbf7] space-y-4">
                        <h3 className="text-xs font-bold text-[#3D2E39] uppercase tracking-wider">
                          Conseils Rédactionnels & Règle des 20 Mots
                        </h3>

                        <div className="space-y-3">
                          {readabilityAnalysis.issues.map((issue, idx) => (
                            <div
                              key={idx}
                              className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                                issue.type === 'success'
                                  ? 'bg-emerald-50/60 border-emerald-100 text-emerald-900'
                                  : issue.type === 'warning'
                                  ? 'bg-amber-50/60 border-amber-100 text-amber-900'
                                  : 'bg-rose-50/60 border-rose-100 text-rose-900'
                              }`}
                            >
                              {issue.type === 'success' ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              ) : issue.type === 'warning' ? (
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              ) : (
                                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                              )}
                              <p className="text-xs font-semibold leading-relaxed">
                                {issue.message}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Writing Tips Box */}
                        <div className="p-4 rounded-2xl bg-[#faf7ff] border border-[#e5dbf7] text-[#3D2E39] space-y-2 mt-4">
                          <h4 className="text-xs font-bold flex items-center gap-1.5 text-[#4C2882]">
                            <Sparkles className="w-4 h-4" />
                            Guide du style Sticky & Kawaii :
                          </h4>
                          <ul className="text-xs space-y-1.5 text-slate-600 list-disc pl-4">
                            <li><strong>Privilégiez les phrases directes</strong> (1 idée = 1 phrase).</li>
                            <li><strong>Aérez avec des puces</strong> pour les listes de matériel ou conseils.</li>
                            <li><strong>Ajoutez des émojis doux</strong> (✨, 🌸, 💡, ✂️) pour donner un ton chaleureux.</li>
                            <li><strong>Scindez les connecteurs logiques</strong> (« cependant », « par conséquent ») en deux phrases distinctes.</li>
                          </ul>
                        </div>
                      </div>

                      {/* Right: Flagged Long Sentences Inspector */}
                      <div className="bg-white p-6 rounded-3xl border border-[#e5dbf7] space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-[#f4f0fa]">
                          <h3 className="text-xs font-bold text-[#3D2E39] uppercase tracking-wider">
                            Détecteur des phrases trop longues (&gt; 20 mots)
                          </h3>
                          <span className="text-[11px] font-bold text-rose-600">
                            {readabilityAnalysis.longSentences.length} détectée(s)
                          </span>
                        </div>

                        {readabilityAnalysis.longSentences.length === 0 ? (
                          <div className="p-8 text-center bg-emerald-50/50 rounded-2xl border border-emerald-100">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                            <h4 className="text-sm font-bold text-emerald-900">
                              Style impeccable !
                            </h4>
                            <p className="text-xs text-emerald-700 mt-1">
                              Aucune phrase ne dépasse la limite des 20 mots. Votre article est fluide et très agréable à lire.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                            {readabilityAnalysis.longSentences.map((item, idx) => (
                              <div
                                key={idx}
                                className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200 text-[#3D2E39] space-y-2"
                              >
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-bold text-rose-700 flex items-center gap-1">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    Phrase #{idx + 1}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-800 font-bold">
                                    {item.count} mots
                                  </span>
                                </div>

                                <p className="text-xs text-slate-800 italic bg-white p-2.5 rounded-xl border border-rose-100">
                                  « {item.sentence} »
                                </p>

                                <p className="text-[11px] text-slate-500">
                                  💡 <strong>Conseil :</strong> Coupez cette phrase au niveau de la virgule ou du « et » pour créer deux phrases distinctes.
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                )}

                {/* SubTab Content 4: REAL-TIME ARTICLE PREVIEW */}
                {editorSubTab === 'preview' && (
                  <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#e5dbf7] max-w-4xl mx-auto shadow-sm space-y-6">
                    <div className="border-b border-[#e5dbf7] pb-6">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F7ECE3] text-[#4C2882]">
                        {category}
                      </span>
                      <h1 className="text-2xl sm:text-4xl font-bold text-[#3D2E39] font-heading mt-3">
                        {title || 'Titre de l’article'}
                      </h1>
                      <p className="text-sm text-slate-600 mt-3 italic leading-relaxed">
                        {summary || 'Résumé...'}
                      </p>
                    </div>

                    <div className="aspect-video rounded-3xl overflow-hidden bg-slate-100 border border-[#e5dbf7]">
                      <img
                        src={coverImage}
                        alt={title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="prose prose-purple max-w-none text-[#3D2E39] text-sm leading-relaxed whitespace-pre-line font-sans">
                      {content}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* ======================================================== */}
            {/* TAB: CATEGORIES MANAGER (CRUD) */}
            {/* ======================================================== */}
            {currentTab === 'categories' && (
              <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Header Action Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-[#e5dbf7] shadow-xs">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                        <FolderHeart className="w-4 h-4" />
                      </div>
                      <h2 className="text-xl font-bold text-[#3D2E39] font-heading">
                        Gestionnaire des Catégories
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Créez de nouvelles rubriques, personnalisez les icônes, les couleurs pastel et les descriptions de vos thématiques.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={handleOpenCreateCategory}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#4C2882] hover:bg-[#3D206A] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Nouvelle Catégorie</span>
                    </button>
                  </div>
                </div>

                {/* Success Feedback Toast */}
                {categorySaveSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-bold animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>La catégorie a été enregistrée avec succès !</span>
                  </div>
                )}

                {/* Category Creation / Modification Modal/Card */}
                {isCategoryFormOpen && (
                  <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-purple-200 shadow-md space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-[#f4f0fa] pb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-100 text-[#4C2882] flex items-center justify-center">
                          {editingCategory ? <Edit3 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        </div>
                        <h3 className="text-base font-bold text-[#3D2E39]">
                          {editingCategory ? `Modifier la catégorie « ${editingCategory.name} »` : 'Créer une nouvelle catégorie'}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCategoryFormOpen(false);
                          setEditingCategory(null);
                        }}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {categoryFormError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{categoryFormError}</span>
                      </div>
                    )}

                    <form onSubmit={handleSaveCategorySubmit} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                        {/* Name Input */}
                        <div>
                          <label className="block text-xs font-bold text-[#3D2E39] mb-1.5">
                            Nom de la catégorie <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={categoryNameInput}
                            onChange={(e) => setCategoryNameInput(e.target.value)}
                            placeholder="ex. Bullet Journal & Planning, Astuces DIY..."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf8fc] border border-[#e5dbf7] text-xs font-semibold text-[#3D2E39] focus:outline-hidden focus:ring-2 focus:ring-[#4C2882]"
                            required
                          />
                        </div>

                        {/* Description Input */}
                        <div>
                          <label className="block text-xs font-bold text-[#3D2E39] mb-1.5">
                            Description courte
                          </label>
                          <input
                            type="text"
                            value={categoryDescInput}
                            onChange={(e) => setCategoryDescInput(e.target.value)}
                            placeholder="ex. Idées d'organisation, carnet créatif et tutos..."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf8fc] border border-[#e5dbf7] text-xs text-[#3D2E39] focus:outline-hidden focus:ring-2 focus:ring-[#4C2882]"
                          />
                        </div>

                      </div>

                      {/* Icon Selector Grid */}
                      <div>
                        <label className="block text-xs font-bold text-[#3D2E39] mb-2">
                          Choisir une icône kawaii
                        </label>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                          {AVAILABLE_CATEGORY_ICONS.map((item) => {
                            const isSelected = categoryIconInput === item.id;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => setCategoryIconInput(item.id)}
                                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-purple-100 border-[#4C2882] text-[#4C2882] ring-2 ring-purple-300 font-bold shadow-xs'
                                    : 'bg-[#faf8fc] border-[#e5dbf7] text-slate-600 hover:bg-white hover:border-purple-300'
                                }`}
                              >
                                {renderCategoryIcon(item.id, 'w-4 h-4')}
                                <span className="text-[10px] truncate max-w-full">{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Color Palette Selector */}
                      <div>
                        <label className="block text-xs font-bold text-[#3D2E39] mb-2">
                          Palette de couleur pastel
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {Object.values(CATEGORY_COLORS).map((col) => {
                            const isSelected = categoryColorInput === col.key;
                            return (
                              <button
                                key={col.key}
                                type="button"
                                onClick={() => setCategoryColorInput(col.key)}
                                className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-white border-[#4C2882] ring-2 ring-purple-300 shadow-xs'
                                    : 'bg-[#faf8fc] border-[#e5dbf7] hover:bg-white hover:border-slate-300'
                                }`}
                              >
                                <span className={`w-4 h-4 rounded-full border ${col.badge} shrink-0`} />
                                <span className="text-xs font-semibold text-slate-700">{col.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Live Badge Preview */}
                      <div className="p-4 rounded-2xl bg-[#f4f0fa] border border-[#e5dbf7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            Aperçu en direct sur le site :
                          </span>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Voici comment cette catégorie s'affichera dans les badges d'articles et les menus.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs ${getCategoryBadgeClasses(categoryColorInput)}`}>
                            {renderCategoryIcon(categoryIconInput, 'w-3.5 h-3.5')}
                            <span>{categoryNameInput || 'Nom de la catégorie'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Form Actions */}
                      <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f4f0fa]">
                        <button
                          type="button"
                          onClick={() => {
                            setIsCategoryFormOpen(false);
                            setEditingCategory(null);
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-[#4C2882] hover:bg-[#3D206A] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{editingCategory ? 'Mettre à jour la catégorie' : 'Créer la catégorie'}</span>
                        </button>
                      </div>

                    </form>
                  </div>
                )}

                {/* Category Search & Filter */}
                <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-[#e5dbf7]">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={categorySearchQuery}
                      onChange={(e) => setCategorySearchQuery(e.target.value)}
                      placeholder="Rechercher une catégorie..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#faf8fc] border border-[#e5dbf7] text-xs text-[#3D2E39] focus:outline-hidden focus:ring-2 focus:ring-[#4C2882]"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-500 pr-2">
                    {categories.length} catégorie(s) au total
                  </span>
                </div>

                {/* Categories Grid List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {categories
                    .filter((cat) => {
                      if (!categorySearchQuery.trim()) return true;
                      const q = categorySearchQuery.toLowerCase();
                      return (
                        cat.name.toLowerCase().includes(q) ||
                        (cat.description && cat.description.toLowerCase().includes(q))
                      );
                    })
                    .map((cat) => {
                      const articleCount = articles.filter((a) => a.category === cat.name).length;
                      const colorCfg = getCategoryColorConfig(cat.color);
                      const isConfirmingDelete = confirmDeleteCategoryId === cat.id;

                      return (
                        <div
                          key={cat.id}
                          className="bg-white rounded-3xl border border-[#e5dbf7] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                        >
                          <div>
                            {/* Card Top: Icon Pill & Article Count */}
                            <div className="flex items-center justify-between mb-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs ${getCategoryBadgeClasses(cat.color)}`}>
                                {renderCategoryIcon(cat.icon, 'w-3.5 h-3.5')}
                                <span>{cat.name}</span>
                              </span>

                              <span className="px-2 py-0.5 rounded-full bg-[#f4f0fa] text-[#4C2882] text-[11px] font-bold">
                                {articleCount} article{articleCount > 1 ? 's' : ''}
                              </span>
                            </div>

                            {/* Description */}
                            <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                              {cat.description || <span className="italic text-slate-400">Aucune description fournie.</span>}
                            </p>

                            {/* Category Metadata */}
                            <div className="mt-3 pt-3 border-t border-[#f8f6fb] flex items-center justify-between text-[11px] text-slate-400">
                              <span>Identifiant slug :</span>
                              <code className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 font-mono text-[10px]">
                                #{cat.slug}
                              </code>
                            </div>
                          </div>

                          {/* Card Footer Actions */}
                          <div className="mt-4 pt-3 border-t border-[#f4f0fa] flex items-center justify-between gap-2">
                            {isConfirmingDelete ? (
                              <div className="w-full flex items-center justify-between bg-rose-50 border border-rose-200 p-2 rounded-xl text-xs">
                                <span className="text-rose-800 font-bold text-[11px]">
                                  Supprimer ? {articleCount > 0 ? `(${articleCount} art. réassignés)` : ''}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleDeleteCategoryConfirm(cat.id)}
                                    className="px-2 py-1 bg-rose-600 text-white rounded-lg font-bold text-[11px] hover:bg-rose-700 cursor-pointer"
                                  >
                                    Oui
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteCategoryId(null)}
                                    className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] hover:bg-slate-300 cursor-pointer"
                                  >
                                    Non
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setCategory(cat.name);
                                    handleNewArticle();
                                  }}
                                  className="text-[11px] font-bold text-[#4C2882] hover:text-[#7c3aed] flex items-center gap-1 hover:underline cursor-pointer"
                                  title="Créer un article dans cette catégorie"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>+ Article</span>
                                </button>

                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleOpenEditCategory(cat)}
                                    className="p-1.5 rounded-xl text-slate-500 hover:text-[#4C2882] hover:bg-[#f4f0fa] transition-colors cursor-pointer"
                                    title="Modifier la catégorie"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => setConfirmDeleteCategoryId(cat.id)}
                                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                    title="Supprimer la catégorie"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>

                        </div>
                      );
                    })}
                </div>

              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 3: COMMENTS MODERATION */}
            {/* ======================================================== */}
            {currentTab === 'comments' && (
              <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#e5dbf7]">
                  <div>
                    <h2 className="text-xl font-bold text-[#3D2E39] font-heading">
                      Modération des Commentaires
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Gérez les avis et messages bienveillants laissés par vos lecteurs.
                    </p>
                  </div>

                  <div className="text-xs font-bold text-purple-900 px-3 py-1.5 rounded-xl bg-purple-50">
                    Total : {comments.length} commentaire(s)
                  </div>
                </div>

                {/* Filter */}
                <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-2xl border border-[#e5dbf7]">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={commentSearchQuery}
                      onChange={(e) => setCommentSearchQuery(e.target.value)}
                      placeholder="Rechercher par auteur ou mot..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#faf8fc] border border-[#e5dbf7] text-xs text-[#3D2E39] focus:outline-hidden"
                    />
                  </div>

                  <select
                    value={commentFilterArticle}
                    onChange={(e) => setCommentFilterArticle(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-[#faf8fc] border border-[#e5dbf7] text-xs font-semibold text-[#3D2E39] focus:outline-hidden"
                  >
                    <option value="all">Tous les articles</option>
                    {articles.map((art) => (
                      <option key={art.id} value={art.id}>
                        {art.title.substring(0, 30)}...
                      </option>
                    ))}
                  </select>
                </div>

                {/* Comments List */}
                <div className="space-y-3">
                  {filteredComments.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-3xl border border-[#e5dbf7]">
                      <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-600">Aucun commentaire trouvé</p>
                    </div>
                  ) : (
                    filteredComments.map((com) => {
                      const parentArticle = articles.find((a) => a.id === com.articleId);
                      return (
                        <div
                          key={com.id}
                          className="bg-white p-4 sm:p-5 rounded-3xl border border-[#e5dbf7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                        >
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#4C2882]">
                                {com.author}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                • {com.createdAt}
                              </span>
                              {parentArticle && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f4f0fa] text-[#3D2E39] font-medium line-clamp-1">
                                  Sur : {parentArticle.title}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed">
                              « {com.content} »
                            </p>
                          </div>

                          {confirmDeleteCommentId === com.id ? (
                            <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-xl animate-in fade-in shrink-0">
                              <span className="text-[11px] font-bold text-rose-700">Supprimer ?</span>
                              <button
                                onClick={() => {
                                  onDeleteComment(com.id);
                                  setConfirmDeleteCommentId(null);
                                }}
                                className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                              >
                                Oui
                              </button>
                              <button
                                onClick={() => setConfirmDeleteCommentId(null)}
                                className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                              >
                                Non
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteCommentId(com.id)}
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                              title="Supprimer le commentaire"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 4: NEWSLETTER SUBSCRIBERS WITH REGISTRATION DATES */}
            {/* ======================================================== */}
            {currentTab === 'subscribers' && (
              <div className="max-w-6xl mx-auto space-y-6">
                {/* Header & Quick Actions */}
                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#e5dbf7] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center">
                        <Mail className="w-4 h-4" />
                      </div>
                      <h2 className="text-xl font-bold text-[#3D2E39] font-heading">
                        Abonnés à la Newsletter
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Gestion des inscriptions, horodatage des dates d'adhésion et export des contacts.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleCopyAllEmails}
                      disabled={subscribers.length === 0}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        copiedEmailsToast
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-[#f4f0fa] hover:bg-[#ebdff7] text-[#4C2882]'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {copiedEmailsToast ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Emails copiés !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copier tous les emails</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleExportCSV}
                      disabled={subscribers.length === 0}
                      className="px-3.5 py-2 rounded-xl bg-[#4C2882] hover:bg-[#3D2E39] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Exporter CSV</span>
                    </button>
                  </div>
                </div>

                {/* Quick Add Form */}
                <div className="bg-white p-5 rounded-3xl border border-[#e5dbf7] shadow-xs">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Ajouter manuellement une adresse email
                  </h3>
                  <form onSubmit={handleManualAdd} className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={manualEmailInput}
                        onChange={(e) => setManualEmailInput(e.target.value)}
                        placeholder="exemple@domaine.fr"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-[#fbf9fe] text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#4C2882] focus:bg-white transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter l'abonné</span>
                    </button>
                  </form>

                  {manualEmailError && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {manualEmailError}
                    </p>
                  )}
                  {manualEmailSuccess && (
                    <p className="text-[11px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {manualEmailSuccess}
                    </p>
                  )}
                </div>

                {/* Search, Sort & Counter Bar */}
                <div className="bg-white p-4 rounded-3xl border border-[#e5dbf7] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filtrer par email..."
                      value={subscriberSearchQuery}
                      onChange={(e) => setSubscriberSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-[#fbf9fe] text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#4C2882] focus:bg-white transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-xs text-slate-500 font-medium">
                      {filteredSubscribers.length} sur {subscribers.length} inscrit(s)
                    </span>

                    <select
                      value={subscriberSortOrder}
                      onChange={(e) => setSubscriberSortOrder(e.target.value as 'newest' | 'oldest')}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-[#fbf9fe] text-xs text-slate-700 font-semibold focus:outline-none focus:border-[#4C2882] cursor-pointer"
                    >
                      <option value="newest">Date : Plus récent</option>
                      <option value="oldest">Date : Plus ancien</option>
                    </select>
                  </div>
                </div>

                {/* Subscribers List / Table */}
                <div className="space-y-2.5">
                  {filteredSubscribers.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-[#e5dbf7]">
                      <Mail className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-600">Aucun abonné trouvé</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {subscriberSearchQuery ? 'Modifiez votre recherche.' : 'Les nouvelles inscriptions apparaîtront ici.'}
                      </p>
                    </div>
                  ) : (
                    filteredSubscribers.map((sub) => {
                      const isCopied = copiedSingleEmailId === sub.id;
                      return (
                        <div
                          key={sub.id}
                          className="bg-white p-4 sm:p-5 rounded-3xl border border-[#e5dbf7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs hover:border-[#cfbef0] transition-colors"
                        >
                          <div className="space-y-1.5 flex-1 min-w-0">
                            {/* Email address with copy button */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-[#3D2E39] font-mono select-all break-all">
                                {sub.email}
                              </span>
                              <button
                                onClick={() => handleCopySingleEmail(sub.id, sub.email)}
                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#4C2882] transition-colors cursor-pointer"
                                title="Copier cette adresse email"
                              >
                                {isCopied ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                              {isCopied && (
                                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md">
                                  Copié !
                                </span>
                              )}
                            </div>

                            {/* Date of registration and origin badge */}
                            <div className="flex items-center gap-2.5 text-xs text-slate-500 flex-wrap">
                              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                                <Calendar className="w-3.5 h-3.5 text-[#7c3aed]" />
                                <span>Inscrit le : <strong>{formatSubscriberDate(sub.subscribedAt)}</strong></span>
                              </div>
                              <span className="text-slate-300">•</span>
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f4f0fa] text-[#4C2882] font-semibold">
                                {sub.source || 'Formulaire bas de page'}
                              </span>
                            </div>
                          </div>

                          {/* Delete subscriber button / inline confirmation */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            {confirmDeleteSubscriberId === sub.id ? (
                              <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-xl animate-in fade-in">
                                <span className="text-[11px] font-bold text-rose-700">Supprimer ?</span>
                                <button
                                  onClick={() => {
                                    onDeleteSubscriber(sub.id);
                                    setConfirmDeleteSubscriberId(null);
                                  }}
                                  className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                                >
                                  Oui
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteSubscriberId(null)}
                                  className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                                >
                                  Non
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteSubscriberId(sub.id)}
                                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Supprimer cet abonné"
                              >
                                <Trash2 className="w-4 h-4" />
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

            {/* ======================================================== */}
            {/* TAB 5: BLOG STATS & METRICS OVERVIEW */}
            {/* ======================================================== */}
            {currentTab === 'stats' && (
              <div className="max-w-6xl mx-auto space-y-6">
                <div className="bg-white p-5 rounded-3xl border border-[#e5dbf7]">
                  <h2 className="text-xl font-bold text-[#3D2E39] font-heading">
                    Tableau de bord & Statistiques
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Vue d'ensemble des interactions et de la communauté Sticky and Kawaii.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="bg-white p-6 rounded-3xl border border-[#e5dbf7] shadow-xs">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Articles en ligne
                    </span>
                    <p className="text-3xl font-bold text-[#4C2882] mt-2">
                      {stats.published}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      + {stats.drafts} brouillon(s)
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-[#e5dbf7] shadow-xs">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Abonnés Newsletter
                    </span>
                    <p className="text-3xl font-bold text-pink-600 mt-2">
                      {stats.totalSubscribers}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Lecteurs fidèles inscrits
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-[#e5dbf7] shadow-xs">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Commentaires déposés
                    </span>
                    <p className="text-3xl font-bold text-indigo-600 mt-2">
                      {stats.totalComments}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Messages de la communauté
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-[#e5dbf7] shadow-xs">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Total Réactions
                    </span>
                    <p className="text-3xl font-bold text-amber-600 mt-2">
                      {stats.totalReactions}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Coeurs, étoiles et paillettes
                    </p>
                  </div>
                </div>

                {/* Reset to initial data */}
                <div className="p-6 rounded-3xl bg-white border border-[#e5dbf7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Réinitialisation des données de démonstration
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Restaure les articles initiaux, abonnés et commentaires par défaut si nécessaire.
                    </p>
                  </div>

                  {confirmResetOpen ? (
                    <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 p-2 rounded-2xl animate-in fade-in">
                      <span className="text-xs font-bold text-rose-700">Tout réinitialiser ?</span>
                      <button
                        onClick={() => {
                          onResetDefaults();
                          setConfirmResetOpen(false);
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                      >
                        Oui, réinitialiser
                      </button>
                      <button
                        onClick={() => setConfirmResetOpen(false)}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmResetOpen(true)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Réinitialiser les données</span>
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* Link Insertion Popup Modal */}
      <AnimatePresence>
        {isLinkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e5dbf7] space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#f4f0fa]">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-100 text-[#7c3aed]">
                    <Link className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#3D2E39] font-heading">
                    Insérer un lien cliquable
                  </h3>
                </div>
                <button
                  onClick={() => setIsLinkModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Texte cliquable du lien
                  </label>
                  <input
                    type="text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="Ex: Découvrez notre collection de stickers"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#faf8fc] border border-[#e5dbf7] text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#7c3aed]"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">C'est ce texte qui apparaîtra directement en violet cliquable, sans code brut.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Lien vers un autre article du blog (optionnel)
                  </label>
                  <select
                    value={linkTargetArticleId}
                    onChange={(e) => {
                      const artId = e.target.value;
                      setLinkTargetArticleId(artId);
                      if (artId) {
                        const target = articles.find(a => a.id === artId);
                        if (target) {
                          setLinkUrl(`#article-${target.id}`);
                          if (!linkText || linkText === 'Mon lien') {
                            setLinkText(target.title);
                          }
                        }
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#faf8fc] border border-[#e5dbf7] text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#7c3aed]"
                  >
                    <option value="">-- Choisir un article existant --</option>
                    {articles.map((art) => (
                      <option key={art.id} value={art.id}>
                        📄 {art.title} ({art.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    URL de destination (Externe ou Interne)
                  </label>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => {
                      setLinkUrl(e.target.value);
                      setLinkTargetArticleId('');
                    }}
                    placeholder="https://example.com ou #article-id"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#faf8fc] border border-[#e5dbf7] text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#7c3aed]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="link-new-tab"
                    checked={linkNewTab}
                    onChange={(e) => setLinkNewTab(e.target.checked)}
                    className="w-4 h-4 rounded text-[#7c3aed] focus:ring-[#7c3aed] accent-[#7c3aed]"
                  />
                  <label htmlFor="link-new-tab" className="text-xs font-medium text-slate-700 cursor-pointer">
                    Ouvrir le lien dans un nouvel onglet (recommandé pour les liens externes)
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f4f0fa]">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!linkText.trim()) return;
                    const finalUrl = linkUrl.trim() || '#';
                    const markdownLink = `[${linkText.trim()}](${finalUrl})`;
                    
                    const textarea = document.getElementById('article-content-textarea') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const val = content;
                      const newVal = val.substring(0, start) + markdownLink + val.substring(end);
                      setContent(newVal);
                    } else {
                      setContent(content + ' ' + markdownLink);
                    }
                    setIsLinkModalOpen(false);
                  }}
                  className="px-5 py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Insérer le lien
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
