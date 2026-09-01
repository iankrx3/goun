import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Star, Trash2 } from 'lucide-react';
import type { CommunityPost, PostComment, UserSession } from '../../types';
import { addComment, deleteComment, fetchComments } from '../../services/community';
import { ShareButton } from './ShareButton';

interface PostCardProps {
  post: CommunityPost;
  session: UserSession;
  onSignIn: () => void;
  onLikeToggle: (postId: string) => void;
  onDeletePost?: (postId: string) => Promise<void> | void;
  defaultExpanded?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  session,
  onSignIn,
  onLikeToggle,
  onDeletePost,
  defaultExpanded,
}) => {
  const [expanded, setExpanded] = useState(Boolean(defaultExpanded));
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isOwnPost = Boolean(session.user?.id) && session.user?.id === post.authorId;

  useEffect(() => {
    if (expanded && !commentsLoaded) {
      fetchComments(post.id).then((c) => {
        setComments(c);
        setCommentsLoaded(true);
      });
    }
  }, [expanded, commentsLoaded, post.id]);

  const handleLike = () => {
    if (!session.isLoggedIn) {
      onSignIn();
      return;
    }
    onLikeToggle(post.id);
  };

  const handleSubmitComment = async () => {
    if (!session.isLoggedIn || !session.user || !commentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const comment = await addComment(post.id, { text: commentText.trim() }, session);
      setComments((prev) => [...prev, comment]);
      setCommentText('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!onDeletePost) return;
    if (!window.confirm('게시글을 삭제할까요?')) return;
    await onDeletePost(post.id);
  };

  const handleDeleteComment = async (comment: PostComment) => {
    if (!session.user) return;
    if (!window.confirm('댓글을 삭제할까요?')) return;
    await deleteComment(post.id, comment.id, session);
    setComments((prev) => prev.filter((c) => c.id !== comment.id));
  };

  return (
    <article className="rounded-2xl border border-han-cream bg-white p-4">
      {defaultExpanded ? (
        <div>
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
        </div>
      ) : (
        <Link to={`/community/${post.id}`} className="block">
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
        </Link>
      )}

      {post.placeId && post.placeName && (
        <Link
          to={`/place/${post.placeId}`}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-han-cream px-3 py-1 text-[11px] font-medium text-warm-taupe"
        >
          📍 {post.placeName}
          {post.treatmentName ? ` · ${post.treatmentName}` : ''}
        </Link>
      )}

      <div className="mt-3.5 flex items-center gap-5 border-t border-han-cream pt-3">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-xs font-semibold ${
            post.likedByMe ? 'text-goun-rose' : 'text-warm-taupe/70 hover:text-warm-taupe'
          }`}
        >
          <Heart className="h-4 w-4" fill={post.likedByMe ? 'currentColor' : 'none'} />
          {post.likeCount}
        </button>
        {defaultExpanded ? (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold text-warm-taupe/70 hover:text-warm-taupe"
          >
            <MessageCircle className="h-4 w-4" />
            {post.commentCount}
          </button>
        ) : (
          <Link
            to={`/community/${post.id}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-warm-taupe/70 hover:text-warm-taupe"
          >
            <MessageCircle className="h-4 w-4" />
            {post.commentCount}
          </Link>
        )}
        <ShareButton postId={post.id} title={post.text} />
        {isOwnPost && onDeletePost && (
          <button
            onClick={handleDeletePost}
            className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-warm-taupe/50 hover:text-red-500"
            aria-label="게시글 삭제"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {expanded && (
        <div className="mt-3 space-y-2.5 border-t border-han-cream pt-3">
          {commentsLoaded && comments.length === 0 && (
            <p className="text-xs text-warm-taupe/50">No comments yet.</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2">
              <img
                src={c.authorAvatarUrl}
                alt={c.authorName}
                referrerPolicy="no-referrer"
                className="h-6 w-6 shrink-0 rounded-full object-cover"
              />
              <div className="flex items-center gap-1.5 rounded-2xl bg-han-cream/50 px-3 py-1.5 text-xs text-warm-taupe">
                <span>
                  <span className="font-semibold">{c.authorName}</span>{' '}
                  <span className="text-warm-taupe/80">{c.text}</span>
                </span>
                {session.user?.id === c.authorId && (
                  <button
                    onClick={() => handleDeleteComment(c)}
                    className="shrink-0 text-warm-taupe/40 hover:text-red-500"
                    aria-label="댓글 삭제"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {session.isLoggedIn && session.user ? (
            <div className="flex items-center gap-2 pt-1">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmitComment();
                }}
                placeholder="Add a comment…"
                className="w-full rounded-full border border-han-cream px-3.5 py-1.5 text-xs text-warm-taupe placeholder:text-warm-taupe/40 focus:outline-none focus:border-goun-rose/50"
              />
              <button
                onClick={handleSubmitComment}
                disabled={!commentText.trim() || submitting}
                className="shrink-0 text-xs font-bold text-goun-rose disabled:opacity-40"
              >
                Post
              </button>
            </div>
          ) : (
            <button onClick={onSignIn} className="pt-1 text-xs font-semibold text-warm-taupe/60">
              Sign in to comment
            </button>
          )}
        </div>
      )}
    </article>
  );
};
