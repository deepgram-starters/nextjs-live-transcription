"use client";

import { createContext, useCallback, useContext, useState } from "react";

type AudioStoreContext = {
  audioStore: AudioPacket[];
  addAudio: (queueItem: AudioPacket) => void;
};

export interface AudioPacket {
  id: string;
  blob: Blob;
  latency: number;
  networkLatency: number;
  model: string;
}

interface AudioStoreItemContextInterface {
  children: React.ReactNode;
}

const AudioStoreContext = createContext({} as AudioStoreContext);

export const AudioStoreContextProvider = ({
  children,
}: AudioStoreItemContextInterface) => {
  const [audioStore, setAudioStore] = useState<AudioPacket[]>([]);

  const addAudio = useCallback((queueItem: AudioPacket): void => {
    setAudioStore((q) => [...q, queueItem]);
  }, []);

  return (
    <AudioStoreContext.Provider
      value={{
        audioStore,
        addAudio,
      }}
    >
      {children}
    </AudioStoreContext.Provider>
  );
};

export function useAudioStore() {
  return useContext(AudioStoreContext);
}
