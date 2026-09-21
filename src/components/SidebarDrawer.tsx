import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Home, 
  Sparkles, 
  ShoppingBag, 
  Gamepad2, 
  ExternalLink, 
  ShieldCheck, 
  Heart,
  Palette,
  ArrowRight
} from 'lucide-react';
import { Category, CategoryItem } from '../types';
import { renderCategoryIcon, getCategoryColorConfig } from '../utils/categoryHelpers';
import officialLogo from '../assets/images/sticky_and_kawaii_official_logo.png';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  onSelectCategory: (category: Category | 'all') => void;
  selectedCategory: Category | 'all';
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  categories,
  onSelectCategory,
  selectedCategory,
  onOpenAdmin,
  isAdminLoggedIn,
}) => {

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 transition-opacity"
          />

          {/* Drawer Menu */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="fixed inset-y-0 left-0 w-full max-w-xs sm:max-w-sm bg-white border-r border-[#e5dbf7] shadow-2xl z-50 flex flex-col overflow-y-auto"
            aria-label="Menu latéral Sticky and Kawaii"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#e5dbf7] bg-[#f8efe8] flex items-center justify-between font-['Open_Sans',sans-serif]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center">
                  <img
                    src={officialLogo}
                    alt="Sticky and kawaii"
                    className="w-full h-auto object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h2 className="font-['EB_Garamond',serif] text-lg font-bold text-[#4a348b]">
                    Sticky and kawaii
                  </h2>
                  <p className="text-[11px] text-slate-500 font-['Open_Sans',sans-serif]">
                    Boutique & Blog Officiel
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-[#e5dbf7]/50 transition-colors"
                aria-label="Fermer le menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Sections */}
            <div className="p-5 space-y-6 flex-1">
              
              {/* Home */}
              <div>
                <button
                  onClick={() => {
                    onSelectCategory('all');
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-[#7c3aed] text-white shadow-xs'
                      : 'text-slate-700 hover:bg-[#f4f0fa] hover:text-[#7c3aed]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Home className="w-4 h-4" />
                    <span>Tous les articles</span>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-60" />
                </button>
              </div>

              {/* Main Navigation Links */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
                  Navigation Principale
                </span>
                <div className="space-y-1">
                  <a
                    href="https://stickyandkawaii.eu/"
                    target="_parent"
                    className="flex items-center justify-between p-2.5 rounded-xl text-sm font-bold text-[#4C2882] bg-[#F7ECE3]/60 border border-[#ebdcd3] tracking-[0.05em] uppercase transition-colors"
                  >
                    <span>ACCUEIL</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                  </a>

                  <a
                    href="https://stickyandkawaii.eu/produits?sortField=createdAt&sortDirection=desc&category=&page=1"
                    target="_parent"
                    className="flex items-center justify-between p-2.5 rounded-xl text-sm font-bold text-[#3D2E39] hover:bg-[#F7ECE3] hover:text-[#4C2882] tracking-[0.05em] uppercase transition-colors"
                  >
                    <span>NOUVEAUTÉS</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  </a>

                  <a
                    href="https://stickyandkawaii.eu/produits"
                    target="_parent"
                    className="flex items-center justify-between p-2.5 rounded-xl text-sm font-bold text-[#3D2E39] hover:bg-[#F7ECE3] hover:text-[#4C2882] tracking-[0.05em] uppercase transition-colors"
                  >
                    <span>BOUTIQUE</span>
                    <ShoppingBag className="w-3.5 h-3.5 text-pink-500" />
                  </a>

                  {/* The Snail's Gazette with 3 submenus */}
                  <div className="rounded-xl border border-purple-100 bg-[#faf7ff] p-2 space-y-1 mt-1">
                    <a
                      href="https://www.patreon.com/Stickyandkawaii62"
                      target="_parent"
                      className="flex items-center justify-between text-sm font-bold text-[#3D2E39] hover:text-[#4C2882] tracking-[0.05em] uppercase px-1 py-1"
                    >
                      <span>THE SNAIL'S GAZETTE</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                    <div className="pl-2.5 border-l-2 border-[#e5dbf7] space-y-1 mt-1">
                      <a
                        href="https://www.patreon.com/Stickyandkawaii62"
                        target="_parent"
                        className="flex items-center gap-2 text-xs font-semibold text-[#3D2E39] hover:text-[#4C2882] py-1"
                      >
                        <Heart className="w-3 h-3 text-pink-500" />
                        <span>S'abonner</span>
                      </a>
                      <a
                        href="https://jeux.stickyandkawaii.eu/"
                        target="_parent"
                        className="flex items-center gap-2 text-xs font-semibold text-[#3D2E39] hover:text-[#4C2882] py-1"
                      >
                        <Gamepad2 className="w-3 h-3 text-indigo-500" />
                        <span>Salle de jeux</span>
                      </a>
                      <a
                        href="https://www.patreon.com/Stickyandkawaii62/shop"
                        target="_parent"
                        className="flex items-center gap-2 text-xs font-semibold text-[#3D2E39] hover:text-[#4C2882] py-1"
                      >
                        <Heart className="w-3 h-3 text-pink-500" />
                        <span>Les anciens mois</span>
                      </a>
                    </div>
                  </div>

                  {/* BLOG */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCategory('all');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl text-sm font-bold text-[#3D2E39] hover:bg-[#F7ECE3] hover:text-[#4C2882] tracking-[0.05em] uppercase transition-colors text-left cursor-pointer"
                  >
                    <span>BLOG</span>
                  </button>

                  <a
                    href="https://stickyandkawaii.eu/contact"
                    target="_parent"
                    className="flex items-center justify-between p-2.5 rounded-xl text-sm font-bold text-[#3D2E39] hover:bg-[#F7ECE3] hover:text-[#4C2882] tracking-[0.05em] uppercase transition-colors"
                  >
                    <span>ME CONTACTER</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                  </a>
                </div>
              </div>

              {/* Categories */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
                  Catégories du blog
                </span>
                <div className="space-y-1.5">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.name;
                    const colorCfg = getCategoryColorConfig(cat.color);
                    return (
                      <button
                        key={cat.id || cat.name}
                        onClick={() => {
                          onSelectCategory(cat.name);
                          onClose();
                        }}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-[#f4f0fa] border-[#7c3aed] text-[#6d28d9] shadow-xs'
                            : 'bg-white border-transparent hover:bg-[#fcfaff] hover:border-[#e5dbf7] text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-semibold text-sm">
                            <span className={colorCfg.text}>
                              {renderCategoryIcon(cat.icon, 'w-4 h-4')}
                            </span>
                            <span>{cat.name}</span>
                          </div>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-[#7c3aed]" />
                          )}
                        </div>
                        {cat.description && (
                          <p className="text-[11px] text-slate-500 mt-1 pl-6">
                            {cat.description}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* External Ecosystem Links */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
                  Écosystème Sticky and Kawaii
                </span>
                <div className="space-y-2">
                  <a
                    href="https://stickyandkawaii.eu"
                    target="_parent"
                    className="flex items-center justify-between p-3 rounded-xl bg-[#fff8fa] border border-pink-100 hover:border-pink-300 hover:bg-pink-50 transition-all text-pink-900 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-pink-100 text-pink-600">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1">
                          Boutique Officielle
                          <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                        </div>
                        <div className="text-[10px] text-pink-700/80">
                          stickyandkawaii.eu
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-pink-600 group-hover:translate-x-0.5 transition-transform">
                      Visiter
                    </span>
                  </a>

                  <a
                    href="https://jeux.stickyandkawaii.eu"
                    target="_parent"
                    className="flex items-center justify-between p-3 rounded-xl bg-[#f5f8ff] border border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-indigo-900 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                        <Gamepad2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1">
                          Plateforme de Jeux
                          <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                        </div>
                        <div className="text-[10px] text-indigo-700/80">
                          jeux.stickyandkawaii.eu
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                      Jouer
                    </span>
                  </a>
                </div>
              </div>

              {/* Author / Mascot Note */}
              <div className="p-3.5 rounded-2xl bg-[#faeedd]/70 border border-[#ebd9c1] text-[#5c3818]">
                <div className="flex items-start gap-2.5">
                  <Heart className="w-4 h-4 text-[#a86224] shrink-0 mt-0.5 fill-[#a86224]/20" />
                  <div className="text-xs">
                    <p className="font-bold">Le mot de Karine ✨</p>
                    <p className="text-[11px] text-[#7a4e27] mt-0.5 leading-relaxed">
                      Chaque article est rédigé avec tendresse pour partager notre amour des stickers mignons et des loisirs créatifs !
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Drawer Footer / Admin */}
            <div className="p-4 border-t border-[#e5dbf7] bg-[#fcfaff]">
              <button
                onClick={() => {
                  onClose();
                  onOpenAdmin();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold bg-[#f4f0fa] hover:bg-[#ebdffc] text-[#7c3aed] border border-[#e5dbf7] transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {isAdminLoggedIn ? 'Tableau de bord Admin (Connecté)' : 'Connexion Espace Auteur'}
                </span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
