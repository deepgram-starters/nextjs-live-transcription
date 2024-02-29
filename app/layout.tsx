import type { Metadata } from "next";
import { GoogleTagManager } from "@next/third-parties/google";

import classNames from "classnames";
import { Inter } from "next/font/google";
import localFont from "next/font/local";

import "./globals.css";
import { ErrorContextProvider } from "./context/Error";
import { NowPlayingContextProvider } from "./context/NowPlaying";
import { PlayQueueContextProvider } from "./context/PlayQueue";

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
        <ErrorContextProvider>
          <PlayQueueContextProvider>
            <NowPlayingContextProvider>{children}</NowPlayingContextProvider>
          </PlayQueueContextProvider>
        </ErrorContextProvider>
      </body>
      <GoogleTagManager gtmId="GTM-5R73N627" />
    </html>
  );
}
