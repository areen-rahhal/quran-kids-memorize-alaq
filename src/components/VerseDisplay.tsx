
interface VerseDisplayProps {
  phaseVerseObjs: Array<{id: number, arabic: string}>;
  currentPhaseIdx: number;
  totalPhases: number;
  currentAyahIdx?: number;
  isPlaying?: boolean;
  highlightedWords?: string[];
  expectedText?: string;
  isListening?: boolean;
  recitingMode?: 'learning' | 'testing';
  revealedTestingVerses?: number[];
  currentStep?: string;
}

export const VerseDisplay = ({ 
  phaseVerseObjs, 
  currentPhaseIdx, 
  totalPhases, 
  currentAyahIdx = -1,
  isPlaying = false,
  highlightedWords = [],
  expectedText = '',
  isListening = false,
  recitingMode = 'learning',
  revealedTestingVerses = [],
  currentStep = ''
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

  // Enhanced word highlighting check with better matching
  const isWordHighlighted = (word: string) => {
    if (!isListening || highlightedWords.length === 0) return false;
    
    const normalizedWord = normalizeArabicText(word);
    return highlightedWords.some(highlightedWord => {
      const normalizedHighlighted = normalizeArabicText(highlightedWord);
      // More strict matching for better accuracy
      return normalizedWord === normalizedHighlighted || 
             (normalizedWord.length > 2 && normalizedHighlighted.length > 2 && 
              (normalizedWord.includes(normalizedHighlighted) || normalizedHighlighted.includes(normalizedWord)));
    });
  };

  // Render verses based on mode
  const renderVerses = () => {
    if (recitingMode === 'learning') {
      // In learning mode, show all verses
      return (
        <span className="flex flex-wrap gap-x-1 gap-y-2 justify-center items-baseline font-arabic text-gray-900 bg-white rounded-xl text-[0.91rem] md:text-base leading-relaxed" dir="rtl">
          {phaseVerseObjs.map((v, index) => {
            const isCurrentAyah = isPlaying && index === currentAyahIdx;
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
                        className={`transition-all duration-500 ${
                          shouldHighlight 
                            ? 'bg-blue-400 text-white rounded-md px-1.5 py-0.5 shadow-lg transform scale-105 animate-pulse ring-2 ring-blue-300' 
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
    } else {
      // In testing mode, show only revealed verses or placeholder
      return (
        <div className="space-y-4">
          {phaseVerseObjs.map((v, index) => {
            const isRevealed = revealedTestingVerses.includes(v.id);
            const isCurrentAyah = currentStep === 'testing' && index === currentAyahIdx;
            
            if (isRevealed) {
              // Show revealed verse with success animation
              const words = v.arabic.split(' ');
              return (
                <div key={v.id} className="animate-fade-in">
                  <span className="flex flex-wrap gap-x-1 gap-y-2 justify-center items-baseline font-arabic text-gray-900 bg-green-50 border-2 border-green-300 rounded-xl text-[0.91rem] md:text-base leading-relaxed p-3" dir="rtl">
                    <span className="inline-flex items-baseline" dir="rtl">
                      <span
                        className="font-arabic px-0.5 text-green-800"
                        style={{
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          wordSpacing: '0.21em',
                        }}
                      >
                        {words.map((word, wordIndex) => (
                          <span key={wordIndex}>
                            {word}
                            {wordIndex < words.length - 1 && ' '}
                          </span>
                        ))}
                      </span>
                      <span
                        className="inline-flex items-center justify-center bg-green-100 border border-green-400 px-1 mx-1 text-lg font-extrabold rounded-full shadow-sm relative -top-0.5"
                        style={{
                          minWidth: 30,
                          minHeight: 30,
                          fontFamily: 'Amiri, serif',
                          fontSize: '1.23em',
                          marginRight: '0.30em',
                          marginLeft: '0.10em'
                        }}
                      >
                        <span 
                          className="relative z-10 font-bold text-xs md:text-base text-green-600" 
                          style={{fontFamily:'Amiri,serif'}}
                        >
                          {v.id}
                        </span>
                      </span>
                    </span>
                  </span>
                </div>
              );
            } else if (isCurrentAyah) {
              // Show placeholder for current verse being recited
              return (
                <div key={v.id} className="text-center">
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 animate-pulse">
                    <span className="text-2xl">🎤</span>
                    <div className="mt-2 text-blue-600 font-arabic text-lg">
                      جاري انتظار تلاوة الآية رقم {v.id}
                    </div>
                  </div>
                </div>
              );
            } else {
              // Show hidden placeholder
              return (
                <div key={v.id} className="text-center">
                  <div className="bg-gray-100 border-2 border-gray-300 rounded-xl p-4 opacity-50">
                    <span className="text-gray-500 font-arabic">آية رقم {v.id} - مخفية</span>
                  </div>
                </div>
              );
            }
          })}
        </div>
      );
    }
  };

  const continuousArabic = renderVerses();

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
