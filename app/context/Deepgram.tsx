"use client";

import {
  CreateProjectKeyResponse,
  LiveClient,
  LiveConnectionState,
  LiveSchema,
  LiveTranscriptionEvents,
  SpeakSchema,
  createClient,
} from "@deepgram/sdk";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type DeepgramContext = {
  ttsOptions: SpeakSchema | undefined;
  setTtsOptions: Dispatch<SetStateAction<SpeakSchema | undefined>>;
  sttOptions: LiveSchema | undefined;
  setSttOptions: Dispatch<SetStateAction<LiveSchema | undefined>>;
  connection: LiveClient | undefined;
  connectionReady: boolean;
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

const getApiKey = async (): Promise<string> => {
  const result: CreateProjectKeyResponse = await (
    await fetch("/api/authenticate", { cache: "no-store" })
  ).json();

  return result.key;
};

const DeepgramContextProvider = ({ children }: DeepgramContextInterface) => {
  const [ttsOptions, setTtsOptions] = useState<SpeakSchema>();
  const [sttOptions, setSttOptions] = useState<LiveSchema>();
  const [connection, setConnection] = useState<LiveClient>();
  const [connectionReady, setConnectionReady] = useState<boolean>(false);

  const connect = async () => {
    const connection = new LiveClient(
      await getApiKey(),
      {},
      {
        model: "nova-2",
        interim_results: true,
        smart_format: true,
        endpointing: 350,
        utterance_end_ms: 1000,
        filler_words: true,
      }
    );

    setConnection(connection);
  };

  useEffect(() => {
    // it must be the first open of the page, let's set up the defaults
    if (!ttsOptions && !sttOptions && !connection) {
      setTtsOptions({
        model: "aura-asteria-en",
      });

      setSttOptions({
        model: "nova-2",
        interim_results: true,
        smart_format: true,
        endpointing: 350,
        utterance_end_ms: 1000,
        filler_words: true,
      });

      connect();
    }
  }, [connection, sttOptions, ttsOptions]);

  useEffect(() => {
    // we need to reconnect
    if (ttsOptions && sttOptions && !connection) {
      connect();
    }
  }, [connection, sttOptions, ttsOptions]);

  useEffect(() => {
    if (connection && connection?.getReadyState() !== undefined) {
      connection.addListener(LiveTranscriptionEvents.Open, () => {
        setConnectionReady(true);
      });

      connection.addListener(LiveTranscriptionEvents.Close, () => {
        setConnectionReady(false);
        connection.removeAllListeners();
        setConnection(undefined);
      });

      connection.addListener(LiveTranscriptionEvents.Error, () => {
        setConnectionReady(false);
        connection.removeAllListeners();
        setConnection(undefined);
      });
    }

    return () => {
      setConnectionReady(false);
      connection?.removeAllListeners();
    };
  }, [connection]);

  return (
    <DeepgramContext.Provider
      value={{
        ttsOptions,
        setTtsOptions,
        sttOptions,
        setSttOptions,
        connection,
        connectionReady,
      }}
    >
      {children}
    </DeepgramContext.Provider>
  );
};

function useDeepgram() {
  return useContext(DeepgramContext);
}

export { DeepgramContextProvider, useDeepgram, voiceMap, voices };
