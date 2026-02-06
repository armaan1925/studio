'use server';

/**
 * @fileOverview Identifies a medicine from an image and provides detailed information.
 *
 * - identifyPill - A function that handles the pill identification process.
 * - IdentifyPillInput - The input type for the identifyPill function.
 * - IdentifyPillOutput - The return type for the identifyPill function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyPillInputSchema = z.object({
  imageDataUri: z.string().describe("A data URI of an image of a pill. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type IdentifyPillInput = z.infer<typeof IdentifyPillInputSchema>;

const IdentifyPillOutputSchema = z.object({
  medicineName: z.string().describe('Provide corrected full medicine name'),
  brand: z.string().describe('The brand name of the medicine, if available.'),
  genericName: z.string().describe('Provide generic drug name'),
  medicineType: z.string().describe('Example: Tablet, Capsule, Syrup, Injection, etc.'),
  drugClass: z.string().describe('Example: Antibiotic, Painkiller, Antacid, Antihistamine, etc.'),
  prescriptionRequired: z.boolean().describe('Whether a prescription is required for this medicine.'),
  confidence: z.string().describe("The AI model's confidence in the identification, as a percentage. e.g., '95%'"),
  uses: z.string().describe('Explain what conditions it treats'),
  howItWorks: z.string().describe('Simple explanation'),
  safeUseInstructions: z.string().describe('General safe usage guidance'),
  commonSideEffects: z.string().describe('List common side effects'),
  seriousSideEffects: z.string().describe('List serious side effects'),
  warnings: z.string().describe('Who should avoid it, pregnancy warning, interaction warnings'),
  whenToConsultDoctor: z.string().describe('Clear situations when doctor consultation is needed'),
  summary: z.string().describe('Simple patient-friendly summary in 2–3 lines'),
});
export type IdentifyPillOutput = z.infer<typeof IdentifyPillOutputSchema>;


export async function identifyPill(input: IdentifyPillInput): Promise<IdentifyPillOutput> {
  return identifyPillFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyPillPrompt',
  input: {schema: IdentifyPillInputSchema},
  output: {schema: IdentifyPillOutputSchema},
  prompt: `You are a professional medical AI assistant specialized in medicine identification and safety.

Your job is to analyze the medicine from the provided image, identify the medicine name from any text visible on it (OCR), and provide accurate, safe, and structured information. If text is not clearly visible, identify the medicine based on its appearance (color, shape, scoring).

Image of the pill: {{media url=imageDataUri}}

If you cannot identify a medicine from the image, respond with an appropriate error message in the summary field and leave other fields empty.

OUTPUT FORMAT (STRICT):

MEDICINE NAME:
Provide corrected full medicine name

BRAND NAME:
Provide the brand name of the medicine, if available.

GENERIC NAME:
Provide generic drug name

MEDICINE TYPE:
Example: Tablet, Capsule, Syrup, Injection, etc.

DRUG CLASS:
Example: Antibiotic, Painkiller, Antacid, Antihistamine, etc.

PRESCRIPTION REQUIRED:
Return true if a prescription is required, false otherwise.

AI CONFIDENCE:
Provide your confidence level in this identification as a percentage string (e.g. "95%").

USES:
Explain what conditions it treats

HOW IT WORKS:
Simple explanation

SAFE USE INSTRUCTIONS:
General safe usage guidance

COMMON SIDE EFFECTS:
List common side effects

SERIOUS SIDE EFFECTS:
List serious side effects

WARNINGS:
Who should avoid it
Pregnancy warning if applicable
Interaction warnings if applicable

WHEN TO CONSULT DOCTOR:
Clear situations when doctor consultation is needed

SUMMARY:
Provide simple patient-friendly summary in 2–3 lines
`,
});


const identifyPillFlow = ai.defineFlow(
  {
    name: 'identifyPillFlow',
    inputSchema: IdentifyPillInputSchema,
    outputSchema: IdentifyPillOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
