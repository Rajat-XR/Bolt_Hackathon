'use server';
/**
 * @fileOverview A conversational AI life coach that interacts with the user,
 * provides insights, updates dashboard scores, and suggests actions based on the conversation.
 * It uses a memory of past interactions to provide personalized responses.
 *
 * - conversationalChat - The main function to handle a user's chat message.
 * - ConversationalChatInput - The input type for the function.
 * - ConversationalChatOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConversationalChatInputSchema = z.object({
  message: z.string().describe("The user's message."),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).describe('The history of the conversation so far.'),
  scores: z.object({
    social: z.number(),
    personal: z.number(),
    professional: z.number(),
    spiritual: z.number(),
  }).describe("The user's current life dashboard scores."),
  userValues: z.string().describe("The user's stated values and aspirations."),
  memories: z.array(z.string()).describe('A list of long-term memories or key facts about the user.'),
});
export type ConversationalChatInput = z.infer<typeof ConversationalChatInputSchema>;

const ConversationalChatOutputSchema = z.object({
  response: z.string().describe("The AI's conversational response to the user."),
  scoreUpdates: z.object({
    social: z.number(),
    personal: z.number(),
    professional: z.number(),
    spiritual: z.number(),
  }).optional().describe('The updated scores if the conversation warranted a change.'),
  feedback: z.string().optional().describe('Feedback related to score updates.'),
  newActions: z.array(z.string()).optional().describe('A list of new suggested actions for the user.'),
  newMemory: z.string().optional().describe('A new memory to be saved based on the conversation.'),
});
export type ConversationalChatOutput = z.infer<typeof ConversationalChatOutputSchema>;


export async function conversationalChat(input: ConversationalChatInput): Promise<ConversationalChatOutput> {
  return conversationalChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'conversationalChatPrompt',
  input: {schema: ConversationalChatInputSchema},
  output: {schema: ConversationalChatOutputSchema},
  prompt: `You are LifeArchitect AI, a friendly, empathetic, and insightful personal life coach. Your purpose is to help the user design a more fulfilling life by chatting with them.

You have access to the user's past chat history, their core values, long-term memories, and current life dashboard scores. Use this information to provide personalized, context-aware, and meaningful responses.

Your tasks are:
1.  **Converse Naturally**: Engage in a supportive and natural conversation. Ask clarifying questions and show empathy.
2.  **Analyze and Update**: If the user's message contains a reflection on their day or activities (like a journal entry), analyze its impact on their life domains.
    - The domains are Social, Personal, Professional, and Spiritual. Scores are from 0-100.
    - If the entry is positive for a domain, increase the score by 1-5 points. If negative, decrease it. If neutral, keep it the same.
    - If you update scores, provide a brief, encouraging 'feedback' message explaining the change. The 'scoreUpdates' field in the output should contain the NEW scores. If you don't update scores, don't include the 'scoreUpdates' or 'feedback' fields.
3.  **Suggest Actions**: If the user seems stuck, expresses a desire for growth, or has a low score in an area, suggest 1-3 concrete, actionable tasks. Populate the 'newActions' array in the output.
4.  **Form Memories**: If the user shares a significant piece of information (a major life event, a new goal, a core belief), formulate a concise summary of it to be saved as a new memory. Populate the 'newMemory' field.
5.  **Always Respond**: You MUST provide a conversational 'response' to the user in every turn.

Here is the context:
- User's Stated Values: {{{userValues}}}
- Current Scores: Social: {{scores.social}}, Personal: {{scores.personal}}, Professional: {{scores.professional}}, Spiritual: {{scores.spiritual}}
- Long-term Memories:
{{#each memories}}
- {{this}}
{{/each}}

The conversation so far (last messages):
{{#each chatHistory}}
{{role}}: {{content}}
{{/each}}

User's new message:
{{message}}

Now, generate your response as a valid JSON object matching the required output schema.`,
});

const conversationalChatFlow = ai.defineFlow(
  {
    name: 'conversationalChatFlow',
    inputSchema: ConversationalChatInputSchema,
    outputSchema: ConversationalChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
