'use server';

/**
 * @fileOverview Suggests related research papers and mentors based on the user's research upload and interests.
 *
 * - suggestRelatedResearch - A function that handles the suggestion of related research papers and mentors.
 * - SuggestRelatedResearchInput - The input type for the suggestRelatedResearch function.
 * - SuggestRelatedResearchOutput - The return type for the suggestRelatedResearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelatedResearchInputSchema = z.object({
  researchPaperAbstract: z
    .string()
    .describe('The abstract of the research paper uploaded by the user.'),
  userInterests: z.string().describe('The stated research interests of the user.'),
});
export type SuggestRelatedResearchInput = z.infer<
  typeof SuggestRelatedResearchInputSchema
>;

const SuggestRelatedResearchOutputSchema = z.object({
  relatedResearchPapers: z
    .array(z.string())
    .describe('A list of titles of related research papers.'),
  suggestedMentors: z
    .array(z.string())
    .describe('A list of names of suggested mentors.'),
});
export type SuggestRelatedResearchOutput = z.infer<
  typeof SuggestRelatedResearchOutputSchema
>;

export async function suggestRelatedResearch(
  input: SuggestRelatedResearchInput
): Promise<SuggestRelatedResearchOutput> {
  return suggestRelatedResearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelatedResearchPrompt',
  input: {schema: SuggestRelatedResearchInputSchema},
  output: {schema: SuggestRelatedResearchOutputSchema},
  prompt: `You are an AI assistant designed to suggest related research papers and mentors to pharmacy students and professionals.

  Based on the research paper abstract and the user's interests, provide a list of related research paper titles and suggested mentors.

  Research Paper Abstract: {{{researchPaperAbstract}}}
  User Interests: {{{userInterests}}}

  Please provide the output in the following format:
  {
    "relatedResearchPapers": ["Paper Title 1", "Paper Title 2"],
    "suggestedMentors": ["Mentor Name 1", "Mentor Name 2"]
  }`,
});

const suggestRelatedResearchFlow = ai.defineFlow(
  {
    name: 'suggestRelatedResearchFlow',
    inputSchema: SuggestRelatedResearchInputSchema,
    outputSchema: SuggestRelatedResearchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
