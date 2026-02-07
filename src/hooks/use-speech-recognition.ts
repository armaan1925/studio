'use client';
import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type UseSpeechRecognitionProps = {
  onResult: (transcript: string) => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
};

export const useSpeechRecognition = ({ onResult, onEnd, onError }: UseSpeechRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const hasSupport = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!hasSupport) {
      console.warn('Speech recognition not supported by this browser.');
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;
    recognition.continuous = false; // A continuous loop is managed by the context, not the API directly.
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      console.log('STT Result:', transcript);
      onResult(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('STT Error:', event.error);
      if (onError) onError(event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      console.log('STT Service Ended.');
      setIsListening(false);
      if (onEnd) onEnd();
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        console.log('STT Cleanup: recognition stopped.');
      }
    };
  }, [hasSupport, onResult, onEnd, onError]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        console.log('STT Started.');
      } catch (e) {
         console.error("Could not start recognition:", e);
         setIsListening(false);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
       console.log('STT Stopped.');
    }
  };

  return { isListening, startListening, stopListening, hasSupport };
};
