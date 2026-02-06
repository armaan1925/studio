'use server';
import { chatAssistant, textToSpeech, type ChatAssistantInput, type ChatAssistantOutput } from '@/ai/flows/chat-assistant-flow';

export async function getChatResponse(input: ChatAssistantInput): Promise<{ success: boolean, data?: ChatAssistantOutput, error?: string }> {
  try {
    const result = await chatAssistant(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to get chat response. Please try again.' };
  }
}

export async function getSpokenResponse(text: string): Promise<{ success: boolean, data?: { media: string }, error?: string }> {
  try {
    const result = await textToSpeech(text);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate speech. Please try again.' };
  }
}
