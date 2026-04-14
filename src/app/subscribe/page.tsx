'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { MindMatchLogo } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';

export default function SubscribePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<{ subscriptionStatus?: string }>(userProfileRef);

  const handleUpgrade = async () => {
    if (!user || !firestore) return;
    setIsUpgrading(true);

    const userRef = doc(firestore, 'users', user.uid);
    try {
      // In a real app, you would trigger a payment flow (e.g., Stripe Checkout)
      // and only update the status upon successful payment via a secure backend webhook.
      // For this demo, we update it directly.
      await setDoc(userRef, { subscriptionStatus: 'pro' }, { merge: true });
      toast({
        title: 'Upgrade Successful!',
        description: 'Welcome to Pro! You now have an ad-free experience.',
      });
      router.push('/');
    } catch (error: any) {
      console.error("Upgrade failed:", error);
      toast({
        variant: 'destructive',
        title: 'Upgrade Failed',
        description: error.message || 'Could not upgrade your subscription. Please try again.',
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  if (isUserLoading || isProfileLoading) {
    return <div className="flex min-h-screen items-center justify-center"><Skeleton className="h-96 w-full max-w-md" /></div>;
  }

  if (!user) {
    router.replace('/login');
    return null;
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
            </div>
        </header>
        <main className="container flex items-center justify-center py-16 md:py-24">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <Star className="mx-auto h-12 w-12 text-yellow-400" />
                    <CardTitle className="font-headline text-3xl mt-4">Mind Match Pro</CardTitle>
                    <CardDescription>Unlock premium features and support the platform.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-center text-4xl font-bold">$10<span className="text-lg font-normal text-muted-foreground">/year</span></p>
                    <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-center">
                            <Check className="h-5 w-5 text-primary mr-3" />
                            <span>Ad-free browsing experience</span>
                        </li>
                        <li className="flex items-center">
                            <Check className="h-5 w-5 text-primary mr-3" />
                            <span>Save your recommendation history</span>
                        </li>
                         <li className="flex items-center">
                            <Check className="h-5 w-5 text-primary mr-3" />
                            <span>Access to all future pro features</span>
                        </li>
                    </ul>
                </CardContent>
                <CardFooter className="flex flex-col">
                    {userProfile?.subscriptionStatus === 'pro' ? (
                         <Button disabled size="lg" className="w-full font-bold">You are already a Pro Member</Button>
                    ) : (
                         <Button onClick={handleUpgrade} disabled={isUpgrading} size="lg" className="w-full font-bold bg-accent hover:bg-accent/90">
                            {isUpgrading ? "Upgrading..." : "Upgrade to Pro"}
                        </Button>
                    )}
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                        For demonstration purposes only. No real payment will be processed.
                    </p>
                </CardFooter>
            </Card>
        </main>
    </div>
  );
}
