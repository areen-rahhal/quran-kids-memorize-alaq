
import { useState, useRef, useCallback } from 'react';

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = useCallback(() => {
    console.log('🎤 Attempting to start speech recognition...');
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('❌ Speech recognition not supported in this browser');
      alert('Speech recognition is not supported in your browser. Please use Chrome or Safari.');
      return;
    }

    // Stop any existing recognition before starting a new one
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    if (recognitionRef.current) {
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'ar-SA'; // Arabic language
      
      recognitionRef.current.onstart = () => {
        console.log('✅ Speech recognition started successfully');
        setIsListening(true);
      };
      
      recognitionRef.current.onresult = (event) => {
        const result = event.results[0][0].transcript;
        console.log('🎙️ Speech recognition result:', result);
        console.log('📊 Confidence:', event.results[0][0].confidence);
        setTranscript(result);
      };
      
      recognitionRef.current.onend = () => {
        console.log('🛑 Speech recognition ended');
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('❌ Speech recognition error:', event.error);
        console.error('Error details:', event);
        setIsListening(false);
      };
      
      try {
        recognitionRef.current.start();
        console.log('🚀 Speech recognition start() called');
      } catch (error) {
        console.error('❌ Failed to start speech recognition:', error);
        setIsListening(false);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript
  };
};
