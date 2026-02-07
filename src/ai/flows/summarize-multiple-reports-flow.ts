'use server';
/**
 * @fileOverview Generates a combined health summary from multiple medical reports.
 *
 * - summarizeMultipleReports - Generates a concise summary.
 * - SummarizeMultipleReportsInput - The input type for the flow.
 * - SummarizeMultipleReportsOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { SummarizeReportOutput } from './summarize-report-flow';


// We don't export the Zod schema directly for 'use server' files.
const SummarizeMultipleReportsInputSchema = z.object({
    reports: z.array(z.any()).describe("An array of medical report summary objects."),
});
export type SummarizeMultipleReportsInput = {
    reports: SummarizeReportOutput[];
}

const SummarizeMultipleReportsOutputSchema = z.object({
  combinedSummary: z.string().describe("A 2-3 sentence combined summary of the user's health status based on all provided reports. It should be written in simple, non-medical language."),
});
export type SummarizeMultipleReportsOutput = z.infer<typeof SummarizeMultipleReportsOutputSchema>;


export async function summarizeMultipleReports(input: SummarizeMultipleReportsInput): Promise<SummarizeMultipleReportsOutput> {
    return summarizeMultipleReportsFlow(input);
}

const prompt = ai.definePrompt({
    name: 'summarizeMultipleReportsPrompt',
    input: { schema: SummarizeMultipleReportsInputSchema },
    output: { schema: SummarizeMultipleReportsOutputSchema },
    prompt: `You are a medical AI assistant. Your task is to create a single, concise (2-3 sentences) health summary for a user based on a series of their past medical reports. The summary should be easy to understand for a non-medical person.

Look for trends, recurring issues, and the overall health trajectory.

For example, if one report showed high blood sugar and a later one showed it was normal, you can mention the improvement.

Use simple and encouraging language.

Here are the user's reports (in JSON format):
{{{json reports}}}

Generate a combined summary based on these reports.
`,
});

const summarizeMultipleReportsFlow = ai.defineFlow(
    {
        name: 'summarizeMultipleReportsFlow',
        inputSchema: SummarizeMultipleReportsInputSchema,
        outputSchema: SummarizeMultipleReportsOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
