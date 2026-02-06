'use server';
/**
 * @fileOverview This file defines a Genkit flow for summarizing drug information.
 *
 * - summarizeDrugInfo - A function that takes detailed drug information as input and returns a concise summary.
 * - SummarizeDrugInfoInput - The input type for the summarizeDrugInfo function.
 * - SummarizeDrugInfoOutput - The return type for the summarizeDrugInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDrugInfoInputSchema = z.object({
  drugName: z.string().describe('The name of the drug.'),
  formulation: z.string().describe('The formulation of the drug.'),
  strength: z.string().describe('The strength of the drug.'),
  uses: z.string().describe('Common uses of the drug.'),
  dosage: z.string().describe('Recommended dosage of the drug.'),
  contraindications: z.string().describe('Contraindications for the drug.'),
  warnings: z.string().describe('Important warnings related to the drug.'),
});
export type SummarizeDrugInfoInput = z.infer<typeof SummarizeDrugInfoInputSchema>;

const SummarizeDrugInfoOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the drug information.'),
});
export type SummarizeDrugInfoOutput = z.infer<typeof SummarizeDrugInfoOutputSchema>;

export async function summarizeDrugInfo(input: SummarizeDrugInfoInput): Promise<SummarizeDrugInfoOutput> {
  return summarizeDrugInfoFlow(input);
}

const summarizeDrugInfoPrompt = ai.definePrompt({
  name: 'summarizeDrugInfoPrompt',
  input: {schema: SummarizeDrugInfoInputSchema},
  output: {schema: SummarizeDrugInfoOutputSchema},
  prompt: `Summarize the key information about the drug, including its uses, dosage, contraindications, and warnings, in a concise manner.

Drug Name: {{{drugName}}}
Formulation: {{{formulation}}}
Strength: {{{strength}}}
Uses: {{{uses}}}
Dosage: {{{dosage}}}
Contraindications: {{{contraindications}}}
Warnings: {{{warnings}}}`,
});

const summarizeDrugInfoFlow = ai.defineFlow(
  {
    name: 'summarizeDrugInfoFlow',
    inputSchema: SummarizeDrugInfoInputSchema,
    outputSchema: SummarizeDrugInfoOutputSchema,
  },
  async input => {
    const {output} = await summarizeDrugInfoPrompt(input);
    return output!;
  }
);
