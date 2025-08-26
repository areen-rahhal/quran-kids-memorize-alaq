import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft } from 'lucide-react';
import type { ChildProfile } from '@/pages/OnboardingFlow';

interface CreateChildProfileProps {
  child: ChildProfile;
  onNext: (child: Partial<ChildProfile>) => void;
  onBack: () => void;
}

const avatarOptions = [
  '/avatars/boy1.png',
  '/avatars/boy2.png',
  '/avatars/boy3.png',
  '/avatars/girl1.png',
  '/avatars/girl2.png',
  '/avatars/girl3.png',
];

const levelLabels = {
  beginner: 'مبتدئ',
  intermediate: 'متوسط',
  advanced: 'متقدم'
};

export const CreateChildProfile = ({ child, onNext, onBack }: CreateChildProfileProps) => {
  const [formData, setFormData] = useState({
    first_name: child.first_name || '',
    age: child.age || 5,
    child_level: child.child_level || 'beginner' as const,
    native_language: child.native_language || 'arabic',
    avatar_url: child.avatar_url || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'اسم الطفل مطلوب';
    }
    
    if (formData.age < 3 || formData.age > 18) {
      newErrors.age = 'العمر يجب أن يكون بين 3 و 18 سنة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext(formData);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-white shadow-xl border-emerald-200">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-emerald-700 font-arabic mb-2">
            ملف الطفل الأساسي
          </h1>
          <p className="text-muted-foreground font-arabic text-sm">
            أدخل المعلومات الأساسية لطفلك
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Selection */}
          <div className="space-y-3">
            <Label className="font-arabic">اختر صورة للطفل</Label>
            <div className="flex flex-wrap justify-center gap-3">
              {avatarOptions.map((avatar, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleInputChange('avatar_url', avatar)}
                  className={`relative rounded-full border-2 p-1 transition-colors ${
                    formData.avatar_url === avatar 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={avatar} />
                    <AvatarFallback>👶</AvatarFallback>
                  </Avatar>
                </button>
              ))}
            </div>
          </div>

          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName" className="font-arabic">
              الاسم الأول *
            </Label>
            <Input
              id="firstName"
              type="text"
              placeholder="أدخل اسم الطفل"
              value={formData.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              className={`text-right ${errors.first_name ? 'border-red-500' : ''}`}
              dir="rtl"
            />
            {errors.first_name && (
              <p className="text-red-500 text-sm font-arabic">{errors.first_name}</p>
            )}
          </div>

          {/* Age */}
          <div className="space-y-2">
            <Label htmlFor="age" className="font-arabic">
              العمر *
            </Label>
            <Select 
              value={formData.age.toString()} 
              onValueChange={(value) => handleInputChange('age', parseInt(value))}
            >
              <SelectTrigger className={errors.age ? 'border-red-500' : ''}>
                <SelectValue placeholder="اختر العمر" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 16 }, (_, i) => i + 3).map(age => (
                  <SelectItem key={age} value={age.toString()}>
                    <span className="font-arabic">{age} سنة</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.age && (
              <p className="text-red-500 text-sm font-arabic">{errors.age}</p>
            )}
          </div>

          {/* Child Level */}
          <div className="space-y-2">
            <Label className="font-arabic">مستوى الطفل *</Label>
            <Select 
              value={formData.child_level} 
              onValueChange={(value) => handleInputChange('child_level', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر المستوى" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">
                  <span className="font-arabic">{levelLabels.beginner}</span>
                </SelectItem>
                <SelectItem value="intermediate">
                  <span className="font-arabic">{levelLabels.intermediate}</span>
                </SelectItem>
                <SelectItem value="advanced">
                  <span className="font-arabic">{levelLabels.advanced}</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Native Language */}
          <div className="space-y-2">
            <Label className="font-arabic">اللغة الأم *</Label>
            <Select 
              value={formData.native_language} 
              onValueChange={(value) => handleInputChange('native_language', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر اللغة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="arabic">
                  <span className="font-arabic">العربية</span>
                </SelectItem>
                <SelectItem value="other">
                  <span className="font-arabic">أخرى</span>
                </SelectItem>
              </SelectContent>
            </Select>
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