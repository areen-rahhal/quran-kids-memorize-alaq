
import { useState, useRef, useCallback } from 'react';
import { getAudioUrl, getAlternativeAudioUrl, getThirdAudioUrl, testAudioUrl, SURAH_NUMBER } from '@/utils/audioUtils';

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
      
      // Add user interaction requirement handling
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        await playPromise;
        console.log('Audio playing successfully');
        setIsPlaying(true);
      }
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
    
    console.log(`Loading ayah ${ayahId}, trying ${urls.length} sources`);
    
    let workingUrl = null;
    
    // Try each URL until we find one that works
    for (const url of urls) {
      console.log(`Testing URL: ${url}`);
      const works = await testAudioUrl(url);
      if (works) {
        workingUrl = url;
        console.log(`Working URL found: ${url}`);
        break;
      }
    }
    
    if (!workingUrl) {
      console.error('No working audio URL found');
      setAudioError('Unable to load audio. Please check your internet connection.');
      setIsPlaying(false);
      return;
    }
    
    // Stop any current audio
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    
    // Set the working URL
    audioRef.current.src = workingUrl;
    audioRef.current.load();
    
    // Wait a bit then try to play
    setTimeout(() => {
      playAudio();
    }, 500);
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
