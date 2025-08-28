import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ParentProfileForm } from '@/components/onboarding/ParentProfileForm';
import { ChildrenOverview } from '@/components/onboarding/ChildrenOverview';
import { CreateChildProfile } from '@/components/onboarding/CreateChildProfile';
import { LearningCapacity } from '@/components/onboarding/LearningCapacity';
import { LevelHistory } from '@/components/onboarding/LevelHistory';
import { LearningGoal } from '@/components/onboarding/LearningGoal';
import { LearningPreference } from '@/components/onboarding/LearningPreference';
import { SpeechDisorder } from '@/components/onboarding/SpeechDisorder';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type OnboardingStep = 

  | 'children-overview'
  | 'child-profile'
  | 'learning-capacity'
  | 'level-history'
  | 'learning-goal'
  | 'learning-preference'
  | 'speech-disorder'
  | 'complete';

export interface ParentProfile {
  id?: string;
  full_name: string;
  phone_number: string;
  profile_picture_url?: string;
}

export interface ChildProfile {
  id?: string;
  first_name: string;
  age: number;
  child_level: 'beginner' | 'intermediate' | 'advanced';
  native_language: string;
  avatar_url?: string;
  session_time_minutes: number;
  phase_length: number;
  learning_goal: 'memorize_new' | 'review_memorized' | 'balance_both';
  learning_preference: 'visual' | 'audio' | 'sensory';
  has_speech_disorder: boolean;
  speech_disorder_type?: string;
  target_juz?: number;
  memorization_history: { surah_number: number; proficiency: string }[];
  target_surahs: number[];
}

