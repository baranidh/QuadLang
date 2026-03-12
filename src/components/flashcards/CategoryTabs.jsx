import { CATEGORIES } from '../../constants/flashcardData';

const CategoryTabs = ({ activeCategory, onCategoryChange }) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-6">
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm
              transition-all duration-200 border-2
              ${isActive
                ? 'bg-orange-500 border-orange-500 text-white shadow-md scale-105'
                : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600'
              }
            `}
          >
            <span className="text-base">{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryTabs;
