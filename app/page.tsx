"use client";

//import convex stuff
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

//import next stuff
import Image from "next/image";

//import icons
import { CalendarCheck2, ArrowRight } from "lucide-react";

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
      <div className="relative max-w-5xl mx-auto pt-20 sm:pt-24 lg:pt-32">
        <div className="flex justify-center">
          <Image
            src="/powered-by-openai-badge-outlined-on-light.svg"
            alt="Powered by OpenAI"
            width={166}
            height={32}
            className="dark:hidden"
          />
          <Image
            src="/powered-by-openai-badge-outlined-on-dark.svg"
            alt="Powered by OpenAI"
            width={166}
            height={32}
            className="hidden dark:block"
          />
        </div>
        <h1 className="mt-5 font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-center">
          Anyone taking notes?
        </h1>
        <p className="mt-6 text-lg text-center max-w-3xl mx-8">
          Hi, I am just your friendly{" "}
          <code className="font-mono font-medium text-blue-500 dark:text-blue-400">
            Speech to Text, Audio Embedding, Diarization, Generative AI{" "}
          </code>
          note taking application here to help with your next meeting!
        </p>

        <div className="mt-8 flex justify-center">
          <SignedIn>
            <Link href="/mymeetings">
              <Button className="mr-3 pr-6">
                <CalendarCheck2 className="mr-3 h-5 w-5" />
                Previous Meetings
              </Button>
            </Link>
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
        </div>
      </div>
    </main>
  );
}
