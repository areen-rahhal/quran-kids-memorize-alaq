
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
