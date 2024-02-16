import type { Metadata } from "next";

import classNames from "classnames";
import { Inter } from "next/font/google";
import localFont from "next/font/local";

import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });
const favorit = localFont({
  src: "./fonts/ABCFavorit-Bold.woff2",
  variable: "--font-favorit",
});

export const metadata: Metadata = {
  title: "Deepgram // EmilyAI",
  description: `Conversation AI Demo - STT+LLM+TTS`,
  robots: {
    index: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`h-full ${classNames(favorit.variable, inter.className)}`}
      >
        {children}
      </body>
    </html>
  );
}
