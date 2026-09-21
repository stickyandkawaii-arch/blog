import React from 'react';
import { Sparkles, Clock, Calendar, ArrowRight, Heart, Star } from 'lucide-react';
import { Article } from '../types';

interface FeaturedArticleHeroProps {
  article: Article;
  onReadArticle: (article: Article) => void;
}

export const FeaturedArticleHero: React.FC<FeaturedArticleHeroProps> = ({
  article,
  onReadArticle,
}) => {
  return (
    <div 
      id="featured-article-hero"
      className="mb-10 bg-white rounded-3xl border border-[#e5dbf7] overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* Cover Image Side (7 cols on lg) */}
        <div className="lg:col-span-7 relative overflow-hidden bg-purple-50 min-h-[260px] sm:min-h-[340px] lg:min-h-[420px]">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:hidden" />
          
          {/* Top Floating Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#7c3aed] text-white text-xs font-bold shadow-md uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              À la une
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[#6d28d9] text-xs font-bold shadow-sm border border-purple-100">
              {article.category}
            </span>
          </div>
        </div>

        {/* Content Side (5 cols on lg) */}
        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white">
          <div>
            {/* Meta Row */}
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mb-3.5">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#7c3aed]" />
                {article.publishedAt}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#7c3aed]" />
                {article.readingTime}
              </span>
            </div>

            {/* Title */}
            <h2 
              onClick={() => onReadArticle(article)}
              className="font-['Comfortaa',cursive] text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 group-hover:text-[#7c3aed] transition-colors leading-snug mb-3 cursor-pointer"
            >
              {article.title}
            </h2>

            {/* Summary */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed line-clamp-3 mb-6">
              {article.summary}
            </p>

            {/* Tags preview */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {article.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg bg-[#f4f0fa] text-[#6d28d9] text-xs font-medium border border-[#e5dbf7]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Footer of Hero */}
          <div className="pt-4 border-t border-[#f4f0fa] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="w-10 h-10 rounded-full border-2 border-purple-200 object-cover"
                referrerPolicy="no-referrer"
              />
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {article.author.name}
                </p>
                <p className="text-[11px] text-slate-500">
                  {article.author.role}
                </p>
              </div>
            </div>

            <button
              onClick={() => onReadArticle(article)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer group/btn"
            >
              <span>Lire l’article</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
