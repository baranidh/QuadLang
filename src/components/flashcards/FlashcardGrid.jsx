import FlashcardItem from './FlashcardItem';

const FlashcardGrid = ({ cards }) => {
  if (!cards || cards.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <div className="text-5xl mb-3">📭</div>
        <p className="font-semibold">No cards in this category yet!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <FlashcardItem key={card.id} card={card} />
      ))}
    </div>
  );
};

export default FlashcardGrid;
