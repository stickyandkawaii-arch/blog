import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Bookmark, 
  MessageCircle, 
  Send, 
  Sparkles, 
  Check, 
  Heart,
  HelpCircle,
  Tag,
  ShoppingBag,
  ExternalLink,
  Trash2,
  ShieldCheck,
  Smile,
  ListOrdered,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Article, Comment, ReactionType, UserReactions, Category, Poll, UserPollVotes } from '../types';
import { SocialShareBar } from './SocialShareBar';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface ArticleViewProps {
  article: Article;
  comments: Comment[];
  userReactions: UserReactions;
  polls?: Poll[];
  userPollVotes?: UserPollVotes;
  onVote?: (pollId: string, optionId: string) => void;
  onBack: () => void;
  onReact: (articleId: string, reaction: ReactionType) => void;
  onAddComment: (articleId: string, author: string, content: string, avatarIcon?: string) => void;
  onDeleteComment?: (commentId: string) => void;
  isAdminLoggedIn: boolean;
  onSelectCategory: (category: Category) => void;
  relatedArticles: Article[];
  onSelectArticle: (article: Article) => void;
}

export const ArticleView: React.FC<ArticleViewProps> = ({
  article,
  comments,
  userReactions,
  polls = [],
  userPollVotes = {},
  onVote = () => {},
  onBack,
  onReact,
  onAddComment,
  onDeleteComment,
  isAdminLoggedIn,
  onSelectCategory,
  relatedArticles,
  onSelectArticle,
}) => {
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [selectedAvatarIcon, setSelectedAvatarIcon] = useState('🌸');
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [floatingParticles, setFloatingParticles] = useState<{ id: number; symbol: string; x: number }[]>([]);
  const [isTocOpen, setIsTocOpen] = useState(true);

  // Extract table of contents from content paragraphs (H2 and H3)
  const tocItems = useMemo(() => {
    const items: { id: string; text: string; level: number }[] = [];
    const blocks = article.content.split('\n\n');
    blocks.forEach((block, idx) => {
      const trimmed = block.trim();
      if (trimmed.startsWith('## ')) {
        const text = trimmed.replace('## ', '').replace(/\*\*/g, '');
        const id = `heading-h2-${idx}`;
        items.push({ id, text, level: 2 });
      } else if (trimmed.startsWith('### ')) {
        const text = trimmed.replace('### ', '').replace(/\*\*/g, '');
        const id = `heading-h3-${idx}`;
        items.push({ id, text, level: 3 });
      }
    });
    return items;
  }, [article.content]);

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const currentReactions = userReactions[article.id] || {};

  const handleReactionClick = (type: ReactionType, symbol: string) => {
    onReact(article.id, type);

    // Spawn floating particle effect
    const newParticle = {
      id: Date.now() + Math.random(),
      symbol,
      x: Math.random() * 40 - 20,
    };
    setFloatingParticles((prev) => [...prev, newParticle]);
    setTimeout(() => {
      setFloatingParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
    }, 1200);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentAuthor.trim() || !commentContent.trim()) return;

    onAddComment(article.id, commentAuthor.trim(), commentContent.trim(), selectedAvatarIcon);
    setCommentContent('');
    setCommentSubmitted(true);
    setTimeout(() => setCommentSubmitted(false), 3500);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Format content paragraphs and special HTML/markdown blocks
  const renderFormattedContent = (content: string) => {
    const blocks = content.split('\n\n');

    return blocks.map((block, idx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      // Raw HTML block (e.g., <table>, <div>, <p>, <iframe>, <img)
      if ((trimmed.startsWith('<') && trimmed.includes('>')) || trimmed.includes('<table')) {
        return (
          <div
            key={idx}
            className="my-4 leading-relaxed overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: trimmed }}
          />
        );
      }

      // Heading 2
      if (trimmed.startsWith('## ')) {
        const text = trimmed.replace('## ', '');
        const id = `heading-h2-${idx}`;
        return (
          <h2
            key={idx}
            id={id}
            className="font-['Comfortaa',cursive] text-xl sm:text-2xl font-bold text-[#3D2E39] mt-10 mb-4 pt-4 border-t border-[#f4f0fa] flex items-center gap-2.5 scroll-mt-24"
          >
            <span className="w-2.5 h-6 rounded-full bg-[#7c3aed]" />
            <span>{text}</span>
          </h2>
        );
      }

      // Heading 3
      if (trimmed.startsWith('### ')) {
        const text = trimmed.replace('### ', '');
        const id = `heading-h3-${idx}`;
        return (
          <h3 
            key={idx} 
            id={id}
            className="font-['Comfortaa',cursive] text-lg sm:text-xl font-bold text-[#4c1d95] mt-8 mb-3 flex items-center gap-2 scroll-mt-24"
          >
            {text}
          </h3>
        );
      }

      // Blockquote
      if (trimmed.startsWith('> ')) {
        const quoteText = trimmed.replace(/^> \*/, '').replace(/\*$/, '').replace(/^> /, '');
        return (
          <blockquote 
            key={idx} 
            className="my-6 p-4 sm:p-5 rounded-2xl bg-[#faeedd]/60 border-l-4 border-[#e6a875] text-[#5c3818] italic font-medium text-sm sm:text-base leading-relaxed"
          >
            {quoteText}
          </blockquote>
        );
      }

      // Bullet List
      if (trimmed.includes('\n- ') || trimmed.startsWith('- ')) {
        const items = trimmed.split('\n').filter(line => line.startsWith('- '));
        return (
          <ul key={idx} className="my-4 space-y-2 text-sm sm:text-base text-slate-700">
            {items.map((item, itemIdx) => (
              <li key={itemIdx} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] mt-2 shrink-0" />
                <span dangerouslySetInnerHTML={{ 
                  __html: item.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                }} />
              </li>
            ))}
          </ul>
        );
      }

      // Numbered List
      if (trimmed.match(/^\d+\./m)) {
        const items = trimmed.split('\n').filter(line => line.match(/^\d+\./));
        return (
          <ol key={idx} className="my-4 space-y-2 text-sm sm:text-base text-slate-700">
            {items.map((item, itemIdx) => (
              <li key={itemIdx} className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-100 text-[#7c3aed] font-bold text-xs shrink-0 mt-0.5">
                  {itemIdx + 1}
                </span>
                <span>{item.replace(/^\d+\.\s*/, '')}</span>
              </li>
            ))}
          </ol>
        );
      }

      // Standard Paragraph
      return (
        <div 
          key={idx} 
          className="text-sm sm:text-base text-slate-700 leading-relaxed my-4"
          dangerouslySetInnerHTML={{
            __html: trimmed
              .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
              .replace(/\*(.*?)\*/g, '<em class="italic text-purple-900">$1</em>')
              .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#7c3aed] font-semibold underline hover:text-[#5b21b6] transition-colors">$1</a>')
          }}
        />
      );
    });
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#e5dbf7] text-xs sm:text-sm font-bold text-[#6d28d9] hover:bg-[#f4f0fa] transition-colors shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux articles</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#e5dbf7] text-xs font-semibold text-slate-600 hover:text-[#7c3aed] hover:bg-[#f4f0fa] transition-colors shadow-xs"
            title="Copier le lien"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Lien copié !</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Partager</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Reading Card */}
      <div className="bg-white rounded-3xl border border-[#e5dbf7] shadow-sm overflow-hidden p-6 sm:p-10">
        
        {/* Article Header & Categories */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
            <button
              onClick={() => onSelectCategory(article.category)}
              className="px-3 py-1 rounded-full bg-purple-100 hover:bg-purple-200 text-[#6d28d9] font-bold text-xs border border-purple-200 transition-colors"
            >
              {article.category}
            </button>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#7c3aed]" />
              {article.publishedAt}
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5 text-[#7c3aed]" />
              {article.readingTime} de lecture
            </span>
          </div>

          <h1 className="font-['Comfortaa',cursive] text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight mb-4">
            {article.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal bg-[#fcfaff] p-4 rounded-2xl border border-[#f0e8fc]">
            {article.summary}
          </p>
        </div>

        {/* Author Badge */}
        <div className="flex items-center gap-3.5 py-4 border-y border-[#f4f0fa] mb-8">
          <img
            src={article.author.avatar}
            alt={article.author.name}
            className="w-12 h-12 rounded-full border-2 border-[#7c3aed]/30 object-cover"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-slate-800">
                {article.author.name}
              </h4>
              <span className="px-2 py-0.5 rounded-md bg-purple-100 text-[#7c3aed] text-[10px] font-bold uppercase tracking-wider">
                Officiel
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {article.author.role} • Sticky and Kawaii Studio
            </p>
          </div>
        </div>

        {/* Main Cover Image */}
        <div className="relative aspect-16/9 rounded-2xl overflow-hidden mb-8 shadow-sm border border-[#e5dbf7]">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* AUTOMATIC TABLE OF CONTENTS (SOMMAIRE) */}
        {tocItems.length > 0 && (
          <div className="mb-10 bg-gradient-to-br from-[#faf7ff] to-[#f4edfc] border border-[#e5dbf7] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsTocOpen(!isTocOpen)}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-100 text-[#7c3aed]">
                  <ListOrdered className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-['Comfortaa',cursive] text-sm font-bold text-[#3D2E39]">
                    Sommaire de l'article ({tocItems.length} sections)
                  </h3>
                  <p className="text-[11px] text-slate-500">Navigation rapide dans le contenu</p>
                </div>
              </div>
              <button
                type="button"
                className="p-1.5 rounded-lg text-[#7c3aed] hover:bg-purple-100/50 transition-colors cursor-pointer"
              >
                {isTocOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {isTocOpen && (
              <nav className="mt-4 pt-3 border-t border-[#e5dbf7] space-y-1.5 max-h-64 overflow-y-auto pr-2">
                {tocItems.map((item: TocItem, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => scrollToHeading(item.id)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between group cursor-pointer ${
                      item.level === 3 
                        ? 'pl-6 text-slate-600 hover:bg-white hover:text-[#7c3aed]' 
                        : 'text-[#3D2E39] hover:bg-white hover:text-[#7c3aed] font-bold'
                    }`}
                  >
                    <span className="truncate group-hover:translate-x-1 transition-transform">
                      {item.level === 3 ? '↳ ' : '• '} {item.text}
                    </span>
                    <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Aller à la section
                    </span>
                  </button>
                ))}
              </nav>
            )}
          </div>
        )}

        {/* Article Body Content */}
        <div className="prose prose-purple article-content max-w-none mb-10">
          {renderFormattedContent(article.content)}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-[#f4f0fa]">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
            <Tag className="w-3.5 h-3.5" />
            Mots-clés :
          </span>
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-lg bg-[#f4f0fa] text-[#6d28d9] text-xs font-semibold border border-[#e5dbf7]"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Sticky Boutique Callout */}
        <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#faeedd] via-[#fdf5eb] to-[#f4f0fa] border border-[#ebd9c1] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white text-[#a86224] shadow-xs shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-['Comfortaa',cursive] text-sm sm:text-base font-bold text-[#5c3818]">
                Craquez pour nos créations sur la boutique !
              </h4>
              <p className="text-xs text-[#7a4e27] mt-0.5">
                Retrouvez toutes les planches de stickers, toploaders et washi tapes sur stickyandkawaii.eu
              </p>
            </div>
          </div>
          <a
            href="https://stickyandkawaii.eu"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5c3818] hover:bg-[#41250e] text-white text-xs font-bold transition-all shadow-xs"
          >
            <span>Découvrir la boutique</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Social Share Bar (In-page block & floating bar on scroll) */}
        <SocialShareBar article={article} />

        {/* Kawaii Reactions System */}
        <div id="kawaii-reactions-section" className="mt-10 pt-8 border-t border-[#f4f0fa] text-center relative">
          <div className="relative inline-block mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-[#7c3aed] text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Réactions Kawaii</span>
            </div>
            <h3 className="font-['Comfortaa',cursive] text-xl font-bold text-slate-900 mb-1">
              Avez-vous aimé cet article ? ✨
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Choisissez parmi nos emojis tout mignons pour envoyer votre dose d’amour et d’inspiration créative à Karine !
            </p>

            {/* Floating Particles Animation */}
            {floatingParticles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ opacity: 1, y: 0, x: particle.x, scale: 0.8 }}
                animate={{ opacity: 0, y: -70, scale: 1.5 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="absolute left-1/2 bottom-12 pointer-events-none text-2xl z-20"
              >
                {particle.symbol}
              </motion.div>
            ))}
          </div>

          {/* Predefined Cute Emoji Reaction Buttons (Stars, Hearts, Butterflies) */}
          <div className="flex items-center justify-center gap-3 sm:gap-5 flex-wrap my-4">
            
            {/* Stars (Étoiles) */}
            <button
              id="reaction-stars-btn"
              onClick={() => handleReactionClick('stars', '⭐')}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl border font-bold text-sm transition-all transform active:scale-90 cursor-pointer shadow-xs ${
                currentReactions.stars
                  ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-md ring-2 ring-amber-400/40'
                  : 'bg-[#fcfaff] border-[#e5dbf7] hover:bg-amber-50 hover:border-amber-200 text-slate-700'
              }`}
              title="Envoyer des étoiles magiques (⭐)"
            >
              <span className="text-xl">⭐</span>
              <span className="text-slate-800">Étoiles</span>
              <span className="px-2.5 py-0.5 rounded-full bg-white text-xs text-amber-900 font-extrabold border border-amber-200 shadow-2xs">
                {article.reactions.stars}
              </span>
            </button>

            {/* Hearts (Cœurs) */}
            <button
              id="reaction-hearts-btn"
              onClick={() => handleReactionClick('hearts', '💖')}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl border font-bold text-sm transition-all transform active:scale-90 cursor-pointer shadow-xs ${
                currentReactions.hearts
                  ? 'bg-pink-100 border-pink-300 text-pink-900 shadow-md ring-2 ring-pink-400/40'
                  : 'bg-[#fcfaff] border-[#e5dbf7] hover:bg-pink-50 hover:border-pink-200 text-slate-700'
              }`}
              title="Envoyer des cœurs kawaii (💖)"
            >
              <span className="text-xl">💖</span>
              <span className="text-slate-800">Cœurs</span>
              <span className="px-2.5 py-0.5 rounded-full bg-white text-xs text-pink-900 font-extrabold border border-pink-200 shadow-2xs">
                {article.reactions.hearts}
              </span>
            </button>

            {/* Butterflies (Papillons) */}
            <button
              id="reaction-butterflies-btn"
              onClick={() => handleReactionClick('butterflies', '🦋')}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl border font-bold text-sm transition-all transform active:scale-90 cursor-pointer shadow-xs ${
                currentReactions.butterflies
                  ? 'bg-purple-100 border-purple-300 text-purple-900 shadow-md ring-2 ring-purple-400/40'
                  : 'bg-[#fcfaff] border-[#e5dbf7] hover:bg-purple-50 hover:border-purple-200 text-slate-700'
              }`}
              title="Envoyer des papillons doux (🦋)"
            >
              <span className="text-xl">🦋</span>
              <span className="text-slate-800">Papillons</span>
              <span className="px-2.5 py-0.5 rounded-full bg-white text-xs text-purple-900 font-extrabold border border-purple-200 shadow-2xs">
                {article.reactions.butterflies}
              </span>
            </button>

          </div>

          {/* Breakdown summary below the buttons */}
          <div className="mt-3 flex items-center justify-center gap-3 sm:gap-6 text-xs text-slate-600 flex-wrap">
            <span className="font-semibold text-slate-500">Total réactions :</span>
            <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
              ⭐ {article.reactions.stars} étoile{article.reactions.stars > 1 ? 's' : ''}
            </span>
            <span className="inline-flex items-center gap-1 font-bold text-pink-800 bg-pink-50 px-2.5 py-1 rounded-lg border border-pink-100">
              💖 {article.reactions.hearts} cœur{article.reactions.hearts > 1 ? 's' : ''}
            </span>
            <span className="inline-flex items-center gap-1 font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
              🦋 {article.reactions.butterflies} papillon{article.reactions.butterflies > 1 ? 's' : ''}
            </span>
          </div>
        </div>

      </div>

      {/* Comments Section */}
      <section id="comments-section" className="mt-10 bg-white rounded-3xl border border-[#e5dbf7] p-6 sm:p-10 shadow-xs">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#f4f0fa]">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-purple-100 text-[#7c3aed]">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Comfortaa',cursive] text-lg sm:text-xl font-bold text-slate-900">
                Espace Commentaires
              </h3>
              <p className="text-xs text-slate-500">
                Partagez votre avis, vos créations ou posez une question à Karine
              </p>
            </div>
          </div>
          <span className="self-start sm:self-auto px-3.5 py-1 rounded-full bg-[#f4f0fa] text-[#6d28d9] font-bold text-xs border border-[#e5dbf7]">
            {comments.length} message{comments.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Administrator Moderation Banner (if logged in) */}
        {isAdminLoggedIn && (
          <div className="mb-6 p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#7c3aed] shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#4c1d95]">
                  Mode Modération Administrateur Actif
                </p>
                <p className="text-[11px] text-[#6d28d9]">
                  En tant qu'administrateur, vous pouvez supprimer les commentaires inappropriés directement ci-dessous.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7c3aed] text-white uppercase shrink-0">
              Admin
            </span>
          </div>
        )}

        {/* Existing Comments List */}
        <div className="space-y-4 mb-8">
          {comments.length === 0 ? (
            <div className="text-center py-10 bg-[#fcfaff] rounded-2xl border border-dashed border-[#e5dbf7]">
              <p className="text-sm font-semibold text-slate-600 mb-1">
                Soyez la première personne à laisser un petit mot doux ! 🌸
              </p>
              <p className="text-xs text-slate-400">
                Utilisez le formulaire ci-dessous pour publier votre commentaire.
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 sm:p-5 rounded-2xl bg-[#fcfaff] border border-[#f0e8fc] hover:border-[#e5dbf7] transition-all relative group"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-base shadow-2xs ${comment.avatarColor}`}>
                      {comment.avatarIcon || comment.author.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900">
                          {comment.author}
                        </span>
                        {comment.author.toLowerCase().includes('sticky') && (
                          <span className="px-1.5 py-0.5 rounded-md bg-purple-100 text-[#7c3aed] text-[9px] font-bold">
                            Auteur
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {comment.createdAt}
                      </span>
                    </div>
                  </div>

                  {/* Admin Moderation Button */}
                  {isAdminLoggedIn && onDeleteComment && (
                    <div className="flex items-center gap-1.5">
                      {confirmDeleteId === comment.id ? (
                        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-rose-200 shadow-xs">
                          <button
                            onClick={() => {
                              onDeleteComment(comment.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-1 text-[11px] font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer"
                          >
                            Confirmer
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 text-[11px] font-semibold rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(comment.id)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                          title="Modérer / Supprimer ce commentaire (Admin)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-11.5">
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Form with Basic User Identification */}
        <form onSubmit={handleCommentSubmit} className="bg-[#f4f0fa]/70 p-5 sm:p-7 rounded-2xl border border-[#e5dbf7]">
          <h4 className="font-['Comfortaa',cursive] text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#7c3aed]" />
            Laisser un commentaire
          </h4>

          {/* User Identification Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Votre prénom ou pseudo kawaii *
              </label>
              <input
                type="text"
                required
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                placeholder="Ex : Mina_Stickers, Luna, Chloé..."
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-white border border-[#e5dbf7] focus:outline-hidden focus:ring-2 focus:ring-[#7c3aed]/30 placeholder:text-slate-400"
              />
            </div>

            {/* Cute Avatar Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5 text-[#7c3aed]" />
                Choisissez votre avatar kawaii :
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {['🌸', '🐱', '🐰', '🍓', '⭐', '🦋', '🎀', '🐻'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedAvatarIcon(emoji)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all cursor-pointer border ${
                      selectedAvatarIcon === emoji
                        ? 'bg-purple-100 border-[#7c3aed] scale-110 shadow-xs ring-2 ring-[#7c3aed]/30'
                        : 'bg-white border-[#e5dbf7] hover:bg-purple-50'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Comment content */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Votre message *
            </label>
            <textarea
              required
              rows={3}
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Écrivez un mot bienveillant, partagez votre avis ou vos astuces créatives..."
              className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-white border border-[#e5dbf7] focus:outline-hidden focus:ring-2 focus:ring-[#7c3aed]/30 resize-y placeholder:text-slate-400"
            />
          </div>

          {/* Footer of Form */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {commentSubmitted ? (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                <Check className="w-4 h-4" /> Merci pour votre message tout doux !
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">
                La communauté Sticky and Kawaii cultive la bienveillance et la douceur.
              </span>
            )}

            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs sm:text-sm font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Publier mon commentaire</span>
            </button>
          </div>
        </form>
      </section>

      {/* Suggested / Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="mt-12">
          <h3 className="font-['Comfortaa',cursive] text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>À lire aussi dans le blog</span>
            <Sparkles className="w-4 h-4 text-[#7c3aed]" />
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedArticles.slice(0, 2).map((rel) => (
              <div
                key={rel.id}
                onClick={() => onSelectArticle(rel)}
                className="p-4 rounded-2xl bg-white border border-[#e5dbf7] hover:border-[#cbb3f5] shadow-xs hover:shadow-md transition-all flex items-center gap-3.5 cursor-pointer group"
              >
                <img
                  src={rel.coverImage}
                  alt={rel.title}
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <span className="text-[10px] font-bold text-[#7c3aed] uppercase tracking-wider">
                    {rel.category}
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#7c3aed] transition-colors line-clamp-2 leading-snug mt-1">
                    {rel.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {rel.readingTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </article>
  );
};
