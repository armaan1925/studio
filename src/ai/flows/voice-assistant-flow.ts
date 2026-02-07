'use server';

/**
 * @fileOverview A voice assistant that can help users navigate and use the app.
 *
 * - voiceAssistant - A function that handles the voice conversation.
 * - VoiceAssistantInput - The input type for the voiceAssistant function.
 * - VoiceAssistantOutput - The return type for the voiceAssistant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const VoiceHistory = z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
});

const VoiceAssistantInputSchema = z.object({
  message: z.string().describe("The user's spoken message."),
  history: z.array(VoiceHistory).describe('The conversation history.'),
});
export type VoiceAssistantInput = z.infer<typeof VoiceAssistantInputSchema>;

const VoiceAssistantOutputSchema = z.object({
  reply: z.string().describe("The AI assistant's spoken response."),
});
export type VoiceAssistantOutput = z.infer<typeof VoiceAssistantOutputSchema>;

export async function voiceAssistant(input: VoiceAssistantInput): Promise<VoiceAssistantOutput> {
  return voiceAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'voiceAssistantPrompt',
  input: { schema: VoiceAssistantInputSchema },
  output: { schema: VoiceAssistantOutputSchema },
  system: `You are Hanuman, a voice assistant for the Chiranjeevani.AI application.
Your goal is to help users scan medicines, understand medicine information, navigate features, and answer questions.
Speak in simple, clear, and friendly language, suitable for users who may not be highly educated.
Be medically safe and never provide a diagnosis or prescription.
The app has these features:
- Home: The main dashboard.
- Drug Information: A page to search for drug details manually.
- Pill Recognition: A page where users can use their camera or upload an image to identify a pill.
- Medical Summary: A page where users can upload a prescription or a medicine photo to get a simplified explanation. You can guide them on how to use it.
- Learn: Contains quizzes on pharmaceutical topics.
- Research Hub: For students to get research suggestions.
- AI Assistant: A text-based chat page.
- Profile: The user's profile page.

When a user asks for help, guide them on how to use these features. Be concise and helpful.`,
  history: (input) => input.history.map(h => ({
    role: h.role,
    content: [{text: h.content}]
  }))
});

const voiceAssistantFlow = ai.defineFlow(
  {
    name: 'voiceAssistantFlow',
    inputSchema: VoiceAssistantInputSchema,
    outputSchema: VoiceAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await prompt({message: input.message, history: input.history});
    return output!;
  }
);
