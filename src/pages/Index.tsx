import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, BookOpen, Star } from 'lucide-react';

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

  const resetProgress = () => {
    setCompletedVerses([]);
    setCurrentVerse(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 font-arabic">
              <BookOpen className="h-6 w-6" />
              قرآن الأطفال
            </h1>
            <p className="text-emerald-100 text-sm font-arabic">تعلم سورة العلق</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-amber-200">
              <Star className="h-5 w-5 fill-current" />
              <span className="font-bold font-arabic">{completedVerses.length}/١٩</span>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-emerald-100 mb-2">
            <span className="font-arabic">التقدم</span>
            <span className="font-arabic">٪{Math.round(progress)}</span>
          </div>
          <Progress value={progress} className="h-3 bg-emerald-800" />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Surah Title */}
        <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-emerald-700 mb-2 font-arabic">سورة العلق</h2>
            <p className="text-amber-700 font-semibold font-arabic">سورة العلق</p>
            <p className="text-sm text-gray-600 mt-1 font-arabic">١٩ آية • مكية</p>
          </div>
        </Card>

        {/* Current Verse Display */}
        <Card className="p-6 bg-white shadow-lg border-l-4 border-emerald-500">
          <div className="text-center space-y-4">
            <div className="bg-emerald-50 rounded-lg p-1 inline-block">
              <span className="text-emerald-600 font-bold text-sm px-3 py-1 font-arabic">
                الآية {AlAlaqVerses[currentVerse].id}
              </span>
            </div>
            
            {/* Arabic Text - Single Display */}
            <div className="text-4xl leading-relaxed font-arabic text-gray-800 py-8" dir="rtl">
              {AlAlaqVerses[currentVerse].arabic}
            </div>
          </div>

          {/* Audio Controls */}
          <div className="flex justify-center gap-4 mt-6">
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-3"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Button
              onClick={() => handleVerseComplete(AlAlaqVerses[currentVerse].id)}
              disabled={completedVerses.includes(AlAlaqVerses[currentVerse].id)}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 font-arabic"
            >
              {completedVerses.includes(AlAlaqVerses[currentVerse].id) ? (
                <Star className="h-4 w-4 ml-2 fill-current" />
              ) : (
                <Star className="h-4 w-4 ml-2" />
              )}
              تم الحفظ
            </Button>
          </div>
        </Card>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center">
          <Button
            onClick={prevVerse}
            disabled={currentVerse === 0}
            variant="outline"
            className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 font-arabic"
          >
            السابق
          </Button>
          
          <div className="flex gap-1 flex-wrap justify-center max-w-xs">
            {AlAlaqVerses.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentVerse(index)}
                className={`w-7 h-7 rounded-full text-xs font-bold transition-all font-arabic ${
                  index === currentVerse
                    ? 'bg-emerald-600 text-white'
                    : completedVerses.includes(index + 1)
                    ? 'bg-amber-400 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          
          <Button
            onClick={nextVerse}
            disabled={currentVerse === AlAlaqVerses.length - 1}
            variant="outline"
            className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 font-arabic"
          >
            التالي
          </Button>
        </div>

        {/* Practice Mode Toggle */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={resetProgress}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 font-arabic"
          >
            <RotateCcw className="h-4 w-4 ml-2" />
            إعادة البداية
          </Button>
        </div>

        {/* Completion Message */}
        {completedVerses.length === AlAlaqVerses.length && (
          <Card className="p-6 bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-300">
            <div className="text-center">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-xl font-bold text-amber-700 mb-2 font-arabic">
                مبروك!
              </h3>
              <p className="text-amber-600 font-arabic" dir="rtl">
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
