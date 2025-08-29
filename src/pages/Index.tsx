
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

const Index = () => {
  const { user, loading } = useAuth();
  const { selectedChild } = useChildProfiles();
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [currentSurahId, setCurrentSurahId] = useState(114); // Start with An-Nas
  const [completedPhases, setCompletedPhases] = useState<Set<number>>(new Set());
  const [showNextPhasePrompt, setShowNextPhasePrompt] = useState(false);

  // Audio player and learning functionality
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


  // Load completed phases from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('ahmad-quran-completed-phases');
    if (savedProgress) {
      try {
        const completedPhaseIds = JSON.parse(savedProgress);
        setCompletedPhases(new Set(completedPhaseIds));
      } catch (error) {
        console.error('Error loading completed phases:', error);
      }
    }
  }, []);

  // Save completed phases to localStorage
  useEffect(() => {
    localStorage.setItem('ahmad-quran-completed-phases', JSON.stringify(Array.from(completedPhases)));
  }, [completedPhases]);



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

  // Simple phase status calculation
  const currentPhaseId = currentSurahId * 100 + currentPhaseIdx + 1;
  const isCurrentPhaseCompleted = completedPhases.has(currentPhaseId);
  const totalPhases = currentStudyPhases.length;

  // Reset to phase 0 when surah changes
  useEffect(() => {
    setCurrentPhaseIdx(0);
  }, [currentSurahId]);

  // Enhanced test completion handler - triggered when test step completes
  useEffect(() => {
    if (currentStep === 'completed' && recitingMode === 'testing') {
      console.log('Test completed for phase:', currentPhaseId);
      
      // Mark phase as completed if not already
      if (!completedPhases.has(currentPhaseId)) {
        setCompletedPhases(prev => new Set([...prev, currentPhaseId]));
      }
      
      // Show next phase prompt after a delay
      setTimeout(() => {
        setShowNextPhasePrompt(true);
      }, 2000);
    }
  }, [currentStep, recitingMode, currentPhaseId, completedPhases]);

  // Simple learning test transition - user chooses when to start testing
  const handleStartCustomTest = () => {
    console.log('Starting custom test for phase:', currentPhaseId);
    if (handleReadyForTesting) {
      handleReadyForTesting();
    }
  };

  // Navigate to next phase
  const handleProceedToNextPhase = () => {
    setShowNextPhasePrompt(false);
    if (currentPhaseIdx < totalPhases - 1) {
      setCurrentPhaseIdx(prev => prev + 1);
    }
    // Reset audio when moving to next phase
    resetAudio();
  };

  // Stay on current phase
  const handleStayOnPhase = () => {
    setShowNextPhasePrompt(false);
  };

  // Simple navigation
  const handleManualNavigation = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      setCurrentPhaseIdx(i => Math.min(totalPhases - 1, i + 1));
    } else {
      setCurrentPhaseIdx(i => Math.max(0, i - 1));
    }
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
        
        {/* Surah Header */}
        <QuranHeader
          currentSurahName={`سورة ${currentSurah.arabicName}`}
          completedPhaseCount={completedPhases.size}
          totalPhases={totalPhases}
          currentPhaseIdx={currentPhaseIdx}
          setCurrentPhaseIdx={setCurrentPhaseIdx}
          completedTestingPhases={Array.from(completedPhases)}
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
              
              {/* Audio Controls - Learning and Testing */}
              <AudioControls
                isPlaying={isPlaying}
                audioError={audioError}
                showAudioError={showAudioError}
                isPhaseComplete={false}
                hasAttemptedPlay={hasAttemptedPlay}
                onPlayPause={() => handlePlayPause(phase.verses)}
                onMarkComplete={() => {}}
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
                onReadyForTesting={handleStartCustomTest}
                onRestartLearning={handleRestartLearning}
                currentPhaseLabel={phase.label}
                currentPhaseIdx={currentPhaseIdx}
                totalPhases={totalPhases}
                onNextPhase={() => handleManualNavigation('next')}
              />
              
              {/* Simple additional test button */}
              <div className="flex justify-center gap-4 mt-4">
                <Button
                  onClick={handleStartCustomTest}
                  disabled={isReciting && recitingMode === 'testing'}
                  variant="outline"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 font-arabic rounded-full border-purple-600"
                >
                  {recitingMode === 'testing' && isReciting ? 'جاري الاختبار...' : 'اختبار سريع'}
                </Button>
              </div>
            </Card>
            
            {/* Phase navigation */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center gap-2">
                 <Button
                   onClick={() => handleManualNavigation('prev')}
                   disabled={currentPhaseIdx === 0}
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
                   onClick={() => handleManualNavigation('next')}
                   disabled={currentPhaseIdx >= totalPhases - 1}
                  variant="outline"
                  className="rounded-full border-2 border-emerald-400 text-emerald-600 hover:bg-emerald-50 font-arabic p-0 w-10 h-10 flex items-center justify-center"
                  size="icon"
                  aria-label="التالي"
                >
                  <CircleArrowLeft className="h-6 w-6" />
                </Button>
              </div>
            </div>
        </div>
        
        {/* Next Phase Prompt Dialog */}
        <Dialog open={showNextPhasePrompt} onOpenChange={setShowNextPhasePrompt}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center font-arabic text-lg">
                ممتاز! أكملت المرحلة بنجاح 🎉
              </DialogTitle>
            </DialogHeader>
            <div className="text-center space-y-4 p-4">
              <p className="font-arabic text-base text-gray-700">
                هل تريد الانتقال إلى المرحلة التالية؟
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleProceedToNextPhase}
                  disabled={currentPhaseIdx >= totalPhases - 1}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 font-arabic rounded-full"
                >
                  نعم، المرحلة التالية
                </Button>
                <Button
                  onClick={handleStayOnPhase}
                  variant="outline"
                  className="border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-2 font-arabic rounded-full"
                >
                  لا، البقاء هنا
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
        
      {/* Right Side - Progress Section */}
      <div className="w-80 border-l">
        <ProgressSection
          currentSurahId={currentSurahId}
          completedSurahs={[]}
          completedTestingPhases={Array.from(completedPhases)}
          onSurahSelect={setCurrentSurahId}
          getSurahProficiency={() => "0"}
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
