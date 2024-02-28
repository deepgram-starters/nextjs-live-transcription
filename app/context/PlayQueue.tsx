"use client";

import {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { PlayQueueItem } from "../lib/types";

type PlayQueueContext = {
  playQueue: PlayQueueItem[];
  setPlayQueue: Dispatch<SetStateAction<PlayQueueItem[]>>;
  clearQueue: () => void;
  enqueueItem: (queueItem: PlayQueueItem) => void;
  updateItem: (id: string, values: Partial<PlayQueueItem>) => void;
};

interface PlayQueueItemContextInterface {
  children: React.ReactNode;
}

const PlayQueueContext = createContext({} as PlayQueueContext);

const PlayQueueContextProvider = ({
  children,
}: PlayQueueItemContextInterface) => {
  const [playQueue, setPlayQueue] = useState<PlayQueueItem[]>([]);

  /**
    add: addSpeechBlob,
    remove: removeSpeechBlob,
    last: lastSpeechBlob,
    size: countSpeechBlobs,
    queue: speechBlobs,
 */

  const clearQueue = () => {
    setPlayQueue([]);
  };

  const enqueueItem = useCallback((queueItem: PlayQueueItem): void => {
    setPlayQueue((q) => [...q, queueItem]);
  }, []);

  const updateItem = (id: string, values: Partial<PlayQueueItem>): void => {
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
