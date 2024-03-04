"use client";

import Conversation from "./components/Conversation";
import Image from "next/image";

export const runtime = "edge";
import * as FullStory from "@fullstory/browser";
import { useEffect } from "react";
import { NextUIProvider } from "@nextui-org/react";

export default function Home() {
  useEffect(() => {
    FullStory.init({ orgId: "5HWAN" });
  }, []);

  return (
    <>
      <div className="h-full overflow-hidden">
        {/* height 4rem */}
        <div className="bg-gradient-to-b from-black/50 to-black/10 backdrop-blur-[2px] h-[4rem] flex items-center">
          <header className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8 flex items-center justify-between">
            <div>
              <a className="flex items-center" href="/">
                <h1 className="mr-2 -mb-px font-favorit text-xl font-semibold text-white/60">
                  Powered by
                </h1>
                <Image
                  className="w-auto h-6 mb-1"
                  src="/deepgram.svg"
                  alt="Deepgram Logo"
                  width={0}
                  height={0}
                  priority
                />
              </a>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="bg-white rounded">
                <a
                  href="https://github.com/deepgram-devs/deepgram-conversational-demo"
                  target="_blank"
                  className="hidden sm:inline-block bg-white text-black rounded m-px px-4 py-2 font-semibold"
                >
                  View the code
                </a>
              </span>

              <span className="gradient-shadow bg-gradient-to-r to-[#13EF93]/50 from-[#149AFB]/80 rounded">
                <a
                  href="https://console.deepgram.com/signup?jump=keys"
                  target="_blank"
                  className="hidden md:inline-block bg-black text-white rounded m-px px-4 py-2 font-semibold"
                >
                  Get an API Key
                </a>
              </span>
            </div>
          </header>
        </div>

        {/* height 100% minus 4rem */}
        <main className="mx-auto max-w-7xl px-0 sm:px-4 md:px-6 lg:px-8 h-[calc(100%-4rem)] pb-0 sm:pb-4 md:pb-6 lg:pb-8">
          <Conversation />
        </main>
      </div>
    </>
  );
}
