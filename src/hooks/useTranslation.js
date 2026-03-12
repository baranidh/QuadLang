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

    const targets = ['ta', 'en', 'zh', 'hi'];

    Promise.all(
      targets.map(async (target) => {
        const text = await fetchTranslation(inputText, sourceLang, target);
        return [target, text];
      })
    )
      .then((results) => {
        setTranslations(Object.fromEntries(results));
        setLoading(false);
      })
      .catch((err) => {
        setError('Translation service unavailable. Please try again.');
        setLoading(false);
      });
  }, [inputText]);

  return { translations, loading, error, detectedLang };
};
