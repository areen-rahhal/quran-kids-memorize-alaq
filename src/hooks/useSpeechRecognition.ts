
import { useState, useRef, useCallback } from 'react';

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = useCallback(() => {
    console.log('🎤 COMPREHENSIVE DEBUG: Attempting to start speech recognition...');
    console.log('🔍 Browser check: webkitSpeechRecognition:', 'webkitSpeechRecognition' in window);
    console.log('🔍 Browser check: SpeechRecognition:', 'SpeechRecognition' in window);
    console.log('🔍 Current isListening state:', isListening);
    console.log('🔍 Current transcript state:', transcript);
    
    // Check browser support with detailed logging
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('❌ Speech recognition not supported in this browser');
      console.error('❌ User Agent:', navigator.userAgent);
      alert('Speech recognition is not supported in your browser. Please use Chrome or Safari.');
      return;
    }

    // Check microphone permissions
    navigator.mediaDevices?.getUserMedia({ audio: true })
      .then(() => {
        console.log('✅ Microphone access granted');
      })
      .catch((error) => {
        console.error('❌ Microphone access denied:', error);
        alert('Microphone access is required for speech recognition. Please allow microphone access.');
        return;
      });

    // Stop any existing recognition before starting a new one
    if (recognitionRef.current) {
      console.log('🛑 Stopping existing recognition before starting new one');
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    if (recognitionRef.current) {
      console.log('🔧 Configuring speech recognition...');
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true; // Enable interim results for better debugging
      recognitionRef.current.lang = 'ar-SA'; // Arabic language
      recognitionRef.current.maxAlternatives = 3; // Get multiple alternatives
      
      recognitionRef.current.onstart = () => {
        console.log('✅ SPEECH RECOGNITION STARTED SUCCESSFULLY');
        console.log('✅ Setting isListening to true');
        setIsListening(true);
      };
      
      recognitionRef.current.onresult = (event) => {
        console.log('🎙️ SPEECH RECOGNITION RESULT EVENT TRIGGERED');
        console.log('🎙️ Event:', event);
        console.log('🎙️ Results length:', event.results.length);
        
        if (event.results.length > 0) {
          const result = event.results[0][0].transcript;
          const confidence = event.results[0][0].confidence;
          const isFinal = event.results[0].isFinal;
          
          console.log('🎙️ Speech result:', result);
          console.log('📊 Confidence:', confidence);
          console.log('🏁 Is final:', isFinal);
          
          if (isFinal) {
            console.log('✅ FINAL RESULT - Setting transcript:', result);
            setTranscript(result);
          } else {
            console.log('⏳ Interim result:', result);
          }
          
          // Log all alternatives
          for (let i = 0; i < event.results[0].length; i++) {
            console.log(`🎙️ Alternative ${i}:`, event.results[0][i].transcript, 'confidence:', event.results[0][i].confidence);
          }
        }
      };
      
      recognitionRef.current.onend = () => {
        console.log('🛑 SPEECH RECOGNITION ENDED');
        console.log('🛑 Setting isListening to false');
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('❌ SPEECH RECOGNITION ERROR:', event.error);
        console.error('❌ Error details:', event);
        console.error('❌ Error message:', event.message);
        console.error('❌ Setting isListening to false');
        setIsListening(false);
        
        // Provide user-friendly error messages
        switch (event.error) {
          case 'no-speech':
            console.warn('⚠️ No speech was detected');
            break;
          case 'audio-capture':
            console.error('❌ Audio capture failed - microphone issues');
            alert('Microphone access failed. Please check your microphone and permissions.');
            break;
          case 'not-allowed':
            console.error('❌ Speech recognition not allowed');
            alert('Speech recognition permission denied. Please allow microphone access.');
            break;
          case 'network':
            console.error('❌ Network error during speech recognition');
            break;
          default:
            console.error('❌ Unknown speech recognition error:', event.error);
        }
      };
      
      try {
        console.log('🚀 CALLING recognition.start()...');
        recognitionRef.current.start();
        console.log('🚀 recognition.start() called successfully');
      } catch (error) {
        console.error('❌ EXCEPTION when starting speech recognition:', error);
        setIsListening(false);
      }
    } else {
      console.error('❌ Failed to create SpeechRecognition instance');
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    console.log('🧹 Resetting transcript from:', transcript, 'to empty');
    setTranscript('');
  }, [transcript]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript
  };
};
