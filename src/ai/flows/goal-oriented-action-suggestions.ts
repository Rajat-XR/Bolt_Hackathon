// Goal-oriented action suggestions
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
  prompt: `You are a personal development assistant. You will suggest personalized tasks or habits to the user based on their weak areas and values.

  The suggestions should be specific, measurable, achievable, relevant, and time-bound (SMART).

  Weak Areas: {{{weakAreas}}}
  User Values: {{{userValues}}}
  Social Score: {{{socialScore}}}
  Spiritual Score: {{{spiritualScore}}}
  Personal Score: {{{personalScore}}}
  Professional Score: {{{professionalScore}}}

  Suggest 3 actions the user can take to improve their weak areas.  Each should be no more than 20 words.
  `,
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
