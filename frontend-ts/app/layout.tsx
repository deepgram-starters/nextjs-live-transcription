import {
    Inter,
    Baloo_2,
    Comic_Neue,
    Quicksand,
    Chewy,
    Fredoka,
} from "next/font/google";
import localFont from "next/font/local";

import { DeepgramContextProvider } from "./context/DeepgramContextProvider";
import { MicrophoneContextProvider } from "./context/MicrophoneContextProvider";

import "./globals.css";

import type { Metadata, Viewport } from "next";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
});

const baloo2 = Baloo_2({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-baloo2",
});

const comicNeue = Comic_Neue({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-comic-neue",
    weight: ["300", "400", "700"],
});

const quicksand = Quicksand({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-quicksand",
});

const chewy = Chewy({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-chewy",
    weight: ["400"],
});

const fredoka = Fredoka({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-fredoka",
});

const favorit = localFont({
    src: "./fonts/ABCFavorit-Bold.woff2",
    variable: "--font-favorit",
});

const fonts = `${inter.variable} ${baloo2.variable} ${comicNeue.variable} ${quicksand.variable} ${chewy.variable} ${fredoka.variable} ${favorit.variable}`;

export const viewport: Viewport = {
    themeColor: "#000000",
    initialScale: 1,
    width: "device-width",
    // maximumScale: 1, hitting accessability
};

export const metadata: Metadata = {
    metadataBase: new URL("https://parakeetai.vercel.app"),
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
        <html lang="en" className={`h-dvh ${fonts}`}>
            <body className={`h-full`}>
                <MicrophoneContextProvider>
                    <DeepgramContextProvider>
                        {children}
                    </DeepgramContextProvider>
                </MicrophoneContextProvider>
            </body>
        </html>
    );
}
