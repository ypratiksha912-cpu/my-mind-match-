"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BrainCircuit, MountainSnow, Rocket, Wind, Book, Clapperboard, Tv, Sparkles, Heart, Smile, Eye, Theater, Film, Palette, BookOpen, Frown, Sunrise, HeartCrack, Globe, Popcorn, Swords, Flower2, Landmark } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

const FormSchema = z.object({
  moodArchetype: z.array(z.string()).min(1, { message: "Please select at least one vibe." }).max(3, { message: "You can select up to 3 vibes." }),
  preferredFormat: z.enum(["Book", "Series", "Movie"], { required_error: "Please select a format." }),
  realityPreference: z.enum(["Fiction", "Non-Fiction", "Documentary", "Animation"], { required_error: "Please select a preference." }),
  region: z.string({ required_error: "Please select a region." }),
  narrativeInput: z.string().min(10, "Please describe your situation or desired feeling in at least 10 characters.").max(280, "Your narrative must be 280 characters or less."),
});

type FormValues = z.infer<typeof FormSchema>;

const moods = [
  { id: "Adventure", label: "Adventure", icon: MountainSnow },
  { id: "Calm", label: "Calm", icon: Wind },
  { id: "Thoughtful", label: "Thoughtful", icon: BrainCircuit },
  { id: "Escapism", label: "Escapism", icon: Rocket },
  { id: "Romantic", label: "Romantic", icon: Heart },
  { id: "Humorous", label: "Humorous", icon: Smile },
  { id: "Suspenseful", label: "Suspenseful", icon: Eye },
  { id: "Dramatic", label: "Dramatic", icon: Theater },
  { id: "Sad", label: "Sad", icon: Frown },
  { id: "Hope", label: "Hope", icon: Sunrise },
  { id: "Broken", label: "Broken", icon: HeartCrack },
  { id: "Magical", label: "Magical", icon: Sparkles },
];

const formats = [
  { id: "Book", label: "Book", icon: Book },
  { id: "Movie", label: "Movie", icon: Clapperboard },
  { id: "Series", label: "Series", icon: Tv },
];

const realities = [
  { id: "Fiction", label: "Fiction", icon: Sparkles },
  { id: "Non-Fiction", label: "Non-Fiction", icon: BookOpen },
  { id: "Documentary", label: "Documentary", icon: Film },
  { id: "Animation", label: "Animation", icon: Palette },
];

const regions = [
    { id: "Any", label: "Any", icon: Globe },
    { id: "Anime", label: "Anime", icon: Sparkles },
    { id: "K-Drama", label: "K-Drama", icon: Heart },
    { id: "C-Drama", label: "C-Drama", icon: Swords },
    { id: "USA", label: "USA", icon: Popcorn },
    { id: "India", label: "India", icon: Film },
    { id: "Japan", label: "Japan", icon: Flower2 },
    { id: "Europe", label: "Europe", icon: Landmark },
];


interface RecommendationFormProps {
  onSubmit: (data: FormValues) => void;
  isSubmitting: boolean;
  isAuthLoading: boolean;
}

export function RecommendationForm({ onSubmit, isSubmitting, isAuthLoading }: RecommendationFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      moodArchetype: [],
      narrativeInput: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 ease-out">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">1. Choose Your Vibe (up to 3)</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="moodArchetype"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                      {moods.map((mood) => (
                        <button
                          key={mood.id}
                          type="button"
                          onClick={() => {
                            const currentVibes: string[] = field.value || [];
                            const isSelected = currentVibes.includes(mood.id);

                            if (isSelected) {
                              field.onChange(currentVibes.filter((v) => v !== mood.id));
                            } else {
                              if (currentVibes.length < 3) {
                                field.onChange([...currentVibes, mood.id]);
                              }
                            }
                          }}
                          className={cn(
                            "group rounded-lg border-2 p-4 text-center transition-all duration-200 hover:border-primary hover:shadow-lg",
                            field.value?.includes(mood.id) ? "border-primary bg-primary/10" : "border-border"
                          )}
                        >
                          <mood.icon className={cn("mx-auto h-10 w-10 transition-transform duration-200 group-hover:scale-110", field.value?.includes(mood.id) ? "text-primary" : "text-muted-foreground")} />
                          <p className="mt-2 font-medium">{mood.label}</p>
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage className="text-center"/>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">2. Select Your Medium</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="preferredFormat"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-3 gap-4">
                          {formats.map((format) => (
                             <FormItem key={format.id}>
                              <FormControl>
                                <RadioGroupItem value={format.id} className="sr-only" />
                              </FormControl>
                              <FormLabel className={cn(
                                "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer h-full",
                                field.value === format.id && "border-primary"
                              )}>
                                <format.icon className="mb-3 h-6 w-6" />
                                {format.label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">3. Pick a Genre</CardTitle>
              </CardHeader>
              <CardContent>
                 <FormField
                  control={form.control}
                  name="realityPreference"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-4">
                          {realities.map((reality) => (
                            <FormItem key={reality.id}>
                              <FormControl>
                                <RadioGroupItem value={reality.id} className="sr-only" />
                              </FormControl>
                              <FormLabel className={cn(
                                "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer h-full",
                                field.value === reality.id && "border-primary"
                              )}>
                                <reality.icon className="mb-3 h-6 w-6" />
                                {reality.label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">4. Choose a Region</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-4">
                      {regions.map((region) => (
                        <button
                          key={region.id}
                          type="button"
                          onClick={() => field.onChange(region.id)}
                          className={cn(
                            "group rounded-lg border-2 p-4 text-center transition-all duration-200 hover:border-primary hover:shadow-lg",
                            field.value === region.id ? "border-primary bg-primary/10" : "border-border"
                          )}
                        >
                          <region.icon className={cn("mx-auto h-10 w-10 transition-transform duration-200 group-hover:scale-110", field.value === region.id ? "text-primary" : "text-muted-foreground")} />
                          <p className="mt-2 font-medium">{region.label}</p>
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage className="text-center"/>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">5. Tell Your Story</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="narrativeInput"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Describe your current situation or what you hope to feel. (e.g., "Just finished a hard week and need to feel uplifted")</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Type your narrative here..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <div className="flex justify-center">
            <Button type="submit" size="lg" className="font-bold text-lg bg-accent hover:bg-accent/90" disabled={isSubmitting || isAuthLoading}>
                {isSubmitting ? "Generating..." : "Find My Vibe"}
            </Button>
        </div>
      </form>
    </Form>
  );
}
