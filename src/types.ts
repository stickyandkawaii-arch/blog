export type Category = string;

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
}

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

export interface ArticleSEO {
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
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
  status: 'published' | 'draft' | 'scheduled';
  scheduledAt?: string;
  author: Author;
  reactions: Reactions;
  tags: string[];
  seo?: ArticleSEO;
  pollId?: string;
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

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  source?: string;
}

export type ReactionType = 'stars' | 'hearts' | 'butterflies';

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  articleId: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
}

export interface UserPollVotes {
  [pollId: string]: string; // optionId voted
}

export interface UserReactions {
  [articleId: string]: {
    stars?: boolean;
    hearts?: boolean;
    butterflies?: boolean;
  };
}
