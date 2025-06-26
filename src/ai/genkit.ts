import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY === 'your_api_key') {
    throw new Error('GOOGLE_API_KEY is not set. Please update the .env file with your Gemini API key.');
}

export const ai = genkit({
  plugins: [googleAI({apiKey: process.env.GOOGLE_API_KEY})],
  model: 'googleai/gemini-2.0-flash',
});
