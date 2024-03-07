import { usePlayQueue } from "../context/PlayQueue";
import { useNowPlaying } from "../context/NowPlaying";
import { Message } from "ai/react";
import { Spinner } from "@nextui-org/react";
import { useCallback, useEffect, useState } from "react";

const MessageAudio = ({
  message,
  className = "",
  ...rest
}: {
  message: Message;
  className?: string;
}) => {
  const { playQueue } = usePlayQueue();
  const { nowPlaying, setNowPlaying, player } = useNowPlaying();
  const [paused, setPaused] = useState(false);

  const found = playQueue.findLast((item) => item.id === message.id);

  const pause = () => {
    setPaused(true);
    player?.pause();
  };

  const play = () => {
    if (nowPlaying?.id === message?.id) {
      setPaused(false);
      player?.play();
    } else {
      setNowPlaying(found);
    }
  };

  /**
   * Spinner if still waiting for a response
   */
  if (!found) {
    return <Spinner size={`sm`} />;
  }

  /**
   * Pause button
   *
   * nowPlaying === this message
   * AND
   * paused === false
   */
  if (nowPlaying?.id === message?.id && !paused) {
    return (
      <a href="#" onClick={() => pause()}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={`w-6 h-6 fill-white hover:fill-[#149AFB] ${className}`}
          {...rest}
        >
          <path
            fillRule="evenodd"
            d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z"
            clipRule="evenodd"
          />
        </svg>
      </a>
    );
  }

  /**
   * Play button
   *
   * nowPlaying !== this message
   * OR
   * paused === true
   */
  if (nowPlaying?.id !== message?.id || paused) {
    return (
      <a href="#" onClick={() => play()}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={`w-6 h-6 fill-white hover:fill-[#149AFB] ${className}`}
          {...rest}
        >
          <path
            fillRule="evenodd"
            d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
            clipRule="evenodd"
          />
        </svg>
      </a>
    );
  }

  return <></>;
};

export { MessageAudio };
