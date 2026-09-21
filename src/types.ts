export type Category = 
  | 'Coulisses & Créations'
  | 'Actus Boutique'
  | 'Tutoriels'
  | 'Gazettes';

export interface Author {
  name: string;
  role: string;
  avatar: string;
}

export interface Reactions {
  stars: number;
  hearts: number;
  butterflies: number;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  category: Category;
  readingTime: string;
  publishedAt: string;
  featured?: boolean;
  status: 'published' | 'draft';
  author: Author;
  reactions: Reactions;
  tags: string[];
}

export interface Comment {
  id: string;
  articleId: string;
  author: string;
  avatarIcon?: string;
  avatarColor: string;
  content: string;
  createdAt: string;
}

export type ReactionType = 'stars' | 'hearts' | 'butterflies';

export interface UserReactions {
  [articleId: string]: {
    stars?: boolean;
    hearts?: boolean;
    butterflies?: boolean;
  };
}
