import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ChildProfile = Database['public']['Tables']['child_profiles']['Row'];
type MemorizationHistory = Database['public']['Tables']['child_memorization_history']['Row'];

export const useChildProfiles = () => {
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [memorizationHistory, setMemorizationHistory] = useState<MemorizationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load child profiles
  const loadChildProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('child_profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      setChildProfiles(data || []);
      
      // Auto-select first child if none selected
      if (data && data.length > 0 && !selectedChild) {
        setSelectedChild(data[0]);
      }
    } catch (err) {
      console.error('Error loading child profiles:', err);
      setError(err instanceof Error ? err.message : 'Failed to load child profiles');
    } finally {
      setLoading(false);
    }
  };

  // Load memorization history for selected child
  const loadMemorizationHistory = async (childId: string) => {
    try {
      const { data, error } = await supabase
        .from('child_memorization_history')
        .select('*')
        .eq('child_id', childId);

      if (error) throw error;
      setMemorizationHistory(data || []);
    } catch (err) {
      console.error('Error loading memorization history:', err);
    }
  };

  // Get proficiency for a specific surah
  const getSurahProficiency = (surahNumber: number): string | null => {
    const history = memorizationHistory.find(h => h.surah_number === surahNumber);
    return history?.proficiency || null;
  };

  // Get completed surahs (those with any proficiency level)
  const getCompletedSurahs = (): number[] => {
    return memorizationHistory.map(h => h.surah_number);
  };

  // Select a child and load their progress
  const selectChild = async (child: ChildProfile) => {
    setSelectedChild(child);
    await loadMemorizationHistory(child.id);
    
    // Save selection to localStorage
    localStorage.setItem('selectedChildId', child.id);
  };

  // Load profiles on mount
  useEffect(() => {
    loadChildProfiles();
  }, []);

  // Load memorization history when child is selected
  useEffect(() => {
    if (selectedChild) {
      loadMemorizationHistory(selectedChild.id);
    }
  }, [selectedChild]);

  // Restore selected child from localStorage
  useEffect(() => {
    const savedChildId = localStorage.getItem('selectedChildId');
    if (savedChildId && childProfiles.length > 0) {
      const savedChild = childProfiles.find(child => child.id === savedChildId);
      if (savedChild) {
        setSelectedChild(savedChild);
      }
    }
  }, [childProfiles]);

  return {
    childProfiles,
    selectedChild,
    memorizationHistory,
    loading,
    error,
    selectChild,
    getSurahProficiency,
    getCompletedSurahs,
    reload: loadChildProfiles
  };
};