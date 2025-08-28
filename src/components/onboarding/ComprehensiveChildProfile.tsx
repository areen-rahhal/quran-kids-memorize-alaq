import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  User, 
  Settings, 
  BookOpen, 
  Eye, 
  Volume2, 
  Hand, 
  Target,
  CheckCircle,
  AlertTriangle,
  FileUser
} from 'lucide-react';
import { juz30Surahs } from '@/data/juz30';
import type { ChildProfile } from '@/pages/OnboardingFlow';

interface ComprehensiveChildProfileProps {
  child: ChildProfile;
  onNext: (child: Partial<ChildProfile>) => void;
  onBack: () => void;
  isLoading?: boolean;
}

const avatarOptions = [
  { id: 1, emoji: '😊', bg: 'bg-blue-500' },
  { id: 2, emoji: '🎯', bg: 'bg-red-500' },
  { id: 3, emoji: '⭐', bg: 'bg-orange-500' },
  { id: 4, emoji: '😀', bg: 'bg-blue-600' },
  { id: 5, emoji: '🚀', bg: 'bg-teal-500' },
  { id: 6, emoji: '⚡', bg: 'bg-blue-700' },
  { id: 7, emoji: '🌸', bg: 'bg-pink-500' },
  { id: 8, emoji: '🏆', bg: 'bg-purple-500' },
];

const levelLabels = {
  beginner: 'مبتدئ',
  intermediate: 'متوسط',
  advanced: 'متقدم'
};

const preferenceOptions = [
  {
    value: 'visual' as const,
    label: 'بصري',
    description: 'يتعلم بشكل أفضل من خلال الرؤية والألوان',
    icon: Eye,
    color: 'text-blue-600'
  },
  {
    value: 'audio' as const,
    label: 'سمعي',
    description: 'يتعلم بشكل أفضل من خلال الاستماع والتكرار',
    icon: Volume2,
    color: 'text-green-600'
  },
  {
    value: 'sensory' as const,
    label: 'حسي/حركي',
    description: 'يتعلم بشكل أفضل من خلال الحركة والتفاعل',
    icon: Hand,
    color: 'text-purple-600'
  }
];

const goalOptions = [
  {
    value: 'memorize_new' as const,
    label: 'حفظ سور جديدة',
    description: 'التركيز على تعلم سور لم يحفظها من قبل'
  },
  {
    value: 'review_memorized' as const,
    label: 'مراجعة السور المحفوظة',
    description: 'التركيز على تقوية وإتقان السور المحفوظة'
  },
  {
    value: 'balance_both' as const,
    label: 'التوازن بين الحفظ والمراجعة',
    description: 'توزيع الوقت بين حفظ الجديد ومراجعة القديم'
  }
];

const proficiencyLabels = {
  excellent: 'ممتاز',
  very_good: 'جيد جداً',
  basic: 'أساسي'
};

const speechDisorderTypes = [
  'صعوبة نطق الراء (ر)',
  'صعوبة نطق السين (س)',
  'صعوبة نطق الشين (ش)',
  'صعوبة نطق الضاد (ض)',
  'تأتأة',
  'بطء في الكلام',
  'أخرى'
];

