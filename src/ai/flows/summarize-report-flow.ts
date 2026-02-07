'use server';

/**
 * @fileOverview Analyzes a medical report image and provides a simple, structured summary.
 *
 * - summarizeMedicalReport - A function that handles the medical report analysis process.
 * - SummarizeReportInput - The input type for the flow.
 * - SummarizeReportOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { AbnormalFindingSchema, SummarizeReportOutputSchema } from '@/ai/schemas';

const SummarizeReportInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A data URI of an image of a medical report. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  language: z
    .string()
    .optional()
    .describe('The language for the response (e.g., "Hindi", "English").'),
});
export type SummarizeReportInput = z.infer<typeof SummarizeReportInputSchema>;

export type SummarizeReportOutput = z.infer<typeof SummarizeReportOutputSchema>;
export type AbnormalFinding = z.infer<typeof AbnormalFindingSchema>;


export async function summarizeMedicalReport(
  input: SummarizeReportInput
): Promise<SummarizeReportOutput> {
  return summarizeReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeReportPrompt',
  input: { schema: SummarizeReportInputSchema },
  output: { schema: SummarizeReportOutputSchema },
  prompt: `You are an advanced Medical Report AI Engine. Your task is to analyze the provided medical report image, extract key information, and present it in a simplified, structured JSON format for a non-medical user.

Report Image: {{media url=imageDataUri}}

**CRITICAL INSTRUCTIONS:**
1.  **Detect Report**: First, determine if the image is a medical report. If not, set 'isReportDetected' to false and provide a helpful 'summaryShort' like "This does not appear to be a medical report. Please upload a clear report image."
2.  **One-Line Summary (summaryShort)**: This is the MOST IMPORTANT field. Generate ONE ultra-simple sentence (max 18 words) that states the main finding.
    *   GOOD Examples: "Your blood sugar is higher than normal and needs monitoring." or "Your report is mostly normal with no serious problems detected." or "Your hemoglobin is low, which may indicate mild anemia."
    *   BAD Example: "The complete blood count (CBC) test revealed a hemoglobin level of 10.5 g/dL, which is below the reference range of 12.0-15.5 g/dL, suggesting potential anemic conditions that require further investigation by a healthcare professional."
3.  **Abnormal Findings**: Identify all values outside the normal range. For each, provide the test name, its value, the normal range, and a simple one-sentence interpretation.
4.  **Simplicity**: Use simple, non-technical language throughout. The target audience is a user with no medical background.
5.  **Safety**: Do NOT provide a definitive diagnosis. Use cautious language like "may indicate" or "suggests". The primary goal is to inform and guide the user to consult a professional.
6.  **Language**: {{#if language}}Translate all user-facing text fields ('summaryShort', 'summaryDetailed', 'interpretation', 'doctorRemarks', 'nextSteps') into {{{language}}}.{{/if}}

If any information is unclear or not present, leave the field empty or use a reasonable default (e.g., riskLevel: 'unknown').
`,
});

const summarizeReportFlow = ai.defineFlow(
  {
    name: 'summarizeReportFlow',
    inputSchema: SummarizeReportInputSchema,
    outputSchema: SummarizeReportOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
