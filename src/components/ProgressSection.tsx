import React from 'react';
import { ScrollArea } from './ui/scroll-area';
import { juz30Surahs } from '@/data/juz30';
import { Trophy, MapPin, Target, Star, Sparkles, Heart } from 'lucide-react';

// Define the data structures
export interface Phase {
  id: number;
  status: 'locked' | 'current' | 'completed' | 'completed-errors';
}

export interface Surah {
  id: number;
  name: string;
  arabicName: string;
  verses: number;
  phases: Phase[];
  status: 'locked' | 'current' | 'completed' | 'completed-errors';
}

// Create surah data with default status - journey starts from An-Nas (bottom) to Al-Naba (top)
const createSurahWithPhases = (surahData: typeof juz30Surahs[0], index: number): Surah => {
  const phaseCount = Math.max(2, Math.ceil(surahData.verses / 3));
  const phases: Phase[] = [];
  
  // Default: All phases locked except for the last surah (An-Nas) which is the starting point
  for (let i = 1; i <= phaseCount; i++) {
    let status: Phase['status'] = 'locked';
    if (index === juz30Surahs.length - 1) { // Last surah (An-Nas) - current starting point
      if (i === 1) status = 'current';
      else status = 'locked';
    }
    phases.push({ id: i, status });
  }

  // Default: Only last surah (An-Nas) is current, rest are locked
  let surahStatus: Surah['status'] = 'locked';
  if (index === juz30Surahs.length - 1) surahStatus = 'current'; // An-Nas is the starting point

  return {
    id: surahData.id,
    name: surahData.name,
    arabicName: surahData.arabicName,
    verses: surahData.verses,
    phases,
    status: surahStatus
  };
};

const quranData: Surah[] = juz30Surahs.map((surah, index) => createSurahWithPhases(surah, index));

interface CircleProps {
  status: 'locked' | 'current' | 'completed' | 'completed-errors';
  size: 'large' | 'small';
  children: React.ReactNode;
  onClick?: () => void;
  isSpecial?: boolean;
}

