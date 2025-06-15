
import React from "react";

interface Verse {
  id: number;
  arabic: string;
}

interface ContinuousArabicProps {
  verses: Verse[];
}

/**
 * Displays the phase's verses as a single Arabic flow,
 * separating each by a stylized verse stop ۝ that clearly shows the verse number.
 */
export function ContinuousArabic({ verses }: ContinuousArabicProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-x-2 gap-y-4 justify-center mt-4 font-arabic text-xl md:text-2xl tracking-wide w-full animate-fade-in"
      dir="rtl"
    >
      {verses.map((v, idx) => (
        <React.Fragment key={v.id}>
          <span
            className="relative px-2 py-2 rounded-2xl bg-gradient-to-br from-emerald-50 to-yellow-50 shadow border-2 border-emerald-100 font-bold text-emerald-900"
            style={{
              letterSpacing: "0.08em",
              fontWeight: 700,
              fontSize: "1.07em",
              minWidth: 40,
              display: "inline-block",
              borderBottomRightRadius: 48,
              borderBottomLeftRadius: 28,
            }}
          >
            {v.arabic}
            <span
              className="ml-2 inline-flex items-center justify-center rounded-full bg-white border-2 border-emerald-200 shadow-lg text-amber-600 font-extrabold px-2 py-0.5 scale-110 font-arabic"
              style={{
                fontFamily: "Amiri, serif",
                fontSize: "1.13em",
                minWidth: 36,
                minHeight: 30,
                boxShadow: "0 2px 9px #fde68acc",
                marginLeft: 9,
              }}
              aria-label={`آية رقم ${v.id}`}
            >
              <span className="text-emerald-300 font-extrabold text-2xl mr-0.5 mb-0.5" style={{ opacity: 0.3 }}>
                ۝
              </span>
              <span className="relative z-10 text-amber-700 font-bold text-base md:text-lg" style={{ paddingRight: 2 }}>
                {v.id}
              </span>
            </span>
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}
