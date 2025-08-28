import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface DebugPanelProps {
  isReciting: boolean;
  currentStep: string;
  isListening: boolean;
  transcript: string;
  currentVerseIndex: number;
  recitingMode: string;
  feedback: string | null;
  showFeedback: boolean;
  onForceNextStep?: () => void;
  onForceStartListening?: () => void;
  onForceClearTranscript?: () => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  isReciting,
  currentStep,
  isListening,
  transcript,
  currentVerseIndex,
  recitingMode,
  feedback,
  showFeedback,
  onForceNextStep,
  onForceStartListening,
  onForceClearTranscript
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 bg-gray-100 hover:bg-gray-200 text-xs"
      >
        🐛 Debug
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 max-h-96 overflow-y-auto z-50 p-4 bg-white shadow-lg border-2">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm">Debug Panel</h3>
        <Button
          onClick={() => setIsVisible(false)}
          variant="ghost"
          size="sm"
          className="text-xs"
        >
          ✕
        </Button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div><strong>Is Reciting:</strong> {isReciting ? '✅' : '❌'}</div>
        <div><strong>Current Step:</strong> {currentStep}</div>
        <div><strong>Is Listening:</strong> {isListening ? '🎤' : '🔇'}</div>
        <div><strong>Reciting Mode:</strong> {recitingMode}</div>
        <div><strong>Verse Index:</strong> {currentVerseIndex}</div>
        <div><strong>Feedback:</strong> {feedback || 'None'}</div>
        <div><strong>Show Feedback:</strong> {showFeedback ? '✅' : '❌'}</div>
        <div><strong>Transcript:</strong></div>
        <div className="bg-gray-100 p-2 rounded text-xs max-h-20 overflow-y-auto">
          {transcript || 'Empty'}
        </div>
      </div>
      
      <div className="mt-3 space-y-1">
        <Button
          onClick={onForceStartListening}
          size="sm"
          className="w-full text-xs"
          variant="outline"
        >
          🎤 Force Start Listening
        </Button>
        <Button
          onClick={onForceClearTranscript}
          size="sm"
          className="w-full text-xs"
          variant="outline"
        >
          🧹 Clear Transcript
        </Button>
        <Button
          onClick={onForceNextStep}
          size="sm"
          className="w-full text-xs"
          variant="outline"
        >
          ⏭️ Force Next Step
        </Button>
      </div>
    </Card>
  );
};