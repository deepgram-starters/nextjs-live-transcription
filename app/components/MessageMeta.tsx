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

  if (message.role === "assistant") {
    const foundAudio = playQueue.findLast((item) => item.id === message.id);

    if (foundAudio?.latency)
      return (
        <div className={`flex gap-x-2.5 text-xs text-zinc-500 ${className}`}>
          <span>Total latency: {(foundAudio?.latency / 1000).toFixed(1)}s</span>
          <button
            className="font-semibold"
            onClick={() => setBreakdown(!breakdown)}
          >
            Breakdown{" "}
            <CaretIcon
              className={`transition-transform duration-150 ease-in-out ${
                breakdown && "rotate-180"
              }`}
            />
          </button>

          <span
            className={`overflow-hidden whitespace-nowrap w-0 transition-width duration-500 ease-in-out ${
              breakdown && "w-fit"
            }`}
          >
            LLM: {(foundAudio?.latency / 1000).toFixed(1)}s
          </span>

          <span
            className={`overflow-hidden whitespace-nowrap w-0 transition-width duration-500 ease-in-out ${
              breakdown && "w-fit"
            }`}
          >
            Text-to-speech: {(foundAudio?.latency / 1000).toFixed(1)}s
          </span>

          <span
            className={`overflow-hidden whitespace-nowrap w-0 transition-width duration-500 ease-in-out ${
              breakdown && "w-fit"
            }`}
          >
            Network: {(foundAudio?.latency / 1000).toFixed(1)}s
          </span>
        </div>
      );
  }
};

export { MessageMeta };
