import React from 'react';
import { ScrollArea } from './ui/scroll-area';
import { juz30Surahs } from '../data/juz30';

interface ProgressSectionProps {
  currentSurahId: number;
  completedSurahs: number[];
  completedTestingPhases: number[];
  onSurahSelect: (surahId: number) => void;
  getSurahProficiency?: (surahNumber: number) => string | null;
}

interface CircleProps {
  status: 'locked' | 'current' | 'completed' | 'completed-errors' | 'excellent' | 'very-good' | 'basic' | 'needs-improvement';
  size: 'large' | 'small';
  children: React.ReactNode;
  onClick?: () => void;
  isSpecial?: boolean;
  proficiency?: string | null;
}

const Circle: React.FC<CircleProps> = ({ status, size, children, onClick, isSpecial = false }) => {
  const getStatusColors = () => {
    if (isSpecial && status === 'current') {
      return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-600 shadow-xl ring-4 ring-blue-200';
    }
    
    switch (status) {
      case 'current':
        return 'bg-blue-500 text-white border-blue-600 shadow-lg ring-4 ring-blue-200';
      case 'excellent':
        return 'bg-green-500 text-white border-green-600 shadow-md';
      case 'very-good':
        return 'bg-blue-500 text-white border-blue-600 shadow-md';
      case 'basic':
        return 'bg-yellow-500 text-white border-yellow-600 shadow-md';
      case 'needs-improvement':
        return 'bg-orange-500 text-white border-orange-600 shadow-md';
      case 'completed':
        return 'bg-green-500 text-white border-green-600 shadow-md';
      case 'completed-errors':
        return 'bg-orange-500 text-white border-orange-600 shadow-md';
      default:
        return 'bg-gray-300 text-gray-600 border-gray-400 opacity-70';
    }
  };

  const sizeClasses = size === 'large' 
    ? 'w-20 h-20 text-sm' 
    : 'w-12 h-12 text-xs';

  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClasses} 
        ${getStatusColors()}
        rounded-full border-3 flex items-center justify-center
        transition-all duration-300 hover:scale-105 z-50 relative font-medium
        ${status !== 'locked' ? 'cursor-pointer' : 'cursor-not-allowed'}
        ${status === 'current' ? 'animate-pulse' : ''}
        transform translate-x-[30px] -translate-y-5
      `}
      disabled={status === 'locked'}
    >
      {children}
    </button>
  );
};

// Function to calculate points along a curved path
const getPointOnCurve = (startX: number, startY: number, endX: number, endY: number, t: number) => {
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  
  // Create control point for curve
  const controlX = midX + (endX - startX) * 0.3;
  const controlY = midY;
  
  // Quadratic Bezier curve calculation
  const x = Math.pow(1 - t, 2) * startX + 2 * (1 - t) * t * controlX + Math.pow(t, 2) * endX;
  const y = Math.pow(1 - t, 2) * startY + 2 * (1 - t) * t * controlY + Math.pow(t, 2) * endY;
  
  return { x, y };
};

const PathWithPhases: React.FC<{ 
  startX: number; 
  startY: number; 
  endX: number; 
  endY: number;
  isCompleted: boolean;
  phases: number[];
  surahId: number;
  completedTestingPhases: number[];
  currentSurahId: number;
  onPhaseSelect?: (surahId: number, phaseIndex: number) => void;
}> = ({ startX, startY, endX, endY, isCompleted, phases, surahId, completedTestingPhases, currentSurahId, onPhaseSelect }) => {
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  
  // Create control point for smooth curve
  const controlX = midX + (endX - startX) * 0.3;
  const controlY = midY;
  
  const pathD = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
  
  // Calculate positions for phase circles along the curve
  const phasePositions = phases.slice(0, 3).map((_, index) => {
    const t = (index + 1) / (phases.length + 1); // Distribute evenly along curve
    return getPointOnCurve(startX, startY, endX, endY, t);
  });

  const getPhaseStatus = (phaseIndex: number) => {
    const phaseId = surahId * 100 + phaseIndex + 1; // Changed to avoid conflicts
    if (completedTestingPhases.includes(phaseId)) {
      // For now, assume no errors - you can extend this logic later
      return 'completed';
    }
    if (surahId === currentSurahId) return 'current';
    return 'locked';
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
      {/* SVG Path */}
      <svg width="300" height="200" className="absolute top-0 left-0 w-full h-full z-10">
        <defs>
          <linearGradient id={`completedPath-${surahId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id={`incompletePath-${surahId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d1d5db" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
        <path
          d={pathD}
          stroke={isCompleted ? `url(#completedPath-${surahId})` : `url(#incompletePath-${surahId})`}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          className={isCompleted ? "drop-shadow-sm" : ""}
        />
      </svg>
      
      {/* Phase circles positioned on the path */}
      {phasePositions.map((position, index) => {
        if (index >= phases.length) return null;
        
        return (
          <div
            key={index}
            className="absolute pointer-events-auto"
            style={{
              left: position.x - 24, // Center the circle (24px = half of 48px width)
              top: position.y - 24,  // Center the circle (24px = half of 48px height)
              zIndex: 25
            }}
          >
            <Circle
              status={getPhaseStatus(index)}
              size="small"
              onClick={() => onPhaseSelect?.(surahId, index)}
            >
              {index + 1}
            </Circle>
          </div>
        );
      })}
    </div>
  );
};

const SurahNode: React.FC<{
  surah: typeof juz30Surahs[0];
  index: number;
  isLeft: boolean;
  nextSurah?: typeof juz30Surahs[0];
  nextIsLeft: boolean;
  currentSurahId: number;
  completedSurahs: number[];
  completedTestingPhases: number[];
  onSurahSelect?: (surahId: number) => void;
  onPhaseSelect?: (surahId: number, phaseIndex: number) => void;
  getSurahProficiency?: (surahNumber: number) => string | null;
}> = ({ surah, index, isLeft, nextSurah, nextIsLeft, currentSurahId, completedSurahs, completedTestingPhases, onSurahSelect, onPhaseSelect, getSurahProficiency }) => {
  const getSurahStatus = (surahId: number) => {
    // Check if we have proficiency data for this surah
    const proficiency = getSurahProficiency?.(surahId);
    if (proficiency) {
      // Map proficiency levels to status
      switch (proficiency) {
        case 'excellent': return 'excellent';
        case 'very_good': return 'very-good';
        case 'basic': return 'basic';
        case 'needs_improvement': return 'needs-improvement';
      }
    }
    
    // Fallback to old logic
    if (completedSurahs.includes(surahId)) return 'completed';
    if (surahId === currentSurahId) return 'current';
    return 'locked';
  };

  const surahStatus = getSurahStatus(surah.id);
  const isCurrentSurah = surahStatus === 'current';
  const isCompleted = surahStatus === 'completed';

  // Calculate positions for surah circles
  const currentX = isLeft ? 100 : 200;
  const currentY = 60;
  const nextX = nextIsLeft ? 100 : 200;
  const nextY = 220; // Increased from 180 to 220 for more spacing

  // Generate phases array for the surah
  const phases = Array.from({ length: surah.phases }, (_, i) => i);

  return (
    <div className="relative mb-10" style={{ height: '160px' }}>
      {/* Path connector with phases to next surah */}
      {nextSurah && (
        <PathWithPhases
          startX={currentX}
          startY={currentY}
          endX={nextX}
          endY={nextY}
          isCompleted={isCompleted}
          phases={phases}
          surahId={surah.id}
          completedTestingPhases={completedTestingPhases}
          currentSurahId={currentSurahId}
          onPhaseSelect={onPhaseSelect}
        />
      )}
      
      {/* Surah container */}
      <div 
        className="absolute flex flex-col items-center"
        style={{ 
          left: currentX - 40, // Center the surah circle
          top: currentY - 40,
          zIndex: 30 
        }}
      >
        {/* Main surah circle */}
        <Circle
          status={surahStatus}
          size="large"
          onClick={() => onSurahSelect?.(surah.id)}
          isSpecial={isCurrentSurah}
          proficiency={getSurahProficiency?.(surah.id)}
        >
          <div className="text-center leading-tight">
            <div className="font-semibold font-arabic">{surah.arabicName}</div>
            {getSurahProficiency?.(surah.id) && (
              <div className="text-xs mt-1">
                {getSurahProficiency(surah.id) === 'excellent' && '⭐'}
                {getSurahProficiency(surah.id) === 'very_good' && '✓'}
                {getSurahProficiency(surah.id) === 'basic' && '○'}
                {getSurahProficiency(surah.id) === 'needs_improvement' && '△'}
              </div>
            )}
          </div>
        </Circle>
        
        {/* English name */}
        <div className="text-xs text-gray-600 mt-2 text-center font-medium max-w-20">
          {surah.name}
        </div>
        
        {/* Current lesson indicator */}
        {isCurrentSurah && (
          <div className="mt-3 px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded-full shadow-lg animate-bounce">
            ✨ ابدأ هنا
          </div>
        )}
      </div>
      
      {/* If this is the last surah, show remaining phases below it */}
      {!nextSurah && phases.length > 0 && surahStatus !== 'locked' && (
        <div 
          className="absolute flex flex-col items-center gap-2"
          style={{ 
            left: currentX - 24,
            top: currentY + 60,
            zIndex: 25 
          }}
        >
          {phases.slice(0, 4).map((phaseIndex) => {
            const phaseId = surah.id * 100 + phaseIndex + 1;
            const phaseStatus = completedTestingPhases.includes(phaseId) ? 'completed' : 
                              (surah.id === currentSurahId ? 'current' : 'locked');
            
            return (
              <Circle
                key={phaseIndex}
                status={phaseStatus}
                size="small"
                onClick={() => onPhaseSelect?.(surah.id, phaseIndex)}
              >
                {phaseIndex + 1}
              </Circle>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const ProgressSection = ({ 
  currentSurahId, 
  completedSurahs, 
  completedTestingPhases,
  onSurahSelect,
  getSurahProficiency
}: ProgressSectionProps) => {
  const onPhaseSelect = (surahId: number, phaseIndex: number) => {
    // Switch to the surah and phase
    onSurahSelect(surahId);
  };

  // Calculate completion progress - use only real progress data
  const totalSurahs = juz30Surahs.length;
  const effectiveCompletedSurahs = completedSurahs;
  const effectiveCompletedPhases = completedTestingPhases;
  const effectiveCompletedCount = effectiveCompletedSurahs.length;

  return (
    <div className="w-80 h-full bg-gradient-to-t from-purple-50 via-blue-50 via-green-50 to-orange-50 relative overflow-hidden">
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
      <ScrollArea className="h-[calc(100vh-200px)] relative">
        <div className="relative pt-8 pb-32">
          {/* Completion celebration at the top */}
          {effectiveCompletedCount === totalSurahs && (
            <div className="flex flex-col items-center mb-8">
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
          
          {/* Surahs path - natural order to show ascending from An-Nas (bottom) to An-Naba (top) */}
          <div className="relative">
            {juz30Surahs.map((surah, index) => {
              const isLeft = index % 2 === 0;
              const nextSurah = juz30Surahs[index + 1];
              const nextIsLeft = (index + 1) % 2 === 0;
              
              return (
                <SurahNode
                  key={surah.id}
                  surah={surah}
                  index={index}
                  isLeft={isLeft}
                  nextSurah={nextSurah}
                  nextIsLeft={nextIsLeft}
                  currentSurahId={currentSurahId}
                  completedSurahs={effectiveCompletedSurahs}
                  completedTestingPhases={effectiveCompletedPhases}
                  onSurahSelect={onSurahSelect}
                  onPhaseSelect={onPhaseSelect}
                  getSurahProficiency={getSurahProficiency}
                />
              );
            })}
          </div>
        </div>
      </ScrollArea>
      
      {/* Floating Start Journey CTA - Always visible at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/95 to-transparent z-50">
        <div className="flex justify-center">
          <button 
            onClick={() => onSurahSelect(114)} // Start with Surat Al-Nas
            className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform"
          >
            <div className="text-lg font-semibold font-arabic flex items-center gap-2">
              🚀 ابدأ الرحلة
            </div>
          </button>
        </div>
      </div>
      
      {/* Floating progress indicator - moved up to avoid CTA overlap */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-gray-200 z-40">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-gray-700 font-medium font-arabic">{effectiveCompletedCount}/{totalSurahs} مكتملة</span>
        </div>
      </div>
    </div>
  );
};
