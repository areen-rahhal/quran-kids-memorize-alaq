import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Target, Book, RotateCcw, Scale } from 'lucide-react';
import { juz30Surahs } from '@/data/juz30';
import type { ChildProfile } from '@/pages/OnboardingFlow';

interface LearningGoalProps {
  child: ChildProfile;
  onNext: (data: { 
    learning_goal: 'memorize_new' | 'review_memorized' | 'balance_both';
    target_juz?: number;
    target_surahs: number[];
  }) => void;
  onBack: () => void;
}

const goalOptions = [
  {
    value: 'memorize_new' as const,
    label: 'حفظ سور جديدة',
    description: 'التركيز على تعلم سور لم يحفظها من قبل',
    icon: Book,
    color: 'text-blue-600'
  },
  {
    value: 'review_memorized' as const,
    label: 'مراجعة السور المحفوظة',
    description: 'التركيز على تقوية وإتقان السور المحفوظة',
    icon: RotateCcw,
    color: 'text-green-600'
  },
  {
    value: 'balance_both' as const,
    label: 'التوازن بين الحفظ والمراجعة',
    description: 'توزيع الوقت بين حفظ الجديد ومراجعة القديم',
    icon: Scale,
    color: 'text-purple-600'
  }
];

export const LearningGoal = ({ child, onNext, onBack }: LearningGoalProps) => {
  const [learningGoal, setLearningGoal] = useState<'memorize_new' | 'review_memorized' | 'balance_both'>(
    child.learning_goal || 'memorize_new'
  );
  const [targetJuz, setTargetJuz] = useState<number | undefined>(child.target_juz);
  const [targetSurahs, setTargetSurahs] = useState<number[]>(child.target_surahs || []);
  const [goalType, setGoalType] = useState<'juz' | 'specific'>('juz');

  const handleSurahToggle = (surahId: number) => {
    setTargetSurahs(prev => 
      prev.includes(surahId) 
        ? prev.filter(id => id !== surahId)
        : [...prev, surahId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({
      learning_goal: learningGoal,
      target_juz: goalType === 'juz' ? targetJuz : undefined,
      target_surahs: goalType === 'specific' ? targetSurahs : [],
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-6 bg-white shadow-xl border-emerald-200">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-emerald-700 font-arabic mb-2">
            هدف التعلم
          </h1>
          <p className="text-muted-foreground font-arabic text-sm">
            حدد هدف التعلم لـ {child.first_name}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Learning Goal Selection */}
          <div className="space-y-4">
            <Label className="font-arabic flex items-center gap-2">
              <Target className="w-4 h-4" />
              نوع الهدف
            </Label>
            
            <RadioGroup value={learningGoal} onValueChange={(value) => setLearningGoal(value as any)}>
              {goalOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <div key={option.value} className="flex items-center space-x-3 space-x-reverse">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label 
                      htmlFor={option.value} 
                      className="flex-1 cursor-pointer p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start space-x-3 space-x-reverse">
                        <IconComponent className={`w-5 h-5 mt-1 ${option.color}`} />
                        <div>
                          <h3 className="font-semibold font-arabic">{option.label}</h3>
                          <p className="text-sm text-gray-600 font-arabic mt-1">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Target Selection */}
          <div className="space-y-4">
            <Label className="font-arabic">اختر المنهج</Label>
            
            <RadioGroup value={goalType} onValueChange={(value) => setGoalType(value as any)}>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="juz" id="juz" />
                <Label htmlFor="juz" className="font-arabic">اختيار جزء كامل</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="specific" id="specific" />
                <Label htmlFor="specific" className="font-arabic">اختيار سور محددة</Label>
              </div>
            </RadioGroup>

            {goalType === 'juz' && (
              <div className="space-y-2">
                <Label className="font-arabic">اختر الجزء</Label>
                <Select 
                  value={targetJuz?.toString()} 
                  onValueChange={(value) => setTargetJuz(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر جزء" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">
                      <span className="font-arabic">الجزء الثلاثون (عم)</span>
                    </SelectItem>
                    {/* Add more juz options here if needed */}
                  </SelectContent>
                </Select>
              </div>
            )}

            {goalType === 'specific' && (
              <div className="space-y-3">
                <Label className="font-arabic">اختر السور</Label>
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                  {juz30Surahs.map((surah) => (
                    <div key={surah.id} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={`surah-${surah.id}`}
                        checked={targetSurahs.includes(surah.id)}
                        onCheckedChange={() => handleSurahToggle(surah.id)}
                      />
                      <Label 
                        htmlFor={`surah-${surah.id}`} 
                        className="font-arabic cursor-pointer flex-1"
                      >
                        {surah.name}
                      </Label>
                    </div>
                  ))}
                </div>
                {targetSurahs.length > 0 && (
                  <p className="text-sm text-gray-600 font-arabic">
                    تم اختيار {targetSurahs.length} سورة
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 font-arabic mb-2">
              💡 نصائح للأهداف
            </h3>
            <ul className="text-sm text-blue-700 font-arabic space-y-1">
              <li>• ابدأ بهدف صغير قابل للتحقيق</li>
              <li>• يمكن تعديل الهدف حسب تقدم الطفل</li>
              <li>• الثبات على المراجعة مهم جداً</li>
            </ul>
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