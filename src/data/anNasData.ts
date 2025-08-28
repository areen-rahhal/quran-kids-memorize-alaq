// Study plan configuration for Surah An-Nas (114)
export const AnNasVerses = [
  { id: 1, arabic: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ" },
  { id: 2, arabic: "مَلِكِ ٱلنَّاسِ" },
  { id: 3, arabic: "إِلَـٰهِ ٱلنَّاسِ" },
  { id: 4, arabic: "مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ" },
  { id: 5, arabic: "ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ" },
  { id: 6, arabic: "مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ" }
];

export const anNasStudyPhases = [
  { label: "المرحلة ١", description: "الآيات ١–٣", verses: [1, 2, 3] },
  { label: "المرحلة ٢", description: "الآيات ٤–٦", verses: [4, 5, 6] },
];

export const getAnNasPhaseData = (phaseIdx: number) => anNasStudyPhases[phaseIdx] || anNasStudyPhases[0];