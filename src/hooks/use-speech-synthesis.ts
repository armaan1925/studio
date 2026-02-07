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
        // Try to find a suitable male voice. These names are common across browsers.
        const maleVoice = 
            voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('male')) ||
            voices.find(v => v.lang.startsWith('en') && v.name.includes('David')) ||
            voices.find(v => v.lang.startsWith('en') && v.name.includes('Google US English')) ||
            voices.find(v => v.lang.startsWith('en') && (v as any).gender === 'male');
        
        setSelectedVoice(maleVoice || voices.find(v => v.lang.startsWith('en')) || voices[0]);
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
        reject('Speech synthesis not supported');
        return;
      }
      
      if (synthRef.speaking) {
        synthRef.cancel(); // Stop any current speech
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsSpeaking(false);
        reject(event.error);
      };

      synthRef.speak(utterance);
    });
  };

  useEffect(() => {
    return () => {
      if (hasSupport && synthRef?.speaking) {
        synthRef.cancel();
      }
    };
  }, [hasSupport, synthRef]);

  return { speak, isSpeaking, hasSupport };
};
