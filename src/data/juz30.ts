// Juz 30 (Amma) Surahs data for the progress section
export interface Surah {
  id: number;
  name: string;
  arabicName: string;
  verses: number;
  phases: number;
}

export const juz30Surahs: Surah[] = [
  { id: 78, name: "An-Naba", arabicName: "النبأ", verses: 40, phases: 8 },
  { id: 79, name: "An-Naziat", arabicName: "النازعات", verses: 46, phases: 9 },
  { id: 80, name: "Abasa", arabicName: "عبس", verses: 42, phases: 8 },
  { id: 81, name: "At-Takwir", arabicName: "التكوير", verses: 29, phases: 6 },
  { id: 82, name: "Al-Infitar", arabicName: "الانفطار", verses: 19, phases: 4 },
  { id: 83, name: "Al-Mutaffifin", arabicName: "المطففين", verses: 36, phases: 7 },
  { id: 84, name: "Al-Inshiqaq", arabicName: "الانشقاق", verses: 25, phases: 5 },
  { id: 85, name: "Al-Buruj", arabicName: "البروج", verses: 22, phases: 4 },
  { id: 86, name: "At-Tariq", arabicName: "الطارق", verses: 17, phases: 3 },
  { id: 87, name: "Al-Ala", arabicName: "الأعلى", verses: 19, phases: 4 },
  { id: 88, name: "Al-Ghashiyah", arabicName: "الغاشية", verses: 26, phases: 5 },
  { id: 89, name: "Al-Fajr", arabicName: "الفجر", verses: 30, phases: 6 },
  { id: 90, name: "Al-Balad", arabicName: "البلد", verses: 20, phases: 4 },
  { id: 91, name: "Ash-Shams", arabicName: "الشمس", verses: 15, phases: 3 },
  { id: 92, name: "Al-Layl", arabicName: "الليل", verses: 21, phases: 4 },
  { id: 93, name: "Ad-Duha", arabicName: "الضحى", verses: 11, phases: 2 },
  { id: 94, name: "Ash-Sharh", arabicName: "الشرح", verses: 8, phases: 2 },
  { id: 95, name: "At-Tin", arabicName: "التين", verses: 8, phases: 2 },
  { id: 96, name: "Al-Alaq", arabicName: "العلق", verses: 19, phases: 4 },
  { id: 97, name: "Al-Qadr", arabicName: "القدر", verses: 5, phases: 1 },
  { id: 98, name: "Al-Bayyinah", arabicName: "البينة", verses: 8, phases: 2 },
  { id: 99, name: "Az-Zalzalah", arabicName: "الزلزلة", verses: 8, phases: 2 },
  { id: 100, name: "Al-Adiyat", arabicName: "العاديات", verses: 11, phases: 2 },
  { id: 101, name: "Al-Qariah", arabicName: "القارعة", verses: 11, phases: 2 },
  { id: 102, name: "At-Takathur", arabicName: "التكاثر", verses: 8, phases: 2 },
  { id: 103, name: "Al-Asr", arabicName: "العصر", verses: 3, phases: 1 },
  { id: 104, name: "Al-Humazah", arabicName: "الهمزة", verses: 9, phases: 2 },
  { id: 105, name: "Al-Fil", arabicName: "الفيل", verses: 5, phases: 1 },
  { id: 106, name: "Quraysh", arabicName: "قريش", verses: 4, phases: 1 },
  { id: 107, name: "Al-Maun", arabicName: "الماعون", verses: 7, phases: 1 },
  { id: 108, name: "Al-Kawthar", arabicName: "الكوثر", verses: 3, phases: 1 },
  { id: 109, name: "Al-Kafirun", arabicName: "الكافرون", verses: 6, phases: 1 },
  { id: 110, name: "An-Nasr", arabicName: "النصر", verses: 3, phases: 1 },
  { id: 111, name: "Al-Masad", arabicName: "المسد", verses: 5, phases: 1 },
  { id: 112, name: "Al-Ikhlas", arabicName: "الإخلاص", verses: 4, phases: 1 },
  { id: 113, name: "Al-Falaq", arabicName: "الفلق", verses: 5, phases: 1 },
  { id: 114, name: "An-Nas", arabicName: "الناس", verses: 6, phases: 1 }
];

// Get current surah based on the traditional surah ID
export const getCurrentSurah = (surahId: number = 96): Surah => {
  return juz30Surahs.find(s => s.id === surahId) || juz30Surahs[18]; // Default to Al-Alaq
};