import { LANGUAGES } from '../../constants/languages';

const Header = ({ activeTab, onTabChange }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Rainbow language color strip at top */}
      <div className="h-2 flex">
        {LANGUAGES.map((lang) => (
          <div key={lang.id} className="flex-1" style={{ backgroundColor: lang.color }} />
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-3xl">🌍</span>
            <div>
              <h1 className="text-2xl font-black text-gray-800 leading-none">
                Quad<span style={{ color: '#F97316' }}>L</span>
                <span style={{ color: '#3B82F6' }}>a</span>
                <span style={{ color: '#EF4444' }}>n</span>
                <span style={{ color: '#8B5CF6' }}>g</span>
              </h1>
              <p className="text-xs text-gray-500 font-semibold tracking-wide">
                Learn 4 Languages Together!
              </p>
            </div>
          </div>

          {/* Language flags strip */}
          <div className="hidden sm:flex items-center gap-1 text-sm text-gray-600 font-semibold">
            {LANGUAGES.map((lang, i) => (
              <span key={lang.id} className="flex items-center gap-1">
                <span>{lang.flag}</span>
                <span style={{ color: lang.color }}>{lang.label}</span>
                {i < LANGUAGES.length - 1 && <span className="text-gray-300 mx-1">·</span>}
              </span>
            ))}
          </div>

          {/* Nav tabs */}
          <nav className="flex gap-2 flex-wrap justify-center">
            <button
              onClick={() => onTabChange('translate')}
              className={`
                px-5 py-2 rounded-full font-bold text-sm transition-all duration-200
                ${activeTab === 'translate'
                  ? 'bg-blue-500 text-white shadow-md scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              ✏️ Translate
            </button>
            <button
              onClick={() => onTabChange('flashcards')}
              className={`
                px-5 py-2 rounded-full font-bold text-sm transition-all duration-200
                ${activeTab === 'flashcards'
                  ? 'bg-orange-500 text-white shadow-md scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              🃏 Flashcards
            </button>
            <button
              onClick={() => onTabChange('assessment')}
              className={`
                px-5 py-2 rounded-full font-bold text-sm transition-all duration-200
                ${activeTab === 'assessment'
                  ? 'bg-amber-500 text-white shadow-md scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              🎓 Assessment
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
