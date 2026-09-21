import React from 'react';
import { Search, X, Sparkles, ShoppingBag, Palette, Coffee, Layers } from 'lucide-react';
import { Category } from '../types';

interface CategoryNavProps {
  selectedCategory: Category | 'all';
  onSelectCategory: (category: Category | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  counts: Record<Category | 'all', number>;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  counts,
}) => {
  const tabs: { id: Category | 'all'; label: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'all',
      label: 'Tous les articles',
      icon: <Layers className="w-3.5 h-3.5" />,
      color: 'hover:text-[#7c3aed]',
    },
    {
      id: 'Coulisses & Créations',
      label: 'Coulisses & Créations',
      icon: <Palette className="w-3.5 h-3.5" />,
      color: 'hover:text-purple-600',
    },
    {
      id: 'Actus Boutique',
      label: 'Actus Boutique',
      icon: <ShoppingBag className="w-3.5 h-3.5" />,
      color: 'hover:text-pink-600',
    },
    {
      id: 'Tutoriels',
      label: 'Tutoriels',
      icon: <Sparkles className="w-3.5 h-3.5" />,
      color: 'hover:text-amber-600',
    },
    {
      id: 'Gazettes',
      label: 'Gazettes',
      icon: <Coffee className="w-3.5 h-3.5" />,
      color: 'hover:text-emerald-600',
    },
  ];

  return (
    <div className="space-y-4 mb-8">
      {/* Category Pills & Search Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-2 sm:p-2.5 rounded-2xl border border-[#e5dbf7] shadow-xs">
        
        {/* Horizontal Category Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs sm:text-sm">
          {tabs.map((tab) => {
            const isActive = selectedCategory === tab.id;
            const count = counts[tab.id] || 0;

            return (
              <button
                key={tab.id}
                onClick={() => onSelectCategory(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#7c3aed] text-white shadow-xs'
                    : `bg-[#f4f0fa]/70 text-slate-700 hover:bg-[#eadefc] ${tab.color}`
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-white text-slate-500 border border-[#e5dbf7]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Search Input */}
        <div className="relative shrink-0 md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher un sticker, tuto, astuce..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#f4f0fa] text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#7c3aed]/30 border border-[#e5dbf7] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-full"
              title="Effacer la recherche"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* Active Search & Filter Indicator */}
      {(searchQuery || selectedCategory !== 'all') && (
        <div className="flex items-center justify-between px-2 text-xs text-slate-600">
          <div className="flex items-center gap-2 flex-wrap">
            <span>Filtre actif :</span>
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-[#6d28d9] font-semibold">
                {selectedCategory}
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                « {searchQuery} »
              </span>
            )}
            <span>({counts[selectedCategory]} article{counts[selectedCategory] > 1 ? 's' : ''})</span>
          </div>

          <button
            onClick={() => {
              onSelectCategory('all');
              onSearchChange('');
            }}
            className="text-[#7c3aed] hover:underline font-semibold text-xs"
          >
            Réinitialiser
          </button>
        </div>
      )}
    </div>
  );
};
