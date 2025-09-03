import React from 'react';
import { ScrollArea } from './ui/scroll-area';
import { quranData, Surah, Phase } from './QuranData';
import { Trophy, MapPin, Target, Star, Sparkles, Heart } from 'lucide-react';
import wireframeImage from 'figma:asset/0a03f4b5b83c61911d6a9fe2cebb675d44020842.png';

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
        transition-all duration-200 hover:scale-105 relative font-medium
        ${status !== 'locked' ? 'cursor-pointer' : 'cursor-not-allowed'}
        ${status === 'current' ? 'ring-2 ring-blue-300' : ''}
      `}
      disabled={status === 'locked'}
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
      <div className="relative flex flex-col items-center">
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

export const LearningPath: React.FC<LearningPathProps> = ({ 
  onSurahSelect, 
  onPhaseSelect 
}) => {
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
  
  // Create a reversed copy to show An-Naba at top, An-Nas at bottom
  const reversedQuranData = [...quranData].reverse();
  
  return (
    <div className="w-full h-full bg-gradient-to-b from-blue-50 to-purple-50 relative overflow-hidden">
      {/* Enhanced Goal Section for Kids */}
      <div className="p-4 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 relative z-40 overflow-hidden">
        {/* Floating Stars Animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Star className="absolute top-2 right-8 w-3 h-3 text-white/30 animate-pulse" />
          <Sparkles className="absolute top-6 left-12 w-4 h-4 text-white/40 animate-bounce" />
          <Star className="absolute bottom-4 right-4 w-2 h-2 text-white/50 animate-ping" />
          <Heart className="absolute top-3 left-6 w-3 h-3 text-white/30 animate-pulse" />
        </div>

        <div className="relative space-y-4">
          {/* Motivational Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Trophy className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-white font-bold text-base text-right leading-tight">
                🌟 رحلتك المباركة! 🌟
              </div>
              <div className="text-white/90 text-sm text-right font-medium">
                Your Blessed Journey!
              </div>
              <div className="text-white/80 text-xs text-right">
                حفظ جزء عمَّ الكريم ✨
              </div>
            </div>
          </div>
          
          {/* Enhanced Progress Section */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 space-y-3 shadow-lg">
            {/* Progress Stats */}
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className="text-white font-bold text-lg">
                  {quranData.filter(s => s.status === 'completed' || s.status === 'completed-errors').length}
                </div>
                <div className="text-white/80 text-xs">سورة مكتملة</div>
                <div className="text-white/70 text-xs">Completed</div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-white font-bold text-xl">
                    {progressPercentage}%
                  </div>
                  <div className="text-white/80 text-xs">من رحلتك</div>
                </div>
                <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white animate-spin" />
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-white font-bold text-lg">37</div>
                <div className="text-white/80 text-xs">إجمالي السور</div>
                <div className="text-white/70 text-xs">Total Surahs</div>
              </div>
            </div>
            
            {/* Animated Progress Bar */}
            <div className="space-y-2">
              <div className="text-center">
                <div className="text-white/90 text-sm font-medium">
                  {progressPercentage < 25 ? "🌱 بداية رائعة!" : 
                   progressPercentage < 50 ? "🚀 في طريقك للنجاح!" :
                   progressPercentage < 75 ? "⭐ أنت مذهل!" : 
                   "👑 بطل القرآن!"}
                </div>
              </div>
              
              <div className="relative">
                <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                    style={{ width: `${progressPercentage}%` }}
                  >
                    {/* Animated shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  </div>
                </div>
                
                {/* Progress milestones */}
                <div className="flex justify-between mt-1">
                  <div className={`w-2 h-2 rounded-full ${progressPercentage >= 25 ? 'bg-white' : 'bg-white/30'} transition-all duration-300`}></div>
                  <div className={`w-2 h-2 rounded-full ${progressPercentage >= 50 ? 'bg-white' : 'bg-white/30'} transition-all duration-300`}></div>
                  <div className={`w-2 h-2 rounded-full ${progressPercentage >= 75 ? 'bg-white' : 'bg-white/30'} transition-all duration-300`}></div>
                  <div className={`w-2 h-2 rounded-full ${progressPercentage >= 100 ? 'bg-white' : 'bg-white/30'} transition-all duration-300`}></div>
                </div>
              </div>
            </div>
            
            {/* Motivational Message */}
            <div className="text-center">
              <div className="text-white/90 text-xs leading-relaxed">
                {progressPercentage < 25 ? "كل خطوة تقربك من هدفك المبارك! 💪" :
                 progressPercentage < 50 ? "ما شاء الله! استمر في التميز! 🌟" :
                 progressPercentage < 75 ? "أنت قريب جداً من تحقيق حلمك! 🎯" :
                 "تبارك الله! أنت بطل حقيقي! 🏆"}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scrollable Journey Path */}
      <ScrollArea className="h-[calc(100vh-120px)] relative">
        <div className="flex flex-col items-center py-3 px-4 min-h-full">
          
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
            <div className="mt-2 text-center">
              <div className="text-xs font-bold text-gray-700">🏆 هدفك الذهبي!</div>
              <div className="text-xs text-gray-500">Golden Goal!</div>
            </div>
          </div>

          {/* Vertical Journey Path */}
          <div className="relative flex flex-col items-center">
            {reversedQuranData.map((surah, index) => (
              <SurahNode
                key={surah.id}
                surah={surah}
                index={index}
                isFirst={index === 0}
                isLast={index === reversedQuranData.length - 1}
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
      
      {/* Enhanced Progress indicator at bottom */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 backdrop-blur px-4 py-2 rounded-2xl shadow-2xl border-2 border-white/30 z-40">
        <div className="flex items-center gap-3 text-sm">
          <div className="flex gap-1">
            <Star className="w-3 h-3 text-yellow-300 animate-sparkle" />
            <Star className="w-3 h-3 text-yellow-300 animate-sparkle" style={{animationDelay: '0.2s'}} />
            <Star className="w-3 h-3 text-yellow-300 animate-sparkle" style={{animationDelay: '0.4s'}} />
          </div>
          <span className="text-white font-bold">
            {quranData.filter(s => s.status === 'completed' || s.status === 'completed-errors').length}/37 🎉 مكتملة
          </span>
          <Heart className="w-4 h-4 text-pink-200 animate-pulse" />
        </div>
      </div>
    </div>
  );
};