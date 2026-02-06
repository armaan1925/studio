'use server';

import { suggestRelatedResearch, type SuggestRelatedResearchInput, type SuggestRelatedResearchOutput } from '@/ai/flows/suggest-related-research';

export async function getResearchSuggestions(input: SuggestRelatedResearchInput): Promise<{ success: boolean; data?: SuggestRelatedResearchOutput; error?: string }> {
  try {
    const result = await suggestRelatedResearch(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to get suggestions. Please try again.' };
  }
}
