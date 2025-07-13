import { Check, Lock, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { juz30Surahs, getCurrentSurah } from '@/data/juz30';

interface ProgressSectionProps {
  currentSurahId: number;
  completedSurahs: number[];
  onSurahSelect: (surahId: number) => void;
}

export const ProgressSection = ({ 
  currentSurahId, 
  completedSurahs, 
  onSurahSelect 
}: ProgressSectionProps) => {
  const currentSurah = getCurrentSurah(currentSurahId);
  
  const getSurahStatus = (surahId: number) => {
    if (completedSurahs.includes(surahId)) return 'completed';
    if (surahId === currentSurahId) return 'current';
    if (surahId <= Math.max(...completedSurahs, currentSurahId)) return 'unlocked';
    return 'locked';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 hover:bg-green-600 border-green-400';
      case 'current': return 'bg-blue-500 hover:bg-blue-600 border-blue-400';
      case 'unlocked': return 'bg-gray-200 hover:bg-gray-300 border-gray-300';
      default: return 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="w-4 h-4 text-white" />;
      case 'current': return <Star className="w-4 h-4 text-white" />;
      case 'unlocked': return <div className="w-4 h-4 rounded-full bg-white opacity-70" />;
      default: return <Lock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="h-full bg-gradient-to-b from-slate-50 to-slate-100 p-6 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-center mb-2 font-arabic">الجزء الثلاثون</h2>
        <p className="text-sm text-gray-600 text-center font-arabic">عم يتساءلون</p>
        
        {/* Progress Stats */}
        <Card className="mt-4 p-4 bg-white">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{completedSurahs.length}</div>
              <div className="text-xs text-gray-500 font-arabic">مكتملة</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">1</div>
              <div className="text-xs text-gray-500 font-arabic">حالية</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-600">{37 - completedSurahs.length - 1}</div>
              <div className="text-xs text-gray-500 font-arabic">متبقية</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Surahs Path */}
      <div className="space-y-4">
        {juz30Surahs.map((surah, index) => {
          const status = getSurahStatus(surah.id);
          const isClickable = status !== 'locked';
          
          return (
            <div key={surah.id} className="relative">
              {/* Connection Line */}
              {index < juz30Surahs.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-300 z-0" />
              )}
              
              {/* Surah Node */}
              <div 
                className={`relative z-10 flex items-center gap-4 ${isClickable ? 'cursor-pointer' : ''}`}
                onClick={() => isClickable && onSurahSelect(surah.id)}
              >
                {/* Circle Icon */}
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${getStatusColor(status)}`}>
                  {getStatusIcon(status)}
                </div>
                
                {/* Surah Info */}
                <Card className={`flex-1 p-3 transition-all ${
                  status === 'current' 
                    ? 'bg-blue-50 border-blue-200 shadow-md' 
                    : 'bg-white hover:shadow-sm'
                }`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-sm font-arabic">{surah.arabicName}</h3>
                      <p className="text-xs text-gray-500">{surah.name}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs font-arabic">
                        {surah.verses} آية
                      </Badge>
                      {status === 'current' && (
                        <div className="mt-1">
                          <Badge className="text-xs bg-blue-100 text-blue-700">
                            {surah.phases} مراحل
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};