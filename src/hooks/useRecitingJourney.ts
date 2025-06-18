
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
    console.log('Starting reciting journey');
    setIsReciting(true);
    setCurrentStep('playing');
    setCurrentVerseIndex(0);
    resetTranscript();
    
    // Start playing the first verse
    loadAndPlayAyah(0, verses);
  }, [resetTranscript]);

  const handleVerseEnded = useCallback(() => {
    if (isReciting && currentStep === 'playing') {
      console.log('Verse ended, starting listening phase');
      setCurrentStep('listening');
      
      // Start listening after a short delay
      setTimeout(() => {
        startListening();
      }, 500);
    }
  }, [isReciting, currentStep, startListening]);

  const handleListeningComplete = useCallback((verses: number[], loadAndPlayAyah: (index: number, verses: number[]) => Promise<void>) => {
    if (transcript) {
      console.log('User finished reciting, moving to next verse');
      stopListening();
      resetTranscript();
      
      const nextIndex = currentVerseIndex + 1;
      if (nextIndex < verses.length) {
        setCurrentVerseIndex(nextIndex);
        setCurrentStep('playing');
        
        // Play the next verse after a short delay
        setTimeout(() => {
          loadAndPlayAyah(nextIndex, verses);
        }, 1000);
      } else {
        // All verses completed
        setCurrentStep('completed');
        setIsReciting(false);
        console.log('Reciting journey completed');
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
    isListening,
    transcript,
    startRecitingJourney,
    stopRecitingJourney,
    handleVerseEnded,
    handleListeningComplete
  };
};
