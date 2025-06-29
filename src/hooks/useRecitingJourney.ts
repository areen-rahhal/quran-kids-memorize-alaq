
import { useState, useCallback } from 'react';
import { useSpeechRecognition } from './useSpeechRecognition';

export const useRecitingJourney = () => {
  const [isReciting, setIsReciting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'playing' | 'listening' | 'completed'>('playing');
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  
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

  // Function to check if reciting is correct
  const checkRecitingAccuracy = (userText: string, expectedText: string) => {
    const normalizedUser = normalizeArabicText(userText);
    const normalizedExpected = normalizeArabicText(expectedText);
    
    console.log('Comparing:', { normalizedUser, normalizedExpected });
    
    // Check if user text contains most of the expected words
    const expectedWords = normalizedExpected.split(' ').filter(word => word.length > 2);
    const userWords = normalizedUser.split(' ');
    
    let matchedWords = 0;
    expectedWords.forEach(expectedWord => {
      if (userWords.some(userWord => 
        userWord.includes(expectedWord) || expectedWord.includes(userWord)
      )) {
        matchedWords++;
      }
    });
    
    const accuracy = matchedWords / expectedWords.length;
    console.log('Accuracy:', accuracy, 'Matched words:', matchedWords, 'Total words:', expectedWords.length);
    
    return accuracy >= 0.6; // 60% accuracy threshold
  };

  const startRecitingJourney = useCallback((verses: number[], loadAndPlayAyah: (index: number, verses: number[]) => Promise<void>) => {
    console.log('Starting reciting journey with verses:', verses);
    setIsReciting(true);
    setCurrentStep('playing');
    setCurrentVerseIndex(0);
    setFeedback(null);
    setShowFeedback(false);
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
            
            setTimeout(() => {
              console.log('Playing next verse at index:', nextIndex);
              loadAndPlayAyah(nextIndex, verses);
            }, 500);
          }, 2000);
        } else {
          // All verses completed
          setTimeout(() => {
            console.log('All verses completed!');
            setCurrentStep('completed');
            setIsReciting(false);
            setCurrentVerseIndex(0);
            setFeedback(null);
            setShowFeedback(false);
          }, 2000);
        }
      } else {
        console.log('Reciting is incorrect, asking to repeat');
        // Wait for feedback display, then ask to repeat
        setTimeout(() => {
          setFeedback(null);
          setShowFeedback(false);
          resetTranscript();
          setCurrentStep('listening');
          setTimeout(() => {
            startListening();
          }, 800);
        }, 3000);
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
    startRecitingJourney,
    stopRecitingJourney,
    handleVerseEnded,
    handleListeningComplete
  };
};
