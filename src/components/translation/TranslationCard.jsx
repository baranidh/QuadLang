import AudioButton from '../shared/AudioButton';
import LoadingSpinner from '../shared/LoadingSpinner';

const TranslationCard = ({ language, translatedText, isLoading }) => {
  const { label, nativeLabel, color, bgColor, borderColor, langCode, flag } = language;

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-md border-2 transition-all duration-300 hover:shadow-lg flex flex-col min-h-[140px]"
      style={{ borderColor, backgroundColor: bgColor }}
    >
      {/* Card header */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ backgroundColor: color }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{flag}</span>
          <div>
            <span className="text-white font-black text-base">{label}</span>
            <span className="text-white/70 text-xs ml-2">{nativeLabel}</span>
          </div>
        </div>
        {translatedText && !isLoading && (
          <AudioButton
            text={translatedText}
            langCode={langCode}
            color={color}
            size="sm"
          />
        )}
      </div>

      {/* Card body */}
      <div className="flex-1 flex items-center justify-center px-5 py-4">
        {isLoading ? (
          <LoadingSpinner color={color} />
        ) : translatedText ? (
          <p
            className="text-2xl font-bold text-center text-gray-800 leading-relaxed"
            lang={langCode}
          >
            {translatedText}
          </p>
        ) : (
          <p className="text-gray-400 text-center text-sm font-medium">
            Translation will appear here
          </p>
        )}
      </div>
    </div>
  );
};

export default TranslationCard;
