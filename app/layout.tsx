import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

import { ClerkProvider } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { ReactNode } from "react";

import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";

export const metadata: Metadata = {
  title: "AI Notetaker",
  description:
    "Generate notes using the latest in AI technology. Powered by Deepgram and OpenAI.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta charSet="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>Live transcription by Deepgram in Next.js</title>
        </head>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <nav className="flex justify-between items-center p-4 shadow-md">
              <span className="text-xl font-bold">MeetingNotes-AI</span>
              <div className="flex items-center space-x-4">
                <UserButton afterSignOutUrl="/" />
                <ModeToggle />
              </div>
            </nav>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
