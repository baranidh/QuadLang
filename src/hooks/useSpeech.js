import { useState, useCallback } from 'react';

export const useSpeech = () => {
  const [speaking, setSpeaking] = useState(null); // stores langCode currently speaking

  const speak = useCallback((text, langCode) => {
    if (!text || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 0.85;  // Slightly slower for kids
    utterance.pitch = 1.1;  // Slightly higher pitch for friendliness

    utterance.onstart = () => setSpeaking(langCode);
    utterance.onend = () => setSpeaking(null);
    utterance.onerror = () => setSpeaking(null);

    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(null);
  }, []);

  return { speak, stop, speaking };
};
