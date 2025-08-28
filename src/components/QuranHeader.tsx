
import { BookOpen, Star, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { studyPhases } from '@/data/studyPhases';

interface QuranHeaderProps {
  completedPhaseCount: number;
  totalPhases: number;
  progress: number;
  currentPhaseIdx: number;
  setCurrentPhaseIdx: (idx: number) => void;
  completedVerses: number[];
  completedTestingPhases: number[];
}

export const QuranHeader = ({
  completedPhaseCount,
  totalPhases,
  progress,
  currentPhaseIdx,
  setCurrentPhaseIdx,
  completedVerses,
  completedTestingPhases
}: QuranHeaderProps) => {

  return (
    <div className="relative z-10 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-3 py-2 rounded-b-3xl shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-emerald-100 text-xs font-arabic mt-0.5">تعلم سورة العلق</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-amber-100 drop-shadow font-arabic">
            <Star className="h-5 w-5 fill-current" />
            <span className="text-base font-bold">{completedPhaseCount}/{totalPhases}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-0">
        <div className="flex justify-between text-xs text-emerald-100 mb-0 whitespace-nowrap font-arabic">
          <span>التقدم</span>
          <span>%{Math.round(progress)}</span>
        </div>
        <Progress value={progress} className="h-2 bg-emerald-800 rounded-full" />
      </div>
      
      <div className="flex justify-center mt-1 gap-1">
        {studyPhases.map((ph, idx) => {
          const isCurrent = idx === currentPhaseIdx;
          const isComplete = completedTestingPhases.includes(idx);
          return (
            <button
              key={ph.label}
              onClick={() => setCurrentPhaseIdx(idx)}
              className={`
                transition-all duration-300 w-7 h-7 md:w-9 md:h-9 rounded-full border-2 font-arabic font-bold text-xs md:text-sm focus:outline-none relative
                ${isCurrent ? 'bg-amber-100 text-amber-700 border-amber-400 scale-110 shadow-md animate-bounce-gentler' : ''}
                ${isComplete && !isCurrent ? 'bg-green-500 text-white border-green-300 shadow-lg' : ''}
                ${!isComplete && !isCurrent ? 'bg-gray-100 text-gray-400 hover:bg-emerald-50' : ''}
              `}
              style={{
                transform: isCurrent ? 'scale(1.13)' : undefined,
                animationDuration: isCurrent ? '3.5s' : undefined,
                animationIterationCount: isCurrent ? 'infinite' : undefined
              }}
              aria-label={ph.label}
              tabIndex={0}
            >
              {isComplete && !isCurrent ? (
                <Check className="h-3 w-3 md:h-4 md:w-4" />
              ) : (
                idx + 1
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
