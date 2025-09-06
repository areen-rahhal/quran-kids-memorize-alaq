import { useState, useEffect, useRef, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircleArrowLeft, CircleArrowRight } from 'lucide-react';
import { AlAlaqVerses, studyPhases, getPhaseData } from '@/data/studyPhases';
import { AnNasVerses, anNasStudyPhases, getAnNasPhaseData } from '@/data/anNasData';
import { getCurrentSurah } from '@/data/juz30';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useAuth } from '@/hooks/useAuth';
import { useChildProfiles } from '@/hooks/useChildProfiles';
import { SurahPhasesSummary } from '@/components/SurahPhasesSummary';
import { CurrentPhaseLearning } from '@/components/CurrentPhaseLearning';
import { ProgressSection } from '@/components/ProgressSection';
import { VerseDisplay } from '@/components/VerseDisplay';
import { AudioControls } from '@/components/AudioControls';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';

import { toast } from 'sonner';

const Index = () => {
  const { user, loading } = useAuth();
  const { selectedChild, getSurahProficiency, getCompletedSurahs } = useChildProfiles();
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(() => {
    console.log('🎯 Initial currentPhaseIdx state');
    return 0;
  });
  const [completedVerses, setCompletedVerses] = useState<number[]>([]);
  const [completedPhases, setCompletedPhases] = useState<Set<number>>(new Set());
  // Removed complex state variables - using direct calculations instead
  const [currentSurahId, setCurrentSurahId] = useState(114); // Start with An-Nas (first surah to learn)
  const [completedSurahs, setCompletedSurahs] = useState<number[]>([]);
  const [isProcessingTranscript, setIsProcessingTranscript] = useState(false);
  const [isProcessingTestCompletion, setIsProcessingTestCompletion] = useState(false);
  const [showPhaseComplete, setShowPhaseComplete] = useState(false);
  const processingRef = useRef(false);


  // Initialize progress once on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('ahmad-quran-progress');
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        setCompletedVerses(progress.completedVerses || []);
        setCompletedPhases(new Set(progress.completedTestingPhases || []));
        setCurrentPhaseIdx(progress.currentPhaseIdx || 0);
        setCurrentSurahId(progress.currentSurahId || 114);
        setCompletedSurahs(progress.completedSurahs || []);
        console.log('📁 Restored progress from localStorage');
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    }
  }, []);

  // Update with child-specific data when selectedChild changes
  useEffect(() => {
    if (selectedChild) {
      const childCompletedSurahs = getCompletedSurahs();
      setCompletedSurahs(childCompletedSurahs);
      
      // Set current surah to first incomplete surah or default
      if (childCompletedSurahs.length > 0) {
        const allSurahs = [114, 113, 112, 111, 110];
        const nextSurah = allSurahs.find(id => !childCompletedSurahs.includes(id));
        if (nextSurah) {
          setCurrentSurahId(nextSurah);
        }
      }
    }
  }, [selectedChild]);

  // Save progress to localStorage whenever it changes (skip during test completion processing)
  useEffect(() => {
    if (!isProcessingTestCompletion) {
      const progress = {
        completedVerses,
        completedTestingPhases: [...completedPhases],
        currentPhaseIdx,
        currentSurahId,
        completedSurahs,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('ahmad-quran-progress', JSON.stringify(progress));
    }
  }, [completedVerses, completedPhases, currentPhaseIdx, currentSurahId, completedSurahs, isProcessingTestCompletion]);

  const {
    isPlaying,
    audioError,
    showAudioError,
    audioRef,
    currentAyahIdx,
    hasAttemptedPlay,
    isLoading,
    retryCount,
    handlePlayPause,
    resetAudio,
    retryAudio,
    onAudioEnded,
    onAudioError,
    isReciting,
    currentStep,
    isListening,
    transcript,
    feedback,
    showFeedback,
    errorDetails,
    highlightedWords,
    recitingMode,
    revealedTestingVerses,
    handleStartReciting,
    handleStopReciting,
    handleListeningComplete,
    updateWordHighlighting,
    handleReadyForTesting,
    handleRestartLearning
  } = useAudioPlayer(currentSurahId);

  // Enhanced debugging functions
  const handleForceStartListening = () => {
    console.log('🔧 MANUAL: Force starting speech recognition');
    toast.info('🎤 محاولة بدء الاستماع يدوياً...');
  };

  const handleForceClearTranscript = () => {
    console.log('🔧 MANUAL: Force clearing transcript');
    toast.info('🧹 محاولة مسح النص...');
  };

  const handleForceNextStep = () => {
    console.log('🔧 MANUAL: Force proceeding to next step');
    toast.info('⏭️ محاولة الانتقال للخطوة التالية...');
  };

  // Get current surah data
  const currentSurah = getCurrentSurah(currentSurahId);
  const isAnNas = currentSurahId === 114;
  
  // Use the appropriate data based on current surah
  const currentVerses = isAnNas ? AnNasVerses : AlAlaqVerses;
  const currentStudyPhases = isAnNas ? anNasStudyPhases : studyPhases;
  const getCurrentPhaseData = isAnNas ? getAnNasPhaseData : getPhaseData;
  
  const phase = getCurrentPhaseData(currentPhaseIdx);
  const phaseVerseObjs = phase.verses.map(
    vnum => currentVerses.find(v => v.id === vnum)
  ).filter(Boolean) as {id: number, arabic: string}[];

  // Reset audio when phase or surah changes (skip during test completion processing)
  useEffect(() => {
    if (!isProcessingTestCompletion) {
      const timer = setTimeout(() => {
        resetAudio();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [currentPhaseIdx, currentSurahId, resetAudio, isProcessingTestCompletion]);

  // Reset to phase 0 when surah changes (only if phase doesn't exist)
  useEffect(() => {
    console.log('🔄 useEffect [currentSurahId, currentStudyPhases.length] - surah changed:', {
      currentSurahId,
      phasesLength: currentStudyPhases.length,
      currentPhaseIdx,
      willReset: currentPhaseIdx >= currentStudyPhases.length
    });
    
    if (currentPhaseIdx >= currentStudyPhases.length) {
      console.log('⚠️ Resetting phase index to 0 because current phase is out of bounds');
      setCurrentPhaseIdx(0);
    }
  }, [currentSurahId, currentStudyPhases.length]); // Removed currentPhaseIdx from dependencies

  // Simple transcript processing effect
  useEffect(() => {
    if (isReciting && !isListening && transcript && transcript.trim().length > 0) {
      console.log('Processing transcript:', transcript);
      
      if (currentStep === 'listening' || currentStep === 'testing') {
        const currentVerse = phaseVerseObjs[currentAyahIdx];
        const currentVerseText = currentVerse ? currentVerse.arabic : '';
        
        handleListeningComplete(phase.verses, currentVerseText);
      }
    }
  }, [transcript, isReciting, isListening, currentStep, phaseVerseObjs, currentAyahIdx, phase.verses, handleListeningComplete]);

  const isPhaseComplete = phase.verses.every(id => completedVerses.includes(id));
  
  // Simple direct calculations
  const currentPhaseId = currentSurahId * 100 + currentPhaseIdx + 1;
  const isCurrentPhaseCompleted = completedPhases.has(currentPhaseId);
  const completedPhaseCount = completedPhases.size;
  const totalPhases = currentStudyPhases.length;
  const progress = (completedPhaseCount / totalPhases) * 100;

  const handleMarkPhaseComplete = () => {
    // Only mark verses as complete if they aren't already
    setCompletedVerses(prev => {
      const newIds = phase.verses.filter(id => !prev.includes(id));
      if (newIds.length === 0) return prev; // Prevent unnecessary state update
      return [...prev, ...newIds];
    });
  };
  
  // Test completion handler
  const handleTestComplete = (phaseId: number) => {
    console.log('Test completed for phase:', phaseId);
    setIsProcessingTestCompletion(true);
    // Mark phase as completed
    setCompletedPhases(prev => new Set([...prev, phaseId]));
    // Show custom completion dialog
    setTimeout(() => {
      setIsProcessingTestCompletion(false);
      setShowPhaseComplete(true);
    }, 600);
  };
  
  // Test completion is now handled directly in useRecitingJourney via callback

  // Navigation handlers
  const handleManualNavigation = (direction: 'next' | 'prev') => {
    console.log('🚀 handleManualNavigation called:', { direction, currentPhaseIdx, totalPhases });
    
    if (direction === 'next') {
      setCurrentPhaseIdx(prev => {
        const nextIdx = Math.min(totalPhases - 1, prev + 1);
        console.log('➡️ Navigating to next phase:', prev, '->', nextIdx);
        return nextIdx;
      });
    } else {
      setCurrentPhaseIdx(prev => {
        const prevIdx = Math.max(0, prev - 1);
        console.log('⬅️ Navigating to prev phase:', prev, '->', prevIdx);
        return prevIdx;
      });
    }
  };
  
  // Test mode handler
  const handleStartTest = () => {
    console.log('Starting test mode for phase:', currentPhaseId);
    handleStartReciting(phase.verses, 'testing', () => handleTestComplete(currentPhaseId));
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground font-arabic">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex-1 flex">
      {/* Left Side - Surah Details */}
      <div className="flex-1 bg-gradient-to-br from-emerald-50 via-white to-amber-50 overflow-y-auto relative">
        {/* Decorative background */}
        <div className="absolute -top-24 -left-16 w-60 h-60 rounded-full bg-emerald-100 opacity-35 blur-3xl z-0 pointer-events-none" />
        <div className="absolute -bottom-16 right-0 w-56 h-56 rounded-full bg-amber-100 opacity-40 blur-2xl z-0 pointer-events-none" />
        
        <div className="relative z-10 px-3 py-4 md:p-7 space-y-6 md:space-y-9 max-w-2xl mx-auto w-full">
          {/* Component One - Surah Phases Summary */}
          <SurahPhasesSummary
            currentSurahName={`سورة ${currentSurah.arabicName}`}
            totalPhases={totalPhases}
            completedPhases={completedPhases}
            currentPhaseIdx={currentPhaseIdx}
            currentSurahId={currentSurahId}
          />

          {/* Component Two - Current Phase Learning */}
          <CurrentPhaseLearning
            currentPhaseIdx={currentPhaseIdx}
            totalPhases={totalPhases}
            phaseLabel={phase.label}
            phaseDescription={phase.description}
            phaseVerseObjs={phaseVerseObjs}
            onPlayListening={() => {
              console.log('🎵 onPlayListening called with verses:', phase.verses);
              handlePlayPause(phase.verses);
            }}
            onStartPractice={() => {
              console.log('🏃 onStartPractice called with verses:', phase.verses);
              handleStartReciting(phase.verses, 'learning');
            }}
            onStartTest={() => {
              console.log('📝 onStartTest called with verses:', phase.verses);
              handleStartReciting(phase.verses, 'testing');
            }}
            onPreviousPhase={() => handleManualNavigation('prev')}
            onNextPhase={() => handleManualNavigation('next')}
            canGoPrevious={currentPhaseIdx > 0}
            canGoNext={currentPhaseIdx < totalPhases - 1}
            isLoading={false}
            audioProps={{
              isPlaying,
              audioError,
              showAudioError,
              audioRef,
              onAudioEnded: () => onAudioEnded(phase.verses),
              onAudioError,
              isLoading,
              retryCount,
              onRetryAudio: () => retryAudio(phase.verses),
              isReciting,
              isListening,
              currentStep,
              transcript,
              feedback,
              showFeedback,
              errorDetails,
              onStopReciting: handleStopReciting,
              recitingMode,
              onReadyForTesting: handleReadyForTesting,
              onRestartLearning: handleRestartLearning,
              revealedTestingVerses
            }}
          />
            
            {/* Completion Message */}
            {completedVerses.length === currentVerses.length && (
              <Card className="p-7 relative mt-7 bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-300 animate-enter rounded-2xl shadow-2xl ring-4 ring-amber-200">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                  <span className="text-6xl animate-bounce">🎉</span>
                </div>
                <div className="text-center space-y-2 mt-4">
                  <h3 className="text-xl md:text-2xl font-bold text-amber-700 font-arabic mb-1">مبروك!</h3>
                  <p className="text-amber-600 font-arabic text-base" dir="rtl">
                    لقد أكملت حفظ سورة {currentSurah.arabicName}! بارك الله في جهودك في حفظ كلام الله
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
        
        
        {/* Right Side - Progress Section */}
        <div className="w-80 border-l">
          <ProgressSection
            onSurahSelect={(surah) => setCurrentSurahId(surah.id)}
            onPhaseSelect={(surah, phase) => {
              setCurrentSurahId(surah.id);
            }}
            completedPhases={completedPhases}
            currentSurahId={currentSurahId}
            currentPhaseIdx={currentPhaseIdx}
          />
        </div>

        {/* Phase completion dialog */}
        <AlertDialog open={showPhaseComplete} onOpenChange={setShowPhaseComplete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-arabic text-xl">🎉 مبروك! أكملت هذه المرحلة</AlertDialogTitle>
              <AlertDialogDescription className="font-arabic">هل تريدين إعادة الاختبار، المتابعة، أم التوقّف؟</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowPhaseComplete(false)} className="font-arabic">توقّف</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setShowPhaseComplete(false);
                  handleStartReciting(phase.verses, 'testing');
                }}
                className="bg-purple-600 hover:bg-purple-700 font-arabic"
              >إعادة الاختبار</AlertDialogAction>
              <AlertDialogAction
                onClick={() => {
                  setShowPhaseComplete(false);
                  if (currentPhaseIdx < totalPhases - 1) {
                    setCurrentPhaseIdx((p) => p + 1);
                  }
                }}
                className="bg-emerald-600 hover:bg-emerald-700 font-arabic"
              >المتابعة</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
};

// Add custom animations to tailwind via inline global style
const style = document.createElement('style');
style.textContent = `
  @keyframes bounce-gentler {
    0%, 100% { transform: translateY(0);}
    50% { transform: translateY(-4px);}
  }
  .animate-bounce-gentler {
    animation: bounce-gentler 3.5s infinite;
  }
  @keyframes fade-in {
    0% { opacity: 0; transform: translateY(10px) scale(0.95); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  .animate-fade-in {
    animation: fade-in 0.6s ease-out forwards;
  }
`;
if (!document.getElementById('gentleBounceStyle')) {
  style.id = 'gentleBounceStyle';
  document.head.appendChild(style);
}

export default Index;
