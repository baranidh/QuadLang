import TranslationCard from './TranslationCard';
import { LANGUAGES } from '../../constants/languages';

const TranslationGrid = ({ translations, loading, error }) => {
  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-center">
        <span className="text-2xl">😕</span>
        <p className="text-red-600 font-semibold mt-1">{error}</p>
        <p className="text-red-400 text-sm mt-1">Check your internet connection and try again.</p>
      </div>
    );
  }

  return (
    <div className="w-full mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {LANGUAGES.map((lang) => (
        <TranslationCard
          key={lang.id}
          language={lang}
          translatedText={translations[lang.memoryCode]}
          isLoading={loading}
        />
      ))}
    </div>
  );
};

export default TranslationGrid;
