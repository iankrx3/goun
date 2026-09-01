import { useCallback, useEffect, useState } from 'react';
import type { CommunityPost, UserSession } from '../types';
import {
  CreatePostInput,
  createCommunityPost,
  fetchCommunityPosts,
  toggleLike as toggleLikeService,
} from '../services/community';

export function useCommunityPosts(session: UserSession) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchCommunityPosts(session.user?.id)
      .then(setPosts)
      .finally(() => setLoading(false));
  }, [session.user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createPost = useCallback(
    async (input: CreatePostInput) => {
      const post = await createCommunityPost(input, session);
      setPosts((prev) => [post, ...prev]);
      return post;
    },
    [session]
  );

  const toggleLike = useCallback(
    async (postId: string) => {
      const target = posts.find((p) => p.id === postId);
      const wasLiked = target?.likedByMe ?? false;
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likedByMe: !wasLiked, likeCount: p.likeCount + (wasLiked ? -1 : 1) } : p
        )
      );
      try {
        await toggleLikeService(postId, session);
      } catch {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, likedByMe: wasLiked, likeCount: p.likeCount + (wasLiked ? 1 : -1) } : p
          )
        );
      }
    },
    [posts, session]
  );

  return { posts, loading, createPost, toggleLike, refresh };
}
