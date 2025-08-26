import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Clock, BookOpen } from 'lucide-react';
import type { ChildProfile } from '@/pages/OnboardingFlow';

interface LearningCapacityProps {
  child: ChildProfile;
  onNext: (data: { session_time_minutes: number; phase_length: number }) => void;
  onBack: () => void;
}

export const LearningCapacity = ({ child, onNext, onBack }: LearningCapacityProps) => {
  const [sessionTime, setSessionTime] = useState(child.session_time_minutes || 15);
  const [phaseLength, setPhaseLength] = useState(child.phase_length || 3);

  const sessionOptions = [
    { value: 10, label: '10 دقائق' },
    { value: 15, label: '15 دقيقة' },
    { value: 20, label: '20 دقيقة' },
    { value: 30, label: '30 دقيقة' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({
      session_time_minutes: sessionTime,
      phase_length: phaseLength,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-white shadow-xl border-emerald-200">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-emerald-700 font-arabic mb-2">
            قدرة التعلم
          </h1>
          <p className="text-muted-foreground font-arabic text-sm">
            حدد وقت الجلسة وطول المرحلة المناسب لـ {child.first_name}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Session Time */}
          <div className="space-y-3">
            <Label className="font-arabic flex items-center gap-2">
              <Clock className="w-4 h-4" />
              مدة الجلسة
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {sessionOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSessionTime(option.value)}
                  className={`p-3 rounded-lg border-2 transition-colors font-arabic ${
                    sessionTime === option.value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-600 font-arabic text-center">
              اختر المدة التي يستطيع طفلك التركيز خلالها
            </p>
          </div>

          {/* Phase Length */}
          <div className="space-y-3">
            <Label className="font-arabic flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              طول المرحلة (عدد الآيات)
            </Label>
            <Select 
              value={phaseLength.toString()} 
              onValueChange={(value) => setPhaseLength(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر عدد الآيات" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => i + 1).map(num => (
                  <SelectItem key={num} value={num.toString()}>
                    <span className="font-arabic">
                      {num} {num === 1 ? 'آية' : 'آيات'}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-600 font-arabic text-center">
              عدد الآيات التي سيتعلمها في كل مرحلة (الافتراضي: 3)
            </p>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 font-arabic mb-2">
              💡 نصائح مهمة
            </h3>
            <ul className="text-sm text-blue-700 font-arabic space-y-1">
              <li>• ابدأ بجلسات قصيرة واصعد تدريجياً</li>
              <li>• آية واحدة للمبتدئين، 3-5 للمتقدمين</li>
              <li>• يمكن تعديل هذه الإعدادات لاحقاً</li>
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