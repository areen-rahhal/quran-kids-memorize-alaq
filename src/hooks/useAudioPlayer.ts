
import { useState, useRef, useCallback } from 'react';
import { getAudioUrl, getAlternativeAudioUrl, testAudioUrl, SURAH_NUMBER } from '@/utils/audioUtils';

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioCurrentAyahIdx, setAudioCurrentAyahIdx] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = useCallback(async () => {
    if (!audioRef.current) return;
    
    try {
      setAudioError(null);
      console.log('Attempting to play audio:', audioRef.current.src);
      await audioRef.current.play();
      console.log('Audio playing successfully');
      setIsPlaying(true);
    } catch (error) {
      console.error('Audio play failed:', error);
      setAudioError('Audio playback failed. Please try again.');
      setIsPlaying(false);
    }
  }, []);

  const loadAndPlayAyah = useCallback(async (ayahIndex: number, verses: number[]) => {
    if (!audioRef.current || ayahIndex >= verses.length) return;
    
    const ayahId = verses[ayahIndex];
    const primaryUrl = getAudioUrl(SURAH_NUMBER, ayahId);
    const fallbackUrl = getAlternativeAudioUrl(SURAH_NUMBER, ayahId);
    
    console.log(`Loading ayah ${ayahId} from: ${primaryUrl}`);
    
    // Test primary URL first
    const primaryWorks = await testAudioUrl(primaryUrl);
    const urlToUse = primaryWorks ? primaryUrl : fallbackUrl;
    
    console.log(`Using audio URL: ${urlToUse}`);
    
    audioRef.current.src = urlToUse;
    audioRef.current.load();
    
    // Wait for audio to be ready
    setTimeout(() => {
      playAudio();
    }, 200);
  }, [playAudio]);

  const onAudioEnded = useCallback((verses: number[]) => {
    console.log('Audio ended, moving to next ayah');
    const nextIndex = audioCurrentAyahIdx + 1;
    
    if (nextIndex >= verses.length) {
      console.log('Phase completed');
      setIsPlaying(false);
      setAudioCurrentAyahIdx(0);
    } else {
      setAudioCurrentAyahIdx(nextIndex);
      loadAndPlayAyah(nextIndex, verses);
    }
  }, [audioCurrentAyahIdx, loadAndPlayAyah]);

  const onAudioError = useCallback(() => {
    console.error('Audio error occurred');
    setAudioError('Failed to load audio. Please check your internet connection.');
    setIsPlaying(false);
  }, []);

  const handlePlayPause = useCallback((verses: number[]) => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      setAudioCurrentAyahIdx(0);
      loadAndPlayAyah(0, verses);
    }
  }, [isPlaying, loadAndPlayAyah]);

  const resetAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setAudioCurrentAyahIdx(0);
    setAudioError(null);
  }, []);

  return {
    isPlaying,
    audioError,
    audioRef,
    handlePlayPause,
    resetAudio,
    onAudioEnded,
    onAudioError
  };
};
