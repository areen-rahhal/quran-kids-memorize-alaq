import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface SurahPhasesSummaryProps {
  currentSurahName: string;
  totalPhases: number;
  completedPhases: Set<number>;
  currentPhaseIdx: number;
  currentSurahId: number;
}

export const SurahPhasesSummary = ({
  currentSurahName,
  totalPhases,
  completedPhases,
  currentPhaseIdx,
  currentSurahId
}: SurahPhasesSummaryProps) => {
  const completedPhaseCount = completedPhases.size;
  const progressPercentage = (completedPhaseCount / totalPhases) * 100;

  // Generate phase status array
  const phases = Array.from({ length: totalPhases }, (_, index) => {
    const phaseId = currentSurahId * 100 + index + 1;
    const isCompleted = completedPhases.has(phaseId);
    const isCurrent = index === currentPhaseIdx;
    
    let status: 'completed' | 'current' | 'not-started' = 'not-started';
    if (isCompleted) status = 'completed';
    else if (isCurrent) status = 'current';
    
    return { index: index + 1, status };
  });

  const getPhaseColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'current': return 'bg-blue-500 text-white';
      default: return 'bg-gray-300 text-gray-600';
    }
  };

  return (
    <Card className="p-4 bg-white border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 font-arabic mb-2">
          {currentSurahName}
        </h2>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600 font-arabic">
            {completedPhaseCount} من {totalPhases} مراحل مكتملة
          </span>
          <span className="text-emerald-600 font-bold font-arabic">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <Progress value={progressPercentage} className="h-3 mb-4" />
      </div>

      {/* Phase circles */}
      <div className="flex flex-wrap justify-center gap-2">
        {phases.map((phase) => (
          <div
            key={phase.index}
            className={`
              w-10 h-10 rounded-full flex items-center justify-center
              text-sm font-bold transition-all duration-300
              ${getPhaseColor(phase.status)}
            `}
          >
            {phase.index}
          </div>
        ))}
      </div>
    </Card>
  );
};
