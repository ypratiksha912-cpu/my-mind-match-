'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * In development, it throws any received error to be caught by Next.js's global-error.tsx.
 * In production, it logs the error to the console without crashing the app.
 */
export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    const handleError = (emittedError: FirestorePermissionError) => {
      // Set error in state to trigger a re-render.
      setError(emittedError);
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  useEffect(() => {
    if (error) {
      if (process.env.NODE_ENV === 'development') {
        // In dev, we throw to let the Next.js overlay catch it.
        // The overlay will halt execution, so we don't need to reset state here.
        throw error;
      } else {
        // In production, log the error for debugging.
        // A real app would send this to a logging service.
        console.error("Firestore Permission Error (production):", error.message);
        
        // After logging, reset the error state to prevent the app
        // from being stuck in an error state on subsequent renders.
        setError(null);
      }
    }
  }, [error]);

  // This component renders nothing.
  return null;
}
