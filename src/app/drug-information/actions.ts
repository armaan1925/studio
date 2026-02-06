'use server';
import { summarizeDrugInfo, type SummarizeDrugInfoInput, type SummarizeDrugInfoOutput } from '@/ai/flows/summarize-drug-info';

export async function getDrugSummary(input: SummarizeDrugInfoInput): Promise<{ success: boolean, data?: SummarizeDrugInfoOutput, error?: string }> {
  try {
    const result = await summarizeDrugInfo(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate summary. Please try again.' };
  }
}
