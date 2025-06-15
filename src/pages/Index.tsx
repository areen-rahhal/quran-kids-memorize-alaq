
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

// App state & UI
const Index = () => {
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  // We mark verses as complete, phase completion is calculated
  const [completedVerses, setCompletedVerses] = useState<number[]>([]);

  // For this phase:
  const phase = getPhaseData(currentPhaseIdx);
  const phaseVerseObjs = phase.verses.map(vnum => AlAlaqVerses.find(v => v.id === vnum)).filter(Boolean) as {id: number, arabic: string}[];

  // Phase completion: all verses in this phase are completed
  const isPhaseComplete = phase.verses.every(id => completedVerses.includes(id));

  // Overall progress by phase
  const completedPhaseCount = studyPhases.filter(phase =>
    phase.verses.every(id => completedVerses.includes(id))
  ).length;
  const totalPhases = studyPhases.length;
  const progress = (completedPhaseCount / totalPhases) * 100;

  // Complete all verse(s) in a phase
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
      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-7 rounded-b-3xl shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 font-arabic drop-shadow">
              <BookOpen className="h-7 w-7 md:h-8 md:w-8" />
              قرآن الأطفال
            </h1>
            <p className="text-emerald-100 text-sm font-arabic mt-1">تعلم سورة العلق</p>
          </div>
          <div className="flex items-center gap-2 text-amber-100 drop-shadow font-arabic">
            <Star className="h-6 w-6 fill-current" />
            <span className="text-lg font-bold">{completedVerses.length}/١٩</span>
          </div>
        </div>
        {/* Progress by Phase */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-emerald-100 mb-2 whitespace-nowrap">
            <span className="font-arabic">التقدم</span>
            <span className="font-arabic">%{Math.round(progress)}</span>
          </div>
          <Progress value={progress} className="h-3 bg-emerald-800 rounded-full" />
        </div>
        {/* Phase stepper menu */}
        <div className="flex justify-center mt-5 gap-3">
          {studyPhases.map((ph, idx) => (
            <button
              key={ph.label}
              onClick={() => setCurrentPhaseIdx(idx)}
              className={`transition-all duration-200 w-9 h-9 md:w-12 md:h-12 rounded-full border-2 font-arabic font-bold text-xs md:text-base focus:outline-none
                ${idx === currentPhaseIdx ? 'bg-emerald-600 text-white border-amber-300 scale-110 shadow-md animate-bounce-gentle' : ''}
                ${studyPhases[idx].verses.every(id => completedVerses.includes(id)) ? 'bg-amber-400 text-white border-amber-100' : 'bg-gray-100 text-gray-400 hover:bg-emerald-50'}
              `}
              style={{transform: idx === currentPhaseIdx ? 'scale(1.18)' : undefined}}
              aria-label={ph.label}
              tabIndex={0}
            >{idx + 1}</button>
          ))}
        </div>
      </div>
      {/* Main Content */}
      <div className="relative z-10 p-4 md:p-8 space-y-7 md:space-y-12 max-w-2xl mx-auto w-full flex-grow">
        {/* Surah Title & Phase Info */}
        <Card className="p-6 md:p-8 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-sm mb-2">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-emerald-700 mb-1 font-arabic">سورة العلق</h2>
            <div className="flex items-center justify-center space-x-1 gap-2 flex-wrap mt-3">
              <span className="text-md px-4 py-1 rounded-full font-arabic bg-white shadow text-emerald-700 border border-amber-100">
                {phase.label}
              </span>
              <span className="text-md px-4 py-1 rounded-full font-arabic bg-amber-50 text-amber-700 border border-amber-100">
                {phase.description}
              </span>
            </div>
            <p className="text-xs md:text-sm text-gray-600 mt-2 font-arabic">١٩ آية • مكية</p>
          </div>
        </Card>
        {/* Phase Verses */}
        <Card className="relative overflow-visible p-7 md:p-12 bg-white shadow-2xl border-l-8 border-emerald-500 rounded-2xl flex flex-col justify-center items-center min-h-[180px]">
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-amber-200 border-emerald-100 border px-5 py-1.5 rounded-full shadow-lg font-arabic text-emerald-700 text-xs md:text-md font-bold flex items-center gap-2">
            <span>{phase.label}</span>
            <span>({phase.description})</span>
          </div>
          <div className="flex flex-col gap-6 w-full items-center justify-center">
            {phaseVerseObjs.map(verse => (
              <div
                key={verse.id}
                className="text-3xl md:text-4xl leading-relaxed font-arabic text-gray-800 py-3 select-text w-full text-center animate-fade-in"
                dir="rtl"
                style={{ backgroundColor: completedVerses.includes(verse.id) ? '#f8ebb2' : undefined, borderRadius: '16px' }}
              >
                <span className={`transition-all font-bold px-2 py-1.5`}>
                  الآية {verse.id}
                  <span className="mx-2"></span>
                  {verse.arabic}
                </span>
              </div>
            ))}
          </div>
          {/* Audio/Mark Controls */}
          <div className="flex justify-center gap-4 mt-5 items-center">
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-3 drop-shadow-lg scale-110 transition-all"
              size="icon"
              aria-label={isPlaying ? "إيقاف الصوت" : "تشغيل الصوت"}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
            <Button
              onClick={handleMarkPhaseComplete}
              disabled={isPhaseComplete}
              className={`bg-amber-400 hover:bg-amber-500 text-white px-8 py-3 font-arabic text-lg rounded-full shadow-md transition-all
                ${isPhaseComplete ? 'opacity-70 scale-95' : 'animate-bounce-gentle'}
              `}
            >
              <Star className="h-5 w-5 ml-2 fill-current" />
              {isPhaseComplete ? "تمت المرحلة!" : "تم الحفظ"}
            </Button>
          </div>
        </Card>
        {/* Phase navigation */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={() => setCurrentPhaseIdx(i => Math.max(0, i - 1))}
              disabled={currentPhaseIdx === 0}
              variant="outline"
              className="rounded-full border-2 border-emerald-400 text-emerald-600 hover:bg-emerald-50 font-arabic p-0 w-12 h-12 flex items-center justify-center"
              size="icon"
              aria-label="السابق"
            >
              <CircleArrowRight className="h-7 w-7" />
            </Button>
            <span className="text-lg font-arabic font-bold text-emerald-900 px-3">{phase.label}</span>
            <Button
              onClick={() => setCurrentPhaseIdx(i => Math.min(totalPhases - 1, i + 1))}
              disabled={currentPhaseIdx === totalPhases - 1}
              variant="outline"
              className="rounded-full border-2 border-emerald-400 text-emerald-600 hover:bg-emerald-50 font-arabic p-0 w-12 h-12 flex items-center justify-center"
              size="icon"
              aria-label="التالي"
            >
              <CircleArrowLeft className="h-7 w-7" />
            </Button>
          </div>
        </div>
        {/* Completion Message */}
        {completedVerses.length === AlAlaqVerses.length && (
          <Card className="p-8 relative mt-8 bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-300 animate-enter rounded-2xl shadow-2xl ring-4 ring-amber-200">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2">
              <span className="text-6xl animate-bounce">🎉</span>
            </div>
            <div className="text-center space-y-2 mt-4">
              <h3 className="text-2xl md:text-3xl font-bold text-amber-700 font-arabic mb-2">مبروك!</h3>
              <p className="text-amber-600 font-arabic text-lg" dir="rtl">
                لقد أكملت حفظ سورة العلق! بارك الله في جهودك في حفظ كلام الله
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;

