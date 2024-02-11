"use client";

import { ChatBubble, LeftBubble } from "./chatbubbles";
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
import { useQueue } from "@uidotdev/usehooks";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { LLMRequestMetadata, LLMMessage } from "../lib/types";

/**
 * Conversation element that contains the conversational AI app.
 * @returns {JSX.Element}
 */
export default function Conversation() {
  const messageWindow = useRef<null | HTMLDivElement>(null);
  const greeting = useMemo(() => getRandomGreeting(), []);
  const [textInput, setTextInput] = useState("");
  const [initialLoad, setInitialLoad] = useState(true);
  const [apiKey, setApiKey] = useState<CreateProjectKeyResponse | null>();
  const [connection, setConnection] = useState<LiveClient | null>();
  const [isListening, setListening] = useState(false);
  const [isLoadingKey, setLoadingKey] = useState(true);
  const [isLoading, setLoading] = useState(true);
  const [isProcessing, setProcessing] = useState(false);
  const [micOpen, setMicOpen] = useState(false);
  const [microphone, setMicrophone] = useState<MediaRecorder | null>();
  const [userMedia, setUserMedia] = useState<MediaStream | null>();
  const [talking, setTalking] = useState(false);
  const [volume, setVolume] = useState(0);
  const [utterance, setUtterance] = useState<LLMMessage>(blankUserMessage);
  const [llmRequest, setLlmRequest] = useState<LLMRequestMetadata>({
    sent: false,
    sentTimestamp: null,
    replied: false,
    replyTimestamp: null,
  });

  const sentToLlm = useCallback(() => {
    setLlmRequest({
      sent: true,
      sentTimestamp: new Date(),
      replied: false,
      replyTimestamp: null,
    });
  }, [setLlmRequest]);

  const responseFromLlm = useCallback(() => {
    setLlmRequest({ ...llmRequest, replied: true, replyTimestamp: new Date() });
  }, [llmRequest, setLlmRequest]);

  const hasLlmResponded = useCallback(() => {
    return llmRequest.replied && llmRequest.sent;
  }, [llmRequest]);

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
        audio: true,
      });

      const context = new AudioContext();
      const source = context.createMediaStreamSource(userMedia);
      const analyzer = context.createAnalyser();
      source.connect(analyzer);

      const analyzerArray = new Uint8Array(analyzer.fftSize);

      const microphone = new MediaRecorder(userMedia);
      microphone.start(500);

      microphone.onstart = () => {
        setMicOpen(true);
      };

      microphone.onstop = () => {
        setMicOpen(false);
      };

      microphone.ondataavailable = (e) => {
        analyzer.getByteTimeDomainData(analyzerArray);
        const maxDifferenceFrom127 = analyzerArray.reduce(
          (max, current) => Math.max(max, Math.abs(current - 127)),
          0
        );

        const normalisedMax = Math.round((maxDifferenceFrom127 / 128) * 150);
        setVolume(normalisedMax > 100 ? 100 : normalisedMax);

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
   * is the user currently talking
   * @todo we'll replace with VAD or something (https://github.com/JamesBrill/react-speech-recognition)
   */
  // useEffect(() => {
  //   console.log(volume);
  //   setTalking(volume > 0.2);
  // }, [volume, setTalking]);

  // /**
  //  * is the user currently talking
  //  */
  // useEffect(() => {
  //   console.log(talking);
  // }, [talking]);

  /**
   * getting a new api key
   */
  useEffect(() => {
    if (!apiKey) {
      console.log("getting a new api key");
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
      console.log("connecting to deepgram");
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
        console.log("websocket event: Open", e);
        setListening(true);

        /**
         * connection closed
         */
        connection.on(LiveTranscriptionEvents.Close, (e: any) => {
          console.log("websocket event: Close", e);
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
            console.log("websocket event: Transcript");
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

  useEffect(() => {
    console.log(utterance);
  }, [utterance]);

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
      console.log("starting keeping alive");
      keepAlive = setInterval(() => {
        // should stop spamming dev console when working on frontend in devmode
        if (connection?.getReadyState() !== LiveConnectionState.OPEN) {
          console.log("connection went away, cancelling KeepAlive");
          clearInterval(keepAlive);
        } else {
          console.log("sending a KeepAlive");
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
    console.log("messages added", numberOfMessages);
    if (messageWindow.current) {
      messageWindow.current.scrollIntoView({
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
                    <LeftBubble meta={"20ms"}>
                      <p className="cursor-blink">{utterance.content}</p>
                    </LeftBubble>
                  )}
                  <div ref={messageWindow}></div>
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
                    <div className="w-4 h-4 hidden sm:inline mr-2 relative">
                      <svg
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        stroke="currentColor"
                        className="w-4 h-4 absolute bottom-0"
                      >
                        <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                        <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
                      </svg>
                      <div
                        className={`w-4 bottom-0 overflow-hidden absolute transition-height duration-300 ease-in`}
                        style={{ height: `${volume}%` }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          className="w-4 h-4 absolute bottom-px"
                        >
                          <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                          <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
                        </svg>
                      </div>
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
