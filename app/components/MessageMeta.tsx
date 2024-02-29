import { Message, useChat } from "ai/react";
import { usePlayQueue } from "../context/PlayQueue";

const MessageMeta = ({ message }: { message: Message }) => {
  const { playQueue } = usePlayQueue();
  // const { messages } = useChat({
  //   id: "aura",
  // });

  const foundAudio = playQueue.findLast((item) => item.id === message.id);

  if (message.id === "welcome") return;

  if (foundAudio?.latency)
    return (
      <span className="text-xs text-zinc-400">
        Latency [TTS]{" "}
        <span className="font-semibold">{foundAudio?.latency}ms</span>
      </span>
    );
};

export { MessageMeta };
