import { useState } from 'react';
import TranslationInput from './TranslationInput';
import TranslationGrid from './TranslationGrid';
import { useTranslation } from '../../hooks/useTranslation';
import { useDebounce } from '../../hooks/useDebounce';

const TranslationPage = () => {
  const [inputText, setInputText] = useState('');
  const debouncedText = useDebounce(inputText, 600);
  const { translations, loading, error, detectedLang } = useTranslation(debouncedText);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Page title */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-gray-800 mb-2">
          ✏️ Type &amp; Translate
        </h2>
        <p className="text-gray-500 font-semibold">
          Type any word in any language — see it in all 4 languages instantly!
        </p>
      </div>

      {/* Input */}
      <TranslationInput
        value={inputText}
        onChange={setInputText}
        detectedLang={detectedLang}
      />

      {/* Translation cards grid */}
      {(inputText || loading) && (
        <TranslationGrid
          translations={translations}
          loading={loading && !!debouncedText}
          error={error}
        />
      )}

      {/* Empty state */}
      {!inputText && !loading && (
        <div className="mt-10 text-center">
          <div className="text-6xl mb-4">🌟</div>
          <p className="text-gray-400 font-semibold text-lg">
            Start typing above to see translations in Tamil, English, Mandarin and Hindi!
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {['🐱 Cat', '🍎 Apple', '☀️ Sun', '🏃 Run'].map((hint) => (
              <span key={hint} className="px-4 py-2 bg-gray-100 rounded-full text-gray-600 font-semibold text-sm">
                {hint}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslationPage;
