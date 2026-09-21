import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Gift, 
  Heart, 
  Bell, 
  Star,
  Check
} from 'lucide-react';

const NEWSLETTER_STORAGE_KEY = 'sticky_kawaii_newsletter_subscribed';

interface NewsletterSectionProps {
  onSubscribe?: (email: string) => boolean;
}

export const NewsletterSection: React.FC<NewsletterSectionProps> = ({ onSubscribe }) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [savedEmail, setSavedEmail] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(NEWSLETTER_STORAGE_KEY);
    if (stored) {
      setIsSubscribed(true);
      setSavedEmail(stored);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMessage('Veuillez entrer une adresse email valide.');
      return;
    }

    setIsLoading(true);

    // Call onSubscribe callback to register in Admin subscriber list
    if (onSubscribe) {
      onSubscribe(cleanEmail);
    }

    setTimeout(() => {
      setIsLoading(false);
      setIsSubscribed(true);
      setSavedEmail(cleanEmail);
      localStorage.setItem(NEWSLETTER_STORAGE_KEY, cleanEmail);
      setEmail('');
    }, 500);
  };

  const handleReset = () => {
    localStorage.removeItem(NEWSLETTER_STORAGE_KEY);
    setIsSubscribed(false);
    setSavedEmail('');
  };

  return (
    <section 
      id="newsletter-section"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 sm:pb-16"
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FAF3ED] via-[#F7ECE3] to-[#F1E0D4] border border-[#ECD9CB] p-6 sm:p-10 lg:p-12 shadow-sm">
        
        {/* Cute decorative background bubbles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/40 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-[#e8d5f7]/30 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left / Info Column */}
          <div className="lg:col-span-7 space-y-4 text-left">
            {/* Title */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#3D2E39] font-['Comfortaa',cursive] leading-tight">
              Ne manquez aucune <span className="text-[#4C2882] underline decoration-wavy decoration-[#e5dbf7]">nouveauté kawaii</span> ! ✨
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-xl">
              Recevez nos actualités d'atelier, les annonces de nouveaux drops de stickers, 
              nos tutoriels DIY créatifs et de jolies attentions réservées à nos abonnés.
            </p>

            {/* Perks list */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#3D2E39] bg-white/70 backdrop-blur-xs px-3 py-2 rounded-2xl border border-white/60">
                <Gift className="w-4 h-4 text-pink-500 shrink-0" />
                <span>Goodies & fonds d'écran</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#3D2E39] bg-white/70 backdrop-blur-xs px-3 py-2 rounded-2xl border border-white/60">
                <Bell className="w-4 h-4 text-[#4C2882] shrink-0" />
                <span>1 email doux / mois</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#3D2E39] bg-white/70 backdrop-blur-xs px-3 py-2 rounded-2xl border border-white/60">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
                <span>100% gratuit & sans spam</span>
              </div>
            </div>

          </div>

          {/* Right / Form Column */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e5dbf7] shadow-md">
              
              {!isSubscribed ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center gap-2 text-[#4C2882] font-bold text-sm font-['Comfortaa',cursive]">
                    <Mail className="w-4 h-4" />
                    <span>S'inscrire à la lettre d'actualités</span>
                  </div>

                  <div className="space-y-1.5">
                    <label 
                      htmlFor="newsletter-email-input" 
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                    >
                      Votre adresse email
                    </label>
                    <div className="relative">
                      <input
                        id="newsletter-email-input"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="bonjour@exemple.com"
                        className="w-full pl-4 pr-10 py-3 rounded-2xl bg-[#faf8fc] border border-[#e5dbf7] text-sm text-[#3D2E39] placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#4C2882] transition-all"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {errorMessage && (
                    <p className="text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-2 rounded-xl border border-rose-200">
                      {errorMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#4C2882] hover:bg-[#3D206A] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 group disabled:opacity-70"
                  >
                    {isLoading ? (
                      <span className="inline-block animate-pulse">Inscription en cours... ✨</span>
                    ) : (
                      <>
                        <span>Recevoir les e-mails doux</span>
                        <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-slate-500 text-center leading-normal">
                    🔒 Vos données restent confidentielles. Désabonnement possible à tout moment en 1 clic.
                  </p>
                </form>
              ) : (
                <div className="text-center py-3 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#3D2E39] font-['Comfortaa',cursive]">
                      Merci pour votre inscription ! 🌸
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xs mx-auto">
                      Vous recevrez très bientôt notre prochaine gazette à l'adresse :
                    </p>
                    <span className="inline-block mt-2 px-3 py-1 bg-[#f4f0fa] text-[#4C2882] font-mono text-xs font-bold rounded-lg border border-[#e5dbf7]">
                      {savedEmail}
                    </span>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-xs text-slate-400 hover:text-[#4C2882] underline transition-colors cursor-pointer"
                    >
                      Modifier mon adresse email
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
