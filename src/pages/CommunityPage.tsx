import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import type { CommunityPost, UserSession } from '../types';
import { useCommunityPosts } from '../hooks/useCommunityPosts';
import { useMagazineArticles } from '../hooks/useMagazineArticles';
import { PostComposer } from '../components/community/PostComposer';
import { PostCard } from '../components/community/PostCard';
import { MagazineGrid } from '../components/community/MagazineGrid';
import { MagazineComposer } from '../components/community/MagazineComposer';

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

const TABS: { id: 'community' | 'magazine'; label: string }[] = [
  { id: 'magazine', label: 'Magazine' },
  { id: 'community', label: 'Community' },
];

export default function CommunityPage({ session, onSignIn }: CommunityPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'magazine' ? 'magazine' : 'community';
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]['id']>('all');
  const { posts, loading, createPost, toggleLike, deletePost } = useCommunityPosts(session);
  const { articles, createArticle, deleteArticle } = useMagazineArticles(session);

  const filteredPosts = filter === 'all' ? posts : posts.filter((p) => p.category === filter);

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-8">
      <div>
        <h1 className="font-display text-3xl text-miyeon-main">Community</h1>
        <p className="mt-1 text-xs text-miyeon-main/60">
          Real experiences with Korean beauty places and treatments — not a general feed.
        </p>
      </div>

      <div className="flex gap-2 rounded-full bg-miyeon-neutral/40 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSearchParams(tab.id === 'community' ? {} : { tab: tab.id })}
            className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
              activeTab === tab.id ? 'bg-miyeon-main text-white' : 'text-miyeon-main/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'magazine' ? (
        <div className="space-y-5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-miyeon-main/40">
              Magazine
            </p>
            <h2 className="mt-1 font-display text-xl text-miyeon-main">Seoul beauty, explained.</h2>
          </div>
          <MagazineComposer session={session} onSignIn={onSignIn} onSubmit={createArticle} />
          <MagazineGrid articles={articles} session={session} onDeleteArticle={deleteArticle} />
        </div>
      ) : (
        <>
          <PostComposer session={session} onSignIn={onSignIn} onSubmit={createPost} />

          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(cat.id)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  filter === cat.id ? 'bg-miyeon-main text-white' : 'bg-miyeon-neutral/60 text-miyeon-main/70'
                }`}
              >
                {cat.label}
              </motion.button>
            ))}
          </div>

          {loading ? (
            <p className="py-10 text-center text-sm text-miyeon-main/70">Loading…</p>
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
        </>
      )}
    </div>
  );
}
