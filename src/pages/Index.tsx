import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, BookOpen, Star, CircleArrowLeft, CircleArrowRight } from 'lucide-react';
import { PhaseStepper } from "@/components/PhaseStepper";
import { ContinuousArabic } from "@/components/ContinuousArabic";

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

const getPhaseData = (phaseIdx: number) => studyPhases[phaseIdx] || studyPhases[0];

const Index = () => {
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedVerses, setCompletedVerses] = useState<number[]>([]);

  const phase = getPhaseData(currentPhaseIdx);
  const phaseVerseObjs = phase.verses.map(
    vnum => AlAlaqVerses.find(v => v.id === vnum)
  ).filter(Boolean) as {id: number, arabic: string}[];

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

  // -- UI Update: Use new components --

  return (
    <div className="relative min-h-screen bg-gradient-to-tr from-yellow-50 via-emerald-50 to-pink-50 flex flex-col justify-start py-3 overflow-x-clip transition-colors duration-200">
      {/* Fun, animated background clouds/blobs (playful web like Duolingo) */}
      <div className="absolute -top-20 left-5 w-64 h-56 rounded-full bg-gradient-to-r from-yellow-300 via-emerald-200 to-emerald-100 opacity-25 blur-3xl z-0"></div>
      <div className="absolute -bottom-16 right-0 w-52 h-44 rounded-full bg-gradient-to-r from-sky-200 via-pink-200 to-yellow-200 opacity-30 blur-2xl z-0"></div>

      {/* Header */}
      <div className="relative z-10 text-center px-2 pt-0 pb-0">
        <div className="flex items-center justify-center gap-2">
          <BookOpen className="h-10 w-10 md:h-12 md:w-12 text-emerald-500 -mt-1 drop-shadow-lg" />
          <h1 className="font-bold font-arabic text-2xl md:text-4xl drop-shadow-lg bg-gradient-to-r from-emerald-400 via-emerald-600 to-amber-500 bg-clip-text text-transparent mt-3 mb-2">
            قرآن الأطفال
          </h1>
        </div>
        <p className="text-emerald-700 text-sm font-arabic mb-1 drop-shadow font-semibold">تعلم سورة العلق</p>
        {/* New: Playful Star Progress over colored bar */}
        <div className="flex items-end justify-center gap-1 mt-2">
          <Star className="h-6 w-6 drop-shadow animate-pulse text-amber-400" />
          <span className="font-arabic font-extrabold text-lg text-emerald-700 bg-amber-100 rounded-full px-3 py-0.5 shadow">
            {completedPhaseCount} / {totalPhases}
          </span>
          <span className="text-amber-500 font-arabic text-xs">{`تمت المراحل`}</span>
        </div>
        <div className="mt-1 pt-0 flex flex-col md:flex-row md:items-center md:gap-2">
          <Progress value={progress} className="h-3 w-full bg-emerald-100 rounded-full border-2 border-emerald-300 shadow-inner" />
          <span className="ml-2 text-xs text-emerald-800 font-bold font-arabic">{Math.round(progress)}%</span>
        </div>
        {/* NEW: Vibrant kid-friendly stepper */}
        <PhaseStepper
          phases={studyPhases}
          currentPhaseIdx={currentPhaseIdx}
          completedVerses={completedVerses}
          onPhaseClick={setCurrentPhaseIdx}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-2 py-1 md:p-7 space-y-6 md:space-y-9 max-w-xl mx-auto w-full flex-grow">
        {/* Surah Title & Phase Info */}
        <div className="mx-auto max-w-xs mt-3 mb-1 py-4">
          <Card className="bg-gradient-to-br from-emerald-100/60 to-amber-50 border-2 border-amber-200 shadow-lg p-3 rounded-3xl">
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-bold text-emerald-800 mb-0 font-arabic drop-shadow">سورة العلق</h2>
              <div className="flex items-center justify-center gap-2 flex-wrap mt-1">
                <span className="text-xs px-3 py-0.5 rounded-full font-arabic bg-white shadow text-emerald-700 border border-amber-100 font-bold">{phase.label}</span>
                <span className="text-xs px-3 py-0.5 rounded-full font-arabic bg-amber-50 text-amber-700 border border-amber-100">{phase.description}</span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5 font-arabic">١٩ آية • مكية</p>
            </div>
          </Card>
        </div>

        {/* Phase verses: vibrant, Duolingo-styled */}
        <div className="flex flex-col gap-2">
          <div className="p-0 mx-auto w-full">
            <ContinuousArabic verses={phaseVerseObjs} />
          </div>
        </div>

        {/* Audio and Complete controls */}
        <Card className="relative px-4 py-9 md:px-7 md:py-12 bg-gradient-to-br from-white via-emerald-50 to-amber-50 shadow-2xl border-l-8 border-emerald-400/70 rounded-3xl flex flex-col justify-center items-center min-h-[90px]">
          {/* Cute phase bubble badge at the top */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gradient-to-tr from-amber-100 to-amber-300 border-2 border-emerald-200 px-7 py-2 rounded-full shadow-2xl font-arabic text-emerald-800 text-sm md:text-base font-bold flex items-center gap-2 uppercase tracking-wide animate-bounce-custom2">
            <span>{phase.label}</span>
            <span>({phase.description})</span>
          </div>
          {/* Audio and Complete controls - Duolingo style */}
          <div className="flex justify-center gap-4 mt-10 items-center">
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-emerald-400/90 hover:bg-emerald-600 text-white rounded-full p-3 drop-shadow-2xl scale-125 transition-all border-4 border-emerald-200 outline-none ring-emerald-300 ring-0"
              size="icon"
              aria-label={isPlaying ? "إيقاف الصوت" : "تشغيل الصوت"}
            >
              {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7" />}
            </Button>
            <Button
              onClick={handleMarkPhaseComplete}
              disabled={isPhaseComplete}
              className={`relative bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-400 hover:bg-yellow-400 text-white px-8 py-3 font-arabic text-base rounded-3xl shadow-lg border-2 border-yellow-200 transition-all font-bold tracking-wide
                  ${isPhaseComplete ? 'opacity-70 scale-100' : 'animate-bounce-custom2'}
                `}
              style={{
                fontSize: '1.18em',
                minWidth: 120
              }}
            >
              <span className="absolute -left-6 top-1/2 -translate-y-1/2 text-amber-400 text-2xl drop-shadow animate-spin-slow">
                <Star className="h-8 w-8 fill-current" />
              </span>
              {isPhaseComplete ? "تمت المرحلة!" : "تم الحفظ"}
            </Button>
          </div>
        </Card>

        {/* Fun nav controls */}
        <div className="flex flex-col items-center gap-3 mt-1">
          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={() => setCurrentPhaseIdx(i => Math.max(0, i - 1))}
              disabled={currentPhaseIdx === 0}
              variant="outline"
              className="rounded-full border-4 border-emerald-400 text-emerald-700 hover:bg-emerald-100 font-arabic p-0 w-12 h-12 flex items-center justify-center shadow-md bg-white"
              size="icon"
              aria-label="السابق"
            >
              <CircleArrowRight className="h-7 w-7" />
            </Button>
            <span
              className="text-lg font-arabic font-extrabold px-4 py-1 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-300 text-amber-700 shadow-lg"
            >
              {phase.label}
            </span>
            <Button
              onClick={() => setCurrentPhaseIdx(i => Math.min(totalPhases - 1, i + 1))}
              disabled={currentPhaseIdx === totalPhases - 1}
              variant="outline"
              className="rounded-full border-4 border-emerald-400 text-emerald-700 hover:bg-emerald-100 font-arabic p-0 w-12 h-12 flex items-center justify-center shadow-md bg-white"
              size="icon"
              aria-label="التالي"
            >
              <CircleArrowLeft className="h-7 w-7" />
            </Button>
          </div>
        </div>

        {/* Celebration on completion */}
        {completedVerses.length === AlAlaqVerses.length && (
          <Card className="p-8 relative mt-7 bg-gradient-to-r from-yellow-50 to-yellow-200 border-amber-300 animate-enter rounded-3xl shadow-2xl ring-8 ring-yellow-100 ring-offset-4">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2">
              <span className="text-7xl animate-bounce">🎉</span>
            </div>
            <div className="text-center space-y-2 mt-4 font-arabic">
              <h3 className="text-2xl md:text-3xl font-bold text-amber-700 mb-1">مبروك!</h3>
              <p className="text-amber-600 text-base" dir="rtl">
                لقد أكملت حفظ سورة العلق! بارك الله في جهودك في حفظ كلام الله
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

// Custom fun bounce animations for phase stepper, completion, etc
const style = document.createElement('style');
style.textContent = `
  @keyframes bounce-custom {
    0%,100% { transform: translateY(0);}
    50% { transform: translateY(-17px);}
  }
  .animate-bounce-custom {
    animation: bounce-custom 2.9s cubic-bezier(.29,.67,.53,1.45) infinite;
  }
  @keyframes bounce-custom2 {
    0%,100% { transform: translateY(0);}
    40% { transform: translateY(-8px);}
    60% { transform: translateY(2px);}
  }
  .animate-bounce-custom2 {
    animation: bounce-custom2 3s cubic-bezier(.2,1.15,.4,.9) infinite;
  }
  @keyframes spin-slow {
    to { transform: rotate(360deg); }
  }
  .animate-spin-slow {
    animation: spin-slow 3s linear infinite;
  }
  @keyframes fade-in {
    from { opacity: 0;}
    to { opacity: 1;}
  }
  .animate-fade-in {
    animation: fade-in 0.7s ease;
  }
`;
if (!document.getElementById('gentleBounceStyle')) {
  style.id = 'gentleBounceStyle';
  document.head.appendChild(style);
}

export default Index;
