import { LANGUAGES, MEMORY_CODE_MAP } from '../../constants/languages';
import { getLangLabel } from '../../utils/detectLanguage';

const TranslationInput = ({ value, onChange, detectedLang }) => {
  const langInfo = MEMORY_CODE_MAP[detectedLang];
  const borderColor = langInfo?.color || '#3B82F6';
  const bgColor = langInfo?.bgColor || '#EFF6FF';

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Detected language badge */}
      <div className="flex items-center justify-between mb-2 px-1">
        <label className="text-sm font-bold text-gray-600">
          Type anything in any language...
        </label>
        {value && detectedLang && (
          <span
            className="text-xs font-bold px-3 py-1 rounded-full text-white transition-all duration-300"
            style={{ backgroundColor: borderColor }}
          >
            Detected: {getLangLabel(detectedLang)} {langInfo?.flag}
          </span>
        )}
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type a word or sentence... (e.g. Cat / பூனை / 猫 / बिल्ली)"
          rows={3}
          className="
            w-full rounded-2xl p-4 text-xl font-semibold text-gray-800
            border-4 outline-none resize-none shadow-sm
            transition-all duration-300 placeholder:text-gray-400
            placeholder:text-base placeholder:font-normal
          "
          style={{
            borderColor,
            backgroundColor: bgColor,
          }}
        />

        {/* Clear button */}
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300
              flex items-center justify-center text-gray-500 font-bold text-sm
              transition-all duration-150"
          >
            ✕
          </button>
        )}
      </div>

      {/* Quick-tap language buttons hint */}
      <div className="flex flex-wrap gap-2 mt-3 justify-center">
        {[
          { text: 'cat', label: 'English' },
          { text: 'பூனை', label: 'Tamil' },
          { text: '猫', label: 'Mandarin' },
          { text: 'बिल्ली', label: 'Hindi' },
        ].map(({ text, label }) => (
          <button
            key={text}
            onClick={() => onChange(text)}
            className="px-3 py-1 rounded-full text-sm font-semibold bg-white border-2 border-gray-200
              hover:border-gray-400 hover:shadow-sm text-gray-700 transition-all duration-150"
          >
            Try: <span className="font-bold">{text}</span>
            <span className="text-gray-400 text-xs ml-1">({label})</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TranslationInput;
