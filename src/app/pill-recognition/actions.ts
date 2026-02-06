'use server';
import { identifyPill, type IdentifyPillInput, type IdentifyPillOutput } from '@/ai/flows/identify-pill-flow';

export async function getPillInformation(input: IdentifyPillInput): Promise<{ success: boolean, data?: IdentifyPillOutput, error?: string }> {
  try {
    const result = await identifyPill(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to identify pill. The AI model may have had an issue. Please try again.' };
  }
}
