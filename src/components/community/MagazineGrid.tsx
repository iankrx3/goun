import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import type { MagazineArticle, UserSession } from '../../types';

interface MagazineGridProps {
  articles: MagazineArticle[];
  session: UserSession;
  onDeleteArticle?: (articleId: string) => Promise<void> | void;
}

export const MagazineGrid: React.FC<MagazineGridProps> = ({ articles, session, onDeleteArticle }) => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
    {articles.map((article) => {
      const isOwnArticle = Boolean(session.creator?.id) && session.creator?.id === article.curatorId;

      const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!onDeleteArticle) return;
        if (!window.confirm('칼럼을 삭제할까요?')) return;
        await onDeleteArticle(article.id);
      };

      return (
        <Link key={article.id} to={`/magazine/${article.id}`} className="relative block">
          {isOwnArticle && onDeleteArticle && (
            <button
              type="button"
              onClick={handleDelete}
              aria-label="칼럼 삭제"
              className="absolute right-2 top-2 z-10 rounded-full bg-black/50 p-1.5 text-white"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <img
            src={article.imageUrl}
            alt={article.title}
            className="aspect-[5/3] w-full rounded-2xl object-cover"
          />
          <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.16em] text-miyeon-sub1">
            {article.kind}
          </p>
          <h3 className="mt-1 font-display text-lg leading-snug text-miyeon-main">{article.title}</h3>
          <p className="mt-1 text-sm text-miyeon-main/60">{article.excerpt}</p>
          <p className="mt-1 text-xs text-miyeon-main/45">
            by {article.authorName} · {article.minutes} min read
          </p>
        </Link>
      );
    })}
  </div>
);
