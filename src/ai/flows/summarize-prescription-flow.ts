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

const MedicineInfoSchema = z.object({
    name: z.string().describe('The full name of the medicine, including strength (e.g., "Paracetamol 500mg").'),
    dosage: z.string().describe('The quantity to be taken at one time (e.g., "1 tablet", "10ml").'),
    frequency: z.string().describe('How often the medicine should be taken in plain terms (e.g., "twice daily", "every 8 hours").'),
    timing: z.array(z.string()).describe('A list of specific times of day to take the medicine (e.g., ["morning", "afternoon", "night"]). Infer this from the frequency.'),
    duration: z.string().describe('For how long the medicine should be taken (e.g., "for 5 days", "for 1 month").'),
    notes: z.string().describe('Any additional notes, such as "after food" or "as needed".')
});

const SummarizePrescriptionOutputSchema = z.object({
  patientName: z.string().describe('The name of the patient mentioned in the prescription.'),
  doctorName: z.string().describe('The name of the doctor who wrote the prescription.'),
  medicines: z.array(MedicineInfoSchema).describe('A structured list of all medicines found in the prescription.'),
  diagnosis: z.string().describe('The primary diagnosis or condition mentioned.'),
  precautions: z.array(z.string()).describe('A list of precautions or advice given.'),
  summary: z.string().describe('A simple, patient-friendly summary of the entire prescription in 2-4 lines.'),
});
export type SummarizePrescriptionOutput = z.infer<typeof SummarizePrescriptionOutputSchema>;
export type MedicineInfo = z.infer<typeof MedicineInfoSchema>;

export async function summarizePrescription(input: SummarizePrescriptionInput): Promise<SummarizePrescriptionOutput> {
  return summarizePrescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizePrescriptionPrompt',
  input: {schema: SummarizePrescriptionInputSchema},
  output: {schema: SummarizePrescriptionOutputSchema},
  prompt: `You are an AI medical scribe. Your task is to analyze an image of a medical prescription, extract key information, and present it in a simplified, structured JSON format. The target audience may not be medically literate, so explain everything in simple terms.

Prescription Image: {{media url=imageDataUri}}

Extract the following details:
- Patient's Name
- Doctor's Name
- A detailed list of all medicines. For each medicine, extract:
  - 'name': The full medicine name and strength (e.g., "Paracetamol 500mg").
  - 'dosage': The dose to be taken at one time (e.g., "1 tablet").
  - 'frequency': How often to take it (e.g., "twice daily").
  - 'timing': An array of inferred time slots like ["morning", "night"] based on frequency. For "thrice daily" use ["morning", "afternoon", "night"].
  - 'duration': How long to take the medicine (e.g., "for 5 days").
  - 'notes': Any other instructions like "after food" or "if needed".
- The primary diagnosis or main condition.
- Any precautions or general advice.
- A simple, easy-to-understand summary of the entire prescription.

If any information is not clearly visible, leave the corresponding field empty or as an empty array.

{{#if language}}
Translate the 'summary', 'diagnosis', 'precautions', and 'notes' fields into {{{language}}}. All other fields should remain in their original language.
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
