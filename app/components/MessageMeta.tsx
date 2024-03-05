import { Message } from "ai/react";
import { usePlayQueue } from "../context/PlayQueue";
import { useState } from "react";
import { CaretIcon } from "./icons/CaretIcon";
import { useMessageData } from "../context/MessageMetadata";
import { Tooltip } from "@nextui-org/react";
import { BoltIcon } from "./icons/BoltIcon";

const TTFB = () => (
  <Tooltip
    color={"primary"}
    content="Time to first byte (TTFB) measures just how fast a website or service starts to send data."
  >
    <span className="underline decoration-wavy">TTFB</span>
  </Tooltip>
);

const MessageMeta = ({
  message,
  className = "",
}: {
  message: Message;
  className?: string;
}) => {
  const { playQueue } = usePlayQueue();
  const { messageData } = useMessageData();
  const [breakdown, setBreakdown] = useState(false);

  const foundData = messageData.findLast((item) => item.id === message.id);
  const foundAudio = playQueue.findLast((item) => item.id === message.id);

  if (message.role === "user") {
    return (
      <div
        className={`flex flex-row-reverse gap-x-2.5 text-xs text-[#BBBBBF] ${className}`}
      >
        <span>STT latency: 0.4s</span>
      </div>
    );
  }

  if (message.role === "assistant") {
    if (foundData?.end && foundData?.start && foundAudio) {
      const llmTotal = foundData.end - foundData.start;
      const ttsTtfb = foundAudio.latency;
      const ttsTotal = foundAudio.networkLatency;

      return (
        <>
          <div
            className={`flex gap-x-2.5 text-xs text-[#BBBBBF] ${className} flex-wrap`}
          >
            <span>
              <BoltIcon />
              Total latency: {((llmTotal + ttsTotal) / 1000).toFixed(1)}s
            </span>

            <button
              className="font-semibold hover:text-[#fbfbff]"
              onClick={() => setBreakdown(!breakdown)}
            >
              Breakdown{" "}
              <CaretIcon
                className={`transition-transform duration-150 ease-in-out ${
                  breakdown && "rotate-180"
                }`}
              />
            </button>

            <span className={breakdown ? "inline" : "hidden"}>
              LLM total: {(llmTotal / 1000).toFixed(1)}s
            </span>

            <span className={breakdown ? "inline" : "hidden"}>
              TTS <TTFB />: {(ttsTtfb / 1000).toFixed(1)}s
            </span>

            <span className={breakdown ? "inline" : "hidden"}>
              TTS total: {(ttsTotal / 1000).toFixed(1)}s
            </span>
          </div>
        </>
      );
    } else if (foundAudio) {
      const ttsTtfb = foundAudio.latency;
      const ttsTotal = foundAudio.networkLatency;

      return (
        <>
          <div className={`flex gap-x-2.5 text-xs text-[#BBBBBF] ${className}`}>
            <span>
              <BoltIcon />
              TTS latency: {(ttsTotal / 1000).toFixed(1)}s
            </span>

            <button
              className="font-semibold hover:text-[#fbfbff]"
              onClick={() => setBreakdown(!breakdown)}
            >
              Breakdown{" "}
              <CaretIcon
                className={`transition-transform duration-150 ease-in-out ${
                  breakdown && "rotate-180"
                }`}
              />
            </button>

            <span className={breakdown ? "inline" : "hidden"}>
              TTS <TTFB />: {(ttsTtfb / 1000).toFixed(1)}s
            </span>

            <span className={breakdown ? "inline" : "hidden"}>
              Network: {((ttsTotal - ttsTtfb) / 1000).toFixed(1)}s
            </span>
          </div>
        </>
      );
    } else if (foundData?.response && foundData?.start && foundData?.end) {
      const llmTtfb = foundData.response - foundData.start;
      const llmTotal = foundData.end - foundData.start;

      return (
        <>
          <div className={`flex gap-x-2.5 text-xs text-[#BBBBBF] ${className}`}>
            <span>
              <BoltIcon /> LLM latency: {(llmTotal / 1000).toFixed(1)}s
            </span>
            <button
              className="font-semibold hover:text-[#fbfbff]"
              onClick={() => setBreakdown(!breakdown)}
            >
              Breakdown{" "}
              <CaretIcon
                className={`transition-transform duration-150 ease-in-out ${
                  breakdown && "rotate-180"
                }`}
              />
            </button>
            <span className={breakdown ? "inline" : "hidden"}>
              LLM <TTFB />: {(llmTotal / 1000).toFixed(1)}s
            </span>

            <span className={breakdown ? "inline" : "hidden"}>
              Network: {((llmTotal - llmTtfb) / 1000).toFixed(1)}s
            </span>
          </div>
        </>
      );
    }
  }
};

export { MessageMeta };
