import Image from "next/image";
import Guard from "./components/guard";

export const runtime = "edge";

export default async function Home() {
  return (
    <>
      <div className="h-full">
        <div className="bg-gradient-to-b from-black/50 to-black/10 backdrop-blur-[2px]">
          <header className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-5 flex items-center justify-between">
            <div className="h-16 flex items-center">
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
            </div>
            <a
              href="https://github.com/deepgram-devs/deepgram-conversational-demo"
              target="_blank"
            >
              View the code
            </a>
          </header>
        </div>

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-[calc(100%-6rem)] pb-4 sm:pb-6 lg:pb-8">
          <Guard />
        </main>
      </div>
    </>
  );
}
