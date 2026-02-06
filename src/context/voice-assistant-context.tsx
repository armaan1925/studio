'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';

type Message = {
  role: 'user' | 'model';
  content: string;
};

type AssistantState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

type VoiceAssistantContextType = {
  isOpen: boolean;
  toggleAssistant: () => void;
  messages: Message[];
  assistantState: AssistantState;
  hasMicPermission: boolean | null;
};

const VoiceAssistantContext = createContext<VoiceAssistantContextType | undefined>(undefined);

export const VoiceAssistantProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [assistantState, setAssistantState] = useState<AssistantState>('idle');
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  
  const activeAndOpen = useRef(false);
  useEffect(() => {
    activeAndOpen.current = isOpen && assistantState !== 'idle';
  }, [isOpen, assistantState]);


  const { speak } = useSpeechSynthesis();

  const processAndRespond = useCallback(async (transcript: string) => {
    setAssistantState('thinking');
    setMessages(prev => [...prev, { role: 'user', content: transcript }]);
    
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        body: JSON.stringify({ message: transcript, history: messages })
      });
      if (!res.ok) throw new Error("API failed");

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'model', content: data.reply }]);
      setAssistantState('speaking');
      await speak(data.reply);

      if (activeAndOpen.current) {
        setAssistantState('listening');
      } else {
        setAssistantState('idle');
      }

    } catch (error) {
      console.error(error);
      setAssistantState('error');
      await speak("Sorry, something went wrong.");
      if (activeAndOpen.current) {
        setAssistantState('listening');
      } else {
        setAssistantState('idle');
      }
    }
  }, [messages, speak]);


  const { startListening, stopListening, isListening } = useSpeechRecognition({
    onResult: (transcript) => {
      if (transcript) {
        processAndRespond(transcript);
      }
    },
    onEnd: () => {
      // If recognition ends unexpectedly, and we should be listening, restart.
      if (activeAndOpen.current && assistantState === 'listening') {
        startListening();
      }
    }
  });

  // Main state machine effect
  useEffect(() => {
    if (!isOpen) {
        if(isListening) stopListening();
        setAssistantState('idle');
        return;
    }

    if (assistantState === 'listening' && !isListening) {
      startListening();
    } else if (assistantState !== 'listening' && isListening) {
      stopListening();
    }
  }, [assistantState, isOpen, isListening, startListening, stopListening]);


  const checkMicPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices) {
        setHasMicPermission(false);
        return false;
    }
    try {
      // This will prompt the user for permission if not already granted.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // We don't need the stream, just the confirmation of permission.
      stream.getTracks().forEach(track => track.stop());
      setHasMicPermission(true);
      return true;
    } catch (e) {
      console.error("Microphone permission was denied.");
      setHasMicPermission(false);
      return false;
    }
  }, []);
  
  useEffect(() => {
    checkMicPermission();
  }, [checkMicPermission]);

  const toggleAssistant = useCallback(async () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      const hasPermission = await checkMicPermission();
      if(hasPermission) {
        setMessages([]);
        setAssistantState('listening');
        setIsOpen(true);
      } else {
          setIsOpen(true); // Open to show the permission error
      }
    }
  }, [isOpen, checkMicPermission]);

  const value = { isOpen, toggleAssistant, messages, assistantState, hasMicPermission };

  return (
    <VoiceAssistantContext.Provider value={value}>
      {children}
    </VoiceAssistantContext.Provider>
  );
};

export const useVoiceAssistant = () => {
  const context = useContext(VoiceAssistantContext);
  if (context === undefined) {
    throw new Error('useVoiceAssistant must be used within a VoiceAssistantProvider');
  }
  return context;
};
