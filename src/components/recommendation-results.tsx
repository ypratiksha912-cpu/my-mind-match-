"use client";

import Image from "next/image";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Quote, Search } from "lucide-react";
import { AdPlaceholder } from "./ad-placeholder";

type Recommendation = {
  title: string;
  authorCreator: string;
  synopsis: string;
  recommendationWhy: string;
  takeaways: string[];
  posterUrl: string | null;
  amazonSearchUrl: string;
  availableOn?: string[];
};

interface RecommendationResultsProps {
  recommendations: Recommendation[];
  onReset?: () => void;
  mood: string;
}

const getSearchUrl = (platform: string, title: string, amazonUrl: string) => {
    const encodedTitle = encodeURIComponent(title);
    const platformKey = platform.toLowerCase().trim();

    // Use the pre-generated Amazon URL (which has affiliate tags) when available
    if (platformKey.includes('amazon') || platformKey.includes('prime')) {
        return amazonUrl;
    }

    switch (platformKey) {
        case 'disney+':
             return `https://www.disneyplus.com/search?q=${encodedTitle}`;
        case 'hulu':
             return `https://www.hulu.com/search?q=${encodedTitle}`;
        case 'netflix':
             return `https://www.netflix.com/search?q=${encodedTitle}`;
        case 'youtube':
             return `https://www.youtube.com/results?search_query=${encodedTitle}`;
        case 'rent/buy':
             return `https://www.google.com/search?q=${encodedTitle}+rent+or+buy`;
        default:
             // Fallback for any other platform name to a generic Google search
             return `https://www.google.com/search?q=${encodedTitle}+on+${encodeURIComponent(platform)}`;
    }
};


export function RecommendationResults({ recommendations, onReset, mood }: RecommendationResultsProps) {
  return (
    <div className="w-full space-y-8 animate-in fade-in-0 duration-1000">
      {onReset && (
        <div className="flex items-center justify-start">
            <Button variant="ghost" onClick={onReset}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Start Over
            </Button>
        </div>
      )}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((item, index) => {
          const fallbackImageUrl = `https://picsum.photos/seed/${mood}${index}/400/600`;

          return (
            <Card key={index} className="flex flex-col overflow-hidden transition-transform duration-300 ease-out hover:scale-105 hover:shadow-primary/20 hover:shadow-2xl">
              <CardHeader className="p-0">
                <div className="relative aspect-[2/3] w-full">
                  <Image
                    src={item.posterUrl || fallbackImageUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-6">
                <CardTitle className="font-headline text-2xl">{item.title}</CardTitle>
                <p className="text-muted-foreground">{item.authorCreator}</p>
              </CardContent>
              <CardFooter className="p-0">
                <Accordion type="single" collapsible className="w-full bg-background/50">
                  <AccordionItem value="item-1" className="border-t">
                    <AccordionTrigger className="px-6 text-sm font-semibold hover:no-underline">
                      Show Details
                    </AccordionTrigger>
                    <AccordionContent className="p-6 pt-0 space-y-4">
                      <div>
                        <h4 className="font-bold flex items-center gap-2 mb-2"><Quote className="h-4 w-4 text-primary" />Why it's for you</h4>
                        <p className="text-sm text-muted-foreground">{item.recommendationWhy}</p>
                      </div>
                      <div>
                        <h4 className="font-bold flex items-center gap-2 mb-2"><BookOpen className="h-4 w-4 text-primary" />Synopsis</h4>
                        <p className="text-sm text-muted-foreground">{item.synopsis}</p>
                      </div>
                      <div>
                        <h4 className="font-bold mb-2">Takeaways</h4>
                        <div className="flex flex-wrap gap-2">
                          {item.takeaways.map((tag, i) => (
                            <Badge key={i} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-bold mb-2 flex items-center gap-2"><Search className="h-4 w-4 text-primary" />Where to Find It</h4>
                        <div className="space-y-2">
                           {/* --- Permanent Amazon Button (Highlighted) --- */}
                            <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                                <a href={item.amazonSearchUrl} target="_blank" rel="noopener noreferrer">
                                    Search on Amazon
                                </a>
                            </Button>

                           {/* --- Other Streaming Services --- */}
                           {item.availableOn && item.availableOn
                              .filter(platform => !platform.toLowerCase().includes('amazon') && !platform.toLowerCase().includes('prime'))
                              .map((platform) => (
                                <Button asChild variant="outline" className="w-full" key={platform}>
                                  <a href={getSearchUrl(platform, item.title, item.amazonSearchUrl)} target="_blank" rel="noopener noreferrer">
                                    Search on {platform}
                                  </a>
                                </Button>
                           ))}
                        </div>
                      </div>

                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      <AdPlaceholder />
    </div>
  );
}
