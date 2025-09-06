import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Dumbbell, FileText, CircleArrowLeft, CircleArrowRight } from 'lucide-react';

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
      <div className="flex gap-4 mb-6 justify-center">
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎵 Play button clicked');
            onPlayListening();
          }}
          disabled={isLoading}
          className="h-14 w-14 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          size="icon"
        >
          <Play className="h-6 w-6" />
        </Button>
        
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🏃 Practice button clicked');
            onStartPractice();
          }}
          disabled={isLoading}
          className="h-14 w-14 bg-green-500 hover:bg-green-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          size="icon"
        >
          <Dumbbell className="h-6 w-6" />
        </Button>
        
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('📝 Test button clicked');
            onStartTest();
          }}
          disabled={isLoading}
          className="h-14 w-14 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          size="icon"
        >
          <FileText className="h-6 w-6" />
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