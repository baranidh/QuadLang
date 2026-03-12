import { useState, useEffect } from 'react';
import { detectLanguage } from '../utils/detectLanguage';

const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';

const fetchTranslation = async (text, fromCode, toCode) => {
  if (fromCode === toCode) return text;
  const url = `${MYMEMORY_URL}?q=${encodeURIComponent(text)}&langpair=${fromCode}|${toCode}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (data.responseStatus !== 200) throw new Error(data.responseDetails || 'Translation failed');
  return data.responseData.translatedText;
};

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

    const run = async () => {
      // Step 1: Get English text (pivot language for best accuracy).
      // If source is already English, use input directly.
      const englishText = sourceLang === 'en'
        ? inputText
        : await fetchTranslation(inputText, sourceLang, 'en');

      // Step 2: Translate from English to remaining languages in parallel.
      // English→X pairs have the highest quality in MyMemory.
      const otherTargets = ['ta', 'zh', 'hi'];
      const otherResults = await Promise.all(
        otherTargets.map(async (target) => {
          const text = await fetchTranslation(englishText, 'en', target);
          return [target, text];
        })
      );

      return Object.fromEntries([['en', englishText], ...otherResults]);
    };

    run()
      .then((results) => {
        setTranslations(results);
        setLoading(false);
      })
      .catch(() => {
        setError('Translation service unavailable. Please try again.');
        setLoading(false);
      });
  }, [inputText]);

  return { translations, loading, error, detectedLang };
};
