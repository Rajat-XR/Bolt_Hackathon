// use server'

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
  prompt: `You are an AI life coach that helps users design their life dashboard, by assessing their values, aspirations and concerns.

  Based on the user's input, generate baseline scores (1-100) for each of the following life domains: social, spiritual, personal and professional.
  Also, generate a personalized description of the user's life dashboard.

  User input: {{{userValues}}}

  Ensure the output is valid JSON, and return it.
  `,
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

