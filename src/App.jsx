import { useState } from 'react';
import Header from './components/layout/Header';
import TranslationPage from './components/translation/TranslationPage';
import FlashcardPage from './components/flashcards/FlashcardPage';
import TamilAssessmentPage from './components/assessment/TamilAssessmentPage';
import { LANGUAGES } from './constants/languages';

const App = () => {
  const [activeTab, setActiveTab] = useState('translate');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hide the shared header when in assessment (it has its own full-screen layout) */}
      {activeTab !== 'assessment' && (
        <Header activeTab={activeTab} onTabChange={setActiveTab} />
      )}
      {activeTab === 'assessment' && (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-end p-3 pointer-events-none">
          <button
            onClick={() => setActiveTab('translate')}
            className="pointer-events-auto bg-white shadow-lg border border-gray-200
                       rounded-full px-4 py-2 text-sm font-bold text-gray-600
                       hover:bg-gray-50 transition-all"
          >
            ← Back to QuadLang
          </button>
        </div>
      )}

      <main>
        {activeTab === 'translate'  && <TranslationPage />}
        {activeTab === 'flashcards' && <FlashcardPage />}
        {activeTab === 'assessment' && <TamilAssessmentPage />}
      </main>

      {/* Footer — hidden on assessment page which has its own layout */}
      {activeTab !== 'assessment' && (
        <footer className="mt-12 border-t border-gray-200 bg-white py-6">
          <div className="max-w-6xl mx-auto px-4 text-center">
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
      )}
    </div>
  );
};

export default App;
