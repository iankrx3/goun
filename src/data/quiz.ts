import type { BeautyCategory, Budget, Downtime, TripLength } from '../types';

// SNIFF quiz content — MIYEON Core UX §02-3 (WHAT), §02-4 (VIBE), §02-5 (Constraints)

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

// Order matters — §02-4: Subtle/Dramatic (result) → Fast/Long-term (timing) → Needles/No-needles (method).
export const vibePairs: Record<BeautyCategory, VibePair[]> = {
  skin: [
    { a: '🤫 Keep it Subtle', b: '🔥 I Want a Clear Difference' },
    { a: '⚡ Fast Results', b: '🌱 Long-Term Skin Health' },
    { a: '💉 Needles Are Fine', b: '🚫 Nothing That Breaks the Skin' },
  ],
  face: [
    { a: '🤫 Keep it Subtle', b: '🔥 I Want a Clear Difference' },
    { a: '⚡ Fast Results', b: '🌱 Long-Term Improvement' },
    { a: '💉 Injectables Are Fine', b: '🚫 No Needles — Devices Only' },
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

export const tripLengthOptions: { id: TripLength; label: string }[] = [
  { id: '1-3-days', label: '1–3 days' },
  { id: '4-7-days', label: '4–7 days' },
  { id: '8-14-days', label: '8–14 days' },
  { id: 'live-here', label: 'I live here' },
];

export const downtimeOptions: { id: Downtime; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: '1-3-days', label: 'A day or two' },
  { id: '3-7-days', label: 'A few days' },
  { id: 'no-mind', label: "I don't mind" },
];

export const budgetOptions: { id: Budget; label: string }[] = [
  { id: 'under-100', label: 'Under $100' },
  { id: '100-300', label: '$100–300' },
  { id: '300-500', label: '$300–500' },
  { id: '500-plus', label: '$500+' },
];

export const aiTransitionMessages = [
  'Reading your answers…',
  'Checking English consultation…',
  "Filtering what's actually bookable…",
  'Found 3.',
];
