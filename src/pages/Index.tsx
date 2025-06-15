import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, BookOpen, Star, CircleArrowLeft, CircleArrowRight } from 'lucide-react';

// All verses, as before
const AlAlaqVerses = [
  { id: 1, arabic: "ٱقْرَأْ بِٱسْمِ رَبِّكَ ٱلَّذِى خَلَقَ" },
  { id: 2, arabic: "خَلَقَ ٱلْإِنسَـٰنَ مِنْ عَلَقٍ" },
  { id: 3, arabic: "ٱقْرَأْ وَرَبُّكَ ٱلْأَكْرَمُ" },
  { id: 4, arabic: "ٱلَّذِى عَلَّمَ بِٱلْقَلَمِ" },
  { id: 5, arabic: "عَلَّمَ ٱلْإِنسَـٰنَ مَا لَمْ يَعْلَمْ" },
  { id: 6, arabic: "كَلَّآ إِنَّ ٱلْإِنسَـٰنَ لَيَطْغَىٰٓ" },
  { id: 7, arabic: "أَن رَّءَاهُ ٱسْتَغْنَىٰ" },
  { id: 8, arabic: "إِنَّ إِلَىٰ رَبِّكَ ٱلرُّجْعَىٰ" },
  { id: 9, arabic: "أَرَءَيْتَ ٱلَّذِى يَنْهَىٰ" },
  { id: 10, arabic: "عَبْدًا إِذَا صَلَّىٰ" },
  { id: 11, arabic: "أَرَءَيْتَ إِن كَانَ عَلَى ٱلْهُدَىٰٓ" },
  { id: 12, arabic: "أَوْ أَمَرَ بِٱلتَّقْوَىٰٓ" },
  { id: 13, arabic: "أَرَءَيْتَ إِن كَذَّبَ وَتَوَلَّىٰٓ" },
  { id: 14, arabic: "أَلَمْ يَعْلَم بِأَنَّ ٱللَّهَ يَرَىٰ" },
  { id: 15, arabic: "كَلَّا لَئِن لَّمْ يَنتَهِ لَنَسْفَعًۢا بِٱلنَّاصِيَةِ" },
  { id: 16, arabic: "نَاصِيَةٍ كَـٰذِبَةٍ خَاطِئَةٍ" },
  { id: 17, arabic: "فَلْيَدْعُ نَادِيَهُۥ" },
  { id: 18, arabic: "سَنَدْعُ ٱلزَّبَانِيَةَ" },
  { id: 19, arabic: "كَلَّا لَا تُطِعْهُ وَٱسْجُدْ وَٱقْتَرِب ۩" }
];

// STUDY PLAN FOR THIS SURAH, dynamic for the surah & student, hardcoded here as requested
const studyPhases = [
  { label: "المرحلة ١", description: "الآيات ١–٣", verses: [1, 2, 3] },
  { label: "المرحلة ٢", description: "الآيات ٤–٥", verses: [4, 5] },
  { label: "المرحلة ٣", description: "الآيات ٦–٨", verses: [6, 7, 8] },
  { label: "المرحلة ٤", description: "الآيات ٩–١٤", verses: [9, 10, 11, 12, 13, 14] },
  { label: "المرحلة ٥", description: "الآيات ١٥–١٩", verses: [15, 16, 17, 18, 19] },
];

// Helpers: get phase data by phase index
const getPhaseData = (phaseIdx: number) => studyPhases[phaseIdx] || studyPhases[0];

