
// Audio utilities for Quran recitation
export function getAudioUrl(surah: number, ayah: number): string {
  const surahStr = surah.toString().padStart(3, '0');
  const ayahStr = ayah.toString().padStart(3, '0');
  // Using more reliable QuranCDN source first
  return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${surah}/${ayah}.mp3`;
}

export function getAlternativeAudioUrl(surah: number, ayah: number): string {
  const surahStr = surah.toString().padStart(3, '0');
  const ayahStr = ayah.toString().padStart(3, '0');
  // Second backup source
  return `https://everyayah.com/data/Alafasy_128kbps/${surahStr}${ayahStr}.mp3`;
}

export function getThirdAudioUrl(surah: number, ayah: number): string {
  const surahStr = surah.toString().padStart(3, '0');
  const ayahStr = ayah.toString().padStart(3, '0');
  // Third backup
  return `https://audio.qurancdn.com/${surahStr}${ayahStr}.mp3`;
}
