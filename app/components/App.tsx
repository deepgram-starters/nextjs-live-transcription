"use client";

import { useEffect, useRef, useState } from "react";
import {
  LiveConnectionState,
  LiveTranscriptionEvent,
  LiveTranscriptionEvents,
  useDeepgram,
} from "../context/DeepgramContextProvider";
import {
  MicrophoneEvents,
  MicrophoneState,
  useMicrophone,
} from "../context/MicrophoneContextProvider";
import Visualizer from "./Visualizer";

const App: () => JSX.Element = () => {
  const [caption, setCaption] = useState<string | undefined>(
    "Powered by Deepgram"
  );
  const {
    connection,
    connectToDeepgram,
    connectionState,
    disconnectFromDeepgram,
  } = useDeepgram();
  const {
    setupMicrophone,
    microphone,
    startMicrophone,
    microphoneState,
    stopMicrophone,
  } = useMicrophone();
  const captionTimeout = useRef<any>();
  const keepAliveInterval = useRef<any>();

  async function HandleConnect() {
    await setupMicrophone();
  }

  async function handleDisconnect() {
    alert("dicinnect");
    setCaption("Powered by Deepgram");
    await disconnectFromDeepgram();
    await stopMicrophone();
  }

  useEffect(() => {
    if (microphoneState === MicrophoneState.Ready) {
      connectToDeepgram({
        model: "nova-3",
        interim_results: true,
        smart_format: true,
        filler_words: true,
        utterance_end_ms: 3000,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [microphoneState]);

  useEffect(() => {
    if (!microphone) return;
    if (!connection) return;

    const onData = (e: BlobEvent) => {
      // iOS SAFARI FIX:
      // Prevent packetZero from being sent. If sent at size 0, the connection will close.
      if (e.data.size > 0) {
        connection?.send(e.data);
      }
    };

    const onTranscript = (data: LiveTranscriptionEvent) => {
      const { is_final: isFinal, speech_final: speechFinal } = data;
      let thisCaption = data.channel.alternatives[0].transcript;

      console.log("thisCaption", thisCaption);
      if (thisCaption !== "") {
        console.log('thisCaption !== ""', thisCaption);
        setCaption(thisCaption);
      }

      if (isFinal && speechFinal) {
        clearTimeout(captionTimeout.current);
        captionTimeout.current = setTimeout(() => {
          setCaption(undefined);
          clearTimeout(captionTimeout.current);
        }, 3000);
      }
    };

    if (connectionState === LiveConnectionState.OPEN) {
      connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);

      startMicrophone();
    }

    return () => {
      // prettier-ignore
      connection.removeListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.removeEventListener(MicrophoneEvents.DataAvailable, onData);
      clearTimeout(captionTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionState]);

  useEffect(() => {
    if (!connection) return;

    if (
      microphoneState !== MicrophoneState.Open &&
      connectionState === LiveConnectionState.OPEN
    ) {
      connection.keepAlive();

      keepAliveInterval.current = setInterval(() => {
        connection.keepAlive();
      }, 10000);
    } else {
      clearInterval(keepAliveInterval.current);
    }

    return () => {
      clearInterval(keepAliveInterval.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [microphoneState, connectionState]);

  return (
    <>
      <div className="flex h-[100vh] items-center justify-center">
        <div className="">
          {microphone && <Visualizer microphone={microphone} />}
          <div className="absolute bottom-[8rem]  inset-x-0 max-w-4xl mx-auto text-center">
            {caption && <span className="bg-black/70 p-8">{caption}</span>}
          </div>
        </div>
        <div className="">
          {microphoneState !== MicrophoneState.Open ? (
            <button
              onClick={HandleConnect}
              className="bg-green-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-green-700 transition-all"
            >
              Connect
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              className="bg-red-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-red-700 transition-all"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default App;
