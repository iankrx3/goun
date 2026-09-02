import type { QuizAnswers } from '../types';

// §02-7 — the italic one-line "why this" quote on the top result card. Deterministic
// template lookup (no LLM call) keyed by the Subtle/Dramatic + Fast/Long-term vibe picks,
// combined with the user's top selected concern.

function isDramatic(vibe: string | undefined): boolean {
  return Boolean(vibe && /clear difference/i.test(vibe));
}

function isFast(vibe: string | undefined): boolean {
  return Boolean(vibe && /fast results/i.test(vibe));
}

export function buildPickQuote(answers: QuizAnswers): string {
  const concern = (answers.concerns[0] || 'your goal').toLowerCase();
  const dramatic = isDramatic(answers.vibes[0]);
  const fast = isFast(answers.vibes[1]);

  if (!dramatic && fast) {
    return `You want visible ${concern} — subtle enough that people just assume you were born with it.`;
  }
  if (!dramatic && !fast) {
    return `You're playing the long game with ${concern} — subtle, steady, and built to last.`;
  }
  if (dramatic && fast) {
    return `You want ${concern} handled, fast — no half-measures, real visible change.`;
  }
  return `You're in it for the long haul on ${concern} — dramatic results, done the right way.`;
}
