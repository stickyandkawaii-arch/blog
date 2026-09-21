import React from 'react';
import {
  Palette,
  ShoppingBag,
  Sparkles,
  Coffee,
  Heart,
  Star,
  BookOpen,
  Tag,
  Bookmark,
  Smile,
  Gift,
  Lightbulb,
  Scissors,
  PenTool,
  Gamepad2,
  Compass,
  Layers,
  FolderHeart
} from 'lucide-react';

export interface CategoryColorConfig {
  key: string;
  name: string;
  badge: string;
  hover: string;
  active: string;
  border: string;
  bgSoft: string;
  text: string;
  dot: string;
}

export const CATEGORY_COLORS: Record<string, CategoryColorConfig> = {
  purple: {
    key: 'purple',
    name: 'Lilas / Violet',
    badge: 'bg-purple-100 text-purple-700 border-purple-200',
    hover: 'hover:text-purple-600',
    active: 'bg-[#7c3aed] text-white',
    border: 'border-purple-300',
    bgSoft: 'bg-purple-50',
    text: 'text-purple-700',
    dot: 'bg-purple-500',
  },
  pink: {
    key: 'pink',
    name: 'Rose Pastel',
    badge: 'bg-pink-100 text-pink-700 border-pink-200',
    hover: 'hover:text-pink-600',
    active: 'bg-pink-500 text-white',
    border: 'border-pink-300',
    bgSoft: 'bg-pink-50',
    text: 'text-pink-700',
    dot: 'bg-pink-500',
  },
  amber: {
    key: 'amber',
    name: 'Pêche / Ambre',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    hover: 'hover:text-amber-600',
    active: 'bg-amber-500 text-white',
    border: 'border-amber-300',
    bgSoft: 'bg-amber-50',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
  },
  emerald: {
    key: 'emerald',
    name: 'Menthe / Émeraude',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    hover: 'hover:text-emerald-600',
    active: 'bg-emerald-600 text-white',
    border: 'border-emerald-300',
    bgSoft: 'bg-emerald-50',
    text: 'text-emerald-800',
    dot: 'bg-emerald-500',
  },
  rose: {
    key: 'rose',
    name: 'Framboise',
    badge: 'bg-rose-100 text-rose-700 border-rose-200',
    hover: 'hover:text-rose-600',
    active: 'bg-rose-500 text-white',
    border: 'border-rose-300',
    bgSoft: 'bg-rose-50',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
  },
  indigo: {
    key: 'indigo',
    name: 'Bleu Nuit / Indigo',
    badge: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    hover: 'hover:text-indigo-600',
    active: 'bg-indigo-600 text-white',
    border: 'border-indigo-300',
    bgSoft: 'bg-indigo-50',
    text: 'text-indigo-700',
    dot: 'bg-indigo-500',
  },
  blue: {
    key: 'blue',
    name: 'Ciel Douceur',
    badge: 'bg-sky-100 text-sky-800 border-sky-200',
    hover: 'hover:text-sky-600',
    active: 'bg-sky-500 text-white',
    border: 'border-sky-300',
    bgSoft: 'bg-sky-50',
    text: 'text-sky-800',
    dot: 'bg-sky-500',
  },
  teal: {
    key: 'teal',
    name: 'Turquoise / Lagon',
    badge: 'bg-teal-100 text-teal-800 border-teal-200',
    hover: 'hover:text-teal-600',
    active: 'bg-teal-600 text-white',
    border: 'border-teal-300',
    bgSoft: 'bg-teal-50',
    text: 'text-teal-800',
    dot: 'bg-teal-500',
  },
};

export const AVAILABLE_CATEGORY_ICONS = [
  { id: 'Palette', label: 'Palette Arts', icon: Palette },
  { id: 'ShoppingBag', label: 'Boutique', icon: ShoppingBag },
  { id: 'Sparkles', label: 'Étoiles / Tutos', icon: Sparkles },
  { id: 'Coffee', label: 'Pause Café / Gazette', icon: Coffee },
  { id: 'Heart', label: 'Cœur Kawaii', icon: Heart },
  { id: 'Star', label: 'Étoile Brillante', icon: Star },
  { id: 'BookOpen', label: 'Livre / Journal', icon: BookOpen },
  { id: 'Tag', label: 'Étiquette / Drops', icon: Tag },
  { id: 'Bookmark', label: 'Marque-page', icon: Bookmark },
  { id: 'Smile', label: 'Sourire Doux', icon: Smile },
  { id: 'Gift', label: 'Cadeau / Goodies', icon: Gift },
  { id: 'Lightbulb', label: 'Astuces & Idées', icon: Lightbulb },
  { id: 'Scissors', label: 'Découpe & DIY', icon: Scissors },
  { id: 'PenTool', label: 'Dessin & Croquis', icon: PenTool },
  { id: 'Gamepad2', label: 'Jeux & Fun', icon: Gamepad2 },
  { id: 'FolderHeart', label: 'Dossier Coup de Cœur', icon: FolderHeart },
];

export function renderCategoryIcon(iconName: string, className = 'w-4 h-4'): React.ReactElement {
  switch (iconName) {
    case 'Palette':
      return <Palette className={className} />;
    case 'ShoppingBag':
      return <ShoppingBag className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Coffee':
      return <Coffee className={className} />;
    case 'Heart':
      return <Heart className={className} />;
    case 'Star':
      return <Star className={className} />;
    case 'BookOpen':
      return <BookOpen className={className} />;
    case 'Tag':
      return <Tag className={className} />;
    case 'Bookmark':
      return <Bookmark className={className} />;
    case 'Smile':
      return <Smile className={className} />;
    case 'Gift':
      return <Gift className={className} />;
    case 'Lightbulb':
      return <Lightbulb className={className} />;
    case 'Scissors':
      return <Scissors className={className} />;
    case 'PenTool':
      return <PenTool className={className} />;
    case 'Gamepad2':
      return <Gamepad2 className={className} />;
    case 'FolderHeart':
      return <FolderHeart className={className} />;
    default:
      return <Sparkles className={className} />;
  }
}

export function getCategoryBadgeClasses(colorKey?: string): string {
  const cfg = (colorKey && CATEGORY_COLORS[colorKey]) || CATEGORY_COLORS.purple;
  return cfg.badge;
}

export function getCategoryColorConfig(colorKey?: string): CategoryColorConfig {
  return (colorKey && CATEGORY_COLORS[colorKey]) || CATEGORY_COLORS.purple;
}
