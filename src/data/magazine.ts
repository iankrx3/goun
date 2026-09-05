export interface MagazineArticle {
  id: string;
  kind: 'TREATMENT' | 'GUIDE' | 'TREND';
  title: string;
  minutes: number;
  gradient: string;
  excerpt: string;
}

// Editorial mock content for the Community tab's "Magazine" view. Mirrors the shape of
// TrendingItem in home.ts (same id/kind/title/minutes/gradient) plus a short excerpt, since this
// list is longer than the 3 cards featured on the home page's "Trending in Seoul" shelf.
export const magazineArticles: MagazineArticle[] = [
  {
    id: 'rejuran-juvelook',
    kind: 'TREATMENT',
    title: 'Rejuran vs Juvelook — which one is for you?',
    minutes: 5,
    gradient: 'from-[#f4ddd8] to-[#e8b9b2]',
    excerpt: 'Both are skin-booster injectables, but they solve different problems. Here’s how clinics actually pick.',
  },
  {
    id: 'four-days',
    kind: 'GUIDE',
    title: 'What you can realistically get done in 4 days',
    minutes: 7,
    gradient: 'from-[#e7b4ac] to-[#c97b76]',
    excerpt: 'A day-by-day plan for a short trip, so downtime never overlaps with your flight home.',
  },
  {
    id: 'glass-skin',
    kind: 'TREND',
    title: 'The "glass skin" protocol Seoul clinics actually use',
    minutes: 4,
    gradient: 'from-[#edd0c9] to-[#d49a9a]',
    excerpt: 'Less about products, more about a specific order of lasers and toners. We break down the protocol.',
  },
  {
    id: 'ingredient-glossary',
    kind: 'GUIDE',
    title: 'The 6 K-beauty ingredients worth knowing before you shop',
    minutes: 6,
    gradient: 'from-[#f0ded6] to-[#cf9f92]',
    excerpt: 'Snail mucin, centella, PDRN — what they do, and which skin concerns they’re actually good for.',
  },
  {
    id: 'booking-in-english',
    kind: 'GUIDE',
    title: 'How to book a Seoul clinic in English, without the guesswork',
    minutes: 5,
    gradient: 'from-[#e9c7c0] to-[#b97b74]',
    excerpt: 'What to ask before you land, and the phrases that get you an English-speaking consult.',
  },
  {
    id: 'winter-skin-trend',
    kind: 'TREND',
    title: 'Why "skip-care" is replacing 10-step routines this season',
    minutes: 4,
    gradient: 'from-[#f2d9d2] to-[#d8a49c]',
    excerpt: 'Seoul dermatologists are pushing fewer, stronger steps. Here’s what to cut first.',
  },
];
