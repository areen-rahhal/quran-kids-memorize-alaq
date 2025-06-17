
// Audio utilities for Quran recitation
const SURAH_NUMBER = 96;

export function getAudioUrl(surah: number, ayah: number): string {
  const surahStr = surah.toString().padStart(3, '0');
  const ayahStr = ayah.toString().padStart(3, '0');
  return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${surahStr}${ayahStr}.mp3`;
}

export function getAlternativeAudioUrl(surah: number, ayah: number): string {
  // Alternative source as fallback
  const surahStr = surah.toString().padStart(3, '0');
  const ayahStr = ayah.toString().padStart(3, '0');
  return `https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/${surahStr}${ayahStr}.mp3`;
}

export function getThirdAudioUrl(surah: number, ayah: number): string {
  // Third fallback source
  const surahStr = surah.toString().padStart(3, '0');
  const ayahStr = ayah.toString().padStart(3, '0');
  return `https://server8.mp3quran.net/afs/${surahStr}${ayahStr}.mp3`;
}

export async function testAudioUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const timeout = setTimeout(() => {
      audio.src = '';
      resolve(false);
    }, 3000); // 3 second timeout
    
    audio.oncanplaythrough = () => {
      clearTimeout(timeout);
      resolve(true);
    };
    audio.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };
    audio.onabort = () => {
      clearTimeout(timeout);
      resolve(false);
    };
    
    audio.src = url;
    audio.load();
  });
}

export { SURAH_NUMBER };
