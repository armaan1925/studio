'use client';

import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Bot, Loader2, Mic, Send, User, Volume2, Waves } from 'lucide-react';
import Image from 'next/image';
import { placeholderImages } from '@/lib/data';
import { getChatResponse, getSpokenResponse } from './actions';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

type Message = {
  role: 'user' | 'model';
  content: string;
};

// Extend the global Window interface
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function AssistantClient() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const assistantAvatar = placeholderImages.find((img) => img.id === 'assistant-avatar');
  const userAvatar = placeholderImages.find((img) => img.id === 'user-avatar-1');
  const audioRef = useRef<HTMLAudioElement | null>(null);


  useEffect(() => {
    // Initialize SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US'; // This can be changed dynamically

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSendMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        toast({
            variant: 'destructive',
            title: 'Speech Recognition Error',
            description: `Could not understand audio. Please try again. Error: ${'\'\'\''}${event.error}${'\'\'\''}`,
        });
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [toast]);
  
  const handleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        toast({
          variant: 'destructive',
          title: 'Unsupported Browser',
          description: 'Your browser does not support speech recognition.',
        });
      }
    }
  };

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings for the full experience.',
        });
      }
    };

    getCameraPermission();
    
    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [toast]);

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim()) return;

    const newUserMessage: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);

    const history = messages.map(m => ({role: m.role, content: m.content}));

    const result = await getChatResponse({ message: text, history });

    if (result.success && result.data) {
      const assistantMessage: Message = { role: 'model', content: result.data.response };
      setMessages((prev) => [...prev, assistantMessage]);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
       // Restore user message on error
      setMessages(prev => prev.slice(0, -1));
    }
    setIsLoading(false);
  };

  const handlePlayAudio = async (text: string) => {
    setIsLoading(true);
    const result = await getSpokenResponse(text);
    setIsLoading(false);
    if (result.success && result.data) {
      if (audioRef.current) {
        audioRef.current.src = result.data.media;
        audioRef.current.play();
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
  };

  if (!isClient) {
    return (
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Hanuman Visual Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="aspect-video w-full rounded-md" />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col gap-4">
              <div className="flex-grow h-[400px] border rounded-md" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 flex-grow" />
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
       <audio ref={audioRef} className="hidden" />
      <div className="lg:col-span-1 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hanuman Visual Assistant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-md overflow-hidden relative flex items-center justify-center">
              {assistantAvatar && (
                 <Image
                    src={assistantAvatar.imageUrl}
                    alt={assistantAvatar.description}
                    width={150}
                    height={150}
                    className="rounded-full z-10"
                    data-ai-hint={assistantAvatar.imageHint}
                />
              )}
               <div className='absolute inset-0'>
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                <div className='absolute inset-0 bg-black/50'></div>
               </div>

            </div>
            {hasCameraPermission === false && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTitle>Camera Access Required</AlertTitle>
                  <AlertDescription>
                    Please allow camera access for a more immersive experience. The assistant's avatar will be displayed here.
                  </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Chat</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col gap-4">
            <ScrollArea className="flex-grow h-[400px] pr-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex items-start gap-3',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'model' && (
                      <Avatar className="size-8">
                        {assistantAvatar && <AvatarImage src={assistantAvatar.imageUrl} alt="AI" />}
                        <AvatarFallback><Bot size={16}/></AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        'rounded-lg p-3 text-sm max-w-sm md:max-w-md',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      {message.content}
                      {message.role === 'model' && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 mt-1" onClick={() => handlePlayAudio(message.content)} disabled={isLoading}>
                           <Volume2 className="size-4" />
                        </Button>
                      )}
                    </div>
                     {message.role === 'user' && (
                      <Avatar className="size-8">
                         {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User" />}
                        <AvatarFallback><User size={16}/></AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex items-start gap-3 justify-start">
                         <Avatar className="size-8">
                            {assistantAvatar && <AvatarImage src={assistantAvatar.imageUrl} alt="AI" />}
                            <AvatarFallback><Bot size={16}/></AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg p-3 text-sm bg-muted flex items-center">
                            <Loader2 className="size-5 animate-spin"/>
                        </div>
                    </div>
                )}
              </div>
            </ScrollArea>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
              />
              <Button type="submit" size="icon" onClick={() => handleSendMessage()} disabled={isLoading || !input.trim()}>
                <Send className="size-4" />
              </Button>
              <Button type="button" size="icon" variant={isListening ? 'destructive' : 'outline'} onClick={handleVoiceInput} disabled={isLoading}>
                {isListening ? <Waves className="size-4" /> : <Mic className="size-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
