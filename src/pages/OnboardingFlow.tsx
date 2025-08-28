import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ParentProfileForm } from '@/components/onboarding/ParentProfileForm';
import { ChildrenOverview } from '@/components/onboarding/ChildrenOverview';
import { ComprehensiveChildProfile } from '@/components/onboarding/ComprehensiveChildProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type OnboardingStep = 
  | 'parent_profile' 
  | 'children_overview' 
  | 'create_child_comprehensive'
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
  memorization_history: { surah_number: number; proficiency: 'basic' | 'very_good' | 'excellent' }[];
  target_surahs: number[];
}

const OnboardingFlow = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('parent_profile');
  const [parentProfile, setParentProfile] = useState<ParentProfile | null>(null);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [currentChild, setCurrentChild] = useState<ChildProfile>({
    first_name: '',
    age: 6,
    child_level: 'beginner',
    native_language: 'arabic',
    session_time_minutes: 15,
    phase_length: 3,
    learning_goal: 'memorize_new',
    learning_preference: 'audio',
    has_speech_disorder: false,
    memorization_history: [],
    target_surahs: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  // Check if user already has a parent profile
  useEffect(() => {
    const checkExistingProfile = async () => {
      if (!user) return;
      
      try {
        const { data: profile } = await supabase
          .from('parent_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          setParentProfile(profile);
          setCurrentStep('children_overview');
          
          // Load existing children
          const { data: childrenData } = await supabase
            .from('child_profiles')
            .select(`
              *,
              child_memorization_history(surah_number, proficiency),
              child_target_surahs(surah_number)
            `)
            .eq('parent_id', profile.id);

          if (childrenData) {
            const formattedChildren = childrenData.map(child => ({
              ...child,
              memorization_history: child.child_memorization_history || [],
              target_surahs: (child.child_target_surahs || []).map(t => t.surah_number),
            }));
            setChildren(formattedChildren);
          }
        }
      } catch (error) {
        console.error('Error checking profile:', error);
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

      setParentProfile(data);
      setCurrentStep('children_overview');
      
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

  const handleNext = (step: OnboardingStep) => {
    setCurrentStep(step);
  };

  const handleChildComplete = async (childData: Partial<ChildProfile>) => {
    if (!parentProfile?.id) return;
    
    try {
      setIsLoading(true);
      
      // Save child profile to database
      const { data: savedChild, error: childError } = await supabase
        .from('child_profiles')
        .insert({
          parent_id: parentProfile.id,
          first_name: childData.first_name!,
          age: childData.age!,
          child_level: childData.child_level!,
          native_language: childData.native_language!,
          avatar_url: childData.avatar_url,
          session_time_minutes: childData.session_time_minutes!,
          phase_length: childData.phase_length!,
          learning_goal: childData.learning_goal!,
          learning_preference: childData.learning_preference!,
          has_speech_disorder: childData.has_speech_disorder || false,
          speech_disorder_type: childData.speech_disorder_type,
          target_juz: childData.target_juz,
        })
        .select()
        .single();

      if (childError) throw childError;

      // Save memorization history if any
      if (childData.memorization_history && childData.memorization_history.length > 0) {
        const historyInserts = childData.memorization_history.map(item => ({
          child_id: savedChild.id,
          surah_number: item.surah_number,
          proficiency: item.proficiency as 'basic' | 'very_good' | 'excellent',
        }));

        const { error: historyError } = await supabase
          .from('child_memorization_history')
          .insert(historyInserts);

        if (historyError) throw historyError;
      }

      // Save target surahs if any
      if (childData.target_surahs && childData.target_surahs.length > 0) {
        const targetInserts = childData.target_surahs.map(surahNumber => ({
          child_id: savedChild.id,
          surah_number: surahNumber,
        }));

        const { error: targetError } = await supabase
          .from('child_target_surahs')
          .insert(targetInserts);

        if (targetError) throw targetError;
      }

      // Add child to current children list
      setChildren(prev => [...prev, { ...savedChild, memorization_history: childData.memorization_history || [], target_surahs: childData.target_surahs || [] }]);
      setCurrentStep('children_overview');
      
      toast({
        title: "تم إنشاء الملف",
        description: `تم إنشاء ملف ${childData.first_name} بنجاح`,
      });
    } catch (error) {
      console.error('Error saving child:', error);
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
      case 'parent_profile':
        return (
          <ParentProfileForm
            profile={parentProfile || { full_name: '', phone_number: '' }}
            onSave={handleParentProfileSave}
            isLoading={isLoading}
          />
        );

      case 'children_overview':
        return (
          <ChildrenOverview
            children={children}
            onAddChild={() => setCurrentStep('create_child_comprehensive')}
            onEditChild={(childId) => {
              // Handle edit child logic here
              console.log('Edit child:', childId);
            }}
            onComplete={() => setCurrentStep('complete')}
          />
        );

      case 'create_child_comprehensive':
        return (
          <ComprehensiveChildProfile
            child={currentChild}
            onNext={(childData) => {
              handleChildComplete(childData);
            }}
            onBack={() => setCurrentStep('children_overview')}
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