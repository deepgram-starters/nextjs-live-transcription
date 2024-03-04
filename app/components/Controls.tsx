import { useCallback, useMemo } from "react";
import { isTablet, isMobile } from "react-device-detect";
import { MicrophoneIcon } from "./icons/MicrophoneIcon";
import { SendIcon } from "./icons/SendIcon";
import { useNowPlaying } from "../context/NowPlaying";
import { usePlayQueue } from "../context/PlayQueue";
import { useMicrophone } from "../context/Microphone";

export const Controls = ({
  input,
  handleSubmit,
  handleInputChange,
}: {
  input: string;
  handleSubmit: any;
  handleInputChange: any;
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
      <div className="flex bg-[#101014] sm:rounded-full">
        <span className="flex-grow sm:flex-grow-0 sm:rounded-s-full bg-gradient-to-r bg-gradient to-[#13EF93]/50 from-[#149AFB]/80 sm:ps-0.5 py-0.5 ">
          <a
            href="#"
            onClick={(e: any) => microphoneToggle(e)}
            className="group py-4 px-2 sm:px-8 w-full sm:rounded-s-full font-bold bg-[#101014] hover:bg-transparent text-light-900 text-sm sm:text-base flex items-center"
          >
            <MicrophoneIcon micOpen={microphoneOpen} />
            <span>
              {microphoneOpen ? (
                <>Listening...</>
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

        <span className="sm:rounded-e-full bg-gradient-to-l to-[#13EF93]/50 from-[#149AFB]/80 sm:pe-0.5 py-0.5 ">
          <button className="py-4 px-2 sm:px-8 sm:rounded-e-full font-bold bg-[#101014] hover:bg-transparent text-light-900 text-sm sm:text-base flex items-center">
            <span>Send text</span>
            <SendIcon />
          </button>
        </span>
      </div>
    </form>
  );
};
