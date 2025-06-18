
import { useState, useRef, useCallback } from 'react';
import { getAudioUrl, getAlternativeAudioUrl, getThirdAudioUrl, SURAH_NUMBER } from '@/utils/audioUtils';

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
    const urls = [
      getAudioUrl(SURAH_NUMBER, ayahId),
      getAlternativeAudioUrl(SURAH_NUMBER, ayahId),
      getThirdAudioUrl(SURAH_NUMBER, ayahId)
    ];
    
    console.log(`Loading ayah ${ayahId}, trying sources`);
    
    // Try each URL until one works
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`Trying URL ${i + 1}: ${url}`);
      
      try {
        // Stop any current audio
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        
        // Set new source
        audioRef.current.src = url;
        
        // Wait for audio to load and then play
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Timeout'));
          }, 5000);
          
          audioRef.current!.oncanplaythrough = () => {
            clearTimeout(timeout);
            resolve(true);
          };
          audioRef.current!.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('Load failed'));
          };
          
          audioRef.current!.load();
        });
        
        // If we get here, the audio loaded successfully
        console.log(`Successfully loaded: ${url}`);
        await playAudio();
        return;
        
      } catch (error) {
        console.log(`Failed to load URL ${i + 1}:`, error);
        continue;
      }
    }
    
    // If we get here, all URLs failed
    console.error('All audio sources failed');
    setAudioError('Unable to load audio. Please check your internet connection.');
    setIsPlaying(false);
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
      audioRef.current.src = '';
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
