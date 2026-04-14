"use client";

import { useState } from 'react';
import { getDoc, doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useUser, useFirestore } from '@/firebase';
import { getRecommendations } from "@/app/actions";
import type { GenerateRecommendationsInput, GenerateRecommendationsOutput } from '@/ai/flows/generate-recommendations';
import { RecommendationForm } from '@/components/recommendation-form';
import { RecommendationResults } from '@/components/recommendation-results';
import { RecommendationSkeletons } from '@/components/recommendation-skeletons';
import { AdPlaceholder } from './ad-placeholder';
import { useToast } from '@/hooks/use-toast';

export function RecommendationFlow() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<GenerateRecommendationsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mood, setMood] = useState<string>('');
  
  const handleGetRecommendations = async (formData: GenerateRecommendationsInput) => {
    setIsSubmitting(true);
    setError(null);
    setResults(null);
    setMood(formData.moodArchetype.join(', '));
    
    const result = await getRecommendations(formData);

    if (result.success) {
      setResults(result.data);

      // Save to history if user is pro and logged in
      if (user && firestore) {
        const userRef = doc(firestore, "users", user.uid);
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists() && docSnap.data().subscriptionStatus === 'pro') {
            const historyCollection = collection(firestore, 'users', user.uid, 'recommendationHistory');
            // Do not await this, let it run in the background
            addDoc(historyCollection, {
              inputs: formData,
              outputs: result.data,
              createdAt: serverTimestamp(),
            });
          }
        } catch (e) {
          console.error("Could not save to history:", e);
          // Don't show a user-facing error for this background task.
        }
      }
    } else {
      setError(result.error);
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: result.error,
      });
    }
    
    setIsSubmitting(false);
  };

  const handleReset = () => {
    setResults(null);
    setError(null);
    setMood('');
  };

  if (isSubmitting) {
    return <RecommendationSkeletons />;
  }

  if (results) {
    return <RecommendationResults recommendations={results.recommendations} onReset={handleReset} mood={mood} />;
  }

  return (
    <div className="w-full">
      {error && <p className="text-destructive text-center mb-4 font-semibold bg-destructive/10 p-3 rounded-md">{error}</p>}
      <RecommendationForm 
        onSubmit={handleGetRecommendations} 
        isSubmitting={isSubmitting}
        isAuthLoading={isUserLoading}
      />
      <AdPlaceholder className="mt-8" />
    </div>
  );
}
