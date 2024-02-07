"use client";

import {
  CreateProjectKeyResponse,
  LiveClient,
  LiveConnectionState,
  LiveTranscriptionEvents,
  createClient,
} from "@deepgram/sdk";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useQueue } from "@uidotdev/usehooks";
import { isBrowser } from "react-device-detect";

// import Dg from "./dg.svg";
// import Recording from "./recording.svg";
// import Image from "next/image";

const systemContent = `You are a helpful assistant. Your name is Aurora. NEVER
mention that you're an AI. Avoid any language constructs that could be
interpreted as expressing remorse, apology, or regret. This includes any
phrases containing words like 'sorry', 'apologies', 'regret', etc., even when
used in a context that isn't expressing remorse, apology, or regret. If events
or information are beyond your scope or knowledge cutoff date in April 2023,
provide a response stating 'I don't know' without elaborating on why the
information is unavailable. Refrain from disclaimers about you not being a
professional or expert. Keep responses unique and free of repetition. Never
suggest seeking information from elsewhere. Always focus on the key points in
my questions to determine my intent. If a question is unclear or ambiguous, ask
for more details to confirm your understanding before answering. Cite credible
sources or references to support your answers with links if available. If a
mistake is made in a previous response, recognize and correct it. Try to keep
answers as short as possible, with brevity in mind.`;

const LeftBubble = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="col-start-1 col-end-8 p-3 rounded-lg">
        <div className="flex flex-row items-center">
          <div className="relative text-sm bg-zinc-800 py-2 px-4 shadow rounded-xl">
            <div>{children}</div>
          </div>
        </div>
      </div>
    </>
  );
};

