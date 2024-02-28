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

  const { nowPlaying, setNowPlaying, clearNowPlaying } = useNowPlaying();

  /**
   * Queues
   */
  const {
    add: addMicrophoneBlob,
    remove: removeMicrophoneBlob,
    first: firstMicrophoneBlob,
    size: countMicrophoneBlobs,
    queue: microphoneBlobs,
  } = useQueue<Blob>([]);

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
  const [userMedia, setUserMedia] = useState<MediaStream | null>();
  const [voiceActivity, setVoiceActivity] = useState<{
    voiceActivity: boolean;
    timestamp: number;
  }>();

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
        latency:
          Number(headers.get("X-DG-Latency")) ?? (Date.now() - start) / 1000,
        played: false,
      });
    },
    [enqueueItem]
  );

  const toggleMicrophone = useCallback(async () => {
    if (userMedia) {
      userMedia.getAudioTracks().every((track) => {
        track.stop();
      });
      setUserMedia(null);
    } else {
      const userMedia = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
        },
      });

      const context = new AudioContext();
      await context.audioWorklet.addModule(`/vad.worklet.js?v=${Date.now()}`);

      const source = context.createMediaStreamSource(userMedia);
      const workletNode = new AudioWorkletNode(
        context,
        "voice-activity-processor"
      );

      source.connect(workletNode);
      workletNode.connect(context.destination);
      workletNode.port.onmessage = (
        e: MessageEvent<{ voiceActivity: boolean; timestamp: number }>
      ) => setVoiceActivity(e.data);

      const microphone = new MediaRecorder(userMedia);
      microphone.start(1000);

      microphone.ondataavailable = (e) => {
        addMicrophoneBlob(e.data);
      };

      setUserMedia(userMedia);
    }
  }, [userMedia, addMicrophoneBlob]);

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
      "/api/speak?uri=alpha-athena-en_hello-my-name-is.mp3"
    );

    enqueueItem({
      id: "welcome",
      blob: await res.blob(),
      latency: (Date.now() - start) / 1000,
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

  useEffect(() => {
    if (apiKey?.key) {
      const deepgram = createClient(apiKey?.key ?? "");
      const connection = deepgram.listen.live({
        model: "nova-2",
        interim_results: true,
        smart_format: true,
        endpointing: 250,
        utterance_end_ms: 5000,
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
   * magic microphone audio queue processing
   */
  useEffect(() => {
    const processQueue = async () => {
      if (countMicrophoneBlobs > 0 && !isProcessing) {
        setProcessing(true);

        if (isListening) {
          const nextBlob = firstMicrophoneBlob;
          if (nextBlob) {
            connection?.send(nextBlob);
          }

          removeMicrophoneBlob();
        }

        const waiting = setTimeout(() => {
          clearTimeout(waiting);
          setProcessing(false);
        }, 250);
      }
    };

    processQueue();
  }, [
    connection,
    microphoneBlobs,
    removeMicrophoneBlob,
    firstMicrophoneBlob,
    countMicrophoneBlobs,
    isProcessing,
    isListening,
  ]);

  // monitoring speech queue for now
  useEffect(() => {
    console.log(playQueue);
  }, [playQueue]);

  /**
   * magic tts audio queue processing mk2
   */
  useEffect(() => {
    if (playQueue.length > 0) {
      console.log(nowPlaying);
      const playableItems = playQueue.filter((item) => !item.played);
      const nextPlayableItem = playableItems[playableItems.length - 1];
      if (nextPlayableItem && !nowPlaying) {
        setNowPlaying(nextPlayableItem);
      }
    }
  }, [playQueue, updateItem, nowPlaying, setNowPlaying, clearNowPlaying]);

  /**
   * keep alive when mic closed
   */
  useEffect(() => {
    let keepAlive: any;
    if (connection && isListening && !userMedia) {
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
  }, [connection, isListening, userMedia]);

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
      <span className="w-full text-center">Loading temporary API key...</span>
    );
  }

  /**
   * loading message (app)
   */
  if (isLoading) {
    return <span className="w-full text-center">Loading the app...</span>;
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
                  micToggle={toggleMicrophone}
                  micOpen={userMedia?.active || false}
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
