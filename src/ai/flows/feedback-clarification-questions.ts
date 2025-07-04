// This is an autogenerated file from Firebase Studio.

'use server';

/**
 * @fileOverview AI chatbot to ask follow-up questions for better assessing user input and enabling customized recurring reflection questions for daily/weekly check-ins.
 *
 * - getClarificationQuestions - A function that returns follow-up questions based on user input.
 * - GetClarificationQuestionsInput - The input type for the getClarificationQuestions function.
 * - GetClarificationQuestionsOutput - The return type for the getClarificationQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetClarificationQuestionsInputSchema = z.object({
  userInput: z.string().describe('The user input to generate follow-up questions for.'),
  context: z.string().optional().describe('Additional context to help generate relevant questions.'),
});
export type GetClarificationQuestionsInput = z.infer<
  typeof GetClarificationQuestionsInputSchema
>;

const GetClarificationQuestionsOutputSchema = z.object({
  questions: z
    .array(z.string())
    .describe('An array of follow-up questions to ask the user.'),
});
export type GetClarificationQuestionsOutput = z.infer<
  typeof GetClarificationQuestionsOutputSchema
>;

export async function getClarificationQuestions(
  input: GetClarificationQuestionsInput
): Promise<GetClarificationQuestionsOutput> {
  return getClarificationQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getClarificationQuestionsPrompt',
  input: {schema: GetClarificationQuestionsInputSchema},
  output: {schema: GetClarificationQuestionsOutputSchema},
  prompt: `You are an AI assistant designed to generate follow-up questions to better understand user input.

Given the user's input, generate a list of open-ended questions that help clarify their thoughts, feelings, or intentions. The questions should encourage detailed responses, focusing on extracting the user's core values, aspirations, and concerns.

Context: {{{context}}}

User Input: {{{userInput}}}

Your final output must be a valid JSON object containing a 'questions' key, which holds an array of strings.`,
});

const getClarificationQuestionsFlow = ai.defineFlow(
  {
    name: 'getClarificationQuestionsFlow',
    inputSchema: GetClarificationQuestionsInputSchema,
    outputSchema: GetClarificationQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
