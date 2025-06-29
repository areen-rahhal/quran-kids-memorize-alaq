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

  // Enhanced function to normalize Arabic text for comparison
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

  // More lenient accuracy checking with detailed feedback
  const checkRecitingAccuracy = (userText: string, expectedText: string) => {
    const normalizedUser = normalizeArabicText(userText);
    const normalizedExpected = normalizeArabicText(expectedText);
    
    console.log('=== ACCURACY CHECK ===');
    console.log('User text:', userText);
    console.log('Expected text:', expectedText);
    console.log('Normalized user:', normalizedUser);
    console.log('Normalized expected:', normalizedExpected);
    
    // Check if user text is too short
    if (normalizedUser.length < 3) {
      setErrorDetails('التلاوة قصيرة جداً - يرجى قراءة الآية كاملة بوضوح (دقة: 0%)');
      console.log('❌ Text too short');
      return false;
    }
    
    // Check for exact match first
    if (normalizedUser === normalizedExpected) {
      console.log('✅ Exact match found (100%)');
      setErrorDetails('');
      return true;
    }
    
    // Check if one contains the other (very lenient)
    if (normalizedUser.includes(normalizedExpected) || normalizedExpected.includes(normalizedUser)) {
      console.log('✅ Containment match found (95%)');
      setErrorDetails('');
      return true;
    }
    
    // Word-by-word comparison with enhanced flexibility
    const expectedWords = normalizedExpected.split(' ').filter(word => word.length > 1);
    const userWords = normalizedUser.split(' ').filter(word => word.length > 1);
    
    console.log('Expected words:', expectedWords);
    console.log('User words:', userWords);
    
    let matchedWords = 0;
    const matchedWordsList: string[] = [];
    const missingWords: string[] = [];
    
    expectedWords.forEach(expectedWord => {
      let isMatched = false;
      
      // Check for exact word match
      if (userWords.includes(expectedWord)) {
        isMatched = true;
        matchedWordsList.push(expectedWord);
      } else {
        // Check for partial matches with very lenient criteria
        const partialMatch = userWords.some(userWord => {
          // More lenient matching criteria
          if (userWord.length >= 2 && expectedWord.length >= 2) {
            // Check if words share significant portion
            const similarity = Math.max(
              userWord.includes(expectedWord) ? expectedWord.length / userWord.length : 0,
              expectedWord.includes(userWord) ? userWord.length / expectedWord.length : 0,
              // Check if they start with same letters
              userWord.substring(0, Math.min(3, userWord.length)) === expectedWord.substring(0, Math.min(3, expectedWord.length)) ? 0.7 : 0
            );
            
            return similarity >= 0.5; // Very lenient threshold
          }
          return false;
        });
        
        if (partialMatch) {
          isMatched = true;
          matchedWordsList.push(`${expectedWord} (متشابه)`);
        }
      }
      
      if (isMatched) {
        matchedWords++;
      } else {
        missingWords.push(expectedWord);
      }
    });
    
    const accuracy = expectedWords.length > 0 ? (matchedWords / expectedWords.length) * 100 : 0;
    
    console.log('=== DETAILED RESULTS ===');
    console.log('Matched words:', matchedWords, '/', expectedWords.length);
    console.log('Accuracy percentage:', accuracy.toFixed(1) + '%');
    console.log('Matched words list:', matchedWordsList);
    console.log('Missing words:', missingWords);
    
    // Lowered threshold to 80% as requested
    if (accuracy >= 80) {
      console.log('✅ Accuracy sufficient:', accuracy.toFixed(1) + '%');
      setErrorDetails('');
      return true;
    } else {
      // Provide detailed feedback with accuracy percentage
      let errorMessage = `دقة التلاوة: ${accuracy.toFixed(1)}% (مطلوب 80% أو أكثر)\n\n`;
      
      if (matchedWords > 0) {
        errorMessage += `✅ كلمات صحيحة: ${matchedWordsList.join(' • ')}\n\n`;
      }
      
      if (missingWords.length > 0) {
        errorMessage += `❌ كلمات مفقودة أو غير واضحة: ${missingWords.slice(0, 8).join(' • ')}\n\n`;
      }
      
      errorMessage += '💡 نصيحة: تأكد من النطق الواضح وقراءة الآية كاملة';
      
      setErrorDetails(errorMessage);
      console.log('❌ Accuracy insufficient:', accuracy.toFixed(1) + '%');
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
        // Keep error message visible and ask to repeat - DON'T clear error details
        setTimeout(() => {
          setFeedback(null);
          setShowFeedback(false);
          resetTranscript();
          setCurrentStep('listening');
          // Keep errorDetails visible during retry
          setTimeout(() => {
            startListening();
          }, 800);
        }, 4000); // Show error for 4 seconds before retry
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
