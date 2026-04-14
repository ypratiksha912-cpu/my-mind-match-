"use server";

import { generateRecommendations, type GenerateRecommendationsInput, type GenerateRecommendationsOutput } from "@/ai/flows/generate-recommendations";
import { z } from "zod";

const FormSchema = z.object({
  moodArchetype: z.array(z.string()).min(1, "Please select at least one mood.").max(3, "You can select up to 3 moods."),
  preferredFormat: z.enum(['Book', 'Series', 'Movie']),
  realityPreference: z.enum(["Fiction", "Non-Fiction", "Documentary", "Animation"]),
  region: z.string().min(1, "Please select a region."),
  narrativeInput: z.string().min(10, "Please describe your situation or desired feeling.").max(280),
});

type GetRecommendationsResult = 
  | { success: true; data: GenerateRecommendationsOutput }
  | { success: false; error: string };

export async function getRecommendations(input: GenerateRecommendationsInput): Promise<GetRecommendationsResult> {
  try {
    const data = await generateRecommendations(input);
    return { success: true, data };
  } catch (e: any) {
    console.error(e);
    return {
      success: false,
      error: e.message || "An unexpected error occurred while generating recommendations.",
    };
  }
}
