import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

//import clerk stuff
import {
  SignInButton,
  UserButton,
  SignUpButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { ReactNode } from "react";

//import shadcnui stuff
import { Toaster } from "@/components/ui/sonner";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";

//import custom stuff
import { Providers } from "@/components/providers";
//import logrocket stuff
import LogRocketInit from "@/components/LogRocketInit"; // Adjust the import path as necessary

export const metadata: Metadata = {
  title: "AI Notetaker",
  description:
    "Generate notes using the latest in AI technology. Powered by Deepgram and OpenAI.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>AI Note Taker</title>
      </head>
      <body className={inter.className}>
        <LogRocketInit />
        <Providers>
          <div className="h-screen w-screen max-w-7xl mx-auto">
            <div className="sticky top-0 z-50 border-b border-border/40 backdrop-blur">
              <nav className="flex justify-between items-center h-16 mx-4 ">
                <span className="text-xl font-bold">MeetingNotes-AI</span>
                <div className="flex items-center space-x-4">
                  <SignedIn>
                    <UserButton afterSignOutUrl="/" />
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
                  <ModeToggle />
                </div>
              </nav>
            </div>
            {children}
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
