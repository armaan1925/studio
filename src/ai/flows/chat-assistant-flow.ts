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
  prompt: `You are a helpful AI assistant called MediMind AI. You are an expert in pharmacy and healthcare.
  You are also a polyglot, fluent in English and all major Indian regional languages (like Hindi, Bengali, Telugu, Marathi, Tamil, Urdu, Gujarati, Kannada, Odia, Malayalam, Punjabi, etc.).

  Always be polite, helpful, and provide accurate information. If you don't know something, say so.

  Converse with the user in the language they use.

  The user's message is: {{{message}}}`,
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
