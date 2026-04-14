'use server';
/**
 * @fileOverview A Genkit flow for generating explanations of why a specific media item was recommended to a user.
 *
 * - explainRecommendation - A function that generates an AI-powered explanation for a media recommendation.
 * - ExplainRecommendationInput - The input type for the explainRecommendation function.
 * - ExplainRecommendationOutput - The return type for the explainRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainRecommendationInputSchema = z.object({
  moodArchetype: z.string().describe('The user\'s selected mood archetype (e.g., "Adventure", "Calm", "Thoughtful", "Escapism").'),
  mediaFormat: z.string().describe('The user\'s preferred media format (e.g., "Book", "Series", "Movie").'),
  realityPreference: z.string().describe('The user\'s preference for reality-based content ("Fiction" or "Based on a Real Story").'),
  narrativeInput: z.string().describe('A brief description of the user\'s current personal situation or what they hope to feel.'),
  mediaTitle: z.string().describe('The title of the recommended media item.'),
  mediaAuthorCreator: z.string().describe('The author or creator of the recommended media item.'),
  mediaSynopsis: z.string().describe('A synopsis or overview of the recommended media item.'),
});
export type ExplainRecommendationInput = z.infer<typeof ExplainRecommendationInputSchema>;

const ExplainRecommendationOutputSchema = z.string().describe('An AI-generated explanation of why the media item was recommended based on the user\'s inputs.');
export type ExplainRecommendationOutput = z.infer<typeof ExplainRecommendationOutputSchema>;

export async function explainRecommendation(input: ExplainRecommendationInput): Promise<ExplainRecommendationOutput> {
  return explainRecommendationFlow(input);
}

const explainRecommendationPrompt = ai.definePrompt({
  name: 'explainRecommendationPrompt',
  input: {schema: ExplainRecommendationInputSchema},
  output: {schema: ExplainRecommendationOutputSchema},
  prompt: `You are an expert media recommender. Your task is to explain why a specific media item is a good match for a user's stated preferences and personal narrative.\n\nUser Preferences:\nMood Archetype: {{{moodArchetype}}}\nPreferred Format: {{{mediaFormat}}}\nReality Preference: {{{realityPreference}}}\nPersonal Narrative/Desired Feeling: "{{{narrativeInput}}}"\n\nRecommended Media Item:\nTitle: {{{mediaTitle}}}\nAuthor/Creator: {{{mediaAuthorCreator}}}\nSynopsis: """{{{mediaSynopsis}}}"""\n\nBased on the user's inputs and the media item's details, provide a concise explanation (2-3 sentences) of why this particular item was recommended to the user. Highlight the key connections between their preferences and the media item's themes or content.`,
});

const explainRecommendationFlow = ai.defineFlow(
  {
    name: 'explainRecommendationFlow',
    inputSchema: ExplainRecommendationInputSchema,
    outputSchema: ExplainRecommendationOutputSchema,
  },
  async (input) => {
    const {output} = await explainRecommendationPrompt(input);
    return output!;
  }
);
