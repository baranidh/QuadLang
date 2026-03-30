/**
 * Tamil Alphabet Data — 246 letters
 *  12  உயிர்   (vowels)
 *  18  மெய்    (consonants)
 * 216  உயிர்மெய் (combinations: 18 × 12)
 */

const VIRAMA = '்'; // U+0BCD  pulli

// ─── 18 base consonants ─────────────────────────────────────────────────────
export const CONSONANT_BASES = [
  { base: 'க', romanBase: 'k',  variants: ['ka', 'k', 'ga', 'g'] },
  { base: 'ங', romanBase: 'ng', variants: ['nga', 'ng', 'nka', 'nng'] },
  { base: 'ச', romanBase: 'ch', variants: ['cha', 'sa', 'ch', 's', 'ja'] },
  { base: 'ஞ', romanBase: 'ny', variants: ['nya', 'ny', 'gna', 'nja', 'na'] },
  { base: 'ட', romanBase: 'ta', variants: ['ta', 'da', 't', 'd', 'tta'] },
  { base: 'ண', romanBase: 'na', variants: ['na', 'n', 'nna', 'nn'] },
  { base: 'த', romanBase: 'th', variants: ['tha', 'th', 'dha', 'da', 'ta'] },
  { base: 'ந', romanBase: 'na', variants: ['na', 'n', 'ntha', 'nna'] },
  { base: 'ப', romanBase: 'pa', variants: ['pa', 'ba', 'p', 'b'] },
  { base: 'ம', romanBase: 'ma', variants: ['ma', 'm'] },
  { base: 'ய', romanBase: 'ya', variants: ['ya', 'y'] },
  { base: 'ர', romanBase: 'ra', variants: ['ra', 'r'] },
  { base: 'ல', romanBase: 'la', variants: ['la', 'l'] },
  { base: 'வ', romanBase: 'va', variants: ['va', 'wa', 'v', 'w', 'ba'] },
  { base: 'ழ', romanBase: 'zh', variants: ['zha', 'zh', 'la', 'ra', 'lla', 'rra'] },
  { base: 'ள', romanBase: 'la', variants: ['la', 'l', 'lla', 'll'] },
  { base: 'ற', romanBase: 'ra', variants: ['ra', 'r', 'tra', 'ta', 'rra'] },
  { base: 'ன', romanBase: 'na', variants: ['na', 'n', 'nna', 'nn'] },
];

// ─── 12 vowels with their combining signs ────────────────────────────────────
export const VOWEL_DATA = [
  { vowel: 'அ', sign: '',   romanSuffix: 'a',  variants: ['a', 'ah', 'aa'] },
  { vowel: 'ஆ', sign: 'ா', romanSuffix: 'aa', variants: ['aa', 'a', 'ah', 'aah'] },
  { vowel: 'இ', sign: 'ி', romanSuffix: 'i',  variants: ['i', 'ee', 'ih'] },
  { vowel: 'ஈ', sign: 'ீ', romanSuffix: 'ii', variants: ['ii', 'i', 'ee', 'eee'] },
  { vowel: 'உ', sign: 'ு', romanSuffix: 'u',  variants: ['u', 'oo', 'uh'] },
  { vowel: 'ஊ', sign: 'ூ', romanSuffix: 'uu', variants: ['uu', 'u', 'oo', 'ooh'] },
  { vowel: 'எ', sign: 'ெ', romanSuffix: 'e',  variants: ['e', 'eh', 'ae'] },
  { vowel: 'ஏ', sign: 'ே', romanSuffix: 'ee', variants: ['ee', 'e', 'eh', 'ay'] },
  { vowel: 'ஐ', sign: 'ை', romanSuffix: 'ai', variants: ['ai', 'eye', 'ae', 'i', 'ay'] },
  { vowel: 'ஒ', sign: 'ொ', romanSuffix: 'o',  variants: ['o', 'oh', 'aw'] },
  { vowel: 'ஓ', sign: 'ோ', romanSuffix: 'oo', variants: ['oo', 'o', 'oh', 'ooh'] },
  { vowel: 'ஔ', sign: 'ௌ', romanSuffix: 'au', variants: ['au', 'ow', 'ao', 'av', 'avu'] },
];

