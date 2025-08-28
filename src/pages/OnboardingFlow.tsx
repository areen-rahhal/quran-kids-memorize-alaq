import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ParentProfileForm } from '@/components/onboarding/ParentProfileForm';
import { ChildrenOverview } from '@/components/onboarding/ChildrenOverview';
import { ComprehensiveChildProfile } from '@/components/onboarding/ComprehensiveChildProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type OnboardingStep = 
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
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('children_overview');
  const [parentProfile, setParentProfile] = useState<ParentProfile | null>(null);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [editingChildIndex, setEditingChildIndex] = useState<number | null>(null);
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

  // Create parent profile automatically and load existing children
  useEffect(() => {
    const initializeProfile = async () => {
      if (!user) return;
      
      try {
        // Create or get parent profile
        const { data: profile, error: profileError } = await supabase
          .from('parent_profiles')
          .upsert({
            user_id: user.id,
            full_name: user.user_metadata?.full_name || '',
            phone_number: user.user_metadata?.phone_number || '',
          })
          .select()
          .single();

        if (profileError) throw profileError;

        setParentProfile(profile);
        
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
      } catch (error) {
        console.error('Error initializing profile:', error);
      }
    };

    if (user && !loading) {
      initializeProfile();
    }
  }, [user, loading]);


  const handleNext = (step: OnboardingStep) => {
    setCurrentStep(step);
  };

  const handleChildComplete = async (childData: Partial<ChildProfile>) => {
    if (!parentProfile?.id) return;
    
    try {
      setIsLoading(true);
      
      // Check if we're editing an existing child
      if (editingChildIndex !== null) {
        // Update existing child
        const childToUpdate = children[editingChildIndex];
        if (childToUpdate.id) {
          const { data: updatedChild, error: updateError } = await supabase
            .from('child_profiles')
            .update({
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
            .eq('id', childToUpdate.id)
            .select()
            .single();

          if (updateError) throw updateError;

          // Update memorization history
          await supabase
            .from('child_memorization_history')
            .delete()
            .eq('child_id', childToUpdate.id);

          if (childData.memorization_history && childData.memorization_history.length > 0) {
            const historyInserts = childData.memorization_history.map(item => ({
              child_id: childToUpdate.id,
              surah_number: item.surah_number,
              proficiency: item.proficiency as 'basic' | 'very_good' | 'excellent',
            }));

            await supabase
              .from('child_memorization_history')
              .insert(historyInserts);
          }

          // Update target surahs
          await supabase
            .from('child_target_surahs')
            .delete()
            .eq('child_id', childToUpdate.id);

          if (childData.target_surahs && childData.target_surahs.length > 0) {
            const targetInserts = childData.target_surahs.map(surahNumber => ({
              child_id: childToUpdate.id,
              surah_number: surahNumber,
            }));

            await supabase
              .from('child_target_surahs')
              .insert(targetInserts);
          }

          // Update children list
          const updatedChildren = [...children];
          updatedChildren[editingChildIndex] = { ...updatedChild, memorization_history: childData.memorization_history || [], target_surahs: childData.target_surahs || [] };
          setChildren(updatedChildren);
          setEditingChildIndex(null);

          toast({
            title: "تم تحديث البيانات",
            description: `تم تحديث ملف ${childData.first_name} بنجاح`,
          });
        }
      } else {
        // Create new child
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
        
        toast({
          title: "تم إنشاء الملف",
          description: `تم إنشاء ملف ${childData.first_name} بنجاح`,
        });
      }
      
      setCurrentStep('children_overview');
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
      case 'children_overview':
        return (
          <ChildrenOverview
            children={children}
            onAddChild={() => {
              setEditingChildIndex(null);
              setCurrentChild({
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
              setCurrentStep('create_child_comprehensive');
            }}
            onEditChild={(childIndex) => {
              setEditingChildIndex(childIndex);
              setCurrentChild(children[childIndex]);
              setCurrentStep('create_child_comprehensive');
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