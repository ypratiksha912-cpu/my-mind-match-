'use client';

import { useMemo } from 'react';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { RecommendationResults } from '@/components/recommendation-results';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { MindMatchLogo } from '@/components/icons';
import { format } from 'date-fns';
import Link from 'next/link';

type RecommendationHistoryItem = {
  id: string;
  inputs: any;
  outputs: any;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  } | null;
};

function HistoryItem({ item }: { item: RecommendationHistoryItem }) {
  const date = item.createdAt ? new Date(item.createdAt.seconds * 1000) : new Date();
  const mood = item.inputs?.moodArchetype || 'your vibe';

  return (
    <AccordionItem value={item.id}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex flex-col text-left">
          <span>Recommendations for "{mood}"</span>
          <span className="text-sm text-muted-foreground">
            {format(date, "MMMM d, yyyy 'at' h:mm a")}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 bg-background/20">
        <RecommendationResults
          recommendations={item.outputs.recommendations}
          mood={mood}
        />
      </AccordionContent>
    </AccordionItem>
  );
}


export default function HistoryPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  
  const historyQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'recommendationHistory'), orderBy('createdAt', 'desc'));
  }, [user, firestore]);

  const { data: historyItems, isLoading, error } = useCollection<RecommendationHistoryItem>(historyQuery);

  if (isUserLoading || (isLoading && !historyItems)) {
    return (
      <div className="min-h-screen bg-background font-sans text-foreground">
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between">
                <div className="mr-4 flex">
                <Link className="mr-6 flex items-center space-x-2" href="/">
                    <MindMatchLogo className="h-6 w-6" />
                    <span className="hidden font-bold sm:inline-block">
                    Mind Match
                    </span>
                </Link>
                </div>
            </div>
        </header>
        <div className="container mx-auto max-w-5xl py-8">
            <h1 className="font-headline text-4xl mb-8">Recommendation History</h1>
            <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center">
        <h1 className="font-headline text-4xl mb-4">Recommendation History</h1>
        <p className="text-muted-foreground mb-4">You must be logged in to view your history.</p>
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
       <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between">
            <div className="mr-4 flex">
              <Link className="mr-6 flex items-center space-x-2" href="/">
                <MindMatchLogo className="h-6 w-6" />
                <span className="hidden font-bold sm:inline-block">
                  Mind Match
                </span>
              </Link>
            </div>
            <Link href="/" passHref>
                <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </header>
        <main className="flex-1">
             <div className="container relative py-8 md:py-12">
                 <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8">
                    <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                        Your Recommendation History
                    </h1>
                     {error && <p className="text-destructive">Error loading history: {error.message}</p>}

                     {historyItems && historyItems.length > 0 ? (
                        <Card className="w-full">
                            <CardContent className="p-0">
                                <Accordion type="single" collapsible className="w-full">
                                    {historyItems.map(item => <HistoryItem key={item.id} item={item} />)}
                                </Accordion>
                            </CardContent>
                        </Card>
                     ) : (
                        !isLoading && (
                            <div className="text-center py-16">
                                <p className="text-muted-foreground text-lg">You don't have any saved recommendations yet.</p>
                                <Button asChild className="mt-4">
                                    <Link href="/">Find Your Vibe</Link>
                                </Button>
                            </div>
                        )
                     )}
                 </div>
             </div>
        </main>
    </div>
  );
}
