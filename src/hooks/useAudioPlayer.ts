
import { useState, useRef, useCallback } from 'react';
import { getAudioUrl, SURAH_NUMBER } from '@/utils/audioUtils';

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAyahIdx, setCurrentAyahIdx] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [hasAttemptedPlay, setHasAttemptedPlay] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const loadAndPlayAyah = useCallback(async (ayahIndex: number, verses: number[]) => {
    if (!audioRef.current || ayahIndex >= verses.length) return;
    
    const ayahId = verses[ayahIndex];
    const url = getAudioUrl(SURAH_NUMBER, ayahId);
    
    console.log(`Loading ayah ${ayahId}, URL: ${url}`);
    
    try {
      setAudioError(null);
      setHasAttemptedPlay(true);
      setCurrentAyahIdx(ayahIndex);
      
      // Stop any current audio
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = url;
      
      // Load and play
      audioRef.current.load();
      await audioRef.current.play();
      console.log('Audio playing successfully');
      setIsPlaying(true);
      
    } catch (error) {
      console.error('Audio play failed:', error);
      setAudioError('Failed to load audio. Please check your internet connection.');
      setIsPlaying(false);
    }
  }, []);

  const onAudioEnded = useCallback((verses: number[]) => {
    console.log('Audio ended, moving to next ayah');
    const nextIndex = currentAyahIdx + 1;
    
    if (nextIndex >= verses.length) {
      console.log('Phase completed');
      setIsPlaying(false);
      setCurrentAyahIdx(0);
    } else {
      loadAndPlayAyah(nextIndex, verses);
    }
  }, [currentAyahIdx, loadAndPlayAyah]);

  const onAudioError = useCallback(() => {
    console.error('Audio error occurred');
    if (hasAttemptedPlay) {
      setAudioError('Failed to load audio. Please check your internet connection.');
    }
    setIsPlaying(false);
  }, [hasAttemptedPlay]);

  const handlePlayPause = useCallback((verses: number[]) => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      setCurrentAyahIdx(0);
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
    setCurrentAyahIdx(0);
    setAudioError(null);
    setHasAttemptedPlay(false);
  }, []);

  return {
    isPlaying,
    audioError,
    audioRef,
    currentAyahIdx,
    hasAttemptedPlay,
    handlePlayPause,
    resetAudio,
    onAudioEnded,
    onAudioError
  };
};
