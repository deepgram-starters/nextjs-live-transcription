import { Message, useChat } from "ai/react";
import { usePlayQueue } from "../context/PlayQueue";
import { useState } from "react";
import { CaretIcon } from "./icons/CaretIcon";

const MessageMeta = ({
  message,
  className = "",
}: {
  message: Message;
  className?: string;
}) => {
  const { playQueue } = usePlayQueue();
  const [breakdown, setBreakdown] = useState(false);

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
    const foundAudio = playQueue.findLast((item) => item.id === message.id);

    if (foundAudio?.latency)
      return (
        <div className={`flex gap-x-2.5 text-xs text-[#BBBBBF] ${className}`}>
          <span>Total latency: {(foundAudio?.latency / 1000).toFixed(1)}s</span>
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

          {message.id !== "welcome" && (
            <span className={breakdown ? "inline" : "hidden"}>
              LLM: {(foundAudio?.latency / 1000).toFixed(1)}s
            </span>
          )}

          <span className={breakdown ? "inline" : "hidden"}>
            Text-to-speech: {(foundAudio?.latency / 1000).toFixed(1)}s
          </span>

          <span className={breakdown ? "inline" : "hidden"}>
            Network: {(foundAudio?.latency / 1000).toFixed(1)}s
          </span>
        </div>
      );
  }
};

export { MessageMeta };
