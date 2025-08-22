import React from 'react';
import { ScrollArea } from './ui/scroll-area';
import { juz30Surahs } from '../data/juz30';

interface ProgressSectionProps {
  currentSurahId: number;
  completedSurahs: number[];
  completedTestingPhases: number[];
  onSurahSelect: (surahId: number) => void;
}

interface PathItemProps {
  type: 'surah' | 'phase';
  status: 'locked' | 'current' | 'completed' | 'completed-errors';
  children: React.ReactNode;
  onClick?: () => void;
  surah?: typeof juz30Surahs[0];
  isSpecial?: boolean;
}

const PathItem: React.FC<PathItemProps> = ({ 
  type, 
  status, 
  children, 
  onClick, 
  surah, 
  isSpecial = false 
}) => {
  const getStatusColors = () => {
    if (isSpecial && status === 'current') {
      return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-600 shadow-xl ring-4 ring-blue-200';
    }
    
    switch (status) {
      case 'current':
        return 'bg-blue-500 text-white border-blue-600 shadow-lg ring-4 ring-blue-200';
      case 'completed':
        return 'bg-green-500 text-white border-green-600 shadow-md';
      case 'completed-errors':
        return 'bg-orange-500 text-white border-orange-600 shadow-md';
      default:
        return 'bg-gray-300 text-gray-600 border-gray-400 opacity-70';
    }
  };

  const sizeClasses = type === 'surah' 
    ? 'w-20 h-20 text-sm' 
    : 'w-12 h-12 text-xs';

  return (
    <div className="flex flex-col items-center gap-2 relative">
      <button
        onClick={onClick}
        className={`
          ${sizeClasses} 
          ${getStatusColors()}
          rounded-full border-3 flex items-center justify-center
          transition-all duration-300 hover:scale-105 relative font-medium
          ${status !== 'locked' ? 'cursor-pointer' : 'cursor-not-allowed'}
          ${status === 'current' ? 'animate-pulse' : ''}
        `}
        disabled={status === 'locked'}
      >
        {children}
      </button>
      
      {/* Surah details */}
      {type === 'surah' && surah && (
        <div className="text-center">
          <div className="text-xs text-gray-600 font-medium max-w-20">
            {surah.name}
          </div>
          {status === 'current' && (
            <div className="mt-2 px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded-full shadow-lg animate-bounce">
              ✨ ابدأ هنا
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const LearningPath: React.FC<{
  currentSurahId: number;
  completedSurahs: number[];
  completedTestingPhases: number[];
  onSurahSelect: (surahId: number) => void;
  onPhaseSelect: (surahId: number, phaseIndex: number) => void;
}> = ({ currentSurahId, completedSurahs, completedTestingPhases, onSurahSelect, onPhaseSelect }) => {
  
  const getSurahStatus = (surahId: number) => {
    if (completedSurahs.includes(surahId)) return 'completed';
    if (surahId === currentSurahId) return 'current';
    return 'locked';
  };

  const getPhaseStatus = (surahId: number, phaseIndex: number) => {
    const phaseId = surahId * 100 + phaseIndex + 1;
    if (completedTestingPhases.includes(phaseId)) return 'completed';
    if (surahId === currentSurahId) return 'current';
    return 'locked';
  };

  // Curve calculation function
  const getPointOnCurve = (startX: number, startY: number, endX: number, endY: number, t: number) => {
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const controlX = midX + (endX - startX) * 0.3;
    const controlY = midY;
    
    const x = Math.pow(1 - t, 2) * startX + 2 * (1 - t) * t * controlX + Math.pow(t, 2) * endX;
    const y = Math.pow(1 - t, 2) * startY + 2 * (1 - t) * t * controlY + Math.pow(t, 2) * endY;
    
    return { x, y };
  };

  return (
    <div className="relative py-4">
      {[...juz30Surahs].reverse().map((surah, index) => {
        const isLeft = index % 2 === 0;
        const nextSurah = [...juz30Surahs].reverse()[index + 1];
        const nextIsLeft = (index + 1) % 2 === 0;
        
        const surahStatus = getSurahStatus(surah.id);
        const isCurrentSurah = surahStatus === 'current';
        const isCompleted = surahStatus === 'completed';

        // Calculate positions - reduced spacing
        const currentX = isLeft ? 80 : 220;
        const currentY = index * 80 + 60; // Reduced from 160px to 80px spacing
        const nextX = nextIsLeft ? 80 : 220;
        const nextY = (index + 1) * 80 + 60;

        // Generate phases for the current surah
        const phases = Array.from({ length: surah.phases }, (_, i) => i);

        return (
          <div key={surah.id} className="relative" style={{ height: '80px' }}>
            {/* Curved path to next surah */}
            {nextSurah && (
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <svg width="300" height="120" className="absolute top-0 left-0 w-full h-full">
                  <defs>
                    <linearGradient id={`path-${surah.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={isCompleted ? "#10b981" : "#d1d5db"} />
                      <stop offset="100%" stopColor={isCompleted ? "#34d399" : "#e5e7eb"} />
                    </linearGradient>
                  </defs>
                  <path
                    d={`M ${currentX} ${40} Q ${(currentX + nextX) / 2 + (nextX - currentX) * 0.3} ${(40 + 80) / 2} ${nextX} ${80}`}
                    stroke={`url(#path-${surah.id})`}
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    className={isCompleted ? "drop-shadow-sm" : ""}
                  />
                </svg>
                
                {/* Phase circles along the curve */}
                {phases.slice(0, 3).map((_, phaseIndex) => {
                  const t = (phaseIndex + 1) / (phases.length + 1);
                  const position = getPointOnCurve(currentX, 40, nextX, 80, t);
                  const phaseStatus = getPhaseStatus(surah.id, phaseIndex);
                  
                  return (
                    <div
                      key={phaseIndex}
                      className="absolute pointer-events-auto"
                      style={{
                        left: position.x - 24,
                        top: position.y - 24,
                        zIndex: 20
                      }}
                    >
                      <PathItem
                        type="phase"
                        status={phaseStatus}
                        onClick={() => onPhaseSelect(surah.id, phaseIndex)}
                      >
                        {phaseIndex + 1}
                      </PathItem>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Surah node */}
            <div 
              className="absolute"
              style={{ 
                left: currentX - 40,
                top: 0,
                zIndex: 30 
              }}
            >
              <PathItem
                type="surah"
                status={surahStatus}
                onClick={() => onSurahSelect(surah.id)}
                surah={surah}
                isSpecial={isCurrentSurah}
              >
                <div className="text-center leading-tight">
                  <div className="font-semibold font-arabic text-sm">{surah.arabicName}</div>
                </div>
              </PathItem>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const ProgressSection = ({ 
  currentSurahId, 
  completedSurahs, 
  completedTestingPhases,
  onSurahSelect 
}: ProgressSectionProps) => {
  const onPhaseSelect = (surahId: number, phaseIndex: number) => {
    // Switch to the surah and phase
    onSurahSelect(surahId);
  };

  // Calculate completion progress
  const totalSurahs = juz30Surahs.length;
  
  // Mock data: Set user at Al-Alaq (19th surah), with previous surahs completed
  const mockCompletedSurahs = juz30Surahs.slice(0, 18).map(s => s.id); // First 18 surahs completed
  const mockCompletedPhases: number[] = [];
  
  // Add completed phases for completed surahs
  juz30Surahs.slice(0, 18).forEach(surah => {
    for (let i = 0; i < surah.phases; i++) {
      mockCompletedPhases.push(surah.id * 100 + i + 1);
    }
  });

  const effectiveCompletedSurahs = [...new Set([...completedSurahs, ...mockCompletedSurahs])];
  const effectiveCompletedPhases = [...new Set([...completedTestingPhases, ...mockCompletedPhases])];
  const effectiveCompletedCount = effectiveCompletedSurahs.length;

  return (
    <div className="w-80 h-full bg-gradient-to-b from-purple-50 via-blue-50 via-green-50 to-orange-50 relative overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-white/95 backdrop-blur border-b border-gray-100 relative z-40">
        <div className="text-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-1 font-arabic">
            🕌 رحلة الحفظ
          </h2>
          <p className="text-sm text-gray-600 mb-1 font-arabic">جزء عمّ - 37 سورة</p>
          <div className="text-xs text-gray-500 font-arabic">من الناس إلى النبأ</div>
        </div>
      </div>
      
      {/* Scrollable path */}
      <ScrollArea className="h-[calc(100vh-140px)] relative">
        <div className="relative py-8">
          {/* Starting point decoration */}
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-3 rounded-full shadow-lg">
              <div className="text-sm font-semibold font-arabic">🚀 ابدأ الرحلة</div>
            </div>
          </div>
          
          {/* Learning path - Duolingo style */}
          <LearningPath
            currentSurahId={currentSurahId}
            completedSurahs={effectiveCompletedSurahs}
            completedTestingPhases={effectiveCompletedPhases}
            onSurahSelect={onSurahSelect}
            onPhaseSelect={onPhaseSelect}
          />
          
          {/* Completion celebration */}
          {effectiveCompletedCount === totalSurahs && (
            <div className="flex flex-col items-center mt-8 mb-16">
              <div className="text-6xl mb-4 animate-bounce">🏆</div>
              <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl text-center shadow-xl">
                <div className="font-bold text-lg font-arabic">🎉 مبروك!</div>
                <div className="text-sm opacity-90 font-arabic">أكملت جزء عمّ كاملاً</div>
              </div>
              <div className="mt-4 text-sm text-gray-600 text-center font-arabic">
                لقد حفظت 37 سورة من القرآن الكريم
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Floating progress indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-gray-200 z-40">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-gray-700 font-medium font-arabic">{effectiveCompletedCount}/{totalSurahs} مكتملة</span>
        </div>
      </div>
    </div>
  );
};