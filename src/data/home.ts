export type BrowseAction = 'treatments' | 'salon' | 'products';

export interface BrowseItem {
  id: BrowseAction;
  caption: string;
  title: string;
  description: string;
  highlighted?: boolean;
}

export interface TrendingItem {
  id: string;
  kind: 'TREATMENT' | 'GUIDE' | 'TREND';
  title: string;
  minutes: number;
  href: string;
  gradient: string;
}

export interface Testimonial {
  id: string;
  name: string;
  meta: string;
  quote: string;
  chip: string;
  avatarClass: string;
}

export const browseItems: BrowseItem[] = [
  {
    id: 'treatments',
    caption: 'Skin · Face · Lifting',
    title: 'Treatments',
    description: 'Not sure what you need?\nAnswer 3 questions.',
    highlighted: true,
  },
  {
    id: 'salon',
    caption: 'Hair · Nails · Makeup',
    title: 'Salon',
    description: 'Book a chair with\nEnglish-speaking staff.',
  },
  {
    id: 'products',
    caption: 'Skincare · Makeup',
    title: 'Products',
    description: 'What to actually buy\nat Olive Young.',
  },
];

export const trendingItems: TrendingItem[] = [
  {
    id: 'rejuran-juvelook',
    kind: 'TREATMENT',
    title: 'Rejuran vs Juvelook —\nwhich one is for you?',
    minutes: 5,
    href: '/treatment/t-skin-booster',
    gradient: 'from-[#f4ddd8] to-[#e8b9b2]',
  },
  {
    id: 'four-days',
    kind: 'GUIDE',
    title: 'What you can realistically\nget done in 4 days',
    minutes: 7,
    href: '/community',
    gradient: 'from-[#e7b4ac] to-[#c97b76]',
  },
  {
    id: 'glass-skin',
    kind: 'TREND',
    title: 'The “glass skin” protocol\nSeoul clinics actually use',
    minutes: 4,
    href: '/treatment/t-skin-booster',
    gradient: 'from-[#edd0c9] to-[#d49a9a]',
  },
];

export const partnerNames = ['Creatrip', 'OLIVE YOUNG', 'amazon', 'Coupang', 'NAVER', 'o3c'] as const;

export const testimonials: Testimonial[] = [
  {
    id: 'maya',
    name: 'Maya R.',
    meta: '@mayainseoul · 12K',
    quote:
      'I had 4 days and no idea what was realistic. Walked into the clinic knowing exactly what to ask.',
    chip: 'Rejuran · Gangnam',
    avatarClass: 'bg-[#f0d2cc]',
  },
  {
    id: 'alicia',
    name: 'Alicia T.',
    meta: 'Los Angeles',
    quote: 'Nobody else told me which lasers were safe for my skin tone. That alone sold me.',
    chip: 'Pico Toning · Hongdae',
    avatarClass: 'bg-[#e8c4bc]',
  },
  {
    id: 'jess',
    name: 'Jess W.',
    meta: '@jesskbeauty · 28K',
    quote: 'Booked in three taps. The consultation card is the part I actually screenshot.',
    chip: 'Ultherapy · Apgujeong',
    avatarClass: 'bg-[#d49a9a]',
  },
];
