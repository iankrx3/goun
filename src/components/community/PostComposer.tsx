import React, { useState } from 'react';
import type { CommunityPost, UserSession } from '../../types';
import type { CreatePostInput } from '../../services/community';
import { DEMO_USER } from '../../services/auth';

interface PostComposerProps {
  session: UserSession;
  onSignIn: () => void;
  onSubmit: (input: CreatePostInput) => Promise<CommunityPost>;
}

const POST_CATEGORIES: { id: CommunityPost['category']; label: string }[] = [
  { id: 'trending', label: '🔥 Trending' },
  { id: 'treatment-reviews', label: '✨ Treatment Review' },
  { id: 'seoul-places', label: '📍 Seoul Beauty Place' },
  { id: 'questions', label: '💬 Question' },
];

export const PostComposer: React.FC<PostComposerProps> = ({ session, onSignIn, onSubmit }) => {
  const [text, setText] = useState('');
  const [category, setCategory] = useState<CommunityPost['category']>('trending');
  const [submitting, setSubmitting] = useState(false);

  if (!session.isLoggedIn || !session.user) {
    return (
      <button
        onClick={onSignIn}
        className="w-full rounded-2xl border border-han-cream bg-han-cream/30 px-4 py-3.5 text-left text-sm text-warm-taupe/60"
      >
        Sign in to share your experience…
      </button>
    );
  }

  const handleSubmit = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({ text: text.trim(), category });
      setText('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-han-cream bg-white p-4">
      <div className="flex items-start gap-2.5">
        <img
          src={session.user.avatar_url}
          alt={session.user.name}
          referrerPolicy="no-referrer"
          className="h-9 w-9 shrink-0 rounded-full object-cover"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share a place, treatment, or question…"
          rows={2}
          className="w-full resize-none bg-transparent text-sm text-warm-taupe placeholder:text-warm-taupe/40 focus:outline-none"
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {POST_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                category === cat.id ? 'bg-warm-taupe text-white' : 'bg-han-cream/60 text-warm-taupe/70'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || submitting}
          className="shrink-0 rounded-full bg-goun-rose px-4 py-1.5 text-xs font-bold text-white shadow-sm shadow-goun-rose/30 disabled:opacity-40"
        >
          {submitting ? 'Posting…' : 'Post'}
        </button>
      </div>

      {session.user.id === DEMO_USER.id && (
        <p className="mt-2.5 text-[11px] text-warm-taupe/50">
          Demo mode saves to this browser only. Sign in with Google to keep your posts, likes, and comments across
          logins and devices.
        </p>
      )}
    </div>
  );
};
