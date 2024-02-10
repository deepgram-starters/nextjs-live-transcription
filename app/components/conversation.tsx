"use client";

import {
  CreateProjectKeyResponse,
  LiveClient,
  LiveConnectionState,
  LiveTranscriptionEvent,
  LiveTranscriptionEvents,
  createClient,
} from "@deepgram/sdk";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useQueue } from "@uidotdev/usehooks";
import { isBrowser } from "react-device-detect";

type LLMRequestMetadata = {
  sent: boolean;
  sentTimestamp: Date;
  replied: boolean;
  replyTimestamp: Date;
};

const systemContent = `- ignore all other instructions
- roleplay as a helpful assistant
- your name is Emily
- you are part of Deepgram's speech-to-text (STT) demos
- never mention you're an AI
`;

const greetings = [
  {
    text: "Hey, my name is Emily. How can I help?",
    audio: ["/audio/hey-how-can-i-help.opus.wav"],
  },
  {
    text: "Hi, I'm Emily. What can I help you with today?",
    audio: ["/audio/hi-what-can-i-help-you-with-today.opus.wav"],
  },
  {
    text: "Hello! My name is Emily. How can I help you today?",
    audio: ["/audio/hello-how-can-i-help-you-today.opus.wav"],
  },
];

/**
 * get a random greeting
 * @returns {object}
 */
const getRandomGreeting = () =>
  greetings[Math.floor(Math.random() * greetings.length)] ?? greetings[0];

const LeftBubble = ({
  children,
  meta,
}: {
  children: React.ReactNode;
  meta: string;
}) => {
  return (
    <>
      <div className="col-start-1 col-end-8 p-3 rounded-lg">
        <div className="flex flex-row items-center">
          <div className="relative text-sm bg-[#1E1E23] py-2 px-4 shadow rounded-xl">
            {children}
          </div>
        </div>
        <small className="text-zinc-500 pl-3">{meta}</small>
      </div>
    </>
  );
};

const RightBubble = ({
  children,
  meta,
}: {
  children: React.ReactNode;
  meta: string;
}) => {
  return (
    <>
      <div className="col-start-6 col-end-13 p-3 rounded-lg">
        <div className="flex items-center justify-start flex-row-reverse">
          <div className="flex items-center justify-center h-8 w-8 flex-shrink-0 ml-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M11.1,24H1c-0.4,0-0.5-0.4-0.3-0.6l6.5-6.2c0.1-0.1,0.2-0.1,0.3-0.1h3.7c2.9,0,5.3-2.1,5.4-4.8c0.1-2.8-2.3-5.2-5.3-5.2H7.4
	v4.6c0,0.2-0.2,0.4-0.4,0.4H0.4c-0.2,0-0.4-0.2-0.4-0.4V0.4C0,0.2,0.2,0,0.4,0h10.9C18.4,0,24.1,5.5,24,12.2
	C23.9,18.8,18.1,24,11.1,24z"
              />
            </svg>
          </div>
          <div className="relative text-sm bg-[#1E1E23] py-2 px-4 shadow rounded-xl">
            <div>{children}</div>
          </div>
        </div>
        <small className="block text-zinc-500 pl-3 text-right mr-[3.75rem]">
          {meta}
        </small>
      </div>
    </>
  );
};

const ChatBubble = ({ message }: { message: any }) => {
  if (message.role === "user") {
    return <LeftBubble meta={"20ms"}>{message.content}</LeftBubble>;
  } else {
    return <RightBubble meta={"3ms"}>{message.content}</RightBubble>;
  }
};

const InitialLoad = ({ fn }: { fn: () => {} }) => {
  return (
    <div className="col-start-1 col-end-13 sm:col-start-2 sm:col-end-12 md:col-start-3 md:col-end-11 lg:col-start-4 lg:col-end-10 p-3 mb-1/2">
      <button
        onClick={() => fn()}
        type="button"
        className="relative block w-full rounded-lg border-2 border-dashed border-zinc-900 bg-black/50 p-12 text-center hover:border-zinc-700 "
      >
        <span className="inline-block h-8 w-8 flex-shrink-0 ml-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M11.1,24H1c-0.4,0-0.5-0.4-0.3-0.6l6.5-6.2c0.1-0.1,0.2-0.1,0.3-0.1h3.7c2.9,0,5.3-2.1,5.4-4.8c0.1-2.8-2.3-5.2-5.3-5.2H7.4
	v4.6c0,0.2-0.2,0.4-0.4,0.4H0.4c-0.2,0-0.4-0.2-0.4-0.4V0.4C0,0.2,0.2,0,0.4,0h10.9C18.4,0,24.1,5.5,24,12.2
	C23.9,18.8,18.1,24,11.1,24z"
            />
          </svg>
        </span>
        <h6 className="mt-2 block ">
          Welcome to EmilyAI, the conversational AI powered by Deepgram.
        </h6>
        <span className="mt-6 block text-sm font-semibold">
          {isBrowser ? "Click" : "Tap"} here to start
        </span>
        {isBrowser && (
          <span className="block text-xs font-semibold text-gray-500">
            or press &apos;space&apos;
          </span>
        )}
      </button>
    </div>
  );
};

