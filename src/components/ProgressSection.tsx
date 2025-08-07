import { Check, Star } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ProgressSectionProps {
  currentSurahId: number;
  completedSurahs: number[];
  completedTestingPhases: number[];
  onSurahSelect: (surahId: number) => void;
  onPhaseSelect?: (phaseIndex: number) => void;
  currentPhaseIdx?: number;
}

// Simple data for the two surahs we want to show
const progressSurahs = [
  { id: 96, name: "Al-Alaq", arabicName: "العلق", phases: 5, phaseRanges: ["١-٣", "٤-٥", "٦-٨", "٩-١٤", "١٥-١٩"] },
  { id: 97, name: "Al-Qadr", arabicName: "القدر", phases: 1, phaseRanges: ["١-٥"] }
];

export const ProgressSection = ({ 
  currentSurahId, 
  completedSurahs, 
  completedTestingPhases,
  onSurahSelect,
  onPhaseSelect,
  currentPhaseIdx = 0
}: ProgressSectionProps) => {
  // Track which surahs are expanded (current surah is expanded by default)
  const [expandedSurahs, setExpandedSurahs] = useState<Set<number>>(() => new Set([currentSurahId]));
  
  // Ensure current surah is always expanded when currentSurahId changes
  useEffect(() => {
    setExpandedSurahs(prev => {
      const newExpanded = new Set(prev);
      newExpanded.add(currentSurahId);
      return newExpanded;
    });
  }, [currentSurahId]);
  
  const getPhaseStatus = (surahId: number, phaseIndex: number) => {
    const phaseId = surahId * 10 + phaseIndex + 1;
    if (completedTestingPhases.includes(phaseId)) return 'completed';
    if (surahId === currentSurahId && phaseIndex === currentPhaseIdx) return 'current';
    if (surahId === currentSurahId && phaseIndex < currentPhaseIdx) return 'started';
    return 'locked';
  };

  const getSurahStatus = (surahId: number) => {
    if (completedSurahs.includes(surahId)) return 'completed';
    if (surahId === currentSurahId) return 'current';
    return 'locked';
  };

  const toggleSurahExpansion = (surahId: number) => {
    setExpandedSurahs(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(surahId)) {
        newExpanded.delete(surahId);
      } else {
        newExpanded.add(surahId);
      }
      return newExpanded;
    });
  };

  // Create curved path data for visible items only
  const createCurvedPath = () => {
    const items = [];
    
    // Start with Al-Alaq (العلق) at bottom
    items.push({ type: 'surah', surahId: 96 });
    // Add its phases only if expanded
    if (expandedSurahs.has(96)) {
      for (let i = 0; i < 5; i++) {
        items.push({ type: 'phase', surahId: 96, phaseIndex: i, number: i + 1 });
      }
    }
    
    // Then Al-Qadr (القدر)
    items.push({ type: 'surah', surahId: 97 });
    // Add its phases only if expanded
    if (expandedSurahs.has(97)) {
      for (let i = 0; i < 1; i++) {
        items.push({ type: 'phase', surahId: 97, phaseIndex: i, number: i + 1 });
      }
    }
    
    return items.reverse(); // Reverse to show Al-Alaq at bottom
  };

  const pathItems = createCurvedPath();

  return (
    <div className="h-full bg-gradient-to-b from-blue-50 to-purple-50 p-8 overflow-y-auto">
      <div className="max-w-md mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">رحلة الحفظ</h2>
        
        {/* Curved Progress Path */}
        <div className="relative w-full min-h-[600px]">
          {/* Curved connecting path */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
            <path
              d="M 150 500 Q 100 450 150 400 Q 200 350 150 300 Q 100 250 150 200 Q 200 150 150 100 Q 100 50 150 20"
              stroke="#d1d5db"
              strokeWidth="3"
              fill="none"
              className="opacity-60"
            />
          </svg>
          
          {pathItems.map((item, index) => {
            // Calculate positions - all circles centered on path line
            const baseY = 500 - (index * 70);
            const xPosition = 150; // Center all circles on the path line
            
            if (item.type === 'phase') {
              const phaseStatus = getPhaseStatus(item.surahId, item.phaseIndex);
              
              return (
                 <div
                   key={`phase-${item.surahId}-${item.phaseIndex}`}
                   className="absolute transform -translate-x-1/2 -translate-y-1/2"
                   style={{ 
                     left: `${xPosition}px`, 
                     top: `${baseY}px`,
                     zIndex: 10
                   }}
                 >
                   <div className="flex items-center gap-2">
                     <div 
                       className={`w-12 h-12 rounded-full border-3 flex items-center justify-center transition-all shadow-lg cursor-pointer ${
                         phaseStatus === 'completed' 
                           ? 'bg-green-400 border-green-500 text-white' 
                           : phaseStatus === 'current'
                           ? 'bg-blue-500 border-blue-600 text-white'
                           : phaseStatus === 'started'
                           ? 'bg-orange-400 border-orange-500 text-white'
                           : 'bg-gray-200 border-gray-300 text-gray-600'
                       }`}
                       onClick={() => {
                         if (item.surahId === currentSurahId && onPhaseSelect) {
                           onPhaseSelect(item.phaseIndex);
                         }
                       }}
                     >
                       <span className="text-sm font-bold">{item.number}</span>
                     </div>
                     <span className="text-xs font-arabic bg-white/80 px-2 py-1 rounded shadow-sm">
                       {progressSurahs.find(s => s.id === item.surahId)?.phaseRanges[item.phaseIndex] || ''}
                     </span>
                   </div>
                 </div>
              );
            } else {
              // Surah circle
              const surah = progressSurahs.find(s => s.id === item.surahId);
               const surahStatus = getSurahStatus(item.surahId);
               // All surahs are clickable for expansion - only selection depends on status
               const canSelect = surahStatus !== 'locked';
               
               return (
                 <div
                   key={`surah-${item.surahId}`}
                   className="absolute transform -translate-x-1/2 -translate-y-1/2"
                   style={{ 
                     left: `${xPosition}px`, 
                     top: `${baseY}px`,
                     zIndex: 20
                   }}
                 >
                   <div 
                     className="relative cursor-pointer"
                     onClick={() => {
                       // Always allow expansion/collapse
                       toggleSurahExpansion(item.surahId);
                       // Only call onSurahSelect if the surah can be selected
                       if (canSelect) {
                         onSurahSelect(item.surahId);
                       }
                     }}
                   >
                    <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all shadow-xl ${
                      surahStatus === 'completed' 
                        ? 'bg-green-500 border-green-600 text-white' 
                        : surahStatus === 'current'
                        ? 'bg-blue-500 border-blue-600 text-white'
                        : 'bg-gray-300 border-gray-400 text-gray-700'
                    }`}>
                      <span className="text-xs font-bold text-center leading-tight font-arabic">
                        {surah?.arabicName}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
};