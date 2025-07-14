import { Check, Star } from 'lucide-react';

interface ProgressSectionProps {
  currentSurahId: number;
  completedSurahs: number[];
  completedTestingPhases: number[];
  onSurahSelect: (surahId: number) => void;
}

// Simple data for the two surahs we want to show
const progressSurahs = [
  { id: 96, name: "Al-Alaq", arabicName: "العلق", phases: 5 },
  { id: 97, name: "Al-Qadr", arabicName: "القدر", phases: 1 }
];

export const ProgressSection = ({ 
  currentSurahId, 
  completedSurahs, 
  completedTestingPhases,
  onSurahSelect 
}: ProgressSectionProps) => {
  
  const getPhaseStatus = (surahId: number, phaseIndex: number) => {
    const phaseId = surahId * 10 + phaseIndex + 1;
    if (completedTestingPhases.includes(phaseId)) return 'completed';
    if (surahId === currentSurahId) return 'current';
    return 'locked';
  };

  const getSurahStatus = (surahId: number) => {
    if (completedSurahs.includes(surahId)) return 'completed';
    if (surahId === currentSurahId) return 'current';
    return 'locked';
  };

  // Create curved path data for both surahs and their phases (ascending order)
  const createCurvedPath = () => {
    const items = [];
    
    // Start with Al-Alaq (العلق) at bottom - 5 phases + surah
    items.push({ type: 'surah', surahId: 96 });
    for (let i = 0; i < 5; i++) {
      items.push({ type: 'phase', surahId: 96, phaseIndex: i, number: i + 1 });
    }
    
    // Then Al-Qadr (القدر) - 1 phase + surah
    for (let i = 0; i < 1; i++) {
      items.push({ type: 'phase', surahId: 97, phaseIndex: i, number: i + 1 });
    }
    items.push({ type: 'surah', surahId: 97 });
    
    return items.reverse(); // Reverse to show Al-Alaq at bottom
  };

  const pathItems = createCurvedPath();

  return (
    <div className="h-full bg-gradient-to-b from-blue-50 to-purple-50 p-8 overflow-y-auto">
      <div className="max-w-md mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">رحلة الحفظ</h2>
        
        {/* Curved Progress Path */}
        <div className="relative w-full min-h-[600px]">
          {/* Curved connecting path */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
            <path
              d="M 150 500 Q 100 450 150 400 Q 200 350 150 300 Q 100 250 150 200 Q 200 150 150 100 Q 100 50 150 20"
              stroke="#d1d5db"
              strokeWidth="3"
              fill="none"
              className="opacity-60"
            />
          </svg>
          
          {pathItems.map((item, index) => {
            // Calculate curved positions
            const baseY = 500 - (index * 70);
            const zigzagOffset = index % 2 === 0 ? 0 : 50;
            const xPosition = 125 + zigzagOffset;
            
            if (item.type === 'phase') {
              const phaseStatus = getPhaseStatus(item.surahId, item.phaseIndex);
              
              return (
                <div
                  key={`phase-${item.surahId}-${item.phaseIndex}`}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ 
                    left: `${xPosition}px`, 
                    top: `${baseY}px`,
                    zIndex: 10
                  }}
                >
                  <div className={`w-12 h-12 rounded-full border-3 flex items-center justify-center transition-all shadow-lg ${
                    phaseStatus === 'completed' 
                      ? 'bg-green-400 border-green-500 text-white' 
                      : phaseStatus === 'current'
                      ? 'bg-orange-400 border-orange-500 text-white'
                      : 'bg-gray-200 border-gray-300 text-gray-600'
                  }`}>
                    <span className="text-sm font-bold">{item.number}</span>
                  </div>
                </div>
              );
            } else {
              // Surah circle
              const surah = progressSurahs.find(s => s.id === item.surahId);
              const surahStatus = getSurahStatus(item.surahId);
              const isClickable = surahStatus !== 'locked';
              
              return (
                <div
                  key={`surah-${item.surahId}`}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ 
                    left: `${xPosition}px`, 
                    top: `${baseY}px`,
                    zIndex: 20
                  }}
                >
                  <div 
                    className={`relative ${isClickable ? 'cursor-pointer' : ''}`}
                    onClick={() => isClickable && onSurahSelect(item.surahId)}
                  >
                    <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all shadow-xl ${
                      surahStatus === 'completed' 
                        ? 'bg-green-500 border-green-600 text-white' 
                        : surahStatus === 'current'
                        ? 'bg-blue-500 border-blue-600 text-white'
                        : 'bg-gray-300 border-gray-400 text-gray-700'
                    }`}>
                      <span className="text-xs font-bold text-center leading-tight font-arabic">
                        {surah?.arabicName}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
};