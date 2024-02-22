"use client";

import { blankUserMessage, utteranceText } from "../lib/helpers";
import { ChatBubble } from "./ChatBubble";
import {
  CreateProjectKeyResponse,
  LiveClient,
  LiveConnectionState,
  LiveTranscriptionEvent,
  LiveTranscriptionEvents,
  createClient,
} from "@deepgram/sdk";
import { Controls } from "./Controls";
import { CreateMessage, Message } from "ai";
import { InitialLoad } from "./InitialLoad";
import { RightBubble } from "./RightBubble";
import { systemContent } from "../lib/constants";
import { useChat } from "ai/react";
import { useQueue } from "@uidotdev/usehooks";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";

/**
 * Conversation element that contains the conversational AI app.
 * @returns {JSX.Element}
 */
export default function Conversation(): JSX.Element {
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
    add: addSpeechBlob,
    remove: removeSpeechBlob,
    first: firstSpeechBlob,
    size: countSpeechBlobs,
    queue: speechBlobs,
  } = useQueue<Blob>([]);

  const {
    add: addTranscriptPart,
    remove: removeTranscriptPart,
    first: firstTranscriptPart,
    size: countTranscriptParts,
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
  // const [utterance, setUtterance] = useState<CreateMessage>(blankUserMessage);
  let utterance = useRef(blankUserMessage);

  const [voiceActivity, setVoiceActivity] = useState<{
    voiceActivity: boolean;
    timestamp: number;
  }>();

  /**
   * Contextual functions
   */
  const requestTtsAudio = useCallback(
    async (message: Message) => {
      const res = await fetch("/api/speak", {
        cache: "no-store",
        method: "POST",
        body: JSON.stringify(message),
      });

      addSpeechBlob(await res.blob());
    },
    [addSpeechBlob]
  );

  const startConversation = useCallback(() => {
    setInitialLoad(!initialLoad);
  }, [initialLoad]);

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

  // useEffect(() => {
  //   console.log(countMicrophoneBlobs);
  // }, [countMicrophoneBlobs]);

  /**
   * Memos
   */
  const useChatOptions = useMemo(
    () => ({
      api: "/api/brain",
      onResponse: (res: any) => {
        // console.log(res);
      },
      onFinish: (msg: any) => {
        // console.log(msg);
        requestTtsAudio(msg);
      },
      onError: (err: any) => {
        // console.log(err);
      },
      initialMessages: [
        {
          role: "system",
          content: systemContent,
        } as Message,
        {
          role: "assistant",
          content: "Hello! My name is Emily. How can I help you today?",
        } as Message,
      ],
    }),
    [requestTtsAudio]
  );

  /**
   * AI SDK
   */
  const { messages, append, handleInputChange, input, handleSubmit } =
    useChat(useChatOptions);

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
            console.log(data);
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

            // if (content) {
            //   utterance.current = {
            //     role: "user",
            //     content,
            //   };

            //   if (data.is_final) {
            //     const existingContent = utterance.current.content;
            //     content = [existingContent, content].filter(Boolean).join("\n");

            //     utterance.current = {
            //       role: "user",
            //       content,
            //     };

            //     if (data.speech_final) {
            //       append({
            //         role: "user",
            //         content,
            //       });
            //       utterance.current = blankUserMessage;
            //     }
            //   }
            // }
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
            console.log(nextBlob);
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

  /**
   * magic tts audio queue processing
   */
  // useEffect(() => {
  //   const processQueue = async () => {
  //     if (countSpeechBlobs > 0 /*&& !playback*/) {
  //       // setPlayback(true);

  //       if (firstSpeechBlob) {
  //         const url = window.URL.createObjectURL(firstSpeechBlob);
  //         const tmp = new Audio(url);
  //         tmp.play();
  //       }

  //       // removeSpeechBlob(); // probably won't remove from queue because we want to enable further playback

  //       // const waiting = setTimeout(() => {
  //       //   clearTimeout(waiting);
  //       //   setPlayback(false);
  //       // }, 250);
  //     }
  //   };

  //   processQueue();
  // }, [
  //   speechBlobs,
  //   removeSpeechBlob,
  //   firstSpeechBlob,
  //   countSpeechBlobs,
  //   // setPlayback,
  // ]);

  /**
   * keep alive when mic closed
   */
  useEffect(() => {
    let keepAlive: any;
    if (connection && isListening && !userMedia) {
      keepAlive = setInterval(() => {
        // should stop spamming dev console when working on frontend in devmode
        if (connection?.getReadyState() !== LiveConnectionState.OPEN) {
          console.log("connection closed, stopping keep alive");
          clearInterval(keepAlive);
        } else {
          console.log("keep alive");
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
  }, [messages]);

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
                      {messages.length > 0 &&
                        messages.map((message, i) => (
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
