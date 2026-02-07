'use client';

import { useState, useEffect, useCallback } from 'react';

type UseSpeechSynthesis = {
  speak: (text: string) => Promise<void>;
  isSpeaking: boolean;
  hasSupport: boolean;
};

export const useSpeechSynthesis = (): UseSpeechSynthesis => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const synthRef = typeof window !== 'undefined' ? window.speechSynthesis : null;
  const hasSupport = !!synthRef;

  const getVoices = useCallback(() => {
    if (!hasSupport || !synthRef) return [];
    return synthRef.getVoices();
  }, [hasSupport, synthRef]);

  useEffect(() => {
    if (!hasSupport || !synthRef) return;
    
    const setVoice = () => {
      const voices = getVoices();
      if (voices.length > 0) {
        // Find the best available male voice, prioritizing Indian English
        const chosenVoice =
          // 1. Indian English Male
          voices.find(v => v.lang === 'en-IN' && v.name.toLowerCase().includes('male')) ||
          // 2. US English Male
          voices.find(v => v.lang === 'en-US' && v.name.toLowerCase().includes('male')) ||
          // 3. Any English Male
          voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('male')) ||
           // 4. Any voice with 'male' in the name
          voices.find(v => v.name.toLowerCase().includes('male')) ||
          // 5. Any voice named 'Google US English' (often a good default)
          voices.find(v => v.name === 'Google US English') ||
          // 6. Any English voice
          voices.find(v => v.lang.startsWith('en')) ||
          // 7. The very first voice available
          voices[0];
        
        setSelectedVoice(chosenVoice);
        console.log('TTS Voice selected:', chosenVoice?.name);
      }
    };

    setVoice();
    // Voices may load asynchronously.
    if (synthRef.onvoiceschanged !== undefined) {
      synthRef.onvoiceschanged = setVoice;
    }
  }, [getVoices, hasSupport, synthRef]);

  const speak = (text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!hasSupport || !synthRef) {
        console.error('TTS Error: Speech synthesis not supported');
        reject('Speech synthesis not supported');
        return;
      }
      
      if (synthRef.speaking) {
        console.log('TTS: Cancelling previous speech.');
        synthRef.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        console.log('TTS started for:', text);
        setIsSpeaking(true);
      };
      utterance.onend = () => {
        console.log('TTS finished.');
        setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = (event) => {
        console.error('TTS Error:', event.error);
        setIsSpeaking(false);
        reject(event.error);
      };
      
      console.log('TTS: Queuing speech.');
      synthRef.speak(utterance);
    });
  };

  useEffect(() => {
    return () => {
      if (hasSupport && synthRef?.speaking) {
        console.log('TTS Cleanup: Cancelling speech on unmount.');
        synthRef.cancel();
      }
    };
  }, [hasSupport, synthRef]);

  return { speak, isSpeaking, hasSupport };
};
