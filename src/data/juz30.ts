// Juz 30 (Amma) Surahs data for the progress section
export interface Surah {
  id: number;
  name: string;
  arabicName: string;
  verses: number;
  phases: number;
}

export const juz30Surahs: Surah[] = [
  { id: 78, name: "An-Naba", arabicName: "النبأ", verses: 40, phases: Math.max(2, Math.ceil(40 / 3)) }, // 14 phases
  { id: 79, name: "An-Naziat", arabicName: "النازعات", verses: 46, phases: Math.max(2, Math.ceil(46 / 3)) }, // 16 phases
  { id: 80, name: "Abasa", arabicName: "عبس", verses: 42, phases: Math.max(2, Math.ceil(42 / 3)) }, // 14 phases
  { id: 81, name: "At-Takwir", arabicName: "التكوير", verses: 29, phases: Math.max(2, Math.ceil(29 / 3)) }, // 10 phases
  { id: 82, name: "Al-Infitar", arabicName: "الانفطار", verses: 19, phases: Math.max(2, Math.ceil(19 / 3)) }, // 7 phases
  { id: 83, name: "Al-Mutaffifin", arabicName: "المطففين", verses: 36, phases: Math.max(2, Math.ceil(36 / 3)) }, // 12 phases
  { id: 84, name: "Al-Inshiqaq", arabicName: "الانشقاق", verses: 25, phases: Math.max(2, Math.ceil(25 / 3)) }, // 9 phases
  { id: 85, name: "Al-Buruj", arabicName: "البروج", verses: 22, phases: Math.max(2, Math.ceil(22 / 3)) }, // 8 phases
  { id: 86, name: "At-Tariq", arabicName: "الطارق", verses: 17, phases: Math.max(2, Math.ceil(17 / 3)) }, // 6 phases
  { id: 87, name: "Al-Ala", arabicName: "الأعلى", verses: 19, phases: Math.max(2, Math.ceil(19 / 3)) }, // 7 phases
  { id: 88, name: "Al-Ghashiyah", arabicName: "الغاشية", verses: 26, phases: Math.max(2, Math.ceil(26 / 3)) }, // 9 phases
  { id: 89, name: "Al-Fajr", arabicName: "الفجر", verses: 30, phases: Math.max(2, Math.ceil(30 / 3)) }, // 10 phases
  { id: 90, name: "Al-Balad", arabicName: "البلد", verses: 20, phases: Math.max(2, Math.ceil(20 / 3)) }, // 7 phases
  { id: 91, name: "Ash-Shams", arabicName: "الشمس", verses: 15, phases: Math.max(2, Math.ceil(15 / 3)) }, // 5 phases
  { id: 92, name: "Al-Layl", arabicName: "الليل", verses: 21, phases: Math.max(2, Math.ceil(21 / 3)) }, // 7 phases
  { id: 93, name: "Ad-Duha", arabicName: "الضحى", verses: 11, phases: Math.max(2, Math.ceil(11 / 3)) }, // 4 phases
  { id: 94, name: "Ash-Sharh", arabicName: "الشرح", verses: 8, phases: Math.max(2, Math.ceil(8 / 3)) }, // 3 phases
  { id: 95, name: "At-Tin", arabicName: "التين", verses: 8, phases: Math.max(2, Math.ceil(8 / 3)) }, // 3 phases
  { id: 96, name: "Al-Alaq", arabicName: "العلق", verses: 19, phases: Math.max(2, Math.ceil(19 / 3)) }, // 7 phases
  { id: 97, name: "Al-Qadr", arabicName: "القدر", verses: 5, phases: Math.max(2, Math.ceil(5 / 3)) }, // 2 phases
  { id: 98, name: "Al-Bayyinah", arabicName: "البينة", verses: 8, phases: Math.max(2, Math.ceil(8 / 3)) }, // 3 phases
  { id: 99, name: "Az-Zalzalah", arabicName: "الزلزلة", verses: 8, phases: Math.max(2, Math.ceil(8 / 3)) }, // 3 phases
  { id: 100, name: "Al-Adiyat", arabicName: "العاديات", verses: 11, phases: Math.max(2, Math.ceil(11 / 3)) }, // 4 phases
  { id: 101, name: "Al-Qariah", arabicName: "القارعة", verses: 11, phases: Math.max(2, Math.ceil(11 / 3)) }, // 4 phases
  { id: 102, name: "At-Takathur", arabicName: "التكاثر", verses: 8, phases: Math.max(2, Math.ceil(8 / 3)) }, // 3 phases
  { id: 103, name: "Al-Asr", arabicName: "العصر", verses: 3, phases: Math.max(2, Math.ceil(3 / 3)) }, // 2 phases
  { id: 104, name: "Al-Humazah", arabicName: "الهمزة", verses: 9, phases: Math.max(2, Math.ceil(9 / 3)) }, // 3 phases
  { id: 105, name: "Al-Fil", arabicName: "الفيل", verses: 5, phases: Math.max(2, Math.ceil(5 / 3)) }, // 2 phases
  { id: 106, name: "Quraysh", arabicName: "قريش", verses: 4, phases: Math.max(2, Math.ceil(4 / 3)) }, // 2 phases
  { id: 107, name: "Al-Maun", arabicName: "الماعون", verses: 7, phases: Math.max(2, Math.ceil(7 / 3)) }, // 3 phases
  { id: 108, name: "Al-Kawthar", arabicName: "الكوثر", verses: 3, phases: Math.max(2, Math.ceil(3 / 3)) }, // 2 phases
  { id: 109, name: "Al-Kafirun", arabicName: "الكافرون", verses: 6, phases: Math.max(2, Math.ceil(6 / 3)) }, // 2 phases
  { id: 110, name: "An-Nasr", arabicName: "النصر", verses: 3, phases: Math.max(2, Math.ceil(3 / 3)) }, // 2 phases
  { id: 111, name: "Al-Masad", arabicName: "المسد", verses: 5, phases: Math.max(2, Math.ceil(5 / 3)) }, // 2 phases
  { id: 112, name: "Al-Ikhlas", arabicName: "الإخلاص", verses: 4, phases: Math.max(2, Math.ceil(4 / 3)) }, // 2 phases
  { id: 113, name: "Al-Falaq", arabicName: "الفلق", verses: 5, phases: Math.max(2, Math.ceil(5 / 3)) }, // 2 phases
  { id: 114, name: "An-Nas", arabicName: "الناس", verses: 6, phases: Math.max(2, Math.ceil(6 / 3)) } // 2 phases
];

// Get current surah based on the traditional surah ID
export const getCurrentSurah = (surahId: number = 96): Surah => {
  return juz30Surahs.find(s => s.id === surahId) || juz30Surahs[18]; // Default to Al-Alaq
};