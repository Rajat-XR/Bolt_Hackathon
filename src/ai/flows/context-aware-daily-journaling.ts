'use server';
/**
 * @fileOverview Parses daily journal entries to identify relevant actions/events and update dashboard scores.
 *
 * - parseJournalEntry - A function that handles the parsing of a journal entry and updating dashboard scores.
 * - ParseJournalEntryInput - The input type for the parseJournalEntry function.
 * - ParseJournalEntryOutput - The return type for the parseJournalEntry function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParseJournalEntryInputSchema = z.object({
  journalEntry: z
    .string()
    .describe('The user journal entry to be parsed.'),
  socialScore: z.number().describe('The current social score.'),
  spiritualScore: z.number().describe('The current spiritual score.'),
  personalScore: z.number().describe('The current personal score.'),
  professionalScore: z.number().describe('The current professional score.'),
});
export type ParseJournalEntryInput = z.infer<typeof ParseJournalEntryInputSchema>;

const ParseJournalEntryOutputSchema = z.object({
  updatedSocialScore: z.number().describe('The updated social score.'),
  updatedSpiritualScore: z.number().describe('The updated spiritual score.'),
  updatedPersonalScore: z.number().describe('The updated personal score.'),
  updatedProfessionalScore: z.number().describe('The updated professional score.'),
  feedback: z.string().describe('Feedback based on the journal entry.'),
});
export type ParseJournalEntryOutput = z.infer<typeof ParseJournalEntryOutputSchema>;

export async function parseJournalEntry(input: ParseJournalEntryInput): Promise<ParseJournalEntryOutput> {
  return parseJournalEntryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseJournalEntryPrompt',
  input: {schema: ParseJournalEntryInputSchema},
  output: {schema: ParseJournalEntryOutputSchema},
  prompt: `You are an AI assistant designed to parse user journal entries and update their life dashboard scores.

Analyze the user's journal entry and determine its impact on their social, spiritual, personal, and professional scores. Scores are on a scale of 0-100.
- If the entry reflects positive progress, increase the score.
- If it reflects a setback or neglect, decrease the score.
- If neutral or irrelevant, keep the score the same.
The change should be between 1 and 5 points.

Journal Entry: {{{journalEntry}}}

Current Scores:
- Social: {{{socialScore}}}
- Spiritual: {{{spiritualScore}}}
- Personal: {{{personalScore}}}
- Professional: {{{professionalScore}}}

Based on your analysis, calculate the new scores for each domain. Also, provide brief, encouraging, and constructive feedback for the user based on their entry.

Your final output must be a valid JSON object matching the requested schema.`,
});

const parseJournalEntryFlow = ai.defineFlow(
  {
    name: 'parseJournalEntryFlow',
    inputSchema: ParseJournalEntryInputSchema,
    outputSchema: ParseJournalEntryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
