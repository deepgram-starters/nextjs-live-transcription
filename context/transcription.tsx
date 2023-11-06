"use client";

import { createContext, useContext, useState } from "react";

type TranscriptionContext = {
  transcription: string;
  setTranscription: (index: string) => void;
};

interface TranscriptionContextInterface {
  children: React.ReactNode;
}

const TranscriptionContext = createContext({} as TranscriptionContext);

const TranscriptionContextProvider = ({
  children,
}: TranscriptionContextInterface) => {
  const [transcription, setTranscription] = useState("");

  return (
    <TranscriptionContext.Provider value={{ transcription, setTranscription }}>
      {children}
    </TranscriptionContext.Provider>
  );
};

function useTranscriptionContext() {
  return useContext(TranscriptionContext);
}

export { TranscriptionContextProvider, useTranscriptionContext };
