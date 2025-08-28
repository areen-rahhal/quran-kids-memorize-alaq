
import React, { useState, useCallback } from 'react';
import { useSpeechRecognition } from './useSpeechRecognition';

export const useRecitingJourney = () => {
  const [isReciting, setIsReciting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'playing' | 'listening' | 'completed' | 'ready-check' | 'testing'>('playing');
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [highlightedWords, setHighlightedWords] = useState<string[]>([]);
  const [recitingMode, setRecitingMode] = useState<'learning' | 'testing'>('learning');
  const [completedLearningVerses, setCompletedLearningVerses] = useState<number[]>([]);
  const [revealedTestingVerses, setRevealedTestingVerses] = useState<number[]>([]);
  
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();

  // Much more comprehensive Arabic text normalization
  const normalizeArabicText = (text: string) => {
    return text
      // Remove all diacritics and special marks
      .replace(/[َُِّْ]/g, '') // Remove main diacritics
      .replace(/[ًٌٍ]/g, '') // Remove tanween
      .replace(/[ۖۗۘۙۚۛۜ]/g, '') // Remove Quranic pause marks
      .replace(/[ۣۢۤۧۨ]/g, '') // Remove other diacritics
      // Normalize different forms of Alif
      .replace(/[آأإٱ]/g, 'ا') // All forms of Alif to basic Alif
      // Normalize different forms of Ya
      .replace(/[ىئي]/g, 'ي') // All forms of Ya to basic Ya
      // Normalize Ta Marbuta
      .replace(/ة/g, 'ه') // Ta marbuta to Ha
      // Normalize Lam-Alif
      .replace(/لا/g, 'لا') // Normalize Lam-Alif ligature
      // Remove extra spaces and normalize
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  };

  // Improved Arabic similarity calculation with stricter matching
  const calculateSimilarity = (str1: string, str2: string) => {
    // Direct match gets full score
    if (str1 === str2) return 1.0;
    
    // If one string is empty, no similarity
    if (!str1 || !str2) return 0.0;
    
    // Levenshtein distance for more accurate similarity
    const getLevenshteinDistance = (a: string, b: string) => {
      const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
      
      for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
      for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
      
      for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
          const cost = a[i - 1] === b[j - 1] ? 0 : 1;
          matrix[j][i] = Math.min(
            matrix[j][i - 1] + 1,
            matrix[j - 1][i] + 1,
            matrix[j - 1][i - 1] + cost
          );
        }
      }
      
      return matrix[b.length][a.length];
    };
    
    const distance = getLevenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    const similarity = 1 - (distance / maxLength);
    
    return Math.max(0, similarity);
  };

  // Improved accuracy checking with stricter 80% threshold
  const checkRecitingAccuracy = (userText: string, expectedText: string) => {
    const normalizedUser = normalizeArabicText(userText);
    const normalizedExpected = normalizeArabicText(expectedText);
    
    console.log('=== ARABIC ACCURACY CHECK ===');
    console.log('User text:', userText);
    console.log('Expected text:', expectedText);
    console.log('Normalized user:', normalizedUser);
    console.log('Normalized expected:', normalizedExpected);
    
    // Check if user text is too short
    if (normalizedUser.length < 3) {
      setErrorDetails('🎤 التلاوة قصيرة جداً\n\nيرجى قراءة الآية كاملة بصوت واضح ومسموع');
      console.log('❌ Text too short');
      return false;
    }
    
    // Overall text similarity check with 80% threshold
    const textSimilarity = calculateSimilarity(normalizedUser, normalizedExpected);
    const accuracyPercentage = textSimilarity * 100;
    
    console.log('Overall text similarity:', accuracyPercentage.toFixed(1) + '%');
    
    if (accuracyPercentage >= 80) {
      console.log('✅ Accuracy excellent:', accuracyPercentage.toFixed(1) + '%');
      setErrorDetails('');
      return true;
    }
    
    // Word-by-word analysis for detailed feedback
    const expectedWords = normalizedExpected.split(' ').filter(word => word.length > 0);
    const userWords = normalizedUser.split(' ').filter(word => word.length > 0);
    
    let totalScore = 0;
    const matchDetails: string[] = [];
    const missingWords: string[] = [];
    
    expectedWords.forEach(expectedWord => {
      let bestMatch = 0;
      userWords.forEach(userWord => {
        const similarity = calculateSimilarity(userWord, expectedWord);
        if (similarity > bestMatch) {
          bestMatch = similarity;
        }
      });
      
      totalScore += bestMatch;
      
      if (bestMatch >= 0.7) {
        matchDetails.push(expectedWord);
      } else {
        missingWords.push(expectedWord);
      }
    });
    
    const wordAccuracy = expectedWords.length > 0 ? (totalScore / expectedWords.length) * 100 : 0;
    const finalAccuracy = Math.max(accuracyPercentage, wordAccuracy);
    
    console.log('=== ACCURACY RESULTS ===');
    console.log('Text similarity:', accuracyPercentage.toFixed(1) + '%');
    console.log('Word accuracy:', wordAccuracy.toFixed(1) + '%');
    console.log('Final accuracy:', finalAccuracy.toFixed(1) + '%');
    
    if (finalAccuracy >= 80) {
      console.log('✅ Final accuracy sufficient:', finalAccuracy.toFixed(1) + '%');
      setErrorDetails('');
      return true;
    } else {
      // Categorize mistakes for better feedback
      let errorMessage = '';
      const correctWords = matchDetails.length;
      const totalWords = expectedWords.length;
      const incorrectWords = totalWords - correctWords - missingWords.length;
      
      // Main feedback without percentages
      if (missingWords.length > 0) {
        errorMessage += `📝 كلمات مفقودة: ${missingWords.slice(0, 3).join(' • ')}\n\n`;
      }
      
      if (incorrectWords > 0) {
        errorMessage += `🔄 بعض الكلمات تحتاج تصحيح\n\n`;
      }
      
      // Encouraging message without "أحسنت" for mistakes
      errorMessage += '🎵 اقرأ ببطء أكثر وركز على كل كلمة\n\n';
      errorMessage += '🎤 حاول مرة أخرى';
      
      setErrorDetails(errorMessage);
      console.log('❌ Accuracy needs improvement:', finalAccuracy.toFixed(1) + '%');
      return false;
    }
  };

  // Enhanced real-time word highlighting based on transcript
  const updateWordHighlighting = (currentTranscript: string, expectedText: string) => {
    if (!currentTranscript) {
      setHighlightedWords([]);
      return;
    }

    const normalizedTranscript = normalizeArabicText(currentTranscript);
    const expectedWords = normalizeArabicText(expectedText).split(' ').filter(word => word.length > 0);
    const transcriptWords = normalizedTranscript.split(' ').filter(word => word.length > 0);
    
    const highlighted: string[] = [];
    
    // Enhanced matching algorithm for real-time highlighting
    expectedWords.forEach((expectedWord) => {
      const matchFound = transcriptWords.some(transcriptWord => {
        // Direct match
        if (transcriptWord === expectedWord) return true;
        
        // Partial match for longer words (minimum 3 characters)
        if (expectedWord.length >= 3 && transcriptWord.length >= 3) {
          return transcriptWord.includes(expectedWord) || expectedWord.includes(transcriptWord);
        }
        
        // Character similarity for shorter words
        if (expectedWord.length <= 3 || transcriptWord.length <= 3) {
          const similarity = calculateSimilarity(transcriptWord, expectedWord);
          return similarity >= 0.8;
        }
        
        return false;
      });
      
      if (matchFound) {
        highlighted.push(expectedWord);
      }
    });
    
    console.log('Real-time highlighting:', {
      transcript: currentTranscript,
      normalizedTranscript,
      expectedWords: expectedWords.slice(0, 5),
      highlighted: highlighted.slice(0, 5)
    });
    
    setHighlightedWords(highlighted);
  };

  const startRecitingJourney = useCallback((verses: number[], loadAndPlayAyah: (index: number, verses: number[]) => Promise<void>) => {
    console.log('🚀 Starting reciting journey with verses:', verses);
    
    // CRITICAL: Completely reset everything first
    console.log('🧹 Resetting all state before starting');
    setIsReciting(false);
    setCurrentStep('playing');
    setCurrentVerseIndex(0);
    setFeedback(null);
    setShowFeedback(false);
    setErrorDetails('');
    setHighlightedWords([]);
    resetTranscript();
    
    // Force a brief pause to ensure state is cleared
    setTimeout(() => {
      console.log('🎵 Now actually starting reciting journey');
      setIsReciting(true);
      setCurrentStep('playing');
      setCurrentVerseIndex(0);
      
      console.log('🎵 Loading and playing first ayah');
      loadAndPlayAyah(0, verses);
    }, 200);
  }, [resetTranscript]);

  const handleVerseEnded = useCallback(() => {
    console.log('🎵 handleVerseEnded called - isReciting:', isReciting, 'currentStep:', currentStep);
    console.log('🎵 Current verse index:', currentVerseIndex, 'recitingMode:', recitingMode);
    
    if (isReciting && currentStep === 'playing') {
      console.log('✅ Verse ended, starting listening phase for verse index:', currentVerseIndex);
      setCurrentStep('listening');
      setFeedback(null);
      setShowFeedback(false);
      setErrorDetails('');
      setHighlightedWords([]);
      
      setTimeout(() => {
        console.log('🎤 About to start listening...');
        startListening();
      }, 800);
    } else {
      console.log('❌ Not starting listening - isReciting:', isReciting, 'currentStep:', currentStep);
      console.log('❌ Possible reasons: isReciting is false or currentStep is not "playing"');
    }
  }, [isReciting, currentStep, currentVerseIndex, startListening, recitingMode]);

  const handleListeningComplete = useCallback((verses: number[], expectedText: string, loadAndPlayAyah: (index: number, verses: number[]) => Promise<void>) => {
    console.log('Listening complete called with transcript:', transcript);
    console.log('Expected text:', expectedText);
    console.log('Current verse index:', currentVerseIndex, 'Total verses:', verses.length);
    
    if (transcript && transcript.trim().length > 0) {
      console.log('User finished reciting, transcript:', transcript);
      stopListening();
      
      const isCorrect = checkRecitingAccuracy(transcript, expectedText);
      setFeedback(isCorrect ? 'correct' : 'incorrect');
      setShowFeedback(true);
      
      if (isCorrect) {
        console.log('✅ Reciting is correct, moving to next verse');
        console.log('🔄 Current mode:', recitingMode);
        console.log('📍 Current verse index:', currentVerseIndex);
        console.log('📝 Total verses in phase:', verses.length);
        
        resetTranscript();
        setHighlightedWords([]);
        
        // In testing mode, reveal this verse
        if (recitingMode === 'testing') {
          setRevealedTestingVerses(prev => [...prev, verses[currentVerseIndex]]);
          console.log('🧪 Testing mode: verse revealed');
        }
        
        // In learning mode, track completed verses
        if (recitingMode === 'learning') {
          setCompletedLearningVerses(prev => [...prev, verses[currentVerseIndex]]);
          console.log('📚 Learning mode: verse completed');
        }
        
        const nextIndex = currentVerseIndex + 1;
        console.log('➡️ Next index will be:', nextIndex);
        
        if (nextIndex < verses.length) {
          console.log('📖 More verses available, proceeding to next...');
          setTimeout(() => {
            console.log('🎯 Setting verse index to:', nextIndex);
            setCurrentVerseIndex(nextIndex);
            
            // In learning mode, proceed to next verse
            if (recitingMode === 'learning') {
              console.log('🎵 Learning mode: Playing next verse');
              setCurrentStep('playing');
              setFeedback(null);
              setShowFeedback(false);
              setErrorDetails('');
              
              setTimeout(() => {
                console.log('🔊 Playing next verse at index:', nextIndex);
                loadAndPlayAyah(nextIndex, verses);
              }, 500);
            } else {
              console.log('🧪 Testing mode: Starting listening for next verse');
              // In testing mode, directly start listening for next verse
              setCurrentStep('testing');
              setFeedback(null);
              setShowFeedback(false);
              setErrorDetails('');
              
              setTimeout(() => {
                console.log('🎤 Starting listening for testing mode');
                startListening();
              }, 800);
            }
          }, 3000);
        } else {
          console.log('🏁 All verses in phase completed!');
          setTimeout(() => {
            console.log('✨ Phase completion handling...');
            
            // If learning mode and all verses completed, ask if ready for testing
            if (recitingMode === 'learning') {
              console.log('📚 Learning completed, asking for testing readiness');
              setCurrentStep('ready-check');
            } else {
              console.log('🧪 Testing completed');
              // Testing mode completed
              setCurrentStep('completed');
              setIsReciting(false);
              setCurrentVerseIndex(0);
            }
            
            setFeedback(null);
            setShowFeedback(false);
            setErrorDetails('');
            setHighlightedWords([]);
          }, 3000);
        }
      } else {
        console.log('Reciting needs improvement, asking to repeat');
        setTimeout(() => {
          setFeedback(null);
          setShowFeedback(false);
          resetTranscript();
          setHighlightedWords([]);
          
          if (recitingMode === 'learning') {
            setCurrentStep('listening');
          } else {
            setCurrentStep('testing');
          }
          
          setTimeout(() => {
            startListening();
          }, 800);
        }, 5000); // Show error for 5 seconds before retry
      }
    }
  }, [transcript, currentVerseIndex, stopListening, resetTranscript, startListening, recitingMode]);

  const stopRecitingJourney = useCallback(() => {
    console.log('🛑 Stopping reciting journey and clearing ALL state');
    setIsReciting(false);
    setCurrentStep('playing');
    setCurrentVerseIndex(0);
    setFeedback(null);
    setShowFeedback(false);
    setErrorDetails('');
    setHighlightedWords([]);
    setRecitingMode('learning');
    setCompletedLearningVerses([]);
    setRevealedTestingVerses([]);
    stopListening();
    
    // CRITICAL: Force reset transcript
    console.log('🧹 Force resetting transcript');
    resetTranscript();
    
    // Double-check transcript is cleared
    setTimeout(() => {
      resetTranscript();
      console.log('🧹 Double-reset transcript completed');
    }, 100);
  }, [stopListening, resetTranscript]);

  const handleReadyForTesting = useCallback(() => {
    console.log('User ready for testing mode');
    setIsReciting(true); // Ensure reciting state is active
    setRecitingMode('testing');
    setCurrentStep('testing');
    setCurrentVerseIndex(0);
    setRevealedTestingVerses([]);
    setFeedback(null);
    setShowFeedback(false);
    setErrorDetails('');
    setHighlightedWords([]);
    resetTranscript();
    
    // Start listening immediately
    setTimeout(() => {
      startListening();
    }, 800);
  }, [resetTranscript, startListening]);

  const handleRestartLearning = useCallback(() => {
    console.log('Restarting learning mode');
    setRecitingMode('learning');
    setCurrentStep('playing');
    setCurrentVerseIndex(0);
    setCompletedLearningVerses([]);
    setRevealedTestingVerses([]);
    setFeedback(null);
    setShowFeedback(false);
    setErrorDetails('');
    setHighlightedWords([]);
    resetTranscript();
  }, [resetTranscript]);

  // CRITICAL: Enhanced effect for monitoring transcript changes
  React.useEffect(() => {
    console.log('🔄 EFFECT TRIGGERED - isReciting:', isReciting, 'isListening:', isListening, 'transcript:', transcript);
    console.log('🔄 Current step:', currentStep, 'recitingMode:', recitingMode);
    
    if (!isReciting) {
      console.log('⚠️ Ignoring effect because not in reciting mode');
      return;
    }
    
    if (isListening && transcript && transcript.trim().length > 0) {
      console.log('🎙️ TRANSCRIPT RECEIVED IN EFFECT:', transcript);
      console.log('🎙️ Transcript length:', transcript.length);
      console.log('🎙️ Current listening state:', isListening);
      // This would need the expected text, but we'll handle it in the component
    }
  }, [transcript, isListening, isReciting, currentStep, recitingMode]);

  return {
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
    handleListeningComplete,
    updateWordHighlighting,
    handleReadyForTesting,
    handleRestartLearning
  };
};
