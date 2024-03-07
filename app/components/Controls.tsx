import { useCallback, useMemo } from "react";
import { isTablet, isMobile } from "react-device-detect";
import { MicrophoneIcon } from "./icons/MicrophoneIcon";
import { SendIcon } from "./icons/SendIcon";
import { useNowPlaying } from "../context/NowPlaying";
import { usePlayQueue } from "../context/PlayQueue";
import { useMicrophone } from "../context/Microphone";
import { Download } from "./Download";
import { Message } from "ai/react";
import { Settings } from "./Settings";
import { Tooltip } from "@nextui-org/react";

export const Controls = ({
  input,
  handleSubmit,
  handleInputChange,
  messages,
}: {
  input: string;
  handleSubmit: any;
  handleInputChange: any;
  messages: Message[];
}) => {
  const { startMicrophone, stopMicrophone, microphoneOpen } = useMicrophone();

  const microphoneToggle = useCallback(
    async (e: Event) => {
      e.preventDefault();

      if (microphoneOpen) {
        stopMicrophone();
      } else {
        startMicrophone();
      }
    },
    [microphoneOpen, startMicrophone, stopMicrophone]
  );

  const { updateItem } = usePlayQueue();
  const { nowPlaying, clearNowPlaying, player } = useNowPlaying();

  const submitter = useCallback(
    (e: any) => {
      if (nowPlaying) {
        player?.pause();
        updateItem(nowPlaying.id, { played: true });
        clearNowPlaying();
      }
      handleSubmit(e);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clearNowPlaying, handleSubmit, nowPlaying, updateItem]
  );

  return (
    <form onSubmit={submitter}>
      <div className="relative">
        <div className="absolute w-full -top-[4.5rem] py-4 flex justify-between">
          <Settings />
          <Download messages={messages} />
        </div>
        <div className="flex bg-[#101014] rounded-full">
          <span
            className={`rounded-s-full ps-0.5 py-0.5 ${
              microphoneOpen
                ? "bg-gradient-to-r bg-gradient to-[#13EF93]/50 from-red-500"
                : "bg-gradient-to-r bg-gradient to-[#13EF93]/50 from-[#149AFB]/80"
            }`}
          >
            <Tooltip showArrow content="Toggle microphone on/off.">
              <a
                href="#"
                onClick={(e: any) => microphoneToggle(e)}
                className={`w-20 sm:w-24 py-4 px-2 sm:px-8 rounded-s-full font-bold bg-[#101014] text-light-900 text-sm sm:text-base flex items-center justify-center group`}
              >
                {microphoneOpen && (
                  <div className="w-auto items-center justify-center hidden sm:flex absolute shrink-0">
                    <MicrophoneIcon
                      micOpen={microphoneOpen}
                      className="h-6 animate-ping-short"
                    />
                  </div>
                )}
                <div className="w-auto flex items-center justify-center shrink-0">
                  <MicrophoneIcon micOpen={microphoneOpen} className="h-6" />
                </div>
                {/* <span>
                {microphoneOpen ? (
                  <>Now listening...</>
                ) : (
                  <>{`${isTablet || isMobile ? "Tap" : "Click"} to speak`}</>
                )}
              </span> */}
              </a>
            </Tooltip>
          </span>

          <span className="flex-grow bg-[#13EF93]/50 py-0.5">
            <input
              type="text"
              className="py-4 sm:px-4 w-full h-full bg-[#101014] text-light-900 border-0 text-sm sm:text-base outline-none focus:ring-0"
              placeholder="Type a message to send..."
              value={input}
              onChange={handleInputChange}
            />
          </span>

          <span className="rounded-e-full bg-gradient-to-l to-[#13EF93]/50 from-[#149AFB]/80 pe-0.5 py-0.5">
            <Tooltip showArrow content="Send a message.">
              <button className="w-20 sm:w-24 py-4 px-2 sm:px-8 rounded-e-full font-bold bg-[#101014] text-light-900 text-sm sm:text-base flex items-center justify-center">
                {/* <span>Send text</span> */}
                <SendIcon className="h-6 w-6" />
              </button>
            </Tooltip>
          </span>
        </div>
      </div>
    </form>
  );
};
