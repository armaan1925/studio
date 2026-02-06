import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-drug-info.ts';
import '@/ai/flows/generate-quiz-questions.ts';
import '@/ai/flows/suggest-related-research.ts';
import '@/ai/flows/chat-assistant-flow.ts';
