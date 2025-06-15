import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, BookOpen, Star, CircleArrowLeft, CircleArrowRight } from 'lucide-react';

const AlAlaqVerses = [
  {
    id: 1,
    arabic: "ٱقْرَأْ بِٱسْمِ رَبِّكَ ٱلَّذِى خَلَقَ"
  },
  {
    id: 2,
    arabic: "خَلَقَ ٱلْإِنسَـٰنَ مِنْ عَلَقٍ"
  },
  {
    id: 3,
    arabic: "ٱقْرَأْ وَرَبُّكَ ٱلْأَكْرَمُ"
  },
  {
    id: 4,
    arabic: "ٱلَّذِى عَلَّمَ بِٱلْقَلَمِ"
  },
  {
    id: 5,
    arabic: "عَلَّمَ ٱلْإِنسَـٰنَ مَا لَمْ يَعْلَمْ"
  },
  {
    id: 6,
    arabic: "كَلَّآ إِنَّ ٱلْإِنسَـٰنَ لَيَطْغَىٰٓ"
  },
  {
    id: 7,
    arabic: "أَن رَّءَاهُ ٱسْتَغْنَىٰ"
  },
  {
    id: 8,
    arabic: "إِنَّ إِلَىٰ رَبِّكَ ٱلرُّجْعَىٰ"
  },
  {
    id: 9,
    arabic: "أَرَءَيْتَ ٱلَّذِى يَنْهَىٰ"
  },
  {
    id: 10,
    arabic: "عَبْدًا إِذَا صَلَّىٰ"
  },
  {
    id: 11,
    arabic: "أَرَءَيْتَ إِن كَانَ عَلَى ٱلْهُدَىٰٓ"
  },
  {
    id: 12,
    arabic: "أَوْ أَمَرَ بِٱلتَّقْوَىٰٓ"
  },
  {
    id: 13,
    arabic: "أَرَءَيْتَ إِن كَذَّبَ وَتَوَلَّىٰٓ"
  },
  {
    id: 14,
    arabic: "أَلَمْ يَعْلَم بِأَنَّ ٱللَّهَ يَرَىٰ"
  },
  {
    id: 15,
    arabic: "كَلَّا لَئِن لَّمْ يَنتَهِ لَنَسْفَعًۢا بِٱلنَّاصِيَةِ"
  },
  {
    id: 16,
    arabic: "نَاصِيَةٍ كَـٰذِبَةٍ خَاطِئَةٍ"
  },
  {
    id: 17,
    arabic: "فَلْيَدْعُ نَادِيَهُۥ"
  },
  {
    id: 18,
    arabic: "سَنَدْعُ ٱلزَّبَانِيَةَ"
  },
  {
    id: 19,
    arabic: "كَلَّا لَا تُطِعْهُ وَٱسْجُدْ وَٱقْتَرِب ۩"
  }
];

const Index = () => {
  const [currentVerse, setCurrentVerse] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedVerses, setCompletedVerses] = useState<number[]>([]);
  const [showTranslation, setShowTranslation] = useState(true);

  const handleVerseComplete = (verseId: number) => {
    if (!completedVerses.includes(verseId)) {
      setCompletedVerses([...completedVerses, verseId]);
    }
  };

  const progress = (completedVerses.length / AlAlaqVerses.length) * 100;

  const nextVerse = () => {
    if (currentVerse < AlAlaqVerses.length - 1) {
      setCurrentVerse(currentVerse + 1);
    }
  };

  const prevVerse = () => {
    if (currentVerse > 0) {
      setCurrentVerse(currentVerse - 1);
    }
  };

  // Helper for pill color
  const getPillClass = (idx: number) => {
    if (idx === currentVerse) return 'bg-emerald-600 shadow-md scale-110 text-white border-4 border-amber-200 animate-bounce-gentle';
    if (completedVerses.includes(idx + 1)) return 'bg-amber-400 text-white scale-105';
    return 'bg-gray-100 text-gray-400 hover:bg-emerald-50';
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex flex-col justify-start transition-colors">
      {/* Decorative background circles */}
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
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-emerald-100 mb-2 whitespace-nowrap">
            <span className="font-arabic">التقدم</span>
            <span className="font-arabic">٪{Math.round(progress)}</span>
          </div>
          <Progress value={progress} className="h-3 bg-emerald-800 rounded-full" />
        </div>
      </div>
      {/* Main Content */}
      <div className="relative z-10 p-4 md:p-8 space-y-7 md:space-y-12 max-w-2xl mx-auto w-full flex-grow">
        {/* Surah Title */}
        <Card className="p-5 md:p-8 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-sm mb-2">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-emerald-700 mb-1 font-arabic">سورة العلق</h2>
            <p className="text-amber-800 font-semibold font-arabic">تعلم الحفظ خطوة بخطوة</p>
            <p className="text-xs md:text-sm text-gray-600 mt-1 font-arabic">١٩ آية • مكية</p>
          </div>
        </Card>
        {/* Current Verse Display */}
        <Card className="relative overflow-visible p-6 md:p-10 bg-white shadow-2xl border-l-8 border-emerald-500 rounded-2xl flex flex-col justify-center items-center min-h-[180px]">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-200 border-emerald-100 border px-5 py-1.5 rounded-full shadow-lg font-arabic text-emerald-700 text-xs md:text-sm font-bold flex items-center gap-2">
            <span>الآية {AlAlaqVerses[currentVerse].id}</span>
          </div>
          <div className="text-center space-y-2">
            <div className="text-4xl md:text-5xl leading-relaxed font-arabic text-gray-800 py-8 select-text animate-scale-in" dir="rtl">
              {AlAlaqVerses[currentVerse].arabic}
            </div>
          </div>
          {/* Audio/Mark Controls */}
          <div className="flex justify-center gap-4 mt-2">
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-3 drop-shadow-lg scale-110 transition-all"
              size="icon"
              aria-label={isPlaying ? "إيقاف الصوت" : "تشغيل الصوت"}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
            <Button
              onClick={() => {
                if (!completedVerses.includes(AlAlaqVerses[currentVerse].id)) setCompletedVerses([...completedVerses, AlAlaqVerses[currentVerse].id]);
              }}
              disabled={completedVerses.includes(AlAlaqVerses[currentVerse].id)}
              className={`bg-amber-400 hover:bg-amber-500 text-white px-6 py-3 font-arabic text-lg rounded-full shadow-md transition-all
                ${completedVerses.includes(AlAlaqVerses[currentVerse].id) ? 'opacity-70 scale-95' : 'animate-bounce-gentle'}
              `}
            >
              <Star className="h-5 w-5 ml-2 fill-current" />
              تم الحفظ
            </Button>
          </div>
        </Card>
        {/* Navigation Controls */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={prevVerse}
              disabled={currentVerse === 0}
              variant="outline"
              className="rounded-full border-2 border-emerald-400 text-emerald-600 hover:bg-emerald-50 font-arabic p-0 w-12 h-12 flex items-center justify-center"
              size="icon"
              aria-label="السابق"
            >
              <CircleArrowRight className="h-7 w-7" />
            </Button>
            <div className="flex gap-1 flex-wrap justify-center max-w-xs">
              {AlAlaqVerses.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentVerse(index)}
                  aria-label={`انتقال للآية ${index + 1}`}
                  className={`transition-all duration-200 w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-transparent font-arabic font-bold text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 ${getPillClass(index)}`}
                  style={{transform: index === currentVerse ? 'scale(1.15)' : undefined}}
                  tabIndex={0}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <Button
              onClick={nextVerse}
              disabled={currentVerse === AlAlaqVerses.length - 1}
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
