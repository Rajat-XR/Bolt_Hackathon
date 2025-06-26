'use server';

/**
 * @fileOverview A life design chat onboarding AI agent.
 *
 * - lifeDesignChatOnboarding - A function that handles the life design chat onboarding process.
 * - LifeDesignChatOnboardingInput - The input type for the lifeDesignChatOnboarding function.
 * - LifeDesignChatOnboardingOutput - The return type for the lifeDesignChatOnboarding function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LifeDesignChatOnboardingInputSchema = z.object({
  userValues: z
    .string()
    .describe('The user provided values, aspirations, and concerns.'),
});
export type LifeDesignChatOnboardingInput = z.infer<typeof LifeDesignChatOnboardingInputSchema>;

const LifeDesignChatOnboardingOutputSchema = z.object({
  socialScore: z.number().describe('The baseline score for the social domain.'),
  spiritualScore: z.number().describe('The baseline score for the spiritual domain.'),
  personalScore: z.number().describe('The baseline score for the personal domain.'),
  professionalScore: z.number().describe('The baseline score for the professional domain.'),
  dashboardDescription: z.string().describe('A personalized description of the life dashboard.'),
});
export type LifeDesignChatOnboardingOutput = z.infer<typeof LifeDesignChatOnboardingOutputSchema>;

export async function lifeDesignChatOnboarding(
  input: LifeDesignChatOnboardingInput
): Promise<LifeDesignChatOnboardingOutput> {
  return lifeDesignChatOnboardingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'lifeDesignChatOnboardingPrompt',
  input: {schema: LifeDesignChatOnboardingInputSchema},
  output: {schema: LifeDesignChatOnboardingOutputSchema},
  prompt: `You are an AI life coach. Your task is to help a user set up their personalized life dashboard by assessing their initial input about their values, aspirations, and concerns.

Based on the user's input below, generate baseline scores on a scale from 1 to 100 for each of the four life domains: social, spiritual, personal, and professional.
Also, create a short, personalized, and encouraging description for their new dashboard.

User input: {{{userValues}}}

Your final output must be a valid JSON object matching the requested schema. Do not add any extra commentary or text outside of the JSON object.`,
});

const lifeDesignChatOnboardingFlow = ai.defineFlow(
  {
    name: 'lifeDesignChatOnboardingFlow',
    inputSchema: LifeDesignChatOnboardingInputSchema,
    outputSchema: LifeDesignChatOnboardingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
