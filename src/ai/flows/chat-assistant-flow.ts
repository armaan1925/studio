'use server';
/**
 * @fileOverview An AI assistant that can chat and speak.
 *
 * - chatAssistant - A function that handles the chat conversation.
 * - textToSpeech - A function that converts text to speech.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

// Chat Assistant Flow
const ChatHistory = z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
});

const ChatAssistantInputSchema = z.object({
  message: z.string().describe('The user\'s message.'),
  history: z.array(ChatHistory).describe('The conversation history.'),
});
export type ChatAssistantInput = z.infer<typeof ChatAssistantInputSchema>;

const ChatAssistantOutputSchema = z.object({
  response: z.string().describe('The AI assistant\'s response.'),
});
export type ChatAssistantOutput = z.infer<typeof ChatAssistantOutputSchema>;

export async function chatAssistant(input: ChatAssistantInput): Promise<ChatAssistantOutput> {
  return chatAssistantFlow(input);
}

const chatAssistantPrompt = ai.definePrompt({
  name: 'chatAssistantPrompt',
  input: {schema: ChatAssistantInputSchema},
  output: {schema: ChatAssistantOutputSchema},
  prompt: `You are Hanuman, an intelligent and caring AI health assistant. Your personality is protective, calm, friendly, and supportive.

CRITICAL LANGUAGE RULE: You MUST reply in the exact same language as the user's message.
- If user writes in Hindi, you MUST reply in Hindi.
- If user writes in English, you MUST reply in English.
- If user writes in Hinglish (e.g., "headache ho raha hai"), you MUST reply in Hinglish.

COMMUNICATION STYLE:
- Your style is like a friendly WhatsApp chat.
- Use short, simple sentences (1-3 sentences maximum).
- Use emojis like 👍, 😊, 💪, ⚠️, 🙏, 💧, 😴 to make the conversation feel warm and personal.
- Never use complex medical jargon.

HOME REMEDY RULE:
- If a user mentions common symptoms (like headache, cold, cough, fever, weakness, stomach pain), you MUST immediately provide 2-3 safe and simple home remedies in the same message.
- Do NOT wait for them to ask for remedies.
- Safe remedies include: rest, hydration, steam, warm fluids, light food.
- ALWAYS include a suggestion to consult a doctor if symptoms persist or are severe.

RESPONSE STRUCTURE:
Your response should follow this structure in a single message:
1.  Acknowledge and show empathy (e.g., "I understand.", "Don't worry 👍").
2.  Provide 2-3 safe home remedies.
3.  Give supportive advice (e.g., "You will feel better soon 💪").
4.  Mention when to see a doctor if necessary.

EXAMPLE RESPONSE (if user says "Bahut headache ho raha hai"):
"Don't worry, I am here to help 👍 For relief, try this:
• Take proper rest 😴
• Drink plenty of water 💧
• Apply a cold compress on your forehead.
You should feel better soon. If the headache continues for a long time or gets worse, please see a doctor ⚠️"

USER'S MESSAGE: {{{message}}}
`,
  history: (input) => input.history.map(h => ({
    role: h.role,
    content: [{text: h.content}]
  }))
});

const chatAssistantFlow = ai.defineFlow(
  {
    name: 'chatAssistantFlow',
    inputSchema: ChatAssistantInputSchema,
    outputSchema: ChatAssistantOutputSchema,
  },
  async (input) => {
    const {output} = await chatAssistantPrompt(input);
    return output!;
  }
);

// Text to Speech Flow
async function toWav(
    pcmData: Buffer,
    channels = 1,
    rate = 24000,
    sampleWidth = 2
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const writer = new wav.Writer({
        channels,
        sampleRate: rate,
        bitDepth: sampleWidth * 8,
      });

      let bufs = [] as any[];
      writer.on('error', reject);
      writer.on('data', function (d) {
        bufs.push(d);
      });
      writer.on('end', function () {
        resolve(Buffer.concat(bufs).toString('base64'));
      });

      writer.write(pcmData);
      writer.end();
    });
}

const textToSpeechFlow = ai.defineFlow(
    {
      name: 'textToSpeechFlow',
      inputSchema: z.string(),
      outputSchema: z.any(),
    },
    async (query) => {
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.5-flash-preview-tts',
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Algenib' },
            },
          },
        },
        prompt: query,
      });
      if (!media) {
        throw new Error('no media returned');
      }
      const audioBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
      );
      return {
        media: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
      };
    }
);

export async function textToSpeech(text: string): Promise<{media: string}> {
    return textToSpeechFlow(text);
}
