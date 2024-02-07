import Image from "next/image";
import Conversation from "./conversation";

export const runtime = "edge";

export default async function Home() {
  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-gray-100">
        <body class="h-full">
        ```
      */}
      <div className="h-screen">
        <header className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex align-center">
          <Image
            src="/deepgram.svg"
            alt="Deepgram Logo"
            width={124.3676}
            height={24}
            priority
          />
        </header>

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-[calc(100%-4rem)] pb-4 sm:pb-6 lg:pb-8">
          <Conversation />
        </main>
      </div>
    </>
  );
}
