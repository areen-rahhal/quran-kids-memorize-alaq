import { BookOpen, Star, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { studyPhases } from '@/data/studyPhases';
import { ChildProfileSwitcher } from './ChildProfileSwitcher';
import { useChildProfiles } from '@/hooks/useChildProfiles';
interface QuranHeaderProps {
  completedPhaseCount: number;
  totalPhases: number;
  progress: number;
  currentPhaseIdx: number;
  setCurrentPhaseIdx: (idx: number) => void;
  completedVerses: number[];
  completedTestingPhases: number[];
}
export const QuranHeader = ({
  completedPhaseCount,
  totalPhases,
  progress,
  currentPhaseIdx,
  setCurrentPhaseIdx,
  completedVerses,
  completedTestingPhases
}: QuranHeaderProps) => {
  const {
    childProfiles,
    selectedChild,
    selectChild,
    loading
  } = useChildProfiles();
  return;
};