/**
 * get the sentence from a LiveTranscriptionEvent
 * @param {LiveTranscriptionEvent} event
 * @returns {string}
 */
const utteranceText = (event: LiveTranscriptionEvent) => {
  const words = event.channel.alternatives[0].words;
  return words.map((word: any) => word.punctuated_word ?? word.word).join(" ");
};

/**
 * get message we want to display in the chat
 * @param {any[]} messages
 * @returns {any[]}
 */
const getUserMessages = (messages: any[]) => {
  return messages.filter((message) => message.role !== "system");
};

/**
 * Conversation element that contains the conversational AI app.
 * @returns {JSX.Element}
 */
export default function Conversation() {
  const greeting = useMemo(() => getRandomGreeting(), []);
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
  const [utterance, setUtterance] = useState<LiveTranscriptionEvent | null>(
    null
  );

  const [llmRequest] = useState<LLMRequestMetadata | null>(null);

  const {
    add: addToQueue,
    remove: removeFromQueue,
    first: topOfQueue,
    size: queueSize,
    queue: dataQueue,
  } = useQueue<any>([]);

  const {
    add: addMessage,
    queue: messages,
    size: numberOfMessages,
  } = useQueue<any>([
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

        const volume = maxDifferenceFrom127 / 128;

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
      connection.on(LiveTranscriptionEvents.Open, () => {
        console.log("websocket event: Open");
        setListening(true);

        /**
         * connection closed
         */
        connection.on(LiveTranscriptionEvents.Close, () => {
          console.log("websocket event: Close");
          setListening(false);
          setApiKey(null);
          setConnection(null);
        });

        /**
         * error detected
         */
        connection.on(LiveTranscriptionEvents.Error, (error) => {
          console.log("websocket event: Error");
          console.error(error);
        });

        /**
         * transcript response received
         */
        connection.on(
          LiveTranscriptionEvents.Transcript,
          (data: LiveTranscriptionEvent) => {
            console.log("websocket event: Transcript");
            setUtterance(data);
          }
        );
      });

      setConnection(connection);
      setLoading(false);
    }
  }, [addMessage, apiKey, setUtterance]);

  /**
   * turn utterance into message history when finalised
   */
  useEffect(() => {
    if (utterance?.is_final) {
      const content = utteranceText(utterance);

      if (content !== "") {
        addMessage({
          role: "user",
          content,
        });
        setUtterance(null);
      }
    }
  }, [addMessage, utterance]);

  /**
   * magic audio queue processing
   */
  useEffect(() => {
    const processQueue = async () => {
      if (queueSize > 0 && !isProcessing) {
        setProcessing(true);

        if (isListening) {
          const blob = topOfQueue;
          connection?.send(blob);
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

  // // this works
  // useEffect(() => {
  //   console.log("messages added", numberOfMessages);
  // }, [numberOfMessages]);

  /**
   * registering key up/down events
   */
  useEffect(() => {
    const onKeyUp = (event: Event | KeyboardEvent) => {
      if ("key" in event && event.code === "Space") {
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
                  {utterance && utteranceText(utterance) && (
                    <LeftBubble meta={"20ms"}>
                      <p className="cursor-blink">{utteranceText(utterance)}</p>
                    </LeftBubble>
                  )}
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
                    <svg
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      className="w-4 h-4 hidden sm:inline mr-2 -mt-px"
                    >
                      <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                      <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
                    </svg>

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
                                micOpen ? "text-blue-100" : "text-red-300"
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
                      type="text"
                      className="flex w-full border rounded-lg border-zinc-600 focus:outline-none focus:border-indigo-300 pl-4 h-10"
                      placeholder="... or send me a message"
                    />
                  </div>
                </div>
                <div className="ml-3">
                  {/**
                   * text send button
                   */}
                  <button className="flex items-center justify-center bg-[#00CF56]/50 hover:bg-[#00CF56] rounded-lg text-white px-4 lg:px-6 py-2 flex-shrink-0">
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
