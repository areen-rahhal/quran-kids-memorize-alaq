
import React, { useState, useCallback } from 'react';
import { useSpeechRecognition } from './useSpeechRecognition';

export const useRecitingJourney = () => {
  const [isReciting, setIsReciting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'playing' | 'listening' | 'completed'>('playing');
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [highlightedWords, setHighlightedWords] = useState<string[]>([]);
  
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

  // Enhanced similarity checking with multiple algorithms
  const calculateSimilarity = (str1: string, str2: string) => {
    // Direct match
    if (str1 === str2) return 1.0;
    
    // Contains match
    if (str1.includes(str2) || str2.includes(str1)) return 0.95;
    
    // Character-based similarity
    const chars1 = str1.split('');
    const chars2 = str2.split('');
    const common = chars1.filter(char => chars2.includes(char)).length;
    const charSimilarity = common / Math.max(chars1.length, chars2.length);
    
    return charSimilarity;
  };

  // Much more lenient accuracy checking
  const checkRecitingAccuracy = (userText: string, expectedText: string) => {
    const normalizedUser = normalizeArabicText(userText);
    const normalizedExpected = normalizeArabicText(expectedText);
    
    console.log('=== ENHANCED ACCURACY CHECK ===');
    console.log('User text:', userText);
    console.log('Expected text:', expectedText);
    console.log('Normalized user:', normalizedUser);
    console.log('Normalized expected:', normalizedExpected);
    
    // Check if user text is too short
    if (normalizedUser.length < 3) {
      setErrorDetails('التلاوة قصيرة جداً - يرجى قراءة الآية كاملة بوضوح');
      console.log('❌ Text too short');
      return false;
    }
    
    // Overall text similarity check
    const textSimilarity = calculateSimilarity(normalizedUser, normalizedExpected);
    console.log('Overall text similarity:', (textSimilarity * 100).toFixed(1) + '%');
    
    if (textSimilarity >= 0.75) {
      console.log('✅ Overall similarity sufficient:', (textSimilarity * 100).toFixed(1) + '%');
      setErrorDetails('');
      return true;
    }
    
    // Word-by-word analysis with very flexible matching
    const expectedWords = normalizedExpected.split(' ').filter(word => word.length > 0);
    const userWords = normalizedUser.split(' ').filter(word => word.length > 0);
    
    console.log('Expected words:', expectedWords);
    console.log('User words:', userWords);
    
    let totalScore = 0;
    const matchDetails: string[] = [];
    const missingWords: string[] = [];
    
    expectedWords.forEach(expectedWord => {
      let bestMatch = 0;
      let matchedWith = '';
      
      userWords.forEach(userWord => {
        const similarity = calculateSimilarity(userWord, expectedWord);
        if (similarity > bestMatch) {
          bestMatch = similarity;
          matchedWith = userWord;
        }
      });
      
      totalScore += bestMatch;
      
      if (bestMatch >= 0.6) { // Very lenient threshold
        matchDetails.push(`${expectedWord} ✓ (${(bestMatch * 100).toFixed(0)}%)`);
      } else {
        missingWords.push(expectedWord);
      }
    });
    
    const accuracy = expectedWords.length > 0 ? (totalScore / expectedWords.length) * 100 : 0;
    
    console.log('=== ENHANCED RESULTS ===');
    console.log('Total accuracy:', accuracy.toFixed(1) + '%');
    console.log('Match details:', matchDetails);
    console.log('Missing words:', missingWords);
    
    // Much more lenient threshold - 65% instead of 80%
    if (accuracy >= 65) {
      console.log('✅ Accuracy sufficient:', accuracy.toFixed(1) + '%');
      setErrorDetails('');
      return true;
    } else {
      // Provide encouraging feedback
      let errorMessage = `دقة التلاوة: ${accuracy.toFixed(1)}% (مطلوب 65% أو أكثر)\n\n`;
      
      if (matchDetails.length > 0) {
        errorMessage += `✅ كلمات صحيحة (${matchDetails.length}): ${matchDetails.slice(0, 6).join(' • ')}\n\n`;
      }
      
      if (missingWords.length > 0) {
        errorMessage += `📝 كلمات تحتاج تحسين (${missingWords.length}): ${missingWords.slice(0, 4).join(' • ')}\n\n`;
      }
      
      errorMessage += '💡 نصيحة: تأكد من النطق الواضح، لا تقلق من الأخطاء البسيطة';
      
      setErrorDetails(errorMessage);
      console.log('❌ Accuracy needs improvement:', accuracy.toFixed(1) + '%');
      return false;
    }
  };

  // Real-time word highlighting based on transcript
  const updateWordHighlighting = (currentTranscript: string, expectedText: string) => {
    if (!currentTranscript) {
      setHighlightedWords([]);
      return;
    }

    const normalizedTranscript = normalizeArabicText(currentTranscript);
    const expectedWords = normalizeArabicText(expectedText).split(' ');
    const transcriptWords = normalizedTranscript.split(' ');
    
    const highlighted: string[] = [];
    expectedWords.forEach((expectedWord, index) => {
      const matchFound = transcriptWords.some(transcriptWord => 
        calculateSimilarity(transcriptWord, expectedWord) >= 0.7
      );
      if (matchFound) {
        highlighted.push(expectedWord);
      }
    });
    
    setHighlightedWords(highlighted);
  };

  const startRecitingJourney = useCallback((verses: number[], loadAndPlayAyah: (index: number, verses: number[]) => Promise<void>) => {
    console.log('Starting reciting journey with verses:', verses);
    setIsReciting(true);
    setCurrentStep('playing');
    setCurrentVerseIndex(0);
    setFeedback(null);
    setShowFeedback(false);
    setErrorDetails('');
    setHighlightedWords([]);
    resetTranscript();
    
    loadAndPlayAyah(0, verses);
  }, [resetTranscript]);

  const handleVerseEnded = useCallback(() => {
    if (isReciting && currentStep === 'playing') {
      console.log('Verse ended, starting listening phase for verse index:', currentVerseIndex);
      setCurrentStep('listening');
      setFeedback(null);
      setShowFeedback(false);
      setErrorDetails('');
      setHighlightedWords([]);
      
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
      
      const isCorrect = checkRecitingAccuracy(transcript, expectedText);
      setFeedback(isCorrect ? 'correct' : 'incorrect');
      setShowFeedback(true);
      
      if (isCorrect) {
        console.log('Reciting is correct, moving to next verse');
        resetTranscript();
        setHighlightedWords([]);
        
        const nextIndex = currentVerseIndex + 1;
        console.log('Next index will be:', nextIndex);
        
        if (nextIndex < verses.length) {
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
          }, 3000);
        } else {
          setTimeout(() => {
            console.log('All verses completed!');
            setCurrentStep('completed');
            setIsReciting(false);
            setCurrentVerseIndex(0);
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
          setCurrentStep('listening');
          setTimeout(() => {
            startListening();
          }, 800);
        }, 5000); // Show error for 5 seconds before retry
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
    setHighlightedWords([]);
    stopListening();
    resetTranscript();
  }, [stopListening, resetTranscript]);

  // Update highlighting when transcript changes
  React.useEffect(() => {
    if (isListening && transcript) {
      // This would need the expected text, but we'll handle it in the component
      console.log('Transcript updated for highlighting:', transcript);
    }
  }, [transcript, isListening]);

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
    startRecitingJourney,
    stopRecitingJourney,
    handleVerseEnded,
    handleListeningComplete,
    updateWordHighlighting
  };
};
