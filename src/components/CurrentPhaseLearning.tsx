import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Mic, CircleArrowLeft, CircleArrowRight } from 'lucide-react';

interface CurrentPhaseLearningProps {
  currentPhaseIdx: number;
  totalPhases: number;
  phaseLabel: string;
  phaseDescription: string;
  phaseVerseObjs: Array<{id: number, arabic: string}>;
  onPlayListening: () => void;
  onStartPractice: () => void;
  onStartTest: () => void;
  onPreviousPhase: () => void;
  onNextPhase: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isLoading?: boolean;
}

export const CurrentPhaseLearning = ({
  currentPhaseIdx,
  totalPhases,
  phaseLabel,
  phaseDescription,
  phaseVerseObjs,
  onPlayListening,
  onStartPractice,
  onStartTest,
  onPreviousPhase,
  onNextPhase,
  canGoPrevious,
  canGoNext,
  isLoading = false
}: CurrentPhaseLearningProps) => {
  return (
    <Card className="p-6 bg-white border border-gray-200 shadow-sm">
      {/* Phase Header */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 font-arabic mb-2">
          {phaseLabel}
        </h3>
        <p className="text-gray-600 font-arabic text-sm">
          {phaseDescription}
        </p>
      </div>

      {/* Verses Display */}
      <div className="bg-green-50 rounded-xl p-4 mb-6 text-center">
        <div className="font-arabic text-gray-900 text-lg leading-relaxed" dir="rtl">
          {phaseVerseObjs.map((verse, index) => (
            <span key={verse.id} className="inline-flex items-baseline">
              <span className="px-1">{verse.arabic}</span>
              <span
                className="inline-flex items-center justify-center bg-white border border-amber-300 px-1 mx-1 text-sm font-bold rounded-full shadow-sm relative -top-0.5"
                style={{
                  minWidth: 24,
                  minHeight: 24,
                  fontFamily: 'Amiri, serif',
                }}
              >
                {verse.id}
              </span>
              {index < phaseVerseObjs.length - 1 && ' '}
            </span>
          ))}
        </div>
      </div>

      {/* Learning Mode Buttons */}
      <div className="space-y-3 mb-6">
        <Button
          onClick={onPlayListening}
          disabled={isLoading}
          className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-arabic"
        >
          <Play className="ml-2 h-5 w-5" />
          وضع الاستماع
        </Button>
        
        <Button
          onClick={onStartPractice}
          disabled={isLoading}
          className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-arabic"
        >
          <Mic className="ml-2 h-5 w-5" />
          وضع الممارسة
        </Button>
        
        <Button
          onClick={onStartTest}
          disabled={isLoading}
          className="w-full h-12 bg-purple-500 hover:bg-purple-600 text-white font-arabic"
        >
          بدء الاختبار
        </Button>
      </div>

      {/* Phase Navigation */}
      <div className="flex items-center justify-between">
        <Button
          onClick={onPreviousPhase}
          disabled={!canGoPrevious}
          variant="outline"
          className="flex items-center gap-2 font-arabic"
        >
          <CircleArrowRight className="h-4 w-4" />
          السابق
        </Button>
        
        <span className="text-sm text-gray-600 font-arabic">
          المرحلة {currentPhaseIdx + 1} من {totalPhases}
        </span>
        
        <Button
          onClick={onNextPhase}
          disabled={!canGoNext}
          variant="outline"
          className="flex items-center gap-2 font-arabic"
        >
          التالي
          <CircleArrowLeft className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};