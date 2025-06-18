
import { Button } from '@/components/ui/button';
import { Play, Pause, Star, Mic, MicOff } from 'lucide-react';

interface AudioControlsProps {
  isPlaying: boolean;
  audioError: string | null;
  isPhaseComplete: boolean;
  hasAttemptedPlay: boolean;
  onPlayPause: () => void;
  onMarkComplete: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  onAudioEnded: () => void;
  onAudioError: () => void;
  // New props for reciting journey
  isReciting: boolean;
  isListening: boolean;
  onStartReciting: () => void;
  onStopReciting: () => void;
}

export const AudioControls = ({
  isPlaying,
  audioError,
  isPhaseComplete,
  hasAttemptedPlay,
  onPlayPause,
  onMarkComplete,
  audioRef,
  onAudioEnded,
  onAudioError,
  isReciting,
  isListening,
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
      
      {audioError && hasAttemptedPlay && (
        <div className="text-red-500 text-sm mb-2 text-center font-arabic">
          {audioError}
        </div>
      )}
      
      {/* Listening indicator */}
      {isListening && (
        <div className="text-blue-600 text-sm mb-2 text-center font-arabic animate-pulse">
          🎤 جاري الاستماع... كرر الآية
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