const Circle: React.FC<CircleProps> = ({ status, size, children, onClick, isSpecial = false }) => {
  const getStatusColors = () => {
    if (isSpecial && status === 'current') {
      return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg ring-2 ring-blue-200';
    }
    
    switch (status) {
      case 'current':
        return 'bg-blue-500 text-white shadow-md';
      case 'completed':
        return 'bg-green-500 text-white shadow-md';
      case 'completed-errors':
        return 'bg-orange-500 text-white shadow-md';
      default:
        return 'bg-gray-300 text-gray-600';
    }
  };

  const sizeClasses = size === 'large' 
    ? 'w-14 h-14 text-xs' 
    : 'w-5 h-5 text-xs';

  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClasses} 
        ${getStatusColors()}
        rounded-full flex items-center justify-center
        transition-all duration-200 hover:scale-105 relative font-medium z-10
        ${status !== 'locked' ? 'cursor-pointer hover:shadow-lg' : 'cursor-not-allowed'}
        ${status === 'current' ? 'ring-2 ring-blue-300' : ''}
      `}
      disabled={status === 'locked'}
      style={{ pointerEvents: status === 'locked' ? 'none' : 'auto' }}
    >
      {children}
    </button>
  );
};

interface SurahNodeProps {
  surah: Surah;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onSurahSelect?: (surah: Surah) => void;
  onPhaseSelect?: (surah: Surah, phase: Phase) => void;
}

const SurahNode: React.FC<SurahNodeProps> = ({ 
  surah, 
  index, 
  isFirst, 
  isLast, 
  onSurahSelect, 
  onPhaseSelect 
}) => {
  const isCurrentSurah = surah.status === 'current';

  return (
    <div className="relative flex flex-col items-center mb-3">
      {/* Vertical line connection (except for first item) */}
      {!isFirst && (
        <div className="w-0.5 h-4 bg-gray-300 mb-1.5"></div>
      )}
      
      {/* Phase circles above surah (for completed surahs) - visually ascending */}
      {surah.phases.length > 0 && surah.status !== 'locked' && (
        <div className="flex flex-col items-center gap-0.5 mb-1.5">
          {surah.phases.slice(0, 4).reverse().map((phase, phaseIndex) => (
            <React.Fragment key={phase.id}>
              <div className="w-0.5 h-2 bg-gray-200"></div>
              <Circle
                status={phase.status}
                size="small"
                onClick={() => onPhaseSelect?.(surah, phase)}
              >
                {phase.id}
              </Circle>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Main Surah Circle */}
      <div className="relative flex flex-col items-center" data-current={isCurrentSurah}>
        <Circle
          status={surah.status}
          size="large"
          onClick={() => onSurahSelect?.(surah)}
          isSpecial={isCurrentSurah}
        >
          <div className="text-center leading-tight px-1">
            <div className="font-semibold text-xs">{surah.arabicName}</div>
          </div>
        </Circle>
        
        {/* Surah name in English - smaller and closer */}
        <div className="text-xs text-gray-500 mt-1 text-center font-normal">
          {surah.name}
        </div>
        
        {/* "You are here" indicator for current surah */}
        {isCurrentSurah && (
          <div className="absolute -right-20 top-1/2 transform -translate-y-1/2 flex items-center">
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-2 rounded-2xl text-xs font-bold shadow-2xl animate-pulse border-2 border-white/30">
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 animate-spin" />
                  أنت هنا!
                </div>
              </div>
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
            </div>
            <div className="w-0 h-0 border-t-4 border-b-4 border-r-6 border-transparent border-r-purple-600 -ml-1"></div>
          </div>
        )}
      </div>
    </div>
  );
};

interface LearningPathProps {
  onSurahSelect?: (surah: Surah) => void;
  onPhaseSelect?: (surah: Surah, phase: Phase) => void;
}

export const ProgressSection: React.FC<LearningPathProps> = ({ 
  onSurahSelect, 
  onPhaseSelect 
}) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  
  // Auto-scroll to current surah on mount
  React.useEffect(() => {
    const currentSurahElement = scrollRef.current?.querySelector('[data-current="true"]');
    if (currentSurahElement) {
      currentSurahElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, []);
  // Calculate progress based on completed surahs and phases
  const calculateProgress = () => {
    const totalSurahs = quranData.length;
    const completedSurahs = quranData.filter(s => s.status === 'completed' || s.status === 'completed-errors').length;
    
    // For current surah, count completed phases
    const currentSurah = quranData.find(s => s.status === 'current');
    let completedPhasesInCurrentSurah = 0;
    let totalPhasesInCurrentSurah = 0;
    
    if (currentSurah) {
      totalPhasesInCurrentSurah = currentSurah.phases.length;
      completedPhasesInCurrentSurah = currentSurah.phases.filter(p => 
        p.status === 'completed' || p.status === 'completed-errors'
      ).length;
    }
    
    // Calculate total progress
    const progressFromCompletedSurahs = (completedSurahs / totalSurahs) * 100;
    const progressFromCurrentSurah = currentSurah ? 
      (completedPhasesInCurrentSurah / totalPhasesInCurrentSurah) * (1 / totalSurahs) * 100 : 0;
    
    return Math.round(progressFromCompletedSurahs + progressFromCurrentSurah);
  };

  const progressPercentage = calculateProgress();
  
  return (
    <div className="w-full h-full bg-gradient-to-b from-blue-50 to-purple-50 relative overflow-hidden">
      {/* Enhanced Goal Section for Kids */}
      <div className="p-3 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 relative z-40 overflow-hidden">
        {/* Simplified Floating Animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Star className="absolute top-2 right-6 w-2 h-2 text-white/30 animate-pulse" />
          <Sparkles className="absolute bottom-2 left-6 w-3 h-3 text-white/40 animate-bounce" />
        </div>

        <div className="relative space-y-2">
          {/* Compact Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
          
              <div className="text-white font-bold text-sm">
                🌟 رحلتك نحو حفظ جزء عمَّ 🌟
              </div>
            </div>
          
          </div>

           {/* Ultimate Goal Trophy */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl animate-rainbow-glow animate-float border-4 border-white/30">
                <Trophy className="w-8 h-8 text-white animate-bounce" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                <Star className="w-2 h-2 text-white animate-sparkle" />
              </div>
            </div>
           
          </div> 
          
          {/* Compact Progress Section */}
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 space-y-2 shadow-lg">
            {/* Progress Stats - Simplified */}
            <div className="flex justify-between items-center text-center">
              <div>
                <div className="text-white font-bold text-base">
                  {quranData.filter(s => s.status === 'completed' || s.status === 'completed-errors').length}
                </div>
                <div className="text-white/80 text-xs">مكتملة</div>
              </div>
              
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-white animate-spin" />
                <div className="text-right">
                  <div className="text-white font-bold text-lg">
                    {progressPercentage}%
                  </div>
                  <div className="text-white/80 text-xs">تقدمك</div>
                </div>
              </div>
              
              <div>
                <div className="text-white font-bold text-base">37</div>
                <div className="text-white/80 text-xs">المجموع</div>
              </div>
            </div>
            
            {/* Compact Progress Bar */}
            <div className="space-y-1">
              <div className="text-center">
                <div className="text-white/90 text-xs font-medium">
                  {progressPercentage < 25 ? "🌱 بداية موفقة!" : 
                   progressPercentage < 50 ? "🚀 تقدم ممتاز!" :
                   progressPercentage < 75 ? "⭐ أنت رائع!" : 
                   "👑 مبارك عليك!"}
                </div>
              </div>
              
              <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 h-2 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                  style={{ width: `${progressPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scrollable Journey Path */}
      <ScrollArea className="h-[calc(100vh-120px)] relative">
        <div ref={scrollRef} className="flex flex-col items-center py-3 px-4 min-h-full">
        

          {/* Vertical Journey Path */}
          <div className="relative flex flex-col items-center">
            {quranData.map((surah, index) => (
              <SurahNode
                key={surah.id}
                surah={surah}
                index={index}
                isFirst={index === 0}
                isLast={index === quranData.length - 1}
                onSurahSelect={onSurahSelect}
                onPhaseSelect={onPhaseSelect}
              />
            ))}
          </div>

          {/* Start indicator at the bottom */}
          <div className="flex flex-col items-center mt-2 pb-6">
            <div className="w-0.5 h-6 bg-gray-300 mb-2"></div>
            <div className="relative">
              <div className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 text-white px-4 py-3 rounded-2xl shadow-xl animate-pulse">
                <div className="text-sm font-bold text-center">🚀 ابدأ رحلتك!</div>
                <div className="text-xs text-center opacity-90">Start Your Journey!</div>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
      

    </div>
  );
};