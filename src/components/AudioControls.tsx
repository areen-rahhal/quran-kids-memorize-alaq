
import { Button } from '@/components/ui/button';
import { Play, Pause, Star, Mic, MicOff } from 'lucide-react';

interface AudioControlsProps {
  isPlaying: boolean;
  audioError: string | null;
  showAudioError: boolean;
  isPhaseComplete: boolean;
  hasAttemptedPlay: boolean;
  onPlayPause: () => void;
  onMarkComplete: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  onAudioEnded: () => void;
  onAudioError: () => void;
  // Reciting journey props
  isReciting: boolean;
  isListening: boolean;
  currentStep: 'playing' | 'listening' | 'completed';
  transcript: string;
  feedback: 'correct' | 'incorrect' | null;
  showFeedback: boolean;
  onStartReciting: () => void;
  onStopReciting: () => void;
}

export const AudioControls = ({
  isPlaying,
  audioError,
  showAudioError,
  isPhaseComplete,
  hasAttemptedPlay,
  onPlayPause,
  onMarkComplete,
  audioRef,
  onAudioEnded,
  onAudioError,
  isReciting,
  isListening,
  currentStep,
  transcript,
  feedback,
  showFeedback,
  onStartReciting,
  onStopReciting
}: AudioControlsProps) => {
  return (
    <>
      <audio
        ref={audioRef}
        onEnded={onAudioEnded}
        onError={onAudioError}
        preload="none"
        style={{ display: "none" }}
      />
      
      {showAudioError && audioError && (
        <div className="text-red-500 text-sm mb-2 text-center font-arabic">
          {audioError}
        </div>
      )}
      
      {/* Reciting journey status indicators */}
      {isReciting && (
        <div className="text-center mb-2 space-y-2">
          {currentStep === 'playing' && (
            <div className="text-blue-600 text-sm font-arabic animate-pulse">
              🔊 استمع للآية...
            </div>
          )}
          {currentStep === 'listening' && isListening && (
            <div className="text-green-600 text-sm font-arabic animate-pulse">
              🎤 جاري الاستماع... كرر الآية
            </div>
          )}
          {transcript && !showFeedback && (
            <div className="text-gray-600 text-xs font-arabic bg-gray-50 p-2 rounded">
              سمعت: {transcript}
            </div>
          )}
          {showFeedback && feedback && (
            <div className={`text-sm font-arabic p-3 rounded-lg border-2 ${
              feedback === 'correct' 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {feedback === 'correct' ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg">✅</span>
                  <span>أحسنت! انتقل للآية التالية</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg">❌</span>
                  <span>حاول مرة أخرى</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="flex justify-center gap-4 mt-4 items-center">
        <Button
          onClick={onPlayPause}
          disabled={isReciting}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-2 drop-shadow-lg scale-110 transition-all disabled:opacity-50"
          size="icon"
          aria-label={isPlaying ? "إيقاف الصوت" : "تشغيل الصوت"}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
        
        <Button
          onClick={isReciting ? onStopReciting : onStartReciting}
          className={`${
            isReciting 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white rounded-full p-2 drop-shadow-lg scale-110 transition-all`}
          size="icon"
          aria-label={isReciting ? "إيقاف التلاوة" : "بدء التلاوة والتكرار"}
        >
          {isReciting ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        
        <Button
          onClick={onMarkComplete}
          disabled={isPhaseComplete}
          className={`bg-amber-400 hover:bg-amber-500 text-white px-6 py-2 font-arabic text-base rounded-full shadow-md transition-all
            ${isPhaseComplete ? 'opacity-70 scale-95' : 'animate-bounce-gentle'}
          `}
        >
          <Star className="h-4 w-4 ml-2 fill-current" />
          {isPhaseComplete ? "تمت المرحلة!" : "تم الحفظ"}
        </Button>
      </div>
    </>
  );
};
