"use client";

import { ChatBubble, LeftBubble, RightBubble } from "./chatbubbles";
import {
  CreateProjectKeyResponse,
  LiveClient,
  LiveConnectionState,
  LiveTranscriptionEvent,
  LiveTranscriptionEvents,
  createClient,
} from "@deepgram/sdk";
import {
  blankUserMessage,
  getConversationMessages,
  getUserMessages,
  utteranceText,
} from "../lib/helpers";
import { systemContent } from "../lib/constants";
import { InitialLoad } from "./initialload";
import { isBrowser } from "react-device-detect";
import { useChat } from "ai/react";
import { useQueue } from "@uidotdev/usehooks";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { LLMRequestMetadata, LLMMessage } from "../lib/types";
import { CreateMessage } from "ai";

/**
 * Conversation element that contains the conversational AI app.
 * @returns {JSX.Element}
 */
export default function Conversation() {
  const { messages: gptmessages, append } = useChat({ api: "/api/brain" });

  useEffect(() => {
    console.log(gptmessages);
  }, [gptmessages]);

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
  const [llmRequest, setLlmRequest] = useState<LLMRequestMetadata>({
    sent: false,
    sentTimestamp: null,
    replied: false,
    replyTimestamp: null,
  });
  const [micOpen, setMicOpen] = useState(false);
  const [microphone, setMicrophone] = useState<MediaRecorder | null>();
  const [textInput, setTextInput] = useState<string>("");
  const [userMedia, setUserMedia] = useState<MediaStream | null>();
  const [utterance, setUtterance] = useState<LLMMessage>(blankUserMessage);

  const [voiceActivity, setVoiceActivity] = useState<{
    voiceActivity: boolean;
    timestamp: number;
  }>();

  /**
   * Queues
   */
  const {
    add: addToQueue,
    remove: removeFromQueue,
    first: topOfQueue,
    size: queueSize,
    queue: dataQueue,
  } = useQueue<Blob>([]);

  const {
    add: addMessage,
    queue: messages,
    last: newestMessage,
    size: numberOfMessages,
  } = useQueue<LLMMessage>([
    { role: "system", name: "Emily", content: systemContent },
  ]);

  // const sentToLlm = useCallback(() => {
  //   setLlmRequest({
  //     sent: true,
  //     sentTimestamp: new Date(),
  //     replied: false,
  //     replyTimestamp: null,
  //   });
  // }, [setLlmRequest]);

  // const responseFromLlm = useCallback(() => {
  //   setLlmRequest({ ...llmRequest, replied: true, replyTimestamp: new Date() });
  // }, [llmRequest, setLlmRequest]);

  // const hasLlmMessageSent = useCallback(() => {
  //   return llmRequest.sent;
  // }, [llmRequest]);

  // const hasLlmReplied = useCallback(() => {
  //   return llmRequest.replied;
  // }, [llmRequest]);

  /**
   * toggle microphone on/off function
   */
  const toggleMicrophone = useCallback(async () => {
    if (initialLoad) {
      setInitialLoad(!initialLoad);
    }

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
        addToQueue(e.data);
      };

      setUserMedia(userMedia);
      setMicrophone(microphone);
    }
  }, [initialLoad, microphone, userMedia, addToQueue]);

  useEffect(() => {
    // if (getUserMessages(messages).length > 0) {
    //   setMessages(messages);
    // }
    append(newestMessage as CreateMessage);
  }, [numberOfMessages, newestMessage, append]);

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
        model: "nova",
        interim_results: true,
        smart_format: true,
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
                addMessage({
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
  }, [addMessage, apiKey]);

  /**
   * magic audio queue processing
   */
  useEffect(() => {
    const processQueue = async () => {
      if (queueSize > 0 && !isProcessing) {
        setProcessing(true);

        if (isListening) {
          if (topOfQueue) {
            connection?.send(topOfQueue);
          }

          removeFromQueue();
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
    dataQueue,
    removeFromQueue,
    topOfQueue,
    queueSize,
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
  }, [numberOfMessages]);

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
            <div className="flex flex-col justify-between h-full pt-4">
              <div
                className={`flex flex-col h-full pb-6 overflow-hidden ${
                  initialLoad ? "justify-center" : "justify-end"
                }`}
              >
                <div className="grid grid-cols-12 overflow-x-auto gap-y-2">
                  {initialLoad && <InitialLoad fn={toggleMicrophone} />}

                  {getConversationMessages(messages).length > 0 &&
                    getConversationMessages(messages).map((message, i) => (
                      <ChatBubble message={message} key={i} />
                    ))}

                  {utterance && utterance.content && (
                    <RightBubble meta={"20ms"}>
                      <p className="cursor-blink">{utterance.content}</p>
                    </RightBubble>
                  )}

                  <div ref={messageMarker}></div>
                </div>
              </div>
              <div className="flex flex-row items-center h-16 rounded-xl bg-zinc-900 w-full px-3 text-sm sm:text-base">
                <div className="mr-3">
                  <button
                    onClick={() => toggleMicrophone()}
                    className={`group flex items-center justify-center rounded-lg hover:bg-white text-white hover:text-black px-4 lg:px-6 py-2 flex-shrink-0 ${
                      micOpen ? "bg-[rgb(53,67,234)] " : "bg-[rgb(234,67,53)] "
                    }`}
                  >
                    <div className="w-4 h-4 hidden sm:inline mr-2">
                      <svg
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                        <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
                      </svg>
                    </div>

                    <span>
                      {micOpen
                        ? `${isBrowser ? "Click" : "Tap"} to stop`
                        : `${isBrowser ? "Click" : "Tap"} to start`}

                      <span className="hidden md:inline">
                        {isBrowser && (
                          <>
                            {" "}
                            <small
                              className={`group-hover:text-gray-500 ${
                                micOpen ? "text-blue-100" : "text-red-200"
                              }`}
                            >
                              or press &apos;space&apos;
                            </small>
                          </>
                        )}
                      </span>
                    </span>
                  </button>
                </div>
                <div className="flex-grow">
                  <div className="relative w-full">
                    {/**
                     * text input field
                     */}
                    <input
                      disabled={initialLoad || micOpen}
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      onKeyUp={(e) => {
                        if (e.key === "Enter" && textInput !== "") {
                          addMessage({
                            role: "user",
                            content: textInput,
                          });
                          setTextInput("");
                        }
                      }}
                      type="text"
                      className={`flex w-full border rounded-lg border-zinc-600 focus:outline-none focus:border-indigo-300 pl-4 h-10 ${
                        initialLoad || micOpen ? "opacity-30" : "opacity-100"
                      }`}
                      placeholder={
                        initialLoad
                          ? "... or send me a message ..."
                          : micOpen
                          ? "... close mic to send a message ..."
                          : "Send me a message"
                      }
                    />
                  </div>
                </div>
                <div className="ml-3">
                  <button
                    onClick={() => {
                      addMessage({
                        role: "user",
                        content: textInput,
                      });
                      setTextInput("");
                    }}
                    disabled={initialLoad || micOpen}
                    className={`flex items-center justify-center bg-[#00CF56]/50 rounded-lg text-white px-4 lg:px-6 py-2 flex-shrink-0 ${
                      initialLoad || micOpen
                        ? "opacity-30"
                        : "opacity-100 hover:bg-white hover:text-black"
                    }`}
                  >
                    <span>Send</span>
                    <svg
                      className="w-4 h-4 transform rotate-45 -mt-1 ml-4 hidden sm:inline"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
