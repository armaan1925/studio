'use server';
/**
 * @fileOverview Generates personalized daily health insights for the user.
 *
 * - generateDailyInsights - Generates health tips and a medical history summary.
 * - DailyInsightsInput - The input type for the flow.
 * - DailyInsightsOutput - The return type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const DailyInsightsInputSchema = z.object({
  userProfile: z.object({
    name: z.string(),
    age: z.number(),
    allergies: z.array(z.string()),
    medicalConditions: z.array(z.string()),
  }),
  language: z.string().optional().describe('The language for the response (e.g., "Hindi", "English").'),
});
export type DailyInsightsInput = z.infer<typeof DailyInsightsInputSchema>;

export const DailyInsightsOutputSchema = z.object({
  tips: z.array(z.string()).describe('A list of 2-3 short, personalized daily health tips.'),
  historySummary: z.string().describe('A 1-2 sentence summary of the user\'s key medical history points.'),
});
export type DailyInsightsOutput = z.infer<typeof DailyInsightsOutputSchema>;

export async function generateDailyInsights(input: DailyInsightsInput): Promise<DailyInsightsOutput> {
  return generateDailyInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDailyInsightsPrompt',
  input: {schema: DailyInsightsInputSchema},
  output: {schema: DailyInsightsOutputSchema},
  prompt: `You are a medical AI assistant. Your task is to generate personalized daily health tips and a brief medical history summary based on the provided user profile. The tone should be friendly, supportive, and easy to understand for a non-medical audience. Keep tips practical, safe, and concise.

User Profile:
- Name: {{{userProfile.name}}}
- Age: {{{userProfile.age}}}
- Known Allergies: {{#each userProfile.allergies}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Existing Medical Conditions: {{#each userProfile.medicalConditions}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Based on this profile, generate:
1.  **Daily Tips**: 2-3 actionable health tips for today. Consider their conditions and allergies. For example, if they have asthma, suggest checking air quality. If they have allergies, remind them to be cautious.
2.  **History Summary**: A 1-2 sentence summary of their key health points (e.g., "You have a history of [condition] and are allergic to [allergy].").

{{#if language}}
IMPORTANT: The entire response (tips and summary) MUST be in the {{{language}}} language.
{{/if}}

Please provide the output in the specified JSON format.
`,
});

const generateDailyInsightsFlow = ai.defineFlow(
  {
    name: 'generateDailyInsightsFlow',
    inputSchema: DailyInsightsInputSchema,
    outputSchema: DailyInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
