'use client';

import { LoginForm } from "@/components/login-form";
import { MindMatchLogo } from "@/components/icons";

export default function LoginPage() {

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <MindMatchLogo className="mx-auto h-12 w-12" />
          <h1 className="text-2xl font-semibold tracking-tight font-headline">
            Welcome to Mind Match
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in or create an account to continue
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

    