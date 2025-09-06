import { useState, useRef, useCallback, useEffect } from 'react';
import { getAllAudioUrls, testAudioUrl } from '@/utils/audioUtils';
import { useRecitingJourney } from './useRecitingJourney';

export const useAudioPlayer = (currentSurahId: number = 114) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAyahIdx, setCurrentAyahIdx] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [hasAttemptedPlay, setHasAttemptedPlay] = useState(false);
  const [showAudioError, setShowAudioError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
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
    const urls = getAllAudioUrls(currentSurahId, ayahId);
    
    console.log(`🎵 Loading ayah ${ayahId} from Surah ${currentSurahId} at index ${ayahIndex}`);
    
    setAudioError(null);
    setShowAudioError(false);
    setHasAttemptedPlay(true);
    setCurrentAyahIdx(ayahIndex);
    setIsLoading(true);
    
    // Stop any current audio
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current.src = '';
    
    let audioPlayedSuccessfully = false;
    
    // Try each URL until one works
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`🎵 Trying audio source ${i + 1}/${urls.length}: ${url}`);
      
      try {
        // Test URL accessibility first
        const isAccessible = await testAudioUrl(url);
        if (!isAccessible) {
          console.warn(`🎵 URL ${i + 1} not accessible, skipping...`);
          continue;
        }
        
        audioRef.current.src = url;
        audioRef.current.load();
        
        // Add a small delay to let the audio load
        await new Promise(resolve => setTimeout(resolve, 100));
        
        await audioRef.current.play();
        console.log(`✅ Audio playing successfully from source ${i + 1}`);
        setIsPlaying(true);
        setIsLoading(false);
        setRetryCount(0);
        audioPlayedSuccessfully = true;
        return; // Success! Exit the function
        
      } catch (error) {
        console.error(`❌ Audio source ${i + 1} failed:`, error);
        if (i === urls.length - 1) {
          // All sources failed
          const errorMsg = retryCount > 0 
            ? `All audio sources failed after ${retryCount + 1} attempts. Please check your connection.`
            : 'Failed to load audio from all sources. Click retry to try again.';
          setAudioError(errorMsg);
          setShowAudioError(true);
          setIsPlaying(false);
          setIsLoading(false);
        }
      }
    }
    
    // If no audio played successfully, ensure src is cleared
    if (!audioPlayedSuccessfully && audioRef.current) {
      audioRef.current.src = '';
    }
  }, [currentSurahId, retryCount]);

  const onAudioEnded = useCallback((verses: number[]) => {
    console.log('🎵 AUDIO ENDED EVENT TRIGGERED');
    console.log('🎵 Current verse index:', currentAyahIdx);
    console.log('🎵 Is reciting mode:', isReciting);
    console.log('🎵 Current step:', currentStep);
    console.log('🎵 Verses array:', verses);
    setIsPlaying(false);
    
    if (isReciting) {
      // Handle reciting journey flow
      console.log('🎵 IN RECITING MODE - calling handleVerseEnded');
      console.log('🎵 About to trigger listening phase...');
      handleVerseEnded();
    } else {
      console.log('🎵 NOT in reciting mode - normal playback');
      // Normal playback flow
      const nextIndex = currentAyahIdx + 1;
      
      if (nextIndex >= verses.length) {
        console.log('🏁 Phase completed');
        setCurrentAyahIdx(0);
      } else {
        console.log('▶️ Loading next ayah:', nextIndex);
        loadAndPlayAyah(nextIndex, verses);
      }
    }
  }, [currentAyahIdx, loadAndPlayAyah, isReciting, handleVerseEnded, currentStep]);

  const onAudioError = useCallback(() => {
    let errorMessage = 'Failed to load audio. Please check your internet connection.';
    
    if (audioRef.current?.error) {
      const mediaError = audioRef.current.error;
      console.error('Audio MediaError occurred:', {
        code: mediaError.code,
        message: mediaError.message
      });
      
      switch (mediaError.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          errorMessage = 'Audio playback was aborted.';
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          errorMessage = 'Network error occurred while loading audio.';
          break;
        case MediaError.MEDIA_ERR_DECODE:
          errorMessage = 'Audio file is corrupted or in an unsupported format.';
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = 'Audio format is not supported by your browser.';
          break;
        default:
          errorMessage = `Audio error occurred (code: ${mediaError.code}).`;
      }
    } else {
      console.error('Audio error occurred without MediaError details');
    }
    
    if (hasAttemptedPlay) {
      setAudioError(errorMessage);
      setShowAudioError(true);
    }
    setIsPlaying(false);
  }, [hasAttemptedPlay]);

  const handlePlayPause = useCallback((verses: number[]) => {
    console.log('🎵 handlePlayPause called with verses:', verses);
    console.log('🎵 Current isPlaying state:', isPlaying);
    
    if (isPlaying) {
      console.log('🎵 Pausing audio');
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      console.log('🎵 Starting audio playback');
      setCurrentAyahIdx(0);
      loadAndPlayAyah(0, verses);
    }
  }, [isPlaying, loadAndPlayAyah]);

  const handleStartReciting = useCallback((verses: number[], mode: 'learning' | 'testing' = 'learning', onTestComplete?: () => void) => {
    console.log('Starting reciting journey from audio player, mode:', mode);
    startRecitingJourney(verses, loadAndPlayAyah, mode, onTestComplete);
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
    setRetryCount(0);
    setIsLoading(false);
    // Only stop reciting journey if we're not currently reciting
    if (!isReciting) {
      stopRecitingJourney();
    }
  }, [stopRecitingJourney, isReciting]);

  const retryAudio = useCallback((verses: number[]) => {
    setRetryCount(prev => prev + 1);
    loadAndPlayAyah(currentAyahIdx, verses);
  }, [loadAndPlayAyah, currentAyahIdx]);

  return {
    isPlaying,
    audioError,
    showAudioError,
    audioRef,
    currentAyahIdx: isReciting ? currentVerseIndex : currentAyahIdx,
    hasAttemptedPlay,
    isLoading,
    retryCount,
    handlePlayPause,
    resetAudio,
    retryAudio,
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
