import React, { useEffect, useRef } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { juz30Surahs } from '../data/juz30';
import { Trophy, MapPin } from 'lucide-react';
interface ProgressSectionProps {
  currentSurahId: number;
  completedSurahs: number[];
  completedPhases: Set<number>;
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
const Circle: React.FC<CircleProps> = ({
  status,
  size,
  children,
  onClick,
  isSpecial = false
}) => {
  const getStatusColors = () => {
    switch (status) {
      case 'current':
        return 'bg-blue-500 text-white border-blue-600 shadow-lg';
      case 'excellent':
      case 'completed':
        return 'bg-green-500 text-white border-green-600 shadow-md';
      case 'very-good':
        return 'bg-blue-500 text-white border-blue-600 shadow-md';
      case 'basic':
        return 'bg-yellow-500 text-white border-yellow-600 shadow-md';
      case 'needs-improvement':
        return 'bg-orange-500 text-white border-orange-600 shadow-md';
      case 'completed-errors':
        return 'bg-orange-500 text-white border-orange-600 shadow-md';
      default:
        return 'bg-gray-300 text-gray-600 border-gray-400';
    }
  };
  
  const sizeClasses = size === 'large' ? 'w-16 h-16 text-sm' : 'w-8 h-8 text-xs';
  
  return (
    <button 
      onClick={onClick} 
      className={`
        ${sizeClasses} 
        ${getStatusColors()}
        rounded-full border-2 flex items-center justify-center
        font-medium transition-all duration-200
        ${status !== 'locked' ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}
      `} 
      disabled={status === 'locked'}
    >
      {children}
    </button>
  );
};

const SurahItem: React.FC<{
  surah: typeof juz30Surahs[0];
  currentSurahId: number;
  completedSurahs: number[];
  completedPhases: Set<number>;
  onSurahSelect?: (surahId: number) => void;
  getSurahProficiency?: (surahNumber: number) => string | null;
  isLast?: boolean;
}> = ({
  surah,
  currentSurahId,
  completedSurahs,
  completedPhases,
  onSurahSelect,
  getSurahProficiency,
  isLast = false
}) => {
  const getSurahStatus = (surahId: number) => {
    const proficiency = getSurahProficiency?.(surahId);
    if (proficiency) {
      switch (proficiency) {
        case 'excellent':
          return 'excellent';
        case 'very_good':
          return 'very-good';
        case 'basic':
          return 'basic';
        case 'needs_improvement':
          return 'needs-improvement';
      }
    }
    if (completedSurahs.includes(surahId)) return 'completed';
    if (surahId === currentSurahId) return 'current';
    return 'locked';
  };

  const surahStatus = getSurahStatus(surah.id);
  const isCurrentSurah = surahStatus === 'current';

  // Generate phase circles for this surah
  const phases = Array.from({ length: surah.phases }, (_, i) => {
    const phaseId = surah.id * 100 + i + 1;
    const phaseStatus: CircleProps['status'] = completedPhases.has(phaseId) 
      ? 'completed' 
      : surah.id === currentSurahId 
        ? 'current' 
        : 'locked';
    return { id: i + 1, status: phaseStatus };
  });

  return (
    <div className="flex flex-col items-center relative">
      {/* Vertical line connector (except for last item) */}
      {!isLast && (
        <div className="absolute top-20 w-1 h-24 bg-gradient-to-b from-blue-200 to-gray-200 left-1/2 transform -translate-x-1/2 z-0" />
      )}
      
      {/* Phase circles above surah (if any phases) */}
      {phases.length > 0 && surahStatus !== 'locked' && (
        <div className="flex flex-col items-center gap-3 mb-4">
          {phases.map((phase) => (
            <Circle
              key={phase.id}
              status={phase.status}
              size="small"
              onClick={() => onSurahSelect?.(surah.id)}
            >
              {phase.id}
            </Circle>
          ))}
        </div>
      )}
      
      {/* Main Surah Circle */}
      <div className="relative z-10 flex flex-col items-center">
        <Circle
          status={surahStatus}
          size="large"
          onClick={() => onSurahSelect?.(surah.id)}
        >
          <div className="text-center leading-tight">
            <div className="font-semibold font-arabic text-xs">{surah.arabicName}</div>
          </div>
        </Circle>
        
        {/* Surah name */}
        <div className="text-xs text-gray-600 mt-2 text-center font-medium">
          {surah.name}
        </div>
        
        {/* "You are here" indicator */}
        {isCurrentSurah && (
          <div className="flex items-center gap-1 mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded-full shadow-lg">
            <MapPin className="h-3 w-3" />
            <span className="font-arabic">أنت هنا</span>
          </div>
        )}
      </div>
    </div>
  );
};
export const ProgressSection = ({
  currentSurahId,
  completedSurahs,
  completedPhases,
  onSurahSelect,
  getSurahProficiency
}: ProgressSectionProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Reverse order to show An-Nas at bottom, An-Naba at top
  const reversedSurahs = [...juz30Surahs].reverse();
  
  // Calculate completion progress
  const totalSurahs = juz30Surahs.length;
  const completedCount = completedSurahs.length;

  // Auto-scroll to current surah on load
  useEffect(() => {
    const currentIndex = reversedSurahs.findIndex(s => s.id === currentSurahId);
    if (currentIndex !== -1 && scrollAreaRef.current) {
      const scrollPosition = currentIndex * 150; // Approximate height per item
      scrollAreaRef.current.scrollTop = scrollPosition;
    }
  }, [currentSurahId, reversedSurahs]);

  return (
    <div className="w-80 h-full bg-gradient-to-b from-purple-400 via-pink-400 to-orange-300 relative overflow-hidden">
      {/* Goal Trophy at the top */}
      <div className="p-6 text-center relative z-40">
        <div className="bg-white/20 backdrop-blur rounded-2xl p-4 mb-4">
          <Trophy className="w-12 h-12 text-white mx-auto mb-2" />
          <div className="text-white font-bold font-arabic">🌟 رحلتك المباركة</div>
          <div className="text-white/80 text-sm font-arabic">Your Blessed Journey!</div>
        </div>
        
        {/* Progress Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-white mb-4">
          <div>
            <div className="text-2xl font-bold">{completedCount}</div>
            <div className="text-xs font-arabic">سورة مكتملة</div>
            <div className="text-xs">Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{Math.round((completedCount / totalSurahs) * 100)}%</div>
            <div className="text-xs font-arabic">من رحلتك</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{totalSurahs}</div>
            <div className="text-xs font-arabic">إجمالي السور</div>
            <div className="text-xs">Total Surahs</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-3 mb-2">
          <div 
            className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-1000"
            style={{ width: `${(completedCount / totalSurahs) * 100}%` }}
          />
        </div>
        
        <div className="text-white text-sm font-arabic">🚀 في طريقك للنجاح</div>
      </div>
      
      {/* Journey starts here indicator */}
      <div className="text-center mb-6 px-4">
        <div className="bg-white/90 backdrop-blur rounded-full px-4 py-2 text-sm font-arabic text-gray-700">
          ⭐ ابدأ هنا اسفل في التميز ⭐
        </div>
      </div>
      
      {/* Scrollable Vertical Path */}
      <ScrollArea className="h-[calc(100vh-400px)] px-4" ref={scrollAreaRef}>
        <div className="flex flex-col gap-6 pb-8">
          {reversedSurahs.map((surah, index) => (
            <SurahItem
              key={surah.id}
              surah={surah}
              currentSurahId={currentSurahId}
              completedSurahs={completedSurahs}
              completedPhases={completedPhases}
              onSurahSelect={onSurahSelect}
              getSurahProficiency={getSurahProficiency}
              isLast={index === reversedSurahs.length - 1}
            />
          ))}
        </div>
      </ScrollArea>
      
      {/* Bottom CTA */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/30 to-transparent">
        <button 
          onClick={() => onSurahSelect(114)}
          className="w-full bg-white/90 backdrop-blur text-purple-600 py-3 rounded-full font-arabic font-bold shadow-lg hover:bg-white transition-all"
        >
          الشرح
        </button>
      </div>
    </div>
  );
};