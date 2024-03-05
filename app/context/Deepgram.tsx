"use client";

import { LiveSchema, SpeakSchema } from "@deepgram/sdk";
import { createContext, useContext, useState } from "react";

type DeepgramContext = {
  ttsOptions: any;
  setTtsOptions: any;
  sttOptions: any;
  setSttOptions: any;
};

interface DeepgramContextInterface {
  children: React.ReactNode;
}

const DeepgramContext = createContext({} as DeepgramContext);

const DeepgramContextProvider = ({ children }: DeepgramContextInterface) => {
  const [ttsOptions, setTtsOptions] = useState<SpeakSchema>({});
  const [sttOptions, setSttOptions] = useState<LiveSchema>({});

  return (
    <DeepgramContext.Provider
      value={{ ttsOptions, setTtsOptions, sttOptions, setSttOptions }}
    >
      {children}
    </DeepgramContext.Provider>
  );
};

function useDeepgram() {
  return useContext(DeepgramContext);
}

export { DeepgramContextProvider, useDeepgram };
