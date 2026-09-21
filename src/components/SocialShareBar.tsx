import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Share2, 
  Link2, 
  Check, 
  Heart, 
  Sparkles, 
  X, 
  ArrowUp,
  MessageCircle,
  Pin
} from 'lucide-react';
import { Article } from '../types';

interface SocialShareBarProps {
  article: Article;
  floatingOnly?: boolean;
}

export const SocialShareBar: React.FC<SocialShareBarProps> = ({ article }) => {
  const [copied, setCopied] = useState(false);
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Generate canonical or current share URL
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}#article-${article.id}`
    : `https://blog.stickyandkawaii.eu/#article-${article.id}`;

  const shareTitle = `${article.title} • Blog Sticky & Kawaii ✨`;
  const shareSummary = article.summary || 'Découvrez cet article créatif et mignon sur le blog officiel de Sticky & Kawaii !';

  // Social URLs
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}&hashtags=stickyandkawaii,stickers,stationery`;
  const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(article.coverImage)}&description=${encodeURIComponent(`${shareTitle} - ${shareSummary}`)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  // Handle Copy Link
  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  // Handle Native Web Share if available on mobile
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareSummary,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed silently
      }
    } else {
      handleCopyLink();
    }
  };

  // Open sharing popup window
  const openSharePopup = (url: string, networkName: string) => {
    const width = 600;
    const height = 500;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(
      url,
      `share_${networkName}`,
      `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`
    );
  };

  // Scroll listener to show floating bar when reading content
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      // Show floating bar after scrolling 300px down
      if (scrollY > 300) {
        setShowFloatingBar(true);
      } else {
        setShowFloatingBar(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToReactions = () => {
    const el = document.getElementById('kawaii-reactions-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* 1. IN-PAGE SHARING SECTION (Placed directly beneath article content) */}
      <div className="mt-8 p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-[#faf8fc] via-white to-[#f4f0fa] border-2 border-[#e5dbf7] shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-[#4C2882] text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#7c3aed]" />
              <span>Partager la douceur</span>
            </div>
            <h3 className="font-['Comfortaa',cursive] text-base sm:text-lg font-bold text-[#3D2E39]">
              Vous avez aimé cet article ? Diffusez-le ! 🌸
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              Partagez cette inspiration avec vos ami(e)s créatifs sur vos réseaux préférés ou enregistrez l'idée.
            </p>
          </div>

          {/* Social Share Buttons List */}
          <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
            
            {/* Twitter / X */}
            <button
              onClick={() => openSharePopup(twitterUrl, 'twitter')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-black hover:bg-slate-800 text-white text-xs font-bold transition-all transform hover:-translate-y-0.5 shadow-xs cursor-pointer"
              title="Partager sur X (Twitter)"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>X (Twitter)</span>
            </button>

            {/* Pinterest */}
            <button
              onClick={() => openSharePopup(pinterestUrl, 'pinterest')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#E60023] hover:bg-[#b8001c] text-white text-xs font-bold transition-all transform hover:-translate-y-0.5 shadow-xs cursor-pointer"
              title="Épingler sur Pinterest"
            >
              <Pin className="w-3.5 h-3.5 fill-current" />
              <span>Pinterest</span>
            </button>

            {/* Facebook */}
            <button
              onClick={() => openSharePopup(facebookUrl, 'facebook')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1877F2] hover:bg-[#145dbf] text-white text-xs font-bold transition-all transform hover:-translate-y-0.5 shadow-xs cursor-pointer"
              title="Partager sur Facebook"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </button>

            {/* Copier le lien */}
            <button
              onClick={handleCopyLink}
              className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all shadow-xs cursor-pointer ${
                copied
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white border-[#e5dbf7] text-[#4C2882] hover:bg-purple-50 hover:border-purple-300'
              }`}
              title="Copier l'adresse de l'article"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copié !</span>
                </>
              ) : (
                <>
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Copier lien</span>
                </>
              )}
            </button>

          </div>
        </div>
      </div>

      {/* 2. FLOATING SHARING BAR (Appears floating at the bottom while reading) */}
      <AnimatePresence>
        {showFloatingBar && !isDismissed && (
          <motion.aside
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[95vw] sm:max-w-max"
            aria-label="Barre flottante de partage social"
          >
            <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full border border-[#e5dbf7] shadow-xl flex items-center gap-2 sm:gap-3 text-[#3D2E39]">
              
              {/* Left Label */}
              <div className="flex items-center gap-1.5 pl-1.5 pr-1 border-r border-slate-200">
                <Share2 className="w-3.5 h-3.5 text-[#4C2882]" />
                <span className="text-xs font-bold text-[#3D2E39] hidden sm:inline">Partager</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                
                {/* Twitter / X */}
                <button
                  onClick={() => openSharePopup(twitterUrl, 'twitter')}
                  className="w-8 h-8 rounded-full bg-black hover:bg-slate-800 text-white flex items-center justify-center transition-transform hover:scale-110 shadow-2xs cursor-pointer"
                  title="Partager sur X (Twitter)"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </button>

                {/* Pinterest */}
                <button
                  onClick={() => openSharePopup(pinterestUrl, 'pinterest')}
                  className="w-8 h-8 rounded-full bg-[#E60023] hover:bg-[#b8001c] text-white flex items-center justify-center transition-transform hover:scale-110 shadow-2xs cursor-pointer"
                  title="Épingler sur Pinterest"
                >
                  <Pin className="w-3.5 h-3.5 fill-current" />
                </button>

                {/* Facebook */}
                <button
                  onClick={() => openSharePopup(facebookUrl, 'facebook')}
                  className="w-8 h-8 rounded-full bg-[#1877F2] hover:bg-[#145dbf] text-white flex items-center justify-center transition-transform hover:scale-110 shadow-2xs cursor-pointer"
                  title="Partager sur Facebook"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>

                {/* Copy Link Button */}
                <button
                  onClick={handleCopyLink}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 border cursor-pointer ${
                    copied
                      ? 'bg-emerald-500 border-emerald-600 text-white'
                      : 'bg-[#faf8fc] border-[#e5dbf7] text-slate-700 hover:text-[#4C2882] hover:bg-white'
                  }`}
                  title={copied ? 'Lien copié !' : 'Copier le lien'}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
                </button>

                {/* Jump to Reactions button */}
                <button
                  onClick={scrollToReactions}
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-700 text-[11px] font-bold transition-all hover:scale-105 cursor-pointer ml-1"
                  title="Réagir avec un emoji kawaii"
                >
                  <span>💖</span>
                  <span>Réagir</span>
                </button>

              </div>

              {/* Close / Dismiss */}
              <button
                onClick={() => setIsDismissed(true)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ml-1 cursor-pointer"
                title="Masquer la barre de partage"
              >
                <X className="w-3.5 h-3.5" />
              </button>

            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};
