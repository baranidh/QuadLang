import { useState } from 'react';
import { useSpeech } from '../../hooks/useSpeech';

const AudioButton = ({ text, langCode, color, size = 'md' }) => {
  const { speak, speaking } = useSpeech();
  const [animating, setAnimating] = useState(false);
  const isPlaying = speaking === langCode;

  const handleClick = (e) => {
    e.stopPropagation();
    if (!text) return;
    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);
    speak(text, langCode);
  };

  const sizeMap = { sm: 'w-8 h-8 text-base', md: 'w-10 h-10 text-lg', lg: 'w-12 h-12 text-xl' };

  return (
    <button
      onClick={handleClick}
      title="Hear pronunciation"
      className={`
        inline-flex items-center justify-center rounded-full
        bg-white/90 hover:bg-white active:scale-90
        shadow transition-all duration-150 border-2
        ${sizeMap[size]}
        ${animating ? 'scale-125' : 'scale-100'}
      `}
      style={{ borderColor: color, color }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-4 h-4"
      >
        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.241 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06z" />
        {isPlaying && (
          <path d="M18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06zM15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.061z" />
        )}
      </svg>
    </button>
  );
};

export default AudioButton;
