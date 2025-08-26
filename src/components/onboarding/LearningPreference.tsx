import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Eye, Volume2, Hand } from 'lucide-react';
import type { ChildProfile } from '@/pages/OnboardingFlow';

interface LearningPreferenceProps {
  child: ChildProfile;
  onNext: (data: { learning_preference: 'visual' | 'audio' | 'sensory' }) => void;
  onBack: () => void;
}

const preferenceOptions = [
  {
    value: 'visual' as const,
    label: 'بصري',
    description: 'يتعلم بشكل أفضل من خلال الرؤية والألوان والصور',
    features: ['عرض النص بألوان مختلفة', 'رسوم توضيحية', 'تمييز بصري للكلمات'],
    icon: Eye,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200'
  },
  {
    value: 'audio' as const,
    label: 'سمعي',
    description: 'يتعلم بشكل أفضل من خلال الاستماع والتكرار الصوتي',
    features: ['تكرار صوتي متقدم', 'تحليل نطق الطفل', 'ملاحظات صوتية'],
    icon: Volume2,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200'
  },
  {
    value: 'sensory' as const,
    label: 'حسي/حركي',
    description: 'يتعلم بشكل أفضل من خلال الحركة والتفاعل الجسدي',
    features: ['أنشطة تفاعلية', 'ألعاب حركية', 'تطبيقات عملية'],
    icon: Hand,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200'
  }
];

export const LearningPreference = ({ child, onNext, onBack }: LearningPreferenceProps) => {
  const [preference, setPreference] = useState<'visual' | 'audio' | 'sensory'>(
    child.learning_preference || 'audio'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ learning_preference: preference });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-6 bg-white shadow-xl border-emerald-200">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-emerald-700 font-arabic mb-2">
            نمط التعلم المفضل
          </h1>
          <p className="text-muted-foreground font-arabic text-sm">
            اختر أسلوب التعلم الذي يناسب {child.first_name} أكثر
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label className="font-arabic">أسلوب التعلم</Label>
            
            <RadioGroup value={preference} onValueChange={(value) => setPreference(value as any)}>
              {preferenceOptions.map((option) => {
                const IconComponent = option.icon;
                const isSelected = preference === option.value;
                
                return (
                  <div key={option.value} className="flex items-start space-x-3 space-x-reverse">
                    <RadioGroupItem 
                      value={option.value} 
                      id={option.value} 
                      className="mt-2"
                    />
                    <Label 
                      htmlFor={option.value} 
                      className={`flex-1 cursor-pointer p-4 border-2 rounded-lg transition-all ${
                        isSelected ? option.bgColor : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <IconComponent className={`w-6 h-6 ${option.color}`} />
                          <div>
                            <h3 className="font-bold font-arabic text-lg">{option.label}</h3>
                            <p className="text-sm text-gray-600 font-arabic">
                              {option.description}
                            </p>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-gray-700 font-arabic">
                            مميزات هذا النمط:
                          </p>
                          <ul className="space-y-1">
                            {option.features.map((feature, index) => (
                              <li key={index} className="text-sm text-gray-600 font-arabic flex items-center">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full ml-2"></span>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h3 className="font-semibold text-amber-800 font-arabic mb-2">
              💡 كيف أعرف نمط تعلم طفلي؟
            </h3>
            <ul className="text-sm text-amber-700 font-arabic space-y-1">
              <li>• <strong>بصري:</strong> يحب الألوان والصور ويتذكر بالرؤية</li>
              <li>• <strong>سمعي:</strong> يحب سماع القصص ويحفظ بالتكرار الصوتي</li>
              <li>• <strong>حسي:</strong> يحب الحركة والأنشطة التفاعلية</li>
            </ul>
          </div>

          {/* Current Selection Summary */}
          {preference && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-arabic">
                <strong>تم اختيار:</strong> النمط {preferenceOptions.find(o => o.value === preference)?.label}
              </p>
              <p className="text-sm text-green-700 font-arabic mt-1">
                سيتم تخصيص التطبيق لتوفير أفضل تجربة تعلم لطفلك
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