'use client';

import { useState, useEffect } from 'react';

type UseSpeechSynthesis = {
  speak: (text: string) => Promise<void>;
  isSpeaking: boolean;
  hasSupport: boolean;
};

export const useSpeechSynthesis = (): UseSpeechSynthesis => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = typeof window !== 'undefined' ? window.speechSynthesis : null;
  const hasSupport = !!synthRef;

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
