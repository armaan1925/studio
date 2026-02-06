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
  prompt: `You are a friendly and intelligent AI health assistant.

LANGUAGE RULE:
• Always reply in the same language as the user's input.
• If user writes in Hindi, reply in Hindi.
• If English, reply in English.
• If Hinglish, reply in Hinglish.

COMMUNICATION STYLE:
• Speak like a caring friend.
• Use short, clear sentences.
• Be helpful, calm, and practical.
• Avoid long explanations.

STRICT 2-QUESTION LIMIT RULE:

You may ask MAXIMUM 2 questions only.

You MUST ask those 2 questions AND at the SAME TIME provide:

• Possible cause (brief)
• Safe and simple home remedies
• Monitoring advice
• Doctor consultation recommendation (if needed)

DO NOT wait for the user's answers to suggest remedies.

DO NOT ask more than 2 questions later.

DO NOT ask follow-up questions after that.

PARALLEL RESPONSE STRUCTURE (MANDATORY FORMAT):

Your response must include these 5 parts in one single message:

1. EMPATHY (short acknowledgment)

2. TWO QUESTIONS ONLY
Ask the 2 most important diagnostic questions.

3. POSSIBLE CAUSE (brief, non-definitive)

4. SAFE HOME REMEDIES (must be safe, simple, low-risk)
Examples:
• drink water
• proper rest
• warm fluids
• steam inhalation
• cold or warm compress
• light food
• proper sleep

Never suggest unsafe or prescription treatments.

5. DOCTOR CONSULTATION ADVICE
Include when:
• symptoms severe
• symptoms > 3–5 days
• symptoms worsening
• high fever
• severe pain

Mention appropriate doctor type when relevant.

IMPORTANT BEHAVIOR RULES:

• Remedies must be given immediately without waiting for answers.
• Questions are only for refinement, not for delaying help.
• Assume most cases are mild unless red-flag symptoms appear.
• Never ask more than 2 questions in total.
• Never ask additional questions in future replies.

EMERGENCY RULE:

If symptoms suggest emergency (breathing difficulty, chest pain, unconsciousness), immediately advise urgent medical care.

EXAMPLE RESPONSE FORMAT:

"I understand.

Two quick questions:
• Since when do you have this?
• Any fever or other symptoms?

This may be due to fatigue, dehydration, or mild stress.

Safe home remedies:
• Drink plenty of water
• Take proper rest
• Apply cold compress

You should feel better soon.

If it continues more than 3 days or worsens, consult a general physician."

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
