"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import {
  ClerkProvider,
  SignInButton,
  SignOutButton,
  UserButton,
  SignUpButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-col h-full w-full">
      <div className="">Welcome to the home page</div>
      <SignedIn>
        <Link href="/mymeetings">My Notes</Link>
      </SignedIn>
      <SignedOut>
        <div className="flex items-center space-x-4">
          <Button variant="link">
            <SignInButton afterSignInUrl="/mymeetings" />
          </Button>
          <Button variant="default">
            <SignUpButton afterSignUpUrl="/mymeetings" />
          </Button>
        </div>
      </SignedOut>
    </main>
  );
}
