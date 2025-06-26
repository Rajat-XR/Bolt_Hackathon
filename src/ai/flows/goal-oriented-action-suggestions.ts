'use server';
/**
 * @fileOverview An AI agent that suggests personalized tasks or habits based on identified weak areas in the dashboard.
 *
 * - suggestActions - A function that handles the action suggestion process.
 * - SuggestActionsInput - The input type for the suggestActions function.
 * - SuggestActionsOutput - The return type for the suggestActions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestActionsInputSchema = z.object({
  weakAreas: z
    .string()
    .describe(
      'A comma-separated list of weak areas identified in the user dashboard.'
    ),
  userValues: z
    .string()
    .describe('A comma-separated list of the users stated values.'),
  socialScore: z.number().describe('The users current social score.'),
  spiritualScore: z.number().describe('The users current spiritual score.'),
  personalScore: z.number().describe('The users current personal score.'),
  professionalScore: z
    .number()
    .describe('The users current professional score.'),
});
export type SuggestActionsInput = z.infer<typeof SuggestActionsInputSchema>;

const SuggestActionsOutputSchema = z.object({
  suggestedActions: z
    .array(z.string())
    .describe(
      'A list of suggested tasks or habits to improve the weak areas.'
    ),
});
export type SuggestActionsOutput = z.infer<typeof SuggestActionsOutputSchema>;

export async function suggestActions(
  input: SuggestActionsInput
): Promise<SuggestActionsOutput> {
  return suggestActionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestActionsPrompt',
  input: {schema: SuggestActionsInputSchema},
  output: {schema: SuggestActionsOutputSchema},
  prompt: `You are a personal development assistant. Your task is to suggest personalized, actionable tasks or habits based on the user's identified weak areas and stated values.

The suggestions should be concrete and follow the SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound) where possible.

Weak Areas: {{{weakAreas}}}
User Values: {{{userValues}}}
Social Score: {{{socialScore}}}
Spiritual Score: {{{spiritualScore}}}
Personal Score: {{{personalScore}}}
Professional Score: {{{professionalScore}}}

Suggest exactly 3 actionable items to help the user improve. Each action should be concise, ideally under 20 words.

Your final output must be a valid JSON object matching the requested schema.`,
});

const suggestActionsFlow = ai.defineFlow(
  {
    name: 'suggestActionsFlow',
    inputSchema: SuggestActionsInputSchema,
    outputSchema: SuggestActionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
