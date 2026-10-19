import { Article, Comment, NewsletterSubscriber, CategoryItem, Poll } from '../types';

import officialLogo from '../assets/images/sticky_and_kawaii_official_logo.png';
import featuredImg from '../assets/images/featured_stickers_art_1789967519218.jpg';
import tutorialImg from '../assets/images/tutorial_journal_art_1789967535689.jpg';
import boutiqueImg from '../assets/images/boutique_packaging_art_1789967550717.jpg';
import gazetteImg from '../assets/images/gazette_tea_art_1789967572992.jpg';

export { officialLogo as mascotImg, featuredImg, tutorialImg, boutiqueImg, gazetteImg };

export const defaultAuthor = {
  name: 'Karine',
  role: 'Créatrice & Illustratrice',
  avatar: officialLogo,
};

export const INITIAL_POLLS: Poll[] = [];

export const INITIAL_ARTICLES: Article[] = [];

export const INITIAL_COMMENTS: Comment[] = [];

export const isObsoleteDemoArticle = (art: Partial<Article> | null | undefined): boolean => {
  if (!art) return false;
  const demoTitles = [
    'Dans les coulisses de l’atelier : création de notre collection Holographique Cosmique',
    'Dans les coulisses de l\'atelier : création de notre collection Holographique Cosmique',
    '5 idées créatives pour customiser votre coque de téléphone et laptop',
    'Guide complet : comment entretenir et coller vos stickers waterproof durablement',
    'Tendances stickers 2025 : du pixel art au néon vintage',
  ];
  const demoSlugs = [
    'coulisses-creation-collection-holographique-cosmique',
    '5-idees-creatives-customiser-coque-telephone-laptop',
    'guide-complet-entretenir-coller-stickers-waterproof-durablement',
    'tendances-stickers-2025-pixel-art-neon-vintage',
  ];

  if (art.title && demoTitles.some(t => t.toLowerCase() === art.title!.toLowerCase().trim())) {
    return true;
  }
  if (art.slug && demoSlugs.includes(art.slug.toLowerCase().trim())) {
    return true;
  }
  return false;
};

export const isObsoleteDemoComment = (c: Partial<Comment> | null | undefined): boolean => {
  if (!c) return false;
  const demoCommentAuthors = ['Mina_Stickers', 'YukiCreative', 'Chloé_Pastel', 'Léna_Botanica'];
  if (c.author && demoCommentAuthors.includes(c.author)) return true;
  if (c.id && ['comm-1', 'comm-2', 'comm-3', 'comm-4'].includes(c.id)) return true;
  return false;
};

export const INITIAL_SUBSCRIBERS: NewsletterSubscriber[] = [
  {
    id: 'sub-1',
    email: 'camille.crea@gmail.com',
    subscribedAt: '2026-09-18T14:32:00.000Z',
    source: 'Formulaire bas de page',
  },
  {
    id: 'sub-2',
    email: 'julie.stationery@outlook.fr',
    subscribedAt: '2026-09-19T09:15:00.000Z',
    source: 'Formulaire bas de page',
  },
  {
    id: 'sub-3',
    email: 'sweet_kawaii_bujo@yahoo.com',
    subscribedAt: '2026-09-20T18:42:00.000Z',
    source: 'Formulaire bas de page',
  },
];

export const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-1',
    name: 'Coulisses & Créations',
    slug: 'coulisses-creations',
    description: 'Croquis, fabrication & secrets de stickers',
    icon: 'Palette',
    color: 'purple',
  },
  {
    id: 'cat-2',
    name: 'Actus Boutique',
    slug: 'actus-boutique',
    description: 'Nouveaux drops, packagings & cadeaux',
    icon: 'ShoppingBag',
    color: 'pink',
  },
  {
    id: 'cat-3',
    name: 'Tutoriels',
    slug: 'tutoriels',
    description: 'Guides DIY, bullet journal & toploaders',
    icon: 'Sparkles',
    color: 'amber',
  },
  {
    id: 'cat-4',
    name: 'Gazettes',
    slug: 'gazettes',
    description: 'Moments cosy, playlists & inspirations',
    icon: 'Coffee',
    color: 'emerald',
  },
];

