import type { Treatment } from '../types';

interface GlossaryEntry {
  term: string;
  aliases?: string[];
  description: string;
}

/**
 * Static "what is this?" glossary for common Korean beauty/aesthetic
 * treatments and brand names. Covers both specific device/brand names
 * (e.g. Potenza, Ulthera) and the generic treatmentType labels used in
 * mock data (e.g. "Laser", "Dermal Filler Injection") so a match is found
 * regardless of which free-text name the data source supplies.
 */
const GLOSSARY: GlossaryEntry[] = [
  {
    term: 'potenza',
    aliases: ['포텐자'],
    description:
      "Potenza is a radiofrequency microneedling device: fine needles deliver RF energy just under the skin to stimulate collagen production. It's commonly used to improve pores, fine lines, acne scars, and overall skin texture, typically over a series of sessions.",
  },
  {
    term: 'ulthera',
    aliases: ['ultherapy', 'ultherapy lifting', '울쎄라'],
    description:
      "Ulthera (Ultherapy) is a non-surgical skin-tightening treatment that uses focused ultrasound energy to heat deep layers of tissue, triggering the body's natural collagen renewal. It's most often used to lift and firm the jawline, neck, and brow area, with results appearing gradually over 2-3 months.",
  },
  {
    term: 'thermage',
    aliases: ['써마지'],
    description:
      'Thermage uses radiofrequency energy delivered through a handheld device to heat the deeper layers of skin, tightening existing collagen and stimulating new collagen growth. It targets sagging skin and mild wrinkles on the face and body, with no downtime and results that build over several months.',
  },
  {
    term: 'shurink',
    aliases: ['shrink', '슈링크'],
    description:
      "Shurink is a Korean HIFU (high-intensity focused ultrasound) device similar in effect to Ulthera — it uses ultrasound energy to lift and tighten skin by stimulating collagen deep beneath the surface. It's a popular, lower-cost alternative for jawline and facial contouring with minimal downtime.",
  },
  {
    term: 'hifu',
    description:
      'HIFU (High-Intensity Focused Ultrasound) is a non-surgical lifting treatment that uses focused ultrasound waves to heat and tighten deep skin layers, encouraging new collagen production. Commonly used for jawline, neck, and brow lifting, with gradual results and no downtime.',
  },
  {
    term: 'botox',
    aliases: ['보톡스'],
    description:
      'Botox is a purified protein injected into targeted muscles to temporarily relax them, smoothing wrinkles caused by repeated facial expressions (like forehead lines or crow\'s feet) and, at the jaw, slimming a square jawline. Results appear within days and typically last 3-6 months.',
  },
  {
    term: 'filler',
    aliases: ['dermal filler', 'dermal filler injection', 'dermal filler for volume & contour', '필러'],
    description:
      'Dermal filler is an injectable gel (usually hyaluronic acid) used to add volume, smooth wrinkles, or reshape facial contours — commonly the cheeks, lips, nose bridge, or chin. Results are visible immediately and generally last 6-18 months depending on the area and product used.',
  },
  {
    term: 'skin booster',
    aliases: [
      'skin booster injection',
      '스킨부스터',
      '물광주사',
      'rejuran',
      '리쥬란',
    ],
    description:
      "A skin booster is a fine-needle injection of hyaluronic acid (or similar bio-stimulating ingredients) spread evenly under the skin to boost hydration, elasticity, and glow from within — rather than adding volume like a filler. It's often called \"glass skin\" or \"water\" injections and needs little to no downtime.",
  },
  {
    term: 'thread lift',
    aliases: ['pdo thread lift', '실리프팅', '리프팅 실'],
    description:
      "A thread lift inserts dissolvable medical threads under the skin to physically lift sagging tissue and stimulate collagen production as the threads dissolve over several months. It's a less invasive alternative to a surgical facelift, mainly used on the jawline, cheeks, and neck.",
  },
  {
    term: 'laser toning',
    aliases: ['laser', '레이저토닝', '레이저'],
    description:
      'Laser toning uses low-energy laser pulses to break down excess pigment and even out skin tone, while also gently stimulating collagen. It\'s commonly used for melasma, sun spots, redness, and overall brightening, usually done as a series of sessions with virtually no downtime.',
  },
  {
    term: 'chemical peel',
    aliases: ['peel', '필링'],
    description:
      'A chemical peel applies an acid solution to the skin to exfoliate the outer layer, revealing smoother, more even-toned skin underneath. It\'s used for acne, texture, dullness, and mild scarring, with downtime ranging from none to a few days of visible peeling depending on strength.',
  },
  {
    term: 'led light therapy',
    aliases: ['led', '엘이디'],
    description:
      'LED light therapy exposes skin to specific wavelengths of light (typically red or blue) to calm inflammation, reduce acne-causing bacteria, and encourage collagen production. It\'s a gentle, no-downtime treatment often added on to other facials.',
  },
  {
    term: 'pore tightening facial',
    aliases: ['facial', '모공 관리'],
    description:
      'A pore-tightening facial combines deep cleansing, extractions, and calming treatments (often steam, exfoliation, and cooling masks) to clear clogged pores and visibly minimize their appearance. It\'s a relaxing, no-downtime treatment usually recommended as regular maintenance.',
  },
  {
    term: 'perm & color',
    aliases: ['perm', 'k-idol perm & color', '펌', '염색'],
    description:
      'A perm chemically reshapes hair strands to create lasting curl or wave, while coloring changes hair pigment — together they\'re a common way to recreate popular K-idol hairstyles. Processing time and aftercare vary with hair length and the chemicals used.',
  },
  {
    term: 'gel manicure',
    aliases: ['gel', '젤네일'],
    description:
      'A gel manicure applies a gel-based polish that\'s cured under UV or LED light, giving a glossy, chip-resistant finish that typically lasts 2-3 weeks — longer than regular nail polish.',
  },
  {
    term: 'makeup session',
    aliases: ['makeup', '메이크업'],
    description:
      'A makeup session is a professional application (often for photoshoots, events, or a "get the look" experience) styled to a specific look — such as the soft, dewy "Korean natural glam" style — using techniques and products tailored to the client\'s features.',
  },
];

function normalize(value: string): string {
  return value.toLowerCase().replace(/[\s\-_]/g, '');
}

function findMatch(query: string): GlossaryEntry | null {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return null;

  for (const entry of GLOSSARY) {
    const candidates = [entry.term, ...(entry.aliases ?? [])].map(normalize);
    if (candidates.some((c) => c === normalizedQuery)) return entry;
  }

  for (const entry of GLOSSARY) {
    const candidates = [entry.term, ...(entry.aliases ?? [])].map(normalize);
    if (candidates.some((c) => normalizedQuery.includes(c) || c.includes(normalizedQuery))) return entry;
  }

  return null;
}

/**
 * Looks up a plain-language "what is this?" explanation for a treatment,
 * trying its specific name first, then falling back to its generic
 * treatmentType. Returns null (section should be hidden) when nothing
 * in the glossary matches, rather than guessing.
 */
export function getTreatmentExplanation(treatment: Treatment): string | null {
  return findMatch(treatment.name)?.description ?? findMatch(treatment.treatmentType)?.description ?? null;
}
