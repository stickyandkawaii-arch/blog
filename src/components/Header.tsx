import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  ChevronDown, 
  Menu, 
  X, 
  ShieldCheck, 
  PenLine, 
  ExternalLink,
  Sparkles,
  Gamepad2,
  Mail,
  Heart
} from 'lucide-react';
import officialLogo from '../assets/images/sticky_and_kawaii_official_logo.png';

interface HeaderProps {
  onOpenSidebar: () => void;
  onOpenSearch: () => void;
  onOpenAdmin: () => void;
  onGoHome: () => void;
  isAdminLoggedIn: boolean;
  searchQuery: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSidebar,
  onOpenSearch,
  onOpenAdmin,
  onGoHome,
  isAdminLoggedIn,
  searchQuery,
}) => {
  const [isGazetteDropdownOpen, setIsGazetteDropdownOpen] = useState(false);
  const [isBoutiqueDropdownOpen, setIsBoutiqueDropdownOpen] = useState(false);
  const [isSearchInputOpen, setIsSearchInputOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const gazetteRef = useRef<HTMLLIElement>(null);
  const boutiqueRef = useRef<HTMLLIElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (gazetteRef.current && !gazetteRef.current.contains(event.target as Node)) {
        setIsGazetteDropdownOpen(false);
      }
      if (boutiqueRef.current && !boutiqueRef.current.contains(event.target as Node)) {
        setIsBoutiqueDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Synchronize local search
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleToggleSearch = () => {
    setIsSearchInputOpen((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      return next;
    });
  };

  return (
    <header 
      id="main-header"
      className="bg-white sticky top-0 z-30 transition-all font-['Open_Sans',sans-serif]"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Row: Mascot Logo perfectly centered with Right Icons */}
        <div className="relative flex items-center justify-between pt-5 pb-3">
          
          {/* Left spacer / mobile hamburger */}
          <div className="flex items-center w-28">
            <button
              onClick={onOpenSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-800 hover:text-[#4a348b] hover:bg-[#f8efe8] transition-colors cursor-pointer"
              aria-label="Ouvrir le menu mobile"
              title="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Exact Centered Mascot Logo */}
          <div className="flex-1 flex justify-center">
            <button
              onClick={onGoHome}
              className="group focus:outline-hidden cursor-pointer"
              title="Sticky and kawaii"
            >
              <img
                src={officialLogo}
                alt="Sticky and kawaii"
                width={117}
                height={117}
                className="w-[110px] sm:w-[117px] h-auto object-contain block mx-auto transition-transform duration-200 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </button>
          </div>

          {/* Right Action Icons: Search & Cart (Identical to screenshot) */}
          <div className="flex items-center justify-end gap-4 sm:gap-5 w-28">
            
            {/* Search Icon */}
            <button
              id="header-search-icon-btn"
              onClick={handleToggleSearch}
              className="p-1 text-slate-900 hover:text-[#4a348b] transition-colors cursor-pointer"
              aria-label="Rechercher"
              title="Rechercher dans le blog"
            >
              <Search className="w-[20px] h-[20px] stroke-[1.8]" />
            </button>

            {/* Shopping Cart Icon */}
            <a
              id="header-cart-icon-btn"
              href="https://stickyandkawaii.eu/produits"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-slate-900 hover:text-[#4a348b] transition-colors cursor-pointer"
              aria-label="Panier boutique"
              title="Boutique Sticky and kawaii"
            >
              <ShoppingCart className="w-[20px] h-[20px] stroke-[1.8]" />
            </a>

            {/* Subtle Admin Trigger */}
            <button
              onClick={onOpenAdmin}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                isAdminLoggedIn 
                  ? 'text-[#4a348b] hover:bg-purple-50' 
                  : 'text-slate-300 hover:text-[#4a348b]'
              }`}
              title={isAdminLoggedIn ? 'Espace Auteur Connecté' : 'Administration'}
            >
              {isAdminLoggedIn ? (
                <PenLine className="w-3.5 h-3.5 text-[#4a348b]" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5" />
              )}
            </button>

          </div>
        </div>

        {/* Live Search Input Bar */}
        {isSearchInputOpen && (
          <div className="pb-3 max-w-md mx-auto transition-all animate-in fade-in duration-200">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={localSearch}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  const searchInputs = document.querySelectorAll('input[type="text"]');
                  searchInputs.forEach((inp) => {
                    if (inp !== e.target && inp.getAttribute('placeholder')?.includes('Rechercher')) {
                      (inp as HTMLInputElement).value = e.target.value;
                    }
                  });
                }}
                placeholder="Rechercher des articles, stickers, tutos..."
                className="w-full pl-10 pr-9 py-2 rounded-lg bg-[#faf8fc] border border-[#e5dbf7] text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#4a348b]/30"
              />
              <button
                onClick={() => setIsSearchInputOpen(false)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Horizontal Navigation Menu (Exact layout, typography & links from user screenshot) */}
        <nav className="pt-2 pb-3 overflow-x-auto no-scrollbar">
          <ul className="flex items-center justify-center gap-6 sm:gap-8 md:gap-11 lg:gap-14 whitespace-nowrap text-[12.5px] sm:text-[13px] font-bold uppercase tracking-wider font-['Open_Sans',sans-serif]">
            
            {/* 1. ACCUEIL (active purple link with bottom underline bar) */}
            <li className="relative">
              <a
                href="https://stickyandkawaii.eu/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4a348b] pb-1.5 inline-block font-bold tracking-wide relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#4a348b]"
                title="Accueil Sticky and kawaii"
              >
                ACCUEIL
              </a>
            </li>

            {/* 2. NOUVEAUTÉS */}
            <li>
              <a
                href="https://stickyandkawaii.eu/produits?sortField=createdAt&sortDirection=desc&category=&page=1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1a1a1a] hover:text-[#4a348b] pb-1.5 inline-block font-bold tracking-wide transition-colors"
                title="Découvrir les nouveautés"
              >
                NOUVEAUTES
              </a>
            </li>

            {/* 3. BOUTIQUE ⌵ */}
            <li 
              ref={boutiqueRef}
              className="relative"
              onMouseEnter={() => setIsBoutiqueDropdownOpen(true)}
              onMouseLeave={() => setIsBoutiqueDropdownOpen(false)}
            >
              <div className="flex items-center gap-1">
                <a
                  href="https://stickyandkawaii.eu/produits"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1a1a1a] hover:text-[#4a348b] pb-1.5 font-bold tracking-wide transition-colors inline-block"
                >
                  BOUTIQUE
                </a>
                <button
                  type="button"
                  onClick={() => setIsBoutiqueDropdownOpen((prev) => !prev)}
                  className="pb-1.5 text-[#1a1a1a] hover:text-[#4a348b] cursor-pointer flex items-center"
                  aria-label="Menu Boutique"
                >
                  <ChevronDown className="w-3 h-3 stroke-[2.5]" />
                </button>
              </div>

              {/* Boutique Dropdown */}
              {isBoutiqueDropdownOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-0.5 w-48 bg-white rounded-lg border border-[#e5dbf7] shadow-lg p-2 z-50 animate-in fade-in zoom-in-95 duration-100 normal-case tracking-normal">
                  <a
                    href="https://stickyandkawaii.eu/produits"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold text-slate-800 hover:bg-[#f8efe8] hover:text-[#4a348b] transition-colors"
                  >
                    <span>Tous les produits</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                  <a
                    href="https://stickyandkawaii.eu/produits?sortField=createdAt&sortDirection=desc&category=&page=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold text-slate-800 hover:bg-[#f8efe8] hover:text-[#4a348b] transition-colors"
                  >
                    <span>Nouveautés</span>
                    <Sparkles className="w-3 h-3 text-amber-500" />
                  </a>
                  <a
                    href="https://stickyandkawaii.eu/produits"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold text-slate-800 hover:bg-[#f8efe8] hover:text-[#4a348b] transition-colors"
                  >
                    <span>Stickers & Papeterie</span>
                    <Heart className="w-3 h-3 text-pink-500" />
                  </a>
                </div>
              )}
            </li>

            {/* 4. THE SNAIL'S GAZETTE ⌵ (with the 3 exact submenus) */}
            <li 
              ref={gazetteRef}
              className="relative"
              onMouseEnter={() => setIsGazetteDropdownOpen(true)}
              onMouseLeave={() => setIsGazetteDropdownOpen(false)}
            >
              <div className="flex items-center gap-1">
                <a
                  href="https://www.patreon.com/Stickyandkawaii62"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1a1a1a] hover:text-[#4a348b] pb-1.5 font-bold tracking-wide transition-colors inline-block"
                >
                  THE SNAIL'S GAZETTE
                </a>
                <button
                  type="button"
                  onClick={() => setIsGazetteDropdownOpen((prev) => !prev)}
                  className="pb-1.5 text-[#1a1a1a] hover:text-[#4a348b] cursor-pointer flex items-center"
                  aria-label="Menu The Snail's Gazette"
                >
                  <ChevronDown className="w-3 h-3 stroke-[2.5]" />
                </button>
              </div>

              {/* The 3 requested submenus */}
              {isGazetteDropdownOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-0.5 w-52 bg-white rounded-lg border border-[#e5dbf7] shadow-lg p-2 z-50 animate-in fade-in zoom-in-95 duration-100 normal-case tracking-normal">
                  {/* Sous-menu 1: S'abonner */}
                  <a
                    href="https://www.patreon.com/Stickyandkawaii62"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold text-slate-800 hover:bg-[#f8efe8] hover:text-[#4a348b] transition-colors"
                  >
                    <Heart className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                    <span>S'abonner</span>
                    <ExternalLink className="w-3 h-3 ml-auto text-slate-400" />
                  </a>

                  {/* Sous-menu 2: Salle de jeux */}
                  <a
                    href="https://jeux.stickyandkawaii.eu/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold text-slate-800 hover:bg-[#f8efe8] hover:text-[#4a348b] transition-colors"
                  >
                    <Gamepad2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>Salle de jeux</span>
                    <ExternalLink className="w-3 h-3 ml-auto text-slate-400" />
                  </a>

                  {/* Sous-menu 3: Me contacter */}
                  <a
                    href="https://stickyandkawaii.eu/contact"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold text-slate-800 hover:bg-[#f8efe8] hover:text-[#4a348b] transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span>Me contacter</span>
                    <ExternalLink className="w-3 h-3 ml-auto text-slate-400" />
                  </a>
                </div>
              )}
            </li>

            {/* 5. ME CONTACTER */}
            <li>
              <a
                href="https://stickyandkawaii.eu/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1a1a1a] hover:text-[#4a348b] pb-1.5 inline-block font-bold tracking-wide transition-colors"
                title="Contacter Sticky and kawaii"
              >
                ME CONTACTER
              </a>
            </li>

          </ul>
        </nav>

      </div>
    </header>
  );
};

