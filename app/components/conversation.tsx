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
  getRandomGreeting,
  getUserMessages,
  utteranceText,
} from "../lib/helpers";
import { systemContent } from "../lib/constants";
import { InitialLoad } from "./initialload";
import { isBrowser } from "react-device-detect";
import { useQueue, useThrottle } from "@uidotdev/usehooks";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { LLMRequestMetadata, LLMMessage } from "../lib/types";

/**
 * Conversation element that contains the conversational AI app.
 * @returns {JSX.Element}
 */
export default function Conversation() {
  /**
   * Refs
   */
  const messageMarker = useRef<null | HTMLDivElement>(null);

  /**
   * Memos
   */
  const greeting = useMemo(() => getRandomGreeting(), []);

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
      addMessage({
        role: "assistant",
        content: greeting.text,
        name: "Emily",
      });
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
  }, [
    initialLoad,
    microphone,
    userMedia,
    addMessage,
    greeting.text,
    addToQueue,
  ]);

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

  // /**
  //  * turn utterance into message history when finalised
  //  */
  // useEffect(() => {
  //   if (utterance?.is_final) {
  //     const content = utteranceText(utterance);

  //     if (content !== "") {
  //       addMessage({
  //         role: "user",
  //         content,
  //       });
  //       setUtterance(null);
  //     }
  //   }
  // }, [addMessage, utterance]);

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

  /**
   * registering key up/down events
   */
  useEffect(() => {
    const onKeyUp = (event: Event | KeyboardEvent) => {
      if ("key" in event && event.code === "Space") {
        event.preventDefault();
        toggleMicrophone();
      }
    };

    if (isListening) {
      document.addEventListener("keyup", onKeyUp);
    }

    return () => {
      document.removeEventListener("keyup", onKeyUp);
    };
  }, [isListening, toggleMicrophone]);

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

                  {/**
                   * message bubbles (left/right)
                   */}
                  {getUserMessages(messages).length > 0 &&
                    getUserMessages(messages).map((message, i) => (
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
                  {/**
                   * start button in message bar
                   */}
                  <button
                    onClick={() => toggleMicrophone()}
                    className={`group flex items-center justify-center rounded-lg hover:bg-white text-white hover:text-black px-4 lg:px-6 py-2 flex-shrink-0 ${
                      micOpen ? "bg-[rgb(53,67,234)] " : "bg-[rgb(234,67,53)] "
                    }`}
                  >
                    {/* <div className="w-4 h-4 hidden sm:inline mr-2">
                      {micOpen ? (
                        <svg
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                          <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
                        </svg>
                      ) : (
                        <svg
                          width="22"
                          height="17"
                          viewBox="0 0 22 17"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M20.6875 15.6875C21.0312 15.9375 21.0938 16.4062 20.8125 16.7188C20.6562 16.9062 20.4375 17 20.2188 17C20.0625 17 19.9062 16.9688 19.75 16.8125L1.28125 2.34375C0.9375 2.09375 0.875 1.625 1.15625 1.3125C1.40625 0.96875 1.875 0.90625 2.1875 1.1875L7.6875 5.5L11.3125 2.28125C11.5 2.09375 11.75 2 12 2C12.125 2 12.25 2.03125 12.4062 2.09375C12.75 2.25 13 2.625 13 3V9.625L14.6875 10.9688C14.5938 10.6875 14.6875 10.375 14.9375 10.1562C15.2812 9.875 15.5 9.46875 15.5 9C15.5 8.5625 15.2812 8.15625 14.9375 7.875C14.5938 7.59375 14.5625 7.125 14.8125 6.8125C14.9688 6.625 15.1875 6.53125 15.4062 6.53125C15.5625 6.53125 15.75 6.59375 15.875 6.6875C16.5938 7.28125 17 8.125 17 9C17 9.90625 16.5938 10.75 15.875 11.3438C15.75 11.4375 15.5625 11.5 15.4062 11.5C15.375 11.5 15.375 11.5 15.3438 11.5L16.75 12.5625C16.7812 12.5312 16.7812 12.5 16.8125 12.4688C17.875 11.625 18.5 10.3438 18.5 9C18.5 7.6875 17.875 6.40625 16.8125 5.59375C16.5 5.3125 16.4375 4.84375 16.7188 4.53125C16.875 4.34375 17.0625 4.25 17.2812 4.25C17.4688 4.25 17.625 4.3125 17.7812 4.40625C19.1875 5.53125 20 7.21875 20 9C20 10.7188 19.2188 12.3438 17.9375 13.5L20.6875 15.6875ZM11.5 8.4375V4.125L8.90625 6.4375L11.5 8.4375ZM11.5 13.9062V12.2812L13 13.4375V15C13 15.4062 12.75 15.75 12.4062 15.9375C12.25 16 12.125 16 12 16C11.75 16 11.5 15.9375 11.3125 15.7188L7.09375 12H4.5C3.65625 12 3 11.3438 3 10.5V7.5C3 6.9375 3.3125 6.46875 3.75 6.21875L5.4375 7.53125H4.5V10.5H7.6875L11.5 13.9062Z"
                            fill="white"
                          />
                        </svg>
                      )}
                    </div> */}

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
                  {/**
                   * text send button
                   */}
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
