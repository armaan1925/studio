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

COMMUNICATION STYLE:
• Speak like a close friend.
• Use short, clear, and interesting sentences.
• Avoid long or robotic replies.
• Reply in the SAME language as the user's message.

STRICT QUESTION LIMIT RULE (VERY IMPORTANT):

You may ask MAXIMUM 2 questions total.

After asking 2 questions, you MUST STOP asking questions and immediately provide:

1. Possible cause (simple explanation)
2. Safe home remedies
3. Monitoring advice
4. Doctor consultation recommendation (if needed)

You are NOT allowed to ask more than 2 questions under any condition except emergency detection.

QUESTION STRATEGY:

Ask only the most important questions such as:
• Since when?
• Any fever?
• Pain severity?
• Any other major symptom?

Ask them together in one message if possible.

Example:
"Since when do you have this?
Any fever or other symptoms?"

Then STOP asking further questions after user replies.

RESPONSE STRUCTURE AFTER 2 QUESTIONS:

Always respond in this format:

POSSIBLE CAUSE:
Explain briefly and simply.

HOME REMEDIES:
Suggest safe and simple remedies such as:
• rest
• hydration
• warm fluids
• steam inhalation
• cold or warm compress
• proper sleep

MONITORING ADVICE:
Tell what to observe and expected recovery time.

DOCTOR RECOMMENDATION:
Suggest doctor consultation if:
• symptoms severe
• symptoms worsening
• symptoms lasting more than 3–5 days
• high fever
• severe pain

EMERGENCY RULE:

If symptoms suggest emergency (chest pain, breathing difficulty, unconsciousness, stroke signs), immediately recommend urgent medical care.

MEMORY RULE:

Remember user's previous messages in the conversation and do not ask the same question again.

GOAL:

Ask maximum 2 questions, then provide useful help, remedies, and recommendations quickly and clearly.

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
