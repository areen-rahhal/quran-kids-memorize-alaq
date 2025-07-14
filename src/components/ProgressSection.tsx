import { Check, Star } from 'lucide-react';

interface ProgressSectionProps {
  currentSurahId: number;
  completedSurahs: number[];
  completedTestingPhases: number[];
  onSurahSelect: (surahId: number) => void;
}

// Simple data for the two surahs we want to show
const progressSurahs = [
  { id: 97, name: "Al-Qadr", arabicName: "القدر", phases: 1 },
  { id: 96, name: "Al-Alaq", arabicName: "العلق", phases: 4 }
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

  return (
    <div className="h-full bg-gradient-to-b from-blue-50 to-purple-50 p-8 overflow-y-auto">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">رحلة الحفظ</h2>
        
        {/* Progress Path */}
        <div className="relative flex flex-col items-center space-y-6">
          {/* Vertical connecting line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gray-300 rounded-full" />
          
          {progressSurahs.map((surah, surahIndex) => {
            const surahStatus = getSurahStatus(surah.id);
            const isClickable = surahStatus !== 'locked';
            
            return (
              <div key={surah.id} className="relative z-10 flex flex-col items-center space-y-3">
                {/* Phases - Small circles above the surah */}
                <div className="flex flex-col items-center space-y-2">
                  {Array.from({ length: surah.phases }, (_, phaseIndex) => {
                    const phaseStatus = getPhaseStatus(surah.id, phaseIndex);
                    return (
                      <div
                        key={phaseIndex}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          phaseStatus === 'completed' 
                            ? 'bg-green-400 border-green-500' 
                            : 'bg-gray-200 border-gray-300'
                        }`}
                      >
                        {phaseStatus === 'completed' && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Surah - Big circle */}
                <div 
                  className={`relative z-20 ${isClickable ? 'cursor-pointer' : ''}`}
                  onClick={() => isClickable && onSurahSelect(surah.id)}
                >
                  <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all shadow-lg ${
                    surahStatus === 'completed' 
                      ? 'bg-green-500 border-green-600' 
                      : surahStatus === 'current'
                      ? 'bg-blue-500 border-blue-600'
                      : 'bg-gray-300 border-gray-400'
                  }`}>
                    {surahStatus === 'completed' ? (
                      <Check className="w-6 h-6 text-white" />
                    ) : surahStatus === 'current' ? (
                      <Star className="w-6 h-6 text-white" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white opacity-60" />
                    )}
                  </div>
                  
                  {/* Surah label */}
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center">
                    <p className="text-sm font-bold text-gray-800 font-arabic">{surah.arabicName}</p>
                    <p className="text-xs text-gray-600">{surah.name}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};