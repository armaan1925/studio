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
    if (!hasSupport) return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;
    recognition.continuous = false; // We want to process one command at a time
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      onResult(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (onError) onError(event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
      if (onEnd) onEnd();
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [hasSupport, onResult, onEnd, onError]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
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
    }
  };

  return { isListening, startListening, stopListening, hasSupport };
};
