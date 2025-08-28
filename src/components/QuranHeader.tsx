import { BookOpen } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
interface QuranHeaderProps {
  currentSurahName: string;
  completedPhaseCount: number;
  totalPhases: number;
  currentPhaseIdx: number;
  setCurrentPhaseIdx: (idx: number) => void;
  completedTestingPhases: number[];
}
export const QuranHeader = ({
  currentSurahName,
  completedPhaseCount,
  totalPhases,
  currentPhaseIdx,
  setCurrentPhaseIdx,
  completedTestingPhases
}: QuranHeaderProps) => {
  const progress = (completedPhaseCount / totalPhases) * 100;

  return (
    <div className="bg-white border-b shadow-sm p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="h-6 w-6 text-emerald-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-arabic">{currentSurahName}</h1>
            <p className="text-sm text-gray-600 font-arabic">
              {completedPhaseCount} من {totalPhases} مراحل مكتملة
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700 font-arabic">تقدم السورة</span>
            <span className="text-emerald-600 font-bold font-arabic">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>
    </div>
  );
};