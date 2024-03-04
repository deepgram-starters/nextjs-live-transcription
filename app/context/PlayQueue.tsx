"use client";

import {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { AudioPacket } from "../lib/types";

type PlayQueueContext = {
  playQueue: AudioPacket[];
  setPlayQueue: Dispatch<SetStateAction<AudioPacket[]>>;
  clearQueue: () => void;
  enqueueItem: (queueItem: AudioPacket) => void;
  updateItem: (id: string, values: Partial<AudioPacket>) => void;
};

interface PlayQueueItemContextInterface {
  children: React.ReactNode;
}

const PlayQueueContext = createContext({} as PlayQueueContext);

const PlayQueueContextProvider = ({
  children,
}: PlayQueueItemContextInterface) => {
  const [playQueue, setPlayQueue] = useState<AudioPacket[]>([]);

  const clearQueue = () => {
    setPlayQueue([]);
  };

  const enqueueItem = useCallback((queueItem: AudioPacket): void => {
    setPlayQueue((q) => [...q, queueItem]);
  }, []);

  const updateItem = (id: string, values: Partial<AudioPacket>): void => {
    setPlayQueue((prevData) => {
      return prevData.map((item) => {
        if (item.id === id) {
          return { ...item, ...values };
        }
        return item;
      });
    });
  };

  return (
    <PlayQueueContext.Provider
      value={{
        playQueue,
        setPlayQueue,
        clearQueue,
        enqueueItem,
        updateItem,
      }}
    >
      {children}
    </PlayQueueContext.Provider>
  );
};

function usePlayQueue() {
  return useContext(PlayQueueContext);
}

export { PlayQueueContextProvider, usePlayQueue };
