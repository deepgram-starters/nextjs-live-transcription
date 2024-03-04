import type { Metadata } from "next";
import { GoogleTagManager } from "@next/third-parties/google";

import classNames from "classnames";
import { Inter } from "next/font/google";
import localFont from "next/font/local";

import "./globals.css";
import { ErrorContextProvider } from "./context/Error";
import { NowPlayingContextProvider } from "./context/NowPlaying";
import { PlayQueueContextProvider } from "./context/PlayQueue";
import Script from "next/script";
import { MicrophoneContextProvider } from "./context/Microphone";
import { MessageMetadataContextProvider } from "./context/MessageMetadata";

const inter = Inter({ subsets: ["latin"] });
const favorit = localFont({
  src: "./fonts/ABCFavorit-Bold.woff2",
  variable: "--font-favorit",
});

const windowUrl =
  typeof window !== "undefined"
    ? window.location.toString()
    : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(windowUrl),
  title: "Deepgram AI Agent",
  description: `Deepgram's AI Agent Demo shows just how fast Speech-to-Text and Text-to-Speech can be.`,
  robots: {
    index: false,
    follow: false,
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
              <NowPlayingContextProvider>
                <MessageMetadataContextProvider>
                  {children}
                </MessageMetadataContextProvider>
              </NowPlayingContextProvider>
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
