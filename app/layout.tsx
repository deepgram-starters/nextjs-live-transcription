import type { Metadata } from "next";
import { GoogleTagManager } from "@next/third-parties/google";

import classNames from "classnames";
import { Inter } from "next/font/google";
import localFont from "next/font/local";

import "./globals.css";
import { ErrorContextProvider } from "./context/Error";
import { NowPlayingContextProvider } from "./context/NowPlaying";
import { PlayQueueContextProvider } from "./context/PlayQueue";
import Head from "next/head";
import Script from "next/script";
import { MicrophoneContextProvider } from "./context/Microphone";

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
          <MicrophoneContextProvider>
            <PlayQueueContextProvider>
              <NowPlayingContextProvider>{children}</NowPlayingContextProvider>
            </PlayQueueContextProvider>
          </MicrophoneContextProvider>
        </ErrorContextProvider>
      </body>
      <GoogleTagManager gtmId="GTM-5R73N627" />
      <Script id="heap-analytics">
        {`window.heap=window.heap||[],heap.load=function(e,t){window.heap.appid=e,window.heap.config=t=t||{};var r=document.createElement("script");r.type="text/javascript",r.async=!0,r.src="https://cdn.heapanalytics.com/js/heap-"+e+".js";var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(r,a);for(var n=function(e){return function(){heap.push([e].concat(Array.prototype.slice.call(arguments,0)))}},p=["addEventProperties","addUserProperties","clearEventProperties","identify","resetIdentity","removeEventProperty","setEventProperties","track","unsetEventProperty"],o=0;o<p.length;o++)heap[p[o]]=n(p[o])};`}
        {`heap.load("765739241");`}
      </Script>
    </html>
  );
}
