'use client';

import { useVoiceAssistant } from "@/context/voice-assistant-context";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Mic, MicOff, Bot, User, BrainCircuit, AlertTriangle, Loader2 } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { placeholderImages } from "@/lib/data";
import { cn } from "@/lib/utils";

const AssistantAvatar = () => {
    const assistantAvatarImg = placeholderImages.find((img) => img.id === 'assistant-avatar');
    return (
        <Avatar className="size-16">
            {assistantAvatarImg && <AvatarImage src={assistantAvatarImg.imageUrl} alt="AI" />}
            <AvatarFallback><Bot size={24}/></AvatarFallback>
        </Avatar>
    )
}

const UserAvatar = () => {
    const userAvatarImg = placeholderImages.find((img) => img.id === 'user-avatar-1');
    return (
        <Avatar className="size-8">
            {userAvatarImg && <AvatarImage src={userAvatarImg.imageUrl} alt="User" />}
            <AvatarFallback><User size={16}/></AvatarFallback>
        </Avatar>
    )
}

const ListeningIndicator = () => (
    <div className="flex items-center justify-center gap-1.5">
        <span className="size-2 rounded-full bg-primary animate-pulse [animation-delay:-0.3s]" />
        <span className="size-2 rounded-full bg-primary animate-pulse [animation-delay:-0.15s]" />
        <span className="size-2 rounded-full bg-primary animate-pulse" />
    </div>
);

const AssistantStatus = () => {
    const { assistantState } = useVoiceAssistant();

    switch (assistantState) {
        case 'listening':
            return <div className="flex flex-col items-center gap-2 text-primary"><Mic className="size-6" /><p className="text-sm font-medium">Listening...</p></div>;
        case 'thinking':
            return <div className="flex flex-col items-center gap-2 text-amber-500"><BrainCircuit className="size-6 animate-pulse" /><p className="text-sm font-medium">Thinking...</p></div>;
        case 'speaking':
            return <div className="flex flex-col items-center gap-2 text-green-500"><Bot className="size-6" /><p className="text-sm font-medium">Speaking...</p></div>;
        case 'error':
             return <div className="flex flex-col items-center gap-2 text-destructive"><AlertTriangle className="size-6" /><p className="text-sm font-medium">An error occurred</p></div>;
        default:
            return <div className="flex flex-col items-center gap-2 text-muted-foreground"><MicOff className="size-6" /><p className="text-sm font-medium">Idle</p></div>;
    }
}


export const VoiceAssistant = () => {
    const { isOpen, toggleAssistant, messages, assistantState, hasMicPermission } = useVoiceAssistant();

    const assistantAvatarImg = placeholderImages.find((img) => img.id === 'assistant-avatar');

    return (
        <>
            <Button
                size="lg"
                className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full shadow-lg"
                onClick={toggleAssistant}
            >
                {assistantState === 'listening' ? <ListeningIndicator /> : <Mic className="size-7" />}
            </Button>

            <Dialog open={isOpen} onOpenChange={(open) => { if (!open) toggleAssistant() }}>
                <DialogContent className="sm:max-w-[425px] flex flex-col h-[70vh] max-h-[600px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                           <AssistantAvatar />
                           <span>AI Voice Assistant</span>
                        </DialogTitle>
                    </DialogHeader>
                    {hasMicPermission === false && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Microphone Access Denied</AlertTitle>
                            <AlertDescription>
                                To use the voice assistant, please enable microphone permissions in your browser settings and refresh the page.
                            </AlertDescription>
                        </Alert>
                    )}
                    {hasMicPermission === null && (
                         <div className="flex items-center justify-center h-full">
                            <Loader2 className="size-8 animate-spin" />
                         </div>
                    )}
                    {hasMicPermission && (
                        <>
                            <ScrollArea className="flex-grow pr-4 -mr-4">
                                <div className="space-y-4">
                                    {messages.map((message, index) => (
                                        <div key={index} className={cn("flex items-start gap-3", message.role === 'user' ? 'justify-end' : 'justify-start')}>
                                            {message.role === 'model' && (
                                                <Avatar className="size-8">
                                                    {assistantAvatarImg && <AvatarImage src={assistantAvatarImg.imageUrl} alt="AI" />}
                                                    <AvatarFallback><Bot size={16}/></AvatarFallback>
                                                </Avatar>
                                            )}
                                            <p className={cn("rounded-lg p-3 text-sm max-w-[80%]", message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                                {message.content}
                                            </p>
                                            {message.role === 'user' && <UserAvatar />}
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                            <div className="flex justify-center items-center h-24 border-t pt-4">
                                <AssistantStatus />
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};
