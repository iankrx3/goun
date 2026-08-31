import type { User } from '@supabase/supabase-js';
import { Creator, UserSession } from '../types';
import { mapAuthSession } from '../lib/mappers';
import { isSupabaseConfigured, requireSupabase, supabase } from '../lib/supabase';
import { fetchCreatorByUserId } from './places';

export { isSupabaseConfigured };

const RETURN_TAB_KEY = 'goun_auth_return_tab';

export type AuthReturnTab = 'explore' | 'map' | 'community' | string;

export function rememberReturnTab(tab: AuthReturnTab) {
  sessionStorage.setItem(RETURN_TAB_KEY, tab);
}

export function consumeReturnTab(): AuthReturnTab | null {
  const tab = sessionStorage.getItem(RETURN_TAB_KEY);
  sessionStorage.removeItem(RETURN_TAB_KEY);
  return tab;
}

export async function signInWithGoogle(returnTab: AuthReturnTab = 'explore') {
  const client = requireSupabase();
  rememberReturnTab(returnTab);
  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`,
      queryParams: {
        prompt: 'select_account',
      },
    },
  });
  if (error) throw error;
}

export async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function buildUserSession(user: User | null): Promise<UserSession> {
  if (!user) return { isLoggedIn: false };
  let creator: Creator | null = null;
  try {
    creator = await fetchCreatorByUserId(user.id);
  } catch {
    creator = null;
  }
  return mapAuthSession(user, creator);
}
