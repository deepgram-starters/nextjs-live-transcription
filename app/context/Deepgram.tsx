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

const voices: { [key: string]: { name: string; avatar: string } } = {
  "aura-asteria-en": { name: "Asteria", avatar: "/aura-asteria-en.svg" },
  "aura-luna-en": { name: "Luna", avatar: "/aura-luna-en.svg" },
  "aura-stella-en": { name: "Stella", avatar: "/aura-stella-en.svg" },
  "aura-athena-en": { name: "Athena", avatar: "/aura-athena-en.svg" },
  "aura-hera-en": { name: "Hera", avatar: "/aura-hera-en.svg" },
  "aura-orion-en": { name: "Orion", avatar: "/aura-orion-en.svg" },
  "aura-arcas-en": { name: "Arcas", avatar: "/aura-arcas-en.svg" },
  "aura-perseus-en": { name: "Perseus", avatar: "/aura-perseus-en.svg" },
  "aura-angus-en": { name: "Angus", avatar: "/aura-angus-en.svg" },
  "aura-orpheus-en": { name: "Orpheus", avatar: "/aura-orpheus-en.svg" },
  "aura-helios-en": { name: "Helios", avatar: "/aura-helios-en.svg" },
  "aura-zeus-en": { name: "Zeus", avatar: "/aura-zeus-en.svg" },
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
