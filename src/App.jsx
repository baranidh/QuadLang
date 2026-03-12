import { useState } from 'react';
import Header from './components/layout/Header';
import TranslationPage from './components/translation/TranslationPage';
import FlashcardPage from './components/flashcards/FlashcardPage';
import { LANGUAGES } from './constants/languages';

const App = () => {
  const [activeTab, setActiveTab] = useState('translate');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main>
        {activeTab === 'translate' ? <TranslationPage /> : <FlashcardPage />}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          {/* Color language strip */}
          <div className="flex justify-center gap-4 mb-3">
            {LANGUAGES.map((lang) => (
              <span
                key={lang.id}
                className="text-sm font-bold px-3 py-1 rounded-full text-white"
                style={{ backgroundColor: lang.color }}
              >
                {lang.flag} {lang.label}
              </span>
            ))}
          </div>
          <p className="text-gray-400 text-sm font-semibold">
            🌍 QuadLang — Learn Tamil, English, Mandarin &amp; Hindi Together!
          </p>
          <p className="text-gray-300 text-xs mt-1">
            Translations by MyMemory API · Audio by Web Speech API · 100% Free
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