// ─── Build accepted-speech set for a letter ──────────────────────────────────
function buildAccepted(con, vow, group, charStr) {
  const set = new Set();
  set.add(charStr); // the Tamil character itself

  if (group === 'vowel') {
    set.add(vow.vowel);
    set.add(vow.romanSuffix);
    vow.variants.forEach(v => set.add(v));
  } else if (group === 'consonant') {
    set.add(con.base + VIRAMA);
    set.add(con.base);
    set.add(con.romanBase);
    con.variants.forEach(v => set.add(v));
  } else {
    // combined: consonant + vowel
    const roman = con.romanBase + vow.romanSuffix;
    set.add(roman);
    // consonant base variants × vowel suffix variants
    con.variants.forEach(cv => {
      set.add(cv + vow.romanSuffix);
      vow.variants.forEach(vv => set.add(cv + vv));
    });
    vow.variants.forEach(vv => set.add(con.romanBase + vv));
  }

  return Array.from(set).filter(Boolean);
}

// ─── Generate all 246 letters ────────────────────────────────────────────────
export function generateTamilLetters() {
  const letters = [];

  // 1. Standalone vowels (12)
  VOWEL_DATA.forEach((v, vi) => {
    letters.push({
      id: `vowel-${vi}`,
      char: v.vowel,
      romanized: v.romanSuffix,
      group: 'vowel',
      groupLabel: 'உயிர்',
      consonantIdx: null,
      vowelIdx: vi,
      acceptedSpeech: buildAccepted(null, v, 'vowel', v.vowel),
    });
  });

  // 2. Pure consonants (18) — base + virama
  CONSONANT_BASES.forEach((c, ci) => {
    const char = c.base + VIRAMA;
    letters.push({
      id: `consonant-${ci}`,
      char,
      romanized: c.romanBase,
      group: 'consonant',
      groupLabel: 'மெய்',
      consonantIdx: ci,
      vowelIdx: null,
      acceptedSpeech: buildAccepted(c, null, 'consonant', char),
    });
  });

  // 3. Combinations (216 = 18 × 12)
  CONSONANT_BASES.forEach((c, ci) => {
    VOWEL_DATA.forEach((v, vi) => {
      const char = c.base + v.sign;   // sign='' for 'a' → just the base consonant
      const roman = c.romanBase + v.romanSuffix;
      letters.push({
        id: `comb-${ci}-${vi}`,
        char,
        romanized: roman,
        group: 'combined',
        groupLabel: 'உயிர்மெய்',
        consonantIdx: ci,
        vowelIdx: vi,
        acceptedSpeech: buildAccepted(c, v, 'combined', char),
      });
    });
  });

  return letters;
}

// ─── Assess a transcription against a letter ─────────────────────────────────
export function assessPronunciation(rawTranscript, letter) {
  if (!rawTranscript) return false;
  const t = rawTranscript.toLowerCase().trim();
  if (!t) return false;

  // Direct Tamil character match (ta-IN STT returns Tamil text)
  if (rawTranscript.includes(letter.char)) return true;

  // Romanized match
  const roman = letter.romanized.toLowerCase();
  if (t === roman || t.startsWith(roman) || roman.startsWith(t)) return true;

  // Accepted variants
  return letter.acceptedSpeech.some(v => {
    const vl = v.toLowerCase();
    return t === vl || t.startsWith(vl) || vl.startsWith(t);
  });
}

// ─── Shuffle helper ──────────────────────────────────────────────────────────
export function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Pre-built full letter list (for import without calling the function each time)
export const ALL_TAMIL_LETTERS = generateTamilLetters();
