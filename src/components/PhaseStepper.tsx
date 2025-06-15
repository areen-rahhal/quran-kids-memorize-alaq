
import React from "react";
import { Star } from "lucide-react";

interface Phase {
  label: string;
  verses: number[];
}

interface PhaseStepperProps {
  phases: Phase[];
  currentPhaseIdx: number;
  completedVerses: number[];
  onPhaseClick: (idx: number) => void;
}

const colors = [
  "from-yellow-300 to-amber-200 border-yellow-400 text-yellow-700",
  "from-pink-200 to-rose-200 border-pink-300 text-rose-600",
  "from-emerald-200 to-green-100 border-emerald-300 text-emerald-600",
  "from-sky-200 to-blue-100 border-sky-300 text-sky-600",
  "from-purple-200 to-indigo-100 border-purple-300 text-purple-600",
];

export function PhaseStepper({
  phases,
  currentPhaseIdx,
  completedVerses,
  onPhaseClick,
}: PhaseStepperProps) {
  return (
    <div className="flex items-end justify-center gap-1 md:gap-3 mt-6 select-none">
      {phases.map((ph, idx) => {
        const isCurrent = idx === currentPhaseIdx;
        const isComplete = ph.verses.every(id => completedVerses.includes(id));
        // playful color cycle
        const colorIdx = idx % colors.length;
        return (
          <button
            key={ph.label}
            onClick={() => onPhaseClick(idx)}
            className={`
              flex flex-col items-center group transition-all duration-300 focus:outline-none
              ${isCurrent ? "scale-110 z-30" : isComplete ? "scale-100" : "scale-95"}
            `}
            tabIndex={0}
            aria-label={ph.label}
            type="button"
          >
            <span
              className={`
                flex items-center justify-center rounded-full shadow-lg border-4 ring-8 ring-white/60
                w-14 h-14 text-2xl font-bold mb-0 font-arabic bg-gradient-to-br
                ${colors[colorIdx]}
                ${isCurrent ? "ring-emerald-300 border-emerald-400 animate-bounce" : ""}
                ${isComplete && !isCurrent ? "opacity-85 bg-gradient-to-br from-amber-200 to-amber-400 border-amber-300 text-amber-600" : ""}
              `}
              style={{
                boxShadow: isCurrent
                  ? "0 3px 20px 4px #43e9a066,0 2px 4px #bbfacc"
                  : isComplete
                  ? "0 2px 10px #fdba747c"
                  : "0 2px 10px #e2e8f0",
                outline: isCurrent ? "3px solid #05966977" : "none",
              }}
            >
              {isComplete && !isCurrent ? (
                <Star className="h-8 w-8 text-amber-400 drop-shadow" />
              ) : (
                idx + 1
              )}
            </span>
            <span
              className={`font-arabic text-xs font-bold mt-1 tracking-tight ${isCurrent ? "text-emerald-700" : isComplete ? "text-amber-500" : "text-gray-400"}`}
              style={{ letterSpacing: "-1px" }}
            >
              {ph.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
