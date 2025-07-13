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
  currentStep: 'playing' | 'listening' | 'completed' | 'ready-check' | 'testing';
  transcript: string;
  feedback: 'correct' | 'incorrect' | null;
  showFeedback: boolean;
  errorDetails: string;
  onStartReciting: () => void;
  onStopReciting: () => void;
  // New props for two-phase system
  recitingMode?: 'learning' | 'testing';
  onReadyForTesting?: () => void;
  onRestartLearning?: () => void;
  currentPhaseLabel?: string;
  // Navigation props
  currentPhaseIdx?: number;
  totalPhases?: number;
  onNextPhase?: () => void;
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
  errorDetails,
  onStartReciting,
  onStopReciting,
  recitingMode = 'learning',
  onReadyForTesting,
  onRestartLearning,
  currentPhaseLabel = '',
  currentPhaseIdx = 0,
  totalPhases = 0,
  onNextPhase
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
            <div className={`text-sm font-arabic p-5 rounded-xl border-2 shadow-lg ${
              feedback === 'correct' 
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 text-green-800' 
                : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-300 text-red-800'
            }`}>
              {feedback === 'correct' ? (
                <div className="flex flex-col items-center justify-center gap-3">
                  <span className="text-4xl animate-bounce">🎉</span>
                  <span className="text-xl font-bold">ممتاز! بارك الله فيك</span>
                  <span className="text-sm">الانتقال للآية التالية...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl">🔄</span>
                    <span className="font-bold text-xl">لا بأس - حاول مرة أخرى</span>
                  </div>
                  {errorDetails && (
                    <div className="text-sm bg-white/80 p-4 rounded-lg border border-red-300 shadow-inner">
                      <div className="font-semibold mb-2 text-red-900">التفاصيل:</div>
                      <div className="text-red-800 leading-relaxed whitespace-pre-line">{errorDetails}</div>
                    </div>
                  )}
                  {transcript && (
                    <div className="text-sm bg-white/80 p-4 rounded-lg border border-gray-300 shadow-inner">
                      <div className="font-semibold mb-2 text-gray-800">ما تم سماعه:</div>
                      <div className="italic text-gray-700 bg-gray-50 p-3 rounded border font-arabic text-right" dir="rtl">"{transcript}"</div>
                    </div>
                  )}
                   <div className="text-center text-xs text-red-700 font-semibold">
                     🎤 سيبدأ الاستماع مرة أخرى...
                   </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Ready check for testing mode */}
      {currentStep === 'ready-check' && (
        <div className="text-center mb-4 space-y-4">
          <div className="text-lg font-arabic p-6 rounded-xl border-2 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 text-blue-800 shadow-lg">
            <div className="flex flex-col items-center justify-center gap-4">
              <span className="text-4xl">🎯</span>
              <span className="text-xl font-bold">ممتاز! أكملت تعلم {currentPhaseLabel}</span>
              <span className="text-base">هل أنت مستعد لتلاوة هذه الآيات من الذاكرة؟</span>
              <div className="flex gap-4 mt-2">
                <Button
                  onClick={onReadyForTesting}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 font-arabic rounded-full"
                >
                  نعم، أنا مستعد
                </Button>
                <Button
                  onClick={onRestartLearning}
                  variant="outline"
                  className="border-blue-300 text-blue-600 hover:bg-blue-50 px-6 py-2 font-arabic rounded-full"
                >
                  لا، أريد التكرار
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Testing mode indicator */}
      {currentStep === 'testing' && recitingMode === 'testing' && (
        <div className="text-center mb-4">
          <div className="text-sm font-arabic p-4 rounded-xl border-2 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-300 text-purple-800 shadow-lg">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">🎤</span>
              <span className="font-bold">وضع الاختبار - ابدأ التلاوة من الذاكرة</span>
            </div>
          </div>
        </div>
      )}
      
          {/* Testing completion message */}
          {currentStep === 'completed' && recitingMode === 'testing' && (
            <div className="text-center mb-4">
              <div className="text-lg font-arabic p-6 rounded-xl border-2 bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 text-green-800 shadow-lg">
                <div className="flex flex-col items-center justify-center gap-4">
                  {currentPhaseIdx === totalPhases - 1 ? (
                    // Final phase completion - celebrate memorizing the entire surah
                    <>
                      <span className="text-5xl animate-bounce">🎉🎊</span>
                      <span className="text-2xl font-bold">مبارك! لقد حفظت سورة العلق كاملة</span>
                      <span className="text-base">تم حفظ تقدمك... بارك الله فيك وأعانك على المزيد</span>
                    </>
                  ) : (
                    // Regular phase completion
                    <>
                      <span className="text-4xl animate-bounce">🎉</span>
                      <span className="text-xl font-bold">ممتاز! أكملت اختبار هذه المرحلة بنجاح</span>
                      <span className="text-sm">تم حفظ تقدمك... يمكنك الانتقال للمرحلة التالية</span>
                      {onNextPhase && (
                        <Button
                          onClick={onNextPhase}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 font-arabic rounded-full shadow-lg mt-2"
                        >
                          الانتقال للمرحلة التالية
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
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
          onClick={onReadyForTesting}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 font-arabic text-base rounded-full shadow-md transition-all"
        >
          <Mic className="h-4 w-4 ml-2 fill-current" />
          بدء الاختبار
        </Button>
      </div>
    </>
  );
};