const RightBubble = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="col-start-6 col-end-13 p-3 rounded-lg">
        <div className="flex items-center justify-start flex-row-reverse">
          <div className="relative text-sm bg-[#7800ED]/30 py-2 px-4 shadow rounded-xl">
            <div>{children}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default function Conversation() {
  const started = useMemo(() => new Date(), []);
  const keepAlive = useRef(null);

  const [apiKey, setApiKey] = useState<CreateProjectKeyResponse | null>();
  const [connection, setConnection] = useState<LiveClient | null>();
  const [isListening, setListening] = useState(false);
  const [isLoadingKey, setLoadingKey] = useState(true);
  const [isLoading, setLoading] = useState(true);
  const [isProcessing, setProcessing] = useState(false);
  const [micOpen, setMicOpen] = useState(false);
  const [microphone, setMicrophone] = useState<MediaRecorder | null>();
  const [userMedia, setUserMedia] = useState<MediaStream | null>();
  const [caption, setCaption] = useState<string | null>();

  const {
    add: addToQueue,
    remove: removeFromQueue,
    first: topOfQueue,
    size: queueSize,
    queue: dataQueue,
  } = useQueue<any>([]);

  const { add: addMessage, queue: messages } = useQueue<any>([
    { role: "system", name: "Aurora", content: systemContent },
  ]);

  const openMic = useCallback(async () => {
    const userMedia = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

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
  }, [addToQueue]);

  const closeMic = useCallback(async () => {
    setUserMedia(null);
    setMicrophone(null);

    if (microphone) {
      microphone.stop();
    }
  }, [microphone]);

  const toggleMicrophone = useCallback(async () => {
    if (microphone && userMedia) {
      setUserMedia(null);
      setMicrophone(null);

      microphone.stop();
    } else {
      const userMedia = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

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
  }, [addToQueue, microphone, userMedia]);

  const timer = (started: any) => {
    return Math.floor((Date.now() - started) / 1000) + "s";
  };

  useEffect(() => {
    if (!apiKey) {
      console.log("getting a new api key", timer(started));
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
  }, [apiKey, started]);

  useEffect(() => {
    if (apiKey && "key" in apiKey) {
      console.log("connecting to deepgram", timer(started));
      const deepgram = createClient(apiKey?.key ?? "");
      const connection = deepgram.listen.live({
        model: "nova",
        interim_results: true,
        smart_format: true,
      });

      connection.on(LiveTranscriptionEvents.Open, () => {
        console.log("connection established", timer(started));
        setListening(true);

        connection.on(LiveTranscriptionEvents.Close, () => {
          console.log("connection closed", timer(started));
          setListening(false);
          setApiKey(null);
          setConnection(null);
        });

        connection.on(LiveTranscriptionEvents.Transcript, (data) => {
          const words = data.channel.alternatives[0].words;
          const caption = words
            .map((word: any) => word.punctuated_word ?? word.word)
            .join(" ");

          if (caption !== "") {
            setCaption(caption);
          }
        });
      });

      setConnection(connection);
      setLoading(false);
    }
  }, [apiKey, started]);

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

  useEffect(() => {
    let keepAlive: any;
    if (connection && isListening && !micOpen) {
      console.log("starting keeping alive", timer(started));
      keepAlive = setInterval(() => {
        // should stop spamming dev console when working on frontend in devmode
        if (connection?.getReadyState() !== LiveConnectionState.OPEN) {
          console.log(
            "connection went away, stopping KeepAlive",
            timer(started)
          );
          clearInterval(keepAlive);
        } else {
          console.log("sending a KeepAlive", timer(started));
          connection.keepAlive();
        }
      }, 10000);
    } else {
      console.log("not keeping alive", timer(started));
      clearInterval(keepAlive);
    }

    // prevent duplicate timeouts
    return () => {
      clearInterval(keepAlive);
    };
  }, [connection, isListening, micOpen, started]);

  useEffect(() => {
    const onKeyDown = (event: Event | KeyboardEvent) => {
      if ("key" in event && event.code === "Space") {
        if (!micOpen) {
          openMic();
        }
      }
    };

    const onKeyUp = (event: Event | KeyboardEvent) => {
      if ("key" in event && event.code === "Space") {
        if (micOpen) {
          closeMic();
        }
      }
    };

    if (isListening) {
      document.addEventListener("keydown", onKeyDown);
      document.addEventListener("keyup", onKeyUp);
    }

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, [isListening, closeMic, micOpen, openMic]);

  if (isLoadingKey) {
    return (
      <span className="w-full text-center">Loading temporary API key...</span>
    );
  }

  if (isLoading) {
    return <span className="w-full text-center">Loading the app...</span>;
  }

  return (
    <>
      <div className="flex h-full antialiased text-white/90">
        <div className="flex flex-row h-full w-full overflow-x-hidden">
          <div className="flex flex-col flex-auto h-full">
            <div className="flex flex-col justify-between h-full pt-4">
              <div className="flex flex-col h-full justify-end overflow-hidden mb-4">
                <div className="grid grid-cols-12 overflow-x-auto gap-y-2">
                  <LeftBubble>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Vestibulum rhoncus in nisl sit amet sollicitudin. Quisque
                    odio nisi, blandit id consequat sed, sodales a mauris.
                  </LeftBubble>
                  <RightBubble>
                    Pellentesque at ante turpis. Aliquam vitae blandit nibh, non
                    egestas nibh. Maecenas eleifend nisl tortor, vel lobortis
                    nibh ornare a.
                    <ul>
                      <li>Test</li>
                      <li>Test</li>
                      <li>Test</li>
                      <li>Test</li>
                    </ul>
                  </RightBubble>
                  <LeftBubble>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Vestibulum rhoncus in nisl sit amet sollicitudin. Quisque
                    odio nisi, blandit id consequat sed, sodales a mauris.
                  </LeftBubble>
                  <LeftBubble>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Vestibulum rhoncus in nisl sit amet sollicitudin. Quisque
                    odio nisi, blandit id consequat sed, sodales a mauris.
                  </LeftBubble>
                  <LeftBubble>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Vestibulum rhoncus in nisl sit amet sollicitudin. Quisque
                    odio nisi, blandit id consequat sed, sodales a mauris.
                  </LeftBubble>
                  <LeftBubble>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Vestibulum rhoncus in nisl sit amet sollicitudin. Quisque
                    odio nisi, blandit id consequat sed, sodales a mauris.
                  </LeftBubble>
                  <LeftBubble>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Vestibulum rhoncus in nisl sit amet sollicitudin. Quisque
                    odio nisi, blandit id consequat sed, sodales a mauris.
                  </LeftBubble>
                  {(micOpen || caption) && (
                    <div className="col-start-1 col-end-8 py-3 rounded-lg">
                      {caption && <LeftBubble>{caption}</LeftBubble>}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-row items-center h-16 rounded-xl bg-zinc-900 w-full px-3 text-sm sm:text-base">
                <div className="mr-3">
                  <button
                    onMouseDown={() => openMic()}
                    onMouseUp={() => closeMic()}
                    onTouchStart={() => openMic()}
                    onTouchEnd={() => closeMic()}
                    className={`flex items-center justify-center rounded-lg text-black hover:text-white px-4 lg:px-6 py-2 flex-shrink-0 ${
                      micOpen ? "bg-red-500" : "bg-white hover:bg-[#00CF56]/50"
                    }`}
                  >
                    <svg
                      viewBox="0 0 13 17"
                      className="h-4 w-4 mr-4 hidden sm:inline"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#clip0_1220_50)">
                        <path
                          d="M6.5 11.5C4.8125 11.5 3.5 10.1562 3.5 8.5V3.5C3.5 1.84375 4.8125 0.5 6.5 0.5C8.15625 0.5 9.5 1.84375 9.5 3.5V8.5C9.5 10.1875 8.15625 11.5 6.5 11.5ZM11.25 6.5C11.6562 6.5 12 6.84375 12 7.25V8.5C12 11.2812 9.90625 13.5938 7.25 13.9688V15H8.5C9.0625 15 9.5 15.5 9.46875 16.0625C9.46875 16.3125 9.25 16.5 9 16.5H4C3.71875 16.5 3.5 16.3125 3.5 16.0625C3.46875 15.5 3.90625 15 4.5 15H5.75V13.9062C2.96875 13.5312 1 11.0312 1 8.25V7.25C1 6.84375 1.3125 6.5 1.75 6.5C2.15625 6.5 2.5 6.84375 2.5 7.25V8.34375C2.5 10.4375 4.15625 12.375 6.21875 12.5C8.5625 12.6562 10.5 10.8125 10.5 8.5V7.25C10.5 6.84375 10.8125 6.5 11.25 6.5Z"
                          className="fill-current"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_1220_50">
                          <rect
                            width="12"
                            height="16"
                            transform="translate(0.5 0.5)"
                          />
                        </clipPath>
                      </defs>
                    </svg>
                    <span>
                      Hold to speak{" "}
                      {isBrowser && (
                        <span className="hidden xl:inline-block text-sm font-bold opacity-40 pl-2">
                          or hold &apos;space&apos;
                        </span>
                      )}
                    </span>
                  </button>
                </div>
                <div className="flex-grow">
                  <div className="relative w-full">
                    <input
                      type="text"
                      className="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10"
                      placeholder="... or send me a message"
                    />
                  </div>
                </div>
                <div className="ml-3">
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
