"use client";

import {
  CreateProjectKeyResponse,
  LiveClient,
  LiveConnectionState,
  LiveTranscriptionEvent,
  LiveTranscriptionEvents,
  createClient,
} from "@deepgram/sdk";
import { ChatBubble } from "./ChatBubble";
import { Controls } from "./Controls";
import { InitialLoad } from "./InitialLoad";
import { CreateMessage, Message } from "ai";
import { RightBubble } from "./RightBubble";
import { systemContent } from "../lib/constants";
import { SpeechBlob } from "../lib/types";
import { useChat } from "ai/react";
import { useQueue } from "@uidotdev/usehooks";
import { useState, useEffect, useCallback, useRef } from "react";
import { utteranceText } from "../lib/helpers";
import { useNowPlaying } from "../context/NowPlaying";
import { usePlayQueue } from "../context/PlayQueue";
import { Spinner } from "flowbite-react";
import { useMicrophone } from "../context/Microphone";

/**
 * Conversation element that contains the conversational AI app.
 * @returns {JSX.Element}
 */
export default function Conversation(): JSX.Element {
  /**
   * Custom context providers
   */
  const {
    playQueue,
    // setPlayQueue,
    // clearQueue,
    enqueueItem,
    updateItem,
  } = usePlayQueue();

  const { nowPlaying, setNowPlaying } = useNowPlaying();

  /**
   * Queues
   */
  const {
    add: addTranscriptPart,
    queue: transcriptParts,
    clear: clearTranscriptParts,
  } = useQueue<{ is_final: boolean; speech_final: boolean; text: string }>([]);

  /**
   * Refs
   */
  const messageMarker = useRef<null | HTMLDivElement>(null);

  /**
   * State
   */
  const [apiKey, setApiKey] = useState<CreateProjectKeyResponse | null>();
  const [connection, setConnection] = useState<LiveClient | null>();
  const [initialLoad, setInitialLoad] = useState(true);
  const [isListening, setListening] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [isLoadingKey, setLoadingKey] = useState(true);
  const [isProcessing, setProcessing] = useState(false);
  // const [userMedia, setUserMedia] = useState<MediaStream | null>();

  /**
   * Contextual functions
   */
  const requestTtsAudio = useCallback(
    async (message: Message) => {
      const start = Date.now();

      const res = await fetch("/api/speak", {
        cache: "no-store",
        method: "POST",
        body: JSON.stringify(message),
      });

      const headers = res.headers;

      enqueueItem({
        id: message.id,
        blob: await res.blob(),
        latency: Number(headers.get("X-DG-Latency")) ?? Date.now() - start,
        played: false,
      });
    },
    [enqueueItem]
  );

  const onFinish = useCallback(
    (msg: any) => {
      requestTtsAudio(msg);
    },
    [requestTtsAudio]
  );

  /**
   * AI SDK
   */
  const {
    messages: chatMessages,
    append,
    handleInputChange,
    input,
    handleSubmit,
  } = useChat({
    id: "aura",
    api: "/api/brain",
    initialMessages: [
      {
        role: "system",
        content: systemContent,
      } as Message,
      {
        id: "welcome",
        role: "assistant",
        content: "Hello! My name is Emily. How can I help you today?",
      } as Message,
    ],
    onFinish,
  });

  /**
   * Contextual functions
   */
  const requestWelcomeAudio = useCallback(async () => {
    const start = Date.now();

    const res = await fetch(
      "/api/speak?uri=aura-athena-en_hello-my-name-is.mp3"
    );

    enqueueItem({
      id: "welcome",
      blob: await res.blob(),
      latency: Date.now() - start,
      played: false,
    });
  }, [enqueueItem]);

  const startConversation = useCallback(() => {
    setInitialLoad(false);

    // get welcome audio
    requestWelcomeAudio();
  }, [requestWelcomeAudio]);

  /**
   * Reactive effects
   */
  useEffect(() => {
    if (!apiKey) {
      fetch("/api/authenticate", { cache: "no-store" })
        .then((res) => res.json())
        .then((object) => {
          if (!("key" in object)) throw new Error("No api key returned");

          setApiKey(object);
          setLoadingKey(false);
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }, [apiKey]);

  const { player, clearNowPlaying } = useNowPlaying();

  useEffect(() => {
    if (apiKey?.key) {
      const deepgram = createClient(apiKey?.key ?? "");
      const connection = deepgram.listen.live({
        model: "nova-2",
        interim_results: true,
        smart_format: true,
        endpointing: 250,
        utterance_end_ms: 5000,
        vad_events: true,
        filler_words: true,
      });

      /**
       * connection established
       */
      connection.on(LiveTranscriptionEvents.Open, (e: any) => {
        setListening(true);

        /**
         * connection closed
         */
        connection.on(LiveTranscriptionEvents.Close, (e: any) => {
          setListening(false);
          setApiKey(null);
          setConnection(null);
        });

        /**
         * error detected
         */
        connection.on(LiveTranscriptionEvents.Error, (e: any) => {
          console.error("websocket event: Error", e);
        });

        /**
         * transcript response received
         */
        connection.on(
          LiveTranscriptionEvents.Transcript,
          (data: LiveTranscriptionEvent) => {
            let content = utteranceText(data);
            if (content) {
              /**
               * use an outbound message queue to build up the unsent utterance
               */
              addTranscriptPart({
                is_final: data.is_final as boolean,
                speech_final: data.speech_final as boolean,
                text: content,
              });
            }
          }
        );
      });

      setConnection(connection);
      setLoading(false);
    }
  }, [addTranscriptPart, apiKey, append]);

  const [currentUtterance, setCurrentUtterance] = useState("");

  const getCurrentUtterance = useCallback(() => {
    return transcriptParts.filter(({ is_final, speech_final }, i, arr) => {
      return is_final || speech_final || (!is_final && i === arr.length - 1);
    });
  }, [transcriptParts]);

  useEffect(() => {
    const parts = getCurrentUtterance();
    const last = parts[parts.length - 1];
    const content = parts.map(({ text }) => text).join(" ");
    setCurrentUtterance(content);

    if (last && last.speech_final) {
      append({
        role: "user",
        content,
      });
      clearTranscriptParts();
      setCurrentUtterance("");
    }
  }, [getCurrentUtterance, clearTranscriptParts, append]);

  /**
   * barge-in
   */
  useEffect(() => {
    if (!currentUtterance || currentUtterance === "") return;

    if (nowPlaying) {
      player?.current?.pause();
      clearNowPlaying();
      updateItem(nowPlaying.id, { played: true });
    }
  }, [currentUtterance, clearNowPlaying, nowPlaying, player, updateItem]);

  const {
    microphoneOpen,
    queue: microphoneQueue,
    queueSize: microphoneQueueSize,
    firstBlob,
    removeBlob,
  } = useMicrophone();

  /**
   * magic microphone audio queue processing
   */
  useEffect(() => {
    const processQueue = async () => {
      if (microphoneQueueSize > 0 && !isProcessing) {
        setProcessing(true);

        if (isListening) {
          const nextBlob = firstBlob;
          if (nextBlob) {
            connection?.send(nextBlob);
          }

          removeBlob();
        }

        const waiting = setTimeout(() => {
          clearTimeout(waiting);
          setProcessing(false);
        }, 200);
      }
    };

    processQueue();
  }, [
    connection,
    microphoneQueue,
    removeBlob,
    firstBlob,
    microphoneQueueSize,
    isProcessing,
    isListening,
  ]);

  /**
   * magic tts audio queue processing mk2
   */
  useEffect(() => {
    if (playQueue.length > 0) {
      const playableItems = playQueue.filter((item) => !item.played);
      const nextPlayableItem = playableItems[playableItems.length - 1];
      if (nextPlayableItem && !nowPlaying) {
        setNowPlaying(nextPlayableItem);
      }
    }
  }, [nowPlaying, playQueue, setNowPlaying]);

  /**
   * keep alive when mic closed
   */
  useEffect(() => {
    let keepAlive: any;
    if (connection && isListening && !microphoneOpen) {
      keepAlive = setInterval(() => {
        // should stop spamming dev console when working on frontend in devmode
        if (connection?.getReadyState() !== LiveConnectionState.OPEN) {
          clearInterval(keepAlive);
        } else {
          connection.keepAlive();
        }
      }, 10000);
    } else {
      clearInterval(keepAlive);
    }

    // prevent duplicate timeouts
    return () => {
      clearInterval(keepAlive);
    };
  }, [connection, isListening, microphoneOpen]);

  // this works
  useEffect(() => {
    if (messageMarker.current) {
      messageMarker.current.scrollIntoView({
        block: "end",
        behavior: "auto",
      });
    }
  }, [chatMessages]);

  /**
   * loading message (api key)
   */
  if (isLoadingKey) {
    return (
      <div className="w-auto h-full items-center flex justify-center">
        <Spinner size={"md"} className="-mt-1 mr-2" />
        Connecting...
      </div>
    );
  }

  /**
   * loading message (app)
   */
  if (isLoading) {
    return (
      <div className="w-auto h-full items-center flex justify-center">
        <Spinner size={"md"} className="-mt-1 mr-2" />
        Loading...
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full antialiased">
        <div className="flex flex-row h-full w-full overflow-x-hidden">
          <div className="flex flex-col flex-auto h-full">
            <div className="flex flex-col justify-between h-full">
              <div
                className={`flex flex-col h-full overflow-hidden ${
                  initialLoad ? "justify-center" : "justify-end"
                }`}
              >
                <div className="grid grid-cols-12 overflow-x-auto gap-y-2">
                  {initialLoad ? (
                    <InitialLoad fn={startConversation} />
                  ) : (
                    <>
                      {chatMessages.length > 0 &&
                        chatMessages.map((message, i) => (
                          <ChatBubble message={message} key={i} />
                        ))}

                      {currentUtterance && (
                        <RightBubble text={currentUtterance}></RightBubble>
                      )}

                      <div
                        className="h-16 col-start-1 col-end-13"
                        ref={messageMarker}
                      ></div>
                    </>
                  )}
                </div>
              </div>
              {!initialLoad && (
                <Controls
                  handleSubmit={handleSubmit}
                  handleInputChange={handleInputChange}
                  input={input}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
