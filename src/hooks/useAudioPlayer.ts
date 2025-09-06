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

  const waitForAudioToPlay = (audioEl: HTMLAudioElement, timeout = 5000) => {
    return new Promise<void>((resolve, reject) => {
      let settled = false;
      const onPlaying = () => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve();
      };
      const onError = () => {
        if (settled) return;
        settled = true;
        const err = audioEl.error;
        cleanup();
        reject(err || new Error('Unknown audio error'));
      };
      const onCanPlay = () => {
        // canplaythrough could indicate playable
        if (settled) return;
        settled = true;
        cleanup();
        resolve();
      };
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error('Audio load timeout'));
      }, timeout);

      function cleanup() {
        clearTimeout(timer);
        audioEl.removeEventListener('playing', onPlaying);
        audioEl.removeEventListener('error', onError);
        audioEl.removeEventListener('canplaythrough', onCanPlay);
      }

      audioEl.addEventListener('playing', onPlaying);
      audioEl.addEventListener('error', onError);
      audioEl.addEventListener('canplaythrough', onCanPlay);
    });
  };

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
        // Test URL accessibility first (HEAD may be blocked on some servers)
        let isAccessible = false;
        try {
          isAccessible = await testAudioUrl(url);
        } catch (err) {
          console.warn('HEAD check failed, will try to load directly:', err);
          isAccessible = true; // try anyway
        }

        if (!isAccessible) {
          console.warn(`🎵 URL ${i + 1} not accessible (HEAD failed), skipping...`);
          continue;
        }

        audioRef.current.src = url;
        audioRef.current.load();

        // Try to play and wait for playing / canplaythrough or error
        try {
          const playPromise = audioRef.current.play();
          // Some browsers return undefined for play() when autoplay blocked; still wait for events
          if (playPromise && typeof playPromise.then === 'function') {
            await playPromise;
          }
          // Wait for audio to signal it's playing or can play
          await waitForAudioToPlay(audioRef.current, 6000);

          console.log(`✅ Audio playing successfully from source ${i + 1}`);
          setIsPlaying(true);
          setIsLoading(false);
          setRetryCount(0);
          audioPlayedSuccessfully = true;
          return; // Success! Exit the function
        } catch (innerErr) {
          console.error(`❌ Audio source ${i + 1} failed during play:`, url, innerErr);
          // continue to next source
          if (i === urls.length - 1) {
            // All sources failed
            const errorMsg = retryCount > 0
              ? `All audio sources failed after ${retryCount + 1} attempts. Please check your connection.`
              : 'تعذّر تشغيل الصوت. الرجاء المحاولة مرة أخرى أو التحقق من اتصال الشبكة.';
            setAudioError(errorMsg);
            setShowAudioError(true);
            setIsPlaying(false);
            setIsLoading(false);
          }
        }

      } catch (error) {
        console.error(`❌ Audio source ${i + 1} failed:`, url, error);
        if (i === urls.length - 1) {
          const errorMsg = retryCount > 0
            ? `All audio sources failed after ${retryCount + 1} attempts. Please check your connection.`
            : 'تعذّر تشغيل الصوت. الرجاء المحاولة مرة أخرى أو التحقق من اتصال الشبكة.';
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
    // Suppress transient errors while we're still probing multiple sources in the background
    if (isLoading) {
      return;
    }

    let errorMessage = 'تعذّر توليد الصوت لهذه الآيات الآن. تأكّد من اتصال الإنترنت، عطّل مانع الإعلانات/الـVPN إن وُ��د، ثم اضغط "إعادة المحاولة" أو حدّث الصفحة.';

    if (audioRef.current?.error) {
      const mediaError = audioRef.current.error;
      console.error('Audio MediaError occurred:', {
        code: mediaError.code,
        message: mediaError.message
      });

      switch (mediaError.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          errorMessage = 'تم إيقاف تشغيل الصوت.';
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          errorMessage = 'تعذّر تحميل الصوت بسبب مشكلة في الشبكة. تحقّق من اتصالك ثم أعد المحاولة.';
          break;
        case MediaError.MEDIA_ERR_DECODE:
          errorMessage = 'تعذّر تشغيل ملف الصوت. حاول مرة أخرى لاحقًا.';
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = 'المصدر الحالي للصوت غير متاح. سنحاول مصادر أخرى تلقائيًا، وإن فشلت، أعد المحاولة لاحقًا.';
          break;
        default:
          errorMessage = `حدث خطأ في الصوت (code: ${mediaError.code}).`;
      }
    } else {
      console.error('Audio error occurred without MediaError details');
    }

    if (hasAttemptedPlay) {
      setAudioError(errorMessage);
      setShowAudioError(true);
    }
    setIsPlaying(false);
  }, [hasAttemptedPlay, isLoading]);

  const handlePlayPause = useCallback((verses: number[]) => {
    console.log('🎵 handlePlayPause called with verses:', verses);
    console.log('🎵 Current isPlaying state:', isPlaying);
    console.log('🎵 Audio ref current:', audioRef.current);
    console.log('🎵 Current surah ID:', currentSurahId);
    
    if (isPlaying) {
      console.log('🎵 Pausing audio');
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      console.log('🎵 Starting audio playback - calling loadAndPlayAyah with index 0 and verses:', verses);
      setCurrentAyahIdx(0);
      loadAndPlayAyah(0, verses);
    }
  }, [isPlaying, loadAndPlayAyah, currentSurahId]);

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
