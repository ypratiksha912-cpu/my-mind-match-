'use client';

import { useEffect } from 'react';
import { RecommendationFlow } from '@/components/recommendation-flow';
import { MindMatchLogo } from '@/components/icons';
import { AuthButton } from '@/components/auth-button';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const { toast } = useToast();

  useEffect(() => {
    const shouldShowToast = localStorage.getItem('showUpdateToast');
    if (shouldShowToast === 'true') {
      toast({
        title: "Welcome Back!",
        description: "It's great to see you again. Ready to discover a new story based on your current vibe?",
        duration: 8000,
      });
      localStorage.removeItem('showUpdateToast');
    }
  }, [toast]);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className="relative flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <div className="mr-4 hidden md:flex">
              <a className="mr-6 flex items-center space-x-2" href="/">
                <MindMatchLogo className="h-6 w-6" />
                <span className="hidden font-bold sm:inline-block">
                  Mind Match
                </span>
              </a>
            </div>
            <div className="flex flex-1 items-center justify-end space-x-2">
                <AuthButton />
            </div>
          </div>
        </header>
        <main className="flex-1">
          <div className="container relative py-8 md:py-12">
            <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8">
              <div className="flex flex-col items-center space-y-4 text-center">
                <MindMatchLogo className="h-20 w-20" />
                <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                  The More You Search, The More You Find
                </h1>
                <p className="max-w-[700px] font-body text-lg text-muted-foreground sm:text-xl">
                  Discover books, movies, and series that resonate with your current mood and narrative.
                </p>
              </div>
              <RecommendationFlow />
            </div>
          </div>
        </main>
        <footer className="w-full p-6 text-center">
          <p className="text-muted-foreground">Discover your next favorite story.</p>
        </footer>
      </div>
    </div>
  );
}
