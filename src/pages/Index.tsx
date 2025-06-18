
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircleArrowLeft, CircleArrowRight } from 'lucide-react';
import { AlAlaqVerses, studyPhases, getPhaseData } from '@/data/studyPhases';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { QuranHeader } from '@/components/QuranHeader';
import { VerseDisplay } from '@/components/VerseDisplay';
import { AudioControls } from '@/components/AudioControls';

const Index = () => {
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [completedVerses, setCompletedVerses] = useState<number[]>([]);
  const {
    isPlaying,
    audioError,
    audioRef,
    currentAyahIdx,
    hasAttemptedPlay,
    handlePlayPause,
    resetAudio,
    onAudioEnded,
    onAudioError
  } = useAudioPlayer();

  const phase = getPhaseData(currentPhaseIdx);
  const phaseVerseObjs = phase.verses.map(
    vnum => AlAlaqVerses.find(v => v.id === vnum)
  ).filter(Boolean) as {id: number, arabic: string}[];

  // When phase changes, reset audio
  useEffect(() => {
    resetAudio();
  }, [currentPhaseIdx, resetAudio]);

  const isPhaseComplete = phase.verses.every(id => completedVerses.includes(id));
  const completedPhaseCount = studyPhases.filter(phase =>
    phase.verses.every(id => completedVerses.includes(id))
  ).length;
  const totalPhases = studyPhases.length;
  const progress = (completedPhaseCount / totalPhases) * 100;

  const handleMarkPhaseComplete = () => {
    setCompletedVerses(prev => {
      const newIds = phase.verses.filter(id => !prev.includes(id));
      return [...prev, ...newIds];
    });
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex flex-col justify-start transition-colors">
      {/* Decorative background */}
      <div className="absolute -top-24 -left-16 w-60 h-60 rounded-full bg-emerald-100 opacity-35 blur-3xl z-0 pointer-events-none" />
      <div className="absolute -bottom-16 right-0 w-56 h-56 rounded-full bg-amber-100 opacity-40 blur-2xl z-0 pointer-events-none" />

      <QuranHeader
        completedPhaseCount={completedPhaseCount}
        totalPhases={totalPhases}
        progress={progress}
        currentPhaseIdx={currentPhaseIdx}
        setCurrentPhaseIdx={setCurrentPhaseIdx}
        completedVerses={completedVerses}
      />

      {/* Main Content */}
      <div className="relative z-10 px-3 py-4 md:p-7 space-y-6 md:space-y-9 max-w-2xl mx-auto w-full flex-grow">
        {/* Surah Title & Phase Info */}
        <Card className="p-4 md:p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-sm mb-1">
          <div className="text-center">
            <h2 className="text-lg md:text-xl font-bold text-emerald-700 mb-0.5 font-arabic">سورة العلق</h2>
            <div className="flex items-center justify-center space-x-1 gap-1 flex-wrap mt-2">
              <span className="text-xs px-3 py-0.5 rounded-full font-arabic bg-white shadow text-emerald-700 border border-amber-100">
                {phase.label}
              </span>
              <span className="text-xs px-3 py-0.5 rounded-full font-arabic bg-amber-50 text-amber-700 border border-amber-100">
                {phase.description}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1 font-arabic">١٩ آية • مكية</p>
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
            isPlaying={isPlaying}
          />
          
          <AudioControls
            isPlaying={isPlaying}
            audioError={audioError}
            isPhaseComplete={isPhaseComplete}
            hasAttemptedPlay={hasAttemptedPlay}
            onPlayPause={() => handlePlayPause(phase.verses)}
            onMarkComplete={handleMarkPhaseComplete}
            audioRef={audioRef}
            onAudioEnded={() => onAudioEnded(phase.verses)}
            onAudioError={onAudioError}
          />
        </Card>
        
        {/* Phase navigation */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center gap-2">
            <Button
              onClick={() => setCurrentPhaseIdx(i => Math.max(0, i - 1))}
              disabled={currentPhaseIdx === 0}
              variant="outline"
              className="rounded-full border-2 border-emerald-400 text-emerald-600 hover:bg-emerald-50 font-arabic p-0 w-10 h-10 flex items-center justify-center"
              size="icon"
              aria-label="السابق"
            >
              <CircleArrowRight className="h-6 w-6" />
            </Button>
            <span className="text-base font-arabic font-bold px-2 rounded-full bg-amber-100 text-amber-700 border border-amber-300">
              {phase.label}
            </span>
            <Button
              onClick={() => setCurrentPhaseIdx(i => Math.min(totalPhases - 1, i + 1))}
              disabled={currentPhaseIdx === totalPhases - 1}
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
        {completedVerses.length === AlAlaqVerses.length && (
          <Card className="p-7 relative mt-7 bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-300 animate-enter rounded-2xl shadow-2xl ring-4 ring-amber-200">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2">
              <span className="text-6xl animate-bounce">🎉</span>
            </div>
            <div className="text-center space-y-2 mt-4">
              <h3 className="text-xl md:text-2xl font-bold text-amber-700 font-arabic mb-1">مبروك!</h3>
              <p className="text-amber-600 font-arabic text-base" dir="rtl">
                لقد أكملت حفظ سورة العلق! بارك الله في جهودك في حفظ كلام الله
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

// Add custom slower "bounce" animation (gentler) to tailwind via inline global style
const style = document.createElement('style');
style.textContent = `
  @keyframes bounce-gentler {
    0%, 100% { transform: translateY(0);}
    50% { transform: translateY(-4px);}
  }
  .animate-bounce-gentler {
    animation: bounce-gentler 3.5s infinite;
  }
`;
if (!document.getElementById('gentleBounceStyle')) {
  style.id = 'gentleBounceStyle';
  document.head.appendChild(style);
}

export default Index;
