"use client";

import { DeepgramClient, type Deepgram } from "@deepgram/sdk";
import { createContext, useContext, useState, type FunctionComponent, type ReactNode } from "react";

export enum LiveConnectionState {
  CLOSED = "closed",
  OPEN = "open",
}

export type LiveTranscriptionEvent = Deepgram.listen.ListenV1Results;
type LiveConnection = Awaited<ReturnType<DeepgramClient["listen"]["v1"]["createConnection"]>>;

interface LiveOptions {
  model?: string;
  language?: string;
  interim_results?: boolean;
  smart_format?: boolean;
  filler_words?: boolean;
  utterance_end_ms?: number;
}

interface DeepgramContextType {
  connection: LiveConnection | null;
  connectToDeepgram: (options: LiveOptions) => Promise<void>;
  disconnectFromDeepgram: () => void;
  connectionState: LiveConnectionState;
}

const DeepgramContext = createContext<DeepgramContextType | undefined>(undefined);

async function getToken(): Promise<string> {
  const response = await fetch("/api/authenticate", { cache: "no-store" });
  const result = await response.json();
  if (!response.ok || typeof result.access_token !== "string") {
    throw new Error("Unable to create a temporary Deepgram token");
  }
  return result.access_token;
}

export const DeepgramContextProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
  const [connection, setConnection] = useState<LiveConnection | null>(null);
  const [connectionState, setConnectionState] = useState<LiveConnectionState>(LiveConnectionState.CLOSED);

  const connectToDeepgram = async (options: LiveOptions) => {
    const token = await getToken();
    const deepgram = new DeepgramClient({ accessToken: token });
    const connectionOptions = {
      model: options.model ?? "nova-3",
      language: options.language,
      interim_results: String(options.interim_results ?? true),
      smart_format: String(options.smart_format ?? true),
      filler_words: String(options.filler_words ?? false),
      utterance_end_ms: options.utterance_end_ms ? String(options.utterance_end_ms) : undefined,
    };
    const nextConnection = await deepgram.listen.v1.createConnection(connectionOptions);

    nextConnection.on("open", () => {
      setConnection(nextConnection);
      setConnectionState(LiveConnectionState.OPEN);
    });
    nextConnection.on("close", () => {
      setConnection(null);
      setConnectionState(LiveConnectionState.CLOSED);
    });
    nextConnection.on("error", () => {
      setConnectionState(LiveConnectionState.CLOSED);
    });
    nextConnection.connect();
  };

  const disconnectFromDeepgram = () => {
    connection?.close();
    setConnection(null);
    setConnectionState(LiveConnectionState.CLOSED);
  };

  return (
    <DeepgramContext.Provider value={{ connection, connectToDeepgram, disconnectFromDeepgram, connectionState }}>
      {children}
    </DeepgramContext.Provider>
  );
};

export function useDeepgram(): DeepgramContextType {
  const context = useContext(DeepgramContext);
  if (!context) throw new Error("useDeepgram must be used within a DeepgramContextProvider");
  return context;
}
