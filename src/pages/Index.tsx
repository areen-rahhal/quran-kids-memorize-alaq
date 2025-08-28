
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
import { QuranHeader } from '@/components/QuranHeader';
import { ProgressSection } from '@/components/ProgressSection';
import { VerseDisplay } from '@/components/VerseDisplay';
import { AudioControls } from '@/components/AudioControls';

import { toast } from 'sonner';

const Index = () => {
  const { user, loading } = useAuth();
  const { selectedChild, getSurahProficiency, getCompletedSurahs } = useChildProfiles();
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [completedVerses, setCompletedVerses] = useState<number[]>([]);
  const [completedTestingPhases, setCompletedTestingPhases] = useState<number[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [phaseCompletionInProgress, setPhaseCompletionInProgress] = useState(false);
  const [currentSurahId, setCurrentSurahId] = useState(114); // Start with An-Nas (first surah to learn)
  const [completedSurahs, setCompletedSurahs] = useState<number[]>([]);
  const [isProcessingTranscript, setIsProcessingTranscript] = useState(false);
  const processingRef = useRef(false);


  // Clear localStorage data for testing
  useEffect(() => {
    localStorage.removeItem('ahmad-quran-progress');
  }, []);

  // Clear localStorage data for testing
  useEffect(() => {
    localStorage.removeItem('ahmad-quran-progress');
  }, []);

  // Load progress from localStorage on mount and update with child data
  useEffect(() => {
    const savedProgress = localStorage.getItem('ahmad-quran-progress');
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        setCompletedVerses(progress.completedVerses || []);
        setCompletedTestingPhases(progress.completedTestingPhases || []);
        setCurrentPhaseIdx(progress.currentPhaseIdx || 0);
        setCurrentSurahId(progress.currentSurahId || 114);
        setCompletedSurahs(progress.completedSurahs || []);
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    }

    // Update with child-specific data when available
    if (selectedChild) {
      const childCompletedSurahs = getCompletedSurahs();
      setCompletedSurahs(childCompletedSurahs);
      
      // Set current surah to first incomplete surah or default
      if (childCompletedSurahs.length > 0) {
        // Find next surah to work on (first incomplete one)
        const allSurahs = [114, 113, 112, 111, 110]; // Add more as needed
        const nextSurah = allSurahs.find(id => !childCompletedSurahs.includes(id));
        if (nextSurah) {
          setCurrentSurahId(nextSurah);
        }
      }
    }
  }, [selectedChild, getCompletedSurahs]);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    const progress = {
      completedVerses,
      completedTestingPhases,
      currentPhaseIdx,
      currentSurahId,
      completedSurahs,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('ahmad-quran-progress', JSON.stringify(progress));
  }, [completedVerses, completedTestingPhases, currentPhaseIdx, currentSurahId, completedSurahs]);

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

  // When phase changes or surah changes, reset audio (but not during completion flow)
  useEffect(() => {
    // Don't reset if we just completed a testing phase - let the user navigate naturally
    if (currentStep === 'completed' && recitingMode === 'testing') {
      return;
    }
    // Reset only when actually changing phases, not during the completion process
    const timer = setTimeout(() => {
      resetAudio();
    }, 100); // Small delay to prevent interference with completion flow
    
    return () => clearTimeout(timer);
  }, [currentPhaseIdx, currentSurahId, resetAudio]);

  // Reset to phase 0 when surah changes
  useEffect(() => {
    setCurrentPhaseIdx(0);
  }, [currentSurahId]);

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
  
  // Refs for tracking phase transitions to prevent flickering
  const completingPhaseRef = useRef<number | null>(null);
  const transitionLockRef = useRef<boolean>(false);
  
  // Generate consistent phase ID for current phase
  const currentPhaseId = currentSurahId * 100 + currentPhaseIdx + 1;
  
  // Create stable display phase ID that doesn't change during transitions
  const displayPhaseId = useMemo(() => {
    if (transitionLockRef.current && completingPhaseRef.current) {
      return completingPhaseRef.current;
    }
    return currentPhaseId;
  }, [currentPhaseId, phaseCompletionInProgress]);
  
  // Stable completion status using display phase ID to prevent flickering
  const isCurrentPhaseCompleted = useMemo(() => {
    // During transitions, use the completing phase for status
    if (transitionLockRef.current && completingPhaseRef.current) {
      return completedTestingPhases.includes(completingPhaseRef.current);
    }
    return completedTestingPhases.includes(currentPhaseId);
  }, [completedTestingPhases, currentPhaseId, phaseCompletionInProgress]);
  
  // Stable progress calculation that doesn't flicker during transitions
  const stableCompletedPhases = phaseCompletionInProgress && !isCurrentPhaseCompleted 
    ? [...completedTestingPhases, displayPhaseId] 
    : completedTestingPhases;
  const completedPhaseCount = stableCompletedPhases.length;
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
  
  // Handle testing phase completion with automatic navigation using refs to prevent flickering
  useEffect(() => {
    if (currentStep === 'completed' && 
        recitingMode === 'testing' && 
        !phaseCompletionInProgress) {
      
      // Check if this phase is already completed to prevent duplicate processing
      if (completedTestingPhases.includes(currentPhaseId)) {
        return;
      }
      
      console.log('Marking phase as completed:', currentPhaseId);
      
      // Set transition lock and completing phase ref to prevent flickering
      transitionLockRef.current = true;
      completingPhaseRef.current = currentPhaseId;
      setPhaseCompletionInProgress(true);
      
      // Mark phase as completed immediately using consistent ID
      setCompletedTestingPhases(prev => {
        if (prev.includes(currentPhaseId)) return prev;
        const newCompleted = [...prev, currentPhaseId];
        console.log('Updated completed phases:', newCompleted);
        return newCompleted;
      });
      
      // Auto-navigate to next phase after delay
      const timer = setTimeout(() => {
        const nextPhaseIdx = currentPhaseIdx + 1;
        if (nextPhaseIdx < totalPhases) {
          console.log('Auto-navigating to next phase:', nextPhaseIdx);
          setIsTransitioning(true);
          setCurrentPhaseIdx(nextPhaseIdx);
          
          // Reset transition state and refs after navigation
          setTimeout(() => {
            setIsTransitioning(false);
            setPhaseCompletionInProgress(false);
            transitionLockRef.current = false;
            completingPhaseRef.current = null;
          }, 500);
        } else {
          console.log('All phases completed!');
          toast.success('🎉 تم إنجاز جميع المراحل بنجاح!');
          setPhaseCompletionInProgress(false);
          transitionLockRef.current = false;
          completingPhaseRef.current = null;
        }
      }, 2000);
      
      return () => {
        clearTimeout(timer);
        // Cleanup refs if effect is cancelled
        transitionLockRef.current = false;
        completingPhaseRef.current = null;
      };
    }
  }, [currentStep, recitingMode, phaseCompletionInProgress, currentPhaseId, completedTestingPhases, currentPhaseIdx, totalPhases]);

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
        
        {/* Surah Header */}
        <QuranHeader
          currentSurahName={`سورة ${currentSurah.arabicName}`}
          completedPhaseCount={completedPhaseCount}
          totalPhases={totalPhases}
          currentPhaseIdx={currentPhaseIdx}
          setCurrentPhaseIdx={setCurrentPhaseIdx}
          completedTestingPhases={completedTestingPhases}
        />
        
        <div className="relative z-10 px-3 py-4 md:p-7 space-y-6 md:space-y-9 max-w-2xl mx-auto w-full">

            {/* Surah Title & Phase Info */}
            <Card className="p-4 md:p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-sm mb-1">
              <div className="text-center">
                <h2 className="text-lg md:text-xl font-bold text-emerald-700 mb-0.5 font-arabic">سورة {currentSurah.arabicName}</h2>
                <div className="flex items-center justify-center space-x-1 gap-1 flex-wrap mt-2">
                  <span className={`text-xs px-3 py-0.5 rounded-full font-arabic shadow border ${
                    isCurrentPhaseCompleted 
                      ? 'bg-green-100 text-green-700 border-green-300' 
                      : 'bg-white text-emerald-700 border-amber-100'
                  }`}>
                    {isCurrentPhaseCompleted && '✓ '}
                    {phase.label}
                  </span>
                  <span className="text-xs px-3 py-0.5 rounded-full font-arabic bg-amber-50 text-amber-700 border border-amber-100">
                    {phase.description}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1 font-arabic">{currentSurah.verses} آية • مكية</p>
              </div>
            </Card>

            {/* Phase Verses */}
            <Card className="relative overflow-visible p-3 md:p-6 bg-white shadow-xl border-l-8 border-emerald-500 rounded-2xl flex flex-col justify-center items-center min-h-[70px]">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-200 border-emerald-100 border px-4 py-1 rounded-full shadow-lg font-arabic text-emerald-700 text-xs md:text-sm font-bold flex items-center gap-2">
                <span>{phase.label}</span>
                <span>({phase.description})</span>
              </div>
              
              <VerseDisplay 
                phaseVerseObjs={phaseVerseObjs}
                currentPhaseIdx={currentPhaseIdx}
                totalPhases={totalPhases}
                currentAyahIdx={currentAyahIdx}
                isPlaying={isPlaying || isReciting}
                highlightedWords={highlightedWords}
                expectedText={phaseVerseObjs[currentAyahIdx]?.arabic || ''}
                isListening={isListening}
                recitingMode={recitingMode}
                revealedTestingVerses={revealedTestingVerses}
                currentStep={currentStep}
              />
              
              <AudioControls
                isPlaying={isPlaying}
                audioError={audioError}
                showAudioError={showAudioError}
                isPhaseComplete={isPhaseComplete}
                hasAttemptedPlay={hasAttemptedPlay}
                onPlayPause={() => handlePlayPause(phase.verses)}
                onMarkComplete={handleMarkPhaseComplete}
                audioRef={audioRef}
                onAudioEnded={() => {
                  console.log('🔊 Audio ended event triggered from Index component');
                  onAudioEnded(phase.verses);
                }}
                onAudioError={onAudioError}
                isLoading={isLoading}
                retryCount={retryCount}
                onRetryAudio={() => retryAudio(phase.verses)}
                isReciting={isReciting}
                isListening={isListening}
                currentStep={currentStep}
                transcript={transcript}
                feedback={feedback}
                showFeedback={showFeedback}
                errorDetails={errorDetails}
                onStartReciting={() => handleStartReciting(phase.verses)}
                onStopReciting={handleStopReciting}
                recitingMode={recitingMode}
                onReadyForTesting={handleReadyForTesting}
                onRestartLearning={handleRestartLearning}
                currentPhaseLabel={phase.label}
                currentPhaseIdx={currentPhaseIdx}
                totalPhases={totalPhases}
                 onNextPhase={() => {
                   if (!isTransitioning && !phaseCompletionInProgress) {
                     setIsTransitioning(true);
                     setCurrentPhaseIdx(i => Math.min(totalPhases - 1, i + 1));
                     setTimeout(() => setIsTransitioning(false), 300);
                   }
                 }}
              />
            </Card>
            
            {/* Phase navigation */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center gap-2">
                 <Button
                   onClick={() => {
                     if (!isTransitioning && !phaseCompletionInProgress) {
                       setIsTransitioning(true);
                       setCurrentPhaseIdx(i => Math.max(0, i - 1));
                       setTimeout(() => setIsTransitioning(false), 300);
                     }
                   }}
                   disabled={currentPhaseIdx === 0 || isTransitioning || phaseCompletionInProgress}
                  variant="outline"
                  className="rounded-full border-2 border-emerald-400 text-emerald-600 hover:bg-emerald-50 font-arabic p-0 w-10 h-10 flex items-center justify-center"
                  size="icon"
                  aria-label="السابق"
                >
                  <CircleArrowRight className="h-6 w-6" />
                </Button>
                <span className={`text-base font-arabic font-bold px-2 rounded-full border ${
                  isCurrentPhaseCompleted
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : 'bg-amber-100 text-amber-700 border-amber-300'
                }`}>
                  {isCurrentPhaseCompleted && '✓ '}
                  {phase.label}
                </span>
                 <Button
                   onClick={() => {
                     if (!isTransitioning && !phaseCompletionInProgress) {
                       setIsTransitioning(true);
                       setCurrentPhaseIdx(i => Math.min(totalPhases - 1, i + 1));
                       setTimeout(() => setIsTransitioning(false), 300);
                     }
                   }}
                   disabled={currentPhaseIdx === totalPhases - 1 || isTransitioning || phaseCompletionInProgress}
                  variant="outline"
                  className="rounded-full border-2 border-emerald-400 text-emerald-600 hover:bg-emerald-50 font-arabic p-0 w-10 h-10 flex items-center justify-center"
                  size="icon"
                  aria-label="التالي"
                >
                  <CircleArrowLeft className="h-6 w-6" />
                </Button>
              </div>
            </div>
            
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
            currentSurahId={currentSurahId}
            completedSurahs={completedSurahs}
            completedTestingPhases={completedTestingPhases}
            onSurahSelect={setCurrentSurahId}
            getSurahProficiency={getSurahProficiency}
          />
        </div>
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
