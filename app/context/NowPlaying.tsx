"use client";

import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AudioPacket } from "../lib/types";
import { usePlayQueue } from "./PlayQueue";
import { silentMp3 } from "../lib/constants";

type NowPlayingContext = {
  nowPlaying: AudioPacket | undefined;
  setNowPlaying: Dispatch<SetStateAction<AudioPacket | undefined>>;
  clearNowPlaying: () => void;
  // player: MutableRefObject<HTMLAudioElement>;
  player: HTMLAudioElement | undefined;
};

interface NowPlayingContextInterface {
  children: React.ReactNode;
}

const NowPlayingContext = createContext({} as NowPlayingContext);

const NowPlayingContextProvider = ({
  children,
}: NowPlayingContextInterface) => {
  // const player = useRef(
  //   document.getElementById("playElem") as HTMLAudioElement
  // );
  // const source = useRef(
  //   document.getElementById("sourceElem") as HTMLSourceElement
  // );
  const [player, setPlayer] = useState<HTMLAudioElement>();
  const [nowPlaying, setNowPlaying] = useState<AudioPacket>();
  const { updateItem } = usePlayQueue();

  useEffect(() => {
    const player: HTMLAudioElement = document.getElementById(
      "playElem"
    ) as HTMLAudioElement;
    const source: HTMLSourceElement = document.getElementById(
      "sourceElem"
    ) as HTMLSourceElement;

    setPlayer(player);

    if (nowPlaying && player && source) {
      const data = window.URL.createObjectURL(nowPlaying.blob);
      source.src = data;
      source.type = "audio/mp3";

      /**
       * Required to make iOS devices load the audio from the blob URL.
       */
      player.load();

      player.addEventListener("canplaythrough", function () {
        this.play();
      });

      player.addEventListener("ended", () => {
        updateItem(nowPlaying.id, { played: true });
        clearNowPlaying();
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nowPlaying, updateItem]);

  const clearNowPlaying = () => {
    setNowPlaying(undefined);
  };

  return (
    <NowPlayingContext.Provider
      value={{ nowPlaying, setNowPlaying, clearNowPlaying, player }}
    >
      <audio id="playElem">
        <source id="sourceElem" src={silentMp3} type="audio/mp3" />
      </audio>
      {children}
    </NowPlayingContext.Provider>
  );
};

function useNowPlaying() {
  return useContext(NowPlayingContext);
}

export { NowPlayingContextProvider, useNowPlaying };
