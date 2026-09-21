import React from 'react';
import { Clock, Calendar, ArrowRight, Star, Heart } from 'lucide-react';
import { Article, Category } from '../types';

interface ArticleCardProps {
  article: Article;
  onReadArticle: (article: Article) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onReadArticle,
}) => {
  const getCategoryStyles = (category: Category) => {
    switch (category) {
      case 'Coulisses & Créations':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Actus Boutique':
        return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'Tutoriels':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Gazettes':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-purple-100 text-purple-700 border-purple-200';
    }
  };

  const totalReactions = 
    article.reactions.stars + 
    article.reactions.hearts + 
    article.reactions.butterflies;

  return (
    <article
      id={`article-card-${article.id}`}
      onClick={() => onReadArticle(article)}
      className="bg-white rounded-2xl border border-[#e5dbf7] overflow-hidden shadow-xs hover:shadow-md hover:border-[#cbb3f5] transition-all duration-300 flex flex-col cursor-pointer group"
    >
      {/* Thumbnail */}
      <div className="relative aspect-16/10 overflow-hidden bg-purple-50">
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border shadow-xs backdrop-blur-xs ${getCategoryStyles(article.category)}`}>
            {article.category}
          </span>
          {article.status === 'draft' && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
              Brouillon
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Meta */}
          <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500 mb-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#7c3aed]" />
              {article.publishedAt}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#7c3aed]" />
              {article.readingTime}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-['Comfortaa',cursive] text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#7c3aed] transition-colors leading-snug mb-2 line-clamp-2">
            {article.title}
          </h3>

          {/* Summary */}
          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {article.summary}
          </p>
        </div>

        {/* Footer info: reactions + Read */}
        <div className="pt-3 border-t border-[#f4f0fa] flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2 text-[11px] text-[#6d28d9] font-semibold bg-[#f4f0fa] px-2.5 py-1 rounded-full">
            <span>✨ {article.reactions.stars}</span>
            <span>💖 {article.reactions.hearts}</span>
            <span>🦋 {article.reactions.butterflies}</span>
          </div>

          <span className="inline-flex items-center gap-1 text-[#7c3aed] font-bold group-hover:translate-x-0.5 transition-transform text-xs">
            Lire
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
};