const Index = () => {
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedVerses, setCompletedVerses] = useState<number[]>([]);

  const phase = getPhaseData(currentPhaseIdx);
  const phaseVerseObjs = phase.verses.map(
    vnum => AlAlaqVerses.find(v => v.id === vnum)
  ).filter(Boolean) as {id: number, arabic: string}[];

  // All *phases* that are fully completed:
  const isPhaseComplete = phase.verses.every(id => completedVerses.includes(id));
  const completedPhaseCount = studyPhases.filter(phase =>
    phase.verses.every(id => completedVerses.includes(id))
  ).length;
  const totalPhases = studyPhases.length;
  // Progress: now phase-based
  const progress = (completedPhaseCount / totalPhases) * 100;

  const handleMarkPhaseComplete = () => {
    setCompletedVerses(prev => {
      const newIds = phase.verses.filter(id => !prev.includes(id));
      return [...prev, ...newIds];
    });
  };

  // Prepare continuous Arabic for phase, separated with ۝, and show verse number for each verse
  const continuousArabic = (
    <span className="flex flex-wrap gap-x-3 gap-y-2 justify-center items-baseline" dir="rtl">
      {phaseVerseObjs.map((v, idx) => (
        <span key={v.id} className="inline-flex items-baseline">
          <span className="relative flex items-baseline">
            <span
              className="ml-1 px-1.5 py-0.5 rounded-lg bg-amber-100 text-amber-700 text-xs font-arabic border border-amber-200 align-middle"
              style={{ fontWeight: 800, minWidth: 22, display: 'inline-block', lineHeight: 1.3 }}
            >
              {v.id}
            </span>
            <span
              className="font-arabic text-gray-900 bg-white rounded-xl px-0.5 text-[0.97rem] md:text-base"
              style={{
                fontWeight: 700,
                letterSpacing: '0.06em',
                wordSpacing: '0.21em',
                lineHeight: 2,
              }}
            >
              {v.arabic}
            </span>
            {(idx !== phaseVerseObjs.length - 1) && (
              <span className="mx-1 text-emerald-400 text-lg">&#x6DD;{/* ۝ */}</span>
            )}
          </span>
        </span>
      ))}
      {/* ۩ if last phase */}
      {currentPhaseIdx === totalPhases - 1 && (
        <span className="mx-1 text-emerald-600 text-lg" style={{ fontWeight: 900 }}>۩</span>
      )}
    </span>
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex flex-col justify-start transition-colors">
      {/* Decorative background */}
      <div className="absolute -top-24 -left-16 w-60 h-60 rounded-full bg-emerald-100 opacity-35 blur-3xl z-0 pointer-events-none" />
      <div className="absolute -bottom-16 right-0 w-56 h-56 rounded-full bg-amber-100 opacity-40 blur-2xl z-0 pointer-events-none" />

      {/* Header with compact progress */}
      <div className="relative z-10 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-3 py-2 rounded-b-3xl shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2 font-arabic drop-shadow">
              <BookOpen className="h-6 w-6 md:h-7 md:w-7" />
              قرآن الأطفال
            </h1>
            <p className="text-emerald-100 text-xs font-arabic mt-0.5">تعلم سورة العلق</p>
          </div>
          <div className="flex items-center gap-1 text-amber-100 drop-shadow font-arabic">
            <Star className="h-5 w-5 fill-current" />
            <span className="text-base font-bold">{completedPhaseCount}/{totalPhases}</span>
          </div>
        </div>
        {/* Progress: smaller, phase-based, even more compact */}
        <div className="mt-0">
          <div className="flex justify-between text-xs text-emerald-100 mb-0 whitespace-nowrap font-arabic">
            <span>التقدم</span>
            <span>%{Math.round(progress)}</span>
          </div>
          <Progress value={progress} className="h-2 bg-emerald-800 rounded-full" />
        </div>
        {/* Phase stepper menu */}
        <div className="flex justify-center mt-1 gap-1">
          {studyPhases.map((ph, idx) => {
            // Only current phase animates, at slower speed
            const isCurrent = idx === currentPhaseIdx;
            const isComplete = studyPhases[idx].verses.every(id => completedVerses.includes(id));
            return (
              <button
                key={ph.label}
                onClick={() => setCurrentPhaseIdx(idx)}
                className={`
                  transition-all duration-300 w-7 h-7 md:w-9 md:h-9 rounded-full border-2 font-arabic font-bold text-xs md:text-sm focus:outline-none
                  ${isCurrent ? 'bg-amber-100 text-amber-700 border-amber-400 scale-110 shadow-md animate-bounce-gentler' : ''}
                  ${isComplete && !isCurrent ? 'bg-amber-400 text-white border-amber-100' : ''}
                  ${!isComplete && !isCurrent ? 'bg-gray-100 text-gray-400 hover:bg-emerald-50' : ''}
                `}
                style={{
                  transform: isCurrent ? 'scale(1.13)' : undefined,
                  animationDuration: isCurrent ? '3.5s' : undefined, // SLOWER
                  animationIterationCount: isCurrent ? 'infinite' : undefined
                }}
                aria-label={ph.label}
                tabIndex={0}
              >{idx + 1}</button>
            );
          })}
        </div>
      </div>

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
          {/* Continuous verses, flowing, with numbers */}
          <div className="w-full items-center justify-center text-center overflow-x-auto">
            {continuousArabic}
          </div>
          {/* Audio/Mark Controls */}
          <div className="flex justify-center gap-4 mt-4 items-center">
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-2 drop-shadow-lg scale-110 transition-all"
              size="icon"
              aria-label={isPlaying ? "إيقاف الصوت" : "تشغيل الصوت"}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Button
              onClick={handleMarkPhaseComplete}
              disabled={isPhaseComplete}
              className={`bg-amber-400 hover:bg-amber-500 text-white px-6 py-2 font-arabic text-base rounded-full shadow-md transition-all
                ${isPhaseComplete ? 'opacity-70 scale-95' : 'animate-bounce-gentle'}
              `}
            >
              <Star className="h-4 w-4 ml-2 fill-current" />
              {isPhaseComplete ? "تمت المرحلة!" : "تم الحفظ"}
            </Button>
          </div>
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
            <span
              className={`text-base font-arabic font-bold px-2 rounded-full
                ${true ? 'bg-amber-100 text-amber-700 border border-amber-300' : ''}
              `}
            >
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
// You may want to move this to your main CSS file if you keep it
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
