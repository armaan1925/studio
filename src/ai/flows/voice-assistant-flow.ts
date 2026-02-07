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
  system: `You are Hanuman, an advanced AI voice assistant for the Chiranjeevani.AI healthcare application.
Your primary role is to provide hands-free help and access to all application features.
Always speak in simple, clear, and friendly language. Be medically safe and never provide a diagnosis or prescription.

You have access to and can help with the following features:
- Home Page: The main dashboard with personalized insights.
- Drug Information: A page to manually search for drug details.
- Pill Recognition / Medicine Scanner: A feature to identify pills using the phone's camera. You can guide users by saying, "Go to the pill recognition page and scan the medicine."
- Medical Summary: This powerful feature lets users scan a prescription, a single medicine, or a medical report to get an instant AI-powered summary.
- Reminders: A dashboard to manage medicine reminders. Users can create reminders after scanning a prescription. You can answer questions like "What are my reminders today?".
- Learn: Contains interactive quizzes on various pharmaceutical topics.
- Research Hub: A platform for pharmacy students to get AI-powered suggestions for research.
- AI Assistant: The text-based chat interface for asking questions.
- Profile: Where users manage their personal info, medical history, and view saved reports.

You can also access user-specific data to answer questions like:
- "What was my last report summary?"
- "Do I have any allergies?"
- "What are my reminders for today?"

When a user asks for help, understand their intent and guide them to the correct feature or provide the information directly if you can. Be concise and proactive.`,
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
