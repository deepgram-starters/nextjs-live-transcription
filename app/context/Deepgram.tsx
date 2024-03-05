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

const voices: {
  [key: string]: {
    name: string;
    avatar: string;
    language: string;
    accent: string;
  };
} = {
  "aura-asteria-en": {
    name: "Asteria",
    avatar: "/aura-asteria-en.svg",
    language: "English",
    accent: "US",
  },
  "aura-luna-en": {
    name: "Luna",
    avatar: "/aura-luna-en.svg",
    language: "English",
    accent: "US",
  },
  "aura-stella-en": {
    name: "Stella",
    avatar: "/aura-stella-en.svg",
    language: "English",
    accent: "US",
  },
  "aura-athena-en": {
    name: "Athena",
    avatar: "/aura-athena-en.svg",
    language: "English",
    accent: "UK",
  },
  "aura-hera-en": {
    name: "Hera",
    avatar: "/aura-hera-en.svg",
    language: "English",
    accent: "US",
  },
  "aura-orion-en": {
    name: "Orion",
    avatar: "/aura-orion-en.svg",
    language: "English",
    accent: "US",
  },
  "aura-arcas-en": {
    name: "Arcas",
    avatar: "/aura-arcas-en.svg",
    language: "English",
    accent: "US",
  },
  "aura-perseus-en": {
    name: "Perseus",
    avatar: "/aura-perseus-en.svg",
    language: "English",
    accent: "US",
  },
  "aura-angus-en": {
    name: "Angus",
    avatar: "/aura-angus-en.svg",
    language: "English",
    accent: "Ireland",
  },
  "aura-orpheus-en": {
    name: "Orpheus",
    avatar: "/aura-orpheus-en.svg",
    language: "English",
    accent: "US",
  },
  "aura-helios-en": {
    name: "Helios",
    avatar: "/aura-helios-en.svg",
    language: "English",
    accent: "UK",
  },
  "aura-zeus-en": {
    name: "Zeus",
    avatar: "/aura-zeus-en.svg",
    language: "English",
    accent: "US",
  },
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