const OnboardingFlow = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('parent-info');
  const [parentProfile, setParentProfile] = useState<ParentProfile>({
    full_name: '',
    phone_number: '',
  });
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [currentChildIndex, setCurrentChildIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user already has a parent profile
  useEffect(() => {
    const checkExistingProfile = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('parent_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          // User already has a profile, skip to children overview
          setParentProfile({
            id: profile.id,
            full_name: profile.full_name,
            phone_number: profile.phone_number || '',
            profile_picture_url: profile.profile_picture_url || undefined,
          });
          setCurrentStep('children-overview');
        }
      }
    };

    if (user && !loading) {
      checkExistingProfile();
    }
  }, [user, loading]);

  const handleParentProfileSave = async (profile: ParentProfile) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('parent_profiles')
        .upsert({
          user_id: user.id,
          full_name: profile.full_name,
          phone_number: profile.phone_number,
          profile_picture_url: profile.profile_picture_url,
        })
        .select()
        .single();

      if (error) throw error;

      setParentProfile({ ...profile, id: data.id });
      setCurrentStep('children-overview');
      
      toast({
        title: "تم حفظ البيانات",
        description: "تم حفظ معلومات الوالد بنجاح",
      });
    } catch (error) {
      console.error('Error saving parent profile:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حفظ البيانات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChildProfileSave = async (childProfile: Partial<ChildProfile>) => {
    if (!parentProfile.id) return;

    const updatedChildren = [...children];
    updatedChildren[currentChildIndex] = {
      ...updatedChildren[currentChildIndex],
      ...childProfile,
    } as ChildProfile;
    
    setChildren(updatedChildren);
    setCurrentStep('learning-capacity');
  };

  const handleNext = () => {
    const steps: OnboardingStep[] = [
      'child-profile',
      'learning-capacity',
      'level-history',
      'learning-goal',
      'learning-preference',
      'speech-disorder',
      'complete'
    ];
    
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleChildComplete = async () => {
    if (!parentProfile.id) return;

    setIsLoading(true);
    try {
      const currentChild = children[currentChildIndex];
      
      // Save child profile
      const { data: savedChild, error: childError } = await supabase
        .from('child_profiles')
        .upsert({
          parent_id: parentProfile.id,
          first_name: currentChild.first_name,
          age: currentChild.age,
          child_level: currentChild.child_level,
          native_language: currentChild.native_language,
          avatar_url: currentChild.avatar_url,
          session_time_minutes: currentChild.session_time_minutes,
          phase_length: currentChild.phase_length,
          learning_goal: currentChild.learning_goal,
          learning_preference: currentChild.learning_preference,
          has_speech_disorder: currentChild.has_speech_disorder,
          speech_disorder_type: currentChild.speech_disorder_type,
          target_juz: currentChild.target_juz,
        })
        .select()
        .single();

      if (childError) throw childError;

      // Save memorization history
      if (currentChild.memorization_history.length > 0) {
        const historyData = currentChild.memorization_history.map(h => ({
          child_id: savedChild.id,
          surah_number: h.surah_number,
          proficiency: h.proficiency as 'basic' | 'very_good' | 'excellent',
        }));

        const { error: historyError } = await supabase
          .from('child_memorization_history')
          .upsert(historyData);

        if (historyError) throw historyError;
      }

      // Save target surahs
      if (currentChild.target_surahs.length > 0) {
        const surahData = currentChild.target_surahs.map(s => ({
          child_id: savedChild.id,
          surah_number: s,
        }));

        const { error: surahError } = await supabase
          .from('child_target_surahs')
          .upsert(surahData);

        if (surahError) throw surahError;
      }

      toast({
        title: "تم حفظ البيانات",
        description: `تم حفظ ملف ${currentChild.first_name} بنجاح`,
      });

      setCurrentStep('children-overview');
    } catch (error) {
      console.error('Error saving child profile:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حفظ ملف الطفل",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground font-arabic">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'parent-info':
        return (
          <ParentProfileForm
            profile={parentProfile}
            onSave={handleParentProfileSave}
            isLoading={isLoading}
          />
        );
      
      case 'children-overview':
        return (
          <ChildrenOverview
            children={children}
            onAddChild={() => {
              if (children.length < 5) {
                setChildren([...children, {
                  first_name: '',
                  age: 5,
                  child_level: 'beginner',
                  native_language: 'arabic',
                  session_time_minutes: 15,
                  phase_length: 3,
                  learning_goal: 'memorize_new',
                  learning_preference: 'audio',
                  has_speech_disorder: false,
                  memorization_history: [],
                  target_surahs: [],
                }]);
                setCurrentChildIndex(children.length);
                setCurrentStep('child-profile');
              }
            }}
            onEditChild={(index) => {
              setCurrentChildIndex(index);
              setCurrentStep('child-profile');
            }}
            onComplete={() => setCurrentStep('complete')}
          />
        );
      
      case 'child-profile':
        return (
          <CreateChildProfile
            child={children[currentChildIndex]}
            onNext={handleChildProfileSave}
            onBack={() => setCurrentStep('children-overview')}
          />
        );
      
      case 'learning-capacity':
        return (
          <LearningCapacity
            child={children[currentChildIndex]}
            onNext={(data) => {
              const updatedChildren = [...children];
              updatedChildren[currentChildIndex] = { ...updatedChildren[currentChildIndex], ...data };
              setChildren(updatedChildren);
              handleNext();
            }}
            onBack={() => setCurrentStep('child-profile')}
          />
        );
      
      case 'level-history':
        return (
          <LevelHistory
            child={children[currentChildIndex]}
            onNext={(data) => {
              const updatedChildren = [...children];
              updatedChildren[currentChildIndex] = { ...updatedChildren[currentChildIndex], ...data };
              setChildren(updatedChildren);
              handleNext();
            }}
            onBack={() => setCurrentStep('learning-capacity')}
          />
        );
      
      case 'learning-goal':
        return (
          <LearningGoal
            child={children[currentChildIndex]}
            onNext={(data) => {
              const updatedChildren = [...children];
              updatedChildren[currentChildIndex] = { ...updatedChildren[currentChildIndex], ...data };
              setChildren(updatedChildren);
              handleNext();
            }}
            onBack={() => setCurrentStep('level-history')}
          />
        );
      
      case 'learning-preference':
        return (
          <LearningPreference
            child={children[currentChildIndex]}
            onNext={(data) => {
              const updatedChildren = [...children];
              updatedChildren[currentChildIndex] = { ...updatedChildren[currentChildIndex], ...data };
              setChildren(updatedChildren);
              handleNext();
            }}
            onBack={() => setCurrentStep('learning-goal')}
          />
        );
      
      case 'speech-disorder':
        return (
          <SpeechDisorder
            child={children[currentChildIndex]}
            onNext={(data) => {
              const updatedChildren = [...children];
              updatedChildren[currentChildIndex] = { ...updatedChildren[currentChildIndex], ...data };
              setChildren(updatedChildren);
              handleChildComplete();
            }}
            onBack={() => setCurrentStep('learning-preference')}
            isLoading={isLoading}
          />
        );
      
      case 'complete':
        return (
          <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-2xl font-bold text-emerald-700 font-arabic mb-4">
                تم إعداد حسابك بنجاح!
              </h1>
              <p className="text-muted-foreground font-arabic mb-6">
                يمكنك الآن بدء رحلة التعلم مع أطفالك
              </p>
              <Navigate to="/" replace />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      {renderCurrentStep()}
    </div>
  );
};

export default OnboardingFlow;