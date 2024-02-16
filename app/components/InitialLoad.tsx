import { isBrowser } from "react-device-detect";

export const InitialLoad = ({ fn }: { fn: () => void }) => {
  return (
    <>
      <div className="col-start-1 col-end-13 sm:col-start-2 sm:col-end-12 md:col-start-3 md:col-end-11 lg:col-start-4 lg:col-end-10 p-3 mb-1/2">
        <button
          onClick={() => fn()}
          type="button"
          className="relative block w-full glass p-12 "
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
          <h6 className="mt-2 block ">
            Welcome to EmilyAI, the conversational AI powered by Deepgram.
          </h6>
          <span className="mt-6 block text-sm font-semibold">
            {isBrowser ? "Click" : "Tap"} here to start
          </span>
        </button>
      </div>
    </>
  );
};