export const ComprehensiveChildProfile = ({ child, onNext, onBack, isLoading }: ComprehensiveChildProfileProps) => {
  // Child Details State
  const [formData, setFormData] = useState({
    first_name: child.first_name || '',
    age: child.age || 6,
    child_level: child.child_level || 'beginner' as const,
    native_language: child.native_language || 'arabic',
    avatar_url: child.avatar_url || '',
  });

  // Learning Plan State
  const [sessionTime, setSessionTime] = useState(child.session_time_minutes || 15);
  const [phaseLength, setPhaseLength] = useState(child.phase_length || 3);

  // Learning Record State
  const [memorizedSurahs, setMemorizedSurahs] = useState<Record<number, string>>(
    child.memorization_history.reduce((acc, item) => {
      acc[item.surah_number] = item.proficiency;
      return acc;
    }, {} as Record<number, string>)
  );

  // Learning Style State
  const [preference, setPreference] = useState<'visual' | 'audio' | 'sensory'>(
    child.learning_preference || 'audio'
  );

  // Learning Goals State
  const [learningGoal, setLearningGoal] = useState<'memorize_new' | 'review_memorized' | 'balance_both'>(
    child.learning_goal || 'memorize_new'
  );
  const [targetJuz, setTargetJuz] = useState<number | undefined>(child.target_juz);
  const [targetSurahs, setTargetSurahs] = useState<number[]>(child.target_surahs || []);
  const [goalType, setGoalType] = useState<'juz' | 'specific'>('juz');

  // Speech Disorder State
  const [hasSpeechDisorder, setHasSpeechDisorder] = useState<boolean>(
    child.has_speech_disorder || false
  );
  const [speechDisorderType, setSpeechDisorderType] = useState<string>(
    child.speech_disorder_type || ''
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

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

  const handleTargetSurahToggle = (surahId: number) => {
    setTargetSurahs(prev => 
      prev.includes(surahId) 
        ? prev.filter(id => id !== surahId)
        : [...prev, surahId]
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'اسم الطفل مطلوب';
    }
    
    if (formData.age < 3 || formData.age > 18) {
      newErrors.age = 'العمر يجب أن يكون بين 3 و 18 سنة';
    }

    if (hasSpeechDisorder && !speechDisorderType) {
      newErrors.speech_disorder = 'يرجى تحديد نوع اضطراب النطق';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const memorization_history = Object.entries(memorizedSurahs).map(([surahNumber, proficiency]) => ({
      surah_number: parseInt(surahNumber),
      proficiency: proficiency as 'basic' | 'very_good' | 'excellent'
    }));

    const childData = {
      ...formData,
      session_time_minutes: sessionTime,
      phase_length: phaseLength,
      memorization_history,
      learning_preference: preference,
      learning_goal: learningGoal,
      target_juz: goalType === 'juz' ? targetJuz : undefined,
      target_surahs: goalType === 'specific' ? targetSurahs : [],
      has_speech_disorder: hasSpeechDisorder,
      speech_disorder_type: hasSpeechDisorder ? speechDisorderType : undefined,
    };

    onNext(childData);
  };

  const sessionOptions = [
    { value: 10, label: '10 دقائق' },
    { value: 15, label: '15 دقيقة (موصى به)' },
    { value: 20, label: '20 دقيقة' },
    { value: 30, label: '30 دقيقة' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-emerald-700 font-arabic mb-2">
            إضافة طفل جديد
          </h1>
          <p className="text-muted-foreground font-arabic">
            إعداد خطة تعلم مخصصة لطفلك
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Child Details Section */}
          <Card className="p-6 bg-white shadow-lg border-emerald-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 font-arabic">المعلومات الأساسية</h2>
                <p className="text-sm text-gray-600 font-arabic">بيانات الطفل الشخصية</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Avatar Selection */}
              <div className="lg:col-span-2">
                <Label className="font-arabic mb-3 block">الصورة الرمزية</Label>
                <div className="flex flex-wrap justify-center gap-3">
                  {avatarOptions.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => handleInputChange('avatar_url', `avatar-${avatar.id}`)}
                      className={`relative rounded-2xl border-2 p-1 transition-all duration-200 ${
                        formData.avatar_url === `avatar-${avatar.id}`
                          ? 'border-emerald-500 bg-emerald-50 scale-110' 
                          : 'border-gray-200 hover:border-emerald-300 hover:scale-105'
                      }`}
                    >
                      <div className={`w-16 h-16 ${avatar.bg} rounded-xl flex items-center justify-center text-2xl`}>
                        {avatar.emoji}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <Label htmlFor="firstName" className="font-arabic">
                  الاسم الأول *
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="اسم الطفل"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className={`text-right mt-2 ${errors.first_name ? 'border-red-500' : ''}`}
                  dir="rtl"
                />
                {errors.first_name && (
                  <p className="text-red-500 text-sm font-arabic mt-1">{errors.first_name}</p>
                )}
              </div>

              {/* Age */}
              <div>
                <Label className="font-arabic">العمر</Label>
                <Select 
                  value={formData.age.toString()} 
                  onValueChange={(value) => handleInputChange('age', parseInt(value))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="اختر العمر" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 16 }, (_, i) => i + 3).map(age => (
                      <SelectItem key={age} value={age.toString()}>
                        <span className="font-arabic">{age} سنوات</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Level */}
              <div>
                <Label className="font-arabic">مستوى الطفل</Label>
                <Select 
                  value={formData.child_level} 
                  onValueChange={(value) => handleInputChange('child_level', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="اختر المستوى" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(levelLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        <span className="font-arabic">{label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Native Language */}
              <div>
                <Label className="font-arabic">اللغة الأم</Label>
                <Select 
                  value={formData.native_language} 
                  onValueChange={(value) => handleInputChange('native_language', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="اختر اللغة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="arabic">
                      <span className="font-arabic">العربية</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Learning Plan Section */}
          <Card className="p-6 bg-white shadow-lg border-emerald-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Settings className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 font-arabic">إعدادات التعلم</h2>
                <p className="text-sm text-gray-600 font-arabic">تخصيص تجربة التعلم</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Session Duration */}
              <div>
                <Label className="font-arabic mb-3 block">مدة الجلسة الواحدة</Label>
                <div className="grid grid-cols-2 gap-3">
                  {sessionOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSessionTime(option.value)}
                      className={`p-3 rounded-lg border-2 transition-colors font-arabic text-sm ${
                        sessionTime === option.value
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700 font-arabic">
                    💡 ننصح بجلسات 10-15 دقيقة للأطفال (6 سنوات). نحتاج أن نعلم الطفل الحب في حجلسات قصيرة مع 2-3 آيات في كل مرحلة.
                  </p>
                </div>
              </div>

              {/* Verses per Stage */}
              <div>
                <Label className="font-arabic mb-3 block">الوقت المناسب للتركيز دون ملل</Label>
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
                          {num} {num === 1 ? 'آية' : 'آيات'} في كل مرحلة
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-600 font-arabic mt-2">
                  عدد الآيات في كل مرحلة حفظ (الافتراضي: 3)
                </p>
              </div>
            </div>
          </Card>

          {/* Learning Record Section */}
          <Card className="p-6 bg-white shadow-lg border-emerald-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 font-arabic">السجل التعليمي</h2>
                  <p className="text-sm text-gray-600 font-arabic">السور التي أتقنها طفلك من قبل</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-green-600 font-arabic font-semibold">
                  {Object.keys(memorizedSurahs).length} سورة محفوظة
                </div>
              </div>
            </div>

            {/* Proficiency Level Selection */}
            <div className="mb-6">
              <Label className="font-arabic mb-4 block text-lg">الخطوة الأولى: اختر مستوى الإتقان</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(proficiencyLabels).map(([key, label]) => {
                  const count = Object.values(memorizedSurahs).filter(p => p === key).length;
                  const isBasic = key === 'basic';
                  const isVeryGood = key === 'very_good';
                  const isExcellent = key === 'excellent';
                  
                  return (
                    <div
                      key={key}
                      className={`p-6 border-2 rounded-xl transition-all cursor-pointer ${
                        count > 0 
                          ? isBasic 
                            ? 'border-gray-300 bg-gray-50' 
                            : isVeryGood 
                              ? 'border-blue-400 bg-blue-50' 
                              : 'border-green-300 bg-green-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                          isBasic 
                            ? 'bg-gray-100' 
                            : isVeryGood 
                              ? 'bg-blue-100' 
                              : 'bg-green-100'
                        }`}>
                          {isBasic && <CheckCircle className="w-6 h-6 text-gray-600" />}
                          {isVeryGood && <Volume2 className="w-6 h-6 text-blue-600" />}
                          {isExcellent && <Target className="w-6 h-6 text-green-600" />}
                        </div>
                        <h3 className="font-bold text-gray-900 font-arabic text-lg mb-2">{label}</h3>
                        <p className="text-sm text-gray-600 font-arabic mb-3">
                          {isBasic && 'حفظ أساسي يحتاج تقوية'}
                          {isVeryGood && 'حفظ جيد مع أخطاء قليلة'}
                          {isExcellent && 'حفظ متقن مع تلاوة صحيحة'}
                        </p>
                        {count > 0 && (
                          <div className={`text-sm font-semibold ${
                            isBasic 
                              ? 'text-red-600' 
                              : isVeryGood 
                                ? 'text-blue-600' 
                                : 'text-green-600'
                          }`}>
                            {count} سورة
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Surahs Selection */}
            <div className="space-y-4">
              <Label className="font-arabic text-lg block">الخطوة الثانية: اختر السور بمستوى "جيد جداً"</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {juz30Surahs.map((surah) => {
                  const isMemorized = memorizedSurahs[surah.id] !== undefined;
                  const proficiency = memorizedSurahs[surah.id];
                  
                  return (
                    <div 
                      key={surah.id}
                      onClick={() => handleSurahToggle(surah.id)}
                      className={`p-4 border-2 rounded-xl transition-all cursor-pointer text-center ${
                        isMemorized 
                          ? proficiency === 'basic'
                            ? 'border-orange-300 bg-orange-50'
                            : proficiency === 'very_good'
                              ? 'border-blue-400 bg-blue-50'
                              : 'border-green-300 bg-green-50'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="space-y-2">
                        <h3 className="font-bold text-gray-900 font-arabic text-sm">
                          {surah.arabicName}
                        </h3>
                        <p className="text-xs text-gray-600 font-arabic">
                          {surah.name}
                        </p>
                        
                        {isMemorized ? (
                          <div className="space-y-2">
                            <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              proficiency === 'basic'
                                ? 'bg-orange-100 text-orange-700'
                                : proficiency === 'very_good'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-green-100 text-green-700'
                            }`}>
                              {proficiency === 'basic' && 'أساسي'}
                              {proficiency === 'very_good' && 'محدد'}
                              {proficiency === 'excellent' && 'ممتاز'}
                            </div>
                            
                            {/* Proficiency selector buttons */}
                            <div className="flex gap-1 justify-center">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProficiencyChange(surah.id, 'basic');
                                }}
                                className={`w-6 h-6 rounded-full text-xs font-bold ${
                                  proficiency === 'basic'
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-200 text-gray-600 hover:bg-orange-200'
                                }`}
                              >
                                أ
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProficiencyChange(surah.id, 'very_good');
                                }}
                                className={`w-6 h-6 rounded-full text-xs font-bold ${
                                  proficiency === 'very_good'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-600 hover:bg-blue-200'
                                }`}
                              >
                                ج
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProficiencyChange(surah.id, 'excellent');
                                }}
                                className={`w-6 h-6 rounded-full text-xs font-bold ${
                                  proficiency === 'excellent'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200 text-gray-600 hover:bg-green-200'
                                }`}
                              >
                                م
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500 font-arabic">
                            اضغط للإضافة
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Optional note */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 font-arabic">
                💡 هذه المعلومات اختيارية وستساعد في تخصيص خطة التعلم المناسبة لطفلك
              </p>
            </div>
          </Card>

          {/* Learning Style & Goals Combined */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Learning Style */}
            <Card className="p-6 bg-white shadow-lg border-emerald-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Eye className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 font-arabic">نمط التعلم</h2>
                  <p className="text-sm text-gray-600 font-arabic">أسلوب التعلم المفضل</p>
                </div>
              </div>

              <RadioGroup value={preference} onValueChange={(value) => setPreference(value as any)}>
                {preferenceOptions.map((option) => {
                  const IconComponent = option.icon;
                  
                  return (
                    <div key={option.value} className="flex items-center space-x-3 space-x-reverse">
                      <RadioGroupItem value={option.value} id={`pref-${option.value}`} />
                      <Label 
                        htmlFor={`pref-${option.value}`} 
                        className="flex-1 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <IconComponent className={`w-5 h-5 ${option.color}`} />
                          <div>
                            <h3 className="font-semibold font-arabic">{option.label}</h3>
                            <p className="text-sm text-gray-600 font-arabic">
                              {option.description}
                            </p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </Card>

            {/* Learning Goals */}
            <Card className="p-6 bg-white shadow-lg border-emerald-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 font-arabic">هدف التعلم</h2>
                  <p className="text-sm text-gray-600 font-arabic">نوع النشاط المفضل</p>
                </div>
              </div>

              <RadioGroup value={learningGoal} onValueChange={(value) => setLearningGoal(value as any)}>
                {goalOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3 space-x-reverse">
                    <RadioGroupItem value={option.value} id={`goal-${option.value}`} />
                    <Label 
                      htmlFor={`goal-${option.value}`} 
                      className="flex-1 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <h3 className="font-semibold font-arabic">{option.label}</h3>
                        <p className="text-sm text-gray-600 font-arabic">
                          {option.description}
                        </p>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <Separator className="my-4" />

              <div className="space-y-3">
                <Label className="font-arabic">اختر المنهج</Label>
                
                <RadioGroup value={goalType} onValueChange={(value) => setGoalType(value as any)}>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="juz" id="target-juz" />
                    <Label htmlFor="target-juz" className="font-arabic">الجزء الثلاثون كاملاً</Label>
                  </div>
                </RadioGroup>

                {goalType === 'juz' && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700 font-arabic">
                      ✅ تم اختيار الجزء الثلاثون (عم)
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Speech Disorder Section */}
          <Card className="p-6 bg-white shadow-lg border-emerald-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 font-arabic">اضطرابات النطق</h2>
                <p className="text-sm text-gray-600 font-arabic">معلومات اختيارية لتخصيص التطبيق</p>
              </div>
            </div>

            <div className="space-y-4">
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
                    لا يعاني من صعوبات في النطق
                  </Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="true" id="has-disorder" />
                  <Label htmlFor="has-disorder" className="font-arabic">
                    يعاني من صعوبات في النطق
                  </Label>
                </div>
              </RadioGroup>

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
                  {errors.speech_disorder && (
                    <p className="text-red-500 text-sm font-arabic">{errors.speech_disorder}</p>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="font-arabic"
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة
            </Button>
            
            <Button 
              type="submit" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-arabic px-8"
              disabled={isLoading}
            >
              <FileUser className="w-4 h-4 ml-2" />
              {isLoading ? 'جارٍ الحفظ...' : 'إنهاء الملف'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};