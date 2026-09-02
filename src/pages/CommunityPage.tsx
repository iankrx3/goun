import React, { useState } from 'react';
import type { CommunityPost, UserSession } from '../types';
import { useCommunityPosts } from '../hooks/useCommunityPosts';
import { PostComposer } from '../components/community/PostComposer';
import { PostCard } from '../components/community/PostCard';

interface CommunityPageProps {
  session: UserSession;
  onSignIn: () => void;
}

const CATEGORIES: { id: CommunityPost['category'] | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'trending', label: '🔥 Trending' },
  { id: 'treatment-reviews', label: '✨ Treatment Reviews' },
  { id: 'seoul-places', label: '📍 Seoul Beauty Places' },
  { id: 'questions', label: '💬 Questions' },
];

export default function CommunityPage({ session, onSignIn }: CommunityPageProps) {
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]['id']>('all');
  const { posts, loading, createPost, toggleLike, deletePost } = useCommunityPosts(session);

  const filteredPosts = filter === 'all' ? posts : posts.filter((p) => p.category === filter);

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-8">
      <div>
        <h1 className="font-display text-3xl text-miyeon-main">Community</h1>
        <p className="mt-1 text-xs text-miyeon-main/60">
          Real experiences with Korean beauty places and treatments — not a general feed.
        </p>
      </div>

      <PostComposer session={session} onSignIn={onSignIn} onSubmit={createPost} />

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filter === cat.id ? 'bg-miyeon-main text-white' : 'bg-miyeon-neutral/60 text-miyeon-main/70'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-miyeon-main/50">Loading…</p>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              session={session}
              onSignIn={onSignIn}
              onLikeToggle={toggleLike}
              onDeletePost={deletePost}
            />
          ))}
        </div>
      )}
    </div>
  );
}
