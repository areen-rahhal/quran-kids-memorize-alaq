-- Create enum for child levels
CREATE TYPE child_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- Create enum for learning goals
CREATE TYPE learning_goal AS ENUM ('memorize_new', 'review_memorized', 'balance_both');

-- Create enum for learning preferences
CREATE TYPE learning_preference AS ENUM ('visual', 'audio', 'sensory');

-- Create enum for proficiency levels
CREATE TYPE proficiency_level AS ENUM ('basic', 'very_good', 'excellent');

-- Create parent profiles table
CREATE TABLE public.parent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  profile_picture_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create child profiles table
CREATE TABLE public.child_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES public.parent_profiles(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0 AND age < 18),
  child_level child_level NOT NULL DEFAULT 'beginner',
  native_language TEXT NOT NULL DEFAULT 'arabic',
  avatar_url TEXT,
  session_time_minutes INTEGER NOT NULL DEFAULT 15 CHECK (session_time_minutes IN (10, 15, 20, 30)),
  phase_length INTEGER NOT NULL DEFAULT 3 CHECK (phase_length >= 1 AND phase_length <= 5),
  learning_goal learning_goal NOT NULL DEFAULT 'memorize_new',
  learning_preference learning_preference NOT NULL DEFAULT 'audio',
  has_speech_disorder BOOLEAN DEFAULT FALSE,
  speech_disorder_type TEXT,
  target_juz INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for child's memorization history
CREATE TABLE public.child_memorization_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.child_profiles(id) ON DELETE CASCADE NOT NULL,
  surah_number INTEGER NOT NULL,
  proficiency proficiency_level NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(child_id, surah_number)
);

-- Create table for target surahs (when specific surahs are chosen instead of full juz)
CREATE TABLE public.child_target_surahs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.child_profiles(id) ON DELETE CASCADE NOT NULL,
  surah_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(child_id, surah_number)
);

-- Add constraint to limit children per parent (max 5)
CREATE OR REPLACE FUNCTION check_child_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.child_profiles WHERE parent_id = NEW.parent_id) >= 5 THEN
    RAISE EXCEPTION 'Maximum of 5 children allowed per parent';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER child_limit_trigger
  BEFORE INSERT ON public.child_profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_child_limit();

-- Enable RLS on all tables
ALTER TABLE public.parent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_memorization_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_target_surahs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for parent_profiles
CREATE POLICY "Users can view their own parent profile"
ON public.parent_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own parent profile"
ON public.parent_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own parent profile"
ON public.parent_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Create RLS policies for child_profiles
CREATE POLICY "Parents can view their children profiles"
ON public.child_profiles FOR SELECT
USING (
  parent_id IN (
    SELECT id FROM public.parent_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Parents can create children profiles"
ON public.child_profiles FOR INSERT
WITH CHECK (
  parent_id IN (
    SELECT id FROM public.parent_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Parents can update their children profiles"
ON public.child_profiles FOR UPDATE
USING (
  parent_id IN (
    SELECT id FROM public.parent_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Parents can delete their children profiles"
ON public.child_profiles FOR DELETE
USING (
  parent_id IN (
    SELECT id FROM public.parent_profiles WHERE user_id = auth.uid()
  )
);

-- Create RLS policies for child_memorization_history
CREATE POLICY "Parents can view their children memorization history"
ON public.child_memorization_history FOR SELECT
USING (
  child_id IN (
    SELECT cp.id FROM public.child_profiles cp
    JOIN public.parent_profiles pp ON cp.parent_id = pp.id
    WHERE pp.user_id = auth.uid()
  )
);

CREATE POLICY "Parents can manage their children memorization history"
ON public.child_memorization_history FOR ALL
USING (
  child_id IN (
    SELECT cp.id FROM public.child_profiles cp
    JOIN public.parent_profiles pp ON cp.parent_id = pp.id
    WHERE pp.user_id = auth.uid()
  )
);

-- Create RLS policies for child_target_surahs
CREATE POLICY "Parents can view their children target surahs"
ON public.child_target_surahs FOR SELECT
USING (
  child_id IN (
    SELECT cp.id FROM public.child_profiles cp
    JOIN public.parent_profiles pp ON cp.parent_id = pp.id
    WHERE pp.user_id = auth.uid()
  )
);

CREATE POLICY "Parents can manage their children target surahs"
ON public.child_target_surahs FOR ALL
USING (
  child_id IN (
    SELECT cp.id FROM public.child_profiles cp
    JOIN public.parent_profiles pp ON cp.parent_id = pp.id
    WHERE pp.user_id = auth.uid()
  )
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_parent_profiles_updated_at
  BEFORE UPDATE ON public.parent_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_child_profiles_updated_at
  BEFORE UPDATE ON public.child_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_child_memorization_history_updated_at
  BEFORE UPDATE ON public.child_memorization_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();