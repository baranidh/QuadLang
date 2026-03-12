import { useState } from 'react';
import CategoryTabs from './CategoryTabs';
import FlashcardGrid from './FlashcardGrid';
import { FLASHCARD_DATA, CATEGORIES } from '../../constants/flashcardData';

const FlashcardPage = () => {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const cards = FLASHCARD_DATA[activeCategory] || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page title */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-gray-800 mb-2">
          🃏 Flashcards
        </h2>
        <p className="text-gray-500 font-semibold">
          Tap a card to see how to say it in all 4 languages — then press 🔊 to hear it!
        </p>
      </div>

      {/* Category tabs */}
      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Card count */}
      <div className="flex items-center justify-between mb-4 px-1">
        <p className="text-sm text-gray-500 font-semibold">
          {cards.length} cards in <span className="text-orange-500">{activeCategory}</span>
        </p>
        <p className="text-xs text-gray-400 font-medium">
          Tap any card to flip it!
        </p>
      </div>

      {/* Flashcard grid */}
      <FlashcardGrid cards={cards} />

      {/* Footer hint */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-sm border border-gray-200">
          <span className="text-2xl">💡</span>
          <p className="text-sm font-semibold text-gray-600">
            Tip: Press the <strong>🔊 speaker</strong> button to hear the word in each language!
          </p>
        </div>
      </div>
    </div>
  );
};

export default FlashcardPage;
