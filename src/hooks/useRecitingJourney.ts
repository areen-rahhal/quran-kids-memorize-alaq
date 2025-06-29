import { useState, useCallback } from 'react';
import { useSpeechRecognition } from './useSpeechRecognition';

export const useRecitingJourney = () => {
  const [isReciting, setIsReciting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'playing' | 'listening' | 'completed'>('playing');
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>('');
  
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();

  // Function to normalize Arabic text for comparison
  const normalizeArabicText = (text: string) => {
    return text
      .replace(/[َُِّْ]/g, '') // Remove diacritics
      .replace(/[ًٌٍ]/g, '') // Remove tanween
      .replace(/آ/g, 'ا') // Normalize alif
      .replace(/إ/g, 'ا') // Normalize alif
      .replace(/أ/g, 'ا') // Normalize alif
      .replace(/ى/g, 'ي') // Normalize ya
      .replace(/ة/g, 'ه') // Normalize ta marbuta
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim()
      .toLowerCase();
  };

  // Enhanced function to check reciting accuracy with better feedback
  const checkRecitingAccuracy = (userText: string, expectedText: string) => {
    const normalizedUser = normalizeArabicText(userText);
    const normalizedExpected = normalizeArabicText(expectedText);
    
    console.log('Detailed comparison:', { 
      originalUser: userText,
      originalExpected: expectedText,
      normalizedUser, 
      normalizedExpected 
    });
    
    // Check if user text is too short
    if (normalizedUser.length < 5) {
      setErrorDetails('التلاوة قصيرة جداً - يرجى قراءة الآية كاملة بوضوح');
      return false;
    }
    
    // Check for exact match first (most lenient)
    if (normalizedUser === normalizedExpected) {
      console.log('✅ Exact match found');
      setErrorDetails('');
      return true;
    }
    
    // Check if user text contains substantial part of expected text
    if (normalizedUser.includes(normalizedExpected) || normalizedExpected.includes(normalizedUser)) {
      console.log('✅ Substantial match found');
      setErrorDetails('');
      return true;
    }
    
    // Word-by-word comparison with more flexibility
    const expectedWords = normalizedExpected.split(' ').filter(word => word.length > 1);
    const userWords = normalizedUser.split(' ');
    
    let matchedWords = 0;
    const missingWords: string[] = [];
    const foundWords: string[] = [];
    
    expectedWords.forEach(expectedWord => {
      let isMatched = false;
      
      // Check for exact word match
      if (userWords.includes(expectedWord)) {
        isMatched = true;
      } else {
        // Check for partial matches (word contains or is contained)
        const partialMatch = userWords.some(userWord => {
          return userWord.length > 2 && (
            userWord.includes(expectedWord) || 
            expectedWord.includes(userWord) ||
            // Check for similarity (allowing for 1-2 character differences)
            Math.abs(userWord.length - expectedWord.length) <= 2 &&
            (userWord.startsWith(expectedWord.substring(0, 3)) || 
             expectedWord.startsWith(userWord.substring(0, 3)))
          );
        });
        
        if (partialMatch) {
          isMatched = true;
        }
      }
      
      if (isMatched) {
        matchedWords++;
        foundWords.push(expectedWord);
      } else {
        missingWords.push(expectedWord);
      }
    });
    
    const accuracy = expectedWords.length > 0 ? matchedWords / expectedWords.length : 0;
    console.log('Word matching results:', { 
      accuracy, 
      matchedWords, 
      totalWords: expectedWords.length,
      foundWords,
      missingWords 
    });
    
    // More lenient threshold (50% instead of 60%)
    if (accuracy >= 0.5) {
      console.log('✅ Sufficient accuracy achieved:', accuracy);
      setErrorDetails('');
      return true;
    } else {
      // Provide specific feedback about what's missing
      if (missingWords.length > 0 && foundWords.length > 0) {
        setErrorDetails(`تم نطق بعض الكلمات بشكل صحيح، لكن هناك كلمات مفقودة أو غير واضحة: ${missingWords.slice(0, 5).join(' • ')}`);
      } else if (missingWords.length > 0) {
        setErrorDetails(`كلمات مفقودة أو غير واضحة: ${missingWords.slice(0, 5).join(' • ')}`);
      } else {
        setErrorDetails('التلاوة غير مطابقة للنص المطلوب - يرجى التأكد من النطق الواضح');
      }
      return false;
    }
  };

  const startRecitingJourney = useCallback((verses: number[], loadAndPlayAyah: (index: number, verses: number[]) => Promise<void>) => {
    console.log('Starting reciting journey with verses:', verses);
    setIsReciting(true);
    setCurrentStep('playing');
    setCurrentVerseIndex(0);
    setFeedback(null);
    setShowFeedback(false);
    setErrorDetails('');
    resetTranscript();
    
    // Start playing the first verse
    loadAndPlayAyah(0, verses);
  }, [resetTranscript]);

  const handleVerseEnded = useCallback(() => {
    if (isReciting && currentStep === 'playing') {
      console.log('Verse ended, starting listening phase for verse index:', currentVerseIndex);
      setCurrentStep('listening');
      setFeedback(null);
      setShowFeedback(false);
      setErrorDetails('');
      
      // Start listening after a short delay
      setTimeout(() => {
        startListening();
      }, 800);
    }
  }, [isReciting, currentStep, currentVerseIndex, startListening]);

  const handleListeningComplete = useCallback((verses: number[], expectedText: string, loadAndPlayAyah: (index: number, verses: number[]) => Promise<void>) => {
    console.log('Listening complete called with transcript:', transcript);
    console.log('Expected text:', expectedText);
    console.log('Current verse index:', currentVerseIndex, 'Total verses:', verses.length);
    
    if (transcript && transcript.trim().length > 0) {
      console.log('User finished reciting, transcript:', transcript);
      stopListening();
      
      // Check if reciting is correct
      const isCorrect = checkRecitingAccuracy(transcript, expectedText);
      setFeedback(isCorrect ? 'correct' : 'incorrect');
      setShowFeedback(true);
      
      if (isCorrect) {
        console.log('Reciting is correct, moving to next verse');
        resetTranscript();
        
        const nextIndex = currentVerseIndex + 1;
        console.log('Next index will be:', nextIndex);
        
        if (nextIndex < verses.length) {
          // Wait for feedback display, then move to next verse
          setTimeout(() => {
            setCurrentVerseIndex(nextIndex);
            setCurrentStep('playing');
            setFeedback(null);
            setShowFeedback(false);
            setErrorDetails('');
            
            setTimeout(() => {
              console.log('Playing next verse at index:', nextIndex);
              loadAndPlayAyah(nextIndex, verses);
            }, 500);
          }, 3000); // Show success message for 3 seconds
        } else {
          // All verses completed
          setTimeout(() => {
            console.log('All verses completed!');
            setCurrentStep('completed');
            setIsReciting(false);
            setCurrentVerseIndex(0);
            setFeedback(null);
            setShowFeedback(false);
            setErrorDetails('');
          }, 3000);
        }
      } else {
        console.log('Reciting is incorrect, asking to repeat');
        // Wait longer for feedback display, then ask to repeat
        setTimeout(() => {
          setFeedback(null);
          setShowFeedback(false);
          resetTranscript();
          setCurrentStep('listening');
          setTimeout(() => {
            startListening();
          }, 800);
        }, 6000); // Increased to 6 seconds for better error reading
      }
    }
  }, [transcript, currentVerseIndex, stopListening, resetTranscript, startListening]);

  const stopRecitingJourney = useCallback(() => {
    console.log('Stopping reciting journey');
    setIsReciting(false);
    setCurrentStep('playing');
    setCurrentVerseIndex(0);
    setFeedback(null);
    setShowFeedback(false);
    setErrorDetails('');
    stopListening();
    resetTranscript();
  }, [stopListening, resetTranscript]);

  return {
    isReciting,
    currentStep,
    currentVerseIndex,
    isListening,
    transcript,
    feedback,
    showFeedback,
    errorDetails,
    startRecitingJourney,
    stopRecitingJourney,
    handleVerseEnded,
    handleListeningComplete
  };
};
