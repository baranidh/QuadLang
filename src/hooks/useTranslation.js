import { useState, useEffect } from 'react';
import { detectLanguage } from '../utils/detectLanguage';

// ── API 1: Google Translate (unofficial, best quality) ──────────────────────
const googleTranslate = async (text, targetCode) => {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetCode}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google HTTP ${res.status}`);
  const data = await res.json();
  const result = data[0].map(chunk => chunk[0]).join('').trim();
  if (!result) throw new Error('Empty response');
  return result;
};

// ── API 2: MyMemory (fallback, pivot via English) ───────────────────────────
const myMemoryTranslate = async (text, sourceLang, targetCode) => {
  // Pivot: non-English → English → target (better quality than direct pairs)
  const pivot = sourceLang === 'en' ? text
    : await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|en`)
        .then(r => r.json()).then(d => d.responseData.translatedText);

  if (targetCode === 'en') return pivot;

  const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(pivot)}&langpair=en|${targetCode}`);
  const data = await res.json();
  return data.responseData.translatedText;
};

// ── Per-language translation with fallback ─────────────────────────────────
const translateOne = async (text, sourceLang, googleCode, myMemoryCode) => {
  try {
    return await googleTranslate(text, googleCode);
  } catch {
    // Fallback to MyMemory
    return await myMemoryTranslate(text, sourceLang, myMemoryCode);
  }
};

// Google code → MyMemory code map
const TARGETS = [
  { key: 'ta', googleCode: 'ta',    myMemoryCode: 'ta' },
  { key: 'en', googleCode: 'en',    myMemoryCode: 'en' },
  { key: 'zh', googleCode: 'zh-CN', myMemoryCode: 'zh' },
  { key: 'hi', googleCode: 'hi',    myMemoryCode: 'hi' },
];

export const useTranslation = (inputText) => {
  const [translations, setTranslations] = useState({ ta: '', en: '', zh: '', hi: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detectedLang, setDetectedLang] = useState('en');

  useEffect(() => {
    if (!inputText || inputText.trim().length < 1) {
      setTranslations({ ta: '', en: '', zh: '', hi: '' });
      setError(null);
      return;
    }

    const sourceLang = detectLanguage(inputText);
    setDetectedLang(sourceLang);
    setLoading(true);
    setError(null);

    // Translate all 4 languages in parallel; each has its own Google→MyMemory fallback.
    Promise.allSettled(
      TARGETS.map(async ({ key, googleCode, myMemoryCode }) => {
        const text = await translateOne(inputText, sourceLang, googleCode, myMemoryCode);
        return [key, text];
      })
    ).then((results) => {
      const translations = {};
      let anyFailed = false;
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const [key, text] = result.value;
          translations[key] = text;
        } else {
          anyFailed = true;
        }
      });
      setTranslations(prev => ({ ...prev, ...translations }));
      setError(anyFailed ? 'Some translations failed. Please check your connection.' : null);
      setLoading(false);
    });
  }, [inputText]);

  return { translations, loading, error, detectedLang };
};
