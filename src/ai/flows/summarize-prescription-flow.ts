'use server';

/**
 * @fileOverview Summarizes a medical prescription from an image.
 *
 * - summarizePrescription - A function that handles the prescription summarization process.
 * - SummarizePrescriptionInput - The input type for the summarizePrescription function.
 * - SummarizePrescriptionOutput - The return type for the summarizePrescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizePrescriptionInputSchema = z.object({
  imageDataUri: z.string().describe("A data URI of an image of a medical prescription. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  language: z.string().optional().describe('The language to translate the summary into (e.g., "Hindi", "Spanish").'),
});
export type SummarizePrescriptionInput = z.infer<typeof SummarizePrescriptionInputSchema>;

const SummarizePrescriptionOutputSchema = z.object({
  patientName: z.string().describe('The name of the patient mentioned in the prescription.'),
  doctorName: z.string().describe('The name of the doctor who wrote the prescription.'),
  medicines: z.array(z.string()).describe('A list of medicines prescribed, including strength and frequency if available (e.g., "Paracetamol 500mg - twice daily").'),
  dosageInstructions: z.array(z.string()).describe('Specific instructions on how and when to take the medicines.'),
  diagnosis: z.string().describe('The primary diagnosis or condition mentioned.'),
  precautions: z.array(z.string()).describe('A list of precautions or advice given.'),
  summary: z.string().describe('A simple, patient-friendly summary of the entire prescription in 2-4 lines.'),
});
export type SummarizePrescriptionOutput = z.infer<typeof SummarizePrescriptionOutputSchema>;

export async function summarizePrescription(input: SummarizePrescriptionInput): Promise<SummarizePrescriptionOutput> {
  return summarizePrescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizePrescriptionPrompt',
  input: {schema: SummarizePrescriptionInputSchema},
  output: {schema: SummarizePrescriptionOutputSchema},
  prompt: `You are an AI medical scribe. Your task is to analyze an image of a medical prescription, extract key information, and present it in a simplified, structured format. The target audience may not be medically literate, so explain everything in simple terms.

Prescription Image: {{media url=imageDataUri}}

Extract the following details:
- Patient's Name
- Doctor's Name
- List of all medicines with strength and frequency (e.g., "Paracetamol 500mg - twice daily").
- Specific dosage instructions (e.g., "After food", "For 5 days").
- The diagnosis or main condition.
- Any precautions or general advice.
- A simple, easy-to-understand summary of the prescription.

If any information is not clearly visible, leave the corresponding field empty.

{{#if language}}
Translate the 'summary', 'diagnosis', 'precautions', and 'dosageInstructions' fields into {{{language}}}. All other fields should remain in their original language.
{{/if}}
`,
});

const summarizePrescriptionFlow = ai.defineFlow(
  {
    name: 'summarizePrescriptionFlow',
    inputSchema: SummarizePrescriptionInputSchema,
    outputSchema: SummarizePrescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
