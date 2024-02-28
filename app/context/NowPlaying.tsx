"use client";

import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { NowPlaying } from "../lib/types";
import { usePlayQueue } from "./PlayQueue";

type NowPlayingContext = {
  nowPlaying: NowPlaying | undefined;
  setNowPlaying: Dispatch<SetStateAction<NowPlaying | undefined>>;
  clearNowPlaying: () => void;
};

interface NowPlayingContextInterface {
  children: React.ReactNode;
}

const NowPlayingContext = createContext({} as NowPlayingContext);

const NowPlayingContextProvider = ({
  children,
}: NowPlayingContextInterface) => {
  const [nowPlaying, setNowPlaying] = useState<NowPlaying>();
  const { updateItem } = usePlayQueue();

  useEffect(() => {
    if (nowPlaying) {
      const url = window.URL.createObjectURL(nowPlaying.blob);
      const player = new Audio(url);
      player.addEventListener("canplay", () => {
        player.play();
      });

      player.addEventListener("ended", () => {
        clearNowPlaying();
        updateItem(nowPlaying.id, { played: true });
      });
    }
  });

  const clearNowPlaying = () => {
    setNowPlaying(undefined);
  };

  return (
    <NowPlayingContext.Provider
      value={{ nowPlaying, setNowPlaying, clearNowPlaying }}
    >
      {children}
    </NowPlayingContext.Provider>
  );
};

function useNowPlaying() {
  return useContext(NowPlayingContext);
}

export { NowPlayingContextProvider, useNowPlaying };
