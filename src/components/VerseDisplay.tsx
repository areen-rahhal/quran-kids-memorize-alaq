
interface VerseDisplayProps {
  phaseVerseObjs: Array<{id: number, arabic: string}>;
  currentPhaseIdx: number;
  totalPhases: number;
}

export const VerseDisplay = ({ phaseVerseObjs, currentPhaseIdx, totalPhases }: VerseDisplayProps) => {
  const continuousArabic = (
    <span className="flex flex-wrap gap-x-1 gap-y-2 justify-center items-baseline font-arabic text-gray-900 bg-white rounded-xl text-[0.91rem] md:text-base leading-relaxed" dir="rtl">
      {phaseVerseObjs.map((v) => (
        <span key={v.id} className="inline-flex items-baseline" dir="rtl">
          <span
            className="font-arabic px-0.5"
            style={{
              fontWeight: 700,
              letterSpacing: '0.06em',
              wordSpacing: '0.21em',
            }}
          >
            {v.arabic}
          </span>
          <span
            className="inline-flex items-center justify-center bg-white border border-amber-300 px-1 text-emerald-500 mx-1 text-lg font-extrabold rounded-full shadow-sm relative -top-0.5"
            style={{
              minWidth: 30,
              minHeight: 30,
              fontFamily: 'Amiri, serif',
              fontSize: '1.23em',
              marginRight: '0.30em',
              marginLeft: '0.10em'
            }}
            aria-label={`تمت آية رقم ${v.id}`}
          >
            <span
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
              style={{ fontSize: '1.48em', color: '#34d399', opacity: 0.22 }}
            >۝</span>
            <span className="relative z-10 text-amber-600 font-bold text-xs md:text-base" style={{fontFamily:'Amiri,serif'}}>
              {v.id}
            </span>
          </span>
        </span>
      ))}
      {currentPhaseIdx === totalPhases - 1 && (
        <span className="mx-1 text-emerald-700 text-lg" style={{ fontWeight: 900 }}>۩</span>
      )}
    </span>
  );

  return (
    <div className="w-full items-center justify-center text-center overflow-x-auto">
      {continuousArabic}
    </div>
  );
};
