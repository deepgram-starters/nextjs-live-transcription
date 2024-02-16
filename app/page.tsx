import { Conversation } from "@/app/components/Conversation";
import Image from "next/image";

export const runtime = "edge";

export default async function Home() {
  return (
    <>
      <div className="h-full overflow-hidden">
        {/* height 4rem */}
        <div className="bg-gradient-to-b from-black/50 to-black/10 backdrop-blur-[2px] h-[4rem] flex items-center">
          <header className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8 flex items-center justify-between">
            <a className="flex items-center" href="/">
              <Image
                className="w-auto h-6 -mb-px"
                src="/deepgram.svg"
                alt="Deepgram Logo"
                width={0}
                height={0}
                priority
              />
              <h1 className="ml-2 font-favorit text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#EE028B] to-[#AE29FF]">
                EmilyAI
              </h1>
            </a>
            <a
              href="https://github.com/deepgram-devs/deepgram-conversational-demo"
              target="_blank"
              className="hidden sm:inline"
            >
              View the code
            </a>
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
