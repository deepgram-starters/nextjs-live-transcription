"use client";

import { LiveSchema, SpeakSchema } from "@deepgram/sdk";
import { createContext, useContext, useEffect, useState } from "react";

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

const voices: { [key: string]: string } = {
  "aura-asteria-en": "Asteria",
  "aura-luna-en": "Luna",
  "aura-stella-en": "Stella",
  "aura-athena-en": "Athena",
  "aura-hera-en": "Hera",
  "aura-orion-en": "Orion",
  "aura-arcas-en": "Arcas",
  "aura-perseus-en": "Perseus",
  "aura-angus-en": "Angus",
  "aura-orpheus-en": "Orpheus",
  "aura-helios-en": "Helios",
  "aura-zeus-en": "Zeus",
};

const voiceMap = (model: string) => {
  return voices[model];
};

const DeepgramContextProvider = ({ children }: DeepgramContextInterface) => {
  const [ttsOptions, setTtsOptions] = useState<SpeakSchema>({});
  const [sttOptions, setSttOptions] = useState<LiveSchema>({});

  useEffect(() => {
    setTtsOptions({
      model: "aura-asteria-en",
    });
  }, []);

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

export { DeepgramContextProvider, useDeepgram, voiceMap, voices };
