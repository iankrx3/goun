import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { mockCommunityPosts } from '../data/mock';
import type { CommunityPost } from '../types';

const CATEGORIES: { id: CommunityPost['category'] | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'trending', label: '🔥 Trending' },
  { id: 'treatment-reviews', label: '✨ Treatment Reviews' },
  { id: 'seoul-places', label: '📍 Seoul Beauty Places' },
  { id: 'questions', label: '💬 Questions' },
];

// §5 COMMUNITY — MVP is a read-only feed (Post/Like/Comment/Follow are §5 "MVP 이후").
export default function CommunityPage() {
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]['id']>('all');

  const posts =
    filter === 'all' ? mockCommunityPosts : mockCommunityPosts.filter((p) => p.category === filter);

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-8">
      <div>
        <h1 className="font-display text-3xl text-warm-taupe">Community</h1>
        <p className="mt-1 text-xs text-warm-taupe/60">
          Real experiences with Korean beauty places and treatments — not a general feed.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filter === cat.id ? 'bg-warm-taupe text-white' : 'bg-han-cream/60 text-warm-taupe/70'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {posts.map((post) => (
          <article key={post.id} className="rounded-2xl border border-han-cream bg-white p-4">
            <div className="flex items-center gap-2.5">
              <img
                src={post.authorAvatarUrl}
                alt={post.authorName}
                referrerPolicy="no-referrer"
                className="h-9 w-9 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-warm-taupe">{post.authorName}</p>
                <p className="text-[11px] text-warm-taupe/50">
                  {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              {post.rating && (
                <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-warm-taupe">
                  <Star className="h-3 w-3 fill-goun-rose text-goun-rose" /> {post.rating}
                </span>
              )}
            </div>

            <p className="mt-3 text-sm leading-relaxed text-warm-taupe/90">{post.text}</p>

            {post.placeId && post.placeName && (
              <Link
                to={`/place/${post.placeId}`}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-han-cream px-3 py-1 text-[11px] font-medium text-warm-taupe"
              >
                📍 {post.placeName}
                {post.treatmentName ? ` · ${post.treatmentName}` : ''}
              </Link>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
