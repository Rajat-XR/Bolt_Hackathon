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

  Based on the user's journal entry, analyze the content and determine how it impacts their social, spiritual, personal, and professional scores.

  Journal Entry: {{{journalEntry}}}

  Current Scores:
  - Social: {{{socialScore}}}
  - Spiritual: {{{spiritualScore}}}
  - Personal: {{{personalScore}}}
  - Professional: {{{professionalScore}}}

  Update the scores accordingly, providing a rationale for each change, and return any feedback to the user.
`,
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
