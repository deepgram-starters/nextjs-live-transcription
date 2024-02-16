"use client";

import { blankUserMessage, utteranceText } from "@/app/lib/helpers";
import { ChatBubble } from "@/app/components/ChatBubble";
import {
  CreateProjectKeyResponse,
  LiveClient,
  LiveConnectionState,
  LiveTranscriptionEvent,
  LiveTranscriptionEvents,
  createClient,
} from "@deepgram/sdk";
import { Controls } from "@/app/components/Controls";
import { CreateMessage, Message } from "ai";
import { InitialLoad } from "@/app/components/InitialLoad";
import { RightBubble } from "@/app/components/RightBubble";
import { systemContent } from "@/app/lib/constants";
import { useChat } from "ai/react";
import { useQueue } from "@uidotdev/usehooks";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";

/**
 * Conversation element that contains the conversational AI app.
 * @returns {JSX.Element}
 */
export default function Conversation(): JSX.Element {
  const useChatOptions = useMemo(
    () => ({
      api: "/api/brain",
      onResponse: (res: any) => {
        console.log(res);
      },
      onFinish: (msg: any) => {
        console.log(msg);
      },
      onError: (err: any) => {
        console.log(err);
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
    []
  );
  const { messages, append, handleInputChange, input, handleSubmit } =
    useChat(useChatOptions);

  // append({
  //   role: "system",
  //   content: systemContent,
  // });

  useEffect(() => {
    console.log(messages);
  }, [messages]);

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

  const [micOpen, setMicOpen] = useState(false);
  const [microphone, setMicrophone] = useState<MediaRecorder | null>();
  // const [textInput, setTextInput] = useState<string>("");
  const [userMedia, setUserMedia] = useState<MediaStream | null>();
  const [utterance, setUtterance] = useState<CreateMessage>(blankUserMessage);

  const [voiceActivity, setVoiceActivity] = useState<{
    voiceActivity: boolean;
    timestamp: number;
  }>();

  /**
   * Queues
   */
  const {
    add: addAudioBlob,
    remove: removeAudioBlob,
    first: firstAudioBlob,
    size: countAudioBlobs,
    queue: audioBlobs,
  } = useQueue<Blob>([]);

  const startConversation = useCallback(() => {
    setInitialLoad(!initialLoad);
  }, [initialLoad]);

  /**
   * toggle microphone on/off function
   */
  const toggleMicrophone = useCallback(async () => {
    if (microphone && userMedia) {
      setUserMedia(null);
      setMicrophone(null);

      if (microphone) {
        microphone.stop();
      }
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
      microphone.start(500);

      microphone.onstart = () => {
        setMicOpen(true);
      };

      microphone.onstop = () => {
        setMicOpen(false);
      };

      microphone.ondataavailable = (e) => {
        addAudioBlob(e.data);
      };

      setUserMedia(userMedia);
      setMicrophone(microphone);
    }
  }, [microphone, userMedia, addAudioBlob]);

  /**
   * getting a new api key
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

  /**
   * connect to deepgram
   */
  useEffect(() => {
    if (apiKey && "key" in apiKey) {
      const deepgram = createClient(apiKey?.key ?? "");
      const connection = deepgram.listen.live({
        model: "nova-2",
        interim_results: true,
        smart_format: true,
        endpointing: 250,
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
            const content = utteranceText(data);

            if (content) {
              if (data.is_final) {
                append({
                  role: "user",
                  content,
                });
                setUtterance(blankUserMessage);
              } else {
                setUtterance({
                  role: "user",
                  content,
                });
              }
            }
          }
        );
      });

      setConnection(connection);
      setLoading(false);
    }
  }, [append, apiKey]);

  /**
   * magic audio queue processing
   */
  useEffect(() => {
    const processQueue = async () => {
      if (countAudioBlobs > 0 && !isProcessing) {
        setProcessing(true);

        if (isListening) {
          if (firstAudioBlob) {
            connection?.send(firstAudioBlob);
          }

          removeAudioBlob();
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
    audioBlobs,
    removeAudioBlob,
    firstAudioBlob,
    countAudioBlobs,
    isProcessing,
    isListening,
  ]);

  /**
   * keep alive when mic closed
   */
  useEffect(() => {
    let keepAlive: any;
    if (connection && isListening && !micOpen) {
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
  }, [connection, isListening, micOpen]);

  // this works
  useEffect(() => {
    if (messageMarker.current) {
      messageMarker.current.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
    }
  }, [messages, utterance]);

  // /**
  //  * registering key up/down events
  //  */
  // useEffect(() => {
  //   const onKeyUp = (event: Event | KeyboardEvent) => {
  //     if ("key" in event && event.code === "Space") {
  //       event.preventDefault();
  //       toggleMicrophone();
  //     }
  //   };

  //   if (isListening) {
  //     document.addEventListener("keyup", onKeyUp);
  //   }

  //   return () => {
  //     document.removeEventListener("keyup", onKeyUp);
  //   };
  // }, [isListening, toggleMicrophone]);

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

                      {utterance && utterance.content && (
                        <RightBubble
                          text={utterance.content}
                          blink={true}
                        ></RightBubble>
                      )}

                      <div
                        className="h-4 col-start-1 col-end-13"
                        ref={messageMarker}
                      ></div>
                    </>
                  )}
                </div>
              </div>
              {!initialLoad && (
                <Controls
                  micToggle={toggleMicrophone}
                  micOpen={micOpen}
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
