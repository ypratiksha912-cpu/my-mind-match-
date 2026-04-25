'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  GoogleAuthProvider,
  signInWithRedirect,
getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { differenceInDays } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { MindMatchLogo } from './icons';

const FormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type FormValues = z.infer<typeof FormSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const upsertUserProfile = async (user: User) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', user.uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      // User exists, update last login and other details
      const userData = docSnap.data();
      if (userData.lastLoginAt) {
        const lastLogin = new Date(userData.lastLoginAt);
        const now = new Date();
        if (differenceInDays(now, lastLogin) >= 3) {
          localStorage.setItem('showUpdateToast', 'true');
        }
      }
      await setDoc(userRef, { 
        lastLoginAt: new Date().toISOString(),
        photoURL: user.photoURL || null, // Ensure photoURL is handled for both providers
        email: user.email,
      }, { merge: true });
    } else {
      // New user, create the profile document
      const dataToSet = {
        id: user.uid,
        username:
          user.displayName ||
          user.email?.split('@')[0] ||
          `user_${user.uid.substring(0, 5)}`,
        email: user.email,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        photoURL: user.photoURL || null,
        preferredMediaFormat: 'Movie',
        preferredRealityType: 'Fiction',
        bio: '',
        moodArchetypePreferenceIds: [],
        subscriptionStatus: 'free',
      };
      await setDoc(userRef, dataToSet);
    }
  };
  
  const handleAuthSuccess = (user: User, method: 'signin' | 'signup') => {
    upsertUserProfile(user);
    toast({
      title: method === 'signin' ? 'Signed In' : 'Account Created',
      description: `You have successfully ${method === 'signin' ? 'signed in' : 'signed up'}.`,
    });
    router.push('/');
  };

  const handleAuthError = (error: any, provider: 'email' | 'google') => {
    let title = 'Authentication Failed';
    let description = error.message;

    if (provider === 'google' && error.code === 'auth/operation-not-allowed') {
      title = 'Action Required: Enable Google Sign-In';
      description = "To use Google Sign-In, you must first enable it in the Firebase Console's Authentication section and click 'Save'.";
    } else if (provider === 'email') {
        switch (error.code) {
            case 'auth/email-already-in-use':
                title = 'Sign Up Failed';
                description = 'An account with this email already exists. Please sign in instead.';
                break;
            case 'auth/invalid-email':
                title = 'Invalid Email';
                description = 'The email address is not valid.';
                break;
            case 'auth/wrong-password':
                title = 'Sign In Failed';
                description = 'Incorrect password. Please try again.';
                break;
            case 'auth/user-not-found':
                title = 'Sign In Failed';
                description = 'No account found with this email. Please sign up first.';
                break;
             case 'auth/operation-not-allowed':
                title = 'Action Required: Enable Email/Password Sign-In';
                description = "To use Email/Password Sign-In, you must first enable it in the Firebase Console's Authentication section and click 'Save'.";
                break;
            default:
                break;
        }
    }

    toast({
      variant: 'destructive',
      title,
      description,
      duration: 10000,
    });
  };

  const onSignIn = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      handleAuthSuccess(userCredential.user, 'signin');
    } catch (error: any) {
      handleAuthError(error, 'email');
    } finally {
      setIsLoading(false);
    }
  };

  const onSignUp = async (data: FormValues) => {
    setIsLoading(true);
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        handleAuthSuccess(userCredential.user, 'signup');
    } catch (error: any) {
        handleAuthError(error, 'email');
    } finally {
        setIsLoading(false);
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
     await signInWithRedirect(auth, provider);
      
    } catch (error: any) {
      handleAuthError(error, 'google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form className="grid gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              className="w-full"
              disabled={isLoading}
              onClick={form.handleSubmit(onSignIn)}
            >
              {isLoading ? <MindMatchLogo className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sign In
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={isLoading}
              onClick={form.handleSubmit(onSignUp)}
            >
              {isLoading ? <MindMatchLogo className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sign Up
            </Button>
          </div>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        type="button"
        disabled={isLoading}
        onClick={handleGoogleSignIn}
        className="w-full"
      >
        {isLoading ? (
          <MindMatchLogo className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <svg
            className="mr-2 h-4 w-4"
            role="img"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Google</title>
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.9-4.7 1.9-4.27 0-7.75-3.5-7.75-7.75s3.48-7.75 7.75-7.75c2.13 0 3.6.87 4.44 1.68l2.5-2.5C20.2 1.5 17.1.5 12.48.5 5.8 0 0 5.8 0 12.5s5.8 12.5 12.48 12.5c7.2 0 12-4.93 12-12.25 0-.75-.08-1.5-.2-2.25z"
              fill="currentColor"
            />
          </svg>
        )}{' '}
        Google
      </Button>
    </div>
  );
}

    
