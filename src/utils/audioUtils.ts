// Audio utilities for Quran recitation with verified reliable sources
export function getAudioUrl(surah: number, ayah: number): string {
  const surahStr = surah.toString().padStart(3, '0');
  const ayahStr = ayah.toString().padStart(3, '0');
  // QuranCDN - most reliable source with proper CORS
  return `https://audio.qurancdn.com/${surahStr}${ayahStr}.mp3`;
}

export function getAlternativeAudioUrl(surah: number, ayah: number): string {
  const surahStr = surah.toString().padStart(3, '0');
  const ayahStr = ayah.toString().padStart(3, '0');
  // Verses.quran.com - official backup
  return `https://verses.quran.com/Alafasy/mp3/${surahStr}${ayahStr}.mp3`;
}

export function getThirdAudioUrl(surah: number, ayah: number): string {
  const surahStr = surah.toString().padStart(3, '0');
  const ayahStr = ayah.toString().padStart(3, '0');
  // EveryAyah - reliable third option
  return `https://everyayah.com/data/Alafasy_128kbps/${surahStr}${ayahStr}.mp3`;
}

// Test if an audio URL is accessible
export async function testAudioUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Audio URL test failed:', error);
    return false;
  }
}

// Get all audio URLs for a verse
export function getAllAudioUrls(surah: number, ayah: number): string[] {
  // Try the most reliable sources first to reduce visible errors
  return [
    getThirdAudioUrl(surah, ayah),
    getAlternativeAudioUrl(surah, ayah),
    getAudioUrl(surah, ayah)
  ];
}
