import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-drug-info.ts';
import '@/ai/flows/generate-quiz-questions.ts';
import '@/ai/flows/suggest-related-research.ts';
import '@/ai/flows/chat-assistant-flow.ts';
import '@/ai/flows/scan-medicine-flow.ts';
import '@/ai/flows/voice-assistant-flow.ts';
import '@/ai/flows/summarize-prescription-flow.ts';
