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
        player?.current?.pause();
        clearNowPlaying();
        updateItem(nowPlaying.id, { played: true });
      }
      handleSubmit(e);
    },
    [clearNowPlaying, handleSubmit, nowPlaying, player, updateItem]
  );

  return (
    <form onSubmit={submitter}>
      <div className="relative">
        <div className="absolute w-full -top-[4.5rem] py-4 flex justify-between">
          <Settings />
          <Download messages={messages} />
        </div>
        <div className="flex bg-[#101014] rounded-full">
          <span className="flex-grow sm:flex-grow-0 rounded-s-full bg-gradient-to-r bg-gradient to-[#13EF93]/50 from-[#149AFB]/80 ps-0.5 py-0.5">
            <a
              href="#"
              onClick={(e: any) => microphoneToggle(e)}
              className="group py-4 px-2 sm:px-8 w-full rounded-s-full font-bold bg-[#101014] betterhover:hover:bg-transparent text-light-900 text-sm sm:text-base flex items-center"
            >
              <MicrophoneIcon micOpen={microphoneOpen} />
              <span>
                {microphoneOpen ? (
                  <>Now listening...</>
                ) : (
                  <>{`${isTablet || isMobile ? "Tap" : "Click"} to speak`}</>
                )}
              </span>
            </a>
          </span>

          <span className="sm:flex-grow bg-[#13EF93]/50 py-0.5">
            <input
              type="text"
              className="p-4 w-full h-full bg-[#101014] text-light-900 border-0 text-sm sm:text-base outline-none focus:ring-0"
              placeholder="You can send text too"
              value={input}
              onChange={handleInputChange}
            />
          </span>

          <span className="rounded-e-full bg-gradient-to-l to-[#13EF93]/50 from-[#149AFB]/80 pe-0.5 py-0.5">
            <button className="py-4 px-2 sm:px-8 rounded-e-full font-bold bg-[#101014] betterhover:hover:bg-transparent text-light-900 text-sm sm:text-base flex items-center">
              <span>Send text</span>
              <SendIcon />
            </button>
          </span>
        </div>
      </div>
    </form>
  );
};
