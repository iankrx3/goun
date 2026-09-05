import { MagazineArticle, UserSession } from '../types';
import { mapMagazineArticle } from '../lib/mappers';
import { supabase } from '../lib/supabase';
import { mockMagazineArticles } from '../data/magazine';
import { DEMO_USER } from './auth';
import { readLocalArticles, saveLocalArticle } from '../lib/localMagazineStore';

export interface CreateMagazineArticleInput {
  kind: MagazineArticle['kind'];
  title: string;
  imageUrl: string;
  body: string;
}

function isDemoSession(session: UserSession): boolean {
  return session.user?.id === DEMO_USER.id;
}

function deriveExcerpt(body: string): string {
  const firstLine = body.split('\n').find((line) => line.trim().length > 0) ?? body;
  return firstLine.length > 140 ? `${firstLine.slice(0, 140).trim()}…` : firstLine.trim();
}

function deriveMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function sortByCreatedAtDesc(articles: MagazineArticle[]): MagazineArticle[] {
  return [...articles].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function fetchMagazineArticles(): Promise<MagazineArticle[]> {
  const local = [...readLocalArticles(), ...mockMagazineArticles];
  if (!supabase) return sortByCreatedAtDesc(local);
  try {
    const { data, error } = await supabase
      .from('magazine_articles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const remote = (data ?? []).map(mapMagazineArticle);
    return sortByCreatedAtDesc([...remote, ...local]);
  } catch {
    return sortByCreatedAtDesc(local);
  }
}

export async function createMagazineArticle(
  input: CreateMagazineArticleInput,
  session: UserSession
): Promise<MagazineArticle> {
  if (!session.isLoggedIn || !session.creator) {
    throw new Error('Must be a curator to publish a magazine column.');
  }
  const curator = session.creator;
  const excerpt = deriveExcerpt(input.body);
  const minutes = deriveMinutes(input.body);

  if (supabase && !isDemoSession(session)) {
    try {
      const { data, error } = await supabase
        .from('magazine_articles')
        .insert({
          curator_id: curator.id,
          author_name: curator.display_name,
          author_avatar_url: curator.avatar_url,
          kind: input.kind,
          title: input.title,
          excerpt,
          body: input.body,
          image_url: input.imageUrl,
          minutes,
        })
        .select()
        .single();
      if (error) throw error;
      return mapMagazineArticle(data);
    } catch {
      // fall through to local fallback (Supabase write failed unexpectedly)
    }
  }

  const article: MagazineArticle = {
    id: `local-${crypto.randomUUID()}`,
    curatorId: curator.id,
    authorName: curator.display_name,
    authorAvatarUrl: curator.avatar_url,
    kind: input.kind,
    title: input.title,
    excerpt,
    body: input.body,
    imageUrl: input.imageUrl,
    minutes,
    createdAt: new Date().toISOString(),
  };
  saveLocalArticle(article);
  return article;
}
