import { Inter } from "next/font/google";
import classNames from "classnames";
import localFont from "next/font/local";

import { DeepgramContextProvider } from "./context/DeepgramContextProvider";
import { MicrophoneContextProvider } from "./context/MicrophoneContextProvider";

import "./globals.css";

import type { Metadata, Viewport } from "next";

const inter = Inter({ subsets: ["latin"] });
const favorit = localFont({
    src: "./fonts/ABCFavorit-Bold.woff2",
    variable: "--font-favorit",
});

export const viewport: Viewport = {
    themeColor: "#000000",
    initialScale: 1,
    width: "device-width",
    // maximumScale: 1, hitting accessability
};

export const metadata: Metadata = {
    metadataBase: new URL("https://aura-tts-demo.deepgram.com"),
    title: "Parakeet AI",
    description: `We make toys you can grow and learn with.`,
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
        <html lang="en" className="h-dvh">
            <body
                className={`h-full ${classNames(
                    favorit.variable,
                    inter.className
                )}`}
            >
                <MicrophoneContextProvider>
                    <DeepgramContextProvider>
                        {children}
                    </DeepgramContextProvider>
                </MicrophoneContextProvider>
            </body>
        </html>
    );
}
