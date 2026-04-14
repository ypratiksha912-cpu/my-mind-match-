'use server';
/**
 * @fileOverview A Genkit flow for generating personalized media recommendations based on user mood, preferences, and narrative input.
 *
 * - generateRecommendations - A function that handles the media recommendation process.
 * - GenerateRecommendationsInput - The input type for the generateRecommendations function.
 * - GenerateRecommendationsOutput - The return type for the generateRecommendations function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateRecommendationsInputSchema = z.object({
  moodArchetype: z.array(z.string()).describe('A list of the user\'s selected mood archetypes (e.g., ["Adventure", "Calm"]).'),
  preferredFormat: z.enum(['Book', 'Series', 'Movie']).describe('The user\'s preferred media format.'),
  realityPreference: z.enum(["Fiction", "Non-Fiction", "Documentary", "Animation"]).describe('The user\'s preference for reality-based content.'),
  region: z.string().describe("The user's preferred region of origin for the media (e.g., K-Drama, USA, Japan)."),
  narrativeInput: z.string().max(280).describe('A brief personal situation or desired emotional outcome (up to 280 characters).'),
});
export type GenerateRecommendationsInput = z.infer<typeof GenerateRecommendationsInputSchema>;

// The AI is responsible for the creative text content.
const AIRecommendationSchema = z.object({
  title: z.string().describe('The title of the recommended media.'),
  authorCreator: z.string().describe('The author or creator of the recommended media.'),
  synopsis: z.string().describe('A detailed, attractive, and engaging synopsis of the media, written to entice the user. It should be more than just a summary; it should capture the tone and feel of the media.'),
  recommendationWhy: z.string().describe('An AI-generated summary of why this specific media matches the user\'s specific inputs.'),
  takeaways: z.array(z.string()).describe('Brief summaries of the media’s core themes or emotional aftertaste (e.g., "Life-affirming," "Bittersweet").'),
  availableOn: z.array(z.string()).describe('A list of streaming platforms where the media is available, such as "Netflix", "YouTube", "Prime Video", "Hulu". Use "Rent/Buy" as a fallback.'),
});

// The final schema includes the AI part + the programmatically added URLs
const MediaRecommendationSchema = AIRecommendationSchema.extend({
  posterUrl: z.string().url().nullable().describe("URL of the movie/series poster from OMDb."),
  amazonSearchUrl: z.string().url().describe("The programmatically generated Amazon search URL with affiliate tag."),
});

const GenerateRecommendationsOutputSchema = z.object({
  recommendations: z.array(MediaRecommendationSchema).describe('A list of personalized media recommendations.'),
});
export type GenerateRecommendationsOutput = z.infer<typeof GenerateRecommendationsOutputSchema>;

export async function generateRecommendations(input: GenerateRecommendationsInput): Promise<GenerateRecommendationsOutput> {
  return generateRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecommendationsPrompt',
  input: { schema: GenerateRecommendationsInputSchema },
  // Tell the AI to generate just the text fields.
  output: { schema: z.object({ recommendations: z.array(AIRecommendationSchema) }) },
  prompt: `You are an expert media recommendation engine. For every result you provide, you must follow these rules:
1. You MUST only recommend real, popular, and existing media. Do NOT invent or hallucinate media titles.
2. For each recommendation, you MUST provide a detailed and attractive synopsis. This should be more than just a summary; it should be written in an engaging and enticing way that captures the tone and feel of the media.
3. For each recommendation, you MUST identify and list multiple, diverse streaming services where it is available (e.g., "Netflix", "Prime Video", "YouTube", "Hulu"). Be comprehensive. If it's not on a major streaming service, list "Rent/Buy" as an option.
4. Provide all output in the requested JSON format.

The user has provided the following information:
- Mood Archetypes: "{{{moodArchetype}}}"
- Preferred Format: "{{{preferredFormat}}}"
- Genre Preference: "{{{realityPreference}}}"
- Region of Origin: "{{{region}}}"
- Personal Narrative: "{{{narrativeInput}}}"

Based on this, generate a list of 6 personalized media recommendations that strictly adhere to all rules above.`,
});

async function getPosterUrl(title: string): Promise<string | null> {
  const apiKey = "130db243";
  if (!apiKey) {
    console.warn("OMDB_API_KEY is not set. Skipping poster fetch.");
    return null;
  }
  try {
    const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`);
    const data = await response.json();
    if (data.Response === "True" && data.Poster && data.Poster !== "N/A") {
      return data.Poster;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch poster from OMDb:", error);
    return null;
  }
}

const generateRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateRecommendationsFlow',
    inputSchema: GenerateRecommendationsInputSchema,
    outputSchema: GenerateRecommendationsOutputSchema,
  },
  async (input) => {
    // 1. Get the creative content from the AI.
    const { output: aiOutput } = await prompt(input);
    if (!aiOutput || !aiOutput.recommendations) {
        throw new Error("AI failed to generate recommendations.");
    }
    
    const affiliateTag = "mindmatch0f-21";

    // 2. Process each recommendation to programmatically add the poster and Amazon search URLs.
    const processedRecommendations = await Promise.all(
        aiOutput.recommendations.map(async (rec) => {
            const posterUrl = await getPosterUrl(rec.title);
            
            const amazonUrl = new URL('https://www.amazon.com/s');
            amazonUrl.searchParams.set('k', rec.title);

            if (input.preferredFormat !== 'Book') {
                amazonUrl.searchParams.set('i', 'instant-video');
            }

            if (affiliateTag && affiliateTag !== 'YOUR_AMAZON_TAG_HERE') {
                amazonUrl.searchParams.set('tag', affiliateTag);
            }
            
            return {
                ...rec,
                posterUrl,
                amazonSearchUrl: amazonUrl.toString(),
            };
        })
    );

    return { recommendations: processedRecommendations };
  },
);
