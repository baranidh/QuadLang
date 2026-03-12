import { useState } from 'react';
import AudioButton from '../shared/AudioButton';
import { LANGUAGES } from '../../constants/languages';

const FlashcardItem = ({ card }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="card-wrapper cursor-pointer select-none"
      style={{ height: '220px' }}
      onClick={() => setFlipped((f) => !f)}
      title={flipped ? 'Click to flip back' : 'Click to see translations!'}
    >
      <div className={`card-inner ${flipped ? 'flipped' : ''}`}>
        {/* FRONT: Emoji + English label */}
        <div className="card-front bg-white rounded-2xl border-2 border-gray-200 shadow-md
          flex flex-col items-center justify-center p-4 hover:shadow-lg transition-shadow duration-200">
          <span className="text-7xl leading-none mb-3 drop-shadow">{card.emoji}</span>
          <span className="text-lg font-black text-gray-700">{card.english}</span>
          <span className="text-xs text-gray-400 font-semibold mt-1">Tap to learn!</span>
        </div>

        {/* BACK: All 4 language translations */}
        <div className="card-back bg-gradient-to-br from-orange-50 to-purple-50 rounded-2xl
          border-2 border-orange-200 shadow-md overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Back header */}
            <div className="text-center py-1.5 text-base font-bold text-gray-500 border-b border-gray-200 bg-white/60">
              {card.emoji}
            </div>

            {/* Language rows */}
            <div className="flex-1 flex flex-col justify-around px-3 py-1">
              {LANGUAGES.map((lang) => {
                const text = card[lang.id];
                return (
                  <div key={lang.id} className="flex items-center justify-between gap-2 py-0.5">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      {/* Color dot */}
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: lang.color }}
                      />
                      {/* Language name */}
                      <span
                        className="text-xs font-bold flex-shrink-0 w-14"
                        style={{ color: lang.color }}
                      >
                        {lang.label}
                      </span>
                      {/* Translation text */}
                      <span
                        className="text-sm font-black text-gray-800 truncate"
                        lang={lang.langCode}
                      >
                        {text}
                      </span>
                    </div>
                    {/* Audio button */}
                    <AudioButton
                      text={text}
                      langCode={lang.langCode}
                      color={lang.color}
                      size="sm"
                    />
                  </div>
                );
              })}
            </div>

            <div className="text-center py-1 text-xs text-gray-400 font-semibold bg-white/60 border-t border-gray-100">
              Tap to flip back
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardItem;
