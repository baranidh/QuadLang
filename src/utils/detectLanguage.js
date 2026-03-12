/**
 * Detects the language of a given text string using Unicode script ranges.
 * Returns the MyMemory API language code.
 */
export const detectLanguage = (text) => {
  if (!text || text.trim().length === 0) return 'en';

  // Tamil: Unicode block \u0B80-\u0BFF
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';

  // Chinese (CJK Unified Ideographs): \u4E00-\u9FFF
  if (/[\u4E00-\u9FFF]/.test(text)) return 'zh';

  // Devanagari (Hindi): \u0900-\u097F
  if (/[\u0900-\u097F]/.test(text)) return 'hi';

  // Default: English
  return 'en';
};

/**
 * Returns a friendly language label given a MyMemory code.
 */
export const getLangLabel = (code) => {
  const labels = { ta: 'Tamil', en: 'English', zh: 'Mandarin', hi: 'Hindi' };
  return labels[code] || 'English';
};
