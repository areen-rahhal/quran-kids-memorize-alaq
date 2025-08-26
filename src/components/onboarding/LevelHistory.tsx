import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { juz30Surahs } from '@/data/juz30';
import type { ChildProfile } from '@/pages/OnboardingFlow';

interface LevelHistoryProps {
  child: ChildProfile;
  onNext: (data: { memorization_history: { surah_number: number; proficiency: string }[] }) => void;
  onBack: () => void;
}

const proficiencyLabels = {
  excellent: 'ممتاز',
  very_good: 'جيد جداً',
  basic: 'أساسي'
};

const proficiencyColors = {
  excellent: 'bg-green-100 text-green-800',
  very_good: 'bg-blue-100 text-blue-800',
  basic: 'bg-yellow-100 text-yellow-800'
};

export const LevelHistory = ({ child, onNext, onBack }: LevelHistoryProps) => {
  const [memorizedSurahs, setMemorizedSurahs] = useState<Record<number, string>>(
    child.memorization_history.reduce((acc, item) => {
      acc[item.surah_number] = item.proficiency;
      return acc;
    }, {} as Record<number, string>)
  );

  const handleSurahToggle = (surahNumber: number) => {
    setMemorizedSurahs(prev => {
      const newState = { ...prev };
      if (newState[surahNumber]) {
        delete newState[surahNumber];
      } else {
        newState[surahNumber] = 'basic';
      }
      return newState;
    });
  };

  const handleProficiencyChange = (surahNumber: number, proficiency: string) => {
    setMemorizedSurahs(prev => ({
      ...prev,
      [surahNumber]: proficiency
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const memorization_history = Object.entries(memorizedSurahs).map(([surahNumber, proficiency]) => ({
      surah_number: parseInt(surahNumber),
      proficiency
    }));
    
    onNext({ memorization_history });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-6 bg-white shadow-xl border-emerald-200">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-emerald-700 font-arabic mb-2">
            تاريخ الحفظ
          </h1>
          <p className="text-muted-foreground font-arabic text-sm">
            حدد السور التي حفظها {child.first_name} من الجزء الثلاثين
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Surahs Grid */}
          <div className="space-y-4">
            <Label className="font-arabic">اختر السور المحفوظة ومستوى الإتقان</Label>
            
            <div className="grid gap-3">
              {juz30Surahs.map((surah) => {
                const isMemorized = memorizedSurahs[surah.id] !== undefined;
                
                return (
                  <div 
                    key={surah.id}
                    className={`p-4 border-2 rounded-lg transition-colors ${
                      isMemorized 
                        ? 'border-emerald-300 bg-emerald-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <button
                          type="button"
                          onClick={() => handleSurahToggle(surah.id)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isMemorized 
                              ? 'border-emerald-500 bg-emerald-500' 
                              : 'border-gray-300'
                          }`}
                        >
                          {isMemorized && <CheckCircle className="w-4 h-4 text-white" />}
                        </button>
                        
                        <div>
                          <h3 className="font-semibold text-gray-900 font-arabic">
                            {surah.arabicName}
                          </h3>
                          <p className="text-sm text-gray-600 font-arabic">
                            {surah.verses} آية
                          </p>
                        </div>
                      </div>

                      {isMemorized && (
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Select
                            value={memorizedSurahs[surah.id]}
                            onValueChange={(value) => handleProficiencyChange(surah.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basic">
                                <span className="font-arabic">{proficiencyLabels.basic}</span>
                              </SelectItem>
                              <SelectItem value="very_good">
                                <span className="font-arabic">{proficiencyLabels.very_good}</span>
                              </SelectItem>
                              <SelectItem value="excellent">
                                <span className="font-arabic">{proficiencyLabels.excellent}</span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          {Object.keys(memorizedSurahs).length > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 font-arabic mb-2">
                ملخص الحفظ
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(memorizedSurahs).map(([surahNumber, proficiency]) => {
                  const surah = juz30Surahs.find(s => s.id === parseInt(surahNumber));
                  return (
                    <Badge 
                      key={surahNumber} 
                      className={`font-arabic ${proficiencyColors[proficiency as keyof typeof proficiencyColors]}`}
                    >
                      {surah?.name} - {proficiencyLabels[proficiency as keyof typeof proficiencyLabels]}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700 font-arabic">
              💡 إذا لم يحفظ طفلك أي سورة من الجزء الثلاثين، يمكنك تخطي هذه الخطوة
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="font-arabic"
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              رجوع
            </Button>
            
            <Button 
              type="submit" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-arabic"
            >
              حفظ والمتابعة
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};