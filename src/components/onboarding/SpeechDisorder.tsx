import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import type { ChildProfile } from '@/pages/OnboardingFlow';

interface SpeechDisorderProps {
  child: ChildProfile;
  onNext: (data: { has_speech_disorder: boolean; speech_disorder_type?: string }) => void;
  onBack: () => void;
  isLoading: boolean;
}

const speechDisorderTypes = [
  'صعوبة نطق الراء (ر)',
  'صعوبة نطق السين (س)',
  'صعوبة نطق الشين (ش)',
  'صعوبة نطق الضاد (ض)',
  'صعوبة نطق الظاء (ظ)',
  'صعوبة نطق الثاء (ث)',
  'صعوبة نطق الذال (ذ)',
  'صعوبة نطق القاف (ق)',
  'صعوبة نطق الكاف (ك)',
  'صعوبة نطق الغين (غ)',
  'صعوبة نطق الخاء (خ)',
  'صعوبة نطق الحاء (ح)',
  'صعوبة نطق العين (ع)',
  'صعوبة نطق الهاء (ه)',
  'تأتأة',
  'بطء في الكلام',
  'صعوبة في الطلاقة',
  'أخرى'
];

export const SpeechDisorder = ({ child, onNext, onBack, isLoading }: SpeechDisorderProps) => {
  const [hasSpeechDisorder, setHasSpeechDisorder] = useState<boolean>(
    child.has_speech_disorder || false
  );
  const [speechDisorderType, setSpeechDisorderType] = useState<string>(
    child.speech_disorder_type || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({
      has_speech_disorder: hasSpeechDisorder,
      speech_disorder_type: hasSpeechDisorder ? speechDisorderType : undefined,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-white shadow-xl border-emerald-200">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-emerald-700 font-arabic mb-2">
            اضطرابات النطق
          </h1>
          <p className="text-muted-foreground font-arabic text-sm">
            هل يعاني {child.first_name} من أي صعوبات في النطق؟
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Speech Disorder Question */}
          <div className="space-y-4">
            <Label className="font-arabic">هل يعاني طفلك من اضطرابات النطق؟</Label>
            
            <RadioGroup 
              value={hasSpeechDisorder.toString()} 
              onValueChange={(value) => {
                const hasDisorder = value === 'true';
                setHasSpeechDisorder(hasDisorder);
                if (!hasDisorder) {
                  setSpeechDisorderType('');
                }
              }}
            >
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="false" id="no-disorder" />
                <Label htmlFor="no-disorder" className="font-arabic">
                  لا، لا يعاني من أي صعوبات في النطق
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="true" id="has-disorder" />
                <Label htmlFor="has-disorder" className="font-arabic">
                  نعم، يعاني من صعوبات في النطق
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Speech Disorder Type Selection */}
          {hasSpeechDisorder && (
            <div className="space-y-3">
              <Label className="font-arabic">نوع اضطراب النطق</Label>
              <Select value={speechDisorderType} onValueChange={setSpeechDisorderType}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع الاضطراب" />
                </SelectTrigger>
                <SelectContent>
                  {speechDisorderTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      <span className="font-arabic">{type}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2 space-x-reverse">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700 font-arabic">
                <p className="font-semibold mb-2">معلومات مهمة:</p>
                <ul className="space-y-1">
                  <li>• هذه المعلومات ستساعد في تخصيص التطبيق</li>
                  <li>• سيتم تعديل تمارين النطق حسب الحاجة</li>
                  <li>• يُنصح بمراجعة أخصائي نطق للحصول على أفضل النتائج</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {hasSpeechDisorder && speechDisorderType && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-arabic text-sm">
                ✅ سيتم تخصيص التطبيق للتعامل مع: <strong>{speechDisorderType}</strong>
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="font-arabic"
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              رجوع
            </Button>
            
            <Button 
              type="submit" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-arabic"
              disabled={isLoading || (hasSpeechDisorder && !speechDisorderType)}
            >
              {isLoading ? 'جارٍ الحفظ...' : 'إنهاء الإعداد'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};