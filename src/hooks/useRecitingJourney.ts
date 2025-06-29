
import { useState, useCallback } from 'react';
import { useSpeechRecognition } from './useSpeechRecognition';

export const useRecitingJourney = () => {
  const [isReciting, setIsReciting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'playing' | 'listening' | 'completed'>('playing');
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();

  const startRecitingJourney = useCallback((verses: number[], loadAndPlayAyah: (index: number, verses: number[]) => Promise<void>) => {
    console.log('Starting reciting journey with verses:', verses);
    setIsReciting(true);
    setCurrentStep('playing');
    setCurrentVerseIndex(0);
    resetTranscript();
    
    // Start playing the first verse
    loadAndPlayAyah(0, verses);
  }, [resetTranscript]);

  const handleVerseEnded = useCallback(() => {
    if (isReciting && currentStep === 'playing') {
      console.log('Verse ended, starting listening phase for verse index:', currentVerseIndex);
      setCurrentStep('listening');
      
      // Start listening after a short delay
      setTimeout(() => {
        startListening();
      }, 800);
    }
  }, [isReciting, currentStep, currentVerseIndex, startListening]);

  const handleListeningComplete = useCallback((verses: number[], loadAndPlayAyah: (index: number, verses: number[]) => Promise<void>) => {
    console.log('Listening complete called with transcript:', transcript);
    console.log('Current verse index:', currentVerseIndex, 'Total verses:', verses.length);
    
    if (transcript && transcript.trim().length > 0) {
      console.log('User finished reciting, transcript:', transcript);
      stopListening();
      resetTranscript();
      
      const nextIndex = currentVerseIndex + 1;
      console.log('Next index will be:', nextIndex);
      
      if (nextIndex < verses.length) {
        setCurrentVerseIndex(nextIndex);
        setCurrentStep('playing');
        
        // Play the next verse after a short delay
        setTimeout(() => {
          console.log('Playing next verse at index:', nextIndex);
          loadAndPlayAyah(nextIndex, verses);
        }, 1500);
      } else {
        // All verses completed
        console.log('All verses completed!');
        setCurrentStep('completed');
        setIsReciting(false);
        setCurrentVerseIndex(0);
      }
    }
  }, [transcript, currentVerseIndex, stopListening, resetTranscript]);

  const stopRecitingJourney = useCallback(() => {
    console.log('Stopping reciting journey');
    setIsReciting(false);
    setCurrentStep('playing');
    setCurrentVerseIndex(0);
    stopListening();
    resetTranscript();
  }, [stopListening, resetTranscript]);

  return {
    isReciting,
    currentStep,
    currentVerseIndex,
    isListening,
    transcript,
    startRecitingJourney,
    stopRecitingJourney,
    handleVerseEnded,
    handleListeningComplete
  };
};
