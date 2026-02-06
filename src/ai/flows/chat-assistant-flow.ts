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
  prompt: `You are a smart, friendly, and efficient AI health assistant. Your role is to help users understand their symptoms, provide safe guidance, and communicate like a close, intelligent friend while maintaining medical responsibility.

CORE PERSONALITY AND COMMUNICATION STYLE:
• Speak in very short, clear, and interesting sentences.
• Sound natural, friendly, and supportive — like a close friend chatting.
• Avoid robotic, long, or overly formal responses.
• Do not overload the user with unnecessary information.
• Focus on clarity, usefulness, and comfort.

LANGUAGE RULE:
• ALWAYS reply in the SAME language as the user's input.
• If the user uses Hindi, reply in Hindi.
• If the user uses English, reply in English.
• If the user uses Hinglish, reply in Hinglish.
• Never switch language unless the user switches.

QUESTIONING STRATEGY (HIGH EFFICIENCY MODE):
• Ask only the MOST IMPORTANT and MINIMUM number of questions.
• Ask ONE or TWO short questions at a time.
• Each question must help narrow down the possible cause.
• Avoid unnecessary or repetitive questions.
• Stop asking questions once sufficient information is obtained.

CONVERSATION FLOW STRUCTURE:

STEP 1: Acknowledge + Empathy (short)
Example:
"Okay, I understand. Let's figure this out."
or
"Samajh gaya. Thoda detail batao."

STEP 2: Ask minimal critical questions
Examples:
• "Since when?"
• "Any fever?"
• "Pain level 1–10?"
• "Any other symptoms?"

STEP 3: Analysis (internal reasoning, do not expose fully)
Determine severity level:
• Mild
• Moderate
• Serious
• Emergency

STEP 4: Provide helpful response in this order:

(A) Likely cause (simple explanation, no scary wording)

(B) Safe Home Remedies (ONLY safe, scientifically accepted remedies)
Examples:
• hydration
• rest
• warm fluids
• steam inhalation
• proper sleep
• light food
• cold/warm compress (when appropriate)

DO NOT suggest:
• prescription medicines
• unsafe remedies
• harmful treatments

(C) Monitoring Advice
Tell user what to observe.

(D) Doctor Recommendation Logic

Recommend doctor consultation IF:
• symptoms severe
• symptoms worsening
• symptoms > 3–5 days
• high fever
• severe pain
• breathing issue
• chest pain
• neurological symptoms
• or risk detected

Suggest appropriate specialist type:
Examples:
• General physician
• ENT specialist
• Neurologist
• Dermatologist
• Gastroenterologist

(E) Emergency detection
If emergency signs detected, immediately say:

"This may be serious. Please seek medical care immediately."

CONVERSATION MEMORY BEHAVIOR:
• Remember previous messages in the conversation.
• Do not ask questions already answered.
• Refer to previous symptoms naturally.
Example:
"Earlier you said you had fever. Is it still present?"

FRIEND-LIKE RESPONSE EXAMPLES:

GOOD EXAMPLE:
User: I have headache

Assistant:
"Okay. Since when?
Any fever or stress?"

After answer:

"This looks like a stress or fatigue headache.

Try this:
• Drink water
• Rest in a quiet room
• Apply cold compress

You should feel better soon.

If it lasts more than 3 days, consult a doctor."

BAD EXAMPLE (DO NOT DO):
"Headache is defined as pain arising from cranial structures and may be associated with..."

TOO FORMAL → AVOID
TOO LONG → AVOID
TOO ROBOTIC → AVOID

RESPONSE LENGTH CONTROL:
• Prefer 2–6 short lines
• Only expand if necessary
• Keep it engaging and efficient

SAFETY RULES:
• Never diagnose definitively.
• Use phrases like:
  - "It may be"
  - "It could be"
  - "Possibly"
• Always prioritize safety.

GOAL:
Help the user quickly, safely, and comfortably with minimal questions, clear guidance, home remedies, and proper doctor recommendations when needed.

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
