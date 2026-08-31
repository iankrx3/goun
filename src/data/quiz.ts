import type { BeautyCategory, Budget, Downtime, ResultTiming } from '../types';

// SNIFF quiz content — Goun_PRD_v2_KTO_Design.md §2-2 (WHAT), §2-3 (VIBE), §2-4 (Constraints)

export const whatOptions: Record<BeautyCategory, string[]> = {
  skin: ['Pores', 'Acne', 'Pigmentation', 'Dryness', 'Fine Lines', 'Dullness', 'Uneven Skin', 'Glow'],
  face: ['Jawline', 'V-Line', 'Lifting', 'Contouring', 'Volume', 'Fine Lines', 'Facial Balance'],
  hair: ['Haircut', 'Color', 'Perm', 'Treatment', 'Styling', 'Hair Makeover'],
  nails: ['Gel', 'Nail Art', 'Extensions', 'Minimal Nails', 'Korean Nail Art', 'Luxury Nails'],
  makeup: ['Everyday', 'A Date', 'Photoshoot', 'A Night Out', 'Special Event', 'Korean Beauty Look'],
};

export interface VibePair {
  a: string;
  b: string;
}

export const vibePairs: Record<BeautyCategory, VibePair[]> = {
  skin: [
    { a: '⚡ Fast Results', b: '🌱 Long-Term Skin Health' },
    { a: '🤫 Keep It Subtle', b: '🔥 Dramatic Change' },
    { a: '🌿 Naturally Better', b: '✨ More Refined' },
  ],
  face: [
    { a: '⚡ Fast Results', b: '🌱 Long-Term Improvement' },
    { a: '🤫 Keep It Subtle', b: '🔥 Dramatic Change' },
    { a: '🌿 Naturally Defined', b: '✨ More Sculpted' },
  ],
  hair: [
    { a: '🤍 Natural & Effortless', b: '🇰🇷 K-Pop/K-Idol' },
    { a: '🌸 Soft & Feminine', b: '💎 Glamorous' },
    { a: '✨ Everyday You', b: '🔥 Main Character Energy' },
  ],
  nails: [
    { a: '🤍 Korean Clean Girl', b: '🔥 Make a Statement' },
    { a: '🎀 Cute & Playful', b: '💎 Quiet Luxury' },
    { a: '✨ Simple & Clean', b: '🎨 Detailed & Artistic' },
  ],
  makeup: [
    { a: '🤍 Everyday', b: '💘 A Date' },
    { a: '🇰🇷 Korean Natural', b: '💎 Full Glam' },
    { a: '🌸 Soft & Feminine', b: '🔥 Bold & Dramatic' },
  ],
};

export const downtimeOptions: { id: Downtime; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: '1-3-days', label: '1–3 days' },
  { id: '3-7-days', label: '3–7 days' },
  { id: 'no-mind', label: "I don't mind" },
];

export const resultTimingOptions: { id: ResultTiming; label: string }[] = [
  { id: 'asap', label: 'ASAP' },
  { id: 'within-week', label: 'Within a week' },
  { id: '1-2-weeks', label: '1–2 weeks' },
  { id: 'long-term', label: 'Long-term' },
];

export const budgetOptions: { id: Budget; label: string }[] = [
  { id: 'under-100', label: 'Under $100' },
  { id: '100-300', label: '$100–300' },
  { id: '300-500', label: '$300–500' },
  { id: '500-plus', label: '$500+' },
];

export const otherOptions = ['English Friendly', 'Near Me', 'First Time', 'No Preference'];

export const aiTransitionMessages = [
  'Picking your best matches...',
  'Understanding your goals...',
  'Checking treatments...',
  'Finding your best matches...',
];
