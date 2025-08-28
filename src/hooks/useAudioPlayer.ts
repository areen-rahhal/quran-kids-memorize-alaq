import { useState, useRef, useCallback, useEffect } from 'react';
import { getAudioUrl } from '@/utils/audioUtils';
import { useRecitingJourney } from './useRecitingJourney';

export const useAudioPlayer = (currentSurahId: number = 114) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAyahIdx, setCurrentAyahIdx] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [hasAttemptedPlay, setHasAttemptedPlay] = useState(false);
  const [showAudioError, setShowAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    isReciting,
    currentStep,
    currentVerseIndex,
    isListening,
    transcript,
    feedback,
    showFeedback,
    errorDetails,
    highlightedWords,
    recitingMode,
    completedLearningVerses,
    revealedTestingVerses,
    startRecitingJourney,
    stopRecitingJourney,
    handleVerseEnded,
    handleListeningComplete: handleListeningCompleteFromHook,
    updateWordHighlighting,
    handleReadyForTesting,
    handleRestartLearning
  } = useRecitingJourney();

  const loadAndPlayAyah = useCallback(async (ayahIndex: number, verses: number[]) => {
    if (!audioRef.current || ayahIndex >= verses.length) return;
    
    const ayahId = verses[ayahIndex];
    const url = getAudioUrl(currentSurahId, ayahId);
    
    console.log(`Loading ayah ${ayahId} from Surah ${currentSurahId} at index ${ayahIndex}, URL: ${url}`);
    
    try {
      setAudioError(null);
      setShowAudioError(false);
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
      setShowAudioError(true);
      setIsPlaying(false);
    }
  }, [currentSurahId]);

  const onAudioEnded = useCallback((verses: number[]) => {
    console.log('Audio ended for verse index:', currentAyahIdx);
    setIsPlaying(false);
    
    if (isReciting) {
      // Handle reciting journey flow
      console.log('Handling verse end in reciting mode');
      handleVerseEnded();
    } else {
      // Normal playback flow
      const nextIndex = currentAyahIdx + 1;
      
      if (nextIndex >= verses.length) {
        console.log('Phase completed');
        setCurrentAyahIdx(0);
      } else {
        loadAndPlayAyah(nextIndex, verses);
      }
    }
  }, [currentAyahIdx, loadAndPlayAyah, isReciting, handleVerseEnded]);

  const onAudioError = useCallback(() => {
    console.error('Audio error occurred');
    if (hasAttemptedPlay) {
      setAudioError('Failed to load audio. Please check your internet connection.');
      setShowAudioError(true);
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

  const handleStartReciting = useCallback((verses: number[]) => {
    console.log('Starting reciting journey from audio player');
    startRecitingJourney(verses, loadAndPlayAyah);
  }, [startRecitingJourney, loadAndPlayAyah]);

  const handleStopReciting = useCallback(() => {
    console.log('Stopping reciting journey from audio player');
    stopRecitingJourney();
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  }, [stopRecitingJourney]);

  const handleListeningComplete = useCallback((verses: number[], verseText: string) => {
    console.log('Handling listening complete with verses:', verses, 'and verse text:', verseText);
    handleListeningCompleteFromHook(verses, verseText, loadAndPlayAyah);
  }, [handleListeningCompleteFromHook, loadAndPlayAyah]);

  // Update word highlighting when transcript changes
  useEffect(() => {
    if (isListening && transcript) {
      // We'll pass the expected text from the component
      console.log('Updating word highlighting for transcript:', transcript);
    }
  }, [transcript, isListening, updateWordHighlighting]);

  const resetAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
    }
    setIsPlaying(false);
    setCurrentAyahIdx(0);
    setAudioError(null);
    setShowAudioError(false);
    setHasAttemptedPlay(false);
    stopRecitingJourney();
  }, [stopRecitingJourney]);

  return {
    isPlaying,
    audioError,
    showAudioError,
    audioRef,
    currentAyahIdx: isReciting ? currentVerseIndex : currentAyahIdx,
    hasAttemptedPlay,
    handlePlayPause,
    resetAudio,
    onAudioEnded,
    onAudioError,
    // Reciting journey props
    isReciting,
    currentStep,
    isListening,
    transcript,
    feedback,
    showFeedback,
    errorDetails,
    highlightedWords,
    recitingMode,
    revealedTestingVerses,
    handleStartReciting,
    handleStopReciting,
    handleListeningComplete,
    updateWordHighlighting,
    handleReadyForTesting,
    handleRestartLearning
  };
};
