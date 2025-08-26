import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, User } from 'lucide-react';
import type { ParentProfile } from '@/pages/OnboardingFlow';

interface ParentProfileFormProps {
  profile: ParentProfile;
  onSave: (profile: ParentProfile) => void;
  isLoading: boolean;
}

export const ParentProfileForm = ({ profile, onSave, isLoading }: ParentProfileFormProps) => {
  const [formData, setFormData] = useState<ParentProfile>(profile);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof ParentProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'الاسم الكامل مطلوب';
    }
    
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'رقم الهاتف مطلوب';
    } else if (!/^[\d\s\+\-\(\)]+$/.test(formData.phone_number)) {
      newErrors.phone_number = 'رقم الهاتف غير صحيح';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload to storage
      const url = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, profile_picture_url: url }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-white shadow-xl border-emerald-200">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-emerald-700 font-arabic mb-2">
            معلومات الوالد
          </h1>
          <p className="text-muted-foreground font-arabic text-sm">
            أدخل بياناتك الشخصية لإنشاء حساب لأطفالك
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={formData.profile_picture_url} />
              <AvatarFallback className="bg-emerald-100">
                <User className="w-8 h-8 text-emerald-600" />
              </AvatarFallback>
            </Avatar>
            
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="profile-upload"
              />
              <Label htmlFor="profile-upload" className="cursor-pointer">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="font-arabic"
                  asChild
                >
                  <span>
                    <Upload className="w-4 h-4 ml-2" />
                    رفع صورة (اختياري)
                  </span>
                </Button>
              </Label>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="font-arabic">
              الاسم الكامل *
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="أدخل اسمك الكامل"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              className={`text-right ${errors.full_name ? 'border-red-500' : ''}`}
              dir="rtl"
            />
            {errors.full_name && (
              <p className="text-red-500 text-sm font-arabic">{errors.full_name}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="font-arabic">
              رقم الهاتف *
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+966 50 123 4567"
              value={formData.phone_number}
              onChange={(e) => handleInputChange('phone_number', e.target.value)}
              className={`text-left ${errors.phone_number ? 'border-red-500' : ''}`}
              dir="ltr"
            />
            {errors.phone_number && (
              <p className="text-red-500 text-sm font-arabic">{errors.phone_number}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-arabic"
            disabled={isLoading}
          >
            {isLoading ? 'جارٍ الحفظ...' : 'حفظ والمتابعة'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground font-arabic">
            * الحقول المطلوبة
          </p>
        </div>
      </Card>
    </div>
  );
};