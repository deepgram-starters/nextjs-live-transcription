import { isBrowser, isIOS } from "react-device-detect";
import { Headphones } from "./Headphones";
import { Exclamation } from "./Exclamation";
import Image from "next/image";

export const InitialLoad = ({ fn }: { fn: () => void }) => {
  return (
    <>
      <div className="col-start-1 col-end-13 sm:col-start-2 sm:col-end-12 md:col-start-3 md:col-end-11 lg:col-start-4 lg:col-end-10 p-3 mb-1/2">
        <button
          onClick={() => fn()}
          type="button"
          className="relative block w-full glass p-12 rounded-xl"
        >
          <span className="inline-block h-8 w-8 flex-shrink-0 ml-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M11.1,24H1c-0.4,0-0.5-0.4-0.3-0.6l6.5-6.2c0.1-0.1,0.2-0.1,0.3-0.1h3.7c2.9,0,5.3-2.1,5.4-4.8c0.1-2.8-2.3-5.2-5.3-5.2H7.4
	v4.6c0,0.2-0.2,0.4-0.4,0.4H0.4c-0.2,0-0.4-0.2-0.4-0.4V0.4C0,0.2,0.2,0,0.4,0h10.9C18.4,0,24.1,5.5,24,12.2
	C23.9,18.8,18.1,24,11.1,24z"
              />
            </svg>
          </span>
          <h2 className="mt-2 block font-bold text-xl text-gray-100">
            Welcome to the{" "}
            <Image
              className="inline w-auto h-5 -mb-px"
              src="/deepgram.svg"
              alt="Deepgram Logo"
              width={0}
              height={0}
              priority
            />{" "}
            AI Agent.
          </h2>
          <h3 className="mt-2 block text-gray-100">
            Powered by Deepgram&apos;s{" "}
            <span className="font-semibold text-gray-100">
              Nova-2 Speech-to-Text
            </span>{" "}
            &amp;
            <br />
            <span className="font-semibold text-gray-100">
              Aura Text-to-Speech
            </span>{" "}
            APIs
          </h3>
          <span className="mt-4 block text-sm text-gray-100/70">
            <Headphones /> For optimal enjoyment, we recommend using headphones
            while using this application.
          </span>
          {isIOS && (
            <span className="mt-4 block text-sm text-[#ffb02e]">
              <Exclamation /> Text-to-speech audio playback is currently
              disabled on iOS mobile devices.
            </span>
          )}
          <span className="mt-8 block font-semibold">
            <span className="bg-white text-black rounded m-px px-6 py-3 font-semibold">
              {isBrowser ? "Click" : "Tap"} here to start
            </span>
          </span>
        </button>
      </div>
    </>
  );
};
