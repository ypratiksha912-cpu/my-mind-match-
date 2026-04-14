'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';

export function AdPlaceholder({ className }: { className?: string }) {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const userProfileRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<{ subscriptionStatus?: string }>(userProfileRef);

    const isLoading = isUserLoading || isProfileLoading;

    // Don't show ad if user is pro
    if (userProfile?.subscriptionStatus === 'pro') {
        return null;
    }

    // Don't show ad if there's no user (logged out)
    if (!user && !isUserLoading) {
        return null;
    }

    // Show a skeleton while loading the user profile
    if (isLoading) {
        return <Skeleton className={`h-32 w-full ${className}`} />;
    }

    return (
        <Card className={`flex items-center justify-center h-32 bg-muted/20 border-2 border-dashed border-border ${className}`}>
            <div className="text-center text-muted-foreground">
                <p className="font-bold text-lg">ADVERTISEMENT</p>
                <p className="text-sm">Upgrade to Pro for an ad-free experience.</p>
            </div>
        </Card>
    );
}
