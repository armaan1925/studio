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
    console.log('User said:', transcript);
    setMessages(prev => [...prev, { role: 'user', content: transcript }]);
    
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: transcript, history: messages })
      });
      if (!res.ok) {
        throw new Error(`API failed with status ${res.status}`);
      }

      const data = await res.json();
      console.log('AI response received:', data.reply);
      setMessages(prev => [...prev, { role: 'model', content: data.reply }]);
      setAssistantState('speaking');
      await speak(data.reply);

      if (activeAndOpen.current) {
        console.log('Conversation loop: Resuming listening.');
        setAssistantState('listening');
      } else {
        console.log('Assistant closed during speech, going idle.');
        setAssistantState('idle');
      }

    } catch (error) {
      console.error('Failed to process and respond:', error);
      setAssistantState('error');
      await speak("Sorry, I'm having a little trouble right now. Please try again in a moment.");
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
      // If recognition ends unexpectedly while we should be listening, restart it.
      if (activeAndOpen.current && assistantState === 'listening') {
        console.log('Speech recognition ended unexpectedly. Restarting...');
        startListening();
      }
    },
    onError: async (error) => {
      console.error('Speech recognition error in hook:', error);
      setAssistantState('error');
      // Avoid speaking if it's a permission error, as the UI shows a permanent banner.
      if (error !== 'not-allowed' && error !== 'service-not-allowed') {
        await speak("Sorry, I didn't quite catch that. Could you please say it again?");
      }
      if(activeAndOpen.current){
        setAssistantState('listening');
      }
    }
  });

  // Main state machine effect
  useEffect(() => {
    console.log(`Assistant state changed to: ${assistantState}, isOpen: ${isOpen}`);
    if (!isOpen) {
        if(isListening) stopListening();
        if(assistantState !== 'idle') setAssistantState('idle');
        return;
    }

    if (assistantState === 'listening' && !isListening) {
      startListening();
    } else if (assistantState !== 'listening' && isListening) {
      stopListening();
    }
  }, [assistantState, isOpen, isListening, startListening, stopListening]);


  const checkMicPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        console.log('Mic permission: not supported by browser.');
        setHasMicPermission(false);
        return false;
    }
    try {
      // Check current permission status without prompting
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      if (permissionStatus.state === 'granted') {
          setHasMicPermission(true);
          return true;
      }
      if (permissionStatus.state === 'denied') {
          console.log('Mic permission: denied.');
          setHasMicPermission(false);
          return false;
      }
      
      // If prompt is needed, this will trigger it.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      console.log('Mic permission: granted.');
      setHasMicPermission(true);
      return true;
    } catch (e) {
      console.error("Mic permission error:", e);
      setHasMicPermission(false);
      return false;
    }
  }, []);
  
  useEffect(() => {
    // Check permission silently on load
    if (typeof window !== 'undefined' && navigator.permissions) {
        navigator.permissions.query({ name: 'microphone' as PermissionName }).then(status => {
            setHasMicPermission(status.state === 'granted');
        });
    }
  }, []);

  const toggleAssistant = useCallback(async () => {
    if (isOpen) {
      console.log('Toggling assistant: CLOSE');
      setIsOpen(false);
    } else {
      console.log('Toggling assistant: OPEN');
      const hasPermission = await checkMicPermission();
      if(hasPermission) {
        setMessages([]);
        setIsOpen(true);
        setAssistantState('listening');
      } else {
        setIsOpen(true); // Open to show the permission error message in the dialog
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
