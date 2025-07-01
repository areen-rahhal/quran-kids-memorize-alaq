
interface VerseDisplayProps {
  phaseVerseObjs: Array<{id: number, arabic: string}>;
  currentPhaseIdx: number;
  totalPhases: number;
  currentAyahIdx?: number;
  isPlaying?: boolean;
  highlightedWords?: string[];
  expectedText?: string;
  isListening?: boolean;
}

export const VerseDisplay = ({ 
  phaseVerseObjs, 
  currentPhaseIdx, 
  totalPhases, 
  currentAyahIdx = -1,
  isPlaying = false,
  highlightedWords = [],
  expectedText = '',
  isListening = false
}: VerseDisplayProps) => {
  
  // Helper function to normalize Arabic text for comparison
  const normalizeArabicText = (text: string) => {
    return text
      .replace(/[َُِّْ]/g, '')
      .replace(/[ًٌٍ]/g, '')
      .replace(/[آأإٱ]/g, 'ا')
      .replace(/[ىئي]/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  };

  // Check if a word should be highlighted
  const isWordHighlighted = (word: string) => {
    if (!isListening || highlightedWords.length === 0) return false;
    
    const normalizedWord = normalizeArabicText(word);
    return highlightedWords.some(highlightedWord => {
      const normalizedHighlighted = normalizeArabicText(highlightedWord);
      return normalizedWord.includes(normalizedHighlighted) || 
             normalizedHighlighted.includes(normalizedWord);
    });
  };

  const continuousArabic = (
    <span className="flex flex-wrap gap-x-1 gap-y-2 justify-center items-baseline font-arabic text-gray-900 bg-white rounded-xl text-[0.91rem] md:text-base leading-relaxed" dir="rtl">
      {phaseVerseObjs.map((v, index) => {
        const isCurrentAyah = isPlaying && index === currentAyahIdx;
        
        // Split verse into words for individual highlighting
        const words = v.arabic.split(' ');
        
        return (
          <span key={v.id} className="inline-flex items-baseline" dir="rtl">
            <span
              className={`font-arabic px-0.5 transition-all duration-300 ${
                isCurrentAyah 
                  ? 'bg-green-200 text-green-800 rounded-md shadow-sm' 
                  : ''
              }`}
              style={{
                fontWeight: 700,
                letterSpacing: '0.06em',
                wordSpacing: '0.21em',
              }}
            >
              {words.map((word, wordIndex) => {
                const shouldHighlight = isCurrentAyah && isWordHighlighted(word);
                return (
                  <span
                    key={wordIndex}
                    className={`transition-all duration-300 ${
                      shouldHighlight 
                        ? 'bg-blue-300 text-blue-900 rounded px-1 shadow-sm animate-pulse' 
                        : ''
                    }`}
                  >
                    {word}
                    {wordIndex < words.length - 1 && ' '}
                  </span>
                );
              })}
            </span>
            <span
              className={`inline-flex items-center justify-center bg-white border px-1 mx-1 text-lg font-extrabold rounded-full shadow-sm relative -top-0.5 transition-all duration-300 ${
                isCurrentAyah 
                  ? 'border-green-400 bg-green-50' 
                  : 'border-amber-300'
              }`}
              style={{
                minWidth: 30,
                minHeight: 30,
                fontFamily: 'Amiri, serif',
                fontSize: '1.23em',
                marginRight: '0.30em',
                marginLeft: '0.10em'
              }}
              aria-label={`تمت آية رقم ${v.id}`}
            >
              <span
                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
                style={{ fontSize: '1.48em', color: '#34d399', opacity: 0.22 }}
              >۝</span>
              <span 
                className={`relative z-10 font-bold text-xs md:text-base transition-colors duration-300 ${
                  isCurrentAyah ? 'text-green-600' : 'text-amber-600'
                }`} 
                style={{fontFamily:'Amiri,serif'}}
              >
                {v.id}
              </span>
            </span>
          </span>
        );
      })}
      {currentPhaseIdx === totalPhases - 1 && (
        <span className="mx-1 text-emerald-700 text-lg" style={{ fontWeight: 900 }}>۩</span>
      )}
    </span>
  );

  return (
    <div className="w-full items-center justify-center text-center overflow-x-auto">
      {continuousArabic}
      {isListening && (
        <div className="mt-2 text-xs text-blue-600 font-arabic animate-pulse">
          🎤 جاري التسجيل... الكلمات المضيئة تم سماعها
        </div>
      )}
    </div>
  );
};